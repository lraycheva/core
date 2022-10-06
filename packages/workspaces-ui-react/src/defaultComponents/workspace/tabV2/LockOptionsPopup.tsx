import React from "react";
import Popup from "./Popup";
import LockOptions from "./LockOptions";
import { WorkspaceLockConfig } from "./types";

interface OptionsPopupProps {
    buttonBounds: { left: number, top: number, right: number, bottom: number };
    workspaceId: string;
    lockConfig: WorkspaceLockConfig;
    hidePopup: () => void;
}
const LockOptionsPopup: React.FC<OptionsPopupProps> = ({ workspaceId, buttonBounds, lockConfig, hidePopup }) => {
    return <Popup buttonBounds={buttonBounds} hidePopup={hidePopup} lockConfig={lockConfig} workspaceId={workspaceId} >
        <LockOptions showBackButton={false} onBackClick={() => { }} lockConfig={lockConfig} workspaceId={workspaceId} />
    </Popup>
}

export default LockOptionsPopup;