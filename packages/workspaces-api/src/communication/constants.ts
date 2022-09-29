import {
    isWindowInSwimlaneResultDecoder,
    frameSummaryDecoder,
    workspaceSnapshotResultDecoder,
    frameSummariesResultDecoder,
    workspaceCreateConfigDecoder,
    getFrameSummaryConfigDecoder,
    layoutSummariesDecoder,
    openWorkspaceConfigDecoder,
    workspaceSummariesResultDecoder,
    voidResultDecoder,
    exportedLayoutsResultDecoder,
    workspaceLayoutDecoder,
    deleteLayoutConfigDecoder,
    simpleItemConfigDecoder,
    resizeItemConfigDecoder,
    moveFrameConfigDecoder,
    frameSnapshotResultDecoder,
    simpleWindowOperationSuccessResultDecoder,
    setItemTitleConfigDecoder,
    moveWindowConfigDecoder,
    addWindowConfigDecoder,
    addContainerConfigDecoder,
    addItemResultDecoder,
    bundleConfigDecoder,
    workspaceStreamDataDecoder,
    frameStreamDataDecoder,
    containerStreamDataDecoder,
    windowStreamDataDecoder,
    workspaceLayoutSaveConfigDecoder,
    pingResultDecoder,
    frameStateConfigDecoder,
    frameStateResultDecoder,
    workspacesImportLayoutDecoder,
    workspaceSelectorDecoder,
    lockWorkspaceDecoder,
    lockWindowDecoder,
    lockContainerDecoder,
    frameBoundsResultDecoder,
    getWorkspaceIconResultDecoder,
    pinWorkspaceDecoder,
    setWorkspaceIconDecoder,
    frameSummaryResultDecoder,
    emptyFrameDefinitionDecoder,
    frameInitProtocolConfigDecoder,
    shortcutClickedDataDecoder,
    shortcutConfigDecoder,
    frameSnapshotConfigDecoder,
    setMaximizationBoundaryConfigDecoder,
    loadingAnimationConfigDecoder
} from "../shared/decoders";
import { ControlOperation, StreamOperation } from "../types/protocol";
import { WorkspaceEventType } from "../types/subscription";

type OperationsTypes = "isWindowInWorkspace" |
    "createWorkspace" |
    "getAllFramesSummaries" |
    "getFrameSummary" |
    "getAllWorkspacesSummaries" |
    "getWorkspaceSnapshot" |
    "getAllLayoutsSummaries" |
    "openWorkspace" |
    "deleteLayout" |
    "saveLayout" |
    "importLayout" |
    "exportAllLayouts" |
    "restoreItem" |
    "maximizeItem" |
    "focusItem" |
    "closeItem" |
    "resizeItem" |
    "setMaximizationBoundary" |
    "moveFrame" |
    "getFrameSnapshot" |
    "forceLoadWindow" |
    "ejectWindow" |
    "setItemTitle" |
    "moveWindowTo" |
    "addWindow" |
    "addContainer" |
    "bundleWorkspace" |
    "ping" |
    "changeFrameState" |
    "getFrameState" |
    "getFrameBounds" |
    "hibernateWorkspace" |
    "resumeWorkspace" |
    "lockWorkspace" |
    "lockWindow" |
    "lockContainer" |
    "pinWorkspace" |
    "unpinWorkspace" |
    "getWorkspaceIcon" |
    "setWorkspaceIcon" |
    "createFrame" |
    "registerShortcut" |
    "unregisterShortcut" |
    "initFrame" |
    "showLoadingAnimation" |
    "hideLoadingAnimation";
type OutgoingMethodTypes = "control" | "frameStream" | "workspaceStream" | "containerStream" | "windowStream";
export type IncomingMethodTypes = "control";

export const webPlatformMethodName = "T42.Web.Platform.Control";
export const webPlatformWspStreamName = "T42.Web.Platform.WSP.Stream";

