import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { requestFocus } from "../../..";
import { Size } from "../../../types/internal";
import useWorkspaceWindowClicked from "../../../useWorkspaceWindowClicked";
import { WorkspaceLockConfig } from "./types";

interface PopupProps {
    buttonBounds: { left: number, top: number, right: number, bottom: number };
    workspaceId: string;
    lockConfig: WorkspaceLockConfig;
    hidePopup: () => void;
}

interface PopupChildProps {
    resizePopup: (size: Size) => void;
}

const WorkspaceTabV2Popup: React.FC<PopupProps> = ({ workspaceId, buttonBounds, lockConfig, hidePopup, children }) => {
    const [size, setSize] = useState({ height: 230, width: 200 });

    const normalizeBounds = (left: number, top: number, size: Size) => {
        const windowWidth = window.innerWidth;
        let normalizedLeft = left;
        if (left + size.width! > windowWidth) {
            const horizontalOverflow = left + size.width! - windowWidth;
            normalizedLeft = Math.max(0, normalizedLeft - horizontalOverflow);
        }

        const windowHeight = window.innerHeight;
        let normalizedTop = top;
        if (top + size.height! > windowHeight) {
            const verticalOverflow = top + size.height! - windowHeight;
            normalizedTop = Math.max(0, normalizedTop - verticalOverflow);
        }

        return {
            left: normalizedLeft,
            top: normalizedTop,
            ...size
        }
    }
    const normalizedBounds = normalizeBounds(buttonBounds.left, buttonBounds.bottom, size);
    const style: React.HTMLAttributes<HTMLDivElement>["style"] = {
        position: "absolute",
        backgroundColor: "rgb(var(--t42-bg-mid))",
        left: normalizedBounds.left,
        top: normalizedBounds.top,
        zIndex: 99,
        height: size.height,
        width: size.width,
        border: "var(--t42-border)"
    };

    const backgroundElementStyle: React.HTMLAttributes<HTMLDivElement>["style"] = {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "transparent",
        zIndex: 98
    };

    const resizePopup = useCallback((size: Size) => {
        setSize(s => ({
            height: (size.height ?? s.height) + 2, // 2 is for border 
            width: (size.width ?? s.width) + 2
        }));
    }, []);

    useEffect(() => {
        requestFocus();
    }, []);

    useWorkspaceWindowClicked(() => {
        hidePopup();
    });

    useEffect(() => {
        window.addEventListener("resize", hidePopup);
        return () => {
            window.removeEventListener("resize", hidePopup);
        }
    }, [hidePopup]);

    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement<PopupChildProps>(child, { resizePopup });
        }
        return child;
    });

    return ReactDOM.createPortal(<div onClick={() => hidePopup()} style={backgroundElementStyle}>
        <div onClick={(e) => e.stopPropagation()} style={style}>
            {childrenWithProps}
        </div>
    </div>
        , document.body);
}

export default WorkspaceTabV2Popup;