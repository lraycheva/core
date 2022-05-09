export const Glue42CoreMessageTypes = {
    connectionRequest: { name: "connectionRequest" },
    connectionAccepted: { name: "connectionAccepted" },
    platformPing: { name: "platformPing" },
    platformReady: { name: "platformReady" },
    platformUnload: { name: "platformUnload" },
    clientUnload: { name: "clientUnload" },
    parentPing: { name: "parentPing" },
    parentReady: { name: "parentReady" },
    gatewayDisconnect: { name: "gatewayDisconnect" },
    gatewayInternalConnect: { name: "gatewayInternalConnect" },
    transportSwitchRequest: { name: "transportSwitchRequest" },
    transportSwitchResponse: { name: "transportSwitchResponse" },
    getCurrentTransport: { name: "getCurrentTransport" },
    getCurrentTransportResponse: { name: "getCurrentTransportResponse" },
    checkPreferredLogic: { name: "checkPreferredLogic" },
    checkPreferredConnection: { name: "checkPreferredConnection" },
    checkPreferredLogicResponse: { name: "checkPreferredLogicResponse" },
    checkPreferredConnectionResponse: { name: "checkPreferredConnectionResponse" }
};

export const GlueWebPlatformControlName = "T42.Web.Platform.Control";

export const GlueWebPlatformStreamName = "T42.Web.Platform.Stream";

export const GlueClientControlName = "T42.Web.Client.Control";

export const GlueWebPlatformWorkspacesStreamName = "T42.Web.Platform.WSP.Stream";

export const GlueWorkspaceFrameClientControlName = "T42.Web.Workspaces.Control";

export const GlueWorkspacesEventsReceiverName = "T42.Web.Workspaces.Events";

export const GlueWebIntentsPrefix = "Tick42.FDC3.Intents.";

export const ChannelContextPrefix = "___channel___";

export const dbName = "glue42core";

export const serviceWorkerBroadcastChannelName = "glue42-core-worker";

export const dbVersion = 2;

export const webPlatformTransportName = "web-platform";