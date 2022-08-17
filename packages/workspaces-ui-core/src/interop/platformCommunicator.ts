import { Glue42Web } from "@glue42/web";
import { WorkspacesSystemConfig } from "../types/internal";
import { PlatformControlMethod } from "../utils/constants";
import { GetWorkspaceWindowOnLayoutSaveContextResult, GetWorkspaceWindowsOnLayoutSaveContextConfig, WorkspaceWindowOnSaveData } from "./types";
const semverLte = require('semver/functions/lte');

declare var window: Window & { glue42core: { platformVersion: string } };

export class PlatformCommunicator {

    constructor(private readonly _glue: Glue42Web.API,
        private readonly _frameId: string) {
    }

    public async requestOnLayoutSaveContexts(data: GetWorkspaceWindowsOnLayoutSaveContextConfig): Promise<WorkspaceWindowOnSaveData[]> {
        if (!window.glue42core.platformVersion || semverLte(window.glue42core.platformVersion, "1.12.12")) {
            console.warn(`Workspace layout ${data.layoutName} won't save the window contexts because the platform must be at lease version 1.13.0`);
            return [];
        }
        try {
            const result = await this._glue.agm.invoke<GetWorkspaceWindowOnLayoutSaveContextResult>(PlatformControlMethod, {
                domain: "workspaces",
                operation: "getWorkspaceWindowsOnLayoutSaveContext",
                data
            });

            return result?.returned?.windowsOnSaveData ?? [];
        } catch (error) {
            console.warn(`The save of window contexts unexpectedly failed with `, error);
        }

        return [];

    }

    public notifyFrameWillStart(windowId: string, appName?: string, context?: any, title?: string) {
        const systemId = (window as any).glue42core.communicationId;

        return this._glue.interop.invoke(PlatformControlMethod, {
            domain: appName ? "appManager" : "windows",
            operation: appName ? "registerWorkspaceApp" : "registerWorkspaceWindow",
            data: {
                name: `${appName || "window"}_${windowId}`,
                windowId,
                frameId: this._frameId,
                appName,
                context,
                title
            }
        }, systemId ? { instance: systemId } : undefined);
    }

    public notifyFrameWillClose(windowId: string, appName?: string): Promise<any> {
        const systemId = (window as any).glue42core.communicationId;

        return this._glue.interop.invoke(PlatformControlMethod, {
            domain: appName ? "appManager" : "windows",
            operation: appName ? "unregisterWorkspaceApp" : "unregisterWorkspaceWindow",
            data: {
                windowId,
            }
        }, systemId ? { instance: systemId } : undefined);
    }

    public async askForSettings() {
        const systemId = (window as any).glue42core.communicationId;

        const result = await this._glue.interop.invoke<WorkspacesSystemConfig>(PlatformControlMethod, {
            domain: "workspaces",
            operation: "getWorkspacesConfig",
            data: {
            }
        }, systemId ? { instance: systemId } : undefined);

        return result.returned;
    }
}
