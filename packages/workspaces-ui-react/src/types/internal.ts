import React, { CSSProperties, RefObject } from "react";
import { PopupActions, PopupProps } from "reactjs-popup/dist/types";

export interface ElementCreationWrapperState {
  logo?: CreateElementRequestOptions;
  workspaceTabs: { [elementId: string]: CreateWorkspaceTabRequestOptions };
  addWorkspace?: CreateElementRequestOptions;
  systemButtons?: CreateElementRequestOptions;
  workspaceContents: CreateWorkspaceContentsRequestOptions[];
  beforeGroupTabsZones: { [elementId: string]: CreateGroupRequestOptions };
  afterGroupTabsZones: { [elementId: string]: CreateGroupRequestOptions };
  saveWorkspacePopup?: SaveWorkspacePopupComponentProps & CreateElementRequestOptions;
  addApplicationPopup?: AddApplicationPopupComponentProps & CreateElementRequestOptions;
  addWorkspacePopup?: AddWorkspacePopupComponentProps & CreateElementRequestOptions;
  shouldInit: boolean;
}

export interface WorkspacesWrapperProps {
  onCreateLogoRequested?: (options: CreateElementRequestOptions) => void;
  onCreateWorkspaceTabRequested?: (options: CreateWorkspaceTabRequestOptions) => void;
  onCreateAddWorkspaceRequested?: (options: CreateElementRequestOptions) => void;
  onCreateSystemButtonsRequested?: (options: CreateElementRequestOptions) => void;
  onCreateWorkspaceContentsRequested?: (options: CreateElementRequestOptions) => void;
  onCreateBeforeGroupTabsRequested?: (options: CreateGroupRequestOptions) => void;
  onCreateGroupTabRequested?: (options: CreateGroupTabRequestOptions) => void;
  onCreateAfterGroupTabsRequested?: (options: CreateGroupRequestOptions) => void;
  onCreateGroupHeaderButtonsRequested?: (options: CreateGroupRequestOptions) => void;
  onCreateSaveWorkspacePopupRequested?: (options: SaveWorkspacePopupComponentProps & CreateElementRequestOptions) => void;
  onCreateAddApplicationPopupRequested?: (options: AddApplicationPopupComponentProps & CreateElementRequestOptions) => void;
  onCreateAddWorkspacePopupRequested?: (options: AddWorkspacePopupComponentProps & CreateElementRequestOptions) => void;
  onHideSystemPopupsRequested?: (cb: () => void) => void;
  onUpdateWorkspaceTabsRequested?: (options: CreateWorkspaceTabRequestOptions) => void;
  onRemoveWorkspaceTabsRequested?: (options: RemoveRequestOptions) => void;
  onRemoveWorkspaceContentsRequested?: (options: RemoveWorkspaceContentsRequestOptions) => void;
  onRemoveBeforeGroupTabsRequested?: (options: RemoveRequestOptions) => void;
  onRemoveGroupTabRequested?: (options: RemoveRequestOptions) => void;
  onRemoveAfterGroupTabsRequested?: (options: RemoveRequestOptions) => void;
  onRemoveGroupHeaderButtonsRequested?: (options: RemoveRequestOptions) => void;
  externalPopupApplications: {
    addApplication: string | undefined;
    saveWorkspace: string | undefined;
    addWorkspace: string | undefined;
  }
  glue?: any;
  shouldInit: boolean;
}

export interface WorkspaceContentsProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  workspaceId: string;
  frameId?: string;
  containerElement?: HTMLElement;
}

export interface GroupHeaderComponentProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  groupId: string;
  workspaceId: string;
}

export interface GroupTabComponentProps extends GroupHeaderComponentProps {
  windowId: string;
}

export interface CreateWorkspaceContentsRequestOptions extends CreateElementRequestOptions {
  workspaceId: string
}

export interface CreateWorkspaceTabRequestOptions extends CreateElementRequestOptions {
  workspaceId: string;
  title: string;
  isSelected: boolean;
  isPinned: boolean;
  icon: string;
  showSaveButton: boolean;
  showCloseButton: boolean;
  layoutName: string;
}

export interface CreateGroupRequestOptions extends CreateElementRequestOptions {
  groupId: string;
  workspaceId: string;
}

export interface CreateGroupTabRequestOptions extends CreateGroupRequestOptions {
  windowId: string;
}

export interface RemoveWorkspaceContentsRequestOptions {
  workspaceId: string;
}

export interface RemoveRequestOptions {
  elementId: string;
}

export interface CreateElementRequestOptions {
  domNode: HTMLElement;
  callback?: () => void;
  frameId: string;
  [k: string]: any;
}


export interface PortalProps {
  domNode: HTMLElement
}

export interface WorkspacesManager {
  getFrameId(): string;
  init(componentFactory: any): void;
  notifyMoveAreaChanged(): void;
  notifyWorkspacePopupChanged(element: HTMLElement): string;
  getComponentBounds(): Bounds;
  registerPopup(element: HTMLElement): string;
  removePopup(element: HTMLElement): void;
  removePopupById(elementId: string): void;
  subscribeForWindowFocused(cb: () => any): () => void;
  unmount(): void;
  requestFocus(): void;
  showSaveWorkspacePopup(workspaceId: string, bounds: Bounds): void;
  closeWorkspace(workspaceId: string): void;
}

export interface HeaderComponentProps {
  frameId: string;
  [k: string]: any;
}

