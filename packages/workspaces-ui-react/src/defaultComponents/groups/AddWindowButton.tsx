import React from "react";
import { AddWindowButtonProps } from "../../types/internal";
import HeaderButton from "../HeaderButton";

const AddWindowButton: React.FC<AddWindowButtonProps> = ({ title, children, ...props }) => {
    return <HeaderButton {...props} title={title || "add app"} className={"lm_add_button"}>{children}</HeaderButton>
};

export default AddWindowButton;
