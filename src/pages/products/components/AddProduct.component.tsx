// @ts-nocheck

import {
  Button,
  Col,
  Flex,
  Form,
  GetProp,
  Image,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  Upload,
  UploadFile,
  UploadProps,
  Tabs,
  Card,
  Space,
  Tooltip,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { RcFile } from "antd/es/upload";
import { getGroups } from "../../../helpers/queries.helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { NOTIFICATIONS } from "../../../enums/contants.notifications";
import { ProductCreateInput } from "../../../api/types";
import { DashboardService } from "../../../services/dashboard.service";
import FilesService from "../../../services/files.service";
import ENDPOINTS from "../../../api";

const { TabPane } = Tabs;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// Configuración del editor Quill
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["clean"],
    ["link"],
    [{ align: [] }],
    ["image", "video"],
  ],
};

const quillFormats = [
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
  "video",
];

const AddProduct = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [previewOpen, setPreviewOpen] = React.useState<boolean>(false);
  const [previewImage, setPreviewImage] = React.useState("");
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  const [videoUrl, setVideoUrl] = React.useState<string>("");
  const [useGroupImages, setUseGroupImages] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("1");
  const [subgroups, setSubgroups] = React.useState<[]>([]);
  const [filters, setFilters] = React.useState({
    brand: "",
    model: "",
    family: "",
    transmission: "",
    fuel: "",
    line: "",
  });


  // Queries con useQuery
  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
  });

  const { data: imageGroups } = useQuery({
    queryKey: ["imageGroups"],
    queryFn: () => FilesService.getGroups(),
  });

  const { data: filterData } = useQuery({
    queryKey: ["getFilters"],
    queryFn: async () => {
      const response = await axios.get(ENDPOINTS.FILTERS.GET_ALL.url);
      return response.data;
    },
  });
  
  const saveProduct = useMutation({
    mutationFn: (values: ProductCreateInput) => {
      return DashboardService.createProduct({
        ...values,
        active: true,
      });
    },
    onSuccess: () => {
      toast.success(NOTIFICATIONS.PRODUCT_CREATED);
      navigate("/products");
    },
    onError: (error: Error) => {
      if (error.message.includes("ya existe")) {
        toast.error(NOTIFICATIONS.PRODUCT_EXIST);
      } else {
        toast.error(error.message);
      }
    },
  });

  const handleUpload = async (file: RcFile) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${
          import.meta.env.VITE_IMGBB_API_KEY
        }`,
        formData
      );
      const newFile = {
        ...file,
        name: file.name,
        status: "done",
        url: response.data.data.url,
      };
      setFileList((prevFileList) => {
        const updatedFileList = [...prevFileList, newFile];
        form.setFieldsValue({
          images: updatedFileList.map((file) => file.url),
        });
        return updatedFileList;
      });
    } catch (error) {
      toast.error("Error al cargar la imagen");
      console.error(error);
    }

    return false;
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const onFinish = (values: ProductCreateInput) => {
    // Prepare the product data with all required and optional fields
    const productData = {
      // Required fields
      name: values.name,
      price: values.price,
      group: values.group,
      subgroup: values.subgroup,
      code: values.code, // Ensure code is sent as is (string or number)
      
      // Optional fields with defaults
      stock: values.stock || 0,
      shipping: values.shipping || [],
      short_description: values.short_description || '',
      long_description: values.long_description || '',
      active: true,
      
      // Image handling
      useGroupImages,
      imageGroup: useGroupImages ? values.imageGroup : null,
      images: useGroupImages ? [] : fileList.map((file) => file.url) || [],
      
      // Additional fields
      videoUrl: values.videoUrl || videoUrl,
      warranty: values.warranty || '',
      warrantyMonths: values.warrantyMonths,
      brand: values.brand || '',
      specifications: values.specifications || [],
      variants: values.variants || [],
      relatedProducts: values.relatedProducts || [],
      
      // Vehicle-specific fields
      model: values.model || '',
      family: values.family || '',
      transmission: values.transmission || '',
      fuel: values.fuel || '',
      line: values.line || '',
      
      // SEO information
      seo: {
        title: values.seoTitle || values.name,
        description: values.seoDescription || values.short_description,
        keywords: values.seoKeywords?.split(",").map((k) => k.trim()) || [],
      },
    };

    saveProduct.mutate(productData);
  };

  const validateForm = () => {
    if (useGroupImages && !form.getFieldValue("imageGroup")) {
      return false;
    }
    if (
      !useGroupImages &&
      (!fileList.length || !form.getFieldValue("images"))
    ) {
      return false;
    }
    return true;
  };

  // Funciones para obtener opciones de los filtros
  const getFamilyOptions = () => {
    if (!filters.model) return [];
    return filterData?.data?.families?.[filters.model] || [];
  };

  const getTransmissionOptions = () => {
    if (!filters.model || !filters.family) return [];
    return filterData?.data?.transmissions?.[filters.model]?.[filters.family] || [];
  };

  const getFuelOptions = () => {
    if (!filters.model || !filters.family || !filters.transmission) return [];
    return filterData?.data?.fuels?.[filters.model]?.[filters.family]?.[filters.transmission] || [];
  };

  const getLineOptions = () => {
    if (!filters.model || !filters.family || !filters.transmission || !filters.fuel) return [];
    return filterData?.data?.lines?.[filters.model]?.[filters.family]?.[filters.transmission]?.[filters.fuel] || [];
  };

  const handleGroupChange = (value: string) => {
    const selectedGroup = groups?.data?.groups?.find((g) => g.name === value);
    if (selectedGroup) {
      console.log('selectedGroup', selectedGroup)
      setSubgroups(selectedGroup.subgroups);
      // Limpiar el subgrupo seleccionado cuando cambia el grupo
      form.setFieldValue("subgroup", undefined);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Flex align="center" gap={5} className="mb-4">
        <Button size="small" type="text" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </Button>
        <h1 className="text-xl font-bold">Añadir un producto</h1>
      </Flex>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-6"
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Información Básica" key="1">
            <Row gutter={24}>
              <Col span={12}>
                <Card title="Detalles Principales" className="mb-4">
                  <Form.Item
                    name="name"
                    label="Nombre del Producto"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Ej: Reten delantero ciguenal" />
                  </Form.Item>

                  <Form.Item
                    name="price"
                    label="Precio"
                    rules={[{ required: true, type: "number" }]}
                  >
                    <InputNumber
                      className="w-full"
                      min={0}
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>

                  <Form.Item
                    name="code"
                    label="SKU/Código"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="stock"
                    label="Stock Inicial"
                    rules={[{ required: true, type: "number" }]}
                  >
                    <InputNumber className="w-full" min={0} />
                  </Form.Item>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Categorización" className="mb-4">
                  <Form.Item
                    name="group"
                    label="Grupo"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Seleccione un grupo"
                      onChange={handleGroupChange}
                      options={groups?.data?.groups?.map((group) => ({
                        label: group.name,
                        value: group.name,
                      }))}
                    />
                  </Form.Item>

                  <Form.Item
                    name="subgroup"
                    label="Subgrupo"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Seleccione un subgrupo"
                      disabled={!form.getFieldValue("group")}
                      options={subgroups?.map((sg) => ({
                        label: sg.name,
                        value: sg.name,
                      }))}
                    />
                  </Form.Item>

                  <Form.Item
                    name="shipping"
                    label="Métodos de Envío"
                    rules={[{ required: true }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Seleccione los métodos de envío"
                      options={[
                        { label: "Envío exprés", value: "express" },
                        { label: "Envío estándar", value: "standard" },
                        { label: "Recoger en tienda", value: "pickup" },
                      ]}
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Información del Vehículo" key="6">
            <Card title="Detalles del Vehículo">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="model" label="Modelo">
                    <Select
                      placeholder="Seleccione el modelo"
                      onChange={(value) => setFilters(prev => ({ ...prev, model: value }))}
                      options={Array.from({ length: 2025 - 2003 + 1 }, (_, i) => ({
                        label: `${2003 + i}`,
                        value: `${2003 + i}`,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="family" label="Familia">
                    <Select
                      placeholder="Seleccione la familia"
                      onChange={(value) => setFilters(prev => ({ ...prev, family: value }))}
                      options={getFamilyOptions()}
                      disabled={!filters.model}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="transmission" label="Transmisión">
                    <Select
                      placeholder="Seleccione la transmisión"
                      onChange={(value) => setFilters(prev => ({ ...prev, transmission: value }))}
                      options={getTransmissionOptions()}
                      disabled={!filters.family}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="fuel" label="Combustible">
                    <Select
                      placeholder="Seleccione el combustible"
                      onChange={(value) => setFilters(prev => ({ ...prev, fuel: value }))}
                      options={getFuelOptions()}
                      disabled={!filters.transmission}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="line" label="Línea">
                    <Select
                      placeholder="Seleccione la línea"
                      options={getLineOptions()}
                      disabled={!filters.fuel}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="brand" label="Marca">
                    <Input placeholder="Marca del vehículo" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>

          <TabPane tab="Multimedia" key="2">
            <Row gutter={24}>
              <Col span={24}>
                <Card title="Imágenes del Producto">
                  <Form.Item
                    label="Usar Grupo de Imágenes"
                    name="useGroupImages"
                  >
                    <Switch
                      checked={useGroupImages}
                      onChange={setUseGroupImages}
                    />
                  </Form.Item>

                  {useGroupImages ? (
                    <Form.Item name="imageGroup" rules={[{ required: true }]}>
                      <Select
                        placeholder="Seleccione un grupo de imágenes"
                        options={imageGroups?.data?.groups?.map((group) => ({
                          label: group.identifier,
                          value: group._id,
                        }))}
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item name="images" rules={[{ required: true }]}>
                      <Upload
                        listType="picture-card"
                        fileList={fileList}
                        beforeUpload={handleUpload}
                        onPreview={handlePreview}
                      >
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      </Upload>
                    </Form.Item>
                  )}
                </Card>

                <Card title="Video del Producto" className="mt-4">
                  <Form.Item
                    name="videoUrl"
                    label="URL del Video (YouTube/Vimeo)"
                    extra="Ingrese la URL del video de YouTube o Vimeo"
                  >
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Descripción" key="3">
            <Row gutter={24}>
              <Col span={24}>
                <Card title="Descripción del Producto">
                  <Form.Item
                    name="short_description"
                    label="Descripción Corta"
                    rules={[{ required: true, max: 150 }]}
                    extra="Máximo 150 caracteres. Esta descripción aparecerá en las vistas previas del producto."
                  >
                    <Input.TextArea maxLength={150} showCount rows={3} />
                  </Form.Item>

                  <Form.Item
                    name="long_description"
                    label="Descripción Detallada"
                    rules={[{ required: true }]}
                  >
                    <ReactQuill
                      theme="snow"
                      modules={quillModules}
                      formats={quillFormats}
                      style={{ height: "300px" }}
                    />
                  </Form.Item>
                </Card>

                <Card title="Especificaciones Técnicas" className="mt-4">
                  <Form.List name="specifications">
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
                              name={[name, "key"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Ingrese la característica",
                                },
                              ]}
                            >
                              <Input placeholder="Característica" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, "value"]}
                              rules={[
                                { required: true, message: "Ingrese el valor" },
                              ]}
                            >
                              <Input placeholder="Valor" />
                            </Form.Item>
                            <Button
                              onClick={() => remove(name)}
                              type="text"
                              danger
                            >
                              Eliminar
                            </Button>
                          </Space>
                        ))}
                        <Button type="dashed" onClick={() => add()} block>
                          + Agregar Especificación
                        </Button>
                      </>
                    )}
                  </Form.List>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="SEO y Metadatos" key="4">
            <Card title="Optimización para Buscadores">
              <Form.Item
                name="seoTitle"
                label={
                  <Space>
                    <span>Título SEO</span>
                    <Tooltip title="Si se deja vacío, se usará el nombre del producto">
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </Tooltip>
                  </Space>
                }
              >
                <Input
                  placeholder="Título optimizado para motores de búsqueda"
                  maxLength={60}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="seoDescription"
                label={
                  <Space>
                    <span>Descripción SEO</span>
                    <Tooltip title="Si se deja vacío, se usará la descripción corta">
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </Tooltip>
                  </Space>
                }
              >
                <Input.TextArea
                  placeholder="Descripción optimizada para motores de búsqueda"
                  maxLength={160}
                  showCount
                  rows={3}
                />
              </Form.Item>

              <Form.Item
                name="seoKeywords"
                label="Palabras clave"
                extra="Separar palabras clave con comas"
              >
                <Input.TextArea
                  placeholder="palabra1, palabra2, palabra3"
                  rows={2}
                />
              </Form.Item>
            </Card>

            <Card title="Garantía y Detalles Adicionales" className="mt-4">
              <Form.Item name="warranty" label="Información de Garantía">
                <ReactQuill
                  theme="snow"
                  modules={{
                    toolbar: [
                      ["bold", "italic"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["clean"],
                    ],
                  }}
                  style={{ height: "150px" }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="warrantyMonths"
                    label="Duración de la Garantía (meses)"
                  >
                    <InputNumber min={0} className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="brand" label="Marca">
                    <Input placeholder="Marca del producto" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Productos Relacionados" className="mt-4">
              <Form.Item
                name="relatedProducts"
                label="Seleccionar productos relacionados"
              >
                <Select
                  mode="multiple"
                  placeholder="Buscar productos..."
                  optionFilterProp="children"
                  // Aquí deberías cargar los productos existentes
                  options={[]}
                  maxTagCount={5}
                />
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane tab="Variantes" key="5">
            <Card title="Variantes del Producto">
              <Form.List name="variants">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card key={key} className="mb-4" size="small">
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, "name"]}
                              label="Nombre de Variante"
                              rules={[{ required: true }]}
                            >
                              <Input placeholder="Ej: Color, Tamaño" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, "value"]}
                              label="Valor"
                              rules={[{ required: true }]}
                            >
                              <Input placeholder="Ej: Rojo, Grande" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, "price"]}
                              label="Precio Adicional"
                            >
                              <InputNumber
                                className="w-full"
                                min={0}
                                formatter={(value) =>
                                  `$ ${value}`.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ","
                                  )
                                }
                                parser={(value) =>
                                  value!.replace(/\$\s?|(,*)/g, "")
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col span={2} className="flex items-center mt-8">
                            <Button
                              onClick={() => remove(name)}
                              type="text"
                              danger
                            >
                              Eliminar
                            </Button>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      className="mt-4"
                    >
                      + Agregar Variante
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </TabPane>
        </Tabs>

        <div className="flex justify-end gap-4 sticky bottom-0 bg-white p-4 border-t">
          <Button onClick={() => navigate(-1)}>Cancelar</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={saveProduct.isPending}
            disabled={!validateForm()}
          >
            Guardar Producto
          </Button>
        </div>
      </Form>

      {/* Modal de previsualización de imagen */}
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

      <style jsx global>{`
        .quill-wrapper {
          .ql-container {
            min-height: 200px;
            font-size: 16px;
          }

          .ql-editor {
            min-height: 200px;
            padding: 12px 15px;
          }

          .ql-toolbar {
            border-radius: 6px 6px 0 0;
          }

          .ql-container {
            border-radius: 0 0 6px 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default AddProduct;
