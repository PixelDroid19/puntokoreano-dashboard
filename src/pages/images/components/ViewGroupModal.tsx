// components/ViewGroupModal.tsx
import React from "react";
import {
  Modal,
  Image,
  Space,
  Button,
  Popconfirm,
  Tooltip,
  Tag,
  notification,
} from "antd";
import {
  DeleteOutlined,
  CopyOutlined,
  TagsOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { ImageGroup, ImageData } from "../../../services/files.service";

interface ViewGroupModalProps {
  group: ImageGroup | null;
  visible: boolean;
  onClose: () => void;
  onDeleteImage: (imageId: string) => Promise<void>;
  onCopyUrl: (url: string) => void;
}

const ViewGroupModal: React.FC<ViewGroupModalProps> = ({
  group,
  visible,
  onClose,
  onDeleteImage,
  onCopyUrl,
}) => {
  // Estado para manejar la carga al eliminar
  const [deletingImageId, setDeletingImageId] = React.useState<string | null>(
    null
  );
  // Estado para previsualización de imagen
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  // Manejar eliminación de imagen con estado de carga
  const handleDeleteImage = async (imageId: string) => {
    try {
      setDeletingImageId(imageId);
      await onDeleteImage(imageId);
      notification.success({
        message: "Imagen eliminada correctamente",
      });
    } catch (error: any) {
      notification.error({
        message: "Error al eliminar la imagen",
        description: error.message,
      });
    } finally {
      setDeletingImageId(null);
    }
  };

  // Manejar copia de URL con feedback
  const handleCopyUrl = async (url: string) => {
    try {
      await onCopyUrl(url);
      notification.success({
        message: "URL copiada al portapapeles",
        placement: "topRight",
      });
    } catch (error) {
      notification.error({
        message: "Error al copiar la URL",
        placement: "topRight",
      });
    }
  };

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-2">
            <TagsOutlined className="text-blue-500" />
            <span>Grupo: {group?.identifier}</span>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        className="image-group-modal"
      >
        {group && (
          <div className="space-y-6">
            {/* Identificador del grupo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <TagsOutlined />
                Identificador del grupo
              </h3>
              <code className="block bg-white p-3 rounded border text-sm">
                {group.identifier}
              </code>
              <small className="text-gray-500 mt-2 block">
                Usa este identificador para asociar estas imágenes en otros
                lugares
              </small>
            </div>

            {/* Información del grupo */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-bold mb-3">Información</h3>
              <p className="text-gray-600 mb-3">
                {group.description || "Sin descripción"}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.tags?.map((tag) => (
                  <Tag
                    key={tag}
                    icon={<TagsOutlined />}
                    className="flex items-center gap-1"
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>

            {/* Grid de imágenes */}
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <EyeOutlined />
                Imágenes ({group.images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {group.images.map((image: ImageData) => (
                  <div
                    key={image._id}
                    className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Image
                      src={image.url}
                      alt={image.name}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => setPreviewImage(image.url)}
                      preview={false}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <Space className="w-full justify-center">
                        <Tooltip title="Previsualizar">
                          <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => setPreviewImage(image.url)}
                          />
                        </Tooltip>
                        <Tooltip title="Copiar URL">
                          <Button
                            icon={<CopyOutlined />}
                            size="small"
                            onClick={() => handleCopyUrl(image.url)}
                          />
                        </Tooltip>
                        <Popconfirm
                          title="¿Eliminar esta imagen?"
                          description="Esta acción no se puede deshacer"
                          onConfirm={() => handleDeleteImage(image._id)}
                          okText="Sí, eliminar"
                          cancelText="No"
                        >
                          <Tooltip title="Eliminar">
                            <Button
                              icon={<DeleteOutlined />}
                              size="small"
                              danger
                              loading={deletingImageId === image._id}
                            />
                          </Tooltip>
                        </Popconfirm>
                      </Space>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de previsualización de imagen */}
      <div style={{ display: "none" }}>
        <Image.PreviewGroup
          preview={{
            visible: !!previewImage,
            onVisibleChange: (visible) => {
              if (!visible) setPreviewImage(null);
            },
            current:
              group?.images.findIndex((img) => img.url === previewImage) || 0,
          }}
        >
          {group?.images.map((image) => (
            <Image key={image._id} src={image.url} />
          ))}
        </Image.PreviewGroup>
      </div>
    </>
  );
};

export default ViewGroupModal;
