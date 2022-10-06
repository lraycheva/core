import GoldenLayout from "@glue42/golden-layout";
import { LayoutEventEmitter } from "../layout/eventEmitter";
import { Workspace } from "../types/internal";
import { idAsString } from "../utils";
import { WorkspaceContainerWrapper } from "./containerWrapper";
import store from "./store";
import { WorkspaceWindowWrapper } from "./windowWrapper";
import { WorkspaceWrapper } from "./workspaceWrapper";

export class WorkspacesWrapperFactory {

    constructor(
        private readonly layoutEventEmitter: LayoutEventEmitter,
        private readonly frameId: string
    ) {

    }
    public getWorkspaceWrapper(config: { workspace?: Workspace, workspaceContentItem?: GoldenLayout.Component, workspaceId?: string }) {
        let workspace = config.workspace;

        if (workspace === undefined || workspace == null) {
            workspace = config.workspaceId ? store.getById(config.workspaceId!) : undefined;
        }

        let workspaceContentItem = config.workspaceContentItem;

        if (workspaceContentItem === undefined || workspaceContentItem == null) {
            workspaceContentItem = config.workspaceId ? store.getWorkspaceContentItem(config.workspaceId!) : undefined;
        }

        return new WorkspaceWrapper(this, this.layoutEventEmitter, workspace, workspaceContentItem, this.frameId);
    }

    public getWindowWrapper(config: { windowContentItem?: GoldenLayout.Component, itemId?: string | string[], workspaceId?: string }) {
        let windowContentItem = config.windowContentItem;

        if (windowContentItem === undefined || windowContentItem == null) {
            windowContentItem = config.itemId ? store.getWindowContentItem(idAsString(config.itemId)) : undefined;
        }

        return new WorkspaceWindowWrapper(this, this.layoutEventEmitter, windowContentItem, this.frameId);
    }

    public getContainerWrapper(config: { containerContentItem?: GoldenLayout.ContentItem, itemId?: string | string[], workspaceId?: string }) {
        let containerContentItem = config.containerContentItem;
        if (containerContentItem === undefined || containerContentItem == null) {
            containerContentItem = config.itemId ? store.getContainer(config.itemId!) : undefined;
        }

        if (containerContentItem.type === "component") {
            throw new Error("Cannot get container wrapper for a component");
        }

        return new WorkspaceContainerWrapper(this, this.layoutEventEmitter, containerContentItem, this.frameId, config.workspaceId);
    }
}