
import type React from "react";

import {
  Button,
  Dropdown,
  Modal,
  message,
  Input,
  Space,
  Alert,
  Tooltip,
  Typography,
} from "antd";
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
  QuestionCircleOutlined,
  DatabaseOutlined,
  ShopOutlined,
  InfoCircleOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import StorageTestModal from "../../../components/storage/StorageTestModal";

const { Title, Text } = Typography;

// Componente guía de Excel
const ExcelGuide = () => (
  <>
    <div className="space-y-3 text-sm">
      <p className="font-medium">
        Las columnas marcadas con * son obligatorias:
      </p>
      <ul className="list-disc pl-4 space-y-2">
        <li>
          <strong className="text-blue-600">Name*:</strong> Nombre del producto
        </li>
        <li>
          <strong className="text-blue-600">Price*:</strong> Precio (solo
          números)
        </li>
        <li>
          <strong className="text-blue-600">Group*:</strong> Grupo del producto
        </li>
        <li>
          <strong className="text-blue-600">Subgroup*:</strong> Subgrupo del
          producto
        </li>
        <li>
          <strong className="text-blue-600">Stock:</strong> Cantidad disponible
        </li>
        <li>
          <strong className="text-blue-600">Code:</strong> Código/SKU del
          producto
        </li>
        <li>
          <strong className="text-blue-600">Short Description:</strong>{" "}
          Descripción corta
        </li>
        <li>
          <strong className="text-blue-600">Long Description:</strong>{" "}
          Descripción detallada
        </li>
        <li>
          <strong className="text-blue-600">Active:</strong> Estado (true/false)
        </li>
        <li>
          <strong className="text-blue-600">Image Group Identifier:</strong> ID
          del grupo de imágenes
          <Tooltip title="Este ID se encuentra en el Gestor de Imágenes">
            <QuestionCircleOutlined className="ml-1 text-blue-500 cursor-pointer" />
          </Tooltip>
        </li>
        <li>
          <strong className="text-blue-600">Images:</strong> URLs de imágenes
          separadas por comas
        </li>
        <li>
          <strong className="text-blue-600">Shipping Methods:</strong> Métodos
          de envío (express, standard, pickup)
        </li>
      </ul>
      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mt-2">
        <Text className="text-yellow-700 font-medium">Nota:</Text>
        <Text className="text-yellow-600 block mt-1">
          Puedes usar Image Group Identifier o Images, no es necesario usar
          ambos.
        </Text>
      </div>
    </div>
  </>
);

const HeaderTable = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [exportLimit, setExportLimit] = useState<number>();
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isStorageTestModalOpen, setIsStorageTestModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    navigate("/products/add");
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const blob = await ProductsService.exportToExcel(exportLimit);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `productos_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      message.success("Productos exportados correctamente");
      setIsExportModalVisible(false);
    } catch (error) {
      message.error("Error al exportar productos");
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
          title: "Algunos productos no se pudieron importar",
          content: (
            <div>
              <p>Errores encontrados:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-red-600">
                {results.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          ),
        });
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      message.error("Error al importar productos");
    } finally {
      setLoading(false);
      if (event.target) event.target.value = "";
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "template",
      label: "Descargar plantilla",
      icon: <DownloadOutlined className="text-blue-500" />,
      onClick: () => ProductsService.downloadTemplate(),
    },
    {
      key: "export",
      label: "Exportar productos",
      icon: <ExportOutlined className="text-green-500" />,
      onClick: () => setIsExportModalVisible(true),
    },
    {
      key: "import",
      label: "Importar productos",
      icon: <ImportOutlined className="text-orange-500" />,
      onClick: () => inputRef.current?.click(),
    },
  ];

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-5 rounded-lg shadow-sm border border-gray-200"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center">
              <ShopOutlined className="text-blue-500 text-2xl mr-2" />
              <Title level={2} className="m-0 text-gray-800">
                Productos
              </Title>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Text className="text-gray-500">
                Gestiona tu catálogo de productos
              </Text>
              <Tooltip title="Ver guía de Excel">
                <QuestionCircleOutlined
                  className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                  onClick={() =>
                    Modal.info({
                      title: (
                        <div className="flex items-center">
                          <DatabaseOutlined className="text-blue-500 mr-2" />
                          <span>Guía de Importación/Exportación Excel</span>
                        </div>
                      ),
                      content: <ExcelGuide />,
                      width: 600,
                      className: "excel-guide-modal",
                    })
                  }
                />
              </Tooltip>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 self-end sm:self-auto">
            <Button
              onClick={handleClick}
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              className="hover:scale-105 transition-transform"
            >
              Añadir producto
            </Button>
            <Dropdown
              menu={{ items }}
              disabled={loading}
              placement="bottomRight"
            >
              <Button
                icon={<DownloadOutlined />}
                loading={loading}
                size="large"
                className="hover:bg-gray-50 transition-colors"
              >
                Excel
              </Button>
            </Dropdown>
         {/*    <Button
              onClick={() => setIsStorageTestModalOpen(true)}
              icon={<CloudUploadOutlined />}
              size="large"
              className="hover:bg-blue-50 transition-colors"
              title="Probar Google Cloud Storage"
            >
              Storage
            </Button> */}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx, .xls"
              style={{ display: "none" }}
              onChange={handleChange}
            />
          </div>
        </div>
      </motion.div>

      {/* Modal de exportación */}
      <Modal
        title={
          <div className="flex items-center">
            <ExportOutlined className="text-green-500 mr-2" />
            <span>Exportar productos</span>
          </div>
        }
        open={isExportModalVisible}
        onOk={handleExport}
        onCancel={() => setIsExportModalVisible(false)}
        confirmLoading={loading}
        okText="Exportar"
        cancelText="Cancelar"
        okButtonProps={{
          className: "bg-green-500 hover:bg-green-600",
          size: "large",
        }}
        cancelButtonProps={{ size: "large" }}
      >
        <Space direction="vertical" style={{ width: "100%" }} className="mt-4">
          <Text strong className="text-lg">
            ¿Cuántos productos desea exportar?
          </Text>
          <Input
            type="number"
            placeholder="Dejar vacío para exportar todos"
            value={exportLimit}
            onChange={(e) => setExportLimit(Number(e.target.value))}
            min={1}
            size="large"
            className="mt-2"
            prefix={<DatabaseOutlined className="text-gray-400" />}
          />
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-3">
            <Text className="text-blue-700 flex items-center">
              <InfoCircleOutlined className="mr-1" />
              Nota: Los productos se exportarán ordenados por nombre
            </Text>
          </div>
        </Space>
      </Modal>

      {/* Modal de prueba de Storage */}
    {/*   <StorageTestModal
        open={isStorageTestModalOpen}
        onClose={() => setIsStorageTestModalOpen(false)}
      /> */}
    </div>
  );
};

export default HeaderTable;
