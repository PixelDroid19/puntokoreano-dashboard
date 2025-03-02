// src/pages/products/components/ProductEdit.tsx
// @ts-nocheck
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
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Product } from "../../../api/types";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import ProductsService from "../../../services/products.service";
import { getGroups } from "../../../helpers/queries.helper";
import FilesService from "../../../services/files.service";
import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface ProductEditProps {
  open: boolean;
  onClose: () => void;
  product: Product;
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

export const ProductEdit = ({ open, onClose, product }: ProductEditProps) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [subgroups, setSubgroups] = React.useState<any[]>([]);
  const [useGroupImages, setUseGroupImages] = React.useState(product.useGroupImages);
  const [filters, setFilters] = React.useState({
    brand: "",
    model: "",
    family: "",
    transmission: "",
    fuel: "",
    line: "",
  });

  // Queries
  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
  });

  const { data: filterData } = useQuery({
    queryKey: ["getFilters"],
    queryFn: async () => {
      const response = await axios.get(ENDPOINTS.FILTERS.GET_ALL.url);
      return response.data;
    },
  });

  const { data: imageGroups } = useQuery({
    queryKey: ["imageGroups"],
    queryFn: () => FilesService.getGroups(),
  });

  const updateMutation = useMutation({
    mutationFn: (values: Partial<Product>) =>
      ProductsService.updateProduct(product.id, values),
    onSuccess: () => {
      message.success("Producto actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  React.useEffect(() => {
    if (product.group && groups?.data) {
      const selectedGroup = groups.data.groups.find((g) => g.name === product.group);
      if (selectedGroup) {
        setSubgroups(selectedGroup.subgroups);
      }
    }

    // Inicializar el formulario con los valores del producto
    form.setFieldsValue({
      ...product,
      imageGroup: product.imageGroup,
      useGroupImages: product.useGroupImages,
      seoTitle: product.seo?.title || "", 
      seoDescription: product.seo?.description || "",
      seoKeywords: product.seo?.keywords?.join(", ") || "",
    });
  }, [product, groups?.data]);

  const handleGroupChange = (value: string) => {
    const selectedGroup = groups?.data?.find((g) => g.name === value);
    if (selectedGroup) {
      setSubgroups(selectedGroup.subgroups);
      form.setFieldValue("subgroup", undefined);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Preparar datos del producto
      const productData = {
        ...values,
        useGroupImages,
        imageGroup: useGroupImages ? values.imageGroup : null,
        images: useGroupImages ? [] : values.images || [],
        seo: {
          title: values.seoTitle, // Enviamos el valor directamente
          description: values.seoDescription,
          keywords: values.seoKeywords
            ? values.seoKeywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
            : [],
        },
      };

      // Remover campos temporales
      delete productData.seoTitle;
      delete productData.seoDescription;
      delete productData.seoKeywords;

      updateMutation.mutate(productData);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Editar Producto"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={updateMutation.isPending}
      width={800}
    >
      <Form form={form} layout="vertical" initialValues={product}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Información Básica" key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Detalles Principales" size="small">
                  <Form.Item
                    name="name"
                    label="Nombre"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="price"
                    label="Precio"
                    rules={[{ required: true, type: "number" }]}
                  >
                    <InputNumber
                      className="w-full"
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
                    label="Stock"
                    rules={[{ required: true }]}
                  >
                    <InputNumber className="w-full" min={0} />
                  </Form.Item>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Categorización" size="small">
                  <Form.Item
                    name="group"
                    label="Grupo"
                    rules={[{ required: true }]}
                  >
                    <Select
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

          <TabPane tab="Información del Vehículo" key="2">
            <Card title="Detalles del Vehículo" size="small">
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
                      options={filterData?.data?.families?.[filters.model] || []}
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
                      options={filterData?.data?.transmissions?.[filters.model]?.[filters.family] || []}
                      disabled={!filters.family}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="fuel" label="Combustible">
                    <Select
                      placeholder="Seleccione el combustible"
                      onChange={(value) => setFilters(prev => ({ ...prev, fuel: value }))}
                      options={filterData?.data?.fuels?.[filters.model]?.[filters.family]?.[filters.transmission] || []}
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
                      options={filterData?.data?.lines?.[filters.model]?.[filters.family]?.[filters.transmission]?.[filters.fuel] || []}
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

          <TabPane tab="Detalles Técnicos" key="3">
            <Card title="Especificaciones Técnicas" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="maintenance_type" label="Tipo de Mantenimiento" rules={[{ required: true }]}>
                    <Select
                      placeholder="Seleccione tipo"
                      options={[
                        { label: "Preventivo", value: "preventive" },
                        { label: "Correctivo", value: "corrective" },
                        { label: "Actualización", value: "upgrade" },
                        { label: "Tips", value: "tips" },
                        { label: "General", value: "general" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="difficulty_level" label="Nivel de Dificultad" rules={[{ required: true }]}>
                    <Select
                      placeholder="Seleccione nivel"
                      options={[
                        { label: "Principiante", value: "beginner" },
                        { label: "Intermedio", value: "intermediate" },
                        { label: "Avanzado", value: "advanced" },
                      ]}
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
                      <Form.Item name={["estimated_time", "unit"]} noStyle initialValue="minutes">
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
                      <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          rules={[{ required: true, message: "Nombre requerido" }]}
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
          </TabPane>

          <TabPane tab="Multimedia" key="4">
            <Card title="Imágenes">
              <Form.Item label="Usar Grupo de Imágenes" name="useGroupImages">
                <Switch
                  checked={useGroupImages}
                  onChange={(checked) => {
                    setUseGroupImages(checked);
                    if (checked) {
                      form.setFieldsValue({ images: [] });
                    } else {
                      form.setFieldsValue({ imageGroup: undefined });
                    }
                  }}
                />
              </Form.Item>

              {useGroupImages ? (
                <Form.Item
                  name="imageGroup"
                  label="Grupo de Imágenes"
                  rules={[{ required: useGroupImages }]}
                >
                  <Select
                    options={imageGroups?.data?.groups?.map((group) => ({
                      label: group.identifier,
                      value: group._id,
                    }))}
                  />
                </Form.Item>
              ) : null}
            </Card>
          </TabPane>

          <TabPane tab="Descripción" key="5">
            <Card title="Contenido" size="small">
              <Form.Item
                name="short_description"
                label="Descripción Corta"
                rules={[{ required: true, max: 150 }]}
              >
                <Input.TextArea rows={3} maxLength={150} showCount />
              </Form.Item>

              <Form.Item
                name="long_description"
                label="Descripción Detallada"
                rules={[{ required: true }]}
              >
                <ReactQuill modules={quillModules} />
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane tab="SEO" key="6">
            <Card title="Optimización para Buscadores" size="small">
              <Form.Item
                name="seoTitle"
                label="Título SEO"
                rules={[
                  {
                    max: 60,
                    message: "El título SEO no debe exceder 60 caracteres",
                  },
                ]}
              >
                <Input placeholder="Título para SEO (si se deja vacío se usará el nombre del producto)" />
              </Form.Item>

              <Form.Item
                name="seoDescription"
                label="Descripción SEO"
                rules={[
                  {
                    max: 160,
                    message:
                      "La descripción SEO no debe exceder 160 caracteres",
                  },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Descripción para SEO (si se deja vacío se usará la descripción corta)"
                  showCount
                  maxLength={160}
                />
              </Form.Item>

              <Form.Item
                name="seoKeywords"
                label="Palabras Clave"
                help="Separar palabras clave por comas"
              >
                <Input.TextArea
                  rows={2}
                  placeholder="ej: repuesto, motor, hyundai"
                />
              </Form.Item>
            </Card>
          </TabPane>
        </Tabs>

        <Form.Item name="active" valuePropName="checked">
          <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
