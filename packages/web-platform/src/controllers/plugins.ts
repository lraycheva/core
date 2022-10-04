import { Glue42WebPlatform } from "../../platform";
import { InternalPlatformConfig, PluginsConfig } from "../common/types";
import { GlueController } from "./glue";
import { InterceptionController } from "./interception";
import logger from "../shared/logger";
import { Glue42Web } from "@glue42/web";

export class PluginsController {

    private handlePluginMessage!: (args: Glue42WebPlatform.Plugins.BaseControlMessage, pluginName: string) => Promise<any>;
    private registeredPlugins: Array<{ name: string, version: string }> = [];
    private internalConfig!: InternalPlatformConfig;
    private platformApi!: Glue42WebPlatform.API;

    constructor(
        private readonly interceptionController: InterceptionController,
        private readonly glueController: GlueController
    ) { }

    private get logger(): Glue42Web.Logger.API | undefined {
        return logger.get("plugins.controller");
    }

    public async start(config: PluginsConfig): Promise<void> {
        this.handlePluginMessage = config.handlePluginMessage;
        this.internalConfig = config.platformConfig;
        this.platformApi = config.api;

        if (!config.plugins || !config.plugins.length) {
            return;
        }

        const criticalPlugins: Array<Promise<void>> = [];

        for (const plugin of config.plugins) {
            const startPromise = this.startPlugin(plugin);

            if (plugin.critical) {
                criticalPlugins.push(startPromise);
            }
        }

        await Promise.all(criticalPlugins);
    }

    public async startCorePlus(definition?: Glue42WebPlatform.CorePlus.Config): Promise<void> {
        if (!definition) {
            return;
        }

        const coreStartPromise = this.startPlugin({ ...definition, name: "Glue42CorePlus" });

        if (definition.critical) {
            await coreStartPromise;
        }
    }

    private async startPlugin(definition: Glue42WebPlatform.Plugins.PluginDefinition): Promise<void> {
        try {
            const platformControls: Glue42WebPlatform.Plugins.PlatformControls = this.buildPlatformControls(definition.name, this.platformApi);

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

    private buildPlatformControls(pluginName: string, api: Glue42WebPlatform.API): Glue42WebPlatform.Plugins.PlatformControls {
        return {
            // control is deprecated, but remains here for backwards compatibility 
            control: (args: Glue42WebPlatform.Plugins.BaseControlMessage): Promise<any> => this.handlePluginMessage(args, pluginName),
            logger: logger.get(pluginName),
            platformApi: api,
            interception: {
                register: (request: Glue42WebPlatform.Plugins.InterceptorRegistrationRequest) => this.interceptionController.registerInterceptor(request, pluginName)
            },
            system: {
                sendControl: (args: Glue42WebPlatform.Plugins.BaseControlMessage): Promise<any> => this.handlePluginMessage(args, pluginName),
                register: this.registerPlugin.bind(this),
                getInfo: this.getGlueInfo.bind(this)
            }
        }
    }

    private getGlueInfo(): Glue42WebPlatform.SystemInfo {
        const workspaces = this.glueController.clientGlue.workspaces ? {
            version: this.glueController.clientGlue.workspaces.version,
            frameUrl: this.internalConfig.workspaces?.src
        } : undefined;

        return {
            web: {
                version: this.glueController.clientGlue.version
            },
            platform: {
                version: this.glueController.platformVersion,
                plugins: this.registeredPlugins
            },
            workspaces
        }
    }

    private registerPlugin(name: string, version: string): void {
        if (typeof name !== "string" || !name.length) {
            return;
        }

        const existingPlugin = this.registeredPlugins.some((plugin) => plugin.name === name);

        if (existingPlugin) {
            return;
        }

        this.registeredPlugins.push({ name, version });
    }
}