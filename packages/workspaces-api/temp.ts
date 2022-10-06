import { Glue42Workspaces } from "./workspaces";

export interface API extends Glue42Workspaces.API {
  /**
     * Notifies when a window was maximized in any workspace in any frame and returns an unsubscribe function.
     * A maximized window means that the window has been maximized either by an API call or from the maximize button by the user.
     * @param callback Callback function to handle the event. Receives the maximized window as a parameter.
     */
  onWindowMaximized(callback: (workspaceWindow: Glue42Workspaces.WorkspaceWindow) => void): Promise<Glue42Workspaces.Unsubscribe>;

  /**
    * Notifies when a window was restored from a maximized state in any workspace in any frame and returns an unsubscribe function.
    * A restored window means that the window has been restored from a maximized state either by an API call or from the restore button by the user.
    * @param callback Callback function to handle the event. Receives the restored window as a parameter.
    */
  onWindowRestored(callback: (workspaceWindow: Glue42Workspaces.WorkspaceWindow) => void): Promise<Glue42Workspaces.Unsubscribe>;
}

export interface Workspace extends Glue42Workspaces.Workspace {
  /**
    * Notifies when a window was maximized in this workspace and returns an unsubscribe function.
    * A maximized window means that the window has been maximized either by an API call or from the maximize button by the user.
    * @param callback Callback function to handle the event. Receives the maximized window as a parameter.
    */
  onWindowMaximized(callback: (window: Glue42Workspaces.WorkspaceWindow) => void): Promise<Glue42Workspaces.Unsubscribe>;

  /**
    * Notifies when a window was restored in this workspace and returns an unsubscribe function.
    * A restored window means that the window has been restored from a maximized state either by an API call or from the restored button by the user.
    * @param callback Callback function to handle the event. Receives the restored window as a parameter.
    */
  onWindowRestored(callback: (window: Glue42Workspaces.WorkspaceWindow) => void): Promise<Glue42Workspaces.Unsubscribe>;

  /**
   * Shows the loading animation of the workspace (supported only in Glue42 Enterprise)
   */
  showLoadingAnimation(): Promise<void>;

  /**
   * Hides the loading animation of the workspace (supported only in Glue42 Enterprise)
   */
  hideLoadingAnimation(): Promise<void>;

  /**
   * Notifies when the a change in the lock configuration of the workspace has been made
   * @param callback Callback function to handle the event. Receives the new lock configuration as a parameter.
   */
  onLockConfigurationChanged(callback: (config: Glue42Workspaces.WorkspaceLockConfig) => void): Promise<Glue42Workspaces.Unsubscribe>;
}

export interface SetMaximizationBoundaryConfig {
  /**
   * Represents the new value of the maximizationBoundary property
   */
  enabled: boolean;
}

export interface Row extends Glue42Workspaces.Row {
  /**
   * Changes whether the row is a maximizationBoundary
   * @param config Object which specifies how the maximizationBoundary behavior should be changed
   */
  setMaximizationBoundary(config: SetMaximizationBoundaryConfig): Promise<void>

  /**
   * Notifies when the a change in the lock configuration of the row has been made
   * @param callback Callback function to handle the event. Receives the new lock configuration as a parameter
   */
  onLockConfigurationChanged(callback: (config: Glue42Workspaces.RowLockConfig) => void): Promise<Glue42Workspaces.Unsubscribe>
}

export interface Column extends Glue42Workspaces.Column {
  /**
   * Changes whether the column is a maximizationBoundary
   * @param config Object which specifies how the maximizationBoundary behavior should be changed
   */
  setMaximizationBoundary(config: SetMaximizationBoundaryConfig): Promise<void>

  /**
   * Notifies when the a change in the lock configuration of the column has been made
   * @param callback Callback function to handle the event. Receives the new lock configuration as a parameter
   */
  onLockConfigurationChanged(callback: (config: Glue42Workspaces.ColumnLockConfig) => void): Promise<Glue42Workspaces.Unsubscribe>
}

export interface Group extends Glue42Workspaces.Group {
  /**
  * Notifies when a change in the lock configuration of the group has been made
  * @param callback Callback function to handle the event. Receives the new lock configuration as a parameter
  */
  onLockConfigurationChanged(callback: (config: Glue42Workspaces.GroupLockConfig) => void): Promise<Glue42Workspaces.Unsubscribe>
}

export interface WorkspaceWindow extends Glue42Workspaces.WorkspaceWindow {
  /**
   * Notifies when a change in the lock configuration of the workspace window has been made
   * @param callback Callback function to handle the event. Receives the new lock configuration as a parameter
   */
  onLockConfigurationChanged(callback: (config: Glue42Workspaces.WorkspaceWindowLockConfig) => void): Promise<Glue42Workspaces.Unsubscribe>
}

export interface FrameFocusChangedData {
  isFocused: boolean;
}

export interface Frame extends Glue42Workspaces.Frame {
  /**
   * Triggered when either a window in the frame is focused or the frame itself (supported only in Glue42 Enterprise).
   * @param data Object which specifies whether the frame has lost or got focus
   */
  onFocusChanged(data: FrameFocusChangedData): Promise<Glue42Workspaces.Unsubscribe>;
}