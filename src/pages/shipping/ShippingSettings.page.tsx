import React from "react";
import {
  Card,
  Tabs,
  Form,
  Select,
  Table,
  Button,
  message,
  Input,
  Typography,
  Space,
  Spin,
} from "antd";
import { NumericFormat } from "react-number-format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DollarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  GiftOutlined,
  ScanOutlined,
} from "@ant-design/icons";
import ShippingSettingsService from "../../services/shipping.settings.service";

const { TabPane } = Tabs;
const { Title } = Typography;

const COLOMBIA_LOCATIONS = [
  "Bogotá D.C.",
  "Cundinamarca",
  "Antioquia",
  "Valle del Cauca",
  "Atlántico",
  "Santander",
  "Amazonas",
  "Vaupés",
  "Guainía",
  "Vichada",
];

const SHIPPING_METHODS = [
  { label: "Estándar", value: "standard" },
  { label: "Express", value: "express" },
];

// Componentes personalizados para inputs numéricos
const MoneyInput = ({ value, onChange, className, ...props }) => {
  return (
    <NumericFormat
      value={value}
      onValueChange={({ floatValue }) => onChange(floatValue)}
      thousandSeparator={true}
      prefix="$"
      customInput={Input}
      className={`ant-input ${className}`}
      decimalScale={0}
      {...props}
    />
  );
};

const WeightInput = ({ value, onChange, className, ...props }) => {
  return (
    <NumericFormat
      value={value}
      onValueChange={({ floatValue }) => onChange(floatValue)}
      thousandSeparator={true}
      suffix=" kg"
      customInput={Input}
      className={`ant-input ${className}`}
      decimalScale={2}
      {...props}
    />
  );
};

const DaysInput = ({ value, onChange, className, ...props }) => {
  return (
    <NumericFormat
      value={value}
      onValueChange={({ floatValue }) => onChange(floatValue)}
      suffix=" días"
      customInput={Input}
      className={`ant-input ${className}`}
      decimalScale={0}
      allowNegative={false}
      min={1}
      {...props}
    />
  );
};

