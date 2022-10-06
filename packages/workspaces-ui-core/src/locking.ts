/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkspacesManager } from "./manager";
import { ColumnItem, GroupItem, RowItem, WindowItem, WindowSummary, WorkspaceItem } from "./types/internal";

export class WorkspacesLocker {
    constructor(private readonly manager: WorkspacesManager) { }

    public applyLockConfiguration(workspacesConfig: WorkspaceItem, snapshot: WorkspaceItem): Promise<void> {
        const traverse = async (item: WorkspaceItem | GroupItem | ColumnItem | RowItem | WindowItem, snapshotItem: WorkspaceItem | GroupItem | ColumnItem | RowItem | WindowItem): Promise<void> => {
            if (item.type === "window") {
                if (this.doesWindowContainLockProperties(item)) {
                    this.manager.lockWindow({
                        windowPlacementId: snapshotItem.id,
                        config: item.config
                    });
                }
                return;
            } else if (item.type === "group" || item.type === "row" || item.type === "column") {

                if (this.doesContainerContainLockProperties(item)) {
                    this.manager.lockContainer({
                        itemId: snapshotItem.id,
                        type: item.type,
                        config: item.config
                    });
                }
            } else {
                if (this.doesWorkspaceContainLockProperties(item)) {
                    this.manager.lockWorkspace({
                        workspaceId: snapshot.id,
                        config: item.config
                    });
                }
            }

            await Promise.all((item.children as Array<ColumnItem | RowItem | GroupItem | WindowItem>).map((i: ColumnItem | RowItem | GroupItem | WindowItem, index: number) => {
                return traverse(i, (snapshotItem as ColumnItem | RowItem | GroupItem).children[index]);
            }));
        };

        return traverse(workspacesConfig, snapshot);
    }

    public applyWindowLockConfiguration(windowSummary: WindowSummary): void {
        const item: WindowItem = {
            config: windowSummary.config,
            id: windowSummary.itemId,
            type: "window"
        };
        if (this.doesWindowContainLockProperties(item)) {
            this.manager.lockWindow({
                windowPlacementId: windowSummary.itemId,
                config: windowSummary.config
            });
        }
    }

    public applyContainerLockConfiguration(definition: RowItem | ColumnItem | GroupItem, workspace: WorkspaceItem, itemId: string): void {
        const snapshot = this.getItemFromWorkspace(workspace, itemId);
        const traverse = (item: WorkspaceItem | GroupItem | ColumnItem | RowItem | WindowItem, snapshotItem: WorkspaceItem | GroupItem | ColumnItem | RowItem | WindowItem): void => {
            if (item.type === "window") {
                if (this.doesWindowContainLockProperties(item)) {
                    this.manager.lockWindow({
                        windowPlacementId: snapshotItem.id,
                        config: item.config
                    });
                }
                return;
            } else if (item.type === "group" || item.type === "row" || item.type === "column") {
                if (this.doesContainerContainLockProperties(item)) {
                    this.manager.lockContainer({
                        itemId: snapshotItem.id,
                        type: item.type,
                        config: item.config
                    });
                }
            } else {
                if (this.doesWorkspaceContainLockProperties(item)) {
                    this.manager.lockWorkspace({
                        workspaceId: item.id,
                        config: item.config
                    });
                }
            }

            (item.children as Array<ColumnItem | RowItem | GroupItem | WindowItem>).map((i: ColumnItem | RowItem | GroupItem | WindowItem, index: number) => {
                return traverse(i, (snapshotItem as GroupItem | ColumnItem | RowItem).children[index]);
            });
        };

        return traverse(definition, snapshot);
    }

    private doesWindowContainLockProperties(window: WindowItem): boolean {
        return this.isLockPropertySet(window.config?.showCloseButton) || this.isLockPropertySet(window.config?.allowExtract) || this.isLockPropertySet(window.config?.allowReorder) ;
    }

    private doesContainerContainLockProperties(container: ColumnItem | RowItem | GroupItem): boolean {
        return this.isLockPropertySet(container.config?.allowDrop) ||
            this.isLockPropertySet(container.config?.allowDropHeader) ||
            this.isLockPropertySet(container.config?.allowDropLeft) ||
            this.isLockPropertySet(container.config?.allowDropRight) ||
            this.isLockPropertySet(container.config?.allowDropTop) ||
            this.isLockPropertySet(container.config?.allowDropBottom) ||
            this.isLockPropertySet(container.config?.allowExtract) ||
            this.isLockPropertySet(container.config?.allowReorder) ||
            this.isLockPropertySet(container.config?.showExtractButton) ||
            this.isLockPropertySet(container.config?.showMaximizeButton) ||
            this.isLockPropertySet(container.config?.showAddWindowButton) ||
            this.isLockPropertySet(container.config?.allowSplitters);
    }

    private doesWorkspaceContainLockProperties(workspace: WorkspaceItem): boolean {
        return this.isLockPropertySet(workspace.config?.allowDrop) ||
            this.isLockPropertySet(workspace.config?.allowDropLeft) ||
            this.isLockPropertySet(workspace.config?.allowDropTop) ||
            this.isLockPropertySet(workspace.config?.allowDropRight) ||
            this.isLockPropertySet(workspace.config?.allowDropBottom) ||
            this.isLockPropertySet(workspace.config?.allowExtract) ||
            this.isLockPropertySet(workspace.config?.allowWindowReorder) ||
            this.isLockPropertySet(workspace.config?.showExtractButtons) ||
            this.isLockPropertySet(workspace.config?.showWindowCloseButtons) ||
            this.isLockPropertySet(workspace.config?.showAddWindowButtons) ||
            this.isLockPropertySet(workspace.config?.showSaveButton) ||
            this.isLockPropertySet(workspace.config?.allowWorkspaceTabReorder)||
            this.isLockPropertySet(workspace.config?.showCloseButton) ||
            this.isLockPropertySet(workspace.config?.allowSplitters);
    }

    private isLockPropertySet(value: boolean): boolean {
        return typeof value === "boolean";
    }

    private getItemFromWorkspace(workspaceItem: WorkspaceItem, itemId: string): WorkspaceItem | GroupItem | ColumnItem | RowItem | WindowItem {
        const find = (item: WorkspaceItem | RowItem | ColumnItem | GroupItem | WindowItem): WorkspaceItem | RowItem | ColumnItem | GroupItem | WindowItem => {
            if (item.id === itemId) {
                return item;
            }

            if (item.type === "window") {
                return;
            }

            return (item.children as any).map((c: GroupItem | ColumnItem | RowItem | WindowItem) => find(c)).find((r: any) => r);
        };

        return find(workspaceItem);
    }
}