export const OUTGOING_METHODS: { [key in OutgoingMethodTypes]: { name: string; isStream: boolean } } = {
    control: { name: "T42.Workspaces.Control", isStream: false },
    frameStream: { name: "T42.Workspaces.Stream.Frame", isStream: true },
    workspaceStream: { name: "T42.Workspaces.Stream.Workspace", isStream: true },
    containerStream: { name: "T42.Workspaces.Stream.Container", isStream: true },
    windowStream: { name: "T42.Workspaces.Stream.Window", isStream: true }
};

export const INCOMING_METHODS: { [key in IncomingMethodTypes]: { name: string; isStream: boolean } } = {
    control: { name: "T42.Workspaces.Client.Control", isStream: false },
};

export const STREAMS: { [key in WorkspaceEventType]: StreamOperation } = {
    frame: { name: "T42.Workspaces.Stream.Frame", payloadDecoder: frameStreamDataDecoder },
    workspace: { name: "T42.Workspaces.Stream.Workspace", payloadDecoder: workspaceStreamDataDecoder },
    container: { name: "T42.Workspaces.Stream.Container", payloadDecoder: containerStreamDataDecoder },
    window: { name: "T42.Workspaces.Stream.Window", payloadDecoder: windowStreamDataDecoder }
};

interface ShortcutClicked {
    operation: "shortcutClicked",
    data: {
        shortcut: string;
        frameId: string;
    }
}

export type ClientOperations = ShortcutClicked;

export type OnOperationsTypes = "shortcutClicked";

export const CLIENT_OPERATIONS: { [key in OnOperationsTypes]: ControlOperation } = {
    shortcutClicked: { name: "shortcutClicked", argsDecoder: shortcutClickedDataDecoder, resultDecoder: voidResultDecoder },
}

