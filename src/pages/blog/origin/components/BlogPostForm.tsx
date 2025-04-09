import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Space,
  Row,
  Col,
  Card,
  message,
  Image,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import type { RcFile, UploadFile } from "antd/es/upload";
import type { SelectProps } from "antd";
import type { BlogPost, Brand } from "../../../types/blog.types";
import { axiosInstance } from "../../../../utils/axios-interceptor";
import axios from "axios";

interface BlogPostFormProps {
  initialValues?: Partial<BlogPost>;
  onSubmit: (values: any) => void;
  loading?: boolean;
  brands?: Brand[];
}

// Quill editor configuration
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["link", "image"],
    ["clean"],
    [{ align: [] }],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "link",
  "color",
  "background",
  "align",
  "image",
];

const BlogPostForm: React.FC<BlogPostFormProps> = ({
  initialValues,
  onSubmit,
  loading,
  brands = [],
}) => {
  const [form] = Form.useForm();
  const [content, setContent] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        "vehicle.brand":
          initialValues.vehicle?.brand?._id || initialValues.vehicle?.brand,
      });
      setContent(initialValues.content || "");

      // Initialize featured image if exists
      if (initialValues.featured_image?.url) {
        setFileList([
          {
            uid: "-1",
            name: "featured_image",
            status: "done",
            url: initialValues.featured_image.url,
          },
        ]);
      }

      // Initialize gallery images if exist
      if (initialValues.gallery?.length) {
        setGalleryFiles(
          initialValues.gallery.map((img, index) => ({
            uid: String(-index - 2),
            name: `gallery-${index}`,
            status: "done",
            url: img.url,
          }))
        );
      }
    }
  }, [initialValues, form]);

  const handleQuillChange = (value: string) => {
    setContent(value);
    form.setFieldsValue({ content: value });
  };

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleUpload = async (file: RcFile, type: "featured" | "gallery") => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadLoading(true);
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${
          import.meta.env.VITE_IMGBB_API_KEY
        }`,
        formData
      );

      const newFile = {
        uid: String(Math.random()),
        name: file.name,
        status: "done" as const,
        url: response.data.data.url,
      };

      if (type === "featured") {
        setFileList([newFile]);
        form.setFieldsValue({
          featured_image: {
            url: response.data.data.url,
            alt: form.getFieldValue("title") || "Featured image",
          },
        });
      } else {
        setGalleryFiles((prev) => {
          const newFiles = [...prev, newFile];
          form.setFieldsValue({
            gallery: newFiles.map((file) => ({
              url: file.url,
              alt: form.getFieldValue("title") || "Gallery image",
              caption: "",
            })),
          });
          return newFiles;
        });
      }

      message.success("Imagen cargada exitosamente");
    } catch (error) {
      message.error("Error al cargar la imagen");
      console.error("Error uploading image:", error);
    } finally {
      setUploadLoading(false);
    }

    return false;
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const beforeUpload = (file: RcFile, type: "featured" | "gallery") => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Solo se permiten archivos de imagen!");
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("La imagen debe ser menor a 2MB!");
      return false;
    }

    handleUpload(file, type);
    return false;
  };

  const handleSubmit = (values: any) => {
    const formData = {
      ...values,
      content,
      featured_image: fileList[0]
        ? {
            url: fileList[0].url,
            alt: values.title,
          }
        : undefined,
      gallery: galleryFiles.map((file) => ({
        url: file.url,
        alt: values.title || "Gallery image",
        caption: "",
      })),
    };

    onSubmit(formData);
  };

  const uploadButton = (
    <div>
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="mt-2">Subir</div>
    </div>
  );

  // Options for difficulty level select
  const difficultyOptions: SelectProps["options"] = [
    { label: "Principiante", value: "beginner" },
    { label: "Intermedio", value: "intermediate" },
    { label: "Avanzado", value: "advanced" },
  ];

  // Options for maintenance type select
  const maintenanceOptions: SelectProps["options"] = [
    { label: "Preventivo", value: "preventive" },
    { label: "Correctivo", value: "corrective" },
    { label: "Actualización", value: "upgrade" },
    { label: "Tips", value: "tips" },
    { label: "General", value: "general" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-6"
      >
        <Row gutter={24}>
          <Col span={16}>
            {/* Main Content */}
            <Card className="mb-6">
              <Form.Item
                name="title"
                label="Título"
                rules={[{ required: true, message: "El título es requerido" }]}
              >
                <Input placeholder="Ingrese el título del artículo" />
              </Form.Item>

              <Form.Item
                name="content"
                label="Contenido"
                rules={[
                  { required: true, message: "El contenido es requerido" },
                ]}
              >
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={handleQuillChange}
                  modules={modules}
                  formats={formats}
                  className="h-96"
                />
              </Form.Item>
            </Card>

            {/* Vehicle Information */}
            <Card title="Información del Vehículo" className="mb-6">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name={["vehicle", "brand"]}
                    label="Marca"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Seleccione marca"
                      options={brands.map((brand) => ({
                        label: brand.display_name,
                        value: brand.id,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name={["vehicle", "model"]}
                    label="Modelo"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Ej: Sportage" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={["vehicle", "engine"]} label="Motor">
                    <Input placeholder="Ej: 2.0L Turbo" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={["vehicle", "year_range", "start"]}
                    label="Año inicio"
                    rules={[{ required: true }]}
                  >
                    <Input type="number" min={1900} max={2024} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={["vehicle", "year_range", "end"]}
                    label="Año fin"
                    rules={[{ required: true }]}
                  >
                    <Input type="number" min={1900} max={2024} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Technical Details */}
            <Card title="Detalles Técnicos" className="mb-6">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="maintenance_type"
                    label="Tipo de Mantenimiento"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Seleccione tipo"
                      options={maintenanceOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="difficulty_level"
                    label="Nivel de Dificultad"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Seleccione nivel"
                      options={difficultyOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={
                      <span>
                        Tiempo Estimado
                        <Tooltip title="Tiempo aproximado para realizar el mantenimiento">
                          <InfoCircleOutlined className="ml-1" />
                        </Tooltip>
                      </span>
                    }
                  >
                    <Input.Group compact>
                      <Form.Item name={["estimated_time", "value"]} noStyle>
                        <Input type="number" style={{ width: "60%" }} min={1} />
                      </Form.Item>
                      <Form.Item
                        name={["estimated_time", "unit"]}
                        noStyle
                        initialValue="minutes"
                      >
                        <Select style={{ width: "40%" }}>
                          <Select.Option value="minutes">Minutos</Select.Option>
                          <Select.Option value="hours">Horas</Select.Option>
                        </Select>
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
              </Row>

              <Form.List name="parts_required">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space
                        key={key}
                        style={{ display: "flex", marginBottom: 8 }}
                        align="baseline"
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          rules={[
                            { required: true, message: "Nombre requerido" },
                          ]}
                        >
                          <Input placeholder="Nombre de la pieza" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "part_number"]}>
                          <Input placeholder="Número de parte" />
                        </Form.Item>
                        <Button onClick={() => remove(name)} type="link" danger>
                          Eliminar
                        </Button>
                      </Space>
                    ))}
                    <Button type="dashed" onClick={() => add()} block>
                      + Agregar Pieza Requerida
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </Col>

          <Col span={8}>
            {/* Sidebar Content */}
            <Card title="Publicación" className="mb-6">
              <Form.Item name="status" initialValue="draft">
                <Select
                  options={[
                    { label: "Borrador", value: "draft" },
                    { label: "Publicado", value: "published" },
                    { label: "Archivado", value: "archived" },
                  ]}
                />
              </Form.Item>

              <Form.Item label="Imagen Destacada">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onPreview={handlePreview}
                  beforeUpload={(file) => beforeUpload(file, "featured")}
                  maxCount={1}
                >
                  {fileList.length >= 1 ? null : uploadButton}
                </Upload>
              </Form.Item>

              <Form.Item label="Galería de Imágenes">
                <Upload
                  listType="picture-card"
                  fileList={galleryFiles}
                  onPreview={handlePreview}
                  beforeUpload={(file) => beforeUpload(file, "gallery")}
                >
                  {galleryFiles.length >= 8 ? null : uploadButton}
                </Upload>
              </Form.Item>

              <Form.Item
                name="excerpt"
                label="Extracto"
                tooltip="Breve descripción que aparecerá en las vistas previas del artículo"
              >
                <Input.TextArea
                  rows={4}
                  maxLength={300}
                  showCount
                  placeholder="Breve descripción del artículo..."
                />
              </Form.Item>
            </Card>

            {/* SEO Information */}
            <Card title="SEO" className="mb-6">
              <Form.Item
                name={["seo", "title"]}
                label="Título SEO"
                tooltip="Si se deja vacío, se usará el título del artículo"
              >
                <Input placeholder="Título optimizado para motores de búsqueda" />
              </Form.Item>

              <Form.Item name={["seo", "description"]} label="Descripción SEO">
                <Input.TextArea
                  rows={3}
                  maxLength={160}
                  showCount
                  placeholder="Descripción optimizada para motores de búsqueda"
                />
              </Form.Item>

              <Form.Item name={["seo", "keywords"]} label="Palabras clave">
                <Select
                  mode="tags"
                  placeholder="Agregue palabras clave"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <div className="flex justify-end">
          <Space>
            <Button onClick={() => form.resetFields()}>Cancelar</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialValues ? "Actualizar" : "Crear"} Artículo
            </Button>
          </Space>
        </div>
      </Form>

      {/* Image Preview Modal */}
      {previewOpen && (
        <Image
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => {
              setPreviewOpen(visible);
              if (!visible) {
                setPreviewImage("");
              }
            },
          }}
          src={previewImage}
          alt="Preview"
        />
      )}
    </div>
  );
};

export default BlogPostForm;
