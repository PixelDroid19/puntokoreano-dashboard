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
} from "antd";
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
  const [useGroupImages, setUseGroupImages] = React.useState(
    product.useGroupImages
  );

  // Queries
  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
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
      const selectedGroup = groups.data.find((g) => g.name === product.group);
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
                      options={groups?.data?.map((group) => ({
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

          <TabPane tab="Multimedia" key="2">
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

          <TabPane tab="Descripción" key="3">
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

          <TabPane tab="SEO" key="4">
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
