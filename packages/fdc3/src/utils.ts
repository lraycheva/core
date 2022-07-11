import { Listener, Context } from "@finos/fdc3";
import { Glue42 } from "@glue42/desktop";
import { WindowType } from "./types/windowtype";

const CONTEXT_PREFIX = "___channel___";

/**
 * Changes to subscribe to comply with the FDC3 specification:
 * 1. Skip updates from myself
 * 2. Ignore initial replay
 */
export const newContextsSubscribe = (id: string, callback: (data: any, delta: any, removed: string[], unsubscribe: () => void, extraData?: any) => void): Promise<() => void> => {
    let didReplay = false;

    return (window as WindowType).glue.contexts.subscribe(id, (data: { data: any, latest_fdc3_type: string }, delta: any, removed: string[], unsubscribe: () => void, extraData?: any) => {
        if (!Object.keys(data).length && !didReplay) {
            didReplay = true;
            return;
        }

        if (extraData && extraData.updaterId === (window as WindowType).glue.interop.instance.peerId) {
            return;
        }

        /*  NB! Data from Channels API come in format: { fdc3_type: data } so it needs to be transformed to the initial fdc3 data { type: string, ...data }
            Ex: { type: "contact", name: "John Smith", id: { email: "john.smith@company.com" }} is broadcasted from FDC3,  
            it  will come in the handler as { fdc3_contact: { name: "John Smith", id: { email: "john.smith@company.com" }}} 
        */        
        const parsedCallbackData = parseGlue42DataToInitialFDC3Data(data);

        callback(parsedCallbackData, delta, removed, unsubscribe, extraData);
    });
};

export const newChannelsSubscribe = (callback: (data: any) => void): () => void => {
    let didReplay = false;

    return (window as WindowType).glue.channels.subscribe((data: any, context: any, updaterId: string) => {
        if (!Object.keys(data).length && !didReplay) {
            didReplay = true;
            return;
        }

        if (updaterId === (window as WindowType).glue.interop.instance.peerId) {
            return;
        }

        /*  NB! Data from Channels API come in format: { fdc3_type: data } so it needs to be transformed to the initial fdc3 data { type: string, ...data }
            Ex: { type: "contact", name: "John Smith", id: { email: "john.smith@company.com" }} is broadcasted from FDC3,  
            it  will come in the handler as { fdc3_contact: { name: "John Smith", id: { email: "john.smith@company.com" }}} 
        */
        const parsedCallbackData = parseGlue42DataToInitialFDC3Data({ data: context.data, latest_fdc3_type: context.latest_fdc3_type })
        
        callback(parsedCallbackData);
    });
};

/**
 * Returns a list of all channel contexts. We are not using `glue.channels.list()` so that @glue42/fdc3 can be used with older versions of the Glue42 JS SDK.
 */
export const getChannelsList = async (): Promise<Array<Glue42.ChannelContext>> => {
    const channelNames = await (window as WindowType).glue.channels.all();
    const channelContents: Array<Glue42.Channels.ChannelContext> = await Promise.all(channelNames.map((name: string) => (window as WindowType).glue.channels.get(name)));

    return channelContents;
};

export const waitFor = <T>(predicate: () => boolean, retryMs: number, resolution?: () => T): Promise<T> => {
    return new Promise((resolve) => {
        const resolvePromise: () => void = () => {
            if (typeof resolution !== "undefined") {
                resolve(resolution());
            } else {
                resolve();
            }
        };

        if (predicate()) {
            resolvePromise();
        } else {
            let interval: any;

            const callback = (): void => {
                if (predicate()) {
                    clearInterval(interval);

                    resolvePromise();
                }
            };

            interval = setInterval(callback, retryMs);
        }
    });
};

export const fetchTimeout = (url: string, timeoutMilliseconds = 3000): Promise<Response> => {
    return new Promise((resolve, reject) => {
        let timeoutHit = false;
        const timeout = setTimeout(() => {
            timeoutHit = true;
            reject(new Error(`Fetch request for: ${url} timed out at: ${timeoutMilliseconds} milliseconds`));
        }, timeoutMilliseconds);

        fetch(url)
            .then((response) => {
                if (!timeoutHit) {
                    clearTimeout(timeout);
                    resolve(response);
                }
            })
            .catch((err) => {
                if (!timeoutHit) {
                    clearTimeout(timeout);
                    reject(err);
                }
            });
    });
};

export const isEmptyObject = (obj: object): boolean => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const isInElectron = navigator.userAgent.toLowerCase().includes(" electron/");

export const isInGdContainer = navigator.userAgent.toLowerCase().includes(" tick42-glue-desktop/");

export const isGlue42Electron = !!(window as any).glue42electron;

export const isGlue42Enterprise = typeof window.glue42gd !== "undefined";

export const AsyncListener = (actualUnsub:
    (() => void)
    | Promise<() => void>
): Listener => {
    return {
        unsubscribe(): void {
            if (!actualUnsub) {
                console.error("Failed to unsubscribe!");
                return;
            }

            if (typeof actualUnsub === "function") {
                actualUnsub();
            } else {
                (actualUnsub as Promise<() => void>).then((unsubFunc: () => void) => unsubFunc());
            }
        }
    };
};

export const mapChannelNameToContextName = (channelName: string): string => {
    return `${CONTEXT_PREFIX}${channelName}`;
}

export const removeFDC3Prefix = (type: string): string => {
    return type.split("_").slice(1).join("");
}

// { fdc3_contact: { name: "John Smith", id: { email: "john.smith@company.com" }}}  => { type: "contact", name: "John Smith", id: { email: "john.smith@company.com" }} 
export const parseGlue42DataToInitialFDC3Data = (glue42Data: { data: any, latest_fdc3_type: string}) => {
    const latestPublishedData = parseContextsDataToInitialFDC3Data(glue42Data);

    const initialFDC3DataArr = Object.entries(glue42Data.data).map(([fdc3Type, dataValue]: [string, any]) => {
        const type = removeFDC3Prefix(fdc3Type);
        return { type, ...dataValue };
    });

    return Object.assign({}, ...initialFDC3DataArr, latestPublishedData);
}

export const parseContextsDataToInitialFDC3Data = (context: { data: any, latest_fdc3_type: string }): Context  => {
    const { data, latest_fdc3_type } = context;

    return { type: latest_fdc3_type, ...data[`fdc3_${latest_fdc3_type}`] };
}

// FDC3 updated data is stored in Glue Channels and Contexts in format { fdc3_type: data}
// ex: fdc3.broadcast({type: "contact", name: "John Smith", id: { email: "john.smith@company.com" }}) is saved in Glue42 Channels and Contexts as { fdc3_contact: { name: "John Smith", id: { email: "john.smith@company.com" }}}
export const parseFDC3ContextToGlueContexts = (context: Context) => {
    const { type, ...rest } = context;

    return { [`fdc3_${type}`]: rest };
}

export const contextUpdate = async (contextId: string, context: Context): Promise<void> => {
    const prevContextData = await (window as WindowType).glue.contexts.get(contextId);

    if (isEmptyObject(prevContextData)) {
        return (window as WindowType).glue.contexts.update(contextId, { 
            data: parseFDC3ContextToGlueContexts(context), 
            latest_fdc3_type: context.type 
        });
    }

    return (window as WindowType).glue.contexts.update(contextId, { 
        data: { ...prevContextData.data, ...parseFDC3ContextToGlueContexts(context) }, 
        latest_fdc3_type: context.type
    });
}

export const channelsUpdate = async (channelId: string, context: Context): Promise<void> => {
    const parsedData = parseFDC3ContextToGlueContexts(context);

    return (window as WindowType).glue.channels.publish(parsedData, channelId);
}