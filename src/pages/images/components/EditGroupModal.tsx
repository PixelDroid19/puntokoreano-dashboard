// components/EditGroupModal.tsx
import React from "react";
import { Modal, Form, Input, Button, notification, Progress } from "antd";
import {
  PlusOutlined,
  TagOutlined,
  FileImageOutlined,
  EditOutlined,
  InboxOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/lib/upload/interface";
import { ImageGroup } from "../../../services/files.service";
import "./EditGroupModal.css";
import Dragger from "antd/es/upload/Dragger";

interface EditGroupModalProps {
  group: ImageGroup | null;
  visible: boolean;
  onClose: () => void;
  onUpdate: (values: any) => Promise<void>;
  onAddImages: (files: File[]) => Promise<void>;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  group,
  visible,
  onClose,
  onUpdate,
  onAddImages,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<
    Record<string, number>
  >({});

  React.useEffect(() => {
    if (group) {
      const tagsString = Array.isArray(group.tags) ? group.tags.join(", ") : "";
      form.setFieldsValue({
        description: group.description,
        tags: tagsString,
      });
    }
    // Limpiar estado al abrir/cerrar modal
    return () => {
      setFileList([]);
      setUploadProgress({});
    };
  }, [group, form, visible]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Formatear tags
      const formattedTags = values.tags
        ? values.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : [];

      // Actualizar grupo
      await onUpdate({
        description: values.description,
        tags: formattedTags,
      });

      // Subir imágenes si hay nuevas
      if (fileList.length > 0) {
        const files = fileList
          .filter((file) => file.originFileObj)
          .map((file) => file.originFileObj as File);

        // Inicializar progreso para cada archivo
        files.forEach((file) => {
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: 0,
          }));
        });

        await onAddImages(files);
      }

      notification.success({
        message: "Grupo actualizado",
        description: "Los cambios se guardaron correctamente",
      });

      setFileList([]);
      setUploadProgress({});
      form.resetFields();
      onClose();
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: error.message || "Error al actualizar el grupo",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: "file",
    multiple: true,
    fileList,
    listType: "picture-card" as const,
    accept: "image/*",
    beforeUpload: (file: File) => {
      if (file.size > 2 * 1024 * 1024) {
        notification.error({
          message: "Error",
          description: `${file.name} excede el tamaño máximo de 2MB`,
        });
        return false;
      }

      if (!file.type.startsWith("image/")) {
        notification.error({
          message: "Error",
          description: `${file.name} no es un archivo de imagen válido`,
        });
        return false;
      }

      return false; // Prevenir upload automático
    },
    onChange: ({ fileList: newFileList }: any) => {
      setFileList(newFileList);
    },
    onRemove: (file: UploadFile) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });
      return true;
    },
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-lg">
          <EditOutlined className="text-blue-500" />
          <span>Editar Grupo de Imágenes</span>
        </div>
      }
      open={visible}
      onCancel={() => {
        setFileList([]);
        setUploadProgress({});
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Guardar cambios"
      cancelText="Cancelar"
      width={700}
      className="edit-group-modal"
    >
      <div className="bg-gray-50 p-4 mb-4 rounded-lg">
        <div className="font-medium text-gray-700">ID del grupo:</div>
        <code className="block bg-white p-3 rounded border text-sm mt-1">
          {group?.identifier}
        </code>
      </div>

      <Form form={form} layout="vertical" className="space-y-4">
      <Form.Item
          name="description"
          label={
            <span className="flex items-center gap-2">
              <FileImageOutlined />
              Descripción del grupo
            </span>
          }
          rules={[
            {
              max: 500,
              message: "La descripción no puede exceder los 500 caracteres",
            },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Describe el propósito o contenido de este grupo de imágenes..."
            className="resize-none"
          />
        </Form.Item>

        <Form.Item
          name="tags"
          label={
            <span className="flex items-center gap-2">
              <TagOutlined />
              Etiquetas
            </span>
          }
          help="Separa las etiquetas con comas (ej: producto, banner, promoción)"
        >
          <Input
            placeholder="producto, banner, promoción..."
            className="rounded-md"
          />
        </Form.Item>
        <Form.Item
          label={
            <span className="flex items-center gap-2">
              <PlusOutlined />
              Añadir imágenes
            </span>
          }
        >
          <Dragger {...uploadProps} className="upload-area">
            <p className="ant-upload-drag-icon">
              <InboxOutlined className="text-4xl text-blue-500" />
            </p>
            <p className="ant-upload-text font-medium">
              Haz clic o arrastra imágenes aquí
            </p>
            <p className="ant-upload-hint text-gray-500">
              Soporta múltiples archivos. Máximo 2MB por imagen
            </p>
          </Dragger>

          {/* Preview de imágenes con barra de progreso */}
          {fileList.length > 0 && (
            <div className="space-y-4 mt-4">
              {fileList.map((file) => (
                <div
                  key={file.uid}
                  className="flex items-center gap-4 bg-gray-50 p-3 rounded"
                >
                  <img
                    src={
                      file.thumbUrl ||
                      (file.originFileObj &&
                        URL.createObjectURL(file.originFileObj))
                    }
                    alt={file.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium truncate">
                        {file.name}
                      </span>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => uploadProps.onRemove(file)}
                        size="small"
                      />
                    </div>
                    {uploadProgress[file.name] !== undefined && (
                      <Progress
                        percent={uploadProgress[file.name]}
                        size="small"
                        status={
                          uploadProgress[file.name] === 100
                            ? "success"
                            : "active"
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditGroupModal;
