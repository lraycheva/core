import { ComponentFactory, CreateWorkspaceTabsOptions, DecoratedFactory, VisibilityState } from "./types/componentFactory";
import createRegistry from "callback-registry";
//tslint:disable-next-line:no-var-requires
const shortid = require("shortid");
import { idAsString } from "./utils";

class ComponentStateMonitor {
    private readonly visibilityState: VisibilityState = {
        logo: undefined,
        workspaceTabs: {},
        addWorkspace: undefined,
        systemButtons: undefined,
        workspaceContents: [],
        beforeGroupTabs: [],
        afterGroupTabs: [],
    };

    private lastSelectedWorkspaceTab: CreateWorkspaceTabsOptions;

    private callbackRegistry = createRegistry();

    private componentsFactory: ComponentFactory = {};
    private readonly _decoratedFactory: DecoratedFactory = {};
    private readonly observer = new MutationObserver((mutations) => {
        Array.from(mutations).forEach((m) => {
            const targetDiv = m.target as HTMLDivElement;

            const workspaceId = this.getWorkspaceIdFromContents(targetDiv);
            const action = targetDiv.style.display === "none" ? "workspace-contents-hidden" : "workspace-contents-shown";
            this.callbackRegistry.execute(action, workspaceId);
        });
    });

    public get decoratedFactory(): DecoratedFactory {
        return this._decoratedFactory;
    }

    public init(frameId: string, componentsFactory?: ComponentFactory): void {
        this.componentsFactory = componentsFactory;
        if (componentsFactory?.createAddWorkspace) {
            this.decoratedFactory.createAddWorkspace = (...args) => {
                args[0].frameId = frameId;
                this.visibilityState.addWorkspace = [...args];

                return this.componentsFactory.createAddWorkspace(...args);
            };
        }

        if (componentsFactory?.createWorkspaceTabs) {
            this.decoratedFactory.createWorkspaceTabs = (args) => {
                if (args.isSelected === true) {
                    this.changeSelectedState(args);
                }

                const previousEntry = this.visibilityState.workspaceTabs[args.workspaceId] ?? {};
                this.visibilityState.workspaceTabs[args.workspaceId] = { ...previousEntry, ...args };

                let workspaceUnsub = () => {
                    // do nothing
                };
                const cleanUp = () => {
                    if (this.componentsFactory.removeWorkspaceTabs) {
                        this.componentsFactory.removeWorkspaceTabs({ elementId: args?.workspaceId });
                    }
                    delete this.visibilityState.workspaceTabs[args.workspaceId];
                    workspaceUnsub();
                };
                workspaceUnsub = this.onWorkspaceClosed(args.workspaceId, cleanUp);
                return componentsFactory.createWorkspaceTabs(args);
            };
        }

        if (componentsFactory?.createLogo) {
            this.decoratedFactory.createLogo = (...args) => {
                args[0].frameId = frameId;
                this.visibilityState.logo = [...args];

                return this.componentsFactory.createLogo(...args);
            };
        }

        if (componentsFactory?.createSystemButtons) {
            this.decoratedFactory.createSystemButtons = (...args) => {
                args[0].frameId = frameId;
                this.visibilityState.systemButtons = [...args];

                return componentsFactory.createSystemButtons(...args);
            };
        }

        if (componentsFactory?.createWorkspaceContents) {
            this.decoratedFactory.createWorkspaceContents = (...args) => {
                const visibilityStateEntry = args;
                this.visibilityState.workspaceContents.push(visibilityStateEntry);

                const unsub = this.onWorkspaceClosed(args[0]?.workspaceId, () => {
                    this.componentsFactory.removeWorkspaceContents({ workspaceId: args[0]?.workspaceId });
                    this.visibilityState.workspaceContents = this.visibilityState.workspaceContents.filter((entry) => entry !== visibilityStateEntry);
                    unsub();
                });

                this.subscribeForWorkspaceContentsVisibility(args[0]?.workspaceId);
                return componentsFactory.createWorkspaceContents(...args);
            };
        }

        if (componentsFactory?.createBeforeGroupTabs) {
            this.decoratedFactory.createBeforeGroupTabs = (...args) => {
                const visibilityStateEntry = args;
                this.visibilityState.beforeGroupTabs.push(visibilityStateEntry);
                let groupUnsub = () => {
                    // do nothing
                };
                let workspaceUnsub = () => {
                    // do nothing
                };
                const cleanUp = () => {
                    if (this.componentsFactory.removeBeforeGroupTabs) {
                        this.componentsFactory.removeBeforeGroupTabs({ elementId: args[0]?.elementId });
                    }
                    this.visibilityState.beforeGroupTabs = this.visibilityState.beforeGroupTabs.filter((entry) => entry !== visibilityStateEntry);
                    groupUnsub();
                    workspaceUnsub();
                };
                groupUnsub = this.onGroupClosed(args[0]?.groupId, cleanUp);
                workspaceUnsub = this.onWorkspaceClosed(args[0]?.workspaceId, cleanUp);
                return componentsFactory.createBeforeGroupTabs(...args);
            };
        }

        if (componentsFactory?.createAfterGroupTabs) {
            this.decoratedFactory.createAfterGroupTabs = (...args) => {
                const visibilityStateEntry = args;
                this.visibilityState.afterGroupTabs.push(visibilityStateEntry);
                let groupUnsub = () => {
                    // do nothing
                };
                let workspaceUnsub = () => {
                    // do nothing
                };
                const cleanUp = () => {
                    if (this.componentsFactory.removeAfterGroupTabs) {
                        this.componentsFactory.removeAfterGroupTabs({ elementId: args[0]?.elementId });
                    }
                    this.visibilityState.afterGroupTabs = this.visibilityState.afterGroupTabs.filter((entry: any[]) => entry !== visibilityStateEntry);
                    groupUnsub();
                    workspaceUnsub();
                };
                groupUnsub = this.onGroupClosed(args[0]?.groupId, cleanUp);
                workspaceUnsub = this.onWorkspaceClosed(args[0]?.workspaceId, cleanUp);
                return componentsFactory.createAfterGroupTabs(...args);
            };
        }

        if (componentsFactory?.updateWorkspaceTabs) {
            this.decoratedFactory.updateWorkspaceTabs = (args) => {
                if (!this.visibilityState.workspaceTabs[args.workspaceId]) {
                    return;
                }
                if (args.isSelected === true) {
                    this.changeSelectedState(args as CreateWorkspaceTabsOptions);
                }

                const previousEntry = this.visibilityState.workspaceTabs[args.workspaceId] ?? {};
                this.visibilityState.workspaceTabs[args.workspaceId] = { ...previousEntry, ...args } as CreateWorkspaceTabsOptions;
                componentsFactory.updateWorkspaceTabs(args as CreateWorkspaceTabsOptions);
            };
        } else {
            this.decoratedFactory.updateWorkspaceTabs = () => {
                // do nothing
            };
        }

        if (componentsFactory) {
            this.decoratedFactory.createId = () => {
                return shortid.generate();
            };

            this.decoratedFactory.createWorkspaceTabsOptions = ({ element, contentItem }) => {
                const itemIndex = contentItem.parent.contentItems.indexOf(contentItem);
                const isSelected = itemIndex === ((contentItem.parent.config as any).activeItemIndex || 0); // copied from the stack init in GL
                return {
                    domNode: element,
                    workspaceId: idAsString(contentItem.config.id),
                    title: contentItem.config.title,
                    isSelected,
                    isPinned: contentItem.config.workspacesConfig.isPinned,
                    icon: contentItem.config.workspacesConfig.icon,
                    showSaveButton: contentItem.config.workspacesConfig.showSaveButton ?? true,
                    showCloseButton: contentItem.config.workspacesConfig.showCloseButton ?? true,
                    layoutName: contentItem.config.workspacesConfig.layoutName
                };
            };
        }
    }

