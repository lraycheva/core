import GoldenLayout from "@glue42/golden-layout";
import { Workspace, FrameLayoutConfig, WorkspaceItem, WorkspaceLayout, AnyItem, SavedConfigWithData, WorkspaceOptionsWithLayoutName, SaveWorkspaceConfig, RowItem, ColumnItem, WindowItem, GroupItem, WindowLayoutState, LayoutRequestConfig } from "./types/internal";
import storage from "./storage";
import scReader from "./config/startupReader";
import { LayoutStateResolver } from "./state/resolver";
import { Glue42Web } from "@glue42/web";
import { getAllWindowsFromConfig, getAllWindowsFromItem, getWorkspaceContextName } from "./utils";
import { WorkspacesConfigurationFactory } from "./config/factory";
import { ConfigConverter } from "./config/converter";
import { ConstraintsValidator } from "./config/constraintsValidator";
import { PlaceholderAppName } from "./utils/constants";
import { PlatformCommunicator } from "./interop/platformCommunicator";
import store from "./state/store";

declare const window: Window & { glue42core: { workspacesFrameCache?: boolean } };

export class LayoutsManager {
    private _initialWorkspaceConfig: GoldenLayout.Config[];
    private readonly _layoutsType = "Workspace";
    private readonly _layoutComponentType = "Workspace";

    constructor(
        private readonly resolver: LayoutStateResolver,
        private readonly _glue: Glue42Web.API,
        private readonly _configFactory: WorkspacesConfigurationFactory,
        private readonly _configConverter: ConfigConverter,
        private readonly _constraintsValidator: ConstraintsValidator,
        private readonly _platformCommunicator: PlatformCommunicator) { }

    public async getInitialConfig(): Promise<FrameLayoutConfig> {
        // Preset initial config
        if (this._initialWorkspaceConfig) {
            return this._configFactory.generateInitialConfig(this._initialWorkspaceConfig);
        }

        const startupConfig = scReader.config;

        // From workspace names
        if (startupConfig.workspaceNames && startupConfig.workspaceNames.length) {
            const workspaceLayoutData = await Promise.all(startupConfig.workspaceNames.map(async (name) => {
                return (await this.getWorkspaceByName(name));
            }));
            const workspaceConfigs = workspaceLayoutData.map(wld => {
                wld.config.workspacesOptions = wld.config.workspacesOptions || {};
                wld.config.workspacesOptions.context = wld.layoutData.context;

                return wld.config;
            });

            const validConfigs = workspaceConfigs.filter((wc) => wc);

            if (validConfigs.length) {
                validConfigs.forEach((c, i) => {
                    c.id = this._configFactory.getId();
                    c.workspacesOptions = c.workspacesOptions || {};
                    if (startupConfig.context && c.workspacesOptions.context) {
                        c.workspacesOptions.context = Object.assign(c.workspacesOptions.context, startupConfig.context);
                    }
                    else if (startupConfig.context) {
                        c.workspacesOptions.context = startupConfig.context;
                    }

                    (c.workspacesOptions as WorkspaceOptionsWithLayoutName).layoutName = startupConfig.workspaceNames[i];
                });
                return this._configFactory.generateInitialConfig(validConfigs);
            }
        } else if (!scReader.config?.build) { // Last session
            const workspaceConfigs = this.getLastSession();
            if (workspaceConfigs && workspaceConfigs.length) {
                workspaceConfigs.forEach((wc: GoldenLayout.Config) => {
                    if (wc) {
                        wc.id = this._configFactory.getId();
                    }
                });

                return this._configFactory.generateInitialConfig(workspaceConfigs);
            }
        }
        // Default
        return this._configFactory.getDefaultFrameConfig(this.resolver.getWorkspaceTitles());
    }

    public getLastSession() {
        const workspacesFrameCache = window.glue42core?.workspacesFrameCache ?? true;
        if (!workspacesFrameCache) {
            return;
        }
        const workspacesFrame = storage.get(storage.LAST_SESSION_KEY) || [];
        const rendererFriendlyFrameConfig = workspacesFrame.map((wc: WorkspaceItem) => {
            this.addWorkspaceIds(wc);
            // this.addWindowIds(wc);
            return this._configConverter.convertToRendererConfig(wc);
        });
        return rendererFriendlyFrameConfig;
    }

    public async getSavedWorkspaceNames(): Promise<string[]> {
        const allLayouts = await this._glue.layouts.getAll(this._layoutsType);
        const workspaceLayouts = allLayouts.filter((l) => l.type === this._layoutsType);
        return workspaceLayouts.map((wl) => wl.name);
    }

    public async export() {
        return this._glue.layouts.export(this._layoutsType);
    }

