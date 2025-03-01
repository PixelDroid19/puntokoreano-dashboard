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
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { AboutSettings } from "../../types/about.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AboutService from "../../services/about.service";
import { RcFile } from "antd/es/upload";
import "./styles/about-settings.css";

const AboutSettingsPage = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

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
  }, [isFetching, isSuccess]);

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

  const uploadMutation = useMutation({
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
  });

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
            label="Imagen de Perfil"
            rules={[{ required: true, message: "La imagen es requerida" }]}
          >
            <UploadComponent fieldPath={[field.name, "image"]} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name={[field.name, "qrCode"]} label="Código QR">
            <UploadComponent fieldPath={[field.name, "qrCode"]} />
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
    <Card title="Configuración About">
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={settings}
      >
        <Card title="Misión Social" className="mb-4">
          <Form.Item
            name={["socialMission", "text"]}
            rules={[
              {
                required: true,
                message: "El texto de la misión social es requerido",
              },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={24} md={12}>
              <Form.Item
                name={["socialMission", "backgroundImage"]}
                label="Imagen de Fondo"
                rules={[
                  { required: true, message: "La imagen de fondo es requerida" },
                ]}
              >
                <Input placeholder="URL de la imagen" />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item label="O sube una imagen">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={(file) =>
                    handleImageUpload(file, ["socialMission", "backgroundImage"])
                  }
                  showUploadList={false}
                >
                  <div>
                    <PlusOutlined />
                    <div>Subir</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          
          {form.getFieldValue(["socialMission", "backgroundImage"]) && (
            <div className="image-preview">
              <img 
                src={form.getFieldValue(["socialMission", "backgroundImage"])} 
                alt="Vista previa" 
                style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }} 
              />
            </div>
          )}
        </Card>

        <Card title="Ubicación" className="mb-4">
          <Form.Item
            name={["location", "address"]}
            label="Dirección"
            rules={[{ required: true, message: "La dirección es requerida" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name={["location", "mapUrl"]}
            label="URL del Mapa"
            rules={[
              { required: true, message: "La URL del mapa es requerida" },
              { type: "url", message: "Por favor ingresa una URL válida" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Coordenadas" required className="mb-0">
            <Input.Group compact>
              <Form.Item
                name={["location", "coordinates", "lat"]}
                rules={[{ required: true, message: "La latitud es requerida" }]}
                style={{
                  display: "inline-block",
                  width: "calc(50% - 8px)",
                  marginRight: "16px",
                }}
              >
                <InputNumber
                  placeholder="Latitud"
                  style={{ width: "100%" }}
                  min={-90}
                  max={90}
                  step={0.000001}
                />
              </Form.Item>
              <Form.Item
                name={["location", "coordinates", "lng"]}
                rules={[
                  { required: true, message: "La longitud es requerida" },
                ]}
                style={{ display: "inline-block", width: "calc(50% - 8px)" }}
              >
                <InputNumber
                  placeholder="Longitud"
                  style={{ width: "100%" }}
                  min={-180}
                  max={180}
                  step={0.000001}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Card>

        <Card title="Consultores" className="mb-4">
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
                    })
                  }
                  block
                  icon={<PlusOutlined />}
                >
                  Agregar Consultor
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Button
          type="primary"
          htmlType="submit"
          loading={updateMutation.isPending}
          className="mt-4"
        >
          Guardar Cambios
        </Button>
      </Form>
    </Card>
  );
};

export default AboutSettingsPage;
