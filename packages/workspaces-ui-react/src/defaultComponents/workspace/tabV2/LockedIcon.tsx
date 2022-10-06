import React, { useCallback, useEffect, useRef, useState } from "react";
import WorkspaceTabLockOptionsPopup from "./LockOptionsPopup";
import { WorkspaceLockConfig } from "./types";

interface LockedIconProps {
    workspaceId: string;
    lockConfig: WorkspaceLockConfig;
}

const LockedIcon: React.FC<LockedIconProps> = ({ workspaceId, lockConfig }) => {
    const [showPopup, setShowPopup] = useState(false);
    const iconRef = useRef<HTMLSpanElement>(null);

    const getButtonBounds = (): any => {
        if (!iconRef.current) {
            return {};
        }

        const button = iconRef.current;
        const bounds = button.getBoundingClientRect();
        return {
            left: bounds.left,
            top: bounds.top,
            right: bounds.right,
            bottom: bounds.bottom,
        };
    };

    const hidePopup = useCallback(() => {
        setShowPopup(false)
    }, []);

    useEffect(() => {
        if (!iconRef.current) {
            return
        }

        const button = iconRef.current;
        const clickListener = (e: MouseEvent) => {
            e.stopPropagation();

            setShowPopup((s) => !s);
        }

        button.addEventListener("click", clickListener);

        return () => {
            button?.removeEventListener("click", clickListener);
        }

    }, []);

    return <>
        {showPopup && <WorkspaceTabLockOptionsPopup lockConfig={lockConfig} workspaceId={workspaceId} hidePopup={hidePopup} buttonBounds={getButtonBounds()} />}
        <span ref={iconRef} className="icon-lock" title="Change the settings"></span>
    </>
}

export default LockedIcon;