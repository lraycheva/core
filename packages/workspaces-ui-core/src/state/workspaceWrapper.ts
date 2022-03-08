/* eslint-disable @typescript-eslint/no-explicit-any */
import GoldenLayout, { WorkspacesOptions } from "@glue42/golden-layout";
import store from "./store";
import { LayoutStateResolver } from "./resolver";
import { getElementBounds, idAsString } from "../utils";
import { Bounds, Workspace, WorkspaceOptionsWithLayoutName, WorkspaceSummary } from "../types/internal";
import { DefaultMaxSize, DefaultMinSize, EmptyVisibleWindowName } from "../utils/constants";
import { WorkspaceWindowWrapper } from "./windowWrapper";
import { WorkspaceContainerWrapper } from "./containerWrapper";
import componentStateMonitor from "../componentStateMonitor";

export class WorkspaceWrapper {
    constructor(
        private readonly stateResolver: LayoutStateResolver,
        private readonly workspace: Workspace,
        private readonly workspaceContentItem: GoldenLayout.Component,
        private readonly frameId: string) {
    }

    public get id(): string {
        return this.workspace.id;
    }

    public get title(): string {
        const component = this.workspaceContentItem;
        return component.tab?.title || (component.config as any).workspacesOptions.title || component.config.title || component.config.componentName;
    }

    public get lastFocusedWindowId(): string {
        if (!this.workspace?.layout) {
            return;
        }

        const focusedWindowId = (this.workspace.layout.config?.workspacesOptions as any)?.focusedWindowId;

        if (!focusedWindowId) {
            const focusedGroupId = (this.workspace.layout.config?.workspacesOptions as any)?.focusedGroupId;
            const groupContentItem = this.workspace.layout.root.getItemsById(focusedGroupId)[0];

            if (groupContentItem && groupContentItem.type !== "component" && groupContentItem.contentItems.length) {
                const focusedItemInGroup = groupContentItem.contentItems[groupContentItem.contentItems.length - 1].config.id;
                return idAsString(focusedItemInGroup);
            }

        } else {
            return focusedWindowId;
        }

        return this.workspace.windows.filter((w) => this.stateResolver.isWindowSelected(idAsString(w.id)))[0]?.id;
    }

    public get isSelected(): boolean {
        const workspaceLayoutStack = store.workspaceLayout.root.getItemsById(this.workspace.id)[0].parent;
        const activeContentItem = workspaceLayoutStack.getActiveContentItem();

        return idAsString(activeContentItem.config.id) === this.workspace.id;
    }

    public get isHibernated(): boolean {
        return typeof this.workspace.hibernateConfig !== "undefined" && typeof this.workspace.hibernateConfig !== null;
    }

    public get tabIndex(): number {
        const workspaceLayoutStack = store.workspaceLayout.root.getItemsById(this.workspace.id)[0].parent;
        const workspaceIndex = ((workspaceLayoutStack as any).header as GoldenLayout.Header)
            .tabs
            .findIndex((t: GoldenLayout.Tab) => idAsString(t.contentItem.config.id) === this.workspace.id);

        return workspaceIndex;
    }

    public get isPinned(): boolean {
        return !!this.workspaceContentItem.tab.isPinned;
    }

