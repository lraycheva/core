import React from "react";

interface BackButtonProps {
    onClick: () => void;
}

const BackButton: React.FC<BackButtonProps> = (props) => {
    return (
        <button onClick={props.onClick} className="btn btn-icon btn-icon-action position-absolute mt-2 btn-back">
            <i className="icon-angle-left" />
        </button>
    )
}

export default BackButton;