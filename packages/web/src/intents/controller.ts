/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Core } from "@glue42/core";
import { IoC } from "../shared/ioc";
import { IntentResolverResponse as IntentsResolverResponse, IntentsResolverStartContext, LibController } from "../shared/types";
import { Glue42Web } from "../../web";
import { GlueBridge } from "../communication/bridge";
import { UnsubscribeFunction } from "callback-registry";
import { intentsOperationTypesDecoder, raiseRequestDecoder, findFilterDecoder, addIntentListenerIntentDecoder, intentResolverResponseDecoder } from "../shared/decoders";
import { IntentsResolverResponsePromise, operations, WrappedIntentFilter, WrappedIntents } from "./protocol";
import { AppManagerController } from '../appManager/controller';
import shortid from 'shortid';
import { WindowsController } from '../windows/controller';
import { GLUE42_FDC3_INTENTS_METHOD_PREFIX, INTENTS_RESOLVER_APP_NAME, INTENTS_RESOLVER_HEIGHT, INTENTS_RESOLVER_INTEROP_PREFIX, INTENTS_RESOLVER_WIDTH } from './constants';

export class IntentsController implements LibController {
    private bridge!: GlueBridge;
    private logger!: Glue42Web.Logger.API;
    private interop!: Glue42Core.AGM.API;
    private appManager!: AppManagerController;
    private myIntents = new Set<string>();

    private useIntentsResolverUI: boolean = true;
    private intentsResolverAppName!: string;

    private windowsManager!: WindowsController;
    private intentsResolverResponsePromises: { [ instanceId: string ]: IntentsResolverResponsePromise } = {};

    public async start(coreGlue: Glue42Core.GlueCore, ioc: IoC): Promise<void> {
        this.logger = coreGlue.logger.subLogger("intents.controller.web");

        this.logger.trace("starting the web intents controller");

        this.bridge = ioc.bridge;

        this.interop = coreGlue.interop;

        this.appManager = ioc.appManagerController;

        this.windowsManager = ioc.windowsController;

        this.checkIfIntentsResolverIsEnabled(ioc.config);

        const api = this.toApi();

        this.logger.trace("no need for platform registration, attaching the intents property to glue and returning");

        (coreGlue as Glue42Web.API).intents = api;
    }

    public async handleBridgeMessage(args: any): Promise<void> {
        const operationName = intentsOperationTypesDecoder.runWithException(args.operation);

        const operation = operations[operationName];

        if (!operation.execute) {
            return;
        }

        let operationData: any = args.data;

        if (operation.dataDecoder) {
            operationData = operation.dataDecoder.runWithException(args.data);
        }

        return await operation.execute(operationData);
    }

    private toApi(): Glue42Web.Intents.API {
        const api: Glue42Web.Intents.API = {
            raise: this.raise.bind(this),
            all: this.all.bind(this),
            addIntentListener: this.addIntentListener.bind(this),
            find: this.find.bind(this)
        };

        return api;
    }

    private async raise(request: string | Glue42Web.Intents.IntentRequest): Promise<Glue42Web.Intents.IntentResult> {
        let intentDecoder = raiseRequestDecoder.runWithException(request);

        const intent: Glue42Web.Intents.IntentRequest = typeof intentDecoder === "string"
            ? { intent: intentDecoder }
            : intentDecoder;

        if (intent.target) {
            this.logger.trace(`Intents Resolver won't be used. Target is provided in Intent Request - ${JSON.stringify(intent)}`);

            return this.raiseIntent(intent);
        }

        if (!this.useIntentsResolverUI) {
            this.logger.trace(`Intent Resolver is disabled. Raising intent to first found handler`);

            return this.raiseIntent(intent);
        }

        const intentsResolverApp = this.appManager.getApplication(this.intentsResolverAppName);

        if (!intentsResolverApp) {
            this.logger.trace(`Intent Resolver Application with name ${this.intentsResolverAppName} not found. Intents Resolver won't be used for handling raised intents`);

            return this.raiseIntent(intent);
        }

        const hasOneHandler = (await this.find(intent.intent))[0].handlers.length === 1;

        if (hasOneHandler) {
            this.logger.trace(`Intents Resolver won't be used - intent has only one handler.`);

            return this.raiseIntent(intent);
        }

        const registeredMethod = await this.registerIntentResolverMethod();

        this.logger.trace(`Registered interop method ${registeredMethod}`);

        const resolverInstance = await this.openIntentResolverApplication(intent, registeredMethod);

        const { handler } = await this.intentsResolverResponsePromises[resolverInstance.id].promise;

        this.stopIntensResolverInstance(resolverInstance.id);

        const target = handler.type === "app"
            ? { app: handler.applicationName }
            : { instance: handler.instanceId };

        this.logger.trace(`Intent handler chosen by the user: ${JSON.stringify(target)}`);

        const data = { ...intent, target };

        return this.raiseIntent(data);
    }

