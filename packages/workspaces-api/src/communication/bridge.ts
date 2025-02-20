import { CallbackRegistry, UnsubscribeFunction } from "callback-registry";
import { SubscriptionConfig, ActiveSubscription, WorkspaceEventType, WorkspaceEventAction, WorkspacePayload, WorkspaceEventScope, PendingSubscription } from "../types/subscription";
import { ClientOperations, CLIENT_OPERATIONS, STREAMS } from "./constants";
import { OPERATIONS } from "./constants";
import { eventTypeDecoder, streamRequestArgumentsDecoder, workspaceEventActionDecoder } from "../shared/decoders";
import { Glue42Workspaces } from "../../workspaces";
import { InteropTransport } from "./interop-transport";
import { Glue42Core } from "@glue42/core";
import { PromiseWrapper } from "../shared/promiseWrapper";

export class Bridge {

    private readonly activeSubscriptions: ActiveSubscription[] = [];
    private readonly pendingSubScriptions: PendingSubscription[] = [];

    constructor(
        private readonly transport: InteropTransport,
        private readonly registry: CallbackRegistry
    ) { }

    public async createCoreEventSubscription(): Promise<void> {
        await this.transport.coreSubscriptionReady(this.handleCoreEvent.bind(this));
    }

    public handleCoreSubscription(config: SubscriptionConfig): UnsubscribeFunction {
        const registryKey = `${config.eventType}-${config.action}`;
        const scope = config.scope;
        const scopeId = config.scopeId;

        return this.registry.add(registryKey, (args) => {
            const scopeConfig = {
                type: scope,
                id: scopeId
            };

            const receivedIds = {
                frame: args.frameSummary?.id || args.windowSummary?.config.frameId,
                workspace: args.workspaceSummary?.id || args.windowSummary?.config.workspaceId,
                container: args.containerSummary?.itemId,
                window: args.windowSummary?.itemId
            };

            const shouldInvokeCallback = this.checkScopeMatch(scopeConfig, receivedIds);

            if (!shouldInvokeCallback) {
                return;
            }

            config.callback(args);
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async send<T>(operationName: string, operationArgs?: any): Promise<T> {

        const operationDefinition = Object.values(OPERATIONS).find((operation) => operation.name === operationName);

        if (!operationDefinition) {
            throw new Error(`Cannot find definition for operation name: ${operationName}`);
        }

        if (operationDefinition.argsDecoder) {
            try {
                operationDefinition.argsDecoder.runWithException(operationArgs);
            } catch (error) {
                throw new Error(`Unexpected internal outgoing validation error: ${error.message}, for input: ${JSON.stringify(error.input)}, for operation ${operationName}`);
            }
        }

        try {
            const operationResult = await this.transport.transmitControl(operationDefinition.name, operationArgs);

            operationDefinition.resultDecoder.runWithException(operationResult);

            return operationResult;
        } catch (error) {
            if (error.kind) {
                throw new Error(`Unexpected internal incoming validation error: ${error.message}, for input: ${JSON.stringify(error.input)}, for operation ${operationName}`);
            }
            throw new Error(error.message);
        }
    }

    public async subscribe(config: SubscriptionConfig): Promise<Glue42Workspaces.Unsubscribe> {
        const pendingSub = this.getPendingSubscription(config);
        if (pendingSub) {
            await pendingSub.promise;
        }

        let activeSub = this.getActiveSubscription(config);
        const registryKey = this.getRegistryKey(config);

        if (!activeSub) {
            const pendingPromise = new PromiseWrapper<void>();
            const pendingSubscription = {
                streamType: config.eventType,
                level: config.scope,
                levelId: config.scopeId,
                promise: pendingPromise.promise
            };
            this.pendingSubScriptions.push(pendingSubscription);
            try {
                const stream = STREAMS[config.eventType];
                const gdSub = await this.transport.subscribe(stream.name, this.getBranchKey(config), config.eventType);

                gdSub.onData((streamData) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const data = streamData.data as { action: string; payload: any };

                    // important to decode without exception, because we do not want to throw an exception here
                    const requestedArgumentsResult = streamRequestArgumentsDecoder.run(streamData.requestArguments);
                    const actionResult = workspaceEventActionDecoder.run(data.action);

                    if (!requestedArgumentsResult.ok || !actionResult.ok) {
                        return;
                    }

                    const streamType = requestedArgumentsResult.result.type;
                    const branch = requestedArgumentsResult.result.branch;

                    const keyToExecute = `${streamType}-${branch}-${actionResult.result}`;
                    const validatedPayload = STREAMS[streamType].payloadDecoder.run(data.payload);
                    if (!validatedPayload.ok) {
                        return;
                    }

                    this.registry.execute(keyToExecute, validatedPayload.result);
                });

                activeSub = {
                    streamType: config.eventType,
                    level: config.scope,
                    levelId: config.scopeId,
                    callbacksCount: 0,
                    gdSub
                };

                this.activeSubscriptions.push(activeSub);

                pendingPromise.resolve();
            } catch (error) {
                pendingPromise.reject(error);

                throw error;
            } finally {
                this.removePendingSubscription(pendingSubscription);
            }

        }

        const unsubscribe = this.registry.add(registryKey, config.callback);

        ++activeSub.callbacksCount;

        return (): void => {
            unsubscribe();

            --activeSub.callbacksCount;

            if (activeSub.callbacksCount === 0) {
                activeSub.gdSub.close();
                this.activeSubscriptions.splice(this.activeSubscriptions.indexOf(activeSub), 1);
            }
        };
    }

    public onOperation(callback: (operation: ClientOperations, caller: Glue42Core.Interop.Instance) => void) {

        const wrappedCallback = (payload: ClientOperations, caller: Glue42Core.Interop.Instance) => {
            const operationName = payload.operation;
            const operationArgs = payload.data;
            const operationDefinition = Object.values(CLIENT_OPERATIONS).find((operation) => operation.name === operationName);

            if (!operationDefinition) {
                throw new Error(`Cannot find definition for operation name: ${operationName}`);
            }

            if (operationDefinition.argsDecoder) {
                try {
                    operationDefinition.argsDecoder.runWithException(operationArgs);
                } catch (error) {
                    throw new Error(`Unexpected internal outgoing validation error: ${error.message}, for input: ${JSON.stringify(error.input)}, for operation ${operationName}`);
                }
            }

            callback(payload, caller);
        }
        return this.transport.onInternalMethodInvoked("control", wrappedCallback)
    }

    private checkScopeMatch(scope: { type: WorkspaceEventScope; id?: string }, receivedIds: { frame: string; workspace: string; container: string; window: string }): boolean {

        if (scope.type === "global") {
            return true;
        }

        if (scope.type === "frame" && scope.id === receivedIds.frame) {
            return true;
        }

        if (scope.type === "workspace" && scope.id === receivedIds.workspace) {
            return true;
        }

        if (scope.type === "container" && scope.id === receivedIds.container) {
            return true;
        }

        if (scope.type === "window" && scope.id === receivedIds.window) {
            return true;
        }

        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private handleCoreEvent(args: any): void {
        const data = args.data;
        try {
            const verifiedAction: WorkspaceEventAction = workspaceEventActionDecoder.runWithException(data.action);
            const verifiedType: WorkspaceEventType = eventTypeDecoder.runWithException(data.type);
            const verifiedPayload: WorkspacePayload = STREAMS[verifiedType].payloadDecoder.runWithException(data.payload);

            const registryKey = `${verifiedType}-${verifiedAction}`;

            this.registry.execute(registryKey, verifiedPayload);
        } catch (error) {
            console.warn(`Cannot handle event with data ${JSON.stringify(data)}, because of validation error: ${error.message}`);
        }
    }

    private getBranchKey(config: SubscriptionConfig): string {
        return config.scope === "global" ? config.scope : `${config.scope}_${config.scopeId}`;
    }

    private getRegistryKey(config: SubscriptionConfig): string {
        return `${config.eventType}-${this.getBranchKey(config)}-${config.action}`;
    }

    private getActiveSubscription(config: SubscriptionConfig): ActiveSubscription {
        return this.activeSubscriptions
            .find((activeSub) => activeSub.streamType === config.eventType &&
                activeSub.level === config.scope &&
                activeSub.levelId === config.scopeId
            );
    }

    private getPendingSubscription(config: SubscriptionConfig): PendingSubscription {
        return this.pendingSubScriptions
            .find((activeSub) => activeSub.streamType === config.eventType &&
                activeSub.level === config.scope &&
                activeSub.levelId === config.scopeId
            );
    }

    private removePendingSubscription(pendingSubscription: PendingSubscription): void {
        const index = this.pendingSubScriptions.indexOf(pendingSubscription);

        if (index >= 0) {
            this.pendingSubScriptions.splice(index, 1);
        }
    }
}
