import { ChannelError, Context, ContextType, Listener, ContextHandler, PrivateChannel as Fdc3PrivateChannel } from '@finos/fdc3';
import { nanoid } from 'nanoid';
import { ChannelTypes, PrivateChannelEventMethods, PrivateChannelPrefix } from '../channels/privateChannelConstants';
import { ChannelsController } from '../channels/controller';
import { contextDecoder, optionalNonEmptyStringDecoder } from '../shared/decoder';
import { AsyncListener } from '../shared/utils';

export class PrivateChannel {
    private id!: string;
    private type = ChannelTypes.Private;
    private displayMetadata!: any;

    private unsubFromInstanceStopped!: () => void;

    constructor(private readonly channelsController: ChannelsController, channelId?: string) {
        this.id = channelId || `${PrivateChannelPrefix}${nanoid()}`;

        this.unsubFromInstanceStopped = this.channelsController.registerOnInstanceStopped(this.id);
    }

    public toApi(): Fdc3PrivateChannel {
        const api: Fdc3PrivateChannel = {
            id: this.id,
            type: this.type,
            displayMetadata: this.displayMetadata,
            broadcast: this.broadcast.bind(this),
            getCurrentContext: this.getCurrentContext.bind(this),
            addContextListener: this.addContextListener.bind(this) as { (handler: ContextHandler): Promise<Listener>; (contextType: string | null, handler: ContextHandler): Promise<Listener> },
            onAddContextListener: this.onAddContextListener.bind(this),
            onUnsubscribe: this.onUnsubscribe.bind(this),
            onDisconnect: this.onDisconnect.bind(this),
            disconnect: this.disconnect.bind(this),
        };

        return api;
    }

    private async broadcast(context: Context): Promise<void> {
        /* After disconnect() has been called on the channel, Desktop Agents SHOULD prevent apps from broadcasting on this channel */
        const isDisconnected = await this.channelsController.isPrivateChannelDisconnected(this.id);

        if (isDisconnected) {
            throw new Error(`${ChannelError.AccessDenied} - Channel has disconnected - broadcast is no longer available`);
        }

        contextDecoder.runWithException(context);

        return this.channelsController.broadcast(context, this.id);
    }

    private async getCurrentContext(contextType?: string): Promise<Context | null> {
        optionalNonEmptyStringDecoder.runWithException(contextType);

        return this.channelsController.getContextForChannel(this.id, contextType);
    }

    private async addContextListener(handler: ContextHandler): Promise<Listener>;
    private async addContextListener(contextType: string | null | ContextHandler, handler?: ContextHandler): Promise<Listener> {
        if (arguments.length === 1) {
            if (typeof contextType !== "function") {
                throw new Error(`${ChannelError.AccessDenied} - Expected function as an argument, got ${typeof contextType}`);
            }

            return this.channelsController.addContextListener(contextType as ContextHandler, undefined, this.id);
        }

        const contextTypeDecoder = optionalNonEmptyStringDecoder.runWithException(contextType);

        if (typeof handler !== "function") {
            throw new Error(`${ChannelError.AccessDenied} - Expected function as an argument, got ${typeof contextType}`);
        }

        return this.channelsController.addContextListener(handler, contextTypeDecoder, this.id);

    }

    private onAddContextListener(handler: (contextType?: string) => void): Listener {
        if (typeof handler !== "function") {
            throw new Error(`${ChannelError.AccessDenied} - Expected function as an argument, got ${typeof handler}`);
        }

        const unsub = this.channelsController.addPrivateChannelEvent(PrivateChannelEventMethods.OnAddContextListener, this.id, handler);

        return AsyncListener(unsub);
    }

    private onUnsubscribe(handler: (contextType?: ContextType) => void): Listener {
        if (typeof handler !== "function") {
            throw new Error(`${ChannelError.AccessDenied} - Expected function as an argument, got ${typeof handler}`);
        }

        const unsub = this.channelsController.addPrivateChannelEvent(PrivateChannelEventMethods.OnUnsubscribe, this.id, handler);

        return AsyncListener(unsub);
    }

    private onDisconnect(handler: () => void): Listener {
        if (typeof handler !== "function") {
            throw new Error(`${ChannelError.AccessDenied} - Expected function as an argument, got ${typeof handler}`);
        }

        const unsub = this.channelsController.addPrivateChannelEvent(PrivateChannelEventMethods.OnDisconnect, this.id, handler);

        return AsyncListener(unsub);
    }

    private async disconnect(): Promise<void> {
        await this.channelsController.announceDisconnect(this.id);

        this.unsubFromInstanceStopped();
    }
}
