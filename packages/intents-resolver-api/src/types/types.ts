import { InvocationResult, UnsubscribeFunction } from './glue';

export type IntentsResolverFactoryFunction = (glue: any) => Promise<void>;

export interface IntentsResolver {
    intent: string;
    sendResponse(handler: ResolverIntentHandler): Promise<InvocationResult | undefined>;
    onHandlerAdded(callback: (handler: ResolverIntentHandler) => void): UnsubscribeFunction;
    onHandlerRemoved(callback: (handler: ResolverIntentHandler) => void): UnsubscribeFunction;
}

export interface ResolverIntentHandler {
    applicationName?: string;
    applicationIcon?: string;
    instanceId?: string;
}

export interface IntentResolverResponse {
    intent: string;
    handlers: ResolverIntentHandler[];
}
