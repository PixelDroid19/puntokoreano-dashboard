import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Card,
  Button,
  Space,
  message,
  Tabs,
  Typography,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BuildOutlined,
  FileTextOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import BillingService from "../../services/billing.service";
import type { BillingSettings } from "../../types/billing.types";
import Loading from "../../components/shared/loading/Loading.component";

const { TabPane } = Tabs;
const { Title } = Typography;

const BillingSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["billingSettings"],
    queryFn: () => BillingService.getSettings(),
  });

  const updateSettings = useMutation({
    mutationFn: (e) => BillingService.updateSettings(e),
    onSuccess: () => {
      message.success("Configuración de facturación actualizada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["billingSettings"] });
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const handleSubmit = async (values: BillingSettings) => {
    const errors = BillingService.validateSettings(values);

    if (errors.length > 0) {
      errors.forEach((error) => message.error(error));
      return;
    }

    updateSettings.mutate(values);
  };

  if (isFetching) return <Loading />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Space direction="vertical" className="w-full" size="large">
        <Title level={2}>Configuración de Facturación</Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={settings?.data}
          disabled={isLoading}
          className="max-w-4xl"
        >
          <Tabs defaultActiveKey="company">
            <TabPane
              tab={
                <span>
                  <BuildOutlined /> Información de la Empresa
                </span>
              }
              key="company"
            >
              <Card>
                <Form.Item
                  name={["company_info", "name"]}
                  label="Nombre de la Empresa"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name={["company_info", "tax_id"]}
                  label="RUT"
                  rules={[
                    { required: true },
                    {
                      pattern: /^[0-9]{9}-[0-9]$/,
                      message: "Debe coincidir con el formato: XXXXXXXXX-X",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name={["company_info", "address"]}
                  label="Dirección"
                  rules={[{ required: true }]}
                >
                  <Input.TextArea rows={2} />
                </Form.Item>

                <Space className="w-full gap-4">
                  <Form.Item
                    name={["company_info", "phone"]}
                    label="Teléfono"
                    rules={[{ required: true }]}
                    className="flex-1"
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name={["company_info", "email"]}
                    label="Correo Electrónico"
                    rules={[{ required: true }, { type: "email" }]}
                    className="flex-1"
                  >
                    <Input />
                  </Form.Item>
                </Space>

                <Form.Item
                  name={["company_info", "website"]}
                  label="Sitio Web"
                  rules={[
                    {
                      type: "url",
                      message: "Por favor ingrese una URL válida",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Card>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <FileTextOutlined /> Configuración de Facturas
                </span>
              }
              key="invoice"
            >
              <Card>
                <Space className="w-full gap-4">
                  <Form.Item
                    name={["invoice_settings", "prefix"]}
                    label="Prefijo de Factura"
                    rules={[{ required: true }]}
                    className="flex-1"
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name={["invoice_settings", "start_number"]}
                    label="Número Inicial"
                    rules={[{ required: true }]}
                    className="flex-1"
                  >
                    <InputNumber min={1} className="w-full" />
                  </Form.Item>
                </Space>

                <Form.Item
                  name={["invoice_settings", "format"]}
                  label="Formato de Factura"
                  rules={[{ required: true }]}
                  extra="Variables disponibles: {{prefix}}, {{year}}, {{month}}, {{number}}"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name={["invoice_settings", "terms_conditions"]}
                  label="Términos y Condiciones"
                  rules={[{ required: true }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Card>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <PercentageOutlined /> Configuración de Impuestos
                </span>
              }
              key="tax"
            >
              <Card>
                <Form.Item
                  name={["tax_settings", "tax_name"]}
                  label="Nombre del Impuesto"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name={["tax_settings", "default_rate"]}
                  label="Tasa de Impuesto por Defecto (%)"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    precision={2}
                    className="w-full"
                    formatter={(value) => `${value}%`}
                    parser={(value) => value!.replace("%", "")}
                  />
                </Form.Item>

                <Form.Item
                  name={["tax_settings", "tax_id_label"]}
                  label="Etiqueta de RUT"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Card>
            </TabPane>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Space>
              <Button onClick={() => form.resetFields()}>Restablecer</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateSettings.isPending}
              >
                Guardar Cambios
              </Button>
            </Space>
          </div>
        </Form>
      </Space>
    </div>
  );
};

export default BillingSettingsPage;
