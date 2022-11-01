import GoldenLayout from "@glue42/golden-layout";
import componentStateMonitor from "../componentStateMonitor";
import { WorkspacesConfigurationFactory } from "../config/factory";
import store from "../state/store";
import { ComponentState } from "../types/internal";
import { getElementBounds, idAsString } from "../utils";
import { EmptyVisibleWindowName } from "../utils/constants";
import { LayoutEventEmitter } from "./eventEmitter";

export class LayoutComponentsFactory {
    private readonly componentNameToCleanup: { [name: string]: () => void } = {};

    constructor(private readonly _emitter: LayoutEventEmitter, private readonly _configFactory: WorkspacesConfigurationFactory) { }

    public registerWindowComponent(layout: GoldenLayout, placementId: string): void {
        this.registerComponent(layout, `app${placementId}`, (container) => {
            const div = this.createWindowDomElement(placementId);

            container.getElement().append(div);
        });
    }

    public unregisterWindowComponent(layout: GoldenLayout, name: string) {
        layout.unregisterComponent(name);
    }

    public registerEmptyWindowComponent(layout: GoldenLayout, workspaceId: string): void {
        this.registerComponent(layout, EmptyVisibleWindowName, (container) => {
            const emptyContainerDiv = this.createPlaceholderEmptyBackground();
            const newButton = this.createPlaceholderWindowAddButton(container, workspaceId);

            emptyContainerDiv.append(newButton);

            container.getElement().append(emptyContainerDiv);
        });
    }

    public registerWorkspaceComponent(workspaceId: string): void {
        const name = this._configFactory.getWorkspaceLayoutComponentName(workspaceId);
        this.registerComponent(store.workspaceLayout, name, (container: GoldenLayout.Container) => {

            const div = this.createWorkspaceEmptyBackground(workspaceId);
            const newButton = this.createAddButtonInWorkspace(container, workspaceId, name);

            div.appendChild(newButton);
            if (componentStateMonitor.decoratedFactory?.createWorkspaceContents) {
                document.body.append(div);

                div.style.display = "none";
                componentStateMonitor.decoratedFactory?.createWorkspaceContents({
                    workspaceId,
                    domNode: container.getElement()[0]
                });

            } else {
                container.getElement().append(div);
            }
            $(newButton).hide();
        });
    }

    public unregisterWorkspaceComponent(name: string) {
        if (typeof this.componentNameToCleanup[name] === "function") {
            this.componentNameToCleanup[name]();
            delete this.componentNameToCleanup[name];
        }
        store.workspaceLayout.unregisterComponent(name);
    }

    private registerComponent(layout: GoldenLayout,
        name: string,
        callback?: (container: GoldenLayout.Container, componentState: ComponentState) => void): void {
        try {
            // tslint:disable-next-line:only-arrow-functions
            layout.registerComponent(name, function (container: GoldenLayout.Container, componentState: ComponentState) {
                if (callback) {
                    callback(container, componentState);
                }
            });
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.log(`Tried to register and already existing component - ${name}`);
        }
    }

    private createAddButtonInWorkspace(container: GoldenLayout.Container, workspaceId: string, name: string) {
        const newButton = document.createElement("button");
        newButton.classList.add("add-button");
        const onClick = (e: Event): void => {
            e.stopPropagation();
            const contentItem = container.tab.contentItem;

            this._emitter.raiseEvent("add-button-clicked", {
                args: {
                    laneId: idAsString(contentItem.parent.id),
                    workspaceId,
                    bounds: getElementBounds(newButton)
                }
            });
        };
        newButton.addEventListener("click", onClick);

        this.componentNameToCleanup[name] = () => {
            newButton.removeEventListener("click", onClick);
            newButton.remove();
        };

        return newButton;
    }

    private createWorkspaceEmptyBackground(workspaceId: string) {
        const div = document.createElement("div");
        div.setAttribute("style", "height:calc(100% - 1px); width:calc(100% - 1px);");
        div.classList.add("empty-container-background");
        div.id = `nestHere${workspaceId}`;

        return div;
    }

    private createWindowDomElement(placementId: string) {
        const div = document.createElement("div");
        div.setAttribute("style", "height:100%;");
        div.id = `app${placementId}`;

        return div;
    }

    private createPlaceholderWindowAddButton(container: GoldenLayout.Container, workspaceId: string) {
        const newButton = document.createElement("button");
        newButton.classList.add("add-button");
        newButton.onclick = (e): void => {
            e.stopPropagation();
            const contentItem = container.tab.contentItem;
            const parentType = contentItem.parent.type === "stack" ? "group" : contentItem.parent.type;

            if (contentItem.parent.config.workspacesConfig.wrapper) {
                this._emitter.raiseEvent("add-button-clicked", {
                    args: {
                        laneId: idAsString(contentItem.parent.parent.config.id),
                        workspaceId,
                        parentType: contentItem.parent.parent.type,
                        bounds: getElementBounds(newButton)
                    }
                });
                return;
            }
            this._emitter.raiseEvent("add-button-clicked", {
                args: {
                    laneId: idAsString(contentItem.parent.config.id),
                    workspaceId,
                    parentType,
                    bounds: getElementBounds(newButton)
                }
            });
        };

        return newButton;
    }

    private createPlaceholderEmptyBackground() {
        const emptyContainerDiv = document.createElement("div");
        emptyContainerDiv.classList.add("empty-container-background");

        return emptyContainerDiv;
    }

}
