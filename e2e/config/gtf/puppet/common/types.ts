import { Glue42WebPlatform } from "../../../../../packages/web-platform/platform";
import { Glue42Web } from "../../../../../packages/web/web.d";
import { Glue42Core } from "../../../../../packages/core/glue";

export type HttpCommands = "startGateway" | "stopGateway";

export type ClientCommands = "initiateWebPlatform" | "initiateCore" | "initiateWeb" | 
    "close" | "reload" | "openWebClient" | "ping" | "getIsConnected" | "invokeMethod" |
    "registerMethod" | "subscribeConnected" | "subscribeDisconnected" | "unsubscribeConnected" | "unsubscribeDisconnected" |
    "subscribeReconnected" | "unsubscribeReconnected" | "getAllContexts" | "getContext" | "setContext" | "updateContext" | "subscribeContext" | "unsubscribeContext";

export interface HttpBody {
    startGateway: {
        config: { port: number, rejectConnection?: boolean }
    },
    stopGateway: {
        config: { port: number }
    }
};

export interface HttpResponse {
    startGateway: {
        success: boolean
    },
    stopGateway: {
        success: boolean
    }
};

export interface ClientCommandArgs {
    initiateWebPlatform: {
        config: Glue42WebPlatform.Config
    };
    initiateCore: {
        config: Glue42Core.Config;
    };
    initiateWeb: {
        config: Glue42Web.Config;
    };
    close: null;
    reload: null;
    openWebClient: {
        id: string
    };
    ping: any;
    getIsConnected: null;
    invokeMethod: {
        name: string;
        invokeArgs: any;
        target?: "best" | "all"
    };
    registerMethod: {
        name: string;
    };
    getAllContexts: null;
    getContext: {
        name: string;
    };
    setContext: {
        name: string;
        data: any;
    };
    updateContext: {
        name: string;
        data: any;
    };
    subscribeContext: {
        name: string;
    };
    unsubscribeContext: {
        name: string;
    };
    subscribeConnected: null;
    subscribeDisconnected: null;
    unsubscribeConnected: null;
    unsubscribeDisconnected: null;
    subscribeReconnected: null;
    unsubscribeReconnected: null;
};

export interface ClientCommandResult {
    initiateWebPlatform: {
        success: boolean;
    };
    initiateCore: {
        success: boolean;
    };
    initiateWeb: {
        success: boolean;
    };
    close: null;
    reload: null;
    openWebClient: null;
    ping: null;
    getIsConnected: {
        connected: boolean;
    };
    invokeMethod: {
        invokeResult: Glue42Web.Interop.InvocationResult;
    };
    registerMethod: null;
    getAllContexts: {
        contexts: string[]
    };
    getContext: {
        context: any;
    };
    setContext: null;
    updateContext: null;
    subscribeContext: null;
    unsubscribeContext: null;
    subscribeConnected: null;
    subscribeDisconnected: null;
    unsubscribeConnected: null;
    unsubscribeDisconnected: null;
    subscribeReconnected: null;
    unsubscribeReconnected: null;
};
