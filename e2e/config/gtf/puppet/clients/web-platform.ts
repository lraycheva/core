import { Glue42Web } from "../../../../../packages/web/web.d";
import { Glue42Core } from "../../../../../packages/core/glue.d";
import { Glue42WebPlatform } from "../../../../../packages/web-platform/platform";
import { BaseClient } from "./base-client";
import { GlueWebClient } from "./glue-web-client";
import { Gtf } from "../../gtf";
import { UnsubscribeFunction } from "callback-registry";

export class WebPlatform implements Gtf.GlueWebPlatform {

    constructor(private readonly settings: { base: BaseClient, config?: Glue42WebPlatform.Config }) { }

    private get base(): BaseClient {
        return this.settings.base;
    }

    public async ready(): Promise<void> {
        await this.base.sendCommand<"initiateWebPlatform">("initiateWebPlatform", { config: this.settings.config });
    }

    public async close(): Promise<void> {
        await this.base.close();
    }

    public async reload(): Promise<void> {
        await this.base.reload();

        await this.base.sendCommand<"initiateWebPlatform">("initiateWebPlatform", { config: this.settings.config });
    }

    public isConnected(): Promise<boolean> {
        return this.base.isConnected();
    }

    public async registerMethod(name: string, callback: (args: any, caller: any) => any): Promise<void> {
        return this.base.registerMethod(name, callback);
    }

    public async invokeMethod(name: string, args: any, target?: "best" | "all"): Promise<Glue42Core.Interop.InvocationResult> {
        return this.base.invokeMethod(name, args, target);
    }

    public getAllContexts(): Promise<string[]> {
        return this.base.getAllContexts();
    }

    public getContext(name: string): Promise<any> {
        return this.base.getContext(name);
    }

    public setContext(name: string, data: any): Promise<void> {
        return this.base.setContext(name, data);
    }

    public updateContext(name: string, data: any): Promise<void> {
        return this.base.updateContext(name, data);
    }

    public subscribeContext(name: string, callback: (data: any) => void): Promise<UnsubscribeFunction> {
        return this.base.subscribeContext(name, callback);
    }

    public async connected(callback: (server: string) => void): Promise<UnsubscribeFunction> {
        return this.base.connected(callback);
    }

    public async disconnected(callback: () => void): Promise<UnsubscribeFunction> {
        return this.base.disconnected(callback);
    }

    public async reconnected(callback: () => void): Promise<UnsubscribeFunction> {
        return this.base.reconnected(() => this.pause(1000).then(callback));
    }

    public async openClient(config?: Glue42Web.Config): Promise<GlueWebClient> {

        const uuid: string = (crypto as any).randomUUID();

        const webClientId = uuid.slice(0, uuid.indexOf("-"));

        const baseWeb = new BaseClient();

        const baseStart = baseWeb.start({ explicitOpen: false, clientId: webClientId });

        await this.base.sendCommand<"openWebClient">("openWebClient", { id: webClientId });

        await baseStart;

        const webClient = new GlueWebClient({ base: baseWeb, config });

        await webClient.ready();

        return webClient;
    }

    public waitContextTrack(name: string, value: any): Promise<void> {
        return this.base.waitContextTrack(name, value);
    }

    public waitContext(name: string, value: any): Promise<void> {
        return this.base.waitContext(name, value);
    }

    private pause(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
