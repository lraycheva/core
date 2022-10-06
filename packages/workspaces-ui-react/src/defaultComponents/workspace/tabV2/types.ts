export interface WorkspaceLockConfig {
    allowSplitters?: boolean;
    allowDrop?: boolean;
    allowDropLeft?: boolean;
    allowDropTop?: boolean;
    allowDropRight?: boolean;
    allowDropBottom?: boolean;
    allowExtract?: boolean;
    showCloseButton?: boolean;
    showSaveButton?: boolean;
    allowWorkspaceTabExtract?: boolean;
    allowWorkspaceTabReorder?: boolean;
    showWindowCloseButtons?: boolean;
    allowWindowReorder?: boolean;
    showEjectButtons?: boolean;
    showAddWindowButtons?: boolean;
}

export interface Workspace {
    lock: (config: WorkspaceLockConfig | ((config: WorkspaceLockConfig) => WorkspaceLockConfig)) => Promise<void>;
    close: () => Promise<void>;
    onLockConfigurationChanged: (cb: (config: WorkspaceLockConfig) => void) => Promise<() => void>;
    allowSplitters: boolean;
    allowDrop: boolean;
    allowDropLeft: boolean;
    allowDropTop: boolean;
    allowDropRight: boolean;
    allowDropBottom: boolean;
    allowExtract: boolean;
    showCloseButton: boolean;
    showSaveButton: boolean;
    allowWorkspaceTabExtract: boolean;
    allowWorkspaceTabReorder: boolean;
    showWindowCloseButtons: boolean;
    allowWindowReorder: boolean;
    showEjectButtons: boolean;
    showAddWindowButtons: boolean;
}