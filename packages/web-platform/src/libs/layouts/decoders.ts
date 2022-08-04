import { Glue42Web } from "@glue42/web";
import { Decoder, oneOf, constant, anyJson, array, object, optional, boolean } from "decoder-validate";
import { glueLayoutDecoder, layoutSummaryDecoder, nonEmptyStringDecoder, nonNegativeNumberDecoder, windowBoundsDecoder, layoutTypeDecoder } from "../../shared/decoders";
import { GetAllLayoutsConfig, AllLayoutsSummariesResult, AllLayoutsFullConfig, LayoutsOperationTypes, SimpleLayoutConfig, SimpleLayoutResult, OptionalSimpleLayoutResult, LayoutsImportConfig, SaveLayoutConfig, RestoreLayoutConfig, RawWindowsLayoutDataRequestConfig, SaveRequestClientResponse, WindowRawLayoutData, PermissionStateResult, SimpleAvailabilityResult, WindowsRawLayoutData, WorkspaceWindowRawLayoutData } from "./types";

export const layoutsOperationTypesDecoder: Decoder<LayoutsOperationTypes> = oneOf<"get" | "getAll" | "export" | "import" | "remove" | "save" | "restore" | "getRawWindowsLayoutData" | "clientSaveRequest" | "getGlobalPermissionState" | "requestGlobalPermission" | "checkGlobalActivated">(
    constant("get"),
    constant("getAll"),
    constant("export"),
    constant("import"),
    constant("remove"),
    constant("save"),
    constant("restore"),
    constant("getRawWindowsLayoutData"),
    constant("clientSaveRequest"),
    constant("getGlobalPermissionState"),
    constant("checkGlobalActivated"),
    constant("requestGlobalPermission")
);

export const newLayoutOptionsDecoder: Decoder<Glue42Web.Layouts.NewLayoutOptions> = object({
    name: nonEmptyStringDecoder,
    context: optional(anyJson()),
    metadata: optional(anyJson()),
    instances: optional(array(nonEmptyStringDecoder)),
    ignoreInstances: optional(array(nonEmptyStringDecoder))
});

export const restoreOptionsDecoder: Decoder<Glue42Web.Layouts.RestoreOptions> = object({
    name: nonEmptyStringDecoder,
    context: optional(anyJson()),
    closeRunningInstance: optional(boolean()),
    closeMe: optional(boolean()),
    timeout: optional(nonNegativeNumberDecoder)
});

export const simpleLayoutConfigDecoder: Decoder<SimpleLayoutConfig> = object({
    name: nonEmptyStringDecoder,
    type: layoutTypeDecoder
});

export const getAllLayoutsConfigDecoder: Decoder<GetAllLayoutsConfig> = object({
    type: layoutTypeDecoder
});

export const saveLayoutConfigDecoder: Decoder<SaveLayoutConfig> = object({
    layout: newLayoutOptionsDecoder
});

export const restoreLayoutConfigDecoder: Decoder<RestoreLayoutConfig> = object({
    layout: restoreOptionsDecoder
});

export const allLayoutsFullConfigDecoder: Decoder<AllLayoutsFullConfig> = object({
    layouts: array(glueLayoutDecoder)
});

export const importModeDecoder: Decoder<"replace" | "merge"> = oneOf<"replace" | "merge">(
    constant("replace"),
    constant("merge")
);

export const layoutsImportConfigDecoder: Decoder<LayoutsImportConfig> = object({
    layouts: array(glueLayoutDecoder),
    mode: importModeDecoder
});

export const allLayoutsSummariesResultDecoder: Decoder<AllLayoutsSummariesResult> = object({
    summaries: array(layoutSummaryDecoder)
});

export const simpleLayoutResult: Decoder<SimpleLayoutResult> = object({
    layout: glueLayoutDecoder
});

export const optionalSimpleLayoutResult: Decoder<OptionalSimpleLayoutResult> = object({
    layout: optional(glueLayoutDecoder)
});

export const rawWindowsLayoutDataRequestConfigDecoder: Decoder<RawWindowsLayoutDataRequestConfig> = object({
    layoutType: oneOf<"Global" | "Workspace">(
        constant("Global"),
        constant("Workspace")
    ),
    layoutName: nonEmptyStringDecoder,
    context: optional(anyJson()),
    instances: optional(array(nonEmptyStringDecoder)),
    ignoreInstances: optional(array(nonEmptyStringDecoder))
});

export const saveRequestClientResponseDecoder: Decoder<SaveRequestClientResponse> = object({
    windowContext: optional(anyJson()),
});

export const fullSaveRequestResponseDecoder: Decoder<WindowRawLayoutData> = object({
    bounds: windowBoundsDecoder,
    windowContext: optional(anyJson()),
    url: nonEmptyStringDecoder,
    name: nonEmptyStringDecoder,
    application: nonEmptyStringDecoder,
    windowId: nonEmptyStringDecoder,
    initialContext: optional(anyJson())
});

export const workspaceWindowRawLayoutDataDecoder: Decoder<WorkspaceWindowRawLayoutData> = object({
    windowContext: optional(anyJson()),
    windowId: nonEmptyStringDecoder,
    frameId: nonEmptyStringDecoder
})

export const windowsRawLayoutDataDecoder: Decoder<WindowsRawLayoutData> = object({
    windows: array(fullSaveRequestResponseDecoder)
});

export const permissionStateResultDecoder: Decoder<PermissionStateResult> = object({
    state: oneOf<"prompt" | "granted" | "denied">(
        constant("prompt"),
        constant("denied"),
        constant("granted")
    )
});

export const simpleAvailabilityResultDecoder: Decoder<SimpleAvailabilityResult> = object({
    isAvailable: boolean()
});
