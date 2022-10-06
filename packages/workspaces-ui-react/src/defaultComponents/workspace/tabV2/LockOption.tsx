import React from "react";

interface LockOptionProps {
    name: string;
    value: boolean;
    onChange: (newValue: boolean) => void;
}

const LockOption: React.FC<LockOptionProps> = ({ name, value, onChange }) => {
    return <label className="switch" onChange={() => { onChange(!value) }}>
        <input checked={value} type="checkbox" onChange={() => {
            // do nothing
        }} />
        <span className="slider"></span> {name}
    </label>
}

export default LockOption;