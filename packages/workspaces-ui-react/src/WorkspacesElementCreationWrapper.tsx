import React, { useState } from "react";
import AddApplicationPopup from "./defaultComponents/popups/addApplication/AddApplicationPopup";
import AddWorkspacePopup from "./defaultComponents/popups/addWorkspace/AddWorkspacePopup";
import SaveWorkspacePopup from "./defaultComponents/popups/saveWorkspace/SaveWorkspacePopup";
import Portal from "./Portal";
import { AddApplicationPopupProps, CreateElementRequestOptions, ElementCreationWrapperState, AddWorkspacePopupProps, SaveWorkspacePopupProps, WorkspacesProps, CreateWorkspaceContentsRequestOptions, CreateGroupRequestOptions, RemoveWorkspaceContentsRequestOptions, CreateGroupTabRequestOptions, RemoveRequestOptions, CreateWorkspaceTabRequestOptions, Bounds } from "./types/internal";
import workspacesManager from "./workspacesManager";
import WorkspacesWrapper from "./WorkspacesWrapper";

class WorkspacesElementCreationWrapper extends React.Component<WorkspacesProps, ElementCreationWrapperState> {
    constructor(props: WorkspacesProps) {
        super(props);
        this.state = {
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
            shouldInit: false
        }
    }

    componentDidMount() {
        this.setState((s) => {
            return { ...s, shouldInit: true };
        })
    }

