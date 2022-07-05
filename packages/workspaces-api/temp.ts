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
}