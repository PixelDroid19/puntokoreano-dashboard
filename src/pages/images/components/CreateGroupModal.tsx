// src/pages/images/components/CreateGroupModal.tsx
import React, { useState } from "react";
import {
  InboxOutlined,
  FileImageOutlined,
  PictureOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Modal,
  Upload,
  notification,
  Input,
  Form,
  Progress,
  Typography,
  Row,
  Col,
  Divider,
  Card,
  Empty,
  Tag,
  Space,
} from "antd";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import FilesService from "../../../services/files.service";

const { Title, Text, Paragraph } = Typography;

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
}

const MAX_CAROUSEL_IMAGES = 8;
const ALLOWED_EXTENSIONS_STRING = ".jpg,.jpeg,.png,.gif,.webp";
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const COMMON_IMAGE_RULES = "Formatos: JPG, PNG, GIF, WEBP. Máx 2MB.";

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  visible,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const [productImageFile, setProductImageFile] = useState<UploadFile | null>(
    null
  );
  const [carouselImageFiles, setCarouselImageFiles] = useState<UploadFile[]>(
    []
  );

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [totalProgress, setTotalProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: async ({
      identifier,
      description,
      productImage,
      carouselImages,
    }: {
      identifier: string;
      description?: string;
      productImage?: File;
      carouselImages?: File[];
    }) => {
      const totalFilesToUpload =
        (productImage ? 1 : 0) + (carouselImages?.length || 0);

      let currentFile = 0;

      // Inicializar progreso
      if (productImage) {
        setUploadProgress((prev) => ({ ...prev, [productImage.name]: 0 }));
      }
      
      if (carouselImages) {
        carouselImages.forEach(file => {
          setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
        });
      }

      // Subir usando FilesService que ahora usa Google Cloud Storage
      const result = await FilesService.createGroup({
        identifier,
        description,
        thumb: productImage,
        carousel: carouselImages,
      });

      // Simular progreso visual
      if (productImage) {
            setUploadProgress((prev) => ({
              ...prev,
          [productImage.name]: 100,
            }));
            currentFile++;
        setTotalProgress(Math.round((currentFile / totalFilesToUpload) * 100));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (carouselImages) {
        for (const file of carouselImages) {
              setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
              currentFile++;
          setTotalProgress(Math.round((currentFile / totalFilesToUpload) * 100));
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      return result;
    },
    onSuccess: () => {
      notification.success({
        message: "Éxito",
        description: "Imágenes subidas correctamente a Google Cloud Storage",
      });
      queryClient.invalidateQueries({ queryKey: ["imageGroupsModule"] });
      handleCloseModal();
    },
    onError: (error: any) => {
      notification.error({
        message: "Error",
        description: error.message || "Error al procesar las imágenes",
      });
    },
    onSettled: () => {
      setUploadProgress({});
      setTotalProgress(0);
    },
  });

  const validateImage = async (
    file: RcFile,
    expectedWidth: number,
    expectedHeight: number,
    maxSizeMB: number = 2
  ): Promise<boolean> => {
    const allowedFormats = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedFormats.includes(file.type)) {
      notification.error({
        message: "Formato no permitido",
        description: `${file.name} no es un formato válido (JPG, PNG, GIF, WEBP).`,
      });
      return false;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      notification.error({
        message: "Archivo muy grande",
        description: `${file.name} excede el tamaño máximo de ${maxSizeMB}MB.`,
      });
      return false;
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);
    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = (err) => reject(err);
      });
    } catch (error) {
      notification.error({
        message: "Error al cargar imagen",
        description: `No se pudo leer el archivo ${file.name} para validación.`,
      });
      URL.revokeObjectURL(image.src);
      return false;
    }

    if (image.width !== expectedWidth || image.height !== expectedHeight) {
      notification.error({
        message: "Dimensiones incorrectas",
        description: `${file.name} debe ser de ${expectedWidth}x${expectedHeight}px. Actuales: ${image.width}x${image.height}px.`,
      });
      URL.revokeObjectURL(image.src);
      return false;
    }
    URL.revokeObjectURL(image.src);
    return true;
  };

  const productImageUploadProps: UploadProps = {
    name: "productImage",
    listType: "picture-card",
    fileList: productImageFile ? [productImageFile] : [],
    maxCount: 1,
    accept: ALLOWED_EXTENSIONS_STRING,
    beforeUpload: async (file) => {
      const isValid = await validateImage(file, 300, 300);
      if (isValid) {
        setProductImageFile({
          uid: file.uid,
          name: file.name,
          status: "done",
          originFileObj: file as RcFile,
          url: URL.createObjectURL(file),
        });
      }
      return false;
    },
    onRemove: () => {
      if (productImageFile && productImageFile.url) {
        URL.revokeObjectURL(productImageFile.url);
      }
      setProductImageFile(null);
    },
  };

  const carouselImageUploadProps: UploadProps = {
    name: "carouselImages",
    multiple: true,
    listType: "picture-card",
    fileList: carouselImageFiles,
    accept: ALLOWED_EXTENSIONS_STRING,
    beforeUpload: async (file) => {
      if (carouselImageFiles.length >= MAX_CAROUSEL_IMAGES) {
        notification.warning({
          message: "Límite alcanzado",
          description: `Solo puedes subir un máximo de ${MAX_CAROUSEL_IMAGES} imágenes para el carrusel.`,
        });
        return false;
      }
      const isValid = await validateImage(file, 600, 600);
      if (isValid) {
        setCarouselImageFiles((prev) => [
          ...prev,
          {
            uid: file.uid,
            name: file.name,
            status: "done",
            originFileObj: file as RcFile,
            url: URL.createObjectURL(file),
          },
        ]);
      }
      return false;
    },
    onChange: (info) => {
      if (info.file.status === "removed") {
        if (info.file.url) {
          URL.revokeObjectURL(info.file.url);
        }
        setCarouselImageFiles((prev) =>
          prev.filter((f) => f.uid !== info.file.uid)
        );
        return;
      }

      if (
        info.file.status !== "uploading" &&
        info.file.originFileObj &&
        carouselImageFiles.length < MAX_CAROUSEL_IMAGES &&
        !carouselImageFiles.find((f) => f.uid === info.file.uid)
      ) {
        const file = info.file.originFileObj as RcFile;
        validateImage(file, 600, 600).then((isValid) => {
          if (isValid) {
            setCarouselImageFiles((prev) => [
              ...prev,
              {
                uid: file.uid,
                name: file.name,
                status: "done",
                originFileObj: file,
                url: URL.createObjectURL(file),
              },
            ]);
          }
        });
      }
    },
    onRemove: (file) => {
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
      setCarouselImageFiles((prev) => prev.filter((f) => f.uid !== file.uid));
    },
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!productImageFile?.originFileObj) {
        notification.warning({
          message: "Falta imagen principal",
          description:
            "Por favor, suba la imagen principal del producto (300x300).",
        });
        return;
      }
      if (carouselImageFiles.length === 0) {
        notification.warning({
          message: "Faltan imágenes de carrusel",
          description:
            "Por favor, suba al menos una imagen para el carrusel (600x600).",
        });
        return;
      }

      // Usar la mutación que ya maneja Google Cloud Storage
      await uploadMutation.mutateAsync({
        identifier: values.identifier,
        description: values.description,
        productImage: productImageFile.originFileObj as File,
        carouselImages: carouselImageFiles.map(f => f.originFileObj as File),
      });

             // El success y la invalidación de queries se manejan en la mutación
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: error.message || "Error al procesar las imágenes",
      });
    }
  };

  const handleCloseModal = () => {
    form.resetFields();
    if (productImageFile && productImageFile.url) {
      URL.revokeObjectURL(productImageFile.url);
    }
    carouselImageFiles.forEach((file) => {
      if (file.url) URL.revokeObjectURL(file.url);
    });
    setProductImageFile(null);
    setCarouselImageFiles([]);
    setUploadProgress({});
    setTotalProgress(0);
    onClose();
  };

  const renderUploadButton = (
    text: string,
    icon?: React.ReactNode,
    details?: string
  ) => (
    <div className="flex flex-col items-center justify-center h-full p-3 text-center">
      {icon || <UploadOutlined className="text-3xl text-gray-400" />}
      <Text className="mt-2 text-sm font-medium">{text}</Text>
      {details && (
        <Text type="secondary" className="text-xs mt-1">
          {details}
        </Text>
      )}
    </div>
  );

  const totalFilesToUpload =
    (productImageFile ? 1 : 0) + carouselImageFiles.length;

  return (
    <Modal
      title={
        <Space>
          <PictureOutlined /> Cargar Nuevo Grupo de Imágenes
        </Space>
      }
      open={visible}
      onCancel={handleCloseModal}
      onOk={handleSubmit}
      confirmLoading={uploadMutation.isPending}
      okText={
        uploadMutation.isPending
          ? `Subiendo... (${totalProgress}%)`
          : "Crear Grupo y Subir"
      }
      cancelText="Cancelar"
      width={900}
      destroyOnClose
      bodyStyle={{
        paddingTop: 20,
        paddingBottom: 20,
        maxHeight: "70vh",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <Form form={form} layout="vertical" className="space-y-6">
        <Card size="small" bordered={false} className="bg-white">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="identifier"
                label={<Text strong className="text-base">Identificador del Grupo</Text>}
                rules={[
                  { required: true, message: "Por favor ingrese un identificador único" },
                  { pattern: /^[a-zA-Z0-9_-]+$/, message: "Solo letras, números, guiones y guiones bajos." },
                  { min: 3, message: "Debe tener al menos 3 caracteres." },
                ]}
                help="Usado para organizar y referenciar este conjunto de imágenes (ej: toyota_hilux_roja_2023)."
              >
                <Input placeholder="Ej: ssangyong_korando_rojo_interior" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="description"
                label={<Text strong className="text-base">Descripción (opcional)</Text>}
                rules={[{ max: 200, message: "Máximo 200 caracteres." }]}
                help="Breve descripción para identificar el grupo (opcional)."
              >
                <Input.TextArea rows={2} placeholder="Ej: Imágenes interiores y exteriores de la Korando roja 2023" maxLength={200} showCount />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={10}>
            <Card
              title={
                <Space>
                  <FileImageOutlined />
                  Imagen Principal
                </Space>
              }
              bordered={true}
              className="shadow-md hover:shadow-lg transition-shadow bg-white"
              headStyle={{ backgroundColor: "#fafafa" }}
            >
              <Upload {...productImageUploadProps}>
                {productImageFile
                  ? null
                  : renderUploadButton("Subir Imagen (300x300px)")}
              </Upload>
              <Paragraph
                type="secondary"
                style={{
                  fontSize: 12,
                  display: "block",
                  marginTop: 10,
                  textAlign: "center",
                }}
              >
                {COMMON_IMAGE_RULES}
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={14}>
            <Card
              title={
                <Space>
                  <InboxOutlined />
                  Imágenes del Carrusel (Máx. {MAX_CAROUSEL_IMAGES})
                </Space>
              }
              bordered={true}
              className="shadow-md hover:shadow-lg transition-shadow bg-white"
              headStyle={{ backgroundColor: "#fafafa" }}
            >
              {carouselImageFiles.length === 0 && !uploadMutation.isPending && (
                <div className="py-6">
                  <Empty
                    image={
                      <InboxOutlined
                        style={{ fontSize: 48, color: "#d1d5db" }}
                      />
                    }
                    description={
                      <div className="text-center">
                        <Text strong>Arrastre imágenes aquí</Text>
                        <Text type="secondary" className="block text-xs">
                          o haga clic para seleccionar (hasta{" "}
                          {MAX_CAROUSEL_IMAGES}).
                        </Text>
                      </div>
                    }
                  />
                </div>
              )}
              <Upload {...carouselImageUploadProps}>
                {carouselImageFiles.length >= MAX_CAROUSEL_IMAGES
                  ? null
                  : renderUploadButton("Añadir Imagen (600x600px)")}
              </Upload>
              <Paragraph
                type="secondary"
                style={{
                  fontSize: 12,
                  display: "block",
                  marginTop: 10,
                  textAlign: "center",
                }}
              >
                {COMMON_IMAGE_RULES}
                {carouselImageFiles.length > 0 && (
                  <Tag color="blue" className="ml-2 align-middle">
                    {carouselImageFiles.length} de {MAX_CAROUSEL_IMAGES} subidas
                  </Tag>
                )}
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {uploadMutation.isPending && totalProgress > 0 && (
          <Card size="small" bordered className="mt-6 bg-gray-50">
            <Title level={5} style={{ marginBottom: 12, textAlign: "center" }}>
              Progreso de Carga
            </Title>
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <Text
                    ellipsis
                    style={{ maxWidth: "65%" }}
                    className="text-sm"
                  >
                    {fileName}
                  </Text>
                  <Text type="secondary" className="text-sm">
                    {progress}%
                  </Text>
                </div>
                <Progress
                  percent={progress}
                  size="small"
                  status={progress === 100 ? "success" : "active"}
                />
              </div>
            ))}
            {totalFilesToUpload > 1 && (
              <>
                <Divider style={{ margin: "16px 0" }} />
                <div className="flex justify-between items-center mb-1">
                  <Text strong className="text-base">
                    Progreso Total
                  </Text>
                  <Text strong className="text-base">
                    {totalProgress}%
                  </Text>
                </div>
                <Progress
                  percent={totalProgress}
                  status={totalProgress === 100 ? "success" : "active"}
                />
              </>
            )}
          </Card>
        )}
      </Form>
    </Modal>
  );
};

const MemoizedCreateGroupModal = React.memo(CreateGroupModal);
export default MemoizedCreateGroupModal;

/* Example CSS (CreateGroupModal.css) */
/*
.product-image-uploader .ant-upload.ant-upload-select-picture-card {
  width: 100%;
  height: 150px;
}

.carousel-image-uploader .ant-upload-list-item-container {
  width: calc(25% - 8px);
  height: 100px; 
}
.carousel-image-uploader .ant-upload.ant-upload-select-picture-card {
  width: calc(25% - 8px);
  height: 100px;
}
*/

let totalFilesToUpload = 0;