    public reInitialize(incomingFactory?: ComponentFactory) {
        if (incomingFactory?.createAddWorkspace && this.visibilityState.addWorkspace) {
            incomingFactory.createAddWorkspace(...this.visibilityState.addWorkspace);
        }

        if (incomingFactory?.createWorkspaceTabs) {
            Object.values(this.visibilityState.workspaceTabs).forEach((wt) => {
                incomingFactory.createWorkspaceTabs(wt);
            });
        }

        if (incomingFactory?.createLogo && this.visibilityState.logo) {
            incomingFactory.createLogo(...this.visibilityState.logo);
        }

        if (incomingFactory?.createSystemButtons && this.visibilityState.systemButtons) {
            incomingFactory.createSystemButtons(...this.visibilityState.systemButtons);
        }

        if (incomingFactory?.createWorkspaceContents) {
            this.visibilityState.workspaceContents.forEach((wc) => {
                incomingFactory.createWorkspaceContents(...wc);
            });
        }

        if (incomingFactory?.createBeforeGroupTabs) {
            this.visibilityState.beforeGroupTabs.forEach((g) => {
                incomingFactory.createBeforeGroupTabs(...g);
            });
        }

        if (incomingFactory?.createAfterGroupTabs) {
            this.visibilityState.afterGroupTabs.forEach((g) => {
                incomingFactory.createAfterGroupTabs(...g);
            });
        }

        this.componentsFactory = incomingFactory;
    }

    public onWorkspaceContentsShown(callback: (workspaceId: string) => void) {
        this.callbackRegistry.add("workspace-contents-shown", callback);
    }

    public onWorkspaceContentsHidden(callback: (workspaceId: string) => void) {
        this.callbackRegistry.add("workspace-contents-hidden", callback);
    }

    public notifyWorkspaceClosed(workspaceId: string) {
        this.callbackRegistry.execute(`workspace-closed-${workspaceId}`, workspaceId);
    }

    public notifyGroupClosed(groupId: string) {
        this.callbackRegistry.execute(`group-closed-${groupId}`, groupId);
    }

    private onWorkspaceClosed(workspaceId: string, callback: (workspaceId: string) => void) {
        return this.callbackRegistry.add(`workspace-closed-${workspaceId}`, callback);
    }

    private onGroupClosed(groupId: string, callback: (groupId: string) => void) {
        return this.callbackRegistry.add(`group-closed-${groupId}`, callback);
    }

    private subscribeForWorkspaceContentsVisibility(workspaceId: string) {
        const contentsElement = document.getElementById(`nestHere${workspaceId}`);
        if (!contentsElement) {
            return;
        }
        this.observer.observe(contentsElement, {
            attributes: true,
            attributeFilter: ["style"]
        });
    }

    private getWorkspaceIdFromContents(element: HTMLElement) {
        return element.id.split("nestHere")[1];
    }

    private changeSelectedState(args: CreateWorkspaceTabsOptions) {
        const previouslySelected = this.lastSelectedWorkspaceTab;

        if (previouslySelected) {
            this.decoratedFactory.updateWorkspaceTabs({ workspaceId: previouslySelected.workspaceId, isSelected: false });
        }

        this.lastSelectedWorkspaceTab = args as CreateWorkspaceTabsOptions;
    }
}

export default new ComponentStateMonitor();
