import { WindowSummary, WorkspaceSummary, ContainerSummary, Bounds, Constraints, WorkspaceSnapshot, WorkspaceItem, LayoutRequestConfig } from "../types/internal";
import store from "./store";
import GoldenLayout from "@glue42/golden-layout";
import { LayoutEventEmitter } from "../layout/eventEmitter";
import { idAsString } from "../utils";
import { IFrameController } from "../iframeController";
import { WorkspaceWindowWrapper } from "./windowWrapper";
import { WorkspaceWrapper } from "./workspaceWrapper";
import { WorkspaceContainerWrapper } from "./containerWrapper";
import { DefaultMaxSize, DefaultMinSize } from "../utils/constants";
import { ConfigConverter } from "../config/converter";
import { WorkspacesManager } from "../manager";

export class LayoutStateResolver {
    constructor(private readonly _frameId: string,
        private readonly _layoutEventEmitter: LayoutEventEmitter,
        private readonly frameController: IFrameController,
        private readonly converter: ConfigConverter) { }

    public async getWindowSummary(windowId: string | string[]): Promise<WindowSummary> {
        windowId = Array.isArray(windowId) ? windowId[0] : windowId;
        let windowContentItem = store.getWindowContentItem(windowId);
        if (!windowContentItem) {
            await this.waitForWindowContentItem(windowId);
            windowContentItem = store.getWindowContentItem(windowId);
        }
        const wrapper = new WorkspaceWindowWrapper(this, windowContentItem, this._frameId);
        return wrapper.summary;
    }

    public getWindowSummarySync(windowId: string | string[], contentItem?: GoldenLayout.Component): WindowSummary {
        windowId = Array.isArray(windowId) ? windowId[0] : windowId;
        const windowContentItem = contentItem || store.getWindowContentItem(windowId);

        const wrapper = new WorkspaceWindowWrapper(this, windowContentItem, this._frameId);
        return wrapper.summary;
    }

    public getWorkspaceConfig(workspaceId: string): GoldenLayout.Config {
        const workspace = store.getById(workspaceId);

        if (!workspace) {
            throw new Error(`Could find workspace to remove with id ${workspaceId}`);
        }
        const wrapper = new WorkspaceWrapper(this, workspace, store.getWorkspaceContentItem(workspace.id), this._frameId);

        return wrapper.config;
    }

    public async getWorkspaceSnapshot(workspaceId: string, manager: WorkspacesManager, excludeIds?: boolean) {
        const workspaceSnapshotWithoutContext = this.getWorkspaceSnapshotSync(workspaceId, manager);

        await manager.layoutsManager.applyWindowLayoutState(workspaceSnapshotWithoutContext);
        if (excludeIds) {
            manager.layoutsManager.removeWorkspaceItemIds(workspaceSnapshotWithoutContext);
            manager.layoutsManager.removeWorkspaceWindowWindowIds(workspaceSnapshotWithoutContext);
        }

        return {
            id: workspaceId,
            children: workspaceSnapshotWithoutContext.children,
            config: workspaceSnapshotWithoutContext.config,
            frameSummary: manager.getFrameSummary(this._frameId),
            context: await manager.getWorkspaceContext(workspaceSnapshotWithoutContext.id)
        };
    }

    public getAllWorkspacesLayouts(manager: WorkspacesManager, layoutRequestConfig: LayoutRequestConfig) {
        const workspaces = store.workspaceIds.map((wid) => this.getWorkspaceSnapshotSync(wid, manager));

        return Promise.all(workspaces.map(async (workspace) => {
            const workspaceId = workspace.id;
            await manager.layoutsManager.applyWindowLayoutState(workspace);
            await manager.layoutsManager.applySavedContexts(workspace, layoutRequestConfig);
            manager.layoutsManager.removeWorkspaceItemIds(workspace);
            manager.layoutsManager.removeWorkspaceWindowWindowIds(workspace);

            return {
                id: workspaceId,
                children: workspace.children,
                config: workspace.config,
                frameSummary: manager.getFrameSummary(this._frameId),
                context: await manager.getWorkspaceContext(workspaceId)
            };
        }));
    }

