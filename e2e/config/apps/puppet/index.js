import { getAllContexts, getContext, getIsConnected, invokeMethod, openWebClient, registerMethod, setContext, subscribeConnected, subscribeContext, subscribeDisconnected, subscribeReconnected, unsubscribeConnected, unsubscribeContext, unsubscribeDisconnected, unsubscribeReconnected, updateContext, waitContext } from "./glue-commands.js";

const sessionKey = "e2e";
const myId = window.name;
let myChildren = {};
let eventsLocks = {};
let myPort;
let glue;
let platform;
let unloadOperationId;

window.e2elog = (msg) => {
    if (myPort) {
        myPort.postMessage({ log: `Client ${window.name} ----- ${msg}` });
    }
};

window.addEventListener("beforeunload", () => {
    if (unloadOperationId) {
        myPort.postMessage({ result: {}, operationId });
    }
});

const processOperationInstruction = async (data) => {
    const operation = data.operation;
    const args = data.args;
    const operationId = data.operationId;

    const command = commands[operation];

    if (!command) {
        myPort.postMessage({ error: `Missing command - ${operation}`, operationId });
    }

    console.log(operation);

    try {
        const result = await command(args, operationId);

        if (typeof result === "object" && result.skipResponse) {
            return;
        }

        myPort.postMessage({ result, operationId });
    } catch (error) {
        const stringError = typeof error === "string" ? error : JSON.stringify(error.message);
        myPort.postMessage({ error: stringError, operationId });
    }
};

const processEventResponse = (data) => {
    if (!eventsLocks[data.eventId]) {
        return;
    }

    eventsLocks[data.eventId]({ result: data.result, error: data.error });

    delete eventsLocks[data.eventId];
}

const setupPortListener = (port) => {
    port.onmessage = async (event) => {
        const data = event.data;

        if (data.operationId) {
            return processOperationInstruction(data);
        }

        if (data.eventId) {
            return processEventResponse(data);
        }
    }
};

const raiseEvent = async (eventDetails) => {
    const uuid = crypto.randomUUID();

    const eventId = uuid.slice(0, uuid.indexOf("-"));

    // { result: any, error?: string }
    const responsePromise = new Promise((resolve) => {
        eventsLocks[eventId] = resolve;
    });

    myPort.postMessage({ ...eventDetails, eventId });

    const response = await responsePromise;

    if (response.error) {
        throw new Error(response.error);
    }

    return response.result;
};

const handleReadyFromChild = (event) => {
    const data = event.data;

    myChildren[data.winId] = { window: event.source };

    window.opener.postMessage(event.data, "*");
};

const handleAcceptedForChild = (event) => {
    const data = event.data;

    const child = myChildren[data.clientId];

    if (!child) {
        return;
    }

    child.window.postMessage(event.data, "*", [data.port]);

    delete myChildren[data.clientId];
};

const handleAcceptedForMe = (event) => {
    const data = event.data;

    myPort = data.port;

    setupPortListener(myPort);

    const previousState = JSON.parse(sessionStorage.getItem(sessionKey))

    if (previousState) {
        myPort.postMessage({ result: {}, operationId: previousState.operationId });
    }
};

const initPlatform = async (initSettings, operationId) => {

    const { default: GlueWebPlatform } = await import("../libs/platform.web.es.js");

    const coreEnv = await GlueWebPlatform(initSettings.config);

    glue = coreEnv.glue;
    platform = coreEnv.platform;

    window.glue = coreEnv.glue;
    window.platform = coreEnv.platform;

    return { success: true };
};

const initCore = async (initSettings, operationId) => {

    const { default: GlueCore } = await import("../libs/core.es.js");

    glue = await GlueCore(initSettings.config);
    window.glue = glue;
    return { success: true };
};

const initWeb = async (initSettings, operationId) => {
    const { default: GlueWeb } = await import("../libs/web.es.js");

    glue = await GlueWeb(initSettings.config);

    window.glue = glue;
    return { success: true };
};

const closeMyself = (_, operationId) => {
    unloadOperationId = operationId;
    window.close();
};

const reloadMyself = (_, operationId) => {
    sessionStorage.setItem(sessionKey, JSON.stringify({ operationId }));
    window.location.reload();
    return { skipResponse: true };
};

const commands = {
    initiateWebPlatform: initPlatform,
    initiateCore: initCore,
    initiateWeb: initWeb,
    close: closeMyself,
    reload: reloadMyself,
    ping: (_, id) => console.log(`Ping: ${id} -> ${JSON.stringify(_)}`),
    openWebClient: (config) => openWebClient(glue, config),
    getIsConnected: (config) => getIsConnected(glue, config),
    invokeMethod: (config) => invokeMethod(glue, config),
    registerMethod: (config) => registerMethod(glue, config, raiseEvent),
    subscribeConnected: (config) => subscribeConnected(glue, config, raiseEvent),
    subscribeDisconnected: (config) => subscribeDisconnected(glue, config, raiseEvent),
    unsubscribeConnected: () => unsubscribeConnected(),
    unsubscribeDisconnected: () => unsubscribeDisconnected(),
    subscribeReconnected: (config) => subscribeReconnected(glue, config, raiseEvent, platform),
    unsubscribeReconnected: () => unsubscribeReconnected(),
    getAllContexts: (config) => getAllContexts(glue, config),
    getContext: (config) => getContext(glue, config),
    setContext: (config) => setContext(glue, config),
    updateContext: (config) => updateContext(glue, config),
    subscribeContext: (config) => subscribeContext(glue, config, raiseEvent),
    unsubscribeContext: (config) => unsubscribeContext(glue, config),
    waitContextTrack: (config) => waitContext(platform.contextTrackGlue, config),
    waitContext: (config) => waitContext(glue, config)
};

const start = () => {

    window.addEventListener("message", (event) => {
        const data = event.data;

        if (data.ready) {
            handleReadyFromChild(event);
            return;
        }

        if (data.accepted && data.clientId !== myId) {
            handleAcceptedForChild(event);
            return;
        }

        if (data.accepted && data.clientId === myId) {
            handleAcceptedForMe(event);
            return;
        }
    });

    window.opener.postMessage({ ready: true, winId: myId }, "*");
};

start();

// postMessage({
//     operation: "doStuff",
//     args: { pls: "now" },
//     operationId: "laladkas"
// });