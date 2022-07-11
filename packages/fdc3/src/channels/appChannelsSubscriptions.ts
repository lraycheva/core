import { Context, Listener } from "@finos/fdc3";
import { nanoid } from "nanoid";
import {
    AppChannelsSubscriptions,
    AppChannelSubscription,
} from "../types/channel";
import { newContextsSubscribe } from "../utils";

const appChannelsSubscriptions: AppChannelsSubscriptions = {};

const getChannelSubscriptions = (channelId: string): AppChannelSubscription[] => {
    if (!appChannelsSubscriptions[channelId]) {
        appChannelsSubscriptions[channelId] = {
            subscriptions: [],
        };
    }

    return appChannelsSubscriptions[channelId].subscriptions;
};

const removeAppChannelSubById = (channelId: string, subId: string): void => {
    appChannelsSubscriptions[channelId].subscriptions = appChannelsSubscriptions[channelId].subscriptions.filter((sub) => sub.id !== subId);
};

export const addAppChannelSubscription = (channelId: string, handler: (context: Context) => void, listener: Listener): Listener => {
    const id = nanoid();

    let unsubscribe = () => {
        listener.unsubscribe();

        removeAppChannelSubById(channelId, id);
    };

    const result = { unsubscribe };

    const setNewUnsub = (newUnsubFn: () => void): void => {
        result.unsubscribe = newUnsubFn;
    };

    const channelSubs = getChannelSubscriptions(channelId);
    channelSubs.push({ id, handler, setNewUnsub, listener });

    return result;
};

export const removeAppChannelsActiveListeners = (channelId: string): void => {
    if (!appChannelsSubscriptions[channelId]) {
        return;
    }

    appChannelsSubscriptions[channelId].subscriptions.forEach(
        ({ id, setNewUnsub, listener }) => {
            listener.unsubscribe();
            
            // when not on a channel, invoking listener.unsubscribe() will remove the inactive subscription for the app channel context updates
            setNewUnsub(() => removeAppChannelSubById(channelId, id));
        }
    );
};

export const addAppChannelSubscriptions = async (channelId: string): Promise<void> => {
    if (!appChannelsSubscriptions[channelId]) {
        return;
    }

    appChannelsSubscriptions[channelId].subscriptions = appChannelsSubscriptions[channelId].subscriptions.map((sub) => {
        newContextsSubscribe(channelId, sub.handler).then((unsub) => {
            sub.listener = { unsubscribe: unsub };

            sub.setNewUnsub(() => {
                removeAppChannelSubById(channelId, sub.id);
                unsub();
            });
        });

        return sub;
    });
};
