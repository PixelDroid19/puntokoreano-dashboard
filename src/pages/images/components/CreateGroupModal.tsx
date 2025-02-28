// src/pages/images/components/AddImagesModal.tsx
import React from "react";
import { InboxOutlined } from "@ant-design/icons";
import {
  Modal,
  Upload,
  notification,
  Input,
  Form,
  Progress,
} from "antd";
import type { UploadFile } from "antd";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import FilesService from "../../../services/files.service";

const { Dragger } = Upload;

interface AddImagesModalProps {
  visible: boolean;
  onClose: () => void;
}

const CreateGroupModal: React.FC<AddImagesModalProps> = ({ visible, onClose }) => {
  const queryClient = useQueryClient();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});
  const [totalProgress, setTotalProgress] = React.useState(0);

  // Mutación para subir imágenes
  const uploadMutation = useMutation({
    mutationFn: async ({
      identifier,
      files,
    }: {
      identifier: string;
      files: File[];
    }) => {
      let progress = 0;
      const totalFiles = files.length;

      for (const file of files) {
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: 0,
        }));

        await FilesService.uploadImages(identifier, [file], (progressEvent) => {
          const fileProgress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: fileProgress,
          }));
        });

        progress += 1;
        setTotalProgress(Math.round((progress / totalFiles) * 100));
      }
    },
    onSuccess: () => {
      notification.success({
        message: "Éxito",
        description: "Imágenes subidas correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["imageGroupsModule"] });
      handleCloseModal();
    },
    onError: (error: any) => {
      notification.error({
        message: "Error",
        description: error.message || "Error al subir las imágenes",
      });
    },
    onSettled: () => {
      setUploadProgress({});
      setTotalProgress(0);
    },
  });

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
          description: `${file.name} no es una imagen válida`,
        });
        return false;
      }

      return false;
    },
    onRemove: (file: UploadFile) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
      return true;
    },
    onChange: ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
      setFileList(newFileList);
    },
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (fileList.length === 0) {
        notification.warning({
          message: "Sin archivos",
          description: "Por favor seleccione al menos una imagen",
        });
        return;
      }

      const files = fileList
        .filter((file) => file.originFileObj)
        .map((file) => file.originFileObj as File);

      await uploadMutation.mutateAsync({
        identifier: values.identifier,
        files,
      });
    } catch (error) {
      console.error("Error en upload:", error);
    }
  };

  const handleCloseModal = () => {
    form.resetFields();
    setFileList([]);
    setUploadProgress({});
    setTotalProgress(0);
    onClose();
  };

  return (
    <Modal
      title="Cargar Imágenes"
      open={visible}
      onCancel={handleCloseModal}
      onOk={handleSubmit}
      confirmLoading={uploadMutation.isPending}
      okText={uploadMutation.isPending ? `Subiendo (${totalProgress}%)` : "Subir"}
      cancelText="Cancelar"
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <Form.Item
          name="identifier"
          label="Identificador del grupo"
          rules={[
            { required: true, message: "Por favor ingrese un identificador" },
            {
              pattern: /^[a-zA-Z0-9_-]+$/,
              message: "Solo letras, números, guiones y guiones bajos",
            },
          ]}
          help="Este identificador se usará para referenciar las imágenes desde otros lugares"
        >
          <Input placeholder="Ej: product_123" />
        </Form.Item>

        <Dragger {...uploadProps} className="mb-6 p-8">
          <InboxOutlined className="text-5xl text-blue-500" />
          <p className="font-bold mt-4">
            Haga clic o arrastre las imágenes a esta área para cargarlas
          </p>
          <p className="text-gray-400 mt-2">
            Admite carga única o masiva. Máximo 2MB por imagen.
          </p>
        </Dragger>

        {Object.entries(uploadProgress).map(([fileName, progress]) => (
          <div key={fileName} className="mb-2">
            <div className="flex justify-between mb-1">
              <span className="text-sm">{fileName}</span>
              <span className="text-sm">{progress}%</span>
            </div>
            <Progress percent={progress} size="small" />
          </div>
        ))}

        {totalProgress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="font-medium">Progreso total</span>
              <span>{totalProgress}%</span>
            </div>
            <Progress percent={totalProgress} />
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default CreateGroupModal;