import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// components/HeaderTable.component.tsx
import { Button, Dropdown, Modal, message, Input, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import ProductsService from "../../../services/products.service";
import { useQueryClient } from "@tanstack/react-query";
import { ExportOutlined, ImportOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
const HeaderTable = () => {
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [exportLimit, setExportLimit] = useState();
    const [isExportModalVisible, setIsExportModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleClick = () => {
        navigate("/products/add");
    };
    const handleExport = async () => {
        try {
            setLoading(true);
            const blob = await ProductsService.exportToExcel(exportLimit);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `productos_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            message.success('Productos exportados correctamente');
            setIsExportModalVisible(false);
        }
        catch (error) {
            message.error('Error al exportar productos');
        }
        finally {
            setLoading(false);
        }
    };
    const handleChange = async (event) => {
        const file = event?.target?.files?.[0];
        if (!file)
            return;
        try {
            setLoading(true);
            const results = await ProductsService.importFromExcel(file);
            message.success(`Importación completada: ${results.created} creados, ${results.updated} actualizados`);
            if (results.failed > 0) {
                Modal.warning({
                    title: 'Algunos productos no se pudieron importar',
                    content: (_jsxs("div", { children: [_jsx("p", { children: "Errores encontrados:" }), _jsx("ul", { children: results.errors.map((error, index) => (_jsx("li", { children: error }, index))) })] })),
                });
            }
            // Recargar la lista de productos
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
        catch (error) {
            message.error('Error al importar productos');
        }
        finally {
            setLoading(false);
            if (event.target)
                event.target.value = '';
        }
    };
    const items = [
        {
            key: 'export',
            label: 'Exportar productos',
            icon: _jsx(ExportOutlined, {}),
            onClick: () => setIsExportModalVisible(true)
        },
        {
            key: 'import',
            label: 'Importar productos',
            icon: _jsx(ImportOutlined, {}),
            onClick: () => inputRef.current?.click()
        }
    ];
    return (_jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("h2", { style: { margin: 0 }, children: "Productos" }), _jsxs("div", { children: [_jsx(Button, { onClick: handleClick, type: "primary", icon: _jsx(PlusOutlined, {}), className: "mr-4", children: "A\u00F1adir producto" }), _jsx(Dropdown, { menu: { items }, disabled: loading, children: _jsx(Button, { type: "primary", icon: _jsx(DownloadOutlined, {}), loading: loading, children: "Opciones Excel" }) }), _jsx("input", { ref: inputRef, type: "file", accept: ".xlsx, .xls", style: { display: 'none' }, onChange: handleChange })] }), _jsx(Modal, { title: "Exportar productos", open: isExportModalVisible, onOk: handleExport, onCancel: () => setIsExportModalVisible(false), confirmLoading: loading, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsx("p", { children: "\u00BFCu\u00E1ntos productos desea exportar?" }), _jsx(Input, { type: "number", placeholder: "Dejar vac\u00EDo para exportar todos", value: exportLimit, onChange: e => setExportLimit(Number(e.target.value)), min: 1 }), _jsx("p", { className: "text-gray-500", children: "Nota: Los productos se exportar\u00E1n ordenados por nombre" })] }) })] }));
};
export default HeaderTable;