    public async getWorkspaceByName(name: string): Promise<SavedConfigWithData> {
        const savedWorkspaceLayout = await this._glue.layouts.get(name, this._layoutsType);
        const savedWorkspace: WorkspaceItem = savedWorkspaceLayout.components[0].state as WorkspaceItem;
        this._constraintsValidator.fixWorkspace(savedWorkspace);
        const rendererFriendlyConfig = this._configConverter.convertToRendererConfig(savedWorkspace);

        // If a positionIndex is present in the layout it should be ignored
        delete (rendererFriendlyConfig as GoldenLayout.Config)?.workspacesOptions?.positionIndex;

        this.addWorkspaceIds(rendererFriendlyConfig);

        return {
            config: rendererFriendlyConfig as GoldenLayout.Config,
            layoutData: {
                metadata: savedWorkspaceLayout.metadata,
                name,
                context: (savedWorkspace as WorkspaceItem & { context: object }).context ?? {}
            }
        };
    }

    public async delete(name: string): Promise<void> {
        await this._glue.layouts.remove(this._layoutsType, name);
    }

    public async save(options: SaveWorkspaceConfig): Promise<WorkspaceLayout> {
        const { workspace, name, saveContext } = options;
        if (!workspace.layout && !workspace.hibernateConfig) {
            throw new Error("An empty layout cannot be saved");
        }
        (workspace.layout?.config || workspace.hibernateConfig).workspacesOptions.name = name;
        const workspaceConfig = await this.saveWorkspaceCore(workspace, name);
        // Its superfluous to add the title to the layout since its never used
        if (workspaceConfig.config.title) {
            delete workspaceConfig.config.title;
        }

        let workspaceContext = undefined;

        if (saveContext) {
            try {
                workspaceContext = await this.getWorkspaceContext(workspace.id);
            } catch (error) {
                // can throw an exception when reloading
            }
        }

        const layoutToImport = {
            name,
            type: this._layoutsType as "Workspace",
            metadata: options.metadata,
            components: [{
                type: this._layoutComponentType as "Workspace",
                state: {
                    children: workspaceConfig.children,
                    config: workspaceConfig.config,
                    context: workspaceContext ?? {}
                }
            }]
        };

        try {
            await this._glue.layouts.import([layoutToImport as Glue42Web.Layouts.Layout], "merge");
        } catch (error) {
            console.error(error);
            throw error;
        }

        return layoutToImport;
    }

    public async generateLayout(name: string, workspace: Workspace) {
        if (!workspace.layout) {
            throw new Error("An empty layout cannot be generated");
        }
        workspace.layout.config.workspacesOptions.name = name;
        const workspaceConfig = await this.saveWorkspaceCore(workspace, name);

        // Its superfluous to add the title to the layout since its never used
        if (workspaceConfig.config.title) {
            delete workspaceConfig.config.title;
        }

        return {
            name,
            type: this._layoutsType as "Workspace",
            metadata: {},
            components: [{
                type: this._layoutComponentType as "Workspace", state: {
                    children: workspaceConfig.children,
                    config: workspaceConfig.config,
                    context: {}
                }
            }]
        };
    }

    public async saveWorkspacesFrame(workspaces: Workspace[]) {
        const workspacesFrameCache = window.glue42core?.workspacesFrameCache ?? true;
        if (!workspacesFrameCache) {
            return;
        }
        const configPromises = workspaces.map((w) => {
            return this.saveWorkspaceCoreSync(w);
        });
        const configs = await Promise.all(configPromises);
        storage.set(storage.LAST_SESSION_KEY, configs);
    }

    public setInitialWorkspaceConfig(config: GoldenLayout.Config[]): void {
        this._initialWorkspaceConfig = config;
    }

    public async applyWindowLayoutState(config: WorkspaceItem) {
        const applyWindowLayoutStateRecursive = async (configToTraverse: RowItem | ColumnItem | WindowItem | GroupItem) => {
            if (configToTraverse.type === "window") {
                if (configToTraverse.config.appName === PlaceholderAppName || !configToTraverse.config.appName) {
                    configToTraverse.config.appName = PlaceholderAppName;
                    const windowLayoutState = await this.getWindowLayoutState(configToTraverse.config.windowId);
                    configToTraverse.config.noAppWindowState = windowLayoutState;
                } else {
                    //TODO apply the saved context
                }
            } else {
                configToTraverse.children.forEach((i) => applyWindowLayoutStateRecursive(i));
            }
        };
        await Promise.all(config.children.map(async (ic) => {
            await applyWindowLayoutStateRecursive(ic);
        }));
    }

    public removeWorkspaceItemIds(configToClean: WorkspaceItem) {
        const removeRecursive = (config: AnyItem) => {
            if ("id" in config) {
                delete config.id;
            }

            if (config.type !== "window") {
                config.children?.forEach((i) => removeRecursive(i));
            }
        };

        removeRecursive(configToClean);
    }

    public removeWorkspaceWindowWindowIds(configToClean: WorkspaceItem) {
        const removeRecursive = (config: AnyItem) => {
            if (config.type === "window") {
                delete config.config.windowId;
            }

            if (config.type !== "window") {
                config.children?.forEach((i) => removeRecursive(i));
            }
        };

        removeRecursive(configToClean);
    }

    public async applySavedContexts(workspace: WorkspaceItem, layoutRequestConfig: LayoutRequestConfig) {
        const windows = getAllWindowsFromItem(workspace);
        const validWindowIds = windows.map(w => w.config.windowId).filter(w => w);
        const windowIdsToContext = await this._platformCommunicator.requestOnLayoutSaveContexts({
            layoutName: layoutRequestConfig.layoutName,
            layoutType: layoutRequestConfig.layoutType,
            context: layoutRequestConfig.context,
            windowIds: validWindowIds
        });

        windowIdsToContext.forEach(({ windowId, windowContext }) => {
            const windowToReceiveContext = windows.find((w) => w.config.windowId === windowId);

            windowToReceiveContext.config.context = windowContext;
        });
    }

    private async saveWorkspaceCore(workspace: Workspace, layoutName: string): Promise<WorkspaceItem> {
        if (!workspace.layout && !workspace.hibernateConfig) {
            return undefined;
        }

        const workspaceConfig = this.resolver.getWorkspaceConfig(workspace.id);
        if (workspaceConfig.workspacesOptions.layoutName) {
            delete workspaceConfig.workspacesOptions.layoutName;
        }

        const workspaceItem = this._configConverter.convertToAPIConfig(workspaceConfig) as WorkspaceItem;
        this.removeWorkspaceItemIds(workspaceItem);
        await this.applyWindowLayoutState(workspaceItem);
        await this.applySavedContexts(workspaceItem, { layoutName, layoutType: "Workspace" });

        // The excess properties should be cleaned
        this.windowSummariesToWindowLayout(workspaceItem);
        this.workspaceSummaryToWorkspaceLayout(workspaceItem);

        return workspaceItem;
    }

    private saveWorkspaceCoreSync(workspace: Workspace): WorkspaceItem {
        if (!workspace.layout && !workspace.hibernateConfig) {
            return undefined;
        }
        const workspaceConfig = this.resolver.getWorkspaceConfig(workspace.id);

        const workspaceItem = this._configConverter.convertToAPIConfig(workspaceConfig) as WorkspaceItem;
        this.removeWorkspaceItemIds(workspaceItem);

        // The excess properties should be cleaned
        this.windowSummariesToWindowLayout(workspaceItem);
        this.workspaceSummaryToWorkspaceLayout(workspaceItem);

        return workspaceItem;
    }

    private windowSummariesToWindowLayout(workspaceItem: WorkspaceItem) {
        const transform = (item: AnyItem) => {
            if (item.type === "window") {
                delete item.config.isLoaded;
                delete item.config.windowId;
                delete item.config.workspaceId;
                delete item.config.frameId;
                delete item.config.positionIndex;

                if (item.config.appName) {
                    delete item.config.url;
                }

                return;
            }

            item.children.forEach(c => transform(c));
        };

        transform(workspaceItem);
    }

    private workspaceSummaryToWorkspaceLayout(workspaceItem: WorkspaceItem) {
        if (workspaceItem?.config) {
            delete workspaceItem.config.frameId;
            delete workspaceItem.config.positionIndex;
        }
    }

    private addWorkspaceIds(configToPopulate: GoldenLayout.Config | GoldenLayout.ItemConfig) {
        if (!configToPopulate) {
            return;
        }
        const addRecursive = (config: GoldenLayout.ItemConfig | GoldenLayout.Config) => {
            config.id = this._configFactory.getId();

            if (config.type && config.type === "component") {
                config.componentName = `app${config.id}`;
            }

            if (config.type !== "component" && config.content) {
                config.content.forEach((i) => addRecursive(i));
            }
        };

        addRecursive(configToPopulate);
    }

    private removeWorkspaceIds(configToClean: GoldenLayout.Config) {
        const removeRecursive = (config: GoldenLayout.Config | GoldenLayout.ItemConfig) => {
            if ("id" in config) {
                delete config.id;
            }

            if (config?.type === "component") {
                config.componentName = "placeHolderId";
                config.title = "placeHolderId";
            }

            if (config.type !== "component" && config.content) {
                config.content.forEach((i) => removeRecursive(i));
            }
        };

        removeRecursive(configToClean);
    }

    private async getWorkspaceContext(id: string) {
        return await this._glue.contexts.get(getWorkspaceContextName(id));
    }

    private async getWindowLayoutState(windowId: string): Promise<WindowLayoutState> {
        const window = this._glue.windows.findById(windowId);

        return {
            bounds: {},
            createArgs: {
                url: await window.getURL()
            }
        }
    }
}