export interface WorkspaceTabComponentProps {
  workspaceId: string;
  isSelected: boolean;
  isPinned: boolean;
  title: string;
  icon: string;
  showSaveButton: boolean;
  showCloseButton: boolean;
  layoutName: string;
  onCloseClick: () => void;
  onSaveClick: (bounds: Bounds) => void;
}


export interface WorkspacesProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  components?: {
    header?: {
      LogoComponent?: React.ComponentType<HeaderComponentProps>;
      WorkspaceTabComponent?: React.ComponentType<WorkspaceTabComponentProps>;
      AddWorkspaceComponent?: React.ComponentType<HeaderComponentProps>;
      SystemButtonsComponent?: React.ComponentType<HeaderComponentProps>;
    };
    WorkspaceContents?: React.ComponentType<WorkspaceContentsProps>;
    containers?: {
      group?: {
        header?: {
          BeforeTabs?: React.ComponentType<GroupHeaderComponentProps>;
          AfterTabs?: React.ComponentType<GroupHeaderComponentProps>;
        };
      };
    };
    popups?: {
      SaveWorkspaceComponent?: React.ComponentType<SaveWorkspacePopupComponentProps> | string;
      AddApplicationComponent?: React.ComponentType<AddApplicationPopupComponentProps> | string;
      AddWorkspaceComponent?: React.ComponentType<AddWorkspacePopupComponentProps> | string;
    };
  };
  glue?: any;
}

export interface Bounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ButtonProps extends React.DetailedHTMLProps<React.HtmlHTMLAttributes<HTMLLIElement>, HTMLLIElement> {
  title?: string;
  frameId?: string;
}

export type AddWorkspaceButtonProps = ButtonProps;
export type CloseFrameButtonProps = ButtonProps;
export type MinimizeFrameButtonProps = ButtonProps;
export type MaximizeFrameButtonProps = ButtonProps;
export type MaximizeGroupButtonProps = ButtonProps;
export type EjectButtonProps = ButtonProps;
export type AddWindowButtonProps = ButtonProps;


export interface WorkspacePopupProps extends Omit<PopupProps, "ref"> {
  // bounds: Bounds;
  innerContentStyle?: CSSProperties;
  popupRef?: RefObject<PopupActions>;
}

export interface GlueLogoProps extends React.DetailedHTMLProps<React.HtmlHTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  frameId?: string;
}

export interface SaveWorkspacePopupProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  workspaceId: string,
  glue?: any,
  resizePopup: (s: Size) => void,
  hidePopup: () => void,
  buildMode?: boolean,
}

export interface AddApplicationPopupProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  workspaceId: string;
  glue?: any;
  resizePopup: (s: Size) => void;
  hidePopup: () => void;
  boxId: string;
  frameId?: string;
  filterApps?: (glueApp: any) => boolean;
}

export interface AddWorkspacePopupProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  frameId: string,
  glue?: any,
  filterLayouts?: (layouts: any) => boolean;
  resizePopup: (s: Size) => void,
  hidePopup: () => void
}

export interface Size {
  width?: number;
  height?: number;
}

export interface AddWorkspacePopupComponentProps {
  frameId: string;
  resizePopup: (s: Size) => void;
  hidePopup: () => void;
  glue?: any;
}

export interface AddApplicationPopupComponentProps {
  workspaceId: string;
  boxId: string;
  resizePopup: (s: Size) => void;
  hidePopup: () => void;
  glue?: any;
}

export interface SaveWorkspacePopupComponentProps {
  workspaceId: string;
  resizePopup: (s: Size) => void;
  hidePopup: () => void;
  glue?: any;
}

export interface ApplicationItemProps {
  appName: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface ApplicationListProps {
  glue: any;
  inLane: boolean;
  parent: any;
  hidePopup: () => void;
  searchTerm: string;
  updatePopupHeight: () => void;
  filterApps?: (glueApplication: any) => boolean;
}

export interface ContainerSwitchProps {
  inLane: boolean;
  setInLane: (b: boolean) => void;
  parent: any;
}

export interface WorkspaceLayoutItemProps {
  name: string,
  onClick: (e: React.MouseEvent) => void,
  onCloseClick: (e: React.MouseEvent) => void
}

export interface WorkspaceLayoutsListProps {
  glue: any;
  frameId: string;
  showFeedback: (errMsg: string) => void;
  hidePopup: () => void;
  resizePopup: () => void;
  filterLayouts?: (layout: any) => boolean;
}

export interface SaveContextCheckboxProps {
  changeChecked: (value: boolean) => void;
  refreshHeight: () => void;
}

export interface SaveWorkspaceButtonProps {
  workspaceId: string;
  inputValue: string;
  clearInput: () => void;
  showFeedback: (errorMsg: string) => void;
  shouldSaveContext: boolean;
  hideFeedback: () => void;
  glue: any;
  hidePopup: () => void;
  buildMode?: boolean;
}

export interface WorkspaceContentsProps {
  workspaceId: string;
}

export interface SaveButtonProps {
  showSavePopup: (bounds: Bounds) => void;
}

export interface WorkspaceIconButtonProps {
  icon: string;
}

export interface WorkspaceTabCloseButtonProps {
  close: () => void;
}

export interface WorkspaceTitleProps {
  title: string;
}

export type MoveAreaProps = React.DetailedHTMLProps<React.HtmlHTMLAttributes<HTMLDivElement>, HTMLDivElement>;
