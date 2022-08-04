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

export class PlatformController {

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
        private readonly interceptionController: InterceptionController
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

        if (config.plugins) {
            await Promise.all(config.plugins.definitions.filter((def) => def.critical).map(this.startPlugin.bind(this)));

            config.plugins.definitions.filter((def) => !def.critical).map(this.startPlugin.bind(this));
        }

        this.serviceWorkerController.notifyReady();

        if (config.connection.preferred) {
            await this.preferredConnectionController.start(config.connection.preferred);
        }

        this.portsBridge.start();
    }

    public async connectExtClient(client: any, port: any): Promise<void> {
        await this.portsBridge.handleExtConnectionRequest(client, port);
    }

    public onSystemReconnect(callback: () => void): UnsubscribeFunction {
        return this.preferredConnectionController.onReconnect(callback);
    }

    public getClientGlue(): Glue42Web.API {
        return this.glueController.clientGlue;
    }

    private async startPlugin(definition: Glue42WebPlatform.Plugins.PluginDefinition): Promise<void> {
        try {
            const platformControls: Glue42WebPlatform.Plugins.PlatformControls = {
                control: (args: Glue42WebPlatform.Plugins.BaseControlMessage): Promise<any> => this.handlePluginMessage(args, definition.name),
                logger: logger.get(definition.name),
                interception: {
                    register: (request: Glue42WebPlatform.Plugins.InterceptorRegistrationRequest) => this.interceptionController.registerInterceptor(request, definition.name)
                }
            };

            await definition.start(this.glueController.clientGlue, definition.config, platformControls);

        } catch (error: any) {
            const stringError = typeof error === "string" ? error : JSON.stringify(error.message);
            const message = `Plugin: ${definition.name} threw while initiating: ${stringError}`;

            if (definition.critical) {
                throw new Error(message);
            } else {
                this.logger?.warn(message);
            }
        }
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
}
