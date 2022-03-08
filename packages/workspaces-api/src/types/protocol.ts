/* eslint-disable @typescript-eslint/no-explicit-any */
import { Decoder } from "decoder-validate";
import { Glue42Workspaces } from "../../workspaces";

export interface StreamOperation {
    name: string;
    payloadDecoder: Decoder<any>;
}

export interface ControlOperation {
    name: string;
    resultDecoder: Decoder<any>;
    argsDecoder?: Decoder<any>;
}

// #region incoming
export interface IsWindowInSwimlaneResult {
    inWorkspace: boolean;
}

export interface WorkspaceConfigResult {
    frameId: string;
    title: string;
    name: string;
    positionIndex: number;
    layoutName: string | undefined;
    isHibernated?: boolean;
    allowSplitters?: boolean;
    allowDrop?: boolean;
    allowDropLeft?: boolean;
    allowDropTop?: boolean;
    allowDropRight?: boolean;
    allowDropBottom?: boolean;
    allowExtract?: boolean;
    showCloseButton?: boolean;
    showSaveButton?: boolean;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    showWindowCloseButtons?: boolean;
    showAddWindowButtons?: boolean;
    showEjectButtons?: boolean;
    widthInPx?: number;
    heightInPx?: number;
    isSelected?: boolean;
    isPinned?: boolean;
}

export interface BaseChildSnapshotConfig {
    frameId: string;
    workspaceId: string;
    positionIndex: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
}

export type ParentSnapshotConfig = RowSnapshotConfig | ColumnSnapshotConfig | GroupSnapshotConfig;

export interface RowSnapshotConfig extends BaseChildSnapshotConfig {
    type?: "row";
    allowDrop?: boolean;
    allowSplitters?: boolean;
    widthInPx?: number;
    heightInPx?: number;
    isPinned?: boolean;
    isMaximized?: boolean;
}

export interface ColumnSnapshotConfig extends BaseChildSnapshotConfig {
    type?: "column";
    allowDrop?: boolean;
    allowSplitters?: boolean;
    widthInPx?: number;
    heightInPx?: number;
    isPinned?: boolean;
    isMaximized?: boolean;
}

export interface GroupSnapshotConfig extends BaseChildSnapshotConfig {
    type?: "group";
    allowDrop?: boolean;
    allowDropLeft?: boolean;
    allowDropRight?: boolean;
    allowDropTop?: boolean;
    allowDropBottom?: boolean;
    allowDropHeader?: boolean;
    allowExtract?: boolean;
    showMaximizeButton?: boolean;
    showEjectButton?: boolean;
    showAddWindowButton?: boolean;
    widthInPx?: number;
    heightInPx?: number;
    isMaximized?: boolean;
}

export interface SwimlaneWindowSnapshotConfig extends BaseChildSnapshotConfig {
    windowId?: string;
    isMaximized: boolean;
    isFocused: boolean;
    appName?: string;
    title?: string;
    allowExtract?: boolean;
    showCloseButton?: boolean;
    widthInPx?: number;
    heightInPx?: number;
}

export interface WindowSnapshotResult {
    id: string;
    type: "window";
    config: SwimlaneWindowSnapshotConfig;
}

export interface SubParentSnapshotResult {
    id: string;
    type: "row" | "column" | "group";
    children: ChildSnapshotResult[];
    config: ParentSnapshotConfig;
}
export type ChildSnapshotResult = WindowSnapshotResult | SubParentSnapshotResult;

export interface FrameSnapshotResult {
    id: string;
    config: any;
    workspaces: WorkspaceSnapshotResult[];
}

export interface FrameSummaryResult {
    id: string;
    isInitialized?: boolean;
    initializationContext?: Glue42Workspaces.FrameInitializationContext;
}

export interface FrameSummariesResult {
    summaries: FrameSummaryResult[];
}

export interface WorkspaceSnapshotResult {
    id: string;
    config: WorkspaceConfigResult;
    children: ChildSnapshotResult[];
    frameSummary: FrameSummaryResult;
}

export interface WorkspaceSummaryResult {
    id: string;
    config: WorkspaceConfigResult;
}

export interface WorkspaceSummariesResult {
    summaries: WorkspaceSummaryResult[];
}

export interface LayoutSummary {
    name: string;
}

export interface LayoutSummariesResult {
    summaries: LayoutSummary[];
}

export interface ContainerSummaryResult {
    itemId: string;
    config: ParentSnapshotConfig;
}

export interface ExportedLayoutsResult {
    layouts: Glue42Workspaces.WorkspaceLayout[];
}

export interface SimpleWindowOperationSuccessResult {
    windowId: string;
}

export interface AddItemResult {
    itemId: string;
    windowId?: string;
}

