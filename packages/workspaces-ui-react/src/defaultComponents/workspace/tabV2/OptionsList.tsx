import React, { useEffect, useRef } from "react";

interface WorkspaceTabOptionsListProps {
    onSaveClicked: () => void;
    onLockClicked: () => void;
    onCloseClicked: () => void;
    resizePopup?: (size: any) => void;
    showSaveButton: boolean;
}

const WorkspaceTabOptionsList: React.FC<WorkspaceTabOptionsListProps> = ({ onSaveClicked, onLockClicked, onCloseClicked, resizePopup, showSaveButton }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const bounds = ref.current.getBoundingClientRect();
        resizePopup!({
            width: Math.ceil(bounds.width),
            height: Math.ceil(bounds.height)
        });
    }, [ref, resizePopup]);

    return <div ref={ref} className="list-group" style={{ width: 200 }}>
        {showSaveButton && <button onClick={onSaveClicked} className="list-group-item list-group-item-action"><i className="icon-floppy mr-3"></i>Save</button>}
        <button onClick={onLockClicked} className="list-group-item list-group-item-action"><i className="icon-lock mr-3"></i>Lock Settings</button>
        <button onClick={onCloseClicked} className="list-group-item list-group-item-action"><i className="icon-cancel mr-3"></i>Close</button>
    </div>
}

export default WorkspaceTabOptionsList;