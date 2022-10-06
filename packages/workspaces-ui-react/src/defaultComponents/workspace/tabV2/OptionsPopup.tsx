import React, { useCallback, useState } from "react";
import Popup from "./Popup";
import LockOptions from "./LockOptions";
import OptionsList from "./OptionsList";
import Save from "./Save";
import { WorkspaceLockConfig } from "./types";

interface OptionsPopupProps {
    buttonBounds: { left: number, top: number, right: number, bottom: number };
    workspaceId: string;
    lockConfig: WorkspaceLockConfig;
    closeWorkspace: () => void;
    hidePopup: () => void;
    showSaveButton: boolean;
}
const WorkspaceTabOptionsPopup: React.FC<OptionsPopupProps> = ({ workspaceId, buttonBounds, showSaveButton, lockConfig, hidePopup, closeWorkspace }) => {
    const [lockSelected, setLockSelected] = useState(false);
    const [saveSelected, setSaveSelected] = useState(false);

    const onBackClick = useCallback(() => {
        setLockSelected(false);
        setSaveSelected(false);
    }, []);

    return <Popup buttonBounds={buttonBounds} hidePopup={hidePopup} lockConfig={lockConfig} workspaceId={workspaceId} >
        {!lockSelected && !saveSelected && <OptionsList showSaveButton={showSaveButton} onCloseClicked={closeWorkspace} onLockClicked={() => setLockSelected(true)} onSaveClicked={() => setSaveSelected(true)} />}
        {saveSelected && <Save hidePopup={hidePopup} workspaceId={workspaceId} onBackClick={onBackClick} />}
        {lockSelected && <LockOptions showBackButton={true} onBackClick={onBackClick} lockConfig={lockConfig} workspaceId={workspaceId} />}
    </Popup>
}

export default WorkspaceTabOptionsPopup;