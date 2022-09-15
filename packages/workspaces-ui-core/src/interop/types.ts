import { WorkspaceItem, WorkspaceSnapshot, RowItem, ColumnItem, GroupItem, WindowDefinition, LoadingStrategy, WindowItem } from "../types/internal";

//#region Platform
export interface RawWindowsLayoutDataRequestConfig {
    layoutType: "Global" | "Workspace";
    layoutName: string;
    context?: any;
    instances?: string[];
    ignoreInstances?: string[];
}

export interface GetWorkspaceWindowsOnLayoutSaveContextConfig extends RawWindowsLayoutDataRequestConfig {
    windowIds: string[];
}

export interface WorkspaceWindowOnSaveData {
    windowId: string;
    windowContext?: any;
}

export interface GetWorkspaceWindowOnLayoutSaveContextResult {
    windowsOnSaveData: WorkspaceWindowOnSaveData[];
}
//#endregion
//#region Requests

export interface IsWindowInWorkspaceRequest {
    operation: "isWindowInWorkspace";
    operationArguments: ItemSelector;
}

export interface CreateWorkspaceRequest {
    operation: "createWorkspace";
    operationArguments: CreateWorkspaceArguments;
}

export interface SetItemTitleRequest {
    operation: "setItemTitle";
    operationArguments: SetItemTitleArguments;
}

export interface AddContainerRequest {
    operation: "addContainer";
    operationArguments: AddContainerArguments;
}

export interface AddWindowRequest {
    operation: "addWindow";
    operationArguments: AddWindowArguments;
}

export interface SaveLayoutRequest {
    operation: "saveLayout";
    operationArguments: SaveLayoutArguments;
}

export interface ExportAllLayoutsRequest {
    operation: "exportAllLayouts";
    operationArguments: {};
}

export interface DeleteLayoutRequest {
    operation: "deleteLayout";
    operationArguments: LayoutSelector;
}

export interface OpenWorkspaceRequest {
    operation: "openWorkspace";
    operationArguments: OpenWorkspaceArguments;
}

export interface GetWorkspaceSnapshotRequest {
    operation: "getWorkspaceSnapshot";
    operationArguments: ItemSelector;
}

export interface GetAllWorkspacesSummariesRequest {
    operation: "getAllWorkspacesSummaries";
    operationArguments: GetAllWorkspacesSummariesArguments;
}

export interface RestoreItemRequest {
    operation: "restoreItem";
    operationArguments: ItemSelector;
}

export interface MaximizeItemRequest {
    operation: "maximizeItem";
    operationArguments: ItemSelector;
}

export interface GetFrameSummaryRequest {
    operation: "getFrameSummary";
    operationArguments: ItemSelector;
}

export interface CloseItemRequest {
    operation: "closeItem";
    operationArguments: ItemSelector;
}

export interface AddWorkspaceChildrenRequest {
    operation: "addWorkspaceChildren";
    operationArguments: AddWorkspaceChildrenArguments;
}

export interface EjectRequest {
    operation: "ejectWindow";
    operationArguments: ItemSelector;
}

export interface ForceLoadWindowRequest {
    operation: "forceLoadWindow";
    operationArguments: ItemSelector;
}

export interface FocusItemRequest {
    operation: "focusItem";
    operationArguments: ItemSelector;
}

export interface BundleWorkspaceRequest {
    operation: "bundleWorkspace";
    operationArguments: BundleWorkspaceArguments;
}

export interface MoveFrameRequest {
    operation: "moveFrame";
    operationArguments: MoveFrameArguments;
}

export interface GetFrameSnapshotRequest {
    operation: "getFrameSnapshot";
    operationArguments: FrameSnapshotArguments;
}

export interface GetSnapshotRequest {
    operation: "getSnapshot";
    operationArguments: ItemSelector;
}

export interface MoveWindowToRequest {
    operation: "moveWindowTo";
    operationArguments: MoveWindowToArguments;
}

export interface GenerateLayoutRequest {
    operation: "generateLayout";
    operationArguments: GenerateLayoutArguments;
}

export interface PingRequest {
    operation: "ping";
    operationArguments: {};
}

export interface HibernateWorkspaceRequest {
    operation: "hibernateWorkspace";
    operationArguments: WorkspaceSelector;
}

export interface ResumeWorkspaceRequest {
    operation: "resumeWorkspace";
    operationArguments: WorkspaceSelector;
}

export interface LockWorkspaceRequest {
    operation: "lockWorkspace";
    operationArguments: LockWorkspaceArguments;
}

