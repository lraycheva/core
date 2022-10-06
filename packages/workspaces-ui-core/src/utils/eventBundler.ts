import { WorkspacesEventEmitter } from "../eventEmitter";
import { ContainerEventAction, ContainerEventPayload, WindowEventAction, WindowEventPayload, WorkspaceEventAction, WorkspaceEventPayload } from "../types/events";

interface GroupedLockEvents {
    workspace: {
        group: boolean;
        state: { [id: string]: WorkspaceEventPayload }
    };
    window: {
        group: boolean;
        state: { [id: string]: WindowEventPayload }
    };
    container: {
        group: boolean;
        state: { [id: string]: ContainerEventPayload }
    };
}

export class WorkspacesEventBundler extends WorkspacesEventEmitter {
    private groupedLockEvents: GroupedLockEvents = {
        workspace: {
            group: false,
            state: {}
        },
        window: {
            group: false,
            state: {}
        },
        container: {
            group: false,
            state: {}
        }
    };

    public raiseWindowEvent(args: { action: WindowEventAction; payload: WindowEventPayload; }): void {
        if (args.action === "lock-configuration-changed") {
            this.raiseLockConfigurationChanged("window", args.payload.windowSummary.itemId, args.payload);
        } else {
            super.raiseWindowEvent(args);
        }
    }

    public raiseContainerEvent(args: { action: ContainerEventAction; payload: ContainerEventPayload; }): void {
        if (args.action === "lock-configuration-changed") {
            this.raiseLockConfigurationChanged("container", args.payload.containerSummary.itemId, args.payload);
        } else {
            super.raiseContainerEvent(args);
        }
    }

    public raiseWorkspaceEvent(args: { action: WorkspaceEventAction; payload: WorkspaceEventPayload; }): void {
        if (args.action === "lock-configuration-changed") {
            this.raiseLockConfigurationChanged("workspace", args.payload.workspaceSummary.id, args.payload);
        } else {
            super.raiseWorkspaceEvent(args);
        }
    }

    public startContainerLockConfigurationChangedGrouping() {
        this.startLockConfigurationChangedGrouping("container");
    }

    public endContainerLockConfigurationChangedGrouping() {
        this.endLockConfigurationChangedGrouping("container");
    }

    public startWorkspaceLockConfigurationChangedGrouping() {
        this.startLockConfigurationChangedGrouping("workspace");
    }

    public endWorkspaceLockConfigurationChangedGrouping() {
        this.endLockConfigurationChangedGrouping("workspace");
    }

    public startWindowLockConfigurationChangedGrouping() {
        this.startLockConfigurationChangedGrouping("window");
    }

    public endWindowLockConfigurationChangedGrouping() {
        this.endLockConfigurationChangedGrouping("window");
    }

    private startLockConfigurationChangedGrouping(type: "window" | "workspace" | "container") {
        this.groupedLockEvents[type].group = true;
    }

    private raiseLockConfigurationChanged(type: "workspace", id: string, payload: WorkspaceEventPayload): void;
    private raiseLockConfigurationChanged(type: "container", id: string, payload: ContainerEventPayload): void;
    private raiseLockConfigurationChanged(type: "window", id: string, payload: WindowEventPayload): void;
    private raiseLockConfigurationChanged(type: "workspace" | "container" | "window", id: string, payload: WorkspaceEventPayload | ContainerEventPayload | WindowEventPayload) {
        if (this.groupedLockEvents[type].group) {
            this.groupedLockEvents[type].state[id] = payload as any;

        } else {

            if (type === "window") {
                const windowPayload = payload as WindowEventPayload;
                super.raiseWindowEvent({ action: "lock-configuration-changed", payload: windowPayload });
            } else if (type === "container") {
                const containerPayload = payload as ContainerEventPayload;
                super.raiseContainerEvent({ action: "lock-configuration-changed", payload: containerPayload });
            } else {
                const workspacePayload = payload as WorkspaceEventPayload;
                super.raiseWorkspaceEvent({ action: "lock-configuration-changed", payload: workspacePayload });
            }
        }
    }

    private endLockConfigurationChangedGrouping(type: "window" | "workspace" | "container") {
        try {
            this.groupedLockEvents[type].group = false;
            const keys = Object.keys(this.groupedLockEvents[type].state);
            keys.forEach((key) => {
                this.raiseLockConfigurationChanged(type as any, key, this.groupedLockEvents[type].state[key] as any);
            });
        } catch (error) {
            console.warn(error);
        } finally {
            this.groupedLockEvents[type].state = {};
        }
    }
}