const ShippingSettings = () => {
  const queryClient = useQueryClient();
  const [baseCostsForm] = Form.useForm();
  const [weightRulesForm] = Form.useForm();
  const [locationMultipliersForm] = Form.useForm();
  const [deliveryTimesForm] = Form.useForm();
  const [freeShippingForm] = Form.useForm();

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["shippingSettings"],
    queryFn: () => ShippingSettingsService.getSettings(),
    onError: (error) => {
      message.error("Error al cargar la configuración: " + error.message);
    },
  });

  // Mutations
  const updateBaseCosts = useMutation({
    mutationFn: (data) => ShippingSettingsService.updateBaseCosts(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["shippingSettings"]);
      message.success("Costos base actualizados");
    },
  });

  const updateWeightRules = useMutation({
    mutationFn: (data) => ShippingSettingsService.updateWeightRules(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["shippingSettings"]);
      message.success("Reglas de peso actualizadas");
    },
  });

  const updateLocationMultipliers = useMutation({
    mutationFn: (data) => ShippingSettingsService.updateLocationMultipliers(data),
    onSuccess: () => {
      const updatedData = locationMultipliersForm.getFieldsValue();
      ShippingSettingsService.updateLocationMultipliers(updatedData)
        .then(() => {
          queryClient.invalidateQueries(["shippingSettings"]);
          message.success("Multiplicadores por ubicación actualizados");
        })
        .catch((error) => {
          message.error("Error al actualizar multiplicadores: " + error.message);
        });
    },
  });
  
  const updateDeliveryTimes = useMutation({
    mutationFn: (data) => ShippingSettingsService.updateDeliveryTimes(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["shippingSettings"]);
      message.success("Tiempos de entrega actualizados");
    },
  });

  const updateFreeShipping = useMutation({
    mutationFn: (data) => ShippingSettingsService.updateFreeShipping(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["shippingSettings"]);
      message.success("Reglas de envío gratis actualizadas");
    },
  });

  React.useEffect(() => {
    if (settings) {
      // Inicializar formularios
      baseCostsForm.setFieldsValue({
        standard_cost: settings.base_costs.standard,
        express_cost: settings.base_costs.express,
      });
      weightRulesForm.setFieldsValue({
        base_weight: settings.weight_rules.base_weight,
        extra_cost_per_kg: settings.weight_rules.extra_cost_per_kg,
      });
      locationMultipliersForm.setFieldsValue({
        multipliers: settings.location_multipliers,
      });
      deliveryTimesForm.setFieldsValue({
        delivery_times: settings.delivery_times,
      });
      freeShippingForm.setFieldsValue({
        ...settings.free_shipping_rules,
      });
    }
  }, [settings]);

  const locationMultipliersColumns = [
    {
      title: "Ubicación",
      dataIndex: "location",
      key: "location",
      className: "font-medium",
    },
    {
      title: "Multiplicador",
      dataIndex: "multiplier",
      key: "multiplier",
      width: 200,
      render: (_, record) => (
        <Form.Item
          name={["multipliers", record.location]} // Estructura del nombre en cascada
          initialValue={record.multiplier} // Valor inicial
          rules={[{ required: true, message: "Este campo es obligatorio" }]}
          noStyle
        >
          <Input
            type="number"
            step="0.1"
            min={0}
            onChange={(e) => {
              const { value } = e.target;
              const currentValues = locationMultipliersForm.getFieldValue("multipliers") || {};
              locationMultipliersForm.setFieldsValue({
                multipliers: {
                  ...currentValues,
                  [record.location]: parseFloat(value) || 0,
                },
              });
            }}
          />
        </Form.Item>
      ),
    },
  ];
  

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Spin size="large" tip="Cargando configuración..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Space direction="vertical" className="w-full" size="large">
        <Title level={2}>Configuración de Envíos</Title>

        <Tabs type="card" defaultActiveKey="1" className="bg-white rounded-lg">
          {/* Costos Base */}
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <DollarOutlined />
                Costos Base
              </span>
            }
            key="1"
          >
            <Card className="shadow-sm">
              <Form
                form={baseCostsForm}
                layout="vertical"
                onFinish={updateBaseCosts.mutate}
                className="max-w-xl"
              >
                <Space direction="vertical" className="w-full" size="middle">
                  <Form.Item
                    name="standard_cost"
                    label="Costo Estándar"
                    rules={[{ required: true, message: "Campo requerido" }]}
                  >
                    <MoneyInput placeholder="Ingrese el costo estándar" />
                  </Form.Item>

                  <Form.Item
                    name="express_cost"
                    label="Costo Express"
                    rules={[{ required: true, message: "Campo requerido" }]}
                  >
                    <MoneyInput placeholder="Ingrese el costo express" />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={updateBaseCosts.isPending}
                      className="w-full md:w-auto"
                    >
                      Actualizar Costos Base
                    </Button>
                  </Form.Item>
                </Space>
              </Form>
            </Card>
          </TabPane>

          {/* Reglas de Peso */}
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <ScanOutlined />
                Reglas de Peso
              </span>
            }
            key="2"
          >
            <Card className="shadow-sm">
              <Form
                form={weightRulesForm}
                layout="vertical"
                onFinish={updateWeightRules.mutate}
                className="max-w-xl"
              >
                <Space direction="vertical" className="w-full" size="middle">
                  <Form.Item
                    name="base_weight"
                    label="Peso Base"
                    rules={[{ required: true, message: "Campo requerido" }]}
                  >
                    <WeightInput placeholder="Ingrese el peso base" />
                  </Form.Item>

                  <Form.Item
                    name="extra_cost_per_kg"
                    label="Costo Extra por Kg"
                    rules={[{ required: true, message: "Campo requerido" }]}
                  >
                    <MoneyInput placeholder="Ingrese el costo extra por kg" />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={updateWeightRules.isPending}
                      className="w-full md:w-auto"
                    >
                      Actualizar Reglas de Peso
                    </Button>
                  </Form.Item>
                </Space>
              </Form>
            </Card>
          </TabPane>

          {/* Multiplicadores por Ubicación */}
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <EnvironmentOutlined />
                Multiplicadores
              </span>
            }
            key="3"
          >
            <Card className="shadow-sm">
              <Form
                form={locationMultipliersForm}
                layout="vertical"
                onFinish={(e)=> {console.log(e); updateLocationMultipliers.mutate(e)}}
              >
                <Table
                  dataSource={
                    settings
                      ? Object.entries(settings.location_multipliers).map(
                          ([location, multiplier]) => ({
                            key: location,
                            location,
                            multiplier,
                          })
                        )
                      : []
                  }
                  columns={locationMultipliersColumns}
                  pagination={false}
                  className="mb-6"
                />

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updateLocationMultipliers.isPending}
                  className="w-full md:w-auto"
                >
                  Actualizar Multiplicadores
                </Button>
              </Form>
            </Card>
          </TabPane>

          {/* Tiempos de Entrega */}
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <ClockCircleOutlined />
                Tiempos de Entrega
              </span>
            }
            key="4"
          >
            <Card className="shadow-sm">
              <Form
                form={deliveryTimesForm}
                layout="vertical"
                onFinish={updateDeliveryTimes.mutate}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Title level={4}>Envío Estándar</Title>
                    <Space
                      direction="vertical"
                      className="w-full"
                      size="middle"
                    >
                      <Form.Item
                        name={["delivery_times", "standard", "min"]}
                        label="Mínimo"
                        rules={[{ required: true, message: "Campo requerido" }]}
                      >
                        <DaysInput placeholder="Días mínimos" />
                      </Form.Item>

                      <Form.Item
                        name={["delivery_times", "standard", "max"]}
                        label="Máximo"
                        rules={[{ required: true, message: "Campo requerido" }]}
                      >
                        <DaysInput placeholder="Días máximos" />
                      </Form.Item>
                    </Space>
                  </div>

                  <div>
                    <Title level={4}>Envío Express</Title>
                    <Space
                      direction="vertical"
                      className="w-full"
                      size="middle"
                    >
                      <Form.Item
                        name={["delivery_times", "express", "min"]}
                        label="Mínimo"
                        rules={[{ required: true, message: "Campo requerido" }]}
                      >
                        <DaysInput placeholder="Días mínimos" />
                      </Form.Item>

                      <Form.Item
                        name={["delivery_times", "express", "max"]}
                        label="Máximo"
                        rules={[{ required: true, message: "Campo requerido" }]}
                      >
                        <DaysInput placeholder="Días máximos" />
                      </Form.Item>
                    </Space>
                  </div>
                </div>

                <Form.Item className="mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updateDeliveryTimes.isPending}
                    className="w-full md:w-auto"
                  >
                    Actualizar Tiempos de Entrega
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          {/* Envío Gratis */}
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <GiftOutlined />
                Envío Gratis
              </span>
            }
            key="5"
          >
            <Card className="shadow-sm">
              <Form
                form={freeShippingForm}
                layout="vertical"
                onFinish={updateFreeShipping.mutate}
                className="max-w-xl"
              >
                <Space direction="vertical" className="w-full" size="middle">
                  <Form.Item
                    name="threshold"
                    label="Monto Mínimo para Envío Gratis"
                    rules={[{ required: true, message: "Campo requerido" }]}
                  >
                    <MoneyInput placeholder="Ingrese el monto mínimo" />
                  </Form.Item>

                  <Form.Item
                    name="eligible_locations"
                    label="Ubicaciones Elegibles"
                    rules={[{ required: true, message: "Campo requerido" }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Seleccione ubicaciones"
                      className="w-full"
                      options={COLOMBIA_LOCATIONS.map((location) => ({
                        label: location,
                        value: location,
                      }))}
                    />
                  </Form.Item>

                  <Form.Item
                    name="eligible_methods"
                    label="Métodos de Envío Elegibles"
                    rules={[{ required: true, message: "Campo requerido" }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Seleccione métodos"
                      className="w-full"
                      options={SHIPPING_METHODS}
                    />
                  </Form.Item>

                  <Form.Item
                    name="min_purchase"
                    label="Compra Mínima Requerida"
                    rules={[{ required: true, message: "Campo requerido" }]}
                  >
                    <MoneyInput placeholder="Ingrese el monto mínimo de compra" />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={updateFreeShipping.isPending}
                      className="w-full md:w-auto"
                    >
                      Actualizar Reglas de Envío Gratis
                    </Button>
                  </Form.Item>
                </Space>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </Space>
    </div>
  );
};

export default ShippingSettings;