    private async raiseIntent(requestObj: Glue42Web.Intents.IntentRequest): Promise<Glue42Web.Intents.IntentResult> {
        const result = this.bridge.send<Glue42Web.Intents.IntentRequest, Glue42Web.Intents.IntentResult>("intents", operations.raiseIntent, requestObj);

        return result;
    }

    private async all(): Promise<Glue42Web.Intents.Intent[]> {
        const result = await this.bridge.send<void, WrappedIntents>("intents", operations.getIntents, undefined);

        return result.intents;
    }

    private addIntentListener(intent: string | Glue42Web.Intents.AddIntentListenerRequest, handler: (context: Glue42Web.Intents.IntentContext) => any): { unsubscribe: UnsubscribeFunction } {
        addIntentListenerIntentDecoder.runWithException(intent);
        if (typeof handler !== "function") {
            throw new Error("Cannot add intent listener, because the provided handler is not a function!");
        }

        let registerPromise: Promise<void>;

        // `addIntentListener()` is sync.
        const intentName = typeof intent === "string" ? intent : intent.intent;
        const methodName = `${GLUE42_FDC3_INTENTS_METHOD_PREFIX}${intentName}`;

        const alreadyRegistered = this.myIntents.has(intentName);

        if (alreadyRegistered) {
            throw new Error(`Intent listener for intent ${intentName} already registered!`);
        }
        this.myIntents.add(intentName);

        const result = {
            unsubscribe: (): void => {
                this.myIntents.delete(intentName);

                registerPromise
                    .then(() => this.interop.unregister(methodName))
                    .catch((err) => this.logger.trace(`Unregistration of a method with name ${methodName} failed with reason: ${err}`));
            }
        };

        let intentFlag: Omit<Glue42Web.Intents.AddIntentListenerRequest, "intent"> = {};

        if (typeof intent === "object") {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { intent: removed, ...rest } = intent;
            intentFlag = rest;
        }

        registerPromise = this.interop.register({ name: methodName, flags: { intent: intentFlag } }, (args: Glue42Web.Intents.IntentContext) => {
            if (this.myIntents.has(intentName)) {
                return handler(args);
            }
        });

        registerPromise.catch(err => {
            this.myIntents.delete(intentName);

            this.logger.warn(`Registration of a method with name ${methodName} failed with reason: ${err}`);
        });

        return result;
    }

    private async find(intentFilter?: string | Glue42Web.Intents.IntentFilter): Promise<Glue42Web.Intents.Intent[]> {
        let data: WrappedIntentFilter | undefined = undefined;

        if (typeof intentFilter !== "undefined") {
            const intentFilterObj = findFilterDecoder.runWithException(intentFilter);

            if (typeof intentFilterObj === "string") {
                data = {
                    filter: {
                        name: intentFilterObj
                    }
                };
            } else if (typeof intentFilterObj === "object") {
                data = {
                    filter: intentFilterObj
                };
            }
        }

        const result = await this.bridge.send<WrappedIntentFilter | undefined, WrappedIntents>("intents", operations.findIntent, data);

        return result.intents;
    }

