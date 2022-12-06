import { ENTERPRISE_NO_APP_NAME, GLUE42_FDC3_INTENTS_METHOD_PREFIX } from '../shared/constants';
import { StartContextDecoder } from '../shared/decoders';
import { validateGlue } from '../shared/utils';
import { AppDefinitionInGD, Application, Glue42, Intent, IntentHandler, InvocationResult, UnsubscribeFunction } from '../types/glue';
import { ResolverIntentHandler } from '../types/types';

export class GlueController {
    private glue!: Glue42;

    private _intent!: string;
    private _callerId!: string;
    private _methodName!: string;

    public async initialize(glue: Glue42) {
        validateGlue(glue);

        this.glue = glue;

        const context = await this.glue.windows.my().getContext();

        StartContextDecoder.runWithException(context);

        this._intent = context.intent;
        this._callerId = context.callerId;
        this._methodName = context.methodName;
    }

    public get intent(): string {
        return this._intent;
    }

    public async sendInteropMethodResponse(handler: ResolverIntentHandler): Promise<InvocationResult | undefined> {
        const extendedHandler = await this.getIntentHandler(handler);

        const methodIsRegistered = this.isMethodRegistered();

        if (!this.isInstanceStillRunning()) {
            this.glue.windows.my().close();
            return;
        }

        if (!methodIsRegistered) {
            return this.waitForResponseMethodAdded(extendedHandler);
        }

        return this.glue.interop.invoke(this._methodName, { intent: this.intent, handler: extendedHandler }, { instance: this._callerId });
    }

    public subscribeForServerMethodAdded(callback: (handler: ResolverIntentHandler) => void): UnsubscribeFunction {
        return this.glue.interop.serverMethodAdded(({ server, method }) => {
            const isMethodForCurrentIntent = this.checkIfMethodIsForCurrentIntent(method.name);

            if (!isMethodForCurrentIntent) {
                return;
            }

            const builtHandler = this.buildIntentHandler(server.applicationName, server.instance);

            callback(builtHandler);
        });
    }

    public subscribeForServerMethodRemoved(callback: (handler: ResolverIntentHandler) => void): UnsubscribeFunction {
        return this.glue.interop.serverMethodRemoved(({ server, method }) => {
            const isMethodForCurrentIntent = this.checkIfMethodIsForCurrentIntent(method.name);

            if (!isMethodForCurrentIntent) {
                return;
            }

            const builtInstance = this.buildIntentHandler(server.applicationName, server.instance);

            callback(builtInstance);
        });
    }

    public subscribeOnAppAdded(callback: (handler: ResolverIntentHandler) => void): UnsubscribeFunction {
        return this.glue.appManager.onAppAdded(async (app: Application) => {
            const isIntentHandler = await this.checkIfIntentHandler(app);

            if (!isIntentHandler) {
                return;
            }

            const builtHandler = this.buildIntentHandler(app.name);

            callback(builtHandler);
        });
    }

    public subscribeOnAppRemoved(callback: (handler: ResolverIntentHandler) => void): UnsubscribeFunction {
        return this.glue.appManager.onAppRemoved(async (app: Application) => {
            const isIntentHandler = await this.checkIfIntentHandler(app);

            if (!isIntentHandler) {
                return;
            }

            const builtHandler = this.buildIntentHandler(app.name);

            callback(builtHandler);
        });
    }

    private waitForResponseMethodAdded(handler: ResolverIntentHandler): Promise<InvocationResult> {
        const responsePromise: Promise<InvocationResult> = new Promise((resolve, reject) => {
            const unsub = this.glue.interop.serverMethodAdded(async ({ server, method }) => {
                if (server.instance !== this._callerId || method.name !== this._methodName) {
                    return;
                }

                try {
                    const invocationRes = await this.glue.interop.invoke(this._methodName, { intent: this.intent, handler }, { instance: this._callerId });
                    resolve(invocationRes);
                } catch (error) {
                    reject(error);
                }

                if (unsub) {
                    unsub();
                }
            });
        });

        return responsePromise;
    }

    private async checkIfIntentHandler(app: Application): Promise<boolean> {
        if ((window as any).glue42core && (window as any).glue42core.webStarted) {
            return !!app.userProperties.intents?.find((intent: Intent) => intent.name === this.intent);
        }

        if ((window as any).glue42gd) {
            const apps = await this.getAppDefinitionsInGD();

            return !!apps?.find(appDef => appDef.name === app.name && appDef.intents?.find(intent => intent.name === this.intent));
        }

        return false;
    }

    private async getAppDefinitionsInGD(): Promise<AppDefinitionInGD[] | undefined> {
        try {
            const result = await this.glue.interop.invoke("T42.ACS.GetApplications", { withIntentsInfo: true });
            return result.returned.applications;
        } catch (error) {
            return;
        }
    }

    private buildIntentHandler(appName: string, instanceId?: string): ResolverIntentHandler {
        const foundApp = this.glue.appManager.application(appName);

        /* Handle cases where a window is opened via glue.windows.open() and it adds a intent listener for the current intent:
            Glue42 Core -> there will be no application in AppManager API
            Glue42 Enterprise -> there will be an instance of an application called "no-app-window" in AppManager API 
        */
        return {
            applicationName: foundApp?.name !== ENTERPRISE_NO_APP_NAME
                ? foundApp?.name || ""
                : "",
            applicationIcon: foundApp?.icon,
            instanceId,
        }
    }

    private async getIntentHandler(userHandler: ResolverIntentHandler): Promise<IntentHandler> {
        const searchedIntent = (await this.glue.intents.find(this.intent)).find(intent => intent.name === this.intent);

        if (!searchedIntent) {
            throw new Error(`Intent with name ${this.intent} does not exist`);
        }

        const handler = this.findHandlerByFilter({ instanceId: userHandler.instanceId, applicationName: userHandler.applicationName }, searchedIntent.handlers);

        if (!handler) {
            throw new Error(`There's no such existing intent handler: ${JSON.stringify(userHandler)}`);
        }

        return handler;
    }

    private findHandlerByFilter (filterObject: { instanceId?: string, applicationName?: string }, handlers: IntentHandler[]): IntentHandler | undefined {
        if (filterObject.instanceId) {
            return handlers.find(handler => handler.instanceId === filterObject.instanceId);
        }

        if (filterObject.applicationName) {
            return handlers.find(handler => handler.applicationName === filterObject.applicationName);
        }
    }

    private isMethodRegistered(): boolean {
        return !!this.glue.interop.methods(this._methodName).length;
    }

    private isInstanceStillRunning(): boolean {
        return !!this.glue.interop.servers().find(server => server.windowId === this._callerId);
    }

    private checkIfMethodIsForCurrentIntent(methodName: string): boolean {
        const expectedMethodName = `${GLUE42_FDC3_INTENTS_METHOD_PREFIX}${this.intent}`;

        return expectedMethodName === methodName;
    }
}
