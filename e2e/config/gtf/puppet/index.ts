import { Glue42WebPlatform } from "../../../../packages/web-platform/platform";
import { DesktopGateway } from "./desktop-gateway";
import { WebPlatform } from "./clients/web-platform";
import { HttpCommands, HttpBody, HttpResponse } from "./common/types";
import { BaseClient } from "./clients/base-client";
import { defaultCoreConfig, defaultGatewayPort, puppetAppIndexHtml, puppetHttpBridgeUrl } from "./common/constants";
import { Glue42Core } from "../../../../packages/web/node_modules/@glue42/core/glue";
import { GlueCoreClient } from "./clients/glue-core-client";
import { Gtf } from "../gtf";

export class GtfPuppet implements Gtf.Puppet {
    public start(): Promise<void> {
        return Promise.resolve();
    }

    public get defaultGWUrl(): string {
        return defaultCoreConfig.gateway.ws;
    }

    public get defaultGWAuth(): { username: string, password: string } {
        return {
            username: defaultCoreConfig.auth.username,
            password: defaultCoreConfig.auth.password
        }
    }

    public async startDesktopGateway(config: { port: number; rejectConnection?: boolean } = { port: defaultGatewayPort }): Promise<DesktopGateway> {

        if (!config.port) {
            config.port = defaultGatewayPort;
        }

        const startResponse = await this.sendHttp<"startGateway">("startGateway", { config });

        if (!startResponse.success) {
            throw new Error("The puppet bridge did not give the OK.");
        }

        const gwInstance = new DesktopGateway(config.port);

        return gwInstance;
    }

    public async stopDesktopGateway(gateway: DesktopGateway): Promise<void> {
        const stopResponse = await this.sendHttp<"stopGateway">("stopGateway", { config: { port: gateway.port } });

        if (!stopResponse.success) {
            throw new Error("The puppet bridge did not give the OK.");
        }

        await this.pause(500);
    }

    public async startWebPlatform(config?: Glue42WebPlatform.Config): Promise<WebPlatform> {
        const baseClient = new BaseClient();

        await baseClient.start({ explicitOpen: true });

        const platform = new WebPlatform({ base: baseClient, config });

        await platform.ready();

        return platform;
    }

    public async startCoreClient(config?: Glue42Core.Config): Promise<GlueCoreClient> {
        const baseClient = new BaseClient();

        await baseClient.start({ explicitOpen: true });

        const coreClient = new GlueCoreClient({ base: baseClient, config });

        await coreClient.ready();

        return coreClient;
    }

    private async sendHttp<T extends HttpCommands>(command: T, data: HttpBody[T]): Promise<HttpResponse[T]> {

        const rawResponse = await fetch(puppetHttpBridgeUrl, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            mode: "cors",
            cache: "no-cache",
            body: JSON.stringify({ command, data })
        });

        const content = await rawResponse.json();

        if (content && content.errMsg) {
            throw new Error(`Puppet Bridge Error: ${content.errMsg}`);
        }

        return content;
    }

    private pause(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
