/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    default as CallbackFactory,
    CallbackRegistry,
    UnsubscribeFunction,
} from "callback-registry";
import {
    GW3Protocol,
    Transport,
    ConnectionSettings,
    Identity
} from "./types";
import { Logger } from "../logger/logger";

import { Glue42Core } from "../../glue";
import InProcTransport from "./transports/inProc";
import SharedWorkerTransport from "./transports/worker";
import WS from "./transports/ws";
import GW3ProtocolImpl from "./protocols/gw3";
import { MessageReplayerImpl } from "./replayer";
import timer from "../utils/timer";
import WebPlatformTransport from "./transports/webPlatform";
import { waitForInvocations } from "../utils/wait-for";
import { PromisePlus } from "../utils/promise-plus";
import { AsyncSequelizer } from "../utils/sequelizer";

/**
 * A template for gateway connections - this is extended from specific protocols and transports.
 */
export default class Connection implements Glue42Core.Connection.API {

    public peerId!: string;
    public token!: string;
    public info!: object;
    public resolvedIdentity!: any;
    public availableDomains!: Glue42Core.Connection.GWDomainInfo[];
    public gatewayToken: string | undefined;
    public replayer?: MessageReplayerImpl;

    protected protocol: GW3Protocol;

    // The message handlers that have to be executed for each received message
    protected messageHandlers: {
        [key: string]: { [key: string]: (msg: any) => void };
    } = {};
    protected ids = 1;
    protected registry: CallbackRegistry = CallbackFactory();
    protected _connected = false;
    private isTrace = false;
    private transport: Transport;

    private _defaultTransport: Transport;
    private _defaultAuth!: Glue42Core.Auth;

    private _targetTransport: Transport | undefined;
    private _targetAuth: Glue42Core.Auth | undefined;

    private _swapTransport = false;
    private _switchInProgress = false;
    private _transportSubscriptions: UnsubscribeFunction[] = [];

    private readonly _sequelizer = new AsyncSequelizer();

    public get protocolVersion() {
        return this.protocol?.protocolVersion;
    }

    constructor(private settings: ConnectionSettings, private logger: Logger) {
        settings = settings || {};
        settings.reconnectAttempts = settings.reconnectAttempts || 10;
        settings.reconnectInterval = settings.reconnectInterval || 1000;

        if (settings.inproc) {
            this.transport = new InProcTransport(settings.inproc, logger.subLogger("inMemory"));
        } else if (settings.sharedWorker) {
            this.transport = new SharedWorkerTransport(settings.sharedWorker, logger.subLogger("shared-worker"));
        } else if (settings.webPlatform) {
            this.transport = new WebPlatformTransport(settings.webPlatform, logger.subLogger("web-platform"), settings.identity);
        } else if (settings.ws !== undefined) {
            this.transport = new WS(settings, logger.subLogger("ws"));
        } else {
            throw new Error("No connection information specified");
        }

        this.isTrace = logger.canPublish("trace");
        logger.debug(`starting with ${this.transport.name()} transport`);

        this.protocol = new GW3ProtocolImpl(this, settings, logger.subLogger("protocol"));
        const unsubConnectionChanged = this.transport.onConnectedChanged(

            this.handleConnectionChanged.bind(this)
        );
        const unsubOnMessage = this.transport.onMessage(this.handleTransportMessage.bind(this));

        this._transportSubscriptions.push(unsubConnectionChanged);
        this._transportSubscriptions.push(unsubOnMessage);

        this._defaultTransport = this.transport;
    }

