import { Glue42Core } from "../../../../../packages/core/glue";
import { Gtf } from "../../gtf";
import { puppetAppIndexHtml } from "../common/constants";
import { ClientCommandArgs, ClientCommandResult, ClientCommands } from "../common/types";
import {
    default as CallbackFactory,
    CallbackRegistry,
    UnsubscribeFunction,
} from "callback-registry";

export class BaseClient implements Gtf.GlueBaseClient {
    private readonly registry: CallbackRegistry = CallbackFactory();
    private readonly commandsLocks: { [key in string]: (value: { result: any, error?: string } | PromiseLike<{ result: any, error?: string }>) => void } = {};
    private readonly processClientReady = this.handleClientReady.bind(this);

    private methodCallbacks: { [key in string]: (args: any, caller: any) => any } = {}
    private clientId!: string;
    private openLock!: (value: void | PromiseLike<void>) => void;
    private port: MessagePort;

    private connectedSubscriptions = 0;
    private contextSubscriptions: { [key in string]: number } = {};
    private reconnectedSubscriptions = 0;
    private disconnectedSubscriptions = 0;

    public async start(config: { explicitOpen: boolean, clientId?: string }): Promise<void> {

        window.addEventListener("message", this.processClientReady);

        this.clientId = config.clientId ?? this.getId();

        const openPromise = new Promise<void>((resolve) => {
            this.openLock = resolve;
        });

        if (config.explicitOpen) {
            const newWin = window.open(puppetAppIndexHtml, this.clientId);

            if (!newWin) {
                throw new Error("New window could not be opened");
            }
        }

        await openPromise;

        window.removeEventListener("message", this.processClientReady);
    }

    public async close(): Promise<void> {
        await this.sendCommand<"close">("close", null);

        await this.pause(500);
    }

    public async reload(): Promise<void> {
        window.addEventListener("message", this.processClientReady);

        const loadPromise = new Promise<void>((resolve) => {
            this.openLock = resolve;
        });

        await this.sendCommand<"reload">("reload", null);

        await loadPromise;

        window.removeEventListener("message", this.processClientReady);

        await this.pause(500);
    }

    public async isConnected(): Promise<boolean> {
        const connectedResponse = await this.sendCommand<"getIsConnected">("getIsConnected", null);

        return connectedResponse.connected;
    }

    public async invokeMethod(name: string, args: any, target: "best" | "all" = "best"): Promise<Glue42Core.Interop.InvocationResult> {
        const invokeResponse = await this.sendCommand<"invokeMethod">("invokeMethod", { name, invokeArgs: args, target });

        return invokeResponse.invokeResult;
    }

    public async registerMethod(name: string, callback: (args: any, caller: any) => any): Promise<void> {
        if (this.methodCallbacks[name]) {
            throw new Error(`Method with name: ${name} was already registered by this client`);
        }

        await this.sendCommand<"registerMethod">("registerMethod", { name });
        this.methodCallbacks[name] = callback;
    }

    public async waitContextTrack(name: string, value: any): Promise<void> {
        await this.sendCommand<"waitContextTrack">("waitContextTrack", { name, value });
    }

    public async waitContext(name: string, value: any): Promise<void> {
        await this.sendCommand<"waitContext">("waitContext", { name, value });
    }

    public async getAllContexts(): Promise<string[]> {
        const result = await this.sendCommand<"getAllContexts">("getAllContexts", null);

        return result.contexts;
    }

    public async getContext(name: string): Promise<any> {
        const result = await this.sendCommand<"getContext">("getContext", { name });

        return result.context;
    }

    public async setContext(name: string, data: any): Promise<void> {

        await this.sendCommand<"setContext">("setContext", { name, data });
    }

    public async updateContext(name: string, data: any): Promise<void> {
        await this.sendCommand<"updateContext">("updateContext", { name, data });
    }

    public async subscribeContext(name: string, callback: (data: any) => void): Promise<UnsubscribeFunction> {
        await this.sendCommand<"subscribeContext">("subscribeContext", { name });

        const unsub = this.registry.add(`contextUpdate-${name}`, callback);

        ++this.contextSubscriptions[name];

        return () => {
            unsub();
            --this.contextSubscriptions[name];

            if (!this.contextSubscriptions[name]) {
                this.sendCommand<"unsubscribeContext">("unsubscribeContext", { name });
            }
        }
    }

    public async reconnected(callback: () => void): Promise<UnsubscribeFunction> {
        await this.sendCommand("subscribeReconnected", null);

        const unsub = this.registry.add("reconnected", callback);

        ++this.reconnectedSubscriptions;

        return () => {
            unsub();
            --this.reconnectedSubscriptions;

            if (!this.reconnectedSubscriptions) {
                this.sendCommand("unsubscribeReconnected", null);
            }
        }
    }

