/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Web } from "@glue42/web";
import { UnsubscribeFunction } from "callback-registry";
import { CoreClientData, InternalPlatformConfig, LibController, LibDomains } from "../common/types";
import { libDomainDecoder } from "../shared/decoders";
import { GlueController } from "./glue";
import { WindowsController } from "../libs/windows/controller";
import { PortsBridge } from "../connection/portsBridge";
import { ApplicationsController } from "../libs/applications/controller";
import { WindowsStateController } from "./state";
import logger from "../shared/logger";
import { generate } from "shortid";
import { LayoutsController } from "../libs/layouts/controller";
import { WorkspacesController } from "../libs/workspaces/controller";
import { IntentsController } from "../libs/intents/controller";
import { ChannelsController } from "../libs/channels/controller";
import { Glue42WebPlatform } from "../../platform";
import { SystemController } from "./system";
import { ServiceWorkerController } from "./serviceWorker";
import { NotificationsController } from "../libs/notifications/controller";
import { ExtensionController } from "../libs/extension/controller";
import { PreferredConnectionController } from "../connection/preferred";
import { Glue42Core } from "@glue42/core";
import { InterceptionController } from "./interception";
import { PluginsController } from "./plugins";

export class PlatformController {

    private _platformApi!: Glue42WebPlatform.API;

    private readonly controllers: { [key in LibDomains]: LibController } = {
        system: this.systemController,
        windows: this.windowsController,
        appManager: this.applicationsController,
        layouts: this.layoutsController,
        workspaces: this.workspacesController,
        intents: this.intentsController,
        channels: this.channelsController,
        notifications: this.notificationsController,
        extension: this.extensionController
    }

    constructor(
        private readonly systemController: SystemController,
        private readonly glueController: GlueController,
        private readonly windowsController: WindowsController,
        private readonly applicationsController: ApplicationsController,
        private readonly layoutsController: LayoutsController,
        private readonly workspacesController: WorkspacesController,
        private readonly intentsController: IntentsController,
        private readonly channelsController: ChannelsController,
        private readonly notificationsController: NotificationsController,
        private readonly portsBridge: PortsBridge,
        private readonly stateController: WindowsStateController,
        private readonly serviceWorkerController: ServiceWorkerController,
        private readonly extensionController: ExtensionController,
        private readonly preferredConnectionController: PreferredConnectionController,
        private readonly interceptionController: InterceptionController,
        private readonly pluginsController: PluginsController
    ) { }

    private get logger(): Glue42Web.Logger.API | undefined {
        return logger.get("main.web.platform");
    }

    public get ctxTrackingGlue(): Glue42Core.GlueCore | undefined {
        return this.glueController.contextsTrackingGlue;
    }

    public get systemGlue(): Glue42Core.GlueCore | undefined {
        return this.glueController.systemGlue;
    }

