import React, { Fragment, useCallback, useEffect, useState } from "react";
import WorkspaceTabOptionsButton from "./OptionsButton";
import LockedIcon from "./LockedIcon";
import { Workspace, WorkspaceLockConfig } from "./types";
import { WorkspaceTabComponentProps } from "../../../types/internal";
import WorkspaceIconButton from "../WorkspaceIconButton";
import WorkspaceTitle from "../WorkspaceTitle";
import WorkspaceTabCloseButton from "../WorkspaceTabCloseButton";


const WorkspaceTabV2: React.FC<WorkspaceTabComponentProps> = ({ isPinned, title, onCloseClick, onSaveClick, icon, showSaveButton, showCloseButton, workspaceId }) => {
    const [lockConfig, setLockConfig] = useState<WorkspaceLockConfig>({});
    useEffect(() => {
        let unsub = () => { };
        let mounted = true;
        (window as any).glue.workspaces.getWorkspaceById(workspaceId).then((workspace: Workspace) => {
            if (mounted) {
                setLockConfig({
                    allowDrop: workspace.allowDrop,
                    allowExtract: workspace.allowExtract,
                    allowDropBottom: workspace.allowDropBottom,
                    allowSplitters: workspace.allowSplitters,
                    allowDropLeft: workspace.allowDropLeft,
                    allowWorkspaceTabExtract: workspace.allowWorkspaceTabExtract,
                    allowDropRight: workspace.allowDropRight,
                    allowWindowReorder: workspace.allowWindowReorder,
                    allowDropTop: workspace.allowDropTop,
                    allowWorkspaceTabReorder: workspace.allowWorkspaceTabReorder,
                    showAddWindowButtons: workspace.showAddWindowButtons,
                    showCloseButton: workspace.showCloseButton,
                    showEjectButtons: workspace.showEjectButtons,
                    showSaveButton: workspace.showSaveButton,
                    showWindowCloseButtons: workspace.showWindowCloseButtons
                });
            }

            workspace.onLockConfigurationChanged((config: any) => {
                if (!mounted) {
                    return;
                }
                setLockConfig({ ...config });
            }).then((un: any) => {
                unsub = un;
            });
        });

        return () => {
            mounted = false;
            unsub();
        }
    }, [workspaceId]);

    const closeWorkspace = useCallback(() => {
        (window as any).glue.workspaces.getWorkspaceById(workspaceId).then((w: Workspace) => {
            return w.close();
        });
    }, [workspaceId]);

    const isLocked = useCallback(() => {
        const lockConfigCopy = { ...lockConfig };

        if (!window.glue42gd) {
            delete lockConfigCopy.allowWorkspaceTabExtract;
        }

        return Object.values(lockConfigCopy).some(v => !v);
    }, [lockConfig]);

    return (
        <div className="tab-item-v2" title={title}>
            {isPinned ? <WorkspaceIconButton icon={icon} /> : <WorkspaceTabOptionsButton showSaveButton={showSaveButton} closeWorkspace={closeWorkspace} lockConfig={lockConfig} workspaceId={workspaceId} />}
            <i className="lm_left" />
            {!isPinned && <WorkspaceTitle title={title} />}
            {isLocked() ? <LockedIcon lockConfig={lockConfig} workspaceId={workspaceId} /> : <Fragment />}
            {(!isPinned && showCloseButton) && <WorkspaceTabCloseButton close={onCloseClick} />}
            <i className="lm_right" />
        </div>
    )
}

export default WorkspaceTabV2;