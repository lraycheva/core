import React from "react";
import SaveWorkspacePopup from "../../popups/saveWorkspace/SaveWorkspacePopup";

interface SaveProps {
    hidePopup: () => void;
    resizePopup?: (size: any) => void;
    workspaceId: string;
    onBackClick: () => void;
}

const Save: React.FC<SaveProps> = (props) => {
    return <div>
        <button onClick={props.onBackClick} className="btn btn-icon-action position-absolute mt-2 btn-back"><i className="icon-angle-left" /></button>
        <SaveWorkspacePopup resizePopup={props.resizePopup!} {...props} />
    </div>;
}

export default Save;