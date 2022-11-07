import { ChannelError, Context, Listener, Channel, ContextHandler, PrivateChannel} from '@finos/fdc3';
import { ChannelContext, Instance, SystemMethodEventPayload, UnsubscribeFunction } from '../types/glue42Types';
import { GlueController } from '../controllers/glue';
import { ChannelsParser } from './parser';
import { ChannelsStateStore } from './stateStore';
import { ChannelsFactory } from './factory';
import { parseContextHandler } from './utils';
import { ChannelTypes, PrivateChannelEventMethods, PrivateChannelPrefix } from './privateChannelConstants';
import { ChannelsCallbackRegistry } from './callbackRegistry';
import { fdc3ChannelNames } from '../shared/constants';

export class ChannelsController {
    private initDonePromise: Promise<void>;

    constructor(
        private readonly glueController: GlueController,
        private readonly channelsStateStore: ChannelsStateStore,
        private readonly channelsParser: ChannelsParser,
        private readonly channelsFactory: ChannelsFactory,
        private readonly channelsCallbackRegistry: ChannelsCallbackRegistry
    ) {
        this.initDonePromise = this.initialize();
    }

    public async addContextListener(handler: ContextHandler, contextType?: string, channelId?: string): Promise<Listener> {
        await this.initDonePromise;

        /* second check is needed because of joinChannel() method of FDC3 1.2 where you can join a user channel */
        if ((!channelId && !this.channelsStateStore.currentChannel) || (!channelId && this.channelsStateStore.currentChannel!.type === ChannelTypes.App)) {
            throw new Error(`${ChannelError.AccessDenied} - Cannot add a context listener when not on a channel`);
        }

        const channelIdToSubscribeTo = channelId || this.channelsStateStore.currentChannel!.id;

        return this.addContextListenerByChannelId(channelIdToSubscribeTo, handler, contextType);
    }

    public async broadcast(context: Context, channelId?: string): Promise<void> {
        await this.initDonePromise;

        if (!channelId && !this.channelsStateStore.currentChannel) {
            console.error("You need to join a user channel in order to broadcast.");
            return;
        }

        if (!channelId && this.channelsStateStore.currentChannel!.type === ChannelTypes.App) {
            console.error("You can't broadcast to an app channel directly - use channel's broadcast method instead.");
            return;
        }

        const channelIdToBroadcastTo = channelId || this.channelsStateStore.currentChannel!.id;
        
        return this.broadcastByChannelId(channelIdToBroadcastTo, context);
    }

    public async getUserChannels(): Promise<Channel[]> {
        await this.glueController.gluePromise;

        return Object.values(this.channelsStateStore.userChannels);
    }

    public async getOrCreateChannel(channelId: string): Promise<Channel> {
        await this.glueController.gluePromise;

        const isPrivateChannel = this.isPrivateChannel(channelId);

        if (isPrivateChannel) {
            throw new Error(`${ChannelError.AccessDenied} - Cannot retrieve a private channel`);
        }

        const isUserChannel = this.isUserChannel(channelId);

        if (isUserChannel) {
            return this.channelsStateStore.getUserChannelById(channelId)!;
        }

        return this.getOrCreateAppChannel(channelId);
    };

    /* deprecated in FDC3 2.0 */
    public async joinChannel(channelId: string): Promise<void> {
        await this.initDonePromise;

        const channel: Channel = this.channelsStateStore.getUserChannelById(channelId) || await this.tryGetAppChannel(channelId);

        if (!channel) {
            throw new Error(ChannelError.NoChannelFound);
        }

        const isUserChannel = this.isUserChannel(channel.id);

        if (isUserChannel) {
            const glueChannelName = this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId);

            return this.glueController.joinChannel(glueChannelName);
        }

