// components/HeaderTable.component.tsx
import { Button, Dropdown, Modal, message, Input, Space } from "antd";
import { useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import { useRef, useState } from "react";
import { read, utils } from "xlsx";
import ProductsService from "../../../services/products.service";
import { useQueryClient } from "@tanstack/react-query";
import { ExportOutlined, ImportOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';

const HeaderTable = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [exportLimit, setExportLimit] = useState<number>();
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
        } catch (error) {
            message.error('Error al exportar productos');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event?.target?.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const results = await ProductsService.importFromExcel(file);
            
            message.success(
                `Importación completada: ${results.created} creados, ${results.updated} actualizados`
            );

            if (results.failed > 0) {
                Modal.warning({
                    title: 'Algunos productos no se pudieron importar',
                    content: (
                        <div>
                            <p>Errores encontrados:</p>
                            <ul>
                                {results.errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    ),
                });
            }

            // Recargar la lista de productos
            queryClient.invalidateQueries({ queryKey: ['products'] });
        } catch (error) {
            message.error('Error al importar productos');
        } finally {
            setLoading(false);
            if (event.target) event.target.value = '';
        }
    };

    const items: MenuProps['items'] = [
        {
            key: 'export',
            label: 'Exportar productos',
            icon: <ExportOutlined />,
            onClick: () => setIsExportModalVisible(true)
        },
        {
            key: 'import',
            label: 'Importar productos',
            icon: <ImportOutlined />,
            onClick: () => inputRef.current?.click()
        }
    ];

    return (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0 }}>Productos</h2>
            <div>
                <Button 
                    onClick={handleClick} 
                    type="primary" 
                    icon={<PlusOutlined />}
                    className="mr-4"
                >
                    Añadir producto
                </Button>
                <Dropdown menu={{ items }} disabled={loading}>
                    <Button type="primary" icon={<DownloadOutlined />} loading={loading}>
                        Opciones Excel
                    </Button>
                </Dropdown>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".xlsx, .xls"
                    style={{ display: 'none' }}
                    onChange={handleChange}
                />
            </div>

            {/* Modal de exportación */}
            <Modal
                title="Exportar productos"
                open={isExportModalVisible}
                onOk={handleExport}
                onCancel={() => setIsExportModalVisible(false)}
                confirmLoading={loading}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <p>¿Cuántos productos desea exportar?</p>
                    <Input
                        type="number"
                        placeholder="Dejar vacío para exportar todos"
                        value={exportLimit}
                        onChange={e => setExportLimit(Number(e.target.value))}
                        min={1}
                    />
                    <p className="text-gray-500">
                        Nota: Los productos se exportarán ordenados por nombre
                    </p>
                </Space>
            </Modal>
        </div>
    );
};

export default HeaderTable;