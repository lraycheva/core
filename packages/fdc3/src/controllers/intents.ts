import { Context, Listener, OpenError, AppIdentifier, AppIntent, Channel, IntentResolution, IntentResult, IntentHandler, ResolveError, ResultError } from '@finos/fdc3';
import { GlueController } from './glue';
import { Intent, IntentContext, IntentResult as GlueIntentResult} from '../types/glue42Types';
import { IntentHandler as GlueIntentHandler } from '../types/glue42Types';
import { IntentHandlerResultTypes } from '../shared/constants';
import { ChannelsFactory } from '../channels/factory';
import { extractChannelMetadata, isChannel, isChannelMetadata, isContext } from '../channels/utils';
import { ChannelsController } from '../channels/controller';

export class IntentsController {
    constructor(
        private readonly glueController: GlueController,
        private readonly channelsController: ChannelsController,
        private readonly channelsFactory: ChannelsFactory
    ) { }

    public async findIntent(intent: string, context?: Context, resultType?: string): Promise<AppIntent> {
        await this.glueController.gluePromise;

        const glueIntents = await this.glueController.findIntents({ name: intent, contextType: context?.type, resultType });

        if (glueIntents && glueIntents.length === 0) {
            throw new Error(ResolveError.NoAppsFound);
        }

        /* We will receive only one intent as they are grouped by name */
        return this.convertGlue42IntentToFDC3AppIntent(glueIntents[0]);
    }

    public async findIntentsByContext(context: Context, resultType?: string): Promise<AppIntent[]> {
        await this.glueController.gluePromise;

        const glueIntents = await this.glueController.findIntents({ contextType: context.type, resultType });

        if (typeof glueIntents !== "undefined" && glueIntents.length === 0) {
            throw new Error(ResolveError.NoAppsFound);
        }

        return glueIntents.map((glueIntent) => this.convertGlue42IntentToFDC3AppIntent(glueIntent));
    }

    public async raiseIntent(intent: string, context: Context, target?: string | AppIdentifier): Promise<IntentResolution> {
        await this.glueController.gluePromise;

        /* target not provided => reuse (@glue42/web takes care of starting a new instance if there isn't a running one)
           target provided & no running instance => target app
           target provided & there is a running instance => target instance */
        let glueTarget: "startNew" | "reuse" | { app?: string; instance?: string } = "reuse";

        if (typeof target !== "undefined") {
            const name = typeof target === "object" ? target.appId : target;
            const app = this.glueController.getApplication(name);

            if (!app) {
                throw new Error(OpenError.AppNotFound);
            }

            const appInstances = app.instances;

            if (appInstances.length === 0) {
                glueTarget = { app: name };
            } else {
                /* Issue with the FDC3 specification: there is no instance targeting */
                glueTarget = { instance: appInstances[0].id };
            }
        }

        const glue42Context = {
            type: context.type,
            data: {
                ...context
            }
        };
    
        const intentRequest = {
            intent,
            context: glue42Context,
            target: glueTarget
        };

        const glueIntentResult = await this.glueController.raiseIntent(intentRequest);

        return {
            source: {
                appId: glueIntentResult.handler.applicationName,
                instanceId: glueIntentResult.handler.instanceId
            },
            intent,
            getResult: (() => this.getResult(glueIntentResult)).bind(this)
        };
    }

    public async raiseIntentForContext(context: Context, target?: string | AppIdentifier): Promise<IntentResolution> {
        await this.glueController.gluePromise;

        const appIntents: AppIntent[] = await this.findIntentsByContext(context);

        if (!appIntents || appIntents.length === 0) {
            throw new Error(ResolveError.NoAppsFound);
        }

        return this.raiseIntent(appIntents[0].intent.name, context, target);
    }

    public async addIntentListener(intent: string, handler: IntentHandler): Promise<Listener> {
        await this.glueController.gluePromise;

        const wrappedHandler = this.getWrappedIntentHandler(handler);
    
         return this.glueController.addIntentListener(intent, wrappedHandler);
    }

    private async getResult(glueIntentResult: GlueIntentResult): Promise<IntentResult> {
        const { result } = glueIntentResult;

        const isResultChannelMetadata = isChannelMetadata(result);

        if (!isResultChannelMetadata) {
            return result;
        }

        const { clientId, creatorId } = await this.glueController.getContext(result.id);

        if (clientId) {
            /* Private channels are created to support secure communication between two applications */
            throw new Error(`${ResultError.NoResultReturned} - There are already two parties on this private channel`);
        }

        const channel = this.channelsFactory.buildModel(result);

        const myWinId = this.glueController.getMyWindowId();

        if (myWinId && myWinId !== creatorId) {
            await this.channelsController.addClientToPrivateChannel(channel.id, myWinId);
        }

        return channel;

    }

    private convertGlue42IntentToFDC3AppIntent = (glueIntent: Intent): AppIntent => {
        const { name, handlers } = glueIntent;

        const appIntents = handlers.filter((handler) => handler.type === "app");

        const dynamicInstanceIntents = handlers.filter((handler) => handler.type === "instance" && !appIntents.some((appIntent) => appIntent.applicationName === handler.applicationName));
        /* Ignore instance handlers that aren't dynamic */
        const handlersToUse = [...appIntents, ...dynamicInstanceIntents];
    
        const appIntent: AppIntent = {
            /* Issue with the FDC3 specification: there are multiple displayNames */
            intent: { name, displayName: handlers[0].displayName || "" },
            apps: handlersToUse.map((handler: GlueIntentHandler) => {
                const appName = handler.applicationName;
                const app = this.glueController.getApplication(appName);
    
                return {
                    appId: appName,
                    instanceId: handler.instanceId,
                    name: appName,
                    title: handler.applicationTitle || handler.instanceTitle || appName,
                    tooltip: app?.userProperties.tooltip || `${appName} (${handler.type})`,
                    description: handler.applicationDescription,
                    icons: handler.applicationIcon ? [handler.applicationIcon, ...(app?.userProperties.icons || [])] : app?.userProperties.icons,
                    images: app?.userProperties.images
                };
            })
        };
    
        return appIntent;
    }

    private getResultType(data: any): IntentHandlerResultTypes {
        if (isChannel(data)) {
            return IntentHandlerResultTypes.Channel;
        }
        
        if (isContext(data)) {
            return IntentHandlerResultTypes.Context;
        }
   
        throw new Error("Async handler function should return a promise that resolves to a Context or Channel");
    }

    private getWrappedIntentHandler(handler: IntentHandler): (context: IntentContext) => any {
        const wrappedHandler = async (glue42Context: IntentContext): Promise<any> => {
            const handlerResult = await handler({ ...glue42Context.data, type: glue42Context.type || "" });

            if (!handlerResult) {
                return;
            }

            const handlerResultType = this.getResultType(handlerResult);

            return handlerResultType === IntentHandlerResultTypes.Channel
                ? extractChannelMetadata(handlerResult as Channel)
                : handlerResult as Context;
        };

        return wrappedHandler;
    }
}
