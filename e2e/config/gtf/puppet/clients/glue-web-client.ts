import { UnsubscribeFunction } from "callback-registry";
import { Glue42Web } from "../../../../../packages/web/web.d";
import { Glue42Core } from "../../../../../packages/core/glue.d";
import { Gtf } from "../../gtf";
import { defaultWebConfig } from "../common/constants";
import { BaseClient } from "./base-client";

export class GlueWebClient implements Gtf.GlueWebClient {

    private readonly coreConfig: Glue42Web.Config;

    constructor(private readonly settings: { base: BaseClient, config?: Glue42Web.Config }) {
        this.coreConfig = this.settings.config ?? defaultWebConfig;
    }

    private get base(): BaseClient {
        return this.settings.base;
    }

    public async ready(): Promise<void> {
        await this.base.sendCommand<"initiateWeb">("initiateWeb", { config: this.coreConfig });
    }

    public async close(): Promise<void> {
        await this.base.close();
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
        return this.base.reconnected(callback);
    }

    public async reload(): Promise<void> {
        await this.base.reload();
        await this.base.sendCommand<"initiateWeb">("initiateWeb", { config: this.coreConfig });
    }
}