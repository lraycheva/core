import React, { useEffect, useState } from "react";
import AddApplicationPopup from "./defaultComponents/popups/addApplication/AddApplicationPopup";
import AddWorkspacePopup from "./defaultComponents/popups/addWorkspace/AddWorkspacePopup";
import SaveWorkspacePopup from "./defaultComponents/popups/saveWorkspace/SaveWorkspacePopup";
import Portal from "./Portal";
import { ElementCreationWrapperState, WorkspacesProps, Bounds } from "./types/internal";
import workspacesManager from "./workspacesManager";
import WorkspacesWrapper from "./WorkspacesWrapper";
import workspacesStore from "./workspacesStore";
import { useSyncExternalStore } from "use-sync-external-store/shim";

const WorkspacesElementCreationWrapper: React.FC<WorkspacesProps> = ({ components, glue, ...additionalProperties }) => {
    const state = useSyncExternalStore<ElementCreationWrapperState>(workspacesStore.subscribe, workspacesStore.getSnapshot);
    const [shouldInit, setShouldInit] = useState(false);

    useEffect(() => {
        setShouldInit(true);
    }, []);

    const addApplicationComponent = components?.popups?.AddApplicationComponent || AddApplicationPopup;
    const saveWorkspaceComponent = components?.popups?.SaveWorkspaceComponent || SaveWorkspacePopup;
    const addWorkspaceComponent = components?.popups?.AddWorkspaceComponent || AddWorkspacePopup;

    const onCreateAddApplicationRequested = addApplicationComponent && typeof addApplicationComponent !== "string" ?
        workspacesStore.onCreateAddApplicationRequested : undefined;

    const onCreateAddWorkspacePopupRequested = addWorkspaceComponent && typeof addWorkspaceComponent !== "string" ?
        workspacesStore.onCreateAddWorkspacePopupRequested : undefined;

    const onCreateSaveWorkspaceRequested = saveWorkspaceComponent && typeof saveWorkspaceComponent !== "string" ?
        workspacesStore.onCreateSaveWorkspaceRequested : undefined;

    const addApplication = typeof addApplicationComponent === "string" ? addApplicationComponent : undefined;
    const saveWorkspace = typeof saveWorkspaceComponent === "string" ? saveWorkspaceComponent : undefined;
    const addWorkspace = typeof addWorkspaceComponent === "string" ? addWorkspaceComponent : undefined;

    const externalPopupApplications = {
        addApplication,
        saveWorkspace,
        addWorkspace
    }
    const renderLogoComponent = () => {
        const LogoCustomElement = components?.header?.LogoComponent;
        if (!LogoCustomElement || (!state.logo || !state.logo.domNode)) {
            return;
        }

        const { domNode, callback, ...options } = state.logo;
        return <Portal domNode={domNode}><LogoCustomElement {...options} /></Portal>
    }

    const renderWorkspaceTabs = () => {
        const TabComponent = components?.header?.WorkspaceTabComponent;

        return Object.values(state.workspaceTabs).map((g) => {
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

    const renderAddWorkspaceComponent = () => {
        const AddWorkspaceCustomComponent = components?.header?.AddWorkspaceComponent;

        if (!AddWorkspaceCustomComponent || (!state.addWorkspace || !state.addWorkspace.domNode)) {
            return;
        }

        const { domNode, callback, ...options } = state.addWorkspace;
        return <Portal domNode={domNode}><AddWorkspaceCustomComponent {...options} /></Portal>
    }

    const renderSystemButtonsComponent = () => {
        const SystemButtonsCustomComponent = components?.header?.SystemButtonsComponent;
        if (!SystemButtonsCustomComponent || (!state.systemButtons || !state.systemButtons.domNode)) {
            return;
        }

        const { domNode, callback, ...options } = state.systemButtons;

        return <Portal domNode={domNode}><SystemButtonsCustomComponent {...options} /></Portal>
    }

    const renderWorkspaceContents = () => {
        const WorkspaceContentsComponent = components?.WorkspaceContents;

        return state.workspaceContents.map((wc) => {
            if (!WorkspaceContentsComponent || !wc.domNode) {
                return;
            }

            const { domNode, callback, ...options } = wc;
            return <Portal key={options.workspaceId} domNode={domNode}><WorkspaceContentsComponent {...options} /></Portal>
        });
    }

    const renderBeforeGroupTabs = () => {
        const BeforeGroupTabsComponent = components?.containers?.group?.header?.BeforeTabs;

        return Object.values(state.beforeGroupTabsZones).map((g) => {
            if (!BeforeGroupTabsComponent || !g.domNode) {
                return;
            }

            const { domNode, callback, ...options } = g;
            return <Portal key={options.groupId} domNode={domNode}><BeforeGroupTabsComponent {...options} /></Portal>
        });
    }

    const renderAfterGroupTabs = () => {
        const AfterGroupTabsComponent = components?.containers?.group?.header?.AfterTabs;

        return Object.values(state.afterGroupTabsZones).map((g) => {
            if (!AfterGroupTabsComponent || !g.domNode) {
                return;
            }

            const { domNode, callback, ...options } = g;
            return <Portal key={options.groupId} domNode={domNode}><AfterGroupTabsComponent {...options} /></Portal>
        });
    }

    const renderSaveWorkspacePopupComponent = () => {
        const SaveWorkspaceCustomComponent = components?.popups?.SaveWorkspaceComponent || SaveWorkspacePopup;
        if (!SaveWorkspaceCustomComponent || (!state.saveWorkspacePopup || !state.saveWorkspacePopup.domNode)) {
            return;
        }

        const { domNode, ...options } = state.saveWorkspacePopup;

        return <Portal domNode={domNode}><SaveWorkspaceCustomComponent glue={glue} {...options} /></Portal>
    }

    const renderAddApplicationPopupComponent = () => {
        const AddApplicationCustomComponent = components?.popups?.AddApplicationComponent || AddApplicationPopup;
        if (!AddApplicationCustomComponent || (!state.addApplicationPopup || !state.addApplicationPopup.domNode)) {
            return;
        }

        const { domNode, ...options } = state.addApplicationPopup;

        return <Portal domNode={domNode}><AddApplicationCustomComponent glue={glue} {...options} /></Portal>
    }

    const renderAddWorkspacePopupComponent = () => {
        const AddWorkspaceCustomComponent = components?.popups?.AddWorkspaceComponent || AddWorkspacePopup;
        if (!AddWorkspaceCustomComponent || (!state.addWorkspacePopup || !state.addWorkspacePopup.domNode)) {
            return;
        }
        const { domNode, callback, ...options } = state.addWorkspacePopup;

        return <Portal domNode={domNode}><AddWorkspaceCustomComponent glue={glue} {...options} /></Portal>
    }

    return (
        <div {...additionalProperties} style={{ overflow: "hidden", width: "100%", height: "100%" }}>
            {renderLogoComponent()}
            {renderWorkspaceTabs()}
            {renderAddWorkspaceComponent()}
            {renderSystemButtonsComponent()}
            {renderWorkspaceContents()}
            {renderBeforeGroupTabs()}
            {renderAfterGroupTabs()}
            {renderSaveWorkspacePopupComponent()}
            {renderAddApplicationPopupComponent()}
            {renderAddWorkspacePopupComponent()}
            <WorkspacesWrapper
                onCreateSystemButtonsRequested={components?.header?.SystemButtonsComponent ? workspacesStore.onCreateSystemButtonsRequested : undefined}
                onCreateWorkspaceTabRequested={components?.header?.WorkspaceTabComponent ? workspacesStore.onCreateWorkspaceTabRequested : undefined}
                onCreateAddWorkspaceRequested={components?.header?.AddWorkspaceComponent ? workspacesStore.onCreateAddWorkspaceRequested : undefined}
                onCreateLogoRequested={components?.header?.LogoComponent ? workspacesStore.onCreateLogoRequested : undefined}
                onCreateWorkspaceContentsRequested={components?.WorkspaceContents ? workspacesStore.onCreateWorkspaceContentsRequested : undefined}
                onCreateBeforeGroupTabsRequested={components?.containers?.group?.header?.BeforeTabs ? workspacesStore.onCreateBeforeGroupTabsComponentRequested : undefined}
                onCreateAfterGroupTabsRequested={components?.containers?.group?.header?.AfterTabs ? workspacesStore.onCreateAfterGroupTabsComponentRequested : undefined}
                onCreateSaveWorkspacePopupRequested={onCreateSaveWorkspaceRequested}
                onCreateAddApplicationPopupRequested={onCreateAddApplicationRequested}
                onCreateAddWorkspacePopupRequested={onCreateAddWorkspacePopupRequested}
                onUpdateWorkspaceTabsRequested={components?.header?.WorkspaceTabComponent ? workspacesStore.onUpdateWorkspaceTabRequested : undefined}
                onRemoveWorkspaceTabsRequested={components?.header?.WorkspaceTabComponent ? workspacesStore.onRemoveWorkspaceTabRequested : undefined}
                onRemoveWorkspaceContentsRequested={components?.WorkspaceContents ? workspacesStore.onRemoveWorkspaceContentsRequested : undefined}
                onRemoveBeforeGroupTabsRequested={components?.containers?.group?.header?.BeforeTabs ? workspacesStore.onRemoveBeforeTabsComponentRequested : undefined}
                onRemoveAfterGroupTabsRequested={components?.containers?.group?.header?.AfterTabs ? workspacesStore.onRemoveAfterTabsComponentRequested : undefined}
                onHideSystemPopupsRequested={workspacesStore.onHideSystemPopups}
                externalPopupApplications={externalPopupApplications}
                shouldInit={shouldInit}
                glue={glue}
            />
        </div>
    );
}

export default WorkspacesElementCreationWrapper;
