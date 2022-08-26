/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkspaceItem, ParentItem, AnyItem, APIWIndowSettings } from "../types/internal";
import GoldenLayout, { StackConfig, ColumnConfig, RowConfig, Config } from "@glue42/golden-layout";
import { EmptyVisibleWindowName } from "../utils/constants";
import { idAsString } from "../utils";
import { WorkspacesConfigurationFactory } from "./factory";

export class ConfigConverter {
    constructor(private readonly _configFactory: WorkspacesConfigurationFactory) { }
    public convertToRendererConfig(config: ParentItem): Config | RowConfig | ColumnConfig | StackConfig {
        if (!config) {
            return undefined;
        }
        return this.convertToRendererConfigCore(config, undefined);
    }

    public convertToAPIConfig(apiConfig: Config | RowConfig | ColumnConfig | StackConfig): ParentItem {
        if (!apiConfig) {
            return undefined;
        }
        return this.convertToApiConfigCore(apiConfig);
    }

    private convertToRendererConfigCore(config: AnyItem, parent: ParentItem) {
        let glConfig: any = {
            type: config.type,
            content: [],
            workspacesOptions: config.config || {},
        };

        if (config.type === "workspace" || !config.type) {
            glConfig = this.applyDefaultRendererConfig({
                content: [],
                workspacesOptions: config.config as any,
            });
        }

        if (config.type === "workspace" || !config.type) {
            const workspaceItem: WorkspaceItem = config as WorkspaceItem;
            const { children } = workspaceItem;

            if (children.length > 1 && children.every((c) => c.type === "column")) {
                glConfig.content.push(this.wrap(children.map((c) => this.convertToRendererConfigCore(c, workspaceItem)), "row"));
            } else if (children.length > 1 && children.every((c) => c.type === "row")) {
                glConfig.content.push(this.wrap(children.map((c) => this.convertToRendererConfigCore(c, workspaceItem)), "column"));
            } else {
                glConfig.content.push(...children.map((c) => this.convertToRendererConfigCore(c, workspaceItem)));
            }

            return glConfig;
        } else if (config.type === "column" || config.type === "row") {
            (glConfig as ColumnConfig).content.push(...config.children.map((c) => this.convertToRendererConfigCore(c, config)));
            if (glConfig.content.length === 0) {
                glConfig.content.push(this.getGroupWithEmptyVisibleWindow());
            }

            if (!glConfig.workspacesConfig) {
                glConfig.workspacesConfig = {};
            }

            glConfig.workspacesConfig.allowDrop = config.config?.allowDrop;
            glConfig.workspacesConfig.allowSplitters = config.config?.allowSplitters;
            glConfig.workspacesConfig.isPinned = config.config?.isPinned;
            glConfig.workspacesConfig.maxWidth = config.config?.maxWidth;
            glConfig.workspacesConfig.minWidth = config.config?.minWidth;
            glConfig.workspacesConfig.maxHeight = config.config?.maxHeight;
            glConfig.workspacesConfig.minHeight = config.config?.minHeight;
            glConfig.workspacesConfig.positionIndex = config.config?.positionIndex;
            glConfig.workspacesConfig.isMaximized = config.config?.isMaximized;
            glConfig.width = this.convertSizeToRendererConfigSafely(config.config?.width as any);
            glConfig.height = this.convertSizeToRendererConfigSafely(config.config?.height as any);
            glConfig.workspacesConfig.maximizationBoundary = config.config?.maximizationBoundary;

            return glConfig;
        } else if (config.type === "group") {
            glConfig.type = "stack";
            glConfig.content.push(...config.children.map((c) => this.convertToRendererConfigCore(c, config)));
            if (glConfig.content.length === 0) {
                glConfig.content.push(this._configFactory.createEmptyVisibleWindowConfig());
            }

            if (!glConfig.workspacesConfig) {
                glConfig.workspacesConfig = {};
            }

            glConfig.workspacesConfig.allowDrop = config.config?.allowDrop;
            glConfig.workspacesConfig.allowDropHeader = config.config?.allowDropHeader;
            glConfig.workspacesConfig.allowDropLeft = config.config?.allowDropLeft;
            glConfig.workspacesConfig.allowDropRight = config.config?.allowDropRight;
            glConfig.workspacesConfig.allowDropTop = config.config?.allowDropTop;
            glConfig.workspacesConfig.allowDropBottom = config.config?.allowDropBottom;
            glConfig.workspacesConfig.allowExtract = config.config?.allowExtract;
            glConfig.workspacesConfig.allowReorder = config.config?.allowReorder;
            glConfig.workspacesConfig.showMaximizeButton = config.config?.showMaximizeButton;
            glConfig.workspacesConfig.showEjectButton = config.config?.showEjectButton;
            glConfig.workspacesConfig.showAddWindowButton = config.config?.showAddWindowButton;
            glConfig.workspacesConfig.maxWidth = config.config?.maxWidth;
            glConfig.workspacesConfig.minWidth = config.config?.minWidth;
            glConfig.workspacesConfig.maxHeight = config.config?.maxHeight;
            glConfig.workspacesConfig.minHeight = config.config?.minHeight;
            glConfig.activeItemIndex = config.config?.activeTabIndex;
            glConfig.workspacesConfig.positionIndex = config.config?.positionIndex;
            glConfig.workspacesConfig.isMaximized = config.config?.isMaximized;
            glConfig.width = this.convertSizeToRendererConfigSafely(config.config?.width as any);
            glConfig.height = this.convertSizeToRendererConfigSafely(config.config?.height as any);

            return glConfig;
        } else if (config.type === "window") {
            let appName = config.config?.appName || (config as any).appName;
            const windowId = config.config?.windowId;

            if (!appName && windowId) {
                appName = this._configFactory.getAppNameFromWindowId(windowId);
            }
            const resultWindow = this._configFactory.createGDWindowConfig({
                windowId,
                id: config.id,
                appName,
                url: config.config?.url || (config as any).url,
                title: config.config?.title || (config as any).title,
                context: config.config?.context || (config as any).context,
                allowExtract: config?.config?.allowExtract ?? (config as any).allowExtract,
                allowReorder: config?.config?.allowReorder ?? (config as any).allowReorder,
                showCloseButton: config?.config?.showCloseButton ?? (config as any).showCloseButton,
                minWidth: config?.config?.minWidth ?? (config as any).minWidth,
                maxWidth: config?.config?.maxWidth ?? (config as any).maxWidth,
                minHeight: config?.config?.minHeight ?? (config as any).minHeight,
                maxHeight: config?.config?.maxHeight ?? (config as any).maxHeight,
                positionIndex: config?.config?.positionIndex ?? (config as any).positionIndex,
                isMaximized: config?.config?.isMaximized ?? (config as any).isMaximized,
                noAppWindowState: config?.config?.noAppWindowState ?? (config as any).noAppWindowState,
            });

            if (parent.type !== "group") {
                resultWindow.componentState.header = false;
                const group = this.wrap([resultWindow], "stack");
                group.width = config?.config?.width ?? (config as any).width;
                group.height = config?.config?.height ?? (config as any).height;
                return group;
            }
            return resultWindow;
        }
    }

