import { Channel, Context, Listener,ChannelError } from "@finos/fdc3";
import { Glue42 } from "@glue42/desktop";
import { WindowType } from "../types/windowtype";
import { newContextsSubscribe, 
    mapChannelNameToContextName, 
    parseContextsDataToInitialFDC3Data, 
    newChannelsSubscribe, 
    AsyncListener,
    contextUpdate,
    channelsUpdate
} from "../utils";
import { SystemChannel } from '../types/channel';
import { addAppChannelSubscription } from './appChannelsSubscriptions';

export const createSystemChannel = (glChannel: Glue42.Channels.ChannelContext): SystemChannel => {
    const channel = {
        id: glChannel.name,
        type: "system",
        displayMetadata: glChannel.meta
    };

    const broadcast = function(context: Context): Promise<void> {
        if (!context.type || typeof context.type !== "string") {
            throw new Error(ChannelError.AccessDenied);
        }

        return channelsUpdate(channel.id, context);
    }

    const getCurrentContext = async function(contextType?: string): Promise<Context | null> {
        if (!contextType) {
            // return the latest broadcasted context
            const contextName = mapChannelNameToContextName(channel.id);
            
            const context = await (window as WindowType).glue.contexts.get(contextName);

            return context.latest_fdc3_type
                ? parseContextsDataToInitialFDC3Data(context)
                : null;
        }

        const channelData = await (window as WindowType).glue.channels.get(channel.id);

        const { data } = channelData;

        return data && data[`fdc3_${contextType}`] !== undefined
            ? parseContextsDataToInitialFDC3Data({ data, latest_fdc3_type: contextType })
            : null;
    }

    /* addContextListener(handler: ContextHandler): Listener;
       addContextListener(contextType: string, handler: ContextHandler): Listener; */
    const addContextListener = function(contextTypeInput: any, handlerInput?: any): Listener {
        const contextType: string = arguments.length === 2 && contextTypeInput;
        const handler = arguments.length === 2 ? handlerInput : contextTypeInput;

        const subHandler = (data: any): void => {
            if (contextType) {
                if (data.type === contextType) {
                    handler(data);
                }
                return;
            }
            handler(data);
        };

        const unsubFunc = newChannelsSubscribe(subHandler);

        return AsyncListener(unsubFunc);
    }

    const join = function(): Promise<void> {
        return (window as WindowType).glue.channels.join(channel.id);
    }

    const leave = function(): Promise<void> {
        return (window as WindowType).glue.channels.leave();
    }

    return {
        ...channel,
        broadcast,
        getCurrentContext,
        addContextListener,
        join,
        leave
    };
};

export const createAppChannel = (id: string): Channel => {
    const channel = {
        id,
        type: "app"
    };

    const broadcast = function(context: Context): Promise<void> {
        if (!context.type || typeof context.type !== "string") {
            throw new Error(ChannelError.AccessDenied);
        }

        return contextUpdate(channel.id, context);
    }

    const getCurrentContext = async function(contextType?: string): Promise<Context | null> {
        const context = await (window as WindowType).glue.contexts.get(channel.id);
        const { data, latest_fdc3_type } = context;

        if (!contextType) {
            // return the latest broadcasted context
            return latest_fdc3_type
            ? parseContextsDataToInitialFDC3Data(context)
            : null;
        }

        return data && data[`fdc3_${contextType}`] !== undefined            
            ? parseContextsDataToInitialFDC3Data(context)
            : null;
    }

    const addContextListener = function(contextTypeInput: any, handlerInput?: any): Listener {
        const contextType = arguments.length === 2 && contextTypeInput;
        const handler = arguments.length === 2 ? handlerInput : contextTypeInput;

        const subHandler = (data: any): void => {
            if (contextType) {
                if (data.type === contextType) {
                    handler(data);
                }
                return;
            }
            handler(data);
        };
    
        const unsubFunc = newContextsSubscribe(channel.id, subHandler);

        const listener = addAppChannelSubscription(channel.id, subHandler, AsyncListener(unsubFunc));

        return listener;
    }

    return {
        ...channel,
        broadcast,
        getCurrentContext,
        addContextListener
    }
};
