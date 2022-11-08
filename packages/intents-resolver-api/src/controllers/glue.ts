import { StartContextDecoder } from '../shared/decoders';
import { validateGlue } from '../shared/utils';
import { AppDefinitionInGD, Application, Glue42, Instance, Intent, IntentHandler, IntentInfo, InvocationResult, RemovedIntentHandler, UnsubscribeFunction } from '../types/glue';

export class GlueController {
    private glue!: Glue42;

    private _intent!: string;
    private _callerId!: string;
    private _methodName!: string;

    public async initialize(glue: Glue42) {
        validateGlue(glue);

        this.glue = glue;

        const context = await this.glue.appManager.myInstance.getContext();

        StartContextDecoder.runWithException(context);

        this._intent = context.intent;
        this._callerId = context.callerId;
        this._methodName = context.methodName;
    }

    public get intent(): string {
        return this._intent;
    }

    public async sendInteropMethodResponse(handler: IntentHandler): Promise<InvocationResult | undefined> {
        const methodIsRegistered = this.isMethodRegistered();

        if (!this.isInstanceStillRunning()) {
            this.glue.appManager.myInstance.stop();
            return;
        }

        if (!methodIsRegistered) {
            return this.subscribeForServerMethodAdded(handler);
        }

        return this.glue.interop.invoke(this._methodName, { intent: this.intent, handler }, { instance: this._callerId });
    }

    public subscribeOnInstanceStarted(callback: (handler: IntentHandler) => void): UnsubscribeFunction {
        return this.glue.appManager.onInstanceStarted(async (inst: Instance) => {
            const currentIntentDef = await this.extractCurrentIntentInfoFromApp(inst.application);

            if (!currentIntentDef) {
                return;
            }

            const builtInstance = this.buildIntentHandler(inst.application, currentIntentDef, inst.id);

            callback(builtInstance);
        });
    }

    public subscribeOnInstanceStopped(callback: (handler: RemovedIntentHandler) => void): UnsubscribeFunction {
        return this.glue.appManager.onInstanceStopped(async (inst: Instance) => {
            const currentIntentDef = await this.extractCurrentIntentInfoFromApp(inst.application);

            if (!currentIntentDef) {
                return;
            }

            const builtInstance = this.buildRemovedIntentHandler(inst.application, inst.id);

            callback(builtInstance);
        });
    }

    public subscribeOnAppAdded(callback: (handler: IntentHandler) => void): UnsubscribeFunction {
        return this.glue.appManager.onAppAdded(async (app: Application) => {
            const currentIntentDef = await this.extractCurrentIntentInfoFromApp(app);

            if (!currentIntentDef) {
                return;
            }

            const builtHandler = this.buildIntentHandler(app, currentIntentDef);

            callback(builtHandler);
        });
    }

    public subscribeOnAppRemoved(callback: (handler: RemovedIntentHandler) => void): UnsubscribeFunction {
        return this.glue.appManager.onAppRemoved(async (app: Application) => {
            const currentIntentDef = await this.extractCurrentIntentInfoFromApp(app);

            if (!currentIntentDef) {
                return;
            }

            const builtHandler = this.buildRemovedIntentHandler(app);

            callback(builtHandler);
        });
    }

    private subscribeForServerMethodAdded(handler: IntentHandler): Promise<InvocationResult> {
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

    private async extractCurrentIntentInfoFromApp(app: Application): Promise<IntentInfo | undefined> {
        let intentDef;

        if ((window as any).glue42core) {
            intentDef = app.userProperties.intents?.find((intent: Intent) => intent.name === this.intent);
        }

        if ((window as any).glue42gd) {
            let apps: AppDefinitionInGD[];

            try {
                const result = await this.glue.interop.invoke("T42.ACS.GetApplications", { withIntentsInfo: true });
                apps = result.returned.applications;
            } catch (error) {
                return;
            }

            intentDef = apps.find(appDef => appDef.name === app.name && appDef.intents?.find(intent => intent.name === this.intent));
        }

        return intentDef;
    }

    private buildIntentHandler(app: Application, intentDef: IntentInfo, instanceId?: string): IntentHandler {
        return {
            applicationName: app.name,
            applicationTitle: app.title || "",
            applicationDescription: app.caption,
            applicationIcon: app.icon,
            displayName: intentDef.displayName,
            type: instanceId ? "instance" : "app",
            resultType: intentDef.resultType,
            instanceId
        }
    }

    private buildRemovedIntentHandler(app: Application, instanceId?: string): RemovedIntentHandler {
        return {
            applicationName: app.name,
            type: instanceId ? "instance" : "app",
            instanceId
        };
    }

    private isMethodRegistered(): boolean {
        return !!this.glue.interop.methods(this._methodName).length;
    }

    private isInstanceStillRunning(): boolean {
        return !!this.glue.interop.servers().find(server => server.windowId === this._callerId);
    }
}