export interface LockWindowRequest {
    operation: "lockWindow";
    operationArguments: LockWindowArguments;
}

export interface LockContainerRequest {
    operation: "lockContainer";
    operationArguments: LockContainerArguments;
}

export interface ResizeItemRequest {
    operation: "resizeItem";
    operationArguments: ResizeItemArguments;
}

export interface PinWorkspaceRequest {
    operation: "pinWorkspace";
    operationArguments: PinWorkspaceArguments;
}

export interface UnpinWorkspaceRequest {
    operation: "unpinWorkspace";
    operationArguments: WorkspaceSelector;
}

export interface GetWorkspaceIconRequest {
    operation: "getWorkspaceIcon";
    operationArguments: WorkspaceSelector;
}

export interface SetWorkspaceIconRequest {
    operation: "setWorkspaceIcon";
    operationArguments: SetWorkspaceIconArguments;
}

export interface InitFrameRequest {
    operation: "initFrame";
    operationArguments: InitFrameArguments;
}

export interface CreateFrameRequest {
    operation: "createFrame";
    operationArguments: CreateFrameArguments;
}

export interface InitFrameFromSnapshotRequest {
    operation: "initFrameFromSnapshot";
    operationArguments: InitFrameFromSnapshotArguments;
}

export interface GetWorkspacesLayoutsRequest {
    operation: "getWorkspacesLayouts";
    operationArguments: GetWorkspacesLayoutsArguments;
}

export interface SetMaximizationBoundaryRequest {
    operation: "setMaximizationBoundary";
    operationArguments: SetMaximizationBoundaryArguments;
}

//#endregion

//#region Arguments

export interface GetAllWorkspacesSummariesArguments {
    frameId?: string;
}

export interface SetItemTitleArguments {
    itemId: string;
    title: string;
}

export interface LayoutSelector {
    name: string;
}

export interface ItemSelector {
    itemId: string;
}

export interface OpenWorkspaceArguments {
    name: string;
    restoreOptions?: RestoreWorkspaceConfig;
}

export interface SaveLayoutArguments {
    name: string;
    workspaceId?: string;
    saveContext?: boolean;
    metadata?: object;
}

export interface FrameSnapshotArguments extends ItemSelector {
    excludeIds?: boolean;
}

export interface RestoreWorkspaceConfig {
    title?: string;
    context?: object;
    noTabHeader?: boolean;
    reuseWorkspaceId?: string;
    loadingStrategy?: LoadingStrategy;
    icon?: string;
    isPinned?: boolean;
    isSelected?: boolean;
    positionIndex?: number;
}

export interface AddWindowArguments {
    definition: WindowDefinition;
    parentId: string;
    parentType: "workspace" | "row" | "column" | "group";
}

export interface AddContainerArguments {
    parentId: string;
    parentType: "workspace" | "row" | "column" | "group";
    definition: WorkspaceItem | RowItem | ColumnItem | GroupItem;
}

export interface AddWorkspaceChildrenArguments {
    workspaceId: string;
    children: Array<ColumnItem | RowItem | GroupItem>;
}

export interface WorkspaceDefinition {
    children: Array<RowItem | ColumnItem | GroupItem | WindowItem>;
    config?: {
        name?: string;
        context?: object;
        reuseWorkspaceId?: string;
        minWidth?: number;
        maxWidth?: number;
        minHeight?: number;
        maxHeight?: number;
        allowDrop?: boolean;
        allowExtract?: boolean;
        allowWindowReorder?: boolean;
        showEjectButtons?: boolean;
        allowSplitters?: boolean;
        showWindowCloseButtons?: boolean;
        showAddWindowButtons?: boolean;
        isSelected?: boolean;
    };
}

export interface CreateWorkspaceArguments extends WorkspaceDefinition {
    type?: "workspace";
    saveConfig?: object;
    context?: object;
    loadingStrategy: LoadingStrategy;
}

export interface MoveFrameArguments {
    swimlaneFrameId: string;
    location: {
        x: number;
        y: number;
    };
}

export interface MoveWindowToArguments {
    itemId: string;
    containerId: string;
}

export interface LockWorkspaceArguments {
    workspaceId: string;
    config?: {
        allowSplitters?: boolean;
        allowDrop?: boolean;
        allowDropLeft?: boolean;
        allowDropTop?: boolean;
        allowDropRight?: boolean;
        allowDropBottom?: boolean;
        allowExtract?: boolean;
        allowWindowReorder?: boolean;
        showCloseButton?: boolean;
        showSaveButton?: boolean;
        allowWorkspaceTabReorder?: boolean;
        showWindowCloseButtons?: boolean;
        showAddWindowButtons?: boolean;
        showEjectButtons?: boolean;
    };
}

