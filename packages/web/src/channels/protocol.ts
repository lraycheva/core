import { channelContextDecoder } from '../shared/decoders';
import { BridgeOperation } from '../shared/types';

export type ChannelOperationTypes = "addChannel";

export const operations: { [key in ChannelOperationTypes]: BridgeOperation } = {
    addChannel: { name: "addChannel", dataDecoder: channelContextDecoder },
}