    onCreateLogoRequested = (options: CreateElementRequestOptions) => {
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

    onCreateWorkspaceTabRequested = (options: CreateWorkspaceTabRequestOptions) => {
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

    onCreateAddWorkspaceRequested = (options: CreateElementRequestOptions) => {
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

    onCreateSystemButtonsRequested = (options: CreateElementRequestOptions) => {
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

    onCreateWorkspaceContentsRequested = (options: CreateWorkspaceContentsRequestOptions) => {
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

    onCreateBeforeGroupTabsComponentRequested = (options: CreateGroupRequestOptions) => {
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

    onCreateAfterGroupTabsComponentRequested = (options: CreateGroupRequestOptions) => {
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

    onCreateSaveWorkspaceRequested = (options: CreateElementRequestOptions & SaveWorkspacePopupProps) => {
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

    onCreateAddApplicationRequested = (options: CreateElementRequestOptions & AddApplicationPopupProps) => {
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

    onCreateAddWorkspacePopupRequested = (options: CreateElementRequestOptions & AddWorkspacePopupProps) => {
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

    onUpdateWorkspaceTabRequested = (options: CreateWorkspaceTabRequestOptions) => {
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

    onRemoveWorkspaceTabRequested = (options: RemoveRequestOptions) => {
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

    onRemoveWorkspaceContentsRequested = (options: RemoveWorkspaceContentsRequestOptions) => {
        this.setState(s => {
            return {
                ...s,
                workspaceContents: [
                    ...s.workspaceContents.filter((wc) => wc.workspaceId !== options.workspaceId),
                ]
            }
        });
    }

    onRemoveBeforeTabsComponentRequested = (options: RemoveRequestOptions) => {
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

    onRemoveAfterTabsComponentRequested = (options: RemoveRequestOptions) => {
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


    onHideSystemPopups = (cb: () => void) => {
        this.setState((s) => ({
            ...s,
            addApplicationPopup: undefined,
            saveWorkspacePopup: undefined,
            addWorkspacePopup: undefined
        }), cb);
    }

    renderLogoComponent = () => {
        const LogoCustomElement = this.props.components?.header?.LogoComponent;
        if (!LogoCustomElement || (!this.state.logo || !this.state.logo.domNode)) {
            return;
        }

        const { domNode, callback, ...options } = this.state.logo;
        return <Portal domNode={domNode}><LogoCustomElement {...options} /></Portal>
    }

    renderWorkspaceTabs = () => {
        const TabComponent = this.props.components?.header?.WorkspaceTabComponent;

        return Object.values(this.state.workspaceTabs).map((g) => {
            if (!TabComponent || !g.domNode) {
                return;
            }

            const { domNode, callback, ...options } = g;
            const onCloseClick = () => {
                workspacesManager.closeWorkspace(g.workspaceId);
            };

            const onSaveClick = (bounds: Bounds) => {
                workspacesManager.showSaveWorkspacePopup(g.workspaceId, bounds);
            };
            return <Portal key={`${options.workspaceId}-tab`} domNode={domNode}><TabComponent onCloseClick={onCloseClick} onSaveClick={onSaveClick} {...options} /></Portal>
        });
    }

    renderAddWorkspaceComponent = () => {
        const AddWorkspaceCustomComponent = this.props.components?.header?.AddWorkspaceComponent;

        if (!AddWorkspaceCustomComponent || (!this.state.addWorkspace || !this.state.addWorkspace.domNode)) {
            return;
        }

        const { domNode, callback, ...options } = this.state.addWorkspace;
        return <Portal domNode={domNode}><AddWorkspaceCustomComponent {...options} /></Portal>
    }

    renderSystemButtonsComponent = () => {
        const SystemButtonsCustomComponent = this.props.components?.header?.SystemButtonsComponent;
        if (!SystemButtonsCustomComponent || (!this.state.systemButtons || !this.state.systemButtons.domNode)) {
            return;
        }

        const { domNode, callback, ...options } = this.state.systemButtons;

        return <Portal domNode={domNode}><SystemButtonsCustomComponent {...options} /></Portal>
    }

    renderWorkspaceContents = () => {
        const WorkspaceContentsComponent = this.props.components?.WorkspaceContents;

        return this.state.workspaceContents.map((wc) => {
            if (!WorkspaceContentsComponent || !wc.domNode) {
                return;
            }

            const { domNode, callback, ...options } = wc;
            return <Portal key={options.workspaceId} domNode={domNode}><WorkspaceContentsComponent {...options} /></Portal>
        });
    }

    renderBeforeGroupTabs = () => {
        const BeforeGroupTabsComponent = this.props.components?.containers?.group?.header?.BeforeTabs;

        return Object.values(this.state.beforeGroupTabsZones).map((g) => {
            if (!BeforeGroupTabsComponent || !g.domNode) {
                return;
            }

            const { domNode, callback, ...options } = g;
            return <Portal key={options.groupId} domNode={domNode}><BeforeGroupTabsComponent {...options} /></Portal>
        });
    }

    renderAfterGroupTabs = () => {
        const AfterGroupTabsComponent = this.props.components?.containers?.group?.header?.AfterTabs;

        return Object.values(this.state.afterGroupTabsZones).map((g) => {
            if (!AfterGroupTabsComponent || !g.domNode) {
                return;
            }

            const { domNode, callback, ...options } = g;
            return <Portal key={options.groupId} domNode={domNode}><AfterGroupTabsComponent {...options} /></Portal>
        });
    }

    renderSaveWorkspacePopupComponent = () => {
        const SaveWorkspaceCustomComponent = this.props.components?.popups?.SaveWorkspaceComponent || SaveWorkspacePopup;
        if (!SaveWorkspaceCustomComponent || (!this.state.saveWorkspacePopup || !this.state.saveWorkspacePopup.domNode)) {
            return;
        }

        const { domNode, ...options } = this.state.saveWorkspacePopup;

        return <Portal domNode={domNode}><SaveWorkspaceCustomComponent glue={this.props.glue} {...options} /></Portal>
    }

    renderAddApplicationPopupComponent = () => {
        const AddApplicationCustomComponent = this.props.components?.popups?.AddApplicationComponent || AddApplicationPopup;
        if (!AddApplicationCustomComponent || (!this.state.addApplicationPopup || !this.state.addApplicationPopup.domNode)) {
            return;
        }

        const { domNode, ...options } = this.state.addApplicationPopup;

        return <Portal domNode={domNode}><AddApplicationCustomComponent glue={this.props.glue} {...options} /></Portal>
    }

    renderAddWorkspacePopupComponent = () => {
        const AddWorkspaceCustomComponent = this.props.components?.popups?.AddWorkspaceComponent || AddWorkspacePopup;
        if (!AddWorkspaceCustomComponent || (!this.state.addWorkspacePopup || !this.state.addWorkspacePopup.domNode)) {
            return;
        }
        const { domNode, callback, ...options } = this.state.addWorkspacePopup;

        return <Portal domNode={domNode}><AddWorkspaceCustomComponent glue={this.props.glue} {...options} /></Portal>
    }

    render() {
        const { components, glue, ...additionalProperties } = this.props;
        const addApplicationComponent = components?.popups?.AddApplicationComponent || AddApplicationPopup;
        const saveWorkspaceComponent = components?.popups?.SaveWorkspaceComponent || SaveWorkspacePopup;
        const addWorkspaceComponent = components?.popups?.AddWorkspaceComponent || AddWorkspacePopup;

        const onCreateAddApplicationRequested = addApplicationComponent && typeof addApplicationComponent !== "string" ?
            this.onCreateAddApplicationRequested : undefined;

        const onCreateAddWorkspacePopupRequested = addWorkspaceComponent && typeof addWorkspaceComponent !== "string" ?
            this.onCreateAddWorkspacePopupRequested : undefined;

        const onCreateSaveWorkspaceRequested = saveWorkspaceComponent && typeof saveWorkspaceComponent !== "string" ?
            this.onCreateSaveWorkspaceRequested : undefined;

        const addApplication = typeof addApplicationComponent === "string" ? addApplicationComponent : undefined;
        const saveWorkspace = typeof saveWorkspaceComponent === "string" ? saveWorkspaceComponent : undefined;
        const addWorkspace = typeof addWorkspaceComponent === "string" ? addWorkspaceComponent : undefined;

        const externalPopupApplications = {
            addApplication,
            saveWorkspace,
            addWorkspace
        }

        return (
            <div {...additionalProperties} style={{ overflow: "hidden", width: "100%", height: "100%" }}>
                {this.renderLogoComponent()}
                {this.renderWorkspaceTabs()}
                {this.renderAddWorkspaceComponent()}
                {this.renderSystemButtonsComponent()}
                {this.renderWorkspaceContents()}
                {this.renderBeforeGroupTabs()}
                {this.renderAfterGroupTabs()}
                {this.renderSaveWorkspacePopupComponent()}
                {this.renderAddApplicationPopupComponent()}
                {this.renderAddWorkspacePopupComponent()}
                <WorkspacesWrapper
                    onCreateSystemButtonsRequested={components?.header?.SystemButtonsComponent ? this.onCreateSystemButtonsRequested : undefined}
                    onCreateWorkspaceTabRequested={components?.header?.WorkspaceTabComponent ? this.onCreateWorkspaceTabRequested : undefined}
                    onCreateAddWorkspaceRequested={components?.header?.AddWorkspaceComponent ? this.onCreateAddWorkspaceRequested : undefined}
                    onCreateLogoRequested={components?.header?.LogoComponent ? this.onCreateLogoRequested : undefined}
                    onCreateWorkspaceContentsRequested={components?.WorkspaceContents ? this.onCreateWorkspaceContentsRequested : undefined}
                    onCreateBeforeGroupTabsRequested={components?.containers?.group?.header?.BeforeTabs ? this.onCreateBeforeGroupTabsComponentRequested : undefined}
                    onCreateAfterGroupTabsRequested={components?.containers?.group?.header?.AfterTabs ? this.onCreateAfterGroupTabsComponentRequested : undefined}
                    onCreateSaveWorkspacePopupRequested={onCreateSaveWorkspaceRequested}
                    onCreateAddApplicationPopupRequested={onCreateAddApplicationRequested}
                    onCreateAddWorkspacePopupRequested={onCreateAddWorkspacePopupRequested}
                    onUpdateWorkspaceTabsRequested={components?.header?.WorkspaceTabComponent ? this.onUpdateWorkspaceTabRequested : undefined}
                    onRemoveWorkspaceTabsRequested={components?.header?.WorkspaceTabComponent ? this.onRemoveWorkspaceTabRequested : undefined}
                    onRemoveWorkspaceContentsRequested={components?.WorkspaceContents ? this.onRemoveWorkspaceContentsRequested : undefined}
                    onRemoveBeforeGroupTabsRequested={components?.containers?.group?.header?.BeforeTabs ? this.onRemoveBeforeTabsComponentRequested : undefined}
                    onRemoveAfterGroupTabsRequested={components?.containers?.group?.header?.AfterTabs ? this.onRemoveAfterTabsComponentRequested : undefined}
                    onHideSystemPopupsRequested={this.onHideSystemPopups}
                    externalPopupApplications={externalPopupApplications}
                    shouldInit={this.state.shouldInit}
                    glue={glue}
                />
            </div>
        );
    }
}

export default WorkspacesElementCreationWrapper;
