// src/pages/products/components/ProductEdit.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  message,
  Tabs,
  Card,
  Row,
  Col,
  Space,
  Button,
  Tooltip,
  Spin,
  Alert,
  Divider,
  Tag,
} from "antd";
import {
  InfoCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  CarOutlined,
} from "@ant-design/icons";
import type { Product } from "../../../api/types";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import ProductsService from "../../../services/products.service";
import { getGroups } from "../../../helpers/queries.helper";
import FilesService from "../../../services/files.service";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import VehicleSelector from "../../vehicle-manager/selectors/vehicle-selector";

interface ProductEditProps {
  open: boolean;
  onClose: () => void;
  productId: string;
}

const { TabPane } = Tabs;

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

interface Subgroup {
  name: string;
}
interface GroupOption {
  name: string;
  subgroups: Subgroup[];
}
interface ImageGroupOption {
  _id: string;
  identifier: string;
}

interface GroupsApiResponse {
  success: boolean;
  data: {
    groups: GroupOption[];
    pagination?: any;
  };
}

interface ImageGroupsApiResponse {
  success: boolean;
  data: {
    groups: ImageGroupOption[];
    pagination?: any;
  };
}

export const ProductEdit: React.FC<ProductEditProps> = ({
  open,
  onClose,
  productId,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [useGroupImages, setUseGroupImages] = useState<boolean>(false);

  const {
    data: productData,
    isLoading: isLoadingProduct,
    isError: isErrorProduct,
    error: errorProduct,
  } = useQuery<Product, Error>({
    queryKey: ["product", productId],
    queryFn: () => ProductsService.getProductById(productId),
    enabled: !!productId && open,
    staleTime: 5 * 60 * 1000,
  });

  const { data: groupsData } = useQuery<GroupsApiResponse, Error>({
    queryKey: ["groups"],
    queryFn: getGroups,
  });

  const { data: imageGroupsData } = useQuery<ImageGroupsApiResponse, Error>({
    queryKey: ["imageGroups"],
    queryFn: () => FilesService.getGroups(),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Product>) =>
      ProductsService.updateProduct(productId, payload),
    onSuccess: () => {
      message.success("Producto actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      onClose();
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message ||
          error.message ||
          "Error al actualizar el producto"
      );
    },
  });

  useEffect(() => {
    if (productData && groupsData?.data?.groups) {
      const currentGroup = groupsData.data.groups.find(
        (g) => g.name === productData.group
      );
      setSubgroups(currentGroup?.subgroups || []);
      setUseGroupImages(productData.useGroupImages || false);

      // Transformar compatible_vehicles para el selector de vehículos múltiple
      const vehicleOptions = productData.compatible_vehicles?.map(vehicle => {
        // Crear un nombre completo del vehículo usando la información de línea y modelo
        const modelName = vehicle.line?.model?.name || "";
        const lineName = vehicle.line?.name || "";
        const label = modelName && lineName 
          ? `${modelName} ${lineName}` 
          : vehicle.tag_id || "Vehículo";
        
        return {
          label,
          value: vehicle.id || vehicle._id,
        };
      }) || [];

      form.setFieldsValue({
        ...productData,
        seoTitle: productData.seo?.title || "",
        seoDescription: productData.seo?.description || "",
        seoKeywords: productData.seo?.keywords?.join(", ") || "",
        imageGroup: productData.imageGroup || undefined,
        compatible_vehicles: vehicleOptions,
        active: productData.active !== undefined ? productData.active : true,
      });
    } else if (!open) {
      // form.resetFields(); // Si no se usa destroyOnClose
    }
  }, [productData, groupsData, form, open]);

  const handleGroupChange = (value: string) => {
    const selectedGroup = groupsData?.data?.groups?.find(
      (g) => g.name === value
    );
    setSubgroups(selectedGroup?.subgroups || []);
    form.setFieldsValue({ subgroup: undefined });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Verificación adicional de stock vs reservedStock
      if (values.reservedStock > values.stock) {
        message.error("El stock reservado no puede exceder el stock total disponible");
        return;
      }
      
      // Extraer IDs de vehículos seleccionados
      const compatibleVehicleIds = values.compatible_vehicles?.map(
        vehicle => vehicle.value
      ) || [];

      const updatePayload: Partial<Product> = {
        name: values.name,
        price: values.price,
        code: values.code?.toString(),
        stock: values.stock,
        reservedStock: values.reservedStock,
        group: values.group,
        subgroup: values.subgroup,
        shipping: values.shipping,
        short_description: values.short_description,
        long_description: values.long_description,
        active: values.active,
        useGroupImages: useGroupImages,
        imageGroup: useGroupImages ? values.imageGroup : null,
        videoUrl: values.videoUrl,
        warranty: values.warranty,
        compatible_vehicles: compatibleVehicleIds,
        seo: {
          title: values.seoTitle || productData?.name || values.name,
          description:
            values.seoDescription ||
            productData?.short_description ||
            values.short_description,
          keywords: values.seoKeywords
            ? values.seoKeywords
                .split(",")
                .map((k: string) => k.trim())
                .filter(Boolean)
            : [],
        },
      };

      updateMutation.mutate(updatePayload);
    } catch (errorInfo) {
      console.error("Validation Failed:", errorInfo);
      message.error("Por favor revise los campos del formulario.");
    }
  };

  if (isLoadingProduct) {
    return (
      <Modal
        title="Editar Producto"
        open={open}
        onCancel={onClose}
        footer={null}
        centered
      >
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" tip="Cargando datos del producto..." />
        </div>
      </Modal>
    );
  }

  if (isErrorProduct) {
    return (
      <Modal title="Error" open={open} onCancel={onClose} footer={null}>
        <Alert
          message="Error al cargar datos"
          description={
            errorProduct?.message ||
            "No se pudieron obtener los detalles del producto."
          }
          type="error"
          showIcon
        />
      </Modal>
    );
  }

  return (
    <Modal
      title={`Editar Producto: ${productData?.name || ""}`}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Guardar Cambios"
      cancelText="Cancelar"
      confirmLoading={updateMutation.isPending}
      width={1000}
      destroyOnClose
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        <Tabs defaultActiveKey="1" type="card">
          {/* --- Tab: Información Básica --- */}
          <TabPane tab="Información Básica" key="1">
            <Row gutter={16}>
              {/* Columna Izquierda */}
              <Col xs={24} md={12}>
                <Card
                  title="Detalles Principales"
                  size="small"
                  bordered={false}
                >
                  <Form.Item
                    name="name"
                    label="Nombre"
                    rules={[
                      { required: true, message: "El nombre es requerido" },
                    ]}
                  >
                    <Input placeholder="Nombre del producto" />
                  </Form.Item>
                  <Form.Item
                    name="code"
                    label="SKU/Código"
                    rules={[{ required: true, message: "El SKU es requerido" }]}
                  >
                    <Input placeholder="Código único del producto" />
                  </Form.Item>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Form.Item
                        name="price"
                        label="Precio"
                        rules={[{ required: true, type: "number", min: 0 }]}
                      >
                        <InputNumber
                          className="w-full"
                          formatter={(value) =>
                            `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) =>
                            value ? value.replace(/\$\s?|,/g, "") : ""
                          }
                          min={0}
                          step={1}
                          placeholder="Precio de venta"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="stock"
                        label="Stock Total"
                        rules={[{ required: true, type: "number", min: 0 }]}
                      >
                        <InputNumber
                          className="w-full"
                          min={0}
                          placeholder="Cantidad total"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="reservedStock"
                    label="Stock Reservado"
                    tooltip="Cantidad no disponible para venta directa."
                    rules={[
                      { type: "number", min: 0 },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const totalStock = getFieldValue('stock');
                          if (!value || !totalStock || value <= totalStock) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('El stock reservado no puede exceder el stock total')
                          );
                        },
                      }),
                    ]}
                  >
                    <InputNumber
                      className="w-full"
                      min={0}
                      placeholder="Cantidad reservada"
                    />
                  </Form.Item>
                </Card>
              </Col>
              {/* Columna Derecha */}
              <Col xs={24} md={12}>
                <Card
                  title="Categorización y Envío"
                  size="small"
                  bordered={false}
                >
                  <Form.Item
                    name="group"
                    label="Grupo"
                    rules={[{ required: true, message: "Seleccione un grupo" }]}
                  >
                    <Select
                      placeholder="Seleccionar grupo"
                      onChange={handleGroupChange}
                      options={groupsData?.data?.groups?.map((group) => ({
                        label: group.name,
                        value: group.name,
                      }))}
                      loading={!groupsData}
                    />
                  </Form.Item>
                  <Form.Item
                    name="subgroup"
                    label="Subgrupo"
                    rules={[
                      { required: true, message: "Seleccione un subgrupo" },
                    ]}
                  >
                    <Select
                      placeholder="Seleccionar subgrupo"
                      options={subgroups?.map((sg) => ({
                        label: sg.name,
                        value: sg.name,
                      }))}
                      disabled={!form.getFieldValue("group")}
                    />
                  </Form.Item>
                  <Form.Item
                    name="shipping"
                    label="Métodos de Envío Permitidos"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Seleccionar métodos de envío"
                      allowClear
                      options={[
                        { label: "Envío Express", value: "express" },
                        { label: "Envío Estándar", value: "standard" },
                        { label: "Recoger en Tienda", value: "pickup" },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                    name="active"
                    label="Estado del Producto"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Activo"
                      unCheckedChildren="Inactivo"
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* --- Tab: Vehículos Compatibles --- */}
          <TabPane tab={<span><CarOutlined /> Vehículos Compatibles</span>} key="vehicles">
            <Card title="Compatibilidad de Vehículos" size="small" bordered={false}>
              <Form.Item 
                name="compatible_vehicles"
                label="Seleccionar Vehículos Compatibles"
                extra="Seleccione todos los vehículos con los que este producto es compatible"
              >
                <VehicleSelector 
                  isMulti={true}
                  placeholder="Buscar vehículos..."
                />
              </Form.Item>
              
              {productData?.compatible_vehicles && productData.compatible_vehicles.length > 0 && (
                <div className="mt-4">
                  <Divider orientation="left">Vehículos Asociados Actualmente</Divider>
                  <div className="flex flex-wrap gap-2">
                    {productData.compatible_vehicles.map((vehicle, index) => {
                      // Obtener los nombres del modelo y línea del vehículo
                      const modelName = vehicle.line?.model?.name || "";
                      const lineName = vehicle.line?.name || "";
                      const displayName = modelName && lineName 
                        ? `${modelName} ${lineName}` 
                        : vehicle.tag_id || `Vehículo ${index + 1}`;
                      
                      return (
                        <Tag
                          key={String(vehicle.id || vehicle._id || index)}
                          color="blue"
                          className="mb-2 py-1 px-2"
                          icon={<CarOutlined />}
                        >
                          {displayName}
                        </Tag>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <Alert
                type="info"
                message="Información de Compatibilidad"
                description="La asociación correcta con vehículos mejora la experiencia de búsqueda y ayuda a los clientes a encontrar productos compatibles con sus vehículos específicos."
                showIcon
                className="mt-4"
              />
            </Card>
          </TabPane>

          {/* --- Tab: Multimedia --- */}
          <TabPane tab="Multimedia" key="4">
            <Card title="Imágenes" bordered={false}>
              <Form.Item
                label="Usar Grupo de Imágenes"
                name="useGroupImages"
                valuePropName="checked"
              >
                <Switch onChange={setUseGroupImages} />
              </Form.Item>
              {useGroupImages && (
                <Form.Item
                  name="imageGroup"
                  label="Seleccionar Grupo de Imágenes"
                  rules={[
                    {
                      required: useGroupImages,
                      message: "Seleccione un grupo",
                    },
                  ]}
                >
                  <Select
                    placeholder="Buscar o seleccionar grupo"
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    options={imageGroupsData?.data?.groups?.map((group) => ({
                      label: group.identifier,
                      value: group._id,
                    }))}
                    loading={!imageGroupsData}
                  />
                </Form.Item>
              )}
              {!useGroupImages && (
                <Alert
                  type="warning"
                  message="La carga/gestión de imágenes individuales debe implementarse por separado."
                />
              )}
            </Card>
            <Card
              title="Video (Opcional)"
              bordered={false}
              style={{ marginTop: 16 }}
            >
              <Form.Item name="videoUrl" label="URL del Video (YouTube, Vimeo)">
                <Input placeholder="https://..." />
              </Form.Item>
            </Card>
          </TabPane>

          {/* --- Tab: Descripción --- */}
          <TabPane tab="Descripción" key="5">
            <Card title="Contenido Descriptivo" size="small" bordered={false}>
              <Form.Item
                name="short_description"
                label="Descripción Corta"
                rules={[{ required: true, message: "Requerida" }, { max: 200 }]}
              >
                <Input.TextArea
                  rows={3}
                  maxLength={200}
                  showCount
                  placeholder="..."
                />
              </Form.Item>
              <Form.Item
                name="long_description"
                label="Descripción Detallada"
                rules={[
                  {
                    validator: (_, value) =>
                      !value || value === "<p><br></p>"
                        ? Promise.reject(new Error("Requerida"))
                        : Promise.resolve(),
                    required: true,
                  },
                ]}
              >
                <ReactQuill
                  modules={quillModules}
                  theme="snow"
                  style={{ minHeight: "200px" }}
                />
              </Form.Item>
            </Card>
          </TabPane>

          {/* --- Tab: SEO --- */}
          <TabPane tab="SEO" key="6">
            <Card
              title="Optimización para Buscadores"
              size="small"
              bordered={false}
            >
              <Form.Item
                name="seoTitle"
                label="Título SEO"
                rules={[{ max: 70 }]}
                extra="Si vacío, usa nombre producto."
              >
                <Input
                  placeholder="Título atractivo (max 70 car.)"
                  maxLength={70}
                  showCount
                />
              </Form.Item>
              <Form.Item
                name="seoDescription"
                label="Meta Descripción"
                rules={[{ max: 160 }]}
                extra="Si vacío, usa desc. corta."
              >
                <Input.TextArea
                  rows={3}
                  maxLength={160}
                  showCount
                  placeholder="Resumen conciso (max 160 car.)."
                />
              </Form.Item>
              <Form.Item
                name="seoKeywords"
                label="Palabras Clave (Opcional)"
                extra="Separar por comas."
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Ej: repuesto, motor, hyundai"
                />
              </Form.Item>
            </Card>
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};
