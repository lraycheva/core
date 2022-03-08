import GoldenLayout from "@glue42/golden-layout";

export interface CreateWorkspaceTabsOptions {
    domNode: HTMLElement;
    workspaceId: string;
    title: string;
    isPinned: boolean;
    icon: string;
    isSelected: boolean;
    showSaveButton: boolean;
    showCloseButton: boolean;
    layoutName: string;
}

interface BasePayloadOptions {
    domNode: HTMLElement;
    resizePopup: (size: any) => void;
    hidePopup: () => void;
    callback?: () => void;
    frameId: string;
}

export interface AddApplicationPopupOptions extends BasePayloadOptions {
    boxId: string;
    workspaceId: string;
    parentType?: string;
}

export interface SaveWorkspacePopupOptions extends BasePayloadOptions {
    workspaceId: string;
    buildMode: boolean;
}

// tslint:disable-next-line: no-empty-interface
export interface AddWorkspacePopupOptions extends BasePayloadOptions {
}

export interface ComponentFactory {
    createLogo?: (options: { domNode: HTMLElement; frameId: string }) => void;
    createWorkspaceTabs?: (options: CreateWorkspaceTabsOptions) => void;
    createAddWorkspace?: (options: { domNode: HTMLElement; frameId: string }) => void;
    createSystemButtons?: (options: { domNode: HTMLElement; frameId: string }) => void;
    createWorkspaceContents?: (options: { domNode: HTMLElement; containerElement?: HTMLElement; workspaceId: string }) => void;

    createBeforeGroupTabs?: (options: { domNode: HTMLElement; groupId: string; workspaceId: string; elementId: string }) => void;
    createAfterGroupTabs?: (options: { domNode: HTMLElement; groupId: string; workspaceId: string; elementId: string }) => void;

    createAddApplicationPopup?: (options: AddApplicationPopupOptions) => void;
    createSaveWorkspacePopup?: (options: SaveWorkspacePopupOptions) => void;
    createAddWorkspacePopup?: (options: AddWorkspacePopupOptions) => void;

    hideSystemPopups?: (cb: () => void) => void;

    updateWorkspaceTabs?: (options: Partial<CreateWorkspaceTabsOptions>) => void;

    /**
     * @options the elementId is a workspaceId
     */
    removeWorkspaceTabs?: (options: { elementId: string }) => void;
    removeWorkspaceContents?: (options: { workspaceId: string }) => void;
    /**
     * @options the elementId is a workspaceId
     */
    removeBeforeGroupTabs?: (options: { elementId: string }) => void;
    /**
     * @options the elementId is a workspaceId
     */
    removeAfterGroupTabs?: (options: { elementId: string }) => void;

    externalPopupApplications?: {
        addApplication?: string;
        saveWorkspace?: string;
        addWorkspace?: string;
    };

    createId?: () => string;
}

export interface DecoratedComponentFactory {
    createLogo?: (options: { domNode: HTMLElement }) => void;
    createAddWorkspace?: (options: { domNode: HTMLElement }) => void;
    createSystemButtons?: (options: { domNode: HTMLElement }) => void;
    createWorkspaceContents?: (options: { domNode: HTMLElement; workspaceId: string }) => void;

    createGroupIcons?: (options: { domNode: HTMLElement; groupId: string; workspaceId: string }) => void;
    createGroupTabControls?: (options: { domNode: HTMLElement; groupId: string; workspaceId: string }) => void;

    createAddApplicationPopup?: (options: AddApplicationPopupOptions) => void;
    createSaveWorkspacePopup?: (options: SaveWorkspacePopupOptions) => void;
    createAddWorkspacePopup?: (options: AddWorkspacePopupOptions) => void;

    hideSystemPopups?: (cb: () => void) => void;

    removeWorkspaceContents?: (options: { workspaceId: string }) => void;
    removeGroupIcons?: (options: { groupId: string }) => void;
    removeGroupTabControls?: (options: { groupId: string }) => void;
    removeGroupHeaderButtons?: (options: { groupId: string }) => void;

    createId?: () => string;
}

export interface WorkspaceTabsBuilderOptions {
    element: HTMLElement;
    contentItem: GoldenLayout.Component;
}

export interface DecoratedFactory extends ComponentFactory {
    createWorkspaceTabsOptions?: (options: WorkspaceTabsBuilderOptions) => CreateWorkspaceTabsOptions;
}

export interface VisibilityState {
    logo: [{ domNode: HTMLElement; frameId: string }];
    workspaceTabs: { [id: string]: CreateWorkspaceTabsOptions };
    addWorkspace: [{ domNode: HTMLElement; frameId: string }];
    systemButtons: [{ domNode: HTMLElement; frameId: string }];
    workspaceContents: Array<[{ domNode: HTMLElement; workspaceId: string }]>;
    beforeGroupTabs: Array<[{ domNode: HTMLElement; workspaceId: string; groupId: string; elementId: string }]>;
    afterGroupTabs: Array<[{ domNode: HTMLElement; workspaceId: string; groupId: string; elementId: string }]>;
}