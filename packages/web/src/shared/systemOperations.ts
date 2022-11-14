import { operationCheckConfigDecoder, operationCheckResultDecoder, simpleItemIdDecoder, workspaceFrameBoundsResultDecoder } from "./decoders";
import { BridgeOperation } from "./types";

export type SystemOperationTypes = "operationCheck" | "getWorkspaceWindowFrameBounds";

export const systemOperations: { [key in SystemOperationTypes]: BridgeOperation } = {
    operationCheck: { name: "operationCheck", dataDecoder: operationCheckConfigDecoder, resultDecoder: operationCheckResultDecoder },
    getWorkspaceWindowFrameBounds: { name: "getWorkspaceWindowFrameBounds", resultDecoder: workspaceFrameBoundsResultDecoder, dataDecoder: simpleItemIdDecoder }
};
