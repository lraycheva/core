import { Glue42Web } from "@glue42/web";
import { WorkspacesSystemConfig } from "../types/internal";
import { PlatformControlMethod } from "../utils/constants";

class WorkspacesSystemSettingsProvider {

    private settings: WorkspacesSystemConfig;

    public async getSettings(glue: Glue42Web.API) {
        if (!this.settings) {
            this.settings = await this.askForSettings(glue);
        }

        return this.settings;
    }

    private async askForSettings(glue: Glue42Web.API) {
        const result = await glue.interop.invoke<WorkspacesSystemConfig>(this.decorateCommunicationId(PlatformControlMethod), {
            domain: "workspaces",
            operation: "getWorkspacesConfig",
            data: {
            }
        });

        return result.returned;
    }

    private decorateCommunicationId(base: string): string {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return `${base}.${(window as any).glue42core.communicationId}`;
    }
}

export default new WorkspacesSystemSettingsProvider();