    public getWorkspaceSummary(workspaceId: string): WorkspaceSummary {
        const wrapper = new WorkspaceWrapper(this,
            store.getById(workspaceId),
            store.getWorkspaceContentItem(workspaceId),
            this._frameId);

        return wrapper.summary;
    }

    public isWindowMaximized(id: string | string[]): boolean {
        const placementId = idAsString(id);
        const windowContentItem = store.getWindowContentItem(placementId);
        const wrapper = new WorkspaceWindowWrapper(this, windowContentItem, this._frameId);

        return wrapper.isMaximized;
    }

    public isWindowInMaximizedContainer(id: string | string[]): boolean {
        const placementId = Array.isArray(id) ? id[0] : id;
        const windowContentItem = store.getWindowContentItem(placementId);

        const findMaximizedItem = (contentItem: GoldenLayout.ContentItem | GoldenLayout.Root): GoldenLayout.ContentItem => {
            if (!contentItem || contentItem.isRoot) {
                return;
            }

            if (contentItem.hasId("__glMaximised")) {
                return contentItem as GoldenLayout.ContentItem;
            }

            return findMaximizedItem(contentItem.parent);
        };

        return !!findMaximizedItem(windowContentItem);
    }

    public isWindowSelected(id: string | string[]): boolean {
        const placementId = idAsString(id);
        const windowContentItem = store.getWindowContentItem(placementId);
        const wrapper = new WorkspaceWindowWrapper(this, windowContentItem, this._frameId);
        return wrapper.isSelected;
    }

    public isWorkspaceSelected(id: string): boolean {
        const workspace = store.getById(id);
        const workspaceContentItem = store.getWorkspaceContentItem(id);
        const wrapper = new WorkspaceWrapper(this, workspace, workspaceContentItem, this._frameId);

        return wrapper.isSelected;
    }

    public isWorkspaceHibernated(id: string): boolean {
        const workspace = store.getById(id);
        if (!workspace) {
            throw new Error(`Could not find workspace ${id} in ${this._frameId} to check if hibernated`);
        }

        const workspaceItem = store.getWorkspaceContentItem(workspace.id);
        const wrapper = new WorkspaceWrapper(this, workspace, workspaceItem, this._frameId);

        return wrapper.isHibernated;
    }

    public getContainerSummary(containerId: string | string[]): ContainerSummary {
        containerId = idAsString(containerId);
        const contentItem = store.getContainer(containerId);
        const wrapper = new WorkspaceContainerWrapper(this, contentItem, this._frameId);

        return wrapper.summary;
    }

    public getContainerSummaryByReference(item: GoldenLayout.ContentItem, workspaceId: string): ContainerSummary {
        if (item.type === "component") {
            throw new Error(`Tried to get container summary from item ${item.type} ${item.config.id}`);
        }

        const wrapper = new WorkspaceContainerWrapper(this, item, this._frameId, workspaceId);

        return wrapper.summary;
    }

    public getContainerConfig(containerId: string | string[]): GoldenLayout.ItemConfig {
        const contentItem = store.getContainer(containerId);
        const wrapper = new WorkspaceContainerWrapper(this, contentItem, this._frameId);

        return wrapper.config;
    }

    public isWindowInWorkspace(windowId: string): boolean {
        return !!store.getWindowContentItem(windowId);
    }

    public async getFrameSnapshot(manager: WorkspacesManager, excludeIds?: boolean) {
        const allWorkspaceSnapshots = await Promise.all(store.workspaceIds.map(wid => this.getWorkspaceSnapshot(wid, manager, excludeIds)));
        const constraints = this.getFrameConstraints();
        return {
            id: this._frameId,
            config: {
                ...constraints
            },
            workspaces: allWorkspaceSnapshots
        };
    }

    public async getSnapshot(itemId: string, manager: WorkspacesManager) {
        try {
            return this.getWorkspaceConfig(itemId);
        } catch (error) {
            return this.getFrameSnapshot(manager);
        }
    }

