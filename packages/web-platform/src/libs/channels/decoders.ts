import { anyJson, constant, Decoder, object, oneOf, optional } from 'decoder-validate';
import { nonEmptyStringDecoder } from '../../shared/decoders';

type ChannelContext = { name: string, meta: { color: string }, data?: any };

export type ChannelOperationTypes = "addChannel" | "operationCheck";

export const channelOperationDecoder: Decoder<ChannelOperationTypes> = oneOf<"addChannel" | "operationCheck">(
    constant("addChannel"),
    constant("operationCheck")
);

export const channelContextDecoder: Decoder<ChannelContext> = object({
    name: nonEmptyStringDecoder,
    meta: object({
        color: nonEmptyStringDecoder
    }),
    data: optional(anyJson()),
});