export const OPERATIONS: { [key in OperationsTypes]: ControlOperation } = {
    ping: { name: "ping", resultDecoder: pingResultDecoder },
    isWindowInWorkspace: { name: "isWindowInWorkspace", argsDecoder: simpleItemConfigDecoder, resultDecoder: isWindowInSwimlaneResultDecoder },
    createWorkspace: { name: "createWorkspace", resultDecoder: workspaceSnapshotResultDecoder, argsDecoder: workspaceCreateConfigDecoder },
    createFrame: { name: "createFrame", resultDecoder: frameSummaryResultDecoder, argsDecoder: emptyFrameDefinitionDecoder },
    initFrame: { name: "initFrame", resultDecoder: voidResultDecoder, argsDecoder: frameInitProtocolConfigDecoder },
    getAllFramesSummaries: { name: "getAllFramesSummaries", resultDecoder: frameSummariesResultDecoder },
    getFrameSummary: { name: "getFrameSummary", resultDecoder: frameSummaryDecoder, argsDecoder: getFrameSummaryConfigDecoder },
    getAllWorkspacesSummaries: { name: "getAllWorkspacesSummaries", resultDecoder: workspaceSummariesResultDecoder },
    getWorkspaceSnapshot: { name: "getWorkspaceSnapshot", resultDecoder: workspaceSnapshotResultDecoder, argsDecoder: simpleItemConfigDecoder },
    getAllLayoutsSummaries: { name: "getAllLayoutsSummaries", resultDecoder: layoutSummariesDecoder },
    openWorkspace: { name: "openWorkspace", argsDecoder: openWorkspaceConfigDecoder, resultDecoder: workspaceSnapshotResultDecoder },
    deleteLayout: { name: "deleteLayout", resultDecoder: voidResultDecoder, argsDecoder: deleteLayoutConfigDecoder },
    saveLayout: { name: "saveLayout", resultDecoder: workspaceLayoutDecoder, argsDecoder: workspaceLayoutSaveConfigDecoder },
    importLayout: { name: "importLayout", resultDecoder: voidResultDecoder, argsDecoder: workspacesImportLayoutDecoder },
    exportAllLayouts: { name: "exportAllLayouts", resultDecoder: exportedLayoutsResultDecoder },
    restoreItem: { name: "restoreItem", argsDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder },
    maximizeItem: { name: "maximizeItem", argsDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder },
    focusItem: { name: "focusItem", argsDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder },
    closeItem: { name: "closeItem", argsDecoder: simpleItemConfigDecoder, resultDecoder: voidResultDecoder },
    resizeItem: { name: "resizeItem", argsDecoder: resizeItemConfigDecoder, resultDecoder: voidResultDecoder },
    setMaximizationBoundary: { name: "setMaximizationBoundary", argsDecoder: setMaximizationBoundaryConfigDecoder, resultDecoder: voidResultDecoder },
    changeFrameState: { name: "changeFrameState", argsDecoder: frameStateConfigDecoder, resultDecoder: voidResultDecoder },
    getFrameState: { name: "getFrameState", argsDecoder: simpleItemConfigDecoder, resultDecoder: frameStateResultDecoder },
    getFrameBounds: { name: "getFrameBounds", argsDecoder: simpleItemConfigDecoder, resultDecoder: frameBoundsResultDecoder },
    moveFrame: { name: "moveFrame", argsDecoder: moveFrameConfigDecoder, resultDecoder: voidResultDecoder },
    getFrameSnapshot: { name: "getFrameSnapshot", argsDecoder: frameSnapshotConfigDecoder, resultDecoder: frameSnapshotResultDecoder },
    forceLoadWindow: { name: "forceLoadWindow", argsDecoder: simpleItemConfigDecoder, resultDecoder: simpleWindowOperationSuccessResultDecoder },
    ejectWindow: { name: "ejectWindow", argsDecoder: simpleItemConfigDecoder, resultDecoder: simpleWindowOperationSuccessResultDecoder },
    setItemTitle: { name: "setItemTitle", argsDecoder: setItemTitleConfigDecoder, resultDecoder: voidResultDecoder },
    moveWindowTo: { name: "moveWindowTo", argsDecoder: moveWindowConfigDecoder, resultDecoder: voidResultDecoder },
    addWindow: { name: "addWindow", argsDecoder: addWindowConfigDecoder, resultDecoder: addItemResultDecoder },
    addContainer: { name: "addContainer", argsDecoder: addContainerConfigDecoder, resultDecoder: addItemResultDecoder },
    bundleWorkspace: { name: "bundleWorkspace", argsDecoder: bundleConfigDecoder, resultDecoder: voidResultDecoder },
    hibernateWorkspace: { name: "hibernateWorkspace", argsDecoder: workspaceSelectorDecoder, resultDecoder: voidResultDecoder },
    resumeWorkspace: { name: "resumeWorkspace", argsDecoder: workspaceSelectorDecoder, resultDecoder: voidResultDecoder },
    lockWorkspace: { name: "lockWorkspace", argsDecoder: lockWorkspaceDecoder, resultDecoder: voidResultDecoder },
    lockWindow: { name: "lockWindow", argsDecoder: lockWindowDecoder, resultDecoder: voidResultDecoder },
    lockContainer: { name: "lockContainer", argsDecoder: lockContainerDecoder, resultDecoder: voidResultDecoder },
    pinWorkspace: { name: "pinWorkspace", argsDecoder: pinWorkspaceDecoder, resultDecoder: voidResultDecoder },
    unpinWorkspace: { name: "unpinWorkspace", argsDecoder: workspaceSelectorDecoder, resultDecoder: voidResultDecoder },
    getWorkspaceIcon: { name: "getWorkspaceIcon", argsDecoder: workspaceSelectorDecoder, resultDecoder: getWorkspaceIconResultDecoder },
    setWorkspaceIcon: { name: "setWorkspaceIcon", argsDecoder: setWorkspaceIconDecoder, resultDecoder: voidResultDecoder },
    registerShortcut: { name: "registerShortcut", argsDecoder: shortcutConfigDecoder, resultDecoder: voidResultDecoder },
    unregisterShortcut: { name: "unregisterShortcut", argsDecoder: shortcutConfigDecoder, resultDecoder: voidResultDecoder },
    showLoadingAnimation: { name: "showLoadingAnimation", argsDecoder: loadingAnimationConfigDecoder, resultDecoder: voidResultDecoder },
    hideLoadingAnimation: { name: "hideLoadingAnimation", argsDecoder: loadingAnimationConfigDecoder, resultDecoder: voidResultDecoder }
};
