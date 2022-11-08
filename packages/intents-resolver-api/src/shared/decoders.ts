import { Decoder, string, object, optional, array, oneOf, constant } from "decoder-validate";
import { IntentHandler, SharedContext } from '../types/glue';

export const nonEmptyStringDecoder: Decoder<string> = string().where((s) => s.length > 0, "Expected a non-empty string");

export const StartContextDecoder: Decoder<SharedContext> = object({
    callerId: nonEmptyStringDecoder,
    intent: nonEmptyStringDecoder,
    methodName: nonEmptyStringDecoder
});

export const IntentHandlerDecoder: Decoder<IntentHandler> = object({
    applicationName: nonEmptyStringDecoder,
    applicationTitle: string(),
    applicationDescription: optional(string()),
    applicationIcon: optional(string()),
    type: oneOf<"app" | "instance">(constant("app"), constant("instance")),
    displayName: optional(string()),
    contextTypes: optional(array(nonEmptyStringDecoder)),
    instanceId: optional(string()),
    instanceTitle: optional(string()),
    resultType: optional(string())
});
