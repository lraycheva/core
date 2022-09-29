import AddWorkspaceButton from './defaultComponents/AddWorkspaceButton';
import CloseFrameButton from './defaultComponents/CloseFrameButton';
import GlueLogo from './defaultComponents/GlueLogo';
import MaximizeFrameButton from './defaultComponents/MaximizeFrameButton';
import MinimizeFrameButton from './defaultComponents/MinimizeFrameButton';
import AddApplicationPopup from './defaultComponents/popups/addApplication/AddApplicationPopup';
import AddWorkspacePopup from './defaultComponents/popups/addWorkspace/AddWorkspacePopup';
import SaveWorkspacePopup from './defaultComponents/popups/saveWorkspace/SaveWorkspacePopup';
import WorkspaceContents from "./defaultComponents/workspace/WorkspaceContents";
import MoveArea from "./defaultComponents/MoveArea";
import useWorkspacePopup from './useWorkspacePopup';
import useWorkspaceWindowClicked from './useWorkspaceWindowClicked';

import WorkspacePopup from './WorkspacePopup';
import {
    Bounds,
    WorkspacesProps,
    AddWorkspaceButtonProps,
    MaximizeFrameButtonProps,
    MinimizeFrameButtonProps,
    SaveWorkspacePopupComponentProps,
    AddWorkspacePopupComponentProps,
    AddApplicationPopupComponentProps,
    AddWorkspacePopupProps,
    SaveWorkspacePopupProps,
    AddApplicationPopupProps,
    WorkspaceContentsProps,
    AddWindowButtonProps,
    MaximizeGroupButtonProps,
    EjectButtonProps,
    MoveAreaProps,
    WorkspaceTabComponentProps,
    GlueWorkspaceLoadingAnimationProps
} from './types/internal';
import WorkspacesElementCreationWrapper from './WorkspacesElementCreationWrapper'
import workspacesManager from './workspacesManager';
import WorkspaceTab from "./defaultComponents/workspace/WorkspaceTab";
import WorkspaceTitle from './defaultComponents/workspace/WorkspaceTitle';
import WorkspaceSaveButton from './defaultComponents/workspace/WorkspaceSaveButton';
import WorkspaceIconButton from './defaultComponents/workspace/WorkspaceIconButton';
import WorkspaceTabCloseButton from './defaultComponents/workspace/WorkspaceTabCloseButton';
import GlueWorkspaceLoadingAnimation from './defaultComponents/GlueWorkspaceLoadingAnimation';

export {
    SaveWorkspacePopup,
    AddWorkspacePopup,
    AddApplicationPopup,
    CloseFrameButton,
    GlueLogo,
    MaximizeFrameButton,
    MinimizeFrameButton,
    AddWorkspaceButton,
    WorkspacePopup,
    useWorkspacePopup,
    useWorkspaceWindowClicked,
    WorkspaceContents,
    MoveArea,
    WorkspaceTab,
    WorkspaceTitle,
    WorkspaceSaveButton,
    WorkspaceIconButton,
    WorkspaceTabCloseButton,
    GlueWorkspaceLoadingAnimation
};
export const notifyMoveAreaChanged: () => void = () => workspacesManager?.notifyMoveAreaChanged();
export const getComponentBounds: () => Bounds = () => workspacesManager?.getComponentBounds();
export const getFrameId: () => string = () => workspacesManager?.getFrameId();
export const requestFocus: () => void = () => workspacesManager?.requestFocus();

export {
    WorkspacesProps,
    Bounds,
    AddWorkspaceButtonProps,
    MaximizeFrameButtonProps,
    MinimizeFrameButtonProps,
    AddWindowButtonProps,
    MaximizeGroupButtonProps,
    EjectButtonProps,
    SaveWorkspacePopupComponentProps,
    AddWorkspacePopupComponentProps,
    AddApplicationPopupComponentProps,
    AddWorkspacePopupProps,
    SaveWorkspacePopupProps,
    AddApplicationPopupProps,
    WorkspaceContentsProps,
    MoveAreaProps,
    WorkspaceTabComponentProps,
    GlueWorkspaceLoadingAnimationProps
};
export default WorkspacesElementCreationWrapper;