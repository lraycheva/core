import { IntentHandler, InvocationResult, RemovedIntentHandler, UnsubscribeFunction } from './glue';

export type IntentsResolverFactoryFunction = (glue: any) => Promise<void>;

export interface IntentsResolver {
    intent: string;
    sendResponse(): Promise<InvocationResult | undefined>;
    onHandlerAdded(callback: (handler: IntentHandler) => void): UnsubscribeFunction;
    onHandlerRemoved(callback: (handler: RemovedIntentHandler) => void): UnsubscribeFunction;
}

export interface IntentResolverResponse {
    intent: string;
    handlers: IntentHandler[];
}
