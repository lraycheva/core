import { SessionWebSettings } from "./types";

export class SessionStorageController {
    private readonly sessionStorage: Storage;
    private readonly webNamespace = "g42_core_web";

    constructor() {
        this.sessionStorage = window.sessionStorage;
    }

    public getWebSettings(): SessionWebSettings | undefined {
        const settingsAsString = this.sessionStorage.getItem(this.webNamespace);

        if (!settingsAsString) {
            return;
        }

        return JSON.parse(settingsAsString);
    }

    public saveWebSettings(settings: SessionWebSettings): void {
        this.sessionStorage.setItem(this.webNamespace, JSON.stringify(settings));
    }

}