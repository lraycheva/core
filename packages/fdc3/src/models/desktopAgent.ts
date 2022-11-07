import { Context, Listener, ImplementationMetadata, AppIdentifier, AppMetadata, Channel, AppIntent, IntentResolution, IntentHandler, ContextHandler, DesktopAgent as Fdc3DesktopAgent, OpenError, ChannelError } from '@finos/fdc3'
import { IntentsController } from '../controllers/intents';
import { ApplicationsController } from '../controllers/applications';
import { appIdentifierDecoder, contextDecoder, optionalNonEmptyStringDecoder, nonEmptyStringDecoder, optionalAppIdentifier, optionalContextDecoder, optionalTargetApp, targetAppDecoder } from '../shared/decoder';
import { ChannelsController } from '../channels/controller';
export class DesktopAgent {
    constructor(
        private readonly intentsController: IntentsController,
        private readonly applicationController: ApplicationsController,
        private readonly channelsController: ChannelsController
    ) { }

    public toApi(): Fdc3DesktopAgent {
        const api: Fdc3DesktopAgent = {
            addContextListener: this.addContextListener.bind(this),
            addIntentListener: this.addIntentListener.bind(this),
            broadcast: this.broadcast.bind(this),
            createPrivateChannel: this.createPrivateChannel.bind(this),
            findInstances: this.findInstances.bind(this),
            findIntent: this.findIntent.bind(this),
            findIntentsByContext: this.findIntentsByContext.bind(this),
            getAppMetadata: this.getAppMetadata.bind(this),
            getCurrentChannel: this.getCurrentChannel.bind(this),
            getInfo: this.getInfo.bind(this),
            getOrCreateChannel: this.getOrCreateChannel.bind(this),
            getSystemChannels: this.getSystemChannels.bind(this),
            getUserChannels: this.getSystemChannels.bind(this),
            joinChannel: this.joinChannel.bind(this),
            joinUserChannel: this.joinUserChannel.bind(this),
            leaveCurrentChannel: this.leaveCurrentChannel.bind(this),
            open: this.open.bind(this) as { (target: AppIdentifier, context?: Context): Promise<AppIdentifier>; (target: string, context?: Context): Promise<AppIdentifier> },
            raiseIntent: this.raiseIntent.bind(this) as { (intent: string, context: Context, app?: AppIdentifier): Promise<IntentResolution>; (intent: string, context: Context, name?: String): Promise<IntentResolution>},
            raiseIntentForContext: this.raiseIntentForContext.bind(this) as { (context: Context, app?: AppIdentifier | undefined): Promise<IntentResolution>; (context: Context, name: String): Promise<IntentResolution>},
        };

        return Object.freeze(api);
    }

    // apps 
    
    private async open(target: string | AppIdentifier, context?: Context): Promise<AppIdentifier> {
        targetAppDecoder.runWithException(target);

        optionalContextDecoder.runWithException(context);

        return this.applicationController.open(target, context);
    }

    private async findInstances(app: AppIdentifier): Promise<AppIdentifier[]> {
        appIdentifierDecoder.runWithException(app);

        return this.applicationController.findInstances(app);
    }

    private async getAppMetadata(app: AppIdentifier): Promise<AppMetadata> {
        appIdentifierDecoder.runWithException(app);

        return this.applicationController.getAppMetadata(app);
    }

    private async getInfo(): Promise<ImplementationMetadata> {
        return this.applicationController.getInfo();
    }
  
    // context

    private async broadcast(context: Context): Promise<void> {
        contextDecoder.runWithException(context);

        return this.channelsController.broadcast(context);
    }

    private async addContextListener(contextType: string | null | ContextHandler, handler?: ContextHandler): Promise<Listener> {
        /* deprecated addContextListener(handler); */
        if (arguments.length === 1) {
            if (typeof contextType !== "function") {
                throw new Error("Please provide the handler as a function!");
            }

            return this.channelsController.addContextListener(contextType);
        }

        const contextTypeDecoder = optionalNonEmptyStringDecoder.runWithException(contextType);

        if (typeof handler !== "function") {
            throw new Error("Please provide the handler as a function!");
        }

        return this.channelsController.addContextListener(handler, contextTypeDecoder);
    }

    // intents

    private async findIntent(intent: string, context?: Context, resultType?: string): Promise<AppIntent> {
        nonEmptyStringDecoder.runWithException(intent);

        const contextDecoderResult = optionalContextDecoder.run(context);

        if (!contextDecoderResult.ok) {
            throw new Error(`Invalid Context: ${contextDecoderResult.error}`);
        }

        optionalNonEmptyStringDecoder.runWithException(resultType);

        return this.intentsController.findIntent(intent, contextDecoderResult.result, resultType);
    }

    private async findIntentsByContext(context: Context, resultType?: string): Promise<AppIntent[]> {
        const contextDecoderResult = contextDecoder.run(context);
        
        if (!contextDecoderResult.ok) {
            throw new Error(`Invalid Context: ${contextDecoderResult.error}`);
        }

        optionalNonEmptyStringDecoder.runWithException(resultType);

        return this.intentsController.findIntentsByContext(contextDecoderResult.result, resultType);
    }

    private async raiseIntent(intent: string, context: Context, app?: string | AppIdentifier): Promise<IntentResolution> {
        nonEmptyStringDecoder.runWithException(intent);

        contextDecoder.runWithException(context);
        
        optionalAppIdentifier.runWithException(app);

        return this.intentsController.raiseIntent(intent, context, app);
    }

    private async raiseIntentForContext(context: Context, app?: string | AppIdentifier): Promise<IntentResolution> {
        contextDecoder.runWithException(context);
        optionalTargetApp.runWithException(app);

        return this.intentsController.raiseIntentForContext(context, app);
    }

    private async addIntentListener(intent: string, handler: IntentHandler): Promise<Listener> {
        nonEmptyStringDecoder.runWithException(intent);

        if (typeof handler !== "function") {
            throw new Error("Please provide the handler as a function!");
        }

        return this.intentsController.addIntentListener(intent, handler);
    }

    // channels
    private async getOrCreateChannel(channelId: string): Promise<Channel> {
        nonEmptyStringDecoder.runWithException(channelId);

        return this.channelsController.getOrCreateChannel(channelId);
    }

    private async getSystemChannels(): Promise<Channel[]> {
        return this.channelsController.getUserChannels();
    }

    private async joinChannel(channelId: string): Promise<void> {
        nonEmptyStringDecoder.runWithException(channelId);

        return this.channelsController.joinChannel(channelId);
    }

    private async joinUserChannel(channelId: string): Promise<void> {
        nonEmptyStringDecoder.runWithException(channelId);

        return this.channelsController.joinUserChannel(channelId);
    }

    private async getCurrentChannel(): Promise<Channel | null> {
        return this.channelsController.getCurrentChannel();
    }

    private async leaveCurrentChannel(): Promise<void> {
        return this.channelsController.leaveCurrentChannel();
    }

    private async createPrivateChannel(): Promise<any> {
        return this.channelsController.createPrivateChannel();
    }
}