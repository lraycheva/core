import React from "react";
import { WorkspaceTitleProps } from "../../types/internal";

const WorkspaceTitle: React.FC<WorkspaceTitleProps> = ({ title }) => {
    return (
        <span className="lm_title" style={{ maxWidth: "150px" }}>{title}</span>
    )
}

export default WorkspaceTitle;