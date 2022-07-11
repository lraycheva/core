import { Channel, Context, Listener } from "@finos/fdc3";

export interface SystemChannel extends Channel {
    join(): Promise<void>,
    leave(): Promise<void>
}
export interface AppChannelSubscription {
    id: string;
    handler: (context: Context) => void;
    setNewUnsub: (newUnsub: () => void) => void;
    listener: Listener
}

export interface AppChannelsSubscriptions {
    [channelId: string]: {
        subscriptions: AppChannelSubscription[]
    }
}
