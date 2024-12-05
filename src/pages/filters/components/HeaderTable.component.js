import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/filters/components/HeaderTable.component.tsx
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
const HeaderTable = () => {
    const navigate = useNavigate();
    return (_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Filtros" }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: () => navigate("/filters/add"), children: "Agregar Filtro" })] }));
};
export default HeaderTable;
