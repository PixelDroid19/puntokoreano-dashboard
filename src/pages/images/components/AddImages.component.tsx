// pages/images/AddImages.tsx
import React from "react";
import { InboxOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import {
  Button,
  Upload,
  notification,
  Input,
  Form,
  Space,
  Progress,
} from "antd";
import type { UploadFile } from "antd";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import FilesService from "../../../services/files.service";

const { Dragger } = Upload;

const AddImages: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [uploadProgress, setUploadProgress] = React.useState<
    Record<string, number>
  >({});
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
        // Inicializar progreso para cada archivo
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: 0,
        }));

        // Subir archivo individual
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
      queryClient.invalidateQueries({ queryKey: ["imageGroups"] });
      setTimeout(() => navigate("/images"), 1500);
    },
    onError: (error: any) => {
      notification.error({
        message: "Error",
        description: error.message || "Error al subir las imágenes",
      });
    },
    onSettled: () => {
      // Limpiar estados de progreso
      setUploadProgress({});
      setTotalProgress(0);
    },
  });

  // Props para el componente Upload
  const uploadProps = {
    name: "file",
    multiple: true,
    fileList,
    listType: "picture-card" as const,
    accept: "image/*",
    beforeUpload: (file: File) => {
      // Validar tamaño (2MB)
      if (file.size > 2 * 1024 * 1024) {
        notification.error({
          message: "Error",
          description: `${file.name} excede el tamaño máximo de 2MB`,
        });
        return false;
      }

      // Validar tipo
      if (!file.type.startsWith("image/")) {
        notification.error({
          message: "Error",
          description: `${file.name} no es una imagen válida`,
        });
        return false;
      }

      return false; // Prevenir upload automático
    },
    onRemove: (file: UploadFile) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
      return true;
    },
    onChange: ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
      setFileList(newFileList);
    },
  };

  const handleSubmit = async (values: { identifier: string }) => {
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

    try {
      await uploadMutation.mutateAsync({
        identifier: values.identifier,
        files,
      });
    } catch (error) {
      // El error ya se maneja en el onError de la mutación
      console.error("Error en upload:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Space className="mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Cargar imágenes</h1>
      </Space>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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

        {/* Añadir progreso individual por archivo */}
        {Object.entries(uploadProgress).map(([fileName, progress]) => (
          <div key={fileName} className="mb-2">
            <div className="flex justify-between mb-1">
              <span className="text-sm">{fileName}</span>
              <span className="text-sm">{progress}%</span>
            </div>
            <Progress percent={progress} size="small" />
          </div>
        ))}

        {/* Mostrar progreso total si hay archivos subiendo */}
        {totalProgress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="font-medium">Progreso total</span>
              <span>{totalProgress}%</span>
            </div>
            <Progress percent={totalProgress} />
          </div>
        )}
        <Button
          type="primary"
          htmlType="submit"
          disabled={uploadMutation.isPending || fileList.length === 0}
          loading={uploadMutation.isPending}
          block
        >
          {uploadMutation.isPending
            ? `Subiendo (${totalProgress}%)`
            : "Subir imágenes"}
        </Button>
      </Form>
    </div>
  );
};

export default AddImages;
