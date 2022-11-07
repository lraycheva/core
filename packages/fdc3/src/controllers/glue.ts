import { Context, Listener, ContextMetadata } from '@finos/fdc3';
import { isEmptyObject } from '../shared/utils';
import { AddIntentListenerRequest, Application, ChannelContext, Glue42, SystemMethodEventArgument, GlueValidator, Instance, Intent, IntentContext, IntentFilter, IntentRequest, IntentResult, ServerInstance, InteropMethodFilter, InteropMethod, UnsubscribeFunction, InvocationResult } from '../types/glue42Types';
import { ChannelsParser } from '../channels/parser';
import { promisePlus } from '../shared/utils';
import { defaultGlue42APIs } from '../shared/constants';
import { Glue42FDC3SystemMethod } from '../channels/privateChannelConstants';
import { SystemMethodInvocationArgumentDecoder } from '../shared/decoder';

export class GlueController {
    private glue!: Glue42;

    private glueInitPromise!: Promise<void>;

    private resolveGluePromise!: (value: void | PromiseLike<void>) => void;
    private rejectGluePromise!: (reason?: any) => void;
    private defaultGluePromiseTimeout = 120000;

    constructor(
        private readonly channelsParser: ChannelsParser, 
        private readonly fireFdc3ReadyEvent: () => void
    ) { }

    public get gluePromise(): Promise<void> {
        return this.glueInitPromise;
    }

    public initialize(glue: Glue42): void {
        this.glue = glue;

        this.resolveGluePromise();

        this.fireFdc3ReadyEvent();
    }

    public initializeFailed(reason: any) {
        this.rejectGluePromise(reason);
    }

    public createGluePromise(): void {
        this.glueInitPromise = promisePlus<void>(() => {
            return new Promise((resolve, reject) => {
                this.resolveGluePromise = resolve;
                this.rejectGluePromise = reject;
            });
        }, this.defaultGluePromiseTimeout, `Timeout of ${this.defaultGluePromiseTimeout}ms waiting for Glue to initialize`);
    }

    public validateGlue(glue: any): GlueValidator {
        if (typeof glue !== "object" || Array.isArray(glue)) {
            return { isValid: false, error: { message: `Glue is not a valid object` }};
        }

        const apisToValidate = Object.keys(glue);

        const missingApis = defaultGlue42APIs.filter((api: string) => !apisToValidate.includes(api));

        if (missingApis.length) {
            return { isValid: false, error: { message: `Fdc3 cannot initialize correctly - Glue is missing the following ${missingApis.length > 1 ? `properties` : `property`}: ${missingApis.join(", ")}` }};
        }

        return { isValid: true }
    }

    public interopInstance(): ServerInstance {
        return this.glue.interop.instance;
    }

    public getApplication(name: string): Application {
        return this.glue.appManager.application(name);
    }
    
    public getApplicationInstances(appName: string): Instance[] {
        return this.glue.appManager.instances().filter(inst => inst.application.name === appName);
    }

    public getInstanceById(id: string): Instance | undefined {
        return this.glue.appManager.instances().find(inst => inst.id === id);
    }

    public async findIntents(intentFilter: IntentFilter): Promise<Intent[]> {
        return this.glue.intents.find(intentFilter);
    }

    public async raiseIntent(request: IntentRequest): Promise<IntentResult> {
        return this.glue.intents.raise(request);
    }

    public addIntentListener(intent: string | AddIntentListenerRequest, handler: (context: IntentContext) => any): Listener {
        return this.glue.intents.addIntentListener(intent, handler);
    }

    public getAllContexts(): string[] {
        return this.glue.contexts.all();
    }

    public async getContext(contextId: string): Promise<any> {
        return this.glue.contexts.get(contextId);
    }

    public async updateContext(contextId: string, data: any): Promise<void> {
        return this.glue.contexts.update(contextId, data);
    }

    public async updateContextWithLatestFdc3Type(contextId: string, context: Context): Promise<void>  {
        const prevContextData = await this.getContext(contextId);
    
        if (isEmptyObject(prevContextData)) {
            return this.updateContext(contextId, {
                data: this.channelsParser.parseFDC3ContextToGlueContexts(context),
                latest_fdc3_type: this.channelsParser.mapFDC3TypeToChannelsDelimiter(context.type)
            });
        }
    
        return this.updateContext(contextId, {
            ...prevContextData,
            data: { ...prevContextData.data, ...this.channelsParser.parseFDC3ContextToGlueContexts(context) }, 
            latest_fdc3_type: this.channelsParser.mapFDC3TypeToChannelsDelimiter(context.type)
        });
    }

