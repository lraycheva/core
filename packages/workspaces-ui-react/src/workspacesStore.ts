import { AddApplicationPopupProps, AddWorkspacePopupProps, CreateElementRequestOptions, CreateGroupRequestOptions, CreateWorkspaceContentsRequestOptions, CreateWorkspaceTabRequestOptions, ElementCreationWrapperState, RemoveRequestOptions, RemoveWorkspaceContentsRequestOptions, SaveWorkspacePopupProps } from "./types/internal";

class WorkspacesStore {
    private listeners = new Set<() => void>();
    private state: ElementCreationWrapperState = {
        logo: undefined,
        workspaceTabs: {},
        addWorkspace: undefined,
        systemButtons: undefined,
        workspaceContents: [],
        beforeGroupTabsZones: {},
        afterGroupTabsZones: {},
        saveWorkspacePopup: undefined,
        addApplicationPopup: undefined,
        addWorkspacePopup: undefined,
    };

    public subscribe = (cb: () => void) => {
        this.listeners.add(cb);
        return () => {
            this.listeners.delete(cb);
        };
    }

    public getSnapshot = () => {
        return this.state;
    }

    public onCreateLogoRequested = (options: CreateElementRequestOptions) => {
        if (options === this.state.logo) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                logo: options
            }
        });
    }

    public onCreateWorkspaceTabRequested = (options: CreateWorkspaceTabRequestOptions) => {
        if (options === this.state.workspaceTabs[options.workspaceId] || !options) {
            return;
        }
        this.setState(s => {
            const workspaceTabsObj = Object.keys(s.workspaceTabs).reduce((acc, workspaceId) => {
                acc[workspaceId] = s.workspaceTabs[workspaceId];
                return acc;
            }, {});

            const previousObj = workspaceTabsObj[options.workspaceId] ?? {};
            workspaceTabsObj[options.workspaceId] = { ...previousObj, ...options };
            return {
                ...s,
                workspaceTabs: workspaceTabsObj
            }
        });
    }

    public onCreateAddWorkspaceRequested = (options: CreateElementRequestOptions) => {
        if (options === this.state.addWorkspace) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                addWorkspace: options
            }
        });
    }

    public onCreateSystemButtonsRequested = (options: CreateElementRequestOptions) => {
        if (options === this.state.systemButtons) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                systemButtons: options
            }
        });
    }

    public onCreateWorkspaceContentsRequested = (options: CreateWorkspaceContentsRequestOptions) => {
        if (this.state.workspaceContents.some(wc => wc.domNode === options.domNode)) {
            return;
        }

        this.setState(s => {
            return {
                ...s,
                workspaceContents: [
                    ...s.workspaceContents,
                    options
                ]
            }
        });
    }

    public onCreateBeforeGroupTabsComponentRequested = (options: CreateGroupRequestOptions) => {
        if (options === this.state.beforeGroupTabsZones[options.groupId] || !options) {
            return;
        }
        this.setState(s => {
            const beforeTabsZonesObj = Object.keys(s.beforeGroupTabsZones).reduce((acc, groupId) => {
                acc[groupId] = s.beforeGroupTabsZones[groupId];
                return acc;
            }, {});

            beforeTabsZonesObj[options.groupId] = options;
            return {
                ...s,
                beforeGroupTabsZones: beforeTabsZonesObj
            }
        });
    }

    public onCreateAfterGroupTabsComponentRequested = (options: CreateGroupRequestOptions) => {
        if (options === this.state.afterGroupTabsZones[options.groupId] || !options) {
            return;
        }
        this.setState(s => {
            const afterTabsZonesObj = Object.keys(s.afterGroupTabsZones).reduce((acc, groupId) => {
                acc[groupId] = s.afterGroupTabsZones[groupId];
                return acc;
            }, {});

            afterTabsZonesObj[options.groupId] = options;
            return {
                ...s,
                afterGroupTabsZones: afterTabsZonesObj
            }
        });
    }

    public onCreateSaveWorkspaceRequested = (options: CreateElementRequestOptions & SaveWorkspacePopupProps) => {
        if (options === this.state.saveWorkspacePopup) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                saveWorkspacePopup: options
            }
        }, options.callback);
    }

    public onCreateAddApplicationRequested = (options: CreateElementRequestOptions & AddApplicationPopupProps) => {
        if (options === this.state.addApplicationPopup) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                addApplicationPopup: options
            }
        }, options.callback);
    }

    public onCreateAddWorkspacePopupRequested = (options: CreateElementRequestOptions & AddWorkspacePopupProps) => {
        if (options === this.state.addWorkspacePopup) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                addWorkspacePopup: options
            }
        }, options.callback);
    }

    public onUpdateWorkspaceTabRequested = (options: CreateWorkspaceTabRequestOptions) => {
        if (!this.state.workspaceTabs[options.workspaceId] || !options) {
            return;
        }
        this.setState(s => {
            const workspaceTabsObj = Object.keys(s.workspaceTabs).reduce((acc, workspaceId) => {
                acc[workspaceId] = s.workspaceTabs[workspaceId];
                return acc;
            }, {});

            const previousObj = workspaceTabsObj[options.workspaceId] ?? {};
            workspaceTabsObj[options.workspaceId] = { ...previousObj, ...options };
            return {
                ...s,
                workspaceTabs: workspaceTabsObj
            }
        });
    }

    public onRemoveWorkspaceTabRequested = (options: RemoveRequestOptions) => {
        if (!this.state.workspaceTabs[options.elementId]) {
            return;
        }
        this.setState(s => {
            const newTabElementsObj = Object.keys(s.workspaceTabs).reduce((acc, workspaceId) => {
                if (workspaceId != options.elementId) {
                    acc[workspaceId] = s.workspaceTabs[workspaceId];
                }
                return acc;
            }, {});

            return {
                ...s,
                workspaceTabs: newTabElementsObj
            }
        });
    }

    public onRemoveWorkspaceContentsRequested = (options: RemoveWorkspaceContentsRequestOptions) => {
        this.setState(s => {
            return {
                ...s,
                workspaceContents: [
                    ...s.workspaceContents.filter((wc) => wc.workspaceId !== options.workspaceId),
                ]
            }
        });
    }

    public onRemoveBeforeTabsComponentRequested = (options: RemoveRequestOptions) => {
        if (!this.state.beforeGroupTabsZones[options.elementId]) {
            return;
        }
        this.setState(s => {
            const newTabElementsObj = Object.keys(s.beforeGroupTabsZones).reduce((acc, elementId) => {
                if (elementId != options.elementId) {
                    acc[elementId] = s.beforeGroupTabsZones[elementId];
                }
                return acc;
            }, {});

            return {
                ...s,
                beforeGroupTabsZones: newTabElementsObj
            }
        });
    }

    public onRemoveAfterTabsComponentRequested = (options: RemoveRequestOptions) => {
        if (!this.state.afterGroupTabsZones[options.elementId]) {
            return;
        }
        this.setState(s => {
            const newTabElementsObj = Object.keys(s.afterGroupTabsZones).reduce((acc, elementId) => {
                if (elementId != options.elementId) {
                    acc[elementId] = s.afterGroupTabsZones[elementId];
                }
                return acc;
            }, {});

            return {
                ...s,
                afterGroupTabsZones: newTabElementsObj
            }
        });
    }

    public onHideSystemPopups = (cb: () => void) => {
        this.setState((s) => ({
            ...s,
            addApplicationPopup: undefined,
            saveWorkspacePopup: undefined,
            addWorkspacePopup: undefined
        }), cb);
    }

    private setState(cb: (ns: ElementCreationWrapperState) => ElementCreationWrapperState, afterUpdateCallback?: () => void) {
        this.state = cb(this.state);
        if (typeof afterUpdateCallback === "function") {
            afterUpdateCallback();
        }

        this.listeners.forEach((l) => l());
    }
}

export default new WorkspacesStore();