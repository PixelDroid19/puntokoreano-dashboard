// src/pages/images/components/HeaderTable.component.tsx
import { Button, Alert } from "antd";
import { InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react"; // Añadimos useState
import CreateGroupModal from "./CreateGroupModal"; // Importamos el nuevo componente

const HeaderImageManager = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestor de Imágenes</h2>
          <p className="text-gray-500 mt-1">
            Organiza y administra grupos de imágenes para tu aplicación
          </p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Nuevo Grupo
        </Button>
      </div>

      <Alert
        message={
          <div className="space-y-2 text-sm">
            <p>
              <strong>Grupos de Imágenes:</strong> Organiza tus imágenes en
              grupos para una mejor gestión.
            </p>
            <p>
              <strong>Límites:</strong> Cada imagen debe ser menor a 2MB y en
              formatos comunes (JPG, PNG, GIF).
            </p>
            <p>
              <strong>Identificador:</strong> Úsalo en el Excel de productos
              para asociar las imágenes al producto correspondiente.
            </p>
            <p>
              <strong>Etiquetas:</strong> Facilitan la búsqueda y organización
              de los grupos.
            </p>
          </div>
        }
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        className="bg-blue-50"
      />

      {/* Modal de creación */}
      <CreateGroupModal 
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </div>
  );
};

export default HeaderImageManager;