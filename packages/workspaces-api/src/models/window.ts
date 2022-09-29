import { checkThrowCallback, nonEmptyStringDecoder, windowLockConfigDecoder, elementResizeConfigDecoder } from "../shared//decoders";
import { SubscriptionConfig } from "../types/subscription";
import { PrivateDataManager } from "../shared/privateDataManager";
import { WindowPrivateData } from "../types/privateData";
import { Glue42Workspaces } from "../../workspaces";
import { GDWindow } from "../types/glue";
import { Row } from "./row";
import { Column } from "./column";
import { Group } from "./group";

interface PrivateData {
    manager: PrivateDataManager;
}

const data = new WeakMap<Window, PrivateData>();

const getData = (model: Window): WindowPrivateData => {
    return data.get(model).manager.getWindowData(model);
};

export class Window implements Glue42Workspaces.WorkspaceWindow {

    constructor(dataManager: PrivateDataManager) {
        data.set(this, { manager: dataManager });
    }

    public get id(): string {
        return getData(this).config.windowId;
    }

    public get elementId(): string {
        return getData(this).id;
    }

    public get type(): "window" {
        return "window";
    }

    public get frameId(): string {
        return getData(this).frame.id;
    }

    public get workspaceId(): string {
        return getData(this).workspace.id;
    }

    public get positionIndex(): number {
        return getData(this).config.positionIndex;
    }

    public get isMaximized(): boolean {
        return getData(this).config.isMaximized;
    }

    public get isLoaded(): boolean {
        return getData(this).controller.checkIsWindowLoaded(this.id);
    }

    public get isSelected(): boolean {
        return getData(this).config.isSelected;
    }

    public get focused(): boolean {
        // Should return undefined in core, because focus state cannot be monitored reliably
        return this.isLoaded ? this.getGdWindow().isFocused : false;
    }

    public get title(): string {
        return getData(this).config.title;
    }

    public get allowExtract(): boolean {
        return getData(this).config.allowExtract;
    }

    public get allowReorder(): boolean {
        return getData(this).config.allowReorder;
    }

    public get showCloseButton(): boolean {
        return getData(this).config.showCloseButton;
    }

    public get width(): number {
        return getData(this).config.widthInPx;
    }

    public get height(): number {
        return getData(this).config.heightInPx;
    }

    public get minWidth(): number {
        return getData(this).config.minWidth;
    }

    public get minHeight(): number {
        return getData(this).config.minHeight;
    }

    public get maxWidth(): number {
        return getData(this).config.maxWidth;
    }

    public get maxHeight(): number {
        return getData(this).config.maxHeight;
    }

    public get workspace(): Glue42Workspaces.Workspace {
        return getData(this).workspace;
    }

    public get frame(): Glue42Workspaces.Frame {
        return getData(this).frame;
    }

    public get parent(): Glue42Workspaces.Workspace | Glue42Workspaces.Row | Glue42Workspaces.Column | Glue42Workspaces.Group {
        return getData(this).parent;
    }

    public get appName(): string {
        return getData(this).config.appName;
    }

    public async forceLoad(): Promise<void> {
        if (this.isLoaded) {
            return;
        }
        const controller = getData(this).controller;
        const itemId = getData(this).id;

        const windowId = await controller.forceLoadWindow(itemId);

        getData(this).config.windowId = windowId;

        await this.workspace.refreshReference();
    }

    public async focus(): Promise<void> {
        const id = getData(this).id;
        const controller = getData(this).controller;

        await controller.focusItem(id);

        await this.workspace.refreshReference();
    }

    public async close(): Promise<void> {
        const id = getData(this).id;
        const controller = getData(this).controller;

        await controller.closeItem(id);

        await getData(this)
            .parent
            .removeChild((child) => child.id === id);

        await this.workspace.refreshReference();
    }

    public async setTitle(title: string): Promise<void> {
        nonEmptyStringDecoder.runWithException(title);

        const itemId = getData(this).id;
        const controller = getData(this).controller;

        await controller.setItemTitle(itemId, title);

        await this.workspace.refreshReference();
    }

    public async maximize(): Promise<void> {
        const id = getData(this).id;
        const controller = getData(this).controller;

        await controller.maximizeItem(id);

        await this.workspace.refreshReference();
    }

    public async restore(): Promise<void> {
        const id = getData(this).id;
        const controller = getData(this).controller;

        await controller.restoreItem(id);

        await this.workspace.refreshReference();
    }

    public async eject(): Promise<GDWindow> {
        if (!this.isLoaded) {
            throw new Error("Cannot eject this window, because it is not loaded yet");
        }
        const itemId: string = getData(this).id;

        const newWindowId: string = await getData(this).controller.ejectWindow(itemId);

        getData(this).config.windowId = newWindowId;

        await this.workspace.refreshReference();

        return this.getGdWindow();
    }

    public getGdWindow(): GDWindow {
        if (!this.isLoaded) {
            throw new Error("Cannot fetch this GD window, because the window is not yet loaded");
        }

        const myId = getData(this).config.windowId;
        const controller = getData(this).controller;

        return controller.getGDWindow(myId);
    }

    public async moveTo(parent: Glue42Workspaces.Row | Glue42Workspaces.Column | Glue42Workspaces.Group): Promise<void> {
        if (!(parent instanceof Row || parent instanceof Column || parent instanceof Group)) {
            throw new Error("Cannot add to the provided parent, because the provided parent is not an instance of Row, Column or Group");
        }

        const myId = getData(this).id;
        const controller = getData(this).controller;

        const foundParent = await controller.getParent((p) => p.id === parent.id);

        if (!foundParent) {
            throw new Error("Cannot move the window to the selected parent, because this parent does not exist.");
        }

        await controller.moveWindowTo(myId, parent.id);

        await this.workspace.refreshReference();
    }

    public async lock(config?: Glue42Workspaces.WorkspaceWindowLockConfig | ((config: Glue42Workspaces.WorkspaceWindowLockConfig) => Glue42Workspaces.WorkspaceWindowLockConfig)): Promise<void> {
        let lockConfigResult = undefined;

        if (typeof config === "function") {
            const currentLockConfig = {
                allowExtract: this.allowExtract,
                allowReorder: this.allowReorder,
                showCloseButton: this.showCloseButton
            };
            lockConfigResult = config(currentLockConfig);
        } else {
            lockConfigResult = config;
        }

        const verifiedConfig = lockConfigResult === undefined ? undefined : windowLockConfigDecoder.runWithException(lockConfigResult);
        const windowPlacementId = getData(this).id;
        await getData(this).controller.lockWindow(windowPlacementId, verifiedConfig);
        await this.workspace.refreshReference();
    }

    public async setSize(config: Glue42Workspaces.ElementResizeConfig): Promise<void> {
        const verifiedConfig = elementResizeConfigDecoder.runWithException(config);

        if (!verifiedConfig.width && !verifiedConfig.height) {
            throw new Error("Expected either width or height to be passed.");
        }

        const myId = getData(this).id;
        const controller = getData(this).controller;

        await controller.resizeItem(myId, {
            height: verifiedConfig.height,
            width: verifiedConfig.width,
            relative: false
        });

        await this.workspace.refreshReference();
    }

    public async onRemoved(callback: () => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const id = getData(this).id;
        const wrappedCallback = async (): Promise<void> => {
            await this.workspace.refreshReference();
            callback();
        };
        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "removed",
            eventType: "window",
            scope: "window"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, id);
        return unsubscribe;
    }
}
