import React from "react";
import {  MaximizeGroupButtonProps } from "../../types/internal";
import HeaderButton from "../HeaderButton";

const MaximizeGroupButton: React.FC<MaximizeGroupButtonProps> = ({ title, children, ...props }) => {
    return <HeaderButton {...props} title={title || "maximize"} className={"lm_maximise workspace_content"}>{children}</HeaderButton>
};

export default MaximizeGroupButton;
