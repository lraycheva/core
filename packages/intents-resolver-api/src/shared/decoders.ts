import { Decoder, string, object, optional } from "decoder-validate";
import { SharedContext } from '../types/glue';
import { ResolverIntentHandler } from '../types/types';

export const nonEmptyStringDecoder: Decoder<string> = string().where((s) => s.length > 0, "Expected a non-empty string");

export const StartContextDecoder: Decoder<SharedContext> = object({
    callerId: nonEmptyStringDecoder,
    intent: nonEmptyStringDecoder,
    methodName: nonEmptyStringDecoder
});

export const IntentHandlerDecoder: Decoder<ResolverIntentHandler> = object({
    applicationName: string(),
    applicationIcon: optional(string()),
    instanceId: optional(string()),
});