    private convertToApiConfigCore(config: GoldenLayout.Config | GoldenLayout.ItemConfig): any {
        if (!config.type || config.type === "workspace") {
            config = config as GoldenLayout.Config;
            const children = this.flat(config.content.map((c) => this.convertToApiConfigCore(c)));
            return {
                id: idAsString(config.id),
                config: config.workspacesOptions,
                children
            };
        }

        if (config.type === "component" && config.componentName === EmptyVisibleWindowName) {
            return [];
        } else if (config.type !== "component" && config.workspacesConfig && config.workspacesConfig.wrapper) {
            const items = this.flat(config.content.map((c) => this.convertToApiConfigCore(c)));
            items.forEach((i: any) => {
                i.config.width = (config as GoldenLayout.ItemConfig).width;
                i.config.height = (config as GoldenLayout.ItemConfig).height;
            });

            return items;
        } else if (config.type === "component") {
            const wspsConfig = config.workspacesConfig as APIWIndowSettings;
            const resultWindow = this._configFactory.createApiWindow({
                id: config.id,
                isFocused: false,
                isMaximized: wspsConfig.isMaximized,
                windowId: config.componentState.windowId,
                appName: config.componentState.appName,
                url: config.componentState.url,
                frameId: wspsConfig.frameId,
                workspaceId: wspsConfig.workspaceId,
                title: wspsConfig.title,
                positionIndex: wspsConfig.positionIndex,
                allowExtract: wspsConfig.allowExtract,
                allowReorder: wspsConfig.allowReorder,
                showCloseButton: wspsConfig.showCloseButton,
                maxHeight: wspsConfig.maxHeight,
                maxWidth: wspsConfig.maxWidth,
                minHeight: wspsConfig.minHeight,
                minWidth: wspsConfig.minWidth,
                widthInPx: wspsConfig.widthInPx,
                heightInPx: wspsConfig.heightInPx
            });

            return resultWindow;
        }
        const configAsAny = config as any;
        const containerResult = {
            id: idAsString(config.id),
            type: config.type === "stack" ? "group" : config.type,
            children: this.flat(config.content.map((c) => this.convertToApiConfigCore(c))),
            config: {
                positionIndex: configAsAny.workspacesConfig?.positionIndex,
                frameId: configAsAny.workspacesConfig?.frameId,
                workspaceId: configAsAny.workspacesConfig?.workspaceId,
                activeTabIndex: configAsAny.activeItemIndex,
                width: configAsAny.width,
                height: configAsAny.height,
                allowDrop: configAsAny.workspacesConfig?.allowDrop,
                allowDropHeader: configAsAny.workspacesConfig?.allowDropHeader,
                allowDropLeft: configAsAny.workspacesConfig?.allowDropLeft,
                allowDropRight: configAsAny.workspacesConfig?.allowDropRight,
                allowDropTop: configAsAny.workspacesConfig?.allowDropTop,
                allowDropBottom: configAsAny.workspacesConfig?.allowDropBottom,
                isPinned: configAsAny.workspacesConfig?.isPinned,
                allowExtract: configAsAny.workspacesConfig?.allowExtract,
                allowReorder: configAsAny.workspacesConfig?.allowReorder,
                showMaximizeButton: configAsAny.workspacesConfig?.showMaximizeButton,
                showEjectButton: configAsAny.workspacesConfig?.showEjectButton,
                showAddWindowButton: configAsAny.workspacesConfig?.showAddWindowButton,
                allowSplitters: configAsAny.workspacesConfig?.allowSplitters,
                minWidth: configAsAny.workspacesConfig?.minWidth,
                maxWidth: configAsAny.workspacesConfig?.maxWidth,
                minHeight: configAsAny.workspacesConfig?.minHeight,
                maxHeight: configAsAny.workspacesConfig?.maxHeight,
                widthInPx: configAsAny.workspacesConfig?.widthInPx,
                heightInPx: configAsAny.workspacesConfig?.heightInPx,
                isMaximized: configAsAny.workspacesConfig?.isMaximized,
                maximizationBoundary: configAsAny.workspacesConfig?.maximizationBoundary
            }
        };

        if (containerResult.type !== "group") {
            delete containerResult.config.allowExtract;
            delete containerResult.config.allowReorder;
            delete containerResult.config.allowDropHeader;
            delete containerResult.config.allowDropLeft;
            delete containerResult.config.allowDropTop;
            delete containerResult.config.allowDropRight;
            delete containerResult.config.allowDropBottom;
            delete containerResult.config.showMaximizeButton;
            delete containerResult.config.showEjectButton;
            delete containerResult.config.showAddWindowButton;
        } else {
            delete containerResult.config.allowSplitters;
        }

        return containerResult;
    }