    public get config(): any {
        const workspace = this.workspace;

        if (this.isHibernated) {
            workspace.hibernateConfig.workspacesOptions.isPinned = this.isPinned;
            return workspace.hibernateConfig;
        }

        const glConfig = workspace.layout ? workspace.layout.toConfig() : { workspacesOptions: {}, content: [], id: workspace.id };
        glConfig.workspacesOptions.frameId = this.frameId;
        glConfig.workspacesOptions.positionIndex = this.tabIndex;
        glConfig.workspacesOptions.isHibernated = this.isHibernated;
        glConfig.workspacesOptions.isSelected = this.isSelected;
        glConfig.workspacesOptions.allowDrop = this.allowDrop;
        glConfig.workspacesOptions.allowDropLeft = this.allowDropLeft;
        glConfig.workspacesOptions.allowDropTop = this.allowDropTop;
        glConfig.workspacesOptions.allowDropRight = this.allowDropRight;
        glConfig.workspacesOptions.allowDropBottom = this.allowDropBottom;
        glConfig.workspacesOptions.allowExtract = this.allowExtract;
        glConfig.workspacesOptions.showCloseButton = this.showCloseButton;
        glConfig.workspacesOptions.showSaveButton = this.showSaveButton;
        glConfig.workspacesOptions.allowSplitters = this.allowSplitters;
        glConfig.workspacesOptions.showAddWindowButtons = this.showAddWindowButtons;
        glConfig.workspacesOptions.showEjectButtons = this.showEjectButtons;
        glConfig.workspacesOptions.showWindowCloseButtons = this.showWindowCloseButtons;
        glConfig.workspacesOptions.minWidth = Math.max(this.minWidth, DefaultMinSize);
        glConfig.workspacesOptions.maxWidth = Math.min(this.maxWidth, DefaultMaxSize);
        glConfig.workspacesOptions.minHeight = Math.max(this.minHeight, DefaultMinSize);
        glConfig.workspacesOptions.maxHeight = Math.min(this.maxHeight, DefaultMaxSize);
        glConfig.workspacesOptions.widthInPx = this.bounds.width;
        glConfig.workspacesOptions.heightInPx = this.bounds.height;
        glConfig.workspacesOptions.isPinned = this.isPinned;
        glConfig.workspacesOptions.icon = this.icon;

        glConfig.workspacesOptions.lastActive = workspace.lastActive;

        if (!glConfig.workspacesOptions.title) {
            glConfig.workspacesOptions.title = this.title;
        }

        glConfig.workspacesOptions.name = glConfig.workspacesOptions.name || glConfig.workspacesOptions.title;

        this.transformComponentsToWindowSummary(glConfig);
        this.transformParentsToContainerSummary(glConfig);
        return glConfig;
    }

    public get summary(): WorkspaceSummary {
        const config = this.config;
        const workspaceIndex = this.tabIndex;

        const summaryConfig = {
            frameId: this.frameId,
            positionIndex: workspaceIndex,
            title: this.title,
            name: config.workspacesOptions.name || this.title,
            layoutName: config.workspacesOptions.layoutName,
            isHibernated: this.isHibernated,
            isSelected: this.isSelected,
            lastActive: this.workspace.lastActive,
            allowDrop: this.allowDrop,
            allowDropLeft: this.allowDropLeft,
            allowDropTop: this.allowDropTop,
            allowDropRight: this.allowDropRight,
            allowDropBottom: this.allowDropBottom,
            allowExtract: this.allowExtract,
            allowSplitters: this.allowSplitters,
            showCloseButton: this.showCloseButton,
            showSaveButton: this.showSaveButton,
            showAddWindowButtons: this.showAddWindowButtons,
            showEjectButtons: this.showEjectButtons,
            showWindowCloseButtons: this.showWindowCloseButtons,
            minWidth: this.minWidth,
            maxWidth: this.maxWidth,
            minHeight: this.minHeight,
            maxHeight: this.maxHeight,
            widthInPx: this.bounds.width,
            heightInPx: this.bounds.height,
            isPinned: this.isPinned,
            icon: this.icon
        };

        if ((config.workspacesOptions as WorkspaceOptionsWithLayoutName).layoutName) {
            summaryConfig.layoutName = (config.workspacesOptions as WorkspaceOptionsWithLayoutName).layoutName;
        }

        return {
            config: summaryConfig,
            id: this.workspace.id
        };
    }

    public get allowDrop(): boolean {
        return this.getPropertyFromConfig("allowDrop") ?? true;
    }

    public set allowDrop(value: boolean) {
        if (this.workspace?.layout) {
            this.workspace.layout.config.workspacesOptions.allowDrop = value;
        }
        this.workspaceContentItem.config.workspacesConfig.allowDrop = value;

        this.populateChildrenAllowDrop(value);
    }

