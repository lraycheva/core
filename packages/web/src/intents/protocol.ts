import { Glue42Web } from "../../web";
import { wrappedIntentFilterDecoder, intentRequestDecoder, intentResultDecoder, wrappedIntentsDecoder } from "../shared/decoders";
import { BridgeOperation } from "../shared/types";

export type IntentsOperationTypes = "getIntents" | "findIntent" | "raiseIntent";

export const operations: { [key in IntentsOperationTypes]: BridgeOperation } = {
    getIntents: { name: "getIntents", resultDecoder: wrappedIntentsDecoder },
    findIntent: { name: "findIntent", dataDecoder: wrappedIntentFilterDecoder, resultDecoder: wrappedIntentsDecoder },
    raiseIntent: { name: "raiseIntent", dataDecoder: intentRequestDecoder, resultDecoder: intentResultDecoder }
};

export interface WrappedIntentFilter {
    filter?: Glue42Web.Intents.IntentFilter;
}

export interface WrappedIntents {
    intents: Glue42Web.Intents.Intent[];
}

export interface IntentsResolverResponse {
    intent: string;
    handler: Glue42Web.Intents.IntentHandler;
}

export interface IntentsResolverResponsePromise {
    intent: string;
    methodName: string;
    promise: Promise<IntentsResolverResponse>;
    resolve: (arg: IntentsResolverResponse) => void;
    reject: (reason: string) => void;
}
