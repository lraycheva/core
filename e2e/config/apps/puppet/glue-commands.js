import { PromisePlus } from "../shared/promise-plus.js";

let testIncrementor = 0;
let unsubConnected;
let unsubDisconnected;
let unsubLibsReAnnounce;
let libReAnnounceState = {
    contexts: false,
    interop: false
};
let contextsUnSubscriptions = {};

export const puppetAppIndexHtml = "http://localhost:4242/puppet/index.html";

export const openWebClient = async (glue, config) => {
    await glue.windows.open(`puppet-web-${++testIncrementor}`, puppetAppIndexHtml, { windowId: config.id });
};

export const getIsConnected = (glue, config) => {
    const connected = glue.connection.isConnected;

    return { connected };
};

export const invokeMethod = async (glue, config) => {
    try {
        const invResponse = await glue.interop.invoke(config.name, config.invokeArgs, config.target, { waitTimeoutMs: 5000, methodResponseTimeoutMs: 5000 });

        return { invokeResult: JSON.parse(JSON.stringify(invResponse)) };

    } catch (error) {
        throw new Error(JSON.stringify(error));
    }
};

export const registerMethod = async (glue, config, raiseEvent) => {
    return PromisePlus((resolve, reject) => {
        glue.interop.register(config.name, async (args, caller) => {

            const result = await raiseEvent({
                event: "methodInvoked",
                name: config.name,
                args,
                caller: JSON.parse(JSON.stringify(caller))
            });

            return result;

        }).then(() => resolve()).catch(reject);

    }, 5000, `Method ${config.name} registration timed out`);

};

export const getAllContexts = async (glue, config) => {
    const contexts = glue.contexts.all();

    return { contexts };
};

export const getContext = async (glue, config) => {
    const context = await glue.contexts.get(config.name);

    return { context };
};

export const setContext = async (glue, config) => {
    await glue.contexts.set(config.name, config.data);
};

export const updateContext = async (glue, config) => {
    await glue.contexts.update(config.name, config.data);
};

export const subscribeContext = async (glue, config, raiseEvent) => {

    if (contextsUnSubscriptions[config.name]) {
        return;
    }

    const unsub = await glue.contexts.subscribe(config.name, (data) => {

        if (contextsUnSubscriptions[config.name]) {
            raiseEvent({
                event: "contextUpdate",
                contextName: config.name,
                context: data
            });
        } else {
            setTimeout(() => {
                raiseEvent({
                    event: "contextUpdate",
                    contextName: config.name,
                    context: data
                });
            }, 0);
        }

    });

    contextsUnSubscriptions[config.name] = unsub;
};

export const unsubscribeContext = (glue, config) => {
    const contextUnsub = contextsUnSubscriptions[config.name];

    if (contextUnsub) {
        contextUnsub();
        contextsUnSubscriptions[config.name] = undefined;
    }
};

export const subscribeConnected = async (glue, config, raiseEvent) => {
    if (unsubConnected) {
        return;
    }

    unsubConnected = glue.connection.connected((server) => {

        if (unsubConnected) {
            raiseEvent({
                event: "connected",
                server
            });
        } else {
            setTimeout(() => {
                raiseEvent({
                    event: "connected",
                    server
                });
            }, 0);
        }

    });
};

export const subscribeDisconnected = async (glue, config, raiseEvent) => {
    if (unsubDisconnected) {
        return;
    }

    unsubDisconnected = glue.connection.disconnected(() => {
        if (unsubDisconnected) {
            raiseEvent({
                event: "disconnected"
            });
        } else {
            setTimeout(() => {
                raiseEvent({
                    event: "disconnected"
                });
            }, 0);
        }
    });
};

export const unsubscribeConnected = () => {
    if (unsubConnected) {
        unsubConnected();
        unsubConnected = undefined;
    }
};

export const unsubscribeDisconnected = () => {
    if (unsubDisconnected) {
        unsubDisconnected();
        unsubDisconnected = undefined;
    }
};

export const subscribeReconnected = (glue, config, raiseEvent, platform) => {

    if (unsubLibsReAnnounce) {
        return;
    }

    if (platform) {
        return subscribePlatformReconnected(platform, raiseEvent);
    }

    unsubLibsReAnnounce = glue.connection.onLibReAnnounced(({ name }) => {
        libReAnnounceState[name] = true;

        if (libReAnnounceState.contexts && libReAnnounceState.interop) {
            if (unsubLibsReAnnounce) {
                raiseEvent({
                    event: "reconnected"
                });

                libReAnnounceState.contexts = false;
                libReAnnounceState.interop = false;
            } else {
                setTimeout(() => {
                    raiseEvent({
                        event: "reconnected"
                    });

                    libReAnnounceState.contexts = false;
                    libReAnnounceState.interop = false;
                }, 0)
            }

        }
    });
};

export const unsubscribeReconnected = () => {
    if (unsubLibsReAnnounce) {
        unsubLibsReAnnounce();
        unsubLibsReAnnounce = undefined;
    }
};

export const waitContext = (glue, config) => {
    if (!glue) {
        return Promise.reject("Cannot wait for context, because no glue was provided");
    }

    return new Promise((resolve) => {
        const name = config.name;
        const value = config.value;
        let unsub;

        const ready = waitFor(2, () => {
            unsub();
            resolve()
        });

        glue.contexts.subscribe(name, (data) => {

            if (JSON.stringify(data) === JSON.stringify(value)) {
                ready();
            }

        }).then((_unsub) => {
            unsub = _unsub;
            ready();
        });
    });
}

const subscribePlatformReconnected = (platform, raiseEvent) => {
    unsubLibsReAnnounce = platform.onSystemReconnect(() => {
        if (unsubLibsReAnnounce) {
            raiseEvent({
                event: "reconnected"
            });
        } else {
            setTimeout(() => {
                raiseEvent({
                    event: "reconnected"
                });
            }, 0);
        }
    })
};

const waitFor = (invocations, callback) => {
    let left = invocations;
    return () => {
        left--;

        if (left === 0) {
            callback();
        }
    };
}