    public getWorkspaceSnapshotSync(itemId: string, manager: WorkspacesManager): Omit<WorkspaceSnapshot, "context"> {
        const workspaceConfig = this.getWorkspaceConfig(itemId);
        const workspaceItem = this.converter.convertToAPIConfig(workspaceConfig) as WorkspaceItem;

        return {
            id: workspaceItem.id,
            children: workspaceItem.children,
            config: workspaceItem.config,
            frameSummary: manager.getFrameSummary(this._frameId),
        };
    }

    public extractWindowSummariesFromSnapshot(snapshot: GoldenLayout.Config): WindowSummary[] {
        const result: WindowSummary[] = [];
        const getAllWindows = (item: GoldenLayout.ItemConfig, parentId: string): void => {
            if (item.type === "component") {
                result.push({
                    itemId: idAsString(item.id),
                    parentId,
                    config: item.workspacesConfig as any
                });
                return;
            }

            item.content.forEach((c) => getAllWindows(c, idAsString(item.id)));
        };

        getAllWindows(snapshot as unknown as GoldenLayout.ItemConfig, undefined);

        return result;
    }

    public isWindowLoaded(id: string | string[]): boolean {
        return this.frameController.hasFrame(idAsString(id));
    }

    public getRendererWindowBounds(): Bounds {
        return {
            left: window.visualViewport.offsetLeft,
            top: window.visualViewport.offsetTop,
            width: window.visualViewport.width,
            height: window.visualViewport.height
        };
    }

    public getFrameConstraints(): Constraints {
        const workspaceWrappers = store.workspaceIds.map((wId) => {
            return new WorkspaceWrapper(this, store.getById(wId), store.getWorkspaceContentItem(wId), this._frameId);
        });

        const result = workspaceWrappers.reduce((acc, ww) => {
            const rendererBounds = this.getRendererWindowBounds();
            const horizontalExtraSpace = rendererBounds.width - ww.bounds.width;
            const verticalExtraSpace = rendererBounds.height - ww.bounds.height;
            const newMinWidth = Math.ceil(Math.max(ww.minWidth + horizontalExtraSpace, acc.minWidth));
            const newMinHeight = Math.ceil(Math.max(ww.minHeight + verticalExtraSpace, acc.minHeight));
            const newMaxWidth = Math.ceil(Math.min(ww.maxWidth + horizontalExtraSpace, acc.maxWidth));
            const newMaxHeight = Math.ceil(Math.min(ww.maxHeight + verticalExtraSpace, acc.maxHeight));
            if (newMinHeight <= newMaxHeight && newMinWidth <= newMaxWidth) {
                acc.minWidth = newMinWidth;
                acc.minHeight = newMinHeight;
                acc.maxWidth = newMaxWidth;
                acc.maxHeight = newMaxHeight;
            }

            return acc;
        }, {
            minWidth: DefaultMinSize,
            maxWidth: DefaultMaxSize,
            minHeight: DefaultMinSize,
            maxHeight: DefaultMaxSize
        });

        return result;
    }

    public getWorkspaceIcon(workspaceId: string): string {
        const wrapper = new WorkspaceWrapper(this, store.getById(workspaceId), store.getWorkspaceContentItem(workspaceId), this._frameId);

        return wrapper.icon;
    }

    public getWorkspaceTitles(): string[] {
        return store.workspaceIds.map((wid) => {
            const wrapper = new WorkspaceWrapper(this, store.getById(wid), store.getWorkspaceContentItem(wid), this._frameId);

            return wrapper.title;
        });
    }

    public getFrameBounds(): Bounds {
        return {
            top: window.screenTop,
            left: window.screenLeft,
            width: window.innerWidth,
            height: window.innerHeight
        }
    }

    private waitForWindowContentItem(windowId: string): Promise<void> {
        return new Promise<void>((res) => {
            const unsub = this._layoutEventEmitter.onContentComponentCreated((component) => {
                if (component.config.id === windowId) {
                    unsub();
                    res();
                }
            });

            const windowContentItem = store.getWindowContentItem(windowId);
            if (windowContentItem) {
                unsub();
                res();
            }
        });
    }
}