    public get allowDropLeft(): boolean {
        return this.getPropertyFromConfig("allowDropLeft") ?? true;
    }

    public set allowDropLeft(value: boolean) {
        if (this.workspace?.layout) {
            this.workspace.layout.config.workspacesOptions.allowDropLeft = value;
        }

        this.workspaceContentItem.config.workspacesConfig.allowDropLeft = value;
    }

    public get allowDropTop(): boolean {
        return this.getPropertyFromConfig("allowDropTop") ?? true;
    }

    public set allowDropTop(value: boolean) {
        if (this.workspace?.layout) {
            this.workspace.layout.config.workspacesOptions.allowDropTop = value;
        }
        this.workspaceContentItem.config.workspacesConfig.allowDropTop = value;
    }

    public get allowDropRight(): boolean {
        return this.getPropertyFromConfig("allowDropRight") ?? true;
    }

    public set allowDropRight(value: boolean) {
        if (this.workspace?.layout) {
            this.workspace.layout.config.workspacesOptions.allowDropRight = value;
        }

        this.workspaceContentItem.config.workspacesConfig.allowDropRight = value;
    }

    public get allowDropBottom(): boolean {
        return this.getPropertyFromConfig("allowDropBottom") ?? true;
    }

    public set allowDropBottom(value: boolean) {
        if (this.workspace?.layout) {
            this.workspace.layout.config.workspacesOptions.allowDropBottom = value;
        }
        this.workspaceContentItem.config.workspacesConfig.allowDropBottom = value;
    }

    public get allowExtract(): boolean {
        return this.getPropertyFromConfig("allowExtract") ?? true;
    }

    public set allowExtract(value: boolean) {
        if (this.workspace?.layout) {
            this.workspace.layout.config.workspacesOptions.allowExtract = value;
        }
        this.workspaceContentItem.config.workspacesConfig.allowExtract = value;

        this.populateChildrenAllowExtract(value);
    }

    public get allowSplitters(): boolean {
        return this.getPropertyFromConfig("allowSplitters") ?? true;
    }

    public set allowSplitters(value: boolean) {
        if (this.workspace?.layout) {
            this.workspace.layout.config.workspacesOptions.allowSplitters = value;
        }
        this.workspaceContentItem.config.workspacesConfig.allowSplitters = value;
        this.populateChildrenAllowSplitters(value);
    }

    public get showSaveButton(): boolean {
        return this.getPropertyFromConfig("showSaveButton") ?? true;
    }

    public set showSaveButton(value: boolean) {
        if (this.workspace?.layout) {
            this.workspace.layout.config.workspacesOptions.showSaveButton = value;
        }
        this.workspaceContentItem.config.workspacesConfig.showSaveButton = value;

        componentStateMonitor.decoratedFactory.updateWorkspaceTabs({ workspaceId: this.workspace.id, showSaveButton: value });
    }

    public get showCloseButton(): boolean {
        return this.getPropertyFromConfig("showCloseButton") ?? true;
    }

    public set showCloseButton(value: boolean) {
        if (this.workspace?.layout) {
            this.workspace.layout.config.workspacesOptions.showCloseButton = value;
        }
        this.workspaceContentItem.config.workspacesConfig.showCloseButton = value;

        componentStateMonitor.decoratedFactory.updateWorkspaceTabs({ workspaceId: this.workspace.id, showCloseButton: value });
    }

    public get showAddWindowButtons(): boolean {
        return this.getPropertyFromConfig("showAddWindowButtons") ?? true;
    }

    public set showAddWindowButtons(value: boolean) {
        if (this.workspace?.layout) {
            this.workspace.layout.config.workspacesOptions.showAddWindowButtons = value;
        }
        this.workspaceContentItem.config.workspacesConfig.showAddWindowButtons = value;

        this.populateChildrenShowAddWindowButtons(value);
    }

    public get showEjectButtons(): boolean {
        return this.getPropertyFromConfig("showEjectButtons") ?? true;
    }