export interface PingResult {
    live: boolean;
}

export interface FrameStateResult {
    state: Glue42Workspaces.FrameState;
}

export interface FrameBoundsResult {
    bounds: {
        top: number;
        left: number;
        width: number;
        height: number;
    };
}

export interface GetWorkspaceIconResult {
    icon: string;
}

// #endregion

// #region outgoing

export interface WorkspaceCreateConfigProtocol extends Glue42Workspaces.WorkspaceDefinition {
    saveConfig?: Glue42Workspaces.WorkspaceCreateConfig;
}

export interface FrameInitializationConfigProtocol extends Glue42Workspaces.FrameInitializationConfig {
    frameId: string;
}

export interface GetFrameSummaryConfig {
    itemId: string;
}

export interface OpenWorkspaceConfig {
    name: string;
    options?: Glue42Workspaces.RestoreWorkspaceConfig;
}

export interface DeleteLayoutConfig {
    name: string;
}

export interface SimpleItemConfig {
    itemId: string;
}

export interface FrameStateConfig {
    frameId: string;
    requestedState?: Glue42Workspaces.FrameState;
}

export interface ResizeItemConfig {
    itemId: string;
    width?: number;
    height?: number;
    relative?: boolean;
}

export interface MoveFrameConfig {
    itemId: string;
    top?: number;
    left?: number;
    relative?: boolean;
}

export interface SetItemTitleConfig {
    itemId: string;
    title: string;
}

export interface MoveWindowConfig {
    itemId: string;
    containerId: string;
}

export interface AddWindowConfig {
    definition: Glue42Workspaces.WorkspaceWindowDefinition;
    parentId: string;
    parentType: "row" | "column" | "group" | "workspace";
}

export interface AddContainerConfig {
    definition: Glue42Workspaces.BoxDefinition;
    parentId: string;
    parentType: "row" | "column" | "group" | "workspace";
}

export interface BundleConfig {
    type: "row" | "column";
    workspaceId: string;
}

export interface WindowSelector {
    windowPlacementId: string;
}

export interface ItemSelector {
    itemId: string;
}

export interface WorkspaceSelector {
    workspaceId: string;
}

// #endregion

// #region stream incoming
export interface FrameStreamData {
    frameSummary: FrameSummaryResult;
}

// the optional workspaceSnapshot is expected only when the last workspace in a Core platform-frame is being closed, which triggers the creation of a default workspace 
// reason: explicit snapshot in this case will make sure that even if new new workspace was quickly closed (spamming of the close button), the event will provide correct data
export interface WorkspaceStreamData {
    workspaceSummary: WorkspaceSummaryResult;
    frameSummary: FrameSummaryResult;
    workspaceSnapshot?: WorkspaceSnapshotResult;
}

export interface ContainerStreamData {
    containerSummary: ContainerSummaryResult;
}

export interface WindowStreamData {
    windowSummary: {
        itemId: string;
        parentId: string;
        config: SwimlaneWindowSnapshotConfig;
    };
}

export interface LockWindowConfig {
    windowPlacementId: string;
    config?: {
        allowExtract?: boolean;
        showCloseButton?: boolean;
    };
}

export interface LockRowConfig {
    itemId: string;
    type: "row";
    config?: {
        allowDrop?: boolean;
        allowSplitters?: boolean;
    };
}

export interface LockColumnConfig {
    itemId: string;
    type: "column";
    config?: {
        allowDrop?: boolean;
        allowSplitters?: boolean;
    };
}

export interface LockGroupConfig {
    itemId: string;
    type: "group";
    config?: {
        allowExtract?: boolean;
        allowDrop?: boolean;
        allowDropLeft?: boolean;
        allowDropRight?: boolean;
        allowDropTop?: boolean;
        allowDropBottom?: boolean;
        allowDropHeader?: boolean;
        showMaximizeButton?: boolean;
        showEjectButton?: boolean;
        showAddWindowButton?: boolean;
    };
}

export type LockContainerConfig = LockGroupConfig | LockColumnConfig | LockRowConfig;

export interface LockWorkspaceConfig {
    workspaceId: string;
    config?: {
        allowDrop?: boolean;
        allowDropLeft?: boolean;
        allowDropTop?: boolean;
        allowDropRight?: boolean;
        allowDropBottom?: boolean;
        allowExtract?: boolean;
        allowSplitters?: boolean;
        showCloseButton?: boolean;
        showSaveButton?: boolean;
    };
}

export interface PinWorkspaceConfig {
    workspaceId: string;
    icon?: string;
}

export interface SetWorkspaceIconConfig {
    workspaceId: string;
    icon?: string;
}

// #endregion
