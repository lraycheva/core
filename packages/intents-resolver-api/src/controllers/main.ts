import { IntentHandlerDecoder } from '../shared/decoders';
import { InvocationResult, UnsubscribeFunction } from '../types/glue';
import { IntentsResolver, ResolverIntentHandler } from '../types/types';
import { GlueController } from './glue';

export class MainController {
    constructor(private readonly glueController: GlueController) { }

    public toApi(): IntentsResolver {
        const api = {
            intent: this.glueController.intent,
            sendResponse: this.sendResponse.bind(this),
            onHandlerAdded: this.onHandlerAdded.bind(this),
            onHandlerRemoved: this.onHandlerRemoved.bind(this),
        };

        return Object.freeze(api) as IntentsResolver;
    }

    private async sendResponse(args: ResolverIntentHandler): Promise<InvocationResult | undefined> {
        const handler = IntentHandlerDecoder.runWithException(args);

        if (!handler.applicationName && !handler.instanceId) {
            throw new Error(`Handler must have either applicationName or instanceId property`);
        }

        return this.glueController.sendInteropMethodResponse(handler);
    }

    private onHandlerAdded(callback: (handler: ResolverIntentHandler) => void): UnsubscribeFunction {
        const unsubFromAppAdded = this.glueController.subscribeOnAppAdded(callback);

        const unsubFromServerMethodAdded = this.glueController.subscribeForServerMethodAdded(callback);

        return () => {
            unsubFromAppAdded();

            unsubFromServerMethodAdded();
        };
    }

    private onHandlerRemoved(callback: (handler: ResolverIntentHandler) => void): UnsubscribeFunction {
        const unsubFromServerMethodRemoved = this.glueController.subscribeForServerMethodRemoved(callback);

        const unsubFromAppRemoved = this.glueController.subscribeOnAppRemoved(callback);

        return () => {
            unsubFromServerMethodRemoved();

            unsubFromAppRemoved();
        };
    }
}