    private createResponsePromise(intent: string, instanceId: string, methodName: string): void {
        let resolve: (arg: IntentsResolverResponse) => void = () => { };
        let reject: (reason: string) => void = () => { };

        const promise = new Promise<IntentsResolverResponse>((res, rej) => {
            resolve = res;
            reject = rej;
        });

        this.intentsResolverResponsePromises[instanceId] = { intent, resolve, reject, promise, methodName };
    }

    private resolverResponseHandler(args: any, callerId: Glue42Web.Interop.Instance): void {
        const response = intentResolverResponseDecoder.run(args);

        const instanceId = callerId.instance;

        if (!response.ok) {
            this.logger.trace(`Intent Resolver sent invalid response. Error: ${response.error}`);

            this.intentsResolverResponsePromises[instanceId!].reject(response.error.message);

            this.stopIntensResolverInstance(instanceId!);

            return;
        }

        this.intentsResolverResponsePromises[instanceId!].resolve(response.result);
    }

    private stopIntensResolverInstance(instanceId: string): void {
        const appInstances = this.appManager.getApplication(this.intentsResolverAppName).instances;

        const searchedInstance = appInstances.find((inst: Glue42Web.AppManager.Instance) => inst.id === instanceId);

        if (!searchedInstance) {
            return;
        }

        searchedInstance.stop().catch(err => this.logger.error(err));
    }

    private async registerIntentResolverMethod(): Promise<string> {
        const methodName = INTENTS_RESOLVER_INTEROP_PREFIX + shortid();

        await this.interop.register(methodName, this.resolverResponseHandler.bind(this));

        return methodName;
    }

    private async openIntentResolverApplication(requestObj: Glue42Web.Intents.IntentRequest, methodName: string): Promise<Glue42Web.AppManager.Instance> {
        const startContext: IntentsResolverStartContext = {
            intent: requestObj.intent,
            callerId: this.interop.instance.instance!,
            methodName
        };

        const startOptions = await this.composeStartOptions();

        const instance = await this.appManager.getApplication(this.intentsResolverAppName).start(startContext, startOptions);

        this.subscribeOnInstanceStopped(instance);

        this.createResponsePromise(requestObj.intent, instance.id, methodName);

        return instance;
    }

    private async cleanUpIntentResolverPromise(instanceId: string): Promise<void> {
        const intentPromise = this.intentsResolverResponsePromises[instanceId];

        if (!intentPromise) {
            return;
        }

        // typings are wrong and mark unregister as a sync method
        const unregisterPromise = this.interop.unregister(intentPromise.methodName) as unknown as Promise<void>;

        unregisterPromise.catch((error) => this.logger.warn(error));

        delete this.intentsResolverResponsePromises[instanceId];
    }

    private async composeStartOptions(): Promise<Glue42Web.AppManager.ApplicationStartOptions> {
        const bounds = await this.windowsManager.my().getBounds();

        return {
            top: (bounds.height - INTENTS_RESOLVER_HEIGHT) / 2 + bounds.top,
            left: (bounds.width - INTENTS_RESOLVER_WIDTH) / 2 + bounds.left,
            width: INTENTS_RESOLVER_WIDTH,
            height: INTENTS_RESOLVER_HEIGHT
        };
    }

    private subscribeOnInstanceStopped(instance: Glue42Web.AppManager.Instance): void {
        const { application } = instance;

        const unsub = application.onInstanceStopped((inst: Glue42Web.AppManager.Instance) => {
            if (inst.id !== instance.id) {
                return;
            }

            const intentPromise = this.intentsResolverResponsePromises[inst.id];

            if (!intentPromise) {
                return unsub();
            }

            intentPromise.reject(`Cannot resolve raise intent ${intentPromise.intent} - User closed ${this.intentsResolverAppName} app without choosing an intent handler`);

            this.cleanUpIntentResolverPromise(inst.id);

            unsub();
        })
    }

    private checkIfIntentsResolverIsEnabled(options: Glue42Web.Config): void {
        this.useIntentsResolverUI = typeof options.intents?.enableIntentsResolverUI === "boolean"
            ? options.intents.enableIntentsResolverUI
            : true;

        this.intentsResolverAppName = options.intents?.intentsResolverAppName ?? INTENTS_RESOLVER_APP_NAME;
    }
}
