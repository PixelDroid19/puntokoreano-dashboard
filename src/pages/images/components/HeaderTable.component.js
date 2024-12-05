import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
const HeaderTable = () => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/images/add');
    };
    return (_jsxs("div", { className: "flex justify-between", children: [_jsx("h2", { className: "text-3xl font-bold", children: "Imagenes" }), _jsx(Button, { onClick: handleClick, type: "primary", children: "A\u00F1adir imagenes" })] }));
};
export default HeaderTable;
