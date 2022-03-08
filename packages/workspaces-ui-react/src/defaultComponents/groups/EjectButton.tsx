import React from "react";
import {  EjectButtonProps } from "../../types/internal";
import HeaderButton from "../HeaderButton";

const EjectButton: React.FC<EjectButtonProps> = ({ title, children, ...props }) => {
    return <HeaderButton {...props} title={title || "eject"} className={"lm_popout"}>{children}</HeaderButton>
};

export default EjectButton;