    public async channelsUpdate(channelId: string, context: Context): Promise<void> {
        const parsedData = this.channelsParser.parseFDC3ContextToGlueContexts(context);

        return this.glue.channels.publish(parsedData, channelId);
    }

    public contextsSubscribe(id: string, callback: (data: any, metadata?: ContextMetadata) => void): Promise<() => void> {
        const didReplay = { replayed: false };

        return this.glue.contexts.subscribe(id, this.contextsChannelsSubscribeCb("contexts", didReplay, callback).bind(this));
    }

    public async channelSubscribe(callback: (data: any, metadata?: ContextMetadata) => void, id?: string): Promise<() => void> {
        if (id) {
            const didReplay = { replayed: false };

            return this.glue.channels.subscribeFor(id, this.contextsChannelsSubscribeCb("channels", didReplay, callback).bind(this));
        }

        const didReplay = { replayed: false };

        return this.glue.channels.subscribe(this.contextsChannelsSubscribeCb("channels", didReplay, callback));
    }

    public async joinChannel(channelId: string): Promise<void> {
        return this.glue.channels.join(channelId);
    }

    public async leaveChannel(): Promise<void> {
        return this.glue.channels.leave();
    }

    public getCurrentChannel(): string {
        return this.glue.channels.current();
    }

    public setOnChannelChanged(callback: (channelId: string) => void): () => void {
        return this.glue.channels.changed(callback);
    }

    public async getAllChannels(): Promise<string[]> {
        return this.glue.channels.all();
    }

    public async listAllChannels(): Promise<ChannelContext[]> {
        return this.glue.channels.list();
    }

    public async getChannel(channelId: string): Promise<ChannelContext> {
        return this.glue.channels.get(channelId);
    }

    public getContextForMyWindow(): any {
        return this.glue.windows.my().getContext();
    }

    public getMyWindowId(): string {
        return this.glue.windows.my().id;
    }

    public getGlueVersion(): string | undefined {
        return this.glue?.version
    }

    public registerOnInstanceStopped(cb: (instance: Instance) => void | Promise<void>): UnsubscribeFunction {
        return this.glue.appManager.onInstanceStopped(cb);
    }

    public invokeSystemMethod<T>(argumentObj: SystemMethodEventArgument): Promise<InvocationResult<T>> {                
        const args = SystemMethodInvocationArgumentDecoder.runWithException(argumentObj);
        
        const target = args.payload.clientId;

        return this.glue.interop.invoke(Glue42FDC3SystemMethod, args, { windowId: target });
    }

    public registerMethod<T=any, R=any>(name: string, handler: (args: T, caller: ServerInstance) => void | R | Promise<R>): Promise<void> {
        return this.glue.interop.register(name, handler);
    }

    public getInteropMethods(filter?: string | InteropMethodFilter): InteropMethod[] {
        return this.glue.interop.methods(filter);
    }

    private contextsChannelsSubscribeCb(api: "contexts" | "channels", didReplay: { replayed: boolean}, callback: (data: any, metadata?: ContextMetadata) => void) {
        return (data: { data: any, latest_fdc3_type: string }, context: any, updater?: any, _?: any, extraData?: any) => {
            const dataToCheck = api === "contexts" ? data.data : data;

            if (!dataToCheck || (isEmptyObject(dataToCheck) && !didReplay.replayed)) {
                didReplay.replayed = true;
                return;
            }
            
            const updaterId = api === "contexts" 
                ? extraData ? extraData.updaterId : undefined
                : updater;

            if (this.glue.interop.instance.peerId === updaterId) {
                return;
            }
            
            let contextMetadata: ContextMetadata | undefined;

            const instanceServer = this.glue.interop.servers().find((server: ServerInstance) => server.peerId === updaterId);

            if (instanceServer) {
                contextMetadata = {
                    source: { 
                        appId: instanceServer.applicationName, 
                        instanceId: instanceServer.instance 
                    }
                };
            }

            /*  NB! Data from Channels API come in format: { fdc3_type: data } so it needs to be transformed to initial fdc3 data { type: string, ...data }
                Ex: { type: "contact", name: "John Smith", id: { email: "john.smith@company.com" }} is broadcasted from FDC3,  
                it  will come in the handler as { fdc3_contact: { name: "John Smith", id: { email: "john.smith@company.com" }}} 
            */
            const parsedCallbackData = api === "contexts"
                ? this.channelsParser.parseGlue42DataToInitialFDC3Data(data)
                : this.channelsParser.parseGlue42DataToInitialFDC3Data({ data: context.data, latest_fdc3_type: context.latest_fdc3_type });
    
            callback(parsedCallbackData, contextMetadata);
        }
    }
}
