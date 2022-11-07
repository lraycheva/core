import { default as CallbackRegistryFactory, CallbackRegistry, UnsubscribeFunction } from "callback-registry";
import { SystemMethodEventPayload } from '../types/glue42Types';


export class ChannelsCallbackRegistry {
    private readonly registry!: CallbackRegistry;

    constructor() {
        this.registry = CallbackRegistryFactory();
    }

    public add(action: string, channelId: string, callback: (contextType?: string) => void, replayArgs?: string[]): UnsubscribeFunction {
        return this.registry.add(`${action}-${channelId}`, callback, replayArgs);
    }

    public invoke(action: string, argumentObj: SystemMethodEventPayload): void {
        const { channelId, contextType } = argumentObj;

        this.registry.execute(`${action}-${channelId}`, contextType);
    }
}