    public get platformApi(): Glue42WebPlatform.API {
        return this._platformApi;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async start(config: InternalPlatformConfig): Promise<void> {
        await this.portsBridge.configure(config);

        this.portsBridge.onClientUnloaded(this.handleClientUnloaded.bind(this));

        await this.glueController.start(config);

        await Promise.all([
            this.glueController.createPlatformSystemMethod(this.handleClientMessage.bind(this)),
            this.glueController.createPlatformSystemStream()
        ]);

        this.stateController.start();

        await Promise.all(Object.values(this.controllers).map((controller) => controller.start(config)));

        await this.glueController.initClientGlue(config?.glue, config?.glueFactory, config?.workspaces?.isFrame);

        await this.serviceWorkerController.connect(config);

        this._platformApi = this.buildPlatformApi();

        await this.pluginsController.start({
            platformConfig: config,
            plugins: config.plugins?.definitions,
            api: this.platformApi,
            handlePluginMessage: this.handlePluginMessage.bind(this)
        });

        await this.pluginsController.startCorePlus(config.corePlus);

        if (config.connection.preferred) {
            await this.preferredConnectionController.start(config.connection.preferred);
        }

        this.serviceWorkerController.notifyReady();

        this.portsBridge.start();
    }

    public getClientGlue(): Glue42Web.API {
        return this.glueController.clientGlue;
    }

    private handleClientMessage(args: Glue42WebPlatform.ControlMessage, caller: Glue42Web.Interop.Instance, success: (args?: Glue42WebPlatform.ControlMessage) => void, error: (error?: string | object) => void): void {
        this.processControllerCommand(args, "client", caller.instance as string)
            .then((result) => success(result))
            .catch((err) => error(err));
    }

    private async handlePluginMessage(args: Glue42WebPlatform.Plugins.BaseControlMessage, pluginName: string): Promise<any> {
        return this.processControllerCommand(args, "plugin", pluginName);
    }

    private async processControllerCommand(args: Glue42WebPlatform.Plugins.BaseControlMessage, callerType: "plugin" | "client", callerId: string): Promise<any> {
        const decodeResult = libDomainDecoder.run(args.domain);

        if (!decodeResult.ok) {
            const errString = JSON.stringify(decodeResult.error);

            this.logger?.trace(`rejecting execution of a command issued by a ${callerType}: ${callerId}, because of a domain validation error: ${errString}`);

            throw new Error(`Cannot execute this platform control, because of domain validation error: ${errString}`);
        }

        const domain = decodeResult.result;

        const controlMessage: Glue42WebPlatform.ControlMessage = Object.assign({}, args, {
            commandId: generate(),
            callerId, callerType
        })

        this.logger?.trace(`[${controlMessage.commandId}] received a command for a valid domain: ${domain} from ${callerType}: ${callerId}, forwarding to the appropriate controller`);

        try {
            const result = await this.executeCommand(controlMessage);

            this.logger?.trace(`[${controlMessage.commandId}] this command was executed successfully, sending the result to the caller.`);

            return result;
        } catch (error: any) {
            const stringError = typeof error === "string" ? error : JSON.stringify(error.message);

            this.logger?.trace(`[${controlMessage.commandId}] this command's execution was rejected, reason: ${stringError}`);

            throw new Error(`The platform rejected operation ${controlMessage.operation} for domain: ${domain} with reason: ${stringError}`);
        }
    }

    private handleClientUnloaded(client: CoreClientData): void {
        this.logger?.trace(`detected unloading of client: ${client.windowId}, notifying all controllers`);

        Object.values(this.controllers).forEach((controller, idx) => {
            try {
                controller.handleClientUnloaded?.(client.windowId, client.win);
            } catch (error: any) {
                const stringError = typeof error === "string" ? error : JSON.stringify(error.message);
                const controllerName = Object.keys(this.controllers)[idx];
                this.logger?.error(`${controllerName} controller threw when handling unloaded client ${client.windowId} with error message: ${stringError}`);
            }
        });
    }

    private executeCommand(controlMessage: Glue42WebPlatform.ControlMessage): Promise<any> {
        const interceptor = this.interceptionController.getOperationInterceptor({ domain: controlMessage.domain, operation: controlMessage.operation });

        if (interceptor && !controlMessage.settings?.skipInterception) {
            this.logger?.trace(`[${controlMessage.commandId}] The operation is being intercepted and executed by: ${interceptor.name}`);

            return interceptor.intercept(controlMessage);
        }

        return this.controllers[controlMessage.domain].handleControl(controlMessage);
    }

    private buildPlatformApi(): Glue42WebPlatform.API {
        return {
            version: this.glueController.platformVersion,
            contextTrackGlue: this.ctxTrackingGlue,
            systemGlue: this.systemGlue,
            connectExtClient: (client: any, port: any) => {
                return this.connectExtClient(client, port);
            },
            onSystemReconnect: (callback: () => void): UnsubscribeFunction => {
                return this.onSystemReconnect(callback);
            }
        } as Glue42WebPlatform.API;
    }

    private async connectExtClient(client: any, port: any): Promise<void> {
        await this.portsBridge.handleExtConnectionRequest(client, port);
    }

    private onSystemReconnect(callback: () => void): UnsubscribeFunction {
        return this.preferredConnectionController.onReconnect(callback);
    }
}
