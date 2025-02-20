export enum IntentHandlerResultTypes {
    Context = "Context",
    Channel = "Channel"
}
export const fdc3ChannelNames = ['fdc3.channel.1', 'fdc3.channel.4', 'fdc3.channel.6', 'fdc3.channel.3', 'fdc3.channel.2', 'fdc3.channel.8', 'fdc3.channel.7', 'fdc3.channel.5'];

export const defaultChannelsProps: string[] = ["id", "type", "broadcast", "addContextListener", "getCurrentContext"];

export const defaultContextProps: string[] = ["type"];

export const defaultGlue42APIs: string[] = ["contexts", "channels", "interop", "intents", "appManager", "windows"];
