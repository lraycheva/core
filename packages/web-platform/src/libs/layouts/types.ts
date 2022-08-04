import { Glue42Web } from "@glue42/web";
import { UnsubscribeFunction } from "callback-registry";
import { InternalLayoutsConfig } from "../../common/types";

export type LayoutEvent = "layoutAdded" | "layoutChanged" | "layoutRemoved";

export type LayoutsOperationTypes = "get" | "getAll" | "export" | "import" | "remove" | "save" | "restore" | "getRawWindowsLayoutData" | "clientSaveRequest" |
    "getGlobalPermissionState" | "requestGlobalPermission" | "checkGlobalActivated";

export interface LayoutModeExecutor {
    setup(config: InternalLayoutsConfig): Promise<void>;
    onLayoutEvent(callback: (payload: { operation: LayoutEvent; data: Glue42Web.Layouts.Layout }) => void): UnsubscribeFunction;
    getAll(type: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout[]>;
    save(layouts: Glue42Web.Layouts.Layout[]): Promise<void>;
    delete(name: string, type: Glue42Web.Layouts.LayoutType): Promise<boolean>;
}

export interface SimpleLayoutConfig {
    name: string;
    type: Glue42Web.Layouts.LayoutType;
}

export interface GetAllLayoutsConfig {
    type: Glue42Web.Layouts.LayoutType;
}

export interface AllLayoutsFullConfig {
    layouts: Glue42Web.Layouts.Layout[];
}

export interface LayoutsImportConfig {
    layouts: Glue42Web.Layouts.Layout[];
    mode: "replace" | "merge";
}

export interface AllLayoutsSummariesResult {
    summaries: Glue42Web.Layouts.LayoutSummary[];
}

export interface SimpleLayoutResult {
    layout: Glue42Web.Layouts.Layout;
}

export interface OptionalSimpleLayoutResult {
    layout?: Glue42Web.Layouts.Layout;
}

export interface LayoutsSnapshot {
    layouts: Glue42Web.Layouts.Layout[];
}

export interface SaveLayoutConfig {
    layout: Glue42Web.Layouts.NewLayoutOptions
}

export interface RestoreLayoutConfig {
    layout: Glue42Web.Layouts.RestoreOptions
}

export interface RawWindowsLayoutDataRequestConfig {
    layoutType: "Global" | "Workspace";
    layoutName: string;
    context?: any;
    instances?: string[];
    ignoreInstances?: string[];
}

export interface SaveRequestClientResponse {
    windowContext?: any;
}

export interface WindowRawLayoutData extends SaveRequestClientResponse {
    bounds: Glue42Web.Windows.Bounds;
    url: string;
    name: string;
    application: string;
    windowId: string;
    initialContext?: any;
}

export interface WorkspaceWindowRawLayoutData extends SaveRequestClientResponse {
    windowId: string;
    frameId: string;
}

export interface WindowsRawLayoutData {
    windows: WindowRawLayoutData[];
}

export interface PermissionStateResult {
    state: "prompt" | "granted" | "denied";
}

export interface SimpleAvailabilityResult {
    isAvailable: boolean;
}