    public set showEjectButtons(value: boolean) {
        if (this.workspace?.layout) {
            this.workspace.layout.config.workspacesOptions.showEjectButtons = value;
        }
        this.workspaceContentItem.config.workspacesConfig.showEjectButtons = value;

        this.populateChildrenShowEjectButtons(value);
    }

    public get showWindowCloseButtons(): boolean {
        return this.getPropertyFromConfig("showWindowCloseButtons") ?? true;
    }

    public set showWindowCloseButtons(value: boolean) {
        if (this.workspace?.layout) {
            this.workspace.layout.config.workspacesOptions.showWindowCloseButtons = value;
        }
        this.workspaceContentItem.config.workspacesConfig.showWindowCloseButtons = value;

        this.populateChildrenShowWindowCloseButtons(value);
    }

    public get minWidth(): number {
        if (this.workspace?.layout) {
            return this.workspace.layout.root.getMinWidth() ?? DefaultMinSize;
        }

        return DefaultMinSize;
    }

    public get maxWidth(): number {
        if (this.workspace?.layout) {
            return this.workspace.layout.root.getMaxWidth() ?? DefaultMaxSize;
        }

        return DefaultMaxSize;
    }

    public get minHeight(): number {
        if (this.workspace?.layout) {
            return this.workspace.layout.root.getMinHeight() ?? DefaultMinSize;
        }

        return DefaultMinSize;
    }

    public get maxHeight(): number {
        if (this.workspace?.layout) {
            return this.workspace.layout.root.getMaxHeight() ?? DefaultMaxSize;
        }

        return DefaultMaxSize;
    }

    public get bounds(): Bounds {
        if (!this.isSelected) {
            return getElementBounds((this.workspaceContentItem.element as any)[0].parentElement);
        } else {
            return getElementBounds(this.workspaceContentItem.element);
        }
    }

    public get hasMaximizedItems(): boolean {
        const layout = this.workspace.layout;

        if (!layout) {
            return false;
        }

        const items = layout.root.getItemsById("__glMaximised");

        return items.length > 0;
    }

    public get icon(): string {
        return this.getPropertyFromConfig<string>("icon");
    }

    public set icon(value: string) {
        if (this.workspace?.layout) {
            this.workspace.layout.config.workspacesOptions.icon = value;
        }
        this.workspaceContentItem.config.workspacesConfig.icon = value;
        componentStateMonitor.decoratedFactory.updateWorkspaceTabs({ workspaceId: this.workspace.id, icon: value });
    }

    private transformComponentsToWindowSummary(glConfig: GoldenLayout.ItemConfig): void {
        if (glConfig.type === "component" && glConfig.componentName === EmptyVisibleWindowName) {
            return;
        }
        if (glConfig.type === "component") {
            const summary = this.stateResolver.getWindowSummarySync(glConfig.id);

            glConfig.workspacesConfig = glConfig.workspacesConfig || {};
            glConfig.workspacesConfig = { ...glConfig.workspacesConfig, ...summary.config };
            return;
        }
        glConfig.content?.map((c: any) => this.transformComponentsToWindowSummary(c));
    }

    private transformParentsToContainerSummary(glConfig: any): void {
        if (glConfig.type === "component") {
            return;
        }

        if (glConfig.type === "stack" || glConfig.type === "row" || glConfig.type === "column") {
            const summary = this.stateResolver.getContainerSummary(glConfig.id);

            glConfig.workspacesConfig = glConfig.workspacesConfig || {};
            glConfig.workspacesConfig = { ...glConfig.workspacesConfig, ...summary.config };
        }

        glConfig.content?.map((c: any) => this.transformParentsToContainerSummary(c));
    }

    private populateChildrenAllowDrop(value?: boolean): void {
        const { layout } = this.workspace;

        if (!layout) {
            return;
        }

        const populateRecursive = (item: GoldenLayout.ContentItem): void => {
            if (item.type === "component") {
                return;
            }

            const containerWrapper = new WorkspaceContainerWrapper(this.stateResolver, item, this.frameId, this.workspace.id);
            containerWrapper.allowDrop = value;

            item.contentItems.forEach((ci) => {
                populateRecursive(ci);
            });
        };

        layout.root.contentItems.forEach((ci) => {
            populateRecursive(ci);
        });
    }

