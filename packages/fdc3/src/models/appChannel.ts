import { ChannelError, Context, Listener, Channel, ContextHandler } from '@finos/fdc3';
import { ChannelTypes } from '../channels/privateChannelConstants';
import { ChannelsController } from '../channels/controller';
import { contextDecoder, optionalNonEmptyStringDecoder, decodeResult, nonEmptyStringDecoder } from '../shared/decoder';

export class AppChannel {
    private type = ChannelTypes.App;

    constructor(
        private readonly channelsController: ChannelsController,
        private readonly id: string
    ) { }

    public toApi(): Channel {
        const api: Channel = {
            id: this.id,
            type: this.type,
            broadcast: this.broadcast.bind(this),
            getCurrentContext: this.getCurrentContext.bind(this),
            addContextListener: this.addContextListener.bind(this) as { (handler: ContextHandler): Promise<Listener>; (contextType: string | null, handler: ContextHandler): Promise<Listener> },
        };

        return api;
    }

    private async broadcast(context: Context): Promise<void> {
        contextDecoder.runWithException(context);

        return this.channelsController.broadcast(context, this.id);
    }

    private async getCurrentContext(contextType?: string): Promise<Context | null> {
        optionalNonEmptyStringDecoder.runWithException(contextType);

        return this.channelsController.getContextForChannel(this.id, contextType);
    }

    private async addContextListener(handler: ContextHandler): Promise<Listener>;
    private async addContextListener(contextType: string | null | ContextHandler, handler?: ContextHandler): Promise<Listener | void> {
        if (arguments.length === 1) {
            if (typeof contextType !== "function") {
                throw new Error("Please provide the handler as a function!");
            }

            return this.channelsController.addContextListener(contextType, undefined, this.id);
        }

        const contextTypeDecoder = optionalNonEmptyStringDecoder.runWithException(contextType);

        if (typeof handler !== "function") {
            throw new Error("Please provide the handler as a function!");
        }

        return this.channelsController.addContextListener(handler, contextTypeDecoder, this.id);
    }
}