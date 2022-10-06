import React, { useCallback, useEffect, useRef } from "react";
import { Size } from "../../../types/internal";
import LockOption from "./LockOption";
import { Workspace, WorkspaceLockConfig } from "./types";

interface LockOptionsProps {
    workspaceId: string;
    lockConfig: WorkspaceLockConfig;
    onBackClick: () => void;
    resizePopup?: (size: Size) => void;
    showBackButton: boolean;
}

const LockOptions: React.FC<LockOptionsProps> = ({ workspaceId, lockConfig, onBackClick, resizePopup, showBackButton }) => {
    const allowOptionsNameMap = (k: string) => k.replace("allow", "").replace(/([A-Z][a-z])/g, ' $1').trim();
    const showOptionsNameMap = (k: string) => k.replace("show", "").replace(/([A-Z][a-z])/g, ' $1').replace("Buttons", "").replace("Button", "").trim();

    const generateOptions = useCallback((filter: (key: keyof WorkspaceLockConfig) => boolean, nameMap: (key: string) => string) => Object.keys(lockConfig).filter(filter).map((key, i) => {
        const typedKey = key as keyof WorkspaceLockConfig;
        const onChange = (newValue: boolean) => {
            (window as any).glue.workspaces.getWorkspaceById(workspaceId).then((workspace: Workspace) => {
                return workspace.lock({
                    ...lockConfig,
                    [key]: !newValue
                });
            });
        }

        return <LockOption key={nameMap(key)} name={nameMap(key)} value={!lockConfig[typedKey]} onChange={onChange} />
    }), [workspaceId, lockConfig]);

    const coreCompatibleFilter = (constraint: keyof WorkspaceLockConfig) => {
        if (!window.glue42gd && (constraint === "allowDrop" || constraint === "allowWorkspaceTabExtract")) {
            return false;
        }

        return true;
    }

    const generateAllowOptions = () => generateOptions((k) => k.startsWith("allow") && coreCompatibleFilter(k), allowOptionsNameMap);
    const generateShowOptions = () => generateOptions((k) => k.startsWith("show"), showOptionsNameMap);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        resizePopup!({
            width: Math.ceil(ref.current.getBoundingClientRect().width),
            height: Math.ceil(ref.current.getBoundingClientRect().height),
        });

    }, [resizePopup, lockConfig]);

    const toggleAll = (newValue: boolean) => {
        (window as any).glue.workspaces.getWorkspaceById(workspaceId).then((workspace: Workspace) => {
            const newLockConfig = Object.keys(lockConfig).reduce((acc, key) => {
                acc[key] = !newValue
                return acc;
            }, {});

            return workspace.lock(newLockConfig);
        });
    };

    const isLocked = useCallback(() => {
        const lockConfigCopy = { ...lockConfig };

        if (!window.glue42gd) {
            delete lockConfigCopy.allowWorkspaceTabExtract;
        }

        return Object.values(lockConfigCopy).some(v => !v);
    }, [lockConfig]);
    const enableName = "Unlock All";
    const disableName = "Lock All";

    return <div ref={ref} className="p-3" style={{ width: 400 }}>
        {showBackButton && <button onClick={onBackClick} className="btn btn-icon-action position-absolute btn-back"><i className="icon-angle-left" /></button>}
        <div className="mb-2">
            <LockOption name={isLocked() ? enableName : disableName} value={isLocked()} onChange={toggleAll} />
        </div>
        <h5>Disable</h5>
        <hr className="my-2" />
        <div className="allow-show-gird">{generateAllowOptions()}</div>
        <h5 className="pt-3">Hide Buttons</h5>
        <hr className="my-2" />
        <div className="allow-show-gird">{generateShowOptions()}</div>
    </div>
}

export default LockOptions;