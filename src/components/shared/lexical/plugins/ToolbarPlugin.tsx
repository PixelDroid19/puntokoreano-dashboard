import { faRedo, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider } from "antd";
import React from "react";

const ToolbarPlugin = () => {

    const toolbarRef = React.useRef(null);

    return (
        <div className="flex mb-[1px] bg-white p-1 rounded-tl-xl rounded-tr-xl align-middle" ref={toolbarRef} >
            <button aria-label="Undo">
                <FontAwesomeIcon icon={faUndo} />
            </button>
            <button  aria-label="Redo">
                <FontAwesomeIcon icon={faRedo}  />
            </button>
            <Divider type="vertical" className="text-[#eee] w-[1px] mx-1" />
        </div>
    )

}
export default ToolbarPlugin;