    private flat = <T>(arr: T[]) => arr.reduce((acc, i) => [...acc, ...(Array.isArray(i) ? i : [i])], []);

    private wrap(content: GoldenLayout.ComponentConfig[], wrapper: "column"): GoldenLayout.ColumnConfig
    private wrap(content: GoldenLayout.ComponentConfig[], wrapper: "row"): GoldenLayout.RowConfig
    private wrap(content: GoldenLayout.ComponentConfig[], wrapper: "stack"): GoldenLayout.StackConfig
    private wrap(content: GoldenLayout.ComponentConfig[], wrapper: "stack" | "row" | "column"): any {
        return {
            workspacesConfig: {
                wrapper: true,
                isMaximized: wrapper === "stack" && content.some(c => c.workspacesConfig.isMaximized)// only valid for windows placed directly in row/col
            },
            type: wrapper,
            content
        };
    }

    private applyDefaultRendererConfig(config: GoldenLayout.Config) {
        return { settings: { ...this._configFactory.getDefaultWorkspaceSettings() }, ...config };
    }

    private getGroupWithEmptyVisibleWindow(): GoldenLayout.ItemConfig {
        return this.wrap([this._configFactory.createEmptyVisibleWindowConfig()], "stack");
    }

    private convertSizeToRendererConfigSafely(size: number) {
        // If the size is positive golden layout can work with it
        // however if the size is below or equal to zero it has been set manually to an invalid value
        // so it should be discarded -> undefined width/height will be transformed to default
        return size > 0 ? size : undefined;
    }
}
