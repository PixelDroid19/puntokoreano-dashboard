// BrandFormModal.tsx
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Space,
  Card,
  Switch,
  Row,
  Col,
  DatePicker,
  message,
  Modal,
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import type { FormInstance } from "antd/es/form";
import { useEffect, useState } from "react";
import { Brand } from "../../api/types";
import dayjs from "dayjs";
import FilesService from "../../services/files.service";
const { RangePicker } = DatePicker;

const BrandFormModal: React.FC<{
  form: FormInstance;
  isVisible: boolean;
  editingBrand: Brand | null;
  onCancel: () => void;
  onFinish: (values: any) => void;
  loading: boolean;
}> = ({ form, isVisible, editingBrand, onCancel, onFinish, loading }) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  useEffect(() => {
    if (editingBrand) {
      setImageUrl(editingBrand.image?.url || "");
      setLogoUrl(editingBrand.logo?.url || "");
      form.setFieldsValue({
        ...editingBrand,
        year_range:
          editingBrand.metadata?.year_start && editingBrand.metadata?.year_end
            ? [
                dayjs(editingBrand.metadata.year_start.toString()),
                dayjs(editingBrand.metadata.year_end.toString()),
              ]
            : undefined,
      });
    } else {
      setImageUrl("");
      setLogoUrl("");
      form.resetFields();
    }
  }, [editingBrand, form]);

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Solo se permiten archivos de imagen!");
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      message.error("La imagen debe ser menor a 5MB!");
      return false;
    }

    return true;
  };

  const handleImageUpload = async (file: RcFile, type: "image" | "logo") => {
    if (!beforeUpload(file)) {
      return;
    }

    try {
      setUploadLoading(true);
      const result = await FilesService.uploadToGCS(file, 'brands');

      const imageData = {
        url: result.data.url,
        display_url: result.data.display_url,
        delete_url: result.data.delete_url,
        alt: file.name,
      };

      if (type === "image") {
        setImageUrl(imageData.display_url);
        form.setFieldValue("image", imageData);
      } else {
        setLogoUrl(imageData.display_url);
        form.setFieldValue("logo", imageData);
      }

      message.success(
        `${type === "image" ? "Imagen" : "Logo"} subido correctamente`
      );
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      message.error(
        `Error al subir ${
          type === "image" ? "la imagen" : "el logo"
        }. Por favor, intente nuevamente.`
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleImageError = (type: "image" | "logo") => {
    if (type === "image") {
      setImageUrl("");
      form.setFieldValue("image", undefined);
    } else {
      setLogoUrl("");
      form.setFieldValue("logo", undefined);
    }
    message.error(
      `Error al cargar ${
        type === "image" ? "la imagen" : "el logo"
      }. Por favor, intente nuevamente.`
    );
  };

  return (
    <Modal
      title={editingBrand ? "Editar Marca" : "Nueva Marca"}
      open={isVisible}
      onCancel={onCancel}
      width={800}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="max-h-[70vh] overflow-y-auto px-4"
      >
        <Row gutter={24}>
          <Col span={12}>
            {/* Información básica */}
            <Card title="Información Básica" className="mb-6">
              <Form.Item
                name="name"
                label="Identificador"
                rules={[
                  { required: true, message: "El identificador es requerido" },
                  {
                    pattern: /^[a-z0-9-_]+$/,
                    message: "Solo minúsculas, números y guiones",
                  },
                ]}
                tooltip="Identificador único para la marca (sin espacios ni caracteres especiales)"
              >
                <Input placeholder="ej: ssangyong-musso" />
              </Form.Item>

              <Form.Item
                name="display_name"
                label="Nombre para mostrar"
                rules={[{ required: true }]}
              >
                <Input placeholder="ej: SsangYong Musso" />
              </Form.Item>

              <Form.Item name="description" label="Descripción">
                <Input.TextArea
                  rows={4}
                  placeholder="Describe brevemente la marca..."
                />
              </Form.Item>
            </Card>

            {/* Estilos */}
            <Card title="Estilos" className="mb-6">
              <Form.Item
                name={["styles", "background"]}
                label="Color de fondo"
                tooltip="Clase de Tailwind para el fondo"
              >
                <Select
                  placeholder="Seleccione un color"
                  options={[
                    { label: "Amarillo", value: "bg-yellow-500" },
                    { label: "Azul", value: "bg-blue-500" },
                    { label: "Rojo", value: "bg-red-500" },
                    { label: "Verde", value: "bg-green-500" },
                  ]}
                />
              </Form.Item>

              <Form.Item name={["styles", "text_color"]} label="Color de texto">
                <Select
                  placeholder="Seleccione un color"
                  options={[
                    { label: "Blanco", value: "text-white" },
                    { label: "Negro", value: "text-black" },
                    { label: "Gris", value: "text-gray-700" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name={["styles", "border_color"]}
                label="Color de borde"
              >
                <Select
                  placeholder="Seleccione un color"
                  options={[
                    { label: "Amarillo", value: "border-yellow-500" },
                    { label: "Azul", value: "border-blue-500" },
                    { label: "Rojo", value: "border-red-500" },
                    { label: "Verde", value: "border-green-500" },
                  ]}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            {/* Imágenes */}
            <Card title="Imágenes" className="mb-6">
              <Form.Item
                label="Imagen principal"
                tooltip="Imagen representativa de la marca"
              >
                <Upload
                  name="image"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleImageUpload(file, "image");
                    return false;
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="imagen"
                      className="w-full h-full object-cover"
                      onError={() => handleImageError("image")}
                    />
                  ) : (
                    <div>
                      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
                      <div className="mt-2">Subir</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <Form.Item
                label="Logo"
                tooltip="Logo de la marca (fondo transparente recomendado)"
              >
                <Upload
                  name="logo"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleImageUpload(file, "logo");
                    return false;
                  }}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="logo"
                      className="w-full h-full object-cover"
                      onError={() => handleImageError("logo")}
                    />
                  ) : (
                    <div>
                      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
                      <div className="mt-2">Subir</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Card>

            {/* Metadatos */}
            <Card title="Metadatos" className="mb-6">
              <Form.Item
                name="year_range"
                label="Rango de años"
                tooltip="Período de actividad de la marca"
              >
                <RangePicker
                  picker="year"
                  placeholder={["Año inicio", "Año fin"]}
                />
              </Form.Item>

              <Form.Item
                name={["metadata", "popular_models"]}
                label="Modelos populares"
              >
                <Select
                  mode="tags"
                  placeholder="Agregar modelos populares"
                  tokenSeparators={[","]}
                />
              </Form.Item>
            </Card>

            {/* Estado */}
            <Form.Item
              name="active"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="Activa" unCheckedChildren="Inactiva" />
            </Form.Item>
          </Col>
        </Row>

        {/* Botones de acción */}
        <Form.Item className="mb-0 text-right">
          <Space>
            <Button onClick={onCancel}>Cancelar</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingBrand ? "Actualizar" : "Crear"} Marca
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BrandFormModal;
