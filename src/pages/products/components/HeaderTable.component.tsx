import { Button, Dropdown, Modal, message, Input, Space, Alert, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import { useRef, useState } from "react";
import ProductsService from "../../../services/products.service";
import { useQueryClient } from "@tanstack/react-query";
import { 
 ExportOutlined, 
 ImportOutlined, 
 DownloadOutlined, 
 PlusOutlined,
 QuestionCircleOutlined 
} from '@ant-design/icons';

// Componente guía de Excel
const ExcelGuide = () => (
 <Alert
   message="Formato del Excel"
   description={
     <div className="space-y-2 text-sm">
       <p>Las columnas marcadas con * son obligatorias:</p>
       <ul className="list-disc pl-4 space-y-1">
         <li><strong>Name*:</strong> Nombre del producto</li>
         <li><strong>Price*:</strong> Precio (solo números)</li>
         <li><strong>Group*:</strong> Grupo del producto</li>
         <li><strong>Subgroup*:</strong> Subgrupo del producto</li>
         <li><strong>Stock:</strong> Cantidad disponible</li>
         <li><strong>Code:</strong> Código/SKU del producto</li>
         <li><strong>Short Description:</strong> Descripción corta</li>
         <li><strong>Long Description:</strong> Descripción detallada</li>
         <li><strong>Active:</strong> Estado (true/false)</li>
         <li>
           <strong>Image Group Identifier:</strong> ID del grupo de imágenes 
           <Tooltip title="Este ID se encuentra en el Gestor de Imágenes">
             <QuestionCircleOutlined className="ml-1 text-blue-500" />
           </Tooltip>
         </li>
         <li><strong>Images:</strong> URLs de imágenes separadas por comas</li>
         <li><strong>Shipping Methods:</strong> Métodos de envío (express, standard, pickup)</li>
       </ul>
       <p className="text-gray-500 mt-2">
         Nota: Puedes usar Image Group Identifier o Images, no es necesario usar ambos.
       </p>
     </div>
   }
   type="info"
   showIcon
   className="mb-4"
 />
);

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
           key: 'template',
           label: 'Descargar plantilla',
           icon: <DownloadOutlined />,
           onClick: () => ProductsService.downloadTemplate()
       },
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
       <div className="space-y-4">
           <div className="flex justify-between items-center">
               <div>
                   <h2 className="text-2xl font-bold mb-1">Productos</h2>
                   <div className="flex items-center gap-2">
                       <span className="text-gray-500">Gestiona tu catálogo de productos</span>
                       <Tooltip title="Ver guía de Excel">
                           <QuestionCircleOutlined 
                               className="text-blue-500 cursor-pointer" 
                               onClick={() => Modal.info({
                                   title: 'Guía de Importación/Exportación Excel',
                                   content: <ExcelGuide />,
                                   width: 600,
                               })}
                           />
                       </Tooltip>
                   </div>
               </div>
               <div className="space-x-2">
                   <Button 
                       onClick={handleClick} 
                       type="primary"
                       icon={<PlusOutlined />}
                   >
                       Añadir producto
                   </Button>
                   <Dropdown menu={{ items }} disabled={loading}>
                       <Button icon={<DownloadOutlined />} loading={loading}>
                           Excel
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