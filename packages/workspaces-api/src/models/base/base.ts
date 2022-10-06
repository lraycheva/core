import { Workspace } from "../workspace";
import { ParentBuilder } from "../../builders/parentBuilder";
import { strictParentDefinitionDecoder, swimlaneWindowDefinitionDecoder, checkThrowCallback } from "../../shared/decoders";
import { SubParent, AllParentTypes, Child, SubParentTypes, AllParent, ContainerLockConfig } from "../../types/builders";
import { PrivateDataManager } from "../../shared/privateDataManager";
import { ParentPrivateData, WorkspacePrivateData } from "../../types/privateData";
import { Window } from "../../models/window";
import { Glue42Workspaces } from "../../../workspaces";
import { Group } from "../group";
import { Row } from "../row";
import { Column } from "../column";
import { ColumnSnapshotConfig, GroupSnapshotConfig, RowSnapshotConfig } from "../../types/protocol";
import { SubscriptionConfig } from "../../types/subscription";
import { SetMaximizationBoundaryConfig } from "../../../temp";

interface PrivateData {
    manager: PrivateDataManager;
}

const data = new WeakMap<Base, PrivateData>();

const getData = (base: Base, model: AllParentTypes): WorkspacePrivateData | ParentPrivateData => {
    const manager = data.get(base).manager;

    if (model instanceof Workspace) {
        return manager.getWorkspaceData(model);
    }

    return data.get(base).manager.getParentData(model as SubParentTypes);
};

const getWindowFromPlacementId = (base: Base, placemenId: string): Window => {
    const manager = data.get(base).manager;

    return manager.getWindowByPlacementId(placemenId);
};

export class Base {
    public frameId: string;
    public workspaceId: string;
    public positionIndex: number;

    constructor(dataManager: PrivateDataManager) {
        data.set(this, { manager: dataManager });
    }

    public getId(model: AllParentTypes): string {
        return getData(this, model).id;
    }

    public getPositionIndex(model: AllParentTypes): number {
        return getData(this, model).config.positionIndex;
    }

    public getWorkspaceId(model: AllParentTypes): string {
        const privateData = getData(this, model) as ParentPrivateData;
        return privateData.config.workspaceId || privateData.workspace.id;
    }

    public getFrameId(model: AllParentTypes): string {
        return getData(this, model).frame.id;
    }

    public getAllChildren(model: AllParentTypes, predicate?: (child: Child) => boolean): Child[] {
        checkThrowCallback(predicate, true);
        const children = getData(this, model).children;

        if (typeof predicate === "undefined") {
            return children;
        }

        return children.filter(predicate);
    }

    public getMyParent(model: AllParentTypes): AllParentTypes {
        if (model instanceof Workspace) {
            return model;
        }
        return (getData(this, model) as ParentPrivateData).parent;
    }

    public getMyFrame(model: AllParentTypes): Glue42Workspaces.Frame {
        return getData(this, model).frame;
    }

    public getMyWorkspace(model: AllParentTypes): Workspace {
        if (model instanceof Workspace) {
            return model;
        }
        return (getData(this, model) as ParentPrivateData).workspace;
    }

    public async addWindow(model: AllParentTypes, definition: Glue42Workspaces.WorkspaceWindowDefinition, parentType: AllParent): Promise<Glue42Workspaces.WorkspaceWindow> {
        if (!definition.appName && !definition.windowId) {
            throw new Error("The window definition should contain either an appName or a windowId");
        }

        const validatedDefinition = swimlaneWindowDefinitionDecoder.runWithException(definition);
        const controller = getData(this, model).controller;

        const operationResult = await controller.add("window", getData(this, model).id, parentType, validatedDefinition);

        if (model instanceof Workspace) {
            await model.refreshReference();
            return getWindowFromPlacementId(this, operationResult.itemId);
        }

        await this.getMyWorkspace(model).refreshReference();

        return getWindowFromPlacementId(this, operationResult.itemId);
    }

    public async addParent<T>(model: AllParentTypes, typeToAdd: SubParent, parentType: AllParent, definition?: Glue42Workspaces.BoxDefinition | ParentBuilder): Promise<T> {
        const parentDefinition = this.transformDefinition(typeToAdd, definition);
        const controller = getData(this, model).controller;

        const newParentId = (await controller.add("container", getData(this, model).id, parentType, parentDefinition)).itemId;

        if (model instanceof Workspace) {
            await model.refreshReference();
            return model.getBox((parent) => parent.id === newParentId) as unknown as T;
        }

        const myWorkspace = this.getMyWorkspace(model);
        await myWorkspace.refreshReference();

        return myWorkspace.getBox((parent) => parent.id === newParentId) as unknown as T;
    }

    public async removeChild(model: AllParentTypes, predicate: (child: Child) => boolean): Promise<void> {
        checkThrowCallback(predicate);
        const child = this.getAllChildren(model).find(predicate);
        if (!child) {
            return;
        }

        await child.close();

        if (model instanceof Workspace) {

            await model.refreshReference();
            return;
        }

        await this.getMyWorkspace(model).refreshReference();
    }

    public async maximize(model: SubParentTypes): Promise<void> {
        const { controller, id } = getData(this, model);

        await controller.maximizeItem(id);

        await this.getMyWorkspace(model.parent).refreshReference();
    }

    public async restore(model: SubParentTypes): Promise<void> {
        const { controller, id } = getData(this, model);

        await controller.restoreItem(id);

        await this.getMyWorkspace(model.parent).refreshReference();
    }

    public async close(model: SubParentTypes): Promise<void> {
        const modelData = getData(this, model) as ParentPrivateData;

        const controller = getData(this, model).controller;

        await controller.closeItem(modelData.id);

        await this.getMyWorkspace(modelData.parent).refreshReference();
    }

    public async lockContainer(model: SubParentTypes, config?: ContainerLockConfig): Promise<void> {
        const modelData = getData(this, model) as ParentPrivateData;

        const controller = getData(this, model).controller;

        await controller.lockContainer(modelData.id, model.type, config);

        await this.getMyWorkspace(modelData.parent).refreshReference();
    }

    public getAllowDrop(model: SubParentTypes): boolean {
        return getData(this, model).config.allowDrop;
    }

    public getAllowDropLeft(model: Group): boolean {
        const privateData = getData(this, model);
        if (privateData.type !== "group") {
            throw new Error(`Property allowDropLeft is available only for groups and not on ${model.type} ${model.id}`);
        }
        return privateData.config.allowDropLeft;
    }

    public getAllowDropRight(model: Group): boolean {
        const privateData = getData(this, model);
        if (privateData.type !== "group") {
            throw new Error(`Property allowDropRight is available only for groups and not on ${model.type} ${model.id}`);
        }
        return privateData.config.allowDropRight;
    }

    public getAllowDropTop(model: Group): boolean {
        const privateData = getData(this, model);
        if (privateData.type !== "group") {
            throw new Error(`Property allowDropTop is available only for groups and not on ${model.type} ${model.id}`);
        }
        return privateData.config.allowDropTop;
    }

    public getAllowDropBottom(model: Group): boolean {
        const privateData = getData(this, model);
        if (privateData.type !== "group") {
            throw new Error(`Property allowDropBottom is available only for groups and not on ${model.type} ${model.id}`);
        }
        return privateData.config.allowDropBottom;
    }

    public getAllowDropHeader(model: Group): boolean {
        const privateData = getData(this, model);
        if (privateData.type !== "group") {
            throw new Error(`Property allowDropHeader is available only for groups and not on ${model.type} ${model.id}`);
        }
        return privateData.config.allowDropHeader;
    }

    public getAllowSplitters(model: Row | Column): boolean {
        const privateData = getData(this, model);

        if (privateData.type === "group") {
            throw new Error(`Cannot get allow splitters from private data ${privateData.type}`);
        }

        return privateData.config.allowSplitters;
    }

    public getAllowExtract(model: Group): boolean {
        const privateData = getData(this, model);
        if (privateData.type !== "group") {
            throw new Error(`Cannot get allow extract from private data ${privateData.type} with config ${privateData.type !== "workspace" ? privateData.config.type : ""}`);
        }
        return privateData.config.allowExtract;
    }

    public getAllowReorder(model: Group): boolean {
        const privateData = getData(this, model);
        if (privateData.type !== "group") {
            throw new Error(`Cannot get allow extract from private data ${privateData.type} with config ${privateData.type !== "workspace" ? privateData.config.type : ""}`);
        }
        return privateData.config.allowReorder;
    }

    public getShowMaximizeButton(model: Group): boolean {
        const privateData = getData(this, model);
        if (privateData.type !== "group") {
            throw new Error(`Cannot get show maximize button from private data${privateData.type} with config ${privateData.type !== "workspace" ? privateData.config.type : ""}`);
        }
        return privateData.config.showMaximizeButton;
    }