    public async switchTransport(settings: Glue42Core.Connection.TransportSwitchSettings): Promise<{ success: boolean }> {

        return this._sequelizer.enqueue<{ success: boolean }>(async () => {

            if (!settings || typeof settings !== "object") {
                throw new Error("Cannot switch transports, because the settings are missing or invalid.");
            }

            if (typeof settings.type === "undefined") {
                throw new Error("Cannot switch the transport, because the type is not defined");
            }

            this.logger.trace(`Starting transport switch with settings: ${JSON.stringify(settings)}`);

            const switchTargetTransport = settings.type === "secondary" ? this.getNewSecondaryTransport(settings) : this._defaultTransport;

            this._targetTransport = switchTargetTransport;

            this._targetAuth = settings.type === "secondary" ? this.getNewSecondaryAuth(settings) : this._defaultAuth;

            const verifyPromise = this.verifyConnection();

            this._swapTransport = true;
            this._switchInProgress = true;

            this.logger.trace("The new transport has been set, closing the current transport");

            await this.transport.close();

            try {
                await verifyPromise;

                const isSwitchSuccess = this.transport === switchTargetTransport;

                this.logger.info(`The reconnection after the switch was completed. Was the switch a success: ${isSwitchSuccess}`);

                this._switchInProgress = false;

                return { success: isSwitchSuccess };
            } catch (error) {

                this.logger.info("The reconnection after the switch timed out, reverting back to the default transport.");

                // this should not be awaited, so that it does not lock up the sequelizer
                this.switchTransport({ type: "default" });

                this._switchInProgress = false;

                return { success: false };
            }
        });
    }

    public onLibReAnnounced(callback: (lib: { name: "interop" | "contexts" }) => void): UnsubscribeFunction {
        return this.registry.add("libReAnnounced", callback);
    }

    public setLibReAnnounced(lib: { name: "interop" | "contexts" }): void {
        this.registry.execute("libReAnnounced", lib);
    }

    public send(message: object, options?: Glue42Core.Connection.SendMessageOptions): Promise<void> {
        // create a message using the protocol
        if (
            this.transport.sendObject &&
            this.transport.isObjectBasedTransport
        ) {
            const msg = this.protocol.createObjectMessage(message);
            if (this.isTrace) {
                this.logger.trace(`>> ${JSON.stringify(msg)}`);
            }
            return this.transport.sendObject(msg, options);
        } else {
            const strMessage = this.protocol.createStringMessage(message);
            if (this.isTrace) {
                this.logger.trace(`>> ${strMessage}`);
            }
            return this.transport.send(strMessage, options);
        }
    }

    public on<T>(
        type: string,
        messageHandler: (msg: T) => void
    ): any {
        type = type.toLowerCase();
        if (this.messageHandlers[type] === undefined) {
            this.messageHandlers[type] = {};
        }

        const id = this.ids++;
        this.messageHandlers[type][id] = messageHandler;

        return {
            type,
            id,
        };
    }

    // Remove a handler
    public off(info: { type: string; id: number }) {
        delete this.messageHandlers[info.type.toLowerCase()][info.id];
    }

    public get isConnected() {
        return this.protocol.isLoggedIn;
    }

    public connected(callback: (server: string) => void): () => void {
        return this.protocol.loggedIn(() => {
            const currentServer = this.transport.name();
            callback(currentServer);
        });
    }

    public disconnected(callback: () => void): () => void {
        return this.registry.add("disconnected", callback);
    }

    public async login(authRequest: Glue42Core.Auth, reconnect?: boolean): Promise<Identity> {

        if (!this._defaultAuth) {
            this._defaultAuth = authRequest;
        }

        if (this._swapTransport) {
            this.logger.trace("Detected a transport swap, swapping transports");
            const newAuth = this.transportSwap();
            authRequest = newAuth ?? authRequest;
        }

        this.logger.trace(`Starting login for transport: ${this.transport.name()} and auth ${JSON.stringify(authRequest)}`);

        try {
            // open the protocol in case it was closed by explicity logout
            await this.transport.open();
            this.logger.trace(`Transport: ${this.transport.name()} opened, logging in`);
            timer("connection").mark("transport-opened");
            const identity = await this.protocol.login(authRequest, reconnect);
            this.logger.trace(`Logged in with identity: ${JSON.stringify(identity)}`);
            timer("connection").mark("protocol-logged-in");
            return identity;
        } catch (error) {
            if (this._switchInProgress) {
                this.logger.trace("An error while logging in after a transport swap, preparing a default swap.");
                this.prepareDefaultSwap();
            }

            throw new Error(error);
        }
    }

    public async logout() {
        await this.protocol.logout();
        await this.transport.close();
    }

    public loggedIn(callback: () => void) {
        return this.protocol.loggedIn(callback);
    }

    public domain(
        domain: string,
        successMessages?: string[],
        errorMessages?: string[]
    ): Glue42Core.Connection.GW3DomainSession {
        return this.protocol.domain(
            domain,
            this.logger.subLogger(`domain=${domain}`),
            successMessages,
            errorMessages
        );
    }

    public authToken(): Promise<string> {
        return this.protocol.authToken();
    }

    public reconnect(): Promise<void> {
        return this.transport.reconnect();
    }

    private distributeMessage(message: object, type: string) {
        // Retrieve handlers for the message type
        const handlers = this.messageHandlers[type.toLowerCase()];
        if (handlers !== undefined) {
            // Execute them
            Object.keys(handlers).forEach((handlerId) => {
                const handler = handlers[handlerId];
                if (handler !== undefined) {
                    try {
                        handler(message);
                    } catch (error) {
                        try {
                            // logger might not be there yet
                            this.logger.error(`Message handler failed with ${error.stack}`, error);
                        } catch (loggerError) {
                            // tslint:disable-next-line:no-console
                            console.log("Message handler failed", error);
                        }
                    }
                }
            });
        }
    }

    private handleConnectionChanged(connected: boolean) {
        if (this._connected === connected) {
            return;
        }
        this._connected = connected;

        if (connected) {

            if (this.settings.replaySpecs && this.settings.replaySpecs.length) {
                this.replayer = new MessageReplayerImpl(this.settings.replaySpecs);
                this.replayer.init(this);
            }

            this.registry.execute("connected");
        } else {
            this.registry.execute("disconnected");
        }
    }

    private handleTransportMessage(msg: string | object) {
        let msgObj;
        if (typeof msg === "string") {
            msgObj = this.protocol.processStringMessage(msg);
        } else {
            msgObj = this.protocol.processObjectMessage(msg);
        }

        if (this.isTrace) {
            this.logger.trace(`<< ${JSON.stringify(msgObj)}`);
        }

        this.distributeMessage(msgObj.msg, msgObj.msgType);
    }

    private verifyConnection(): Promise<void> {

        return PromisePlus<void>((resolve) => {
            // eslint-disable-next-line prefer-const
            let unsub: UnsubscribeFunction;

            const ready = waitForInvocations(2, () => {
                if (unsub) {
                    unsub();
                }
                resolve();
            });

            unsub = this.onLibReAnnounced((lib) => {
                if (lib.name === "interop") {
                    return ready();
                }

                if (lib.name === "contexts") {
                    return ready();
                }
            });
        }, 10000, "Transport switch timed out waiting for all libraries to be re-announced");
    }

    private getNewSecondaryTransport(settings: Glue42Core.Connection.TransportSwitchSettings): Transport {

        if (!settings.transportConfig?.url) {
            throw new Error("Missing secondary transport URL.");
        }

        return new WS(Object.assign({}, this.settings, { ws: settings.transportConfig.url, reconnectAttempts: 1 }), this.logger.subLogger("ws-secondary"));
    }

    private getNewSecondaryAuth(settings: Glue42Core.Connection.TransportSwitchSettings): Glue42Core.Auth {
        if (!settings.transportConfig?.auth) {
            throw new Error("Missing secondary transport auth information.");
        }

        return settings.transportConfig.auth;
    }

    private transportSwap(): Glue42Core.Auth | undefined {
        this._swapTransport = false;

        if (!this._targetTransport || !this._targetAuth) {
            this.logger.warn(`Error while switching transports - either the target transport or auth is not defined: transport defined -> ${!!this._defaultTransport}, auth defined -> ${!!this._targetAuth}. Staying on the current one.`);
            return;
        }

        this._transportSubscriptions.forEach((unsub) => unsub());
        this._transportSubscriptions = [];

        this.transport = this._targetTransport;

        const unsubConnectionChanged = this.transport.onConnectedChanged(
            this.handleConnectionChanged.bind(this)
        );

        const unsubOnMessage = this.transport.onMessage(this.handleTransportMessage.bind(this));

        this._transportSubscriptions.push(unsubConnectionChanged);
        this._transportSubscriptions.push(unsubOnMessage);

        return this._targetAuth;
    }

    private prepareDefaultSwap(): void {

        this._transportSubscriptions.forEach((unsub) => unsub());
        this._transportSubscriptions = [];

        this.transport.close().catch((error) => this.logger.warn(`Error closing the ${this.transport.name()} transport after a failed connection attempt: ${JSON.stringify(error)}`));

        this._targetTransport = this._defaultTransport;
        this._targetAuth = this._defaultAuth;

        this._swapTransport = true;
    }
}