        /* Used only for joining an app channel. For system channels it's invoked by handleSwitchChannelUI() */
        this.channelsStateStore.currentChannel = channel;
    }

    public async joinUserChannel(channelId: string): Promise<void> {
        await this.initDonePromise;

        const channel = this.channelsStateStore.userChannels[channelId];

        if (!channel) {
            throw new Error(ChannelError.NoChannelFound);
        }

        const glueChannelName = this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId);

        return this.glueController.joinChannel(glueChannelName);
    }

    public async getCurrentChannel(): Promise<Channel | null> {
        await this.initDonePromise;

        return this.channelsStateStore.currentChannel;
    }

    public async leaveCurrentChannel(): Promise<void> {
        await this.initDonePromise;

        if (!this.channelsStateStore.currentChannel) {
            return;
        }

        const isUserChannel = this.isUserChannel(this.channelsStateStore.currentChannel.id);

        if (isUserChannel) {
            await this.glueController.leaveChannel();
        }

        this.channelsStateStore.currentChannel = null;
    }

    public async getContextForChannel(channelId: string, contextType?: string): Promise<Context | null> {
        await this.initDonePromise;

        const isUserChannel = this.isUserChannel(channelId);

        if (!contextType) {
            let context;

            if (isUserChannel) {
                const glueChannelName = this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId);
                const glueChannelWithPrefix = this.channelsParser.mapChannelNameToContextName(glueChannelName);

                context = await this.glueController.getContext(glueChannelWithPrefix);
            } else {
                context = await this.glueController.getContext(channelId);
            }

            return context.latest_fdc3_type
                ? this.channelsParser.parseContextsDataToInitialFDC3Data(context)
                : null;
        }

        const parsedType = this.channelsParser.mapFDC3TypeToChannelsDelimiter(contextType);

        const { data } = isUserChannel
            ? await this.glueController.getChannel(this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId))
            : await this.glueController.getContext(channelId);

        return data && data[`fdc3_${parsedType}`]
            ? this.channelsParser.parseContextsDataToInitialFDC3Data({ data, latest_fdc3_type: parsedType })
            : null;
    }

    public async createPrivateChannel(): Promise<PrivateChannel> {
        const creatorId = this.glueController.getMyWindowId();

        const channel = this.buildChannel(ChannelTypes.Private) as PrivateChannel;

        await this.glueController.updateContext(channel.id , { creatorId });

        return channel;
    }

    public async announceDisconnect(channelId: string, instanceId?: string): Promise<void> {
        await this.glueController.updateContext(channelId, { disconnected: true });

        const closedInstanceId = instanceId || this.glueController.getMyWindowId();

        const targetInstance = await this.getOtherInstanceIdFromClosedOne(channelId, closedInstanceId);
    
        const replayContextTypes = await this.getContextTypesForPrivateChannel(channelId);

        this.invokeSystemMethod(targetInstance, PrivateChannelEventMethods.OnDisconnect, { clientId: targetInstance, channelId, replayContextTypes });
    }

    public async addClientToPrivateChannel(channelId: string, clientId: string): Promise<void> {
        await this.glueController.updateContext(channelId, { clientId });
    }

    public async isPrivateChannelDisconnected(channelId: string): Promise<boolean> {
        const context = await this.glueController.getContext(channelId);

        return !!context.disconnected;
    }

    public registerOnInstanceStopped(channelId: string): () => void {
        const handler = async(instance: Instance) => {
            const { clientId, creatorId } = await this.glueController.getContext(channelId);

            if (instance.id !== clientId && instance.id !== creatorId) {
                return;
            }

            await this.announceDisconnect(channelId, instance.id);
        }

        return this.glueController.registerOnInstanceStopped(handler.bind(this));
    }

    public async addPrivateChannelEvent(action: string, channelId: string, callback: (contextType?: string) => void): Promise<UnsubscribeFunction> {
        let replayArgs: string[] | undefined;

        const targetInstanceId = await this.getTargetedInstanceId(channelId);

        if (action === PrivateChannelEventMethods.OnAddContextListener && targetInstanceId) {
            replayArgs = await this.getContextTypesForPrivateChannel(channelId);
        }

        return this.channelsCallbackRegistry.add(action, channelId, callback, replayArgs);
    }

    private async initialize(): Promise<void> {
        await this.glueController.gluePromise;

        const current = this.glueController.getCurrentChannel();

        if (current) {
            this.handleSwitchChannelUI(current);
        }

        /* Used in Glue42 Enterprise for navigating through system channels with the channelSelectorWidget */
        this.glueController.setOnChannelChanged((channelId: string) => {
            this.handleSwitchChannelUI(channelId);
        });

        const setChannelsPromise = this.glueController.listAllChannels()
            .then((channelContexts) => {
                const glueChannelsWithFdc3Meta = channelContexts.filter((glueChannel) => glueChannel.meta.fdc3);

                glueChannelsWithFdc3Meta.map((glueChannel: ChannelContext) => {
                    const userChannel = this.buildChannel(ChannelTypes.User, {  displayMetadata: { glueChannel }});

                    this.channelsStateStore.addFdc3IdToGlueChannelName(userChannel.id, glueChannel.name);

                    this.channelsStateStore.addUserChannel(userChannel);
                });
        });

        return setChannelsPromise;
    }

    private handleSwitchChannelUI(channelId?: string): void {
        if (channelId) {
            const isFdc3ChannelName = fdc3ChannelNames.includes(channelId);

            this.channelsStateStore.currentChannel = this.channelsStateStore.getUserChannelById(
                isFdc3ChannelName
                    ? channelId
                    : this.channelsStateStore.getFdc3ChannelIdByGlueChannelName(channelId)
            )!;
        }
    }

    private async getOrCreateAppChannel(channelId: string): Promise<Channel> {
        const exists = this.doesAppChannelExist(channelId);

        if (!exists) {
            await this.glueController.updateContext(channelId, {});
        }

        return this.buildChannel(ChannelTypes.App, { id: channelId });
    }

    private doesAppChannelExist(name: string): boolean {
        return !name.includes(PrivateChannelPrefix) && this.glueController.getAllContexts().some((ctxName: string) => ctxName === name);
    }

    private isUserChannel(channelId?: string): boolean {
        if (!channelId) {
            return false;
        }

        return !!this.channelsStateStore.userChannels[channelId];
    }

    private isPrivateChannel(channelId: string): boolean {
        return channelId.includes(PrivateChannelPrefix) && this.glueController.getAllContexts().some((ctxName: string) => ctxName === channelId);
    }

    private async tryGetAppChannel(channelId: string): Promise<Channel> {
        await this.initDonePromise;

        const exists = this.doesAppChannelExist(channelId);

        if (!exists) {
            throw new Error(ChannelError.NoChannelFound);
        }

        const appChannel = this.buildChannel(ChannelTypes.App, { id: channelId });

        return appChannel;
    }

    private buildChannel(type: string, data?: any): Channel {
        return this.channelsFactory.buildModel({ type, ...data });
    }

    private async broadcastByChannelId(channelId: string, context: Context): Promise<void> {
        const isUserChannel = this.isUserChannel(channelId);

        if (!isUserChannel) {
            return this.glueController.updateContextWithLatestFdc3Type(channelId, context);
        }
        
        const glueChannelName = this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId);
        
        return this.glueController.channelsUpdate(glueChannelName, context);
    }

    private async addContextListenerByChannelId(channelId: string, handler: ContextHandler, contextType?: string): Promise<Listener> {
        const channelType = this.getChannelTypeById(channelId);

        const subHandler = parseContextHandler(handler, contextType);

        if (channelType === ChannelTypes.User) {
            const invokedOnDesktopAgent = channelId === this.channelsStateStore.currentChannel?.id;

            /* if addContextListener is invoked on fdc3, subscribe for all channel updates. Otherwise, subscribe only for the specified channel (fallback to glueChannelName) */
            const unsubscribe = invokedOnDesktopAgent
                ? await this.glueController.channelSubscribe(subHandler)
                : await this.glueController.channelSubscribe(subHandler, this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId))

            return { unsubscribe };
        } 
        
        
        if (channelType === ChannelTypes.App) {
            const unsubscribe = await this.glueController.contextsSubscribe(channelId, subHandler);

            return { unsubscribe };
        }
        
        if (channelType === ChannelTypes.Private) {
            const contextsUnsubscribe = await this.glueController.contextsSubscribe(channelId, subHandler);
           
            await this.addContextTypeInPrivateChannelContext(channelId, contextType);

            const targetInstance = await this.getTargetedInstanceId(channelId) as string;

            const unsubscribe = () => {
                contextsUnsubscribe();
                
                this.invokeSystemMethod(targetInstance, PrivateChannelEventMethods.OnUnsubscribe, { channelId, clientId: targetInstance, contextType });
            };

            this.invokeSystemMethod(targetInstance, PrivateChannelEventMethods.OnAddContextListener, { channelId, clientId: targetInstance, contextType });

            return { unsubscribe };
        }

        throw new Error(`${ChannelError.AccessDenied} - Cannot add a context listener on an invalid channel`);
    }

    private getChannelTypeById(channelId: string): ChannelTypes {
        const isUser = this.isUserChannel(channelId);

        if (isUser) {
            return ChannelTypes.User;
        }

        const isPrivate = this.isPrivateChannel(channelId);

        if (isPrivate) {
            return ChannelTypes.Private;
        }

        const isApp = this.doesAppChannelExist(channelId);

        if (isApp) {
            return ChannelTypes.App;
        }

        throw new Error(`Channel with id: ${channelId} does not exist`);
    }

    private async getTargetedInstanceId(channelId: string): Promise<string | undefined> {
        const { clientId, creatorId } = await this.glueController.getContext(channelId);

        const myWinId = this.glueController.getMyWindowId();

        /* return if there's no client on this channel OR I'm the creator */
        if (!clientId || creatorId === myWinId) {
            return;
        }

        return clientId === myWinId ? creatorId : clientId;
    }

    private async getOtherInstanceIdFromClosedOne(channelId: string, closedInstanceId: string): Promise<string> {
        const { clientId, creatorId } = await this.glueController.getContext(channelId);

        return closedInstanceId === clientId 
            ? creatorId
            : clientId;
    }

    private invokeSystemMethod(clientId: string | undefined, action: string, payload: SystemMethodEventPayload): void {
        /* do not invoke the system method unless there's another client listening on that channel; if i'm the only client, ignore */
        if (clientId) {
            this.glueController.invokeSystemMethod({ action, payload });
        }
    }

    private async addContextTypeInPrivateChannelContext(channelId: string, contextType?: string): Promise<void> {
        const currentContext = await this.glueController.getContext(channelId);

        const updatedTypes = currentContext.contextListenerTypes ? [ ...currentContext.contextListenerTypes, contextType ] : [ contextType ];

        return this.glueController.updateContext(channelId, { ...currentContext, contextListenerTypes: updatedTypes });
    }

    private async getContextTypesForPrivateChannel(channelId: string): Promise<string[] | undefined> {
        const ctx = await this.glueController.getContext(channelId);

        return ctx.contextListenerTypes;
    }
}
