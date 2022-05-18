/* eslint-disable @typescript-eslint/no-explicit-any */
import { METHODS, webPlatformMethodName, webPlatformWspStreamName } from "./constants";
import { promisePlus } from "../shared/promisePlus";
import { WorkspaceEventType } from "../types/subscription";
import { InteropAPI, Subscription, InvocationResult } from "../types/glue";
import { Glue42Core } from "@glue42/core";

export class InteropTransport {

    private readonly defaultTransportTimeout: number = 30000;
    private coreEventMethodInitiated = false;
    private corePlatformSubPromise: Promise<Glue42Core.Interop.Subscription>;

    constructor(private readonly agm: InteropAPI) { }

    public async initiate(actualWindowId: string): Promise<void> {

        if (window.glue42gd) {
            await Promise.all(
                Object.values(METHODS).map((method) => {

                    return this.verifyMethodLive(method.name);
                })
            );

            return;
        }

        const systemId = (window as any).glue42core.communicationId;

        await Promise.all([
            this.verifyMethodLive(webPlatformMethodName, systemId),
            this.verifyMethodLive(webPlatformWspStreamName, systemId)
        ]);

        await this.transmitControl("frameHello", { windowId: actualWindowId });
    }

    public coreSubscriptionReady(eventCallback: (args?: any) => void): Promise<Glue42Core.Interop.Subscription> {
        if (!this.coreEventMethodInitiated) {
            this.subscribePlatform(eventCallback);
        }
        return this.corePlatformSubPromise;
    }

    public subscribePlatform(eventCallback: (args?: any) => void): void {
        this.coreEventMethodInitiated = true;

        const systemId = (window as any).glue42core.communicationId;

        this.corePlatformSubPromise = this.agm.subscribe(webPlatformWspStreamName, systemId ? { target: { instance: systemId } } : undefined);

        this.corePlatformSubPromise
            .then((sub) => {
                sub.onData((data) => eventCallback(data.data));
            });
    }

    public async subscribe(streamName: string, streamBranch: string, streamType: WorkspaceEventType): Promise<Subscription> {

        const subscriptionArgs = {
            branch: streamBranch,
            type: streamType
        };

        let subscription: Subscription;

        try {
            subscription = await this.agm.subscribe(streamName, { arguments: subscriptionArgs });
        } catch (error) {
            const message = `Internal subscription error! Error details: stream - ${streamName}, branch: ${streamBranch}. Internal message: ${error.message}`;
            throw new Error(message);
        }

        return subscription;
    }

    public async transmitControl(operation: string, operationArguments: any): Promise<any> {

        const invocationArguments = window.glue42gd ? { operation, operationArguments } : { operation, domain: "workspaces", data: operationArguments };
        const methodName = window.glue42gd ? METHODS.control.name : webPlatformMethodName;

        const platformTarget = window.glue42gd ? undefined : (window as any).glue42core.communicationId;

        let invocationResult: InvocationResult<any>;
        const baseErrorMessage = `Internal Workspaces Communication Error. Attempted operation: ${JSON.stringify(invocationArguments)}. `;

        // using the 0 index of the errors and values collections, because we expect only one server and
        // this is to safeguard in case in future we decide to deprecate the default returned/message properties in favor of using only collections
        try {
            invocationResult = await this.agm.invoke(methodName, invocationArguments, platformTarget ? { instance: platformTarget } : "best", { methodResponseTimeoutMs: this.defaultTransportTimeout });

            if (!invocationResult) {
                throw new Error("Received unsupported result from GD - empty result");
            }

            if (!Array.isArray(invocationResult.all_return_values) || invocationResult.all_return_values.length === 0) {
                throw new Error("Received unsupported result from GD - empty values collection");
            }

        } catch (error) {
            if (error && error.all_errors && error.all_errors.length) {
                // IMPORTANT: Do NOT change the `Inner message:` string, because it is used by other programs to extract the inner message of a communication error
                const invocationErrorMessage = error.all_errors[0].message;
                throw new Error(`${baseErrorMessage} -> Inner message: ${invocationErrorMessage}`);

            }
            // IMPORTANT: Do NOT change the `Inner message:` string, because it is used by other programs to extract the inner message of a communication error
            throw new Error(`${baseErrorMessage} -> Inner message: ${error.message}`);
        }

        return invocationResult.all_return_values[0].returned;
    }

    private verifyMethodLive(name: string, systemId?: string): Promise<void> {
        return promisePlus(() => {
            return new Promise((resolve) => {
                const hasMethod = this.agm.methods().some((method) => {
                    const nameMatch = method.name === name;
    
                    const serverMatch = systemId ?
                        method.getServers().some((server) => server.instance === systemId) :
                        true;
    
                    return nameMatch && serverMatch;
                });

                if (hasMethod) {
                    resolve();
                    return;
                }

                const unSub = this.agm.serverMethodAdded((data) => {
                    const method = data.method;
                    const server = data.server;
    
                    const serverMatch = systemId ?
                        server.instance === systemId :
                        true;
    
                    if (method.name === name && serverMatch) {
                        unSub();
                        resolve();
                    }
                });
            });
        }, 15000, "Timeout waiting for the Workspaces communication channels");
    }
}