    public getShowEjectButton(model: Group): boolean {
        const privateData = getData(this, model);
        if (privateData.type !== "group") {
            throw new Error(`Cannot get show eject button from private data${privateData.type} with config ${privateData.type !== "workspace" ? privateData.config.type : ""}`);
        }
        return privateData.config.showEjectButton;
    }

    public getShowAddWindowButton(model: Group): boolean {
        const privateData = getData(this, model);
        if (privateData.type !== "group") {
            throw new Error(`Cannot get add window button from private data${privateData.type} with config ${privateData.type !== "workspace" ? privateData.config.type : ""}`);
        }
        return privateData.config.showAddWindowButton;
    }

    public getMinWidth(model: SubParentTypes): number {
        const privateData = getData(this, model);

        return privateData.config.minWidth;
    }

    public getMaxWidth(model: SubParentTypes): number {
        const privateData = getData(this, model);

        return privateData.config.maxWidth;
    }

    public getMinHeight(model: SubParentTypes): number {
        const privateData = getData(this, model);

        return privateData.config.minHeight;
    }

    public getMaxHeight(model: SubParentTypes): number {
        const privateData = getData(this, model);

        return privateData.config.maxHeight;
    }

    public getWidthInPx(model: SubParentTypes): number {
        const privateData = getData(this, model);

        return privateData.config.widthInPx;
    }

    public getHeightInPx(model: SubParentTypes): number {
        const privateData = getData(this, model);

        return privateData.config.heightInPx;
    }

    public getIsPinned(model: Column | Row): boolean {
        const privateData = getData(this, model);

        return (privateData.config as RowSnapshotConfig | ColumnSnapshotConfig).isPinned;
    }

    public getIsMaximized(model: Column | Row | Group): boolean {
        const privateData = getData(this, model);

        return (privateData.config as RowSnapshotConfig | ColumnSnapshotConfig | GroupSnapshotConfig).isMaximized;
    }

    public getMaximizationBoundary(model: Column | Row): boolean {
        const privateData = getData(this, model);

        return (privateData.config as RowSnapshotConfig | ColumnSnapshotConfig).maximizationBoundary;
    }

    public async setHeight(model: Row, height: number): Promise<void> {
        const modelData = getData(this, model) as ParentPrivateData;
        const { controller, id } = modelData;

        await controller.resizeItem(id, {
            height
        });

        await this.getMyWorkspace(modelData.parent).refreshReference();
    }

    public async setWidth(model: Column, width: number): Promise<void> {
        const modelData = getData(this, model) as ParentPrivateData;
        const { controller, id } = modelData;

        await controller.resizeItem(id, {
            width
        });

        await this.getMyWorkspace(modelData.parent).refreshReference();
    }

    public async setSize(model: Group, width?: number, height?: number): Promise<void> {
        const modelData = getData(this, model) as ParentPrivateData;
        const { controller, id } = modelData;

        await controller.resizeItem(id, {
            width,
            height
        });

        await this.getMyWorkspace(modelData.parent).refreshReference();
    }

    public async setMaximizationBoundary(model: Row | Column, config: SetMaximizationBoundaryConfig): Promise<void> {
        const modelData = getData(this, model) as ParentPrivateData;
        const { controller, id } = modelData;

        await controller.setMaximizationBoundary(id, config);

        await this.getMyWorkspace(modelData.parent).refreshReference();
    }

    public async processLocalSubscription(model: SubParentTypes, subscriptionConfig: SubscriptionConfig): Promise<Glue42Workspaces.Unsubscribe> {
        return getData(this, model).controller.processLocalSubscription(subscriptionConfig, this.getId(model))
    }

    private transformDefinition(type: "group" | "row" | "column", definition?: Glue42Workspaces.BoxDefinition | ParentBuilder): Glue42Workspaces.BoxDefinition {
        let parentDefinition: Glue42Workspaces.BoxDefinition;

        if (typeof definition === "undefined") {
            parentDefinition = { type, children: [] };
        } else if (definition instanceof ParentBuilder) {
            parentDefinition = definition.serialize();
        } else {
            if (typeof definition.type === "undefined") {
                definition.type = type;
            }
            parentDefinition = strictParentDefinitionDecoder.runWithException(definition);
            parentDefinition.children = parentDefinition.children || [];
        }

        return parentDefinition;
    }
}