export interface LockWindowArguments {
    windowPlacementId: string;
    config?: {
        showCloseButton?: boolean;
        allowExtract?: boolean;
        allowReorder?: boolean;
    };
}

export interface LockGroupArguments {
    type: "group";
    itemId: string;
    config?: {
        allowExtract?: boolean;
        allowReorder?: boolean;
        allowDrop?: boolean;
        allowDropHeader?: boolean;
        allowDropLeft?: boolean;
        allowDropTop?: boolean;
        allowDropRight?: boolean;
        allowDropBottom?: boolean;
        showMaximizeButton?: boolean;
        showEjectButton?: boolean;
        showAddWindowButton?: boolean;
    };
}

export interface LockRowArguments {
    type: "row";
    itemId: string;
    config?: {
        allowSplitters?: boolean;
        allowDrop?: boolean;
    };
}

export interface LockColumnArguments {
    type: "column";
    itemId: string;
    config: {
        allowSplitters?: boolean;
        allowDrop?: boolean;
    };
}

export type LockContainerArguments = LockGroupArguments | LockColumnArguments | LockRowArguments;

export interface ResizeItemArguments {
    itemId: string;
    width?: number;
    height?: number;
}

export interface PinWorkspaceArguments {
    workspaceId: string;
    frameId?: string;
    icon?: string;
}

export interface SetWorkspaceIconArguments {
    workspaceId: string;
    icon?: string;
}

export interface InitFrameArguments {
    workspaces: Array<OpenWorkspaceArguments | CreateWorkspaceArguments>;
}

export interface InitFrameFromSnapshotArguments {
    workspaces: Array<CreateWorkspaceArguments>;
}

export interface CreateFrameArguments {
    context?: object;
}

export interface GetWorkspacesLayoutsArguments {
    layoutName: string;
    layoutType: "Global" | "Workspace";
    context?: any;
}

export interface SetMaximizationBoundaryArguments {
    itemId: string;
    enabled: boolean; 
}

//#endregion

//#region Results

export interface LayoutResult {
    name: string;
    // not supported for now
    layout?: WorkspaceItem;
    workspaceId?: string;
}
export type OpenWorkspaceResult = WorkspaceSnapshot;

export type GetWorkspaceSnapshotResult = WorkspaceSnapshot;

export interface ExportAllLayoutsResult {
    layouts: string[];
}

export interface AddItemResult {
    itemId: string;
    windowId?: string;
}

export type CloseItemResult = void;

export type MaximizeItemResult = void;

export type RestoreItemResult = void;

export type AddWorkspaceChildrenResult = void;

export type EjectResult = void;

export type CreateWorkspaceResult = void;

export interface IsWindowInWorkspaceResult {
    inWorkspace: boolean;
}

export interface BundleWorkspaceArguments {
    type: "row" | "column";
    workspaceId: string;
}

export interface GenerateLayoutArguments {
    workspaceId: string;
    name: string;
}
export interface WorkspaceSelector {
    workspaceId: string;
}

export interface GetWorkspacesLayoutsResult {
    workspaces: WorkspaceSnapshot[];
}

//#endregion

export type ControlArguments = SaveLayoutRequest | DeleteLayoutRequest |
    ExportAllLayoutsRequest | OpenWorkspaceRequest | GetWorkspaceSnapshotRequest | GetAllWorkspacesSummariesRequest |
    CloseItemRequest | MaximizeItemRequest | RestoreItemRequest | AddWindowRequest | AddContainerRequest | SetItemTitleRequest |
    AddWorkspaceChildrenRequest | EjectRequest | CreateWorkspaceRequest | ForceLoadWindowRequest | FocusItemRequest |
    BundleWorkspaceRequest | IsWindowInWorkspaceRequest | GetFrameSummaryRequest | MoveFrameRequest | GetFrameSnapshotRequest |
    GetSnapshotRequest | MoveWindowToRequest | GenerateLayoutRequest | PingRequest | HibernateWorkspaceRequest | ResumeWorkspaceRequest |
    LockWorkspaceRequest | LockContainerRequest | LockWindowRequest | ResizeItemRequest | PinWorkspaceRequest | UnpinWorkspaceRequest |
    GetWorkspaceIconRequest | SetWorkspaceIconRequest | InitFrameRequest | CreateFrameRequest | InitFrameFromSnapshotRequest | GetWorkspacesLayoutsRequest | SetMaximizationBoundaryRequest;
