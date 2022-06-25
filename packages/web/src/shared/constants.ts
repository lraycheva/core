import { PlatformMessages } from "./types";

export const Glue42CoreMessageTypes: { [key in PlatformMessages]: { name: PlatformMessages } } = {
    platformUnload: { name: "platformUnload" },
    transportSwitchRequest: { name: "transportSwitchRequest" },
    transportSwitchResponse: { name: "transportSwitchResponse" },
    getCurrentTransport: { name: "getCurrentTransport" },
    getCurrentTransportResponse: { name: "getCurrentTransportResponse" },
    checkPreferredLogic: { name: "checkPreferredLogic" },
    checkPreferredConnection: { name: "checkPreferredConnection" },
    checkPreferredLogicResponse: { name: "checkPreferredLogicResponse" },
    checkPreferredConnectionResponse: { name: "checkPreferredConnectionResponse" }
};

export const webPlatformTransportName = "web-platform";

export const latestFDC3Type = "latest_fdc3_type";