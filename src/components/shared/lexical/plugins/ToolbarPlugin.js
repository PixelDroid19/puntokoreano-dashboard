import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { faRedo, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider } from "antd";
import React from "react";
const ToolbarPlugin = () => {
    const toolbarRef = React.useRef(null);
    return (_jsxs("div", { className: "flex mb-[1px] bg-white p-1 rounded-tl-xl rounded-tr-xl align-middle", ref: toolbarRef, children: [_jsx("button", { "aria-label": "Undo", children: _jsx(FontAwesomeIcon, { icon: faUndo }) }), _jsx("button", { "aria-label": "Redo", children: _jsx(FontAwesomeIcon, { icon: faRedo }) }), _jsx(Divider, { type: "vertical", className: "text-[#eee] w-[1px] mx-1" })] }));
};
export default ToolbarPlugin;
