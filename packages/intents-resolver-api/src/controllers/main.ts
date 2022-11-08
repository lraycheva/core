import { IntentHandlerDecoder } from '../shared/decoders';
import { Intent, IntentHandler, InvocationResult, RemovedIntentHandler, UnsubscribeFunction } from '../types/glue';
import { IntentsResolver } from '../types/types';
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

    private async sendResponse(args: IntentHandler): Promise<InvocationResult | undefined> {
        const handler = IntentHandlerDecoder.runWithException(args);

        return this.glueController.sendInteropMethodResponse(handler);
    }

    private onHandlerAdded(callback: (handler: IntentHandler) => void): UnsubscribeFunction {
        const unsubFromAppAdded = this.glueController.subscribeOnAppAdded(callback);

        const unsubFromInstanceStarted = this.glueController.subscribeOnInstanceStarted(callback);

        return () => {
            unsubFromAppAdded();

            unsubFromInstanceStarted();
        };
    }

    private onHandlerRemoved(callback: (handler: RemovedIntentHandler) => void): UnsubscribeFunction {
        const unsubFromInstanceStopped = this.glueController.subscribeOnInstanceStopped(callback);

        const unsubFromAppRemoved = this.glueController.subscribeOnAppRemoved(callback);

        return () => {
            unsubFromInstanceStopped();

            unsubFromAppRemoved();
        };
    }
}