    private populateChildrenAllowSplitters(value?: boolean): void {
        const { layout } = this.workspace;

        if (!layout) {
            return;
        }

        const populateRecursive = (item: GoldenLayout.ContentItem): void => {
            if (item.type === "component" || item.type === "stack") {
                return;
            }

            const containerWrapper = new WorkspaceContainerWrapper(this.stateResolver, item, this.frameId, this.workspace.id);
            containerWrapper.allowSplitters = value;

            item.contentItems.forEach((ci) => {
                populateRecursive(ci);
            });
        };

        layout.root.contentItems.forEach((ci) => {
            populateRecursive(ci);
        });
    }

    private populateChildrenAllowExtract(value?: boolean): void {
        const { layout } = this.workspace;

        if (!layout) {
            return;
        }

        const populateRecursive = (item: GoldenLayout.ContentItem): void => {
            if (item.type === "component") {
                const windowWrapper = new WorkspaceWindowWrapper(this.stateResolver, item, this.frameId);

                windowWrapper.allowExtract = value;
                return;
            }

            if (item.type === "stack") {
                const containerWrapper = new WorkspaceContainerWrapper(this.stateResolver, item, this.frameId, this.workspace.id);
                containerWrapper.allowExtract = value;
            }

            item.contentItems.forEach((ci) => {
                populateRecursive(ci);
            });
        };

        layout.root.contentItems.forEach((ci) => {
            populateRecursive(ci);
        });
    }

    private populateChildrenShowAddWindowButtons(value?: boolean): void {
        const { layout } = this.workspace;

        if (!layout) {
            return;
        }

        const populateRecursive = (item: GoldenLayout.ContentItem): void => {
            if (item.type === "component") {
                return;
            }

            if (item.type === "stack") {
                const containerWrapper = new WorkspaceContainerWrapper(this.stateResolver, item, this.frameId, this.workspace.id);
                containerWrapper.showAddWindowButton = value;
            }

            item.contentItems.forEach((ci) => {
                populateRecursive(ci);
            });
        };

        layout.root.contentItems.forEach((ci) => {
            populateRecursive(ci);
        });
    }

    private populateChildrenShowEjectButtons(value?: boolean): void {
        const { layout } = this.workspace;

        if (!layout) {
            return;
        }

        const populateRecursive = (item: GoldenLayout.ContentItem): void => {
            if (item.type === "component") {
                return;
            }

            if (item.type === "stack") {
                const containerWrapper = new WorkspaceContainerWrapper(this.stateResolver, item, this.frameId, this.workspace.id);
                containerWrapper.showEjectButton = value;
            }

            item.contentItems.forEach((ci) => {
                populateRecursive(ci);
            });
        };

        layout.root.contentItems.forEach((ci) => {
            populateRecursive(ci);
        });
    }

    private populateChildrenShowWindowCloseButtons(value?: boolean): void {
        const { layout } = this.workspace;

        if (!layout) {
            return;
        }

        const populateRecursive = (item: GoldenLayout.ContentItem): void => {
            if (item.type === "component") {
                const windowWrapper = new WorkspaceWindowWrapper(this.stateResolver, item, this.frameId);

                windowWrapper.showCloseButton = value;
                return;
            }

            item.contentItems.forEach((ci) => {
                populateRecursive(ci);
            });
        };

        layout.root.contentItems.forEach((ci) => {
            populateRecursive(ci);
        });
    }

    private getPropertyFromConfig<T>(propertyName: keyof WorkspacesOptions): T { // TODO fix typings
        let result;
        if (this.workspace?.layout) {
            result = this.workspace.layout.config.workspacesOptions[propertyName];
        } else {
            result = (this.workspaceContentItem.config.workspacesConfig as WorkspacesOptions)[propertyName];
        }

        return result as T;
    }
}