    public async connected(callback: (server: string) => void): Promise<UnsubscribeFunction> {

        await this.sendCommand("subscribeConnected", null);

        const unsub = this.registry.add("connected", callback);

        ++this.connectedSubscriptions;

        return () => {
            unsub();
            --this.connectedSubscriptions;

            if (!this.connectedSubscriptions) {
                this.sendCommand("unsubscribeConnected", null);
            }
        }
    }

    public async disconnected(callback: () => void): Promise<UnsubscribeFunction> {

        await this.sendCommand("subscribeDisconnected", null);

        const unsub = this.registry.add("disconnected", callback);

        ++this.disconnectedSubscriptions

        return () => {
            unsub();
            --this.disconnectedSubscriptions;

            if (!this.disconnectedSubscriptions) {
                this.sendCommand("unsubscribeDisconnected", null);
            }

        }
    }

    public async sendCommand<T extends ClientCommands>(command: T, args: ClientCommandArgs[T]): Promise<ClientCommandResult[T]> {

        const commandId = this.getId();

        const responsePromise = new Promise<{ result: any, error?: string }>((resolve) => {
            this.commandsLocks[commandId] = resolve;
        });

        this.port.postMessage({
            operation: command,
            args,
            operationId: commandId
        });

        const response = await responsePromise;

        if (response.error) {
            throw new Error(`Received error from the puppet app for command: ${command} with args ${JSON.stringify(args)} ${response.error}`);
        }

        return response.result;
    }

    private setupPortMessaging(): void {
        this.port.onmessage = (event) => {
            const data = event.data;

            if (data.eventId && data.event === "methodInvoked") {
                return this.processMethodInvokedEvent(data);
            }

            if (data.eventId && data.event === "connected") {
                return this.processConnectedEvent(data);
            }

            if (data.eventId && data.event === "disconnected") {
                return this.processDisconnectedEvent();
            }

            if (data.eventId && data.event === "reconnected") {
                return this.processReconnectedEvent();
            }

            if (data.eventId && data.event === "contextUpdate") {
                return this.handleContextUpdate(data);
            }

            if (data.operationId) {
                return this.handleOperationResponse(data);
            }

            if (data.log) {
                console.log(data.log);
                return;
            }
        }
    }

    private handleContextUpdate(data: any): void {
        const ctxName = data.contextName;
        const ctx = data.context;

        this.registry.execute(`contextUpdate-${ctxName}`, ctx);
    }

    private handleClientReady(event: MessageEvent): void {
        const data = event.data;

        if (!data.ready || data.winId !== this.clientId) {
            return;
        }

        const channel = new MessageChannel();

        this.port = channel.port1;

        this.setupPortMessaging();

        (event.source as Window).postMessage({ accepted: true, port: channel.port2, clientId: this.clientId }, "*", [channel.port2]);

        this.openLock();
    }

    private handleOperationResponse(data: any): any {
        if (!this.commandsLocks[data.operationId]) {
            // console.log(`------- Received response for unknown operation id: ${data.operationId} ------`);
            return;
        }

        // console.log(`------- Lifting the lock on operation id: ${data.operationId} ------`);

        this.commandsLocks[data.operationId]({ result: data.result, error: data.error });

        // console.log(`------- Deleting the lock on operation id: ${data.operationId} ------`);

        delete this.commandsLocks[data.operationId];
    }

    private async processMethodInvokedEvent(data: any): Promise<void> {
        if (!this.methodCallbacks[data.name]) {
            this.port.postMessage({
                eventId: data.eventId,
                error: `Method with name: ${data.name} is not registered`
            });

            return;
        }

        try {
            const result = await this.methodCallbacks[data.name](data.args, data.caller);

            this.port.postMessage({
                eventId: data.eventId,
                result
            });
        } catch (error) {
            const stringError = typeof error === "string" ? error : JSON.stringify(error.message);
            this.port.postMessage({
                eventId: data.eventId,
                error: stringError
            });
        }
    }

    private async processReconnectedEvent(): Promise<void> {
        this.registry.execute("reconnected");
    }

    private async processConnectedEvent(data: any): Promise<void> {
        const server = data.server;

        this.registry.execute("connected", server);
    }

    private async processDisconnectedEvent(): Promise<void> {
        this.registry.execute("disconnected");
    }

    private getId(): string {
        const uuid: string = (crypto as any).randomUUID();

        return uuid.slice(0, uuid.indexOf("-"));
    }

    private pause(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
