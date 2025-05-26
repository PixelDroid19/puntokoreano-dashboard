import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Upload,
  Button,
  Switch,
  InputNumber,
  message,
  Row,
  Col,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  LoadingOutlined,
  SaveOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { AboutSettings } from "../../types/about.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AboutService from "../../services/about.service";
import { RcFile } from "antd/es/upload";
import "./styles/about-settings.css";

const { TabPane } = Tabs;

const AboutSettingsPage = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [useSharedHeaderImage, setUseSharedHeaderImage] = useState(false);
  const [sharedHeaderImage, setSharedHeaderImage] = useState<string>();

  const {
    data: settings,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: ["about-settings"],
    queryFn: () => AboutService.getSettings().then((res) => res.data),
  });

  useEffect(() => {
    if (isSuccess && !isFetching) {
      form.setFieldsValue(settings);
    }
  }, [isFetching, isSuccess, settings, form]);

  const updateMutation = useMutation({
    mutationFn: (data: AboutSettings) =>
      AboutService.updateSettings(data).then((res) => res.data),
    onSuccess: () => {
      message.success("Configuración actualizada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["about-settings"] });
    },
    onError: () => {
      message.error("Error al actualizar la configuración");
    },
  });

/*   const uploadMutation = useMutation({
    mutationFn: ({ file, fieldPath }: { file: File; fieldPath: string[] }) =>
      AboutService.uploadImage(file).then((url) => ({ url, fieldPath })),
    onSuccess: ({ url, fieldPath }) => {
      const currentValues = form.getFieldsValue();
      const newValues = { ...currentValues };

      let current = newValues;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        current[fieldPath[i]] = current[fieldPath[i]] || {};
        current = current[fieldPath[i]];
      }
      current[fieldPath[fieldPath.length - 1]] = url;

      form.setFieldsValue(newValues);
      queryClient.setQueryData(["about-settings"], newValues);
    },
    onError: () => {
      message.error("Error al subir la imagen");
    },
  }); */

  const handleSubmit = (values: AboutSettings) => {
    const formattedValues = {
      ...values,
      consultants: values.consultants?.map((consultant) => ({
        ...consultant,
        active: consultant.active ?? true,
        order: consultant.order ?? 0,
      })),
    };
    updateMutation.mutate(formattedValues);
  };

  const handleImageUpload = async (file: File, fieldPath: string[]) => {
    try {
      const isValidFileType = ["image/jpeg", "image/png", "image/gif"].includes(
        file.type
      );
      const isValidFileSize = file.size / 1024 / 1024 < 2;

      if (!isValidFileType) {
        message.error("Por favor, sube un archivo de imagen (JPG, PNG, GIF)");
        return Upload.LIST_IGNORE;
      }

      if (!isValidFileSize) {
        message.error("La imagen debe ser menor a 2MB");
        return Upload.LIST_IGNORE;
      }

      const loadingKey = `uploading-${fieldPath.join("-")}`;
      message.loading({ content: "Subiendo...", key: loadingKey });

      const url = await AboutService.uploadImage(file);

      if (!url) {
        throw new Error("No se recibió URL del servicio de carga");
      }

      const newValues = { ...form.getFieldsValue() };
      let current = newValues;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        current[fieldPath[i]] = current[fieldPath[i]] || {};
        current = current[fieldPath[i]];
      }
      current[fieldPath[fieldPath.length - 1]] = url;

      form.setFieldsValue(newValues);
      queryClient.setQueryData(["about-settings"], newValues);

      message.success({ content: "Carga exitosa", key: loadingKey });
      return false;
    } catch (error) {
      console.error("Error de carga:", error);
      message.error("Error al subir la imagen");
      return Upload.LIST_IGNORE;
    }
  };

  const ConsultantForm = ({
    field,
    remove,
  }: {
    field: any;
    remove: (index: number) => void;
  }) => (
    <Card
      key={field.key}
      title={`Consultor ${field.name + 1}`}
      className="mb-4"
      extra={
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => remove(field.name)}
        />
      }
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={[field.name, "name"]}
            label="Nombre"
            rules={[{ required: true, message: "El nombre es requerido" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={[field.name, "position"]}
            label="Cargo"
            rules={[{ required: true, message: "El cargo es requerido" }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={[field.name, "phone"]}
            label="Teléfono"
            rules={[{ required: true, message: "El teléfono es requerido" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={[field.name, "whatsapp"]} label="WhatsApp">
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={[field.name, "email"]}
            label="Correo"
            rules={[{ type: "email", message: "Correo inválido" }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Form.Item name={[field.name, "description"]} label="Descripción">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={[field.name, "order"]}
            label="Orden"
            initialValue={0}
          >
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item
            name={[field.name, "active"]}
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={[field.name, "image"]}
            rules={[{ required: true, message: "La imagen es requerida" }]}
          >
            <UploadComponent 
              value={form.getFieldValue([field.name, "image"]) } 
              onChange={(url) => form.setFieldValue(["consultants", field.name, "image"], url)}
              label="Imagen de Perfil"
              required={true}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <div>
            <Form.Item label="Usar imagen de encabezado común" className="mb-2">
              <Switch
                checked={useSharedHeaderImage}
                onChange={(checked) => {
                  setUseSharedHeaderImage(checked);
                  if (checked && sharedHeaderImage) {
                    form.setFieldValue(["consultants", field.name, "headerImage"], sharedHeaderImage);
                  }
                }}
              />
            </Form.Item>
            {useSharedHeaderImage ? (
              field.name === 0 && (
                <Form.Item
                  label="Imagen de Encabezado Común"
                  rules={[{ required: true, message: "La imagen de encabezado es requerida" }]}
                >
                  <UploadComponent
                    value={sharedHeaderImage}
                    onChange={(url) => {
                      setSharedHeaderImage(url);
                      // Update all consultants with the new shared image
                      const consultants = form.getFieldValue("consultants") || [];
                      consultants.forEach((_, index) => {
                        form.setFieldValue(["consultants", index, "headerImage"], url);
                      });
                    }}
                    label="Imagen de Encabezado"
                    required={true}
                  />
                </Form.Item>
              )
            ) : (
              <Form.Item
                name={[field.name, "headerImage"]}
                rules={[{ required: true, message: "La imagen de encabezado es requerida" }]}
              >
                <UploadComponent
                  value={form.getFieldValue(["consultants", field.name, "headerImage"])}
                  onChange={(url) => form.setFieldValue(["consultants", field.name, "headerImage"], url)}
                  label="Imagen de Encabezado"
                  required={true}
                />
              </Form.Item>
            )}
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item name={[field.name, "qrCode"]} label="Código QR">
            <UploadComponent 
              value={form.getFieldValue(["consultants", field.name, "qrCode"]) } 
              onChange={(url) => form.setFieldValue(["consultants", field.name, "qrCode"], url)}
              label="Código QR"
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const UploadComponent = ({
    value,
    onChange,
    label,
    required = false,
  }: {
    value?: string;
    onChange?: (url: string | undefined) => void;
    label: string;
    required?: boolean;
  }) => {
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (value !== previewUrl) {
            setPreviewUrl(value);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleUpload = async (file: RcFile) => {
      try {
        setLoading(true);
        const url = await AboutService.uploadImage(file);
        setPreviewUrl(url);
        onChange?.(url);
        return false;
      } catch (error) {
        message.error("Error al subir la imagen");
        return Upload.LIST_IGNORE;
      } finally {
        setLoading(false);
      }
    };

    const handleRemove = () => {
      setPreviewUrl(undefined);
      onChange?.(undefined);
    };

    return (
      <Form.Item label={label} required={required} className="upload-component">
        <Upload
          listType="picture-card"
          showUploadList={false}
          beforeUpload={handleUpload}
        >
          {previewUrl ? (
            <div className="preview-container">
              <img
                src={previewUrl}
                alt="Vista previa"
                style={{ width: "100%" }}
              />
              <div className="preview-actions">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                />
              </div>
            </div>
          ) : (
            <div>
              {loading ? <LoadingOutlined /> : <PlusOutlined />}
              <div style={{ marginTop: 8 }}>Subir</div>
            </div>
          )}
        </Upload>
      </Form.Item>
    );
  };

  return (
    <Card title="Configuración de la Página Nosotros">
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={settings}
        className="space-y-6"
      >
        <Tabs defaultActiveKey="1" type="card">
          <TabPane 
            tab={<span><GlobalOutlined /> Misión Social</span>} 
            key="1"
          >
            <Card bordered={false}>
              <Form.Item
                name={["socialMission", "text"]}
                label="Texto de la Misión"
                rules={[
                  {
                    required: true,
                    message: "El texto de la misión social es requerido",
                  },
                ]}
                className="mb-4"
              >
                <Input.TextArea rows={4} placeholder="Describe la misión social de la empresa" />
              </Form.Item>

              <Row gutter={24} align="top">
                <Col span={24} md={12}>
                  <Form.Item
                    name={["socialMission", "backgroundImage"]}
                    label="URL Imagen de Fondo"
                    rules={[
                      { required: true, message: "La imagen de fondo es requerida" },
                      { type: "url", message: "Ingresa una URL válida" }
                    ]}
                    className="mb-0 md:mb-4"
                  >
                    <Input placeholder="https://ejemplo.com/imagen.jpg" />
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  <Form.Item 
                    label="O subir una imagen local (max 2MB)" 
                    className="mb-4"
                  >
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={(file) =>
                        handleImageUpload(file, ["socialMission", "backgroundImage"])
                      }
                      showUploadList={false}
                      className="about-social-mission-uploader"
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Subir</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
              
              {form.getFieldValue(["socialMission", "backgroundImage"]) && (
                <div className="mt-2 p-2 border rounded-md inline-block bg-gray-50">
                  <p className="text-xs font-medium mb-1 text-gray-600">Vista Previa (Misión):</p>
                  <img 
                    src={form.getFieldValue(["socialMission", "backgroundImage"])} 
                    alt="Vista previa de misión" 
                    className="max-w-sm max-h-40 object-contain rounded"
                  />
                </div>
              )}
            </Card>
          </TabPane>

          <TabPane 
            tab={<span><EnvironmentOutlined /> Ubicación</span>} 
            key="2"
          >
            <Card bordered={false}>
              <Form.Item
                name={["location", "address"]}
                label="Dirección Completa"
                rules={[{ required: true, message: "La dirección es requerida" }]}
              >
                <Input placeholder="Calle, Número, Ciudad, País"/>
              </Form.Item>

              <Form.Item
                name={["location", "mapUrl"]}
                label="URL de Google Maps"
                rules={[
                  { required: true, message: "La URL del mapa es requerida" },
                  { type: "url", message: "Por favor ingresa una URL válida" },
                ]}
              >
                <Input placeholder="https://maps.google.com/..." />
              </Form.Item>

              <Form.Item label="Coordenadas Geográficas" required className="mb-0">
                <Input.Group compact>
                  <Form.Item
                    name={["location", "coordinates", "lat"]}
                    noStyle
                    rules={[{ required: true, message: "Latitud requerida" }]}
                  >
                    <InputNumber
                      placeholder="Latitud (ej: 4.60971)"
                      className="w-1/2"
                      min={-90}
                      max={90}
                      step={0.000001}
                    />
                  </Form.Item>
                  <Form.Item
                    name={["location", "coordinates", "lng"]}
                    noStyle
                    rules={[{ required: true, message: "Longitud requerida" }]}
                  >
                    <InputNumber
                      placeholder="Longitud (ej: -74.08175)"
                      className="w-1/2"
                      min={-180}
                      max={180}
                      step={0.000001}
                    />
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane 
            tab={<span><TeamOutlined /> Consultores</span>} 
            key="3"
          >
            <Card bordered={false}>
              <Form.List name="consultants" initialValue={[]}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <ConsultantForm
                        key={field.key}
                        field={field}
                        remove={remove}
                      />
                    ))}
                    <Button
                      type="dashed"
                      onClick={() =>
                        add({
                          name: "",
                          position: "",
                          phone: "",
                          active: true,
                          order: fields.length,
                          image: "",
                          headerImage: useSharedHeaderImage && sharedHeaderImage ? sharedHeaderImage : "",
                          qrCode: "",
                        })
                      }
                      block
                      icon={<PlusOutlined />}
                      className="mt-4"
                    >
                      Agregar Consultor
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </TabPane>
        </Tabs>

        <div className="flex justify-end mt-8">
          <Button
            type="primary"
            htmlType="submit"
            loading={updateMutation.isPending}
            icon={<SaveOutlined />} 
            size="large"
          >
            Guardar Cambios Generales
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default AboutSettingsPage;
