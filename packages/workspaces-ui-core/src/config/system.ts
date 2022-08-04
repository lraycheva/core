import { PlatformCommunicator } from "../interop/platformCommunicator";
import { WorkspacesSystemConfig } from "../types/internal";

export class WorkspacesSystemSettingsProvider {

    private settings: WorkspacesSystemConfig;

    constructor(private readonly _platformCommunicator: PlatformCommunicator){

    }

    public async getSettings() {
        if (!this.settings) {
            this.settings = await this._platformCommunicator.askForSettings();
        }

        return this.settings;
    }
}
