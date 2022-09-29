import React from "react";
import { GlueWorkspaceLoadingAnimationProps } from "../types/internal";

const GlueWorkspaceLoadingAnimation: React.FC<GlueWorkspaceLoadingAnimationProps> = ({ workspaceId, ...props }) => {
    return (
        <div className="wrapper">
            <div className="inner">
                <div className="ball"></div>
                <div className="ball"></div>
            </div>
            <div className="mid">
                <div className="ball"></div>
                <div className="ball"></div>
            </div>
            <div className="text">Loading</div>
        </div>
    )
};

export default GlueWorkspaceLoadingAnimation;
