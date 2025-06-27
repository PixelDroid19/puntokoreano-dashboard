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
  Switch,
  Row,
  Col,
  Tooltip,
} from "antd";
import { NumericFormat } from "react-number-format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DollarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  GiftOutlined,
  ScanOutlined,
  CreditCardOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import ShippingSettingsService from "../../services/shipping.settings.service";

const { TabPane } = Tabs;
const { Title } = Typography;

// Tipos para mejor tipado
interface ShippingSettings {
  base_costs: {
    pickup: number;
    cod: number;
  };
  weight_rules: {
    base_weight: number;
    extra_cost_per_kg: number;
  };
  location_multipliers: Record<string, number>;
  delivery_times: {
    pickup: { min: number; max: number };
    cod: { min: number; max: number };
  };
  free_shipping_rules: {
    threshold: number;
    eligible_locations: string[];
    eligible_methods: string[];
    min_purchase: number;
  };
}

interface ProcessingFees {
  enabled: boolean;
  card: {
    percentage: number;
    installments: {
      enabled: boolean;
      percentage_per_installment: number;
    };
  };
  pse: {
    percentage: number;
    max_amount: number;
  };
  nequi: {
    percentage: number;
  };
}

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
  { label: "Recoger en tienda", value: "pickup" },
  { label: "Contra entrega", value: "cod" },
];

// Tooltips explicativos
const TOOLTIPS = {
  pickupCost: "Costo base para recoger en tienda. Normalmente es 0 ya que no hay envío físico.",
  codCost: "Costo base para contra entrega. Incluye el servicio de entrega a domicilio con pago al recibir.",
  baseWeight: "Peso máximo incluido en el costo base (en kg). Pesos superiores generarán costos adicionales.",
  extraCostPerKg: "Costo adicional por cada kilogramo que exceda el peso base. Se calcula automáticamente.",
  locationMultipliers: "Multiplicador de costo según la ubicación de entrega. 1.0 = sin recargo, 1.5 = 50% adicional.",
  deliveryTimes: "Rango de días hábiles estimados para la entrega según el método de envío seleccionado.",
  freeShippingThreshold: "Monto mínimo de compra para calificar al envío gratuito en ubicaciones elegibles.",
  eligibleLocations: "Ubicaciones donde aplica el envío gratuito cuando se cumple el monto mínimo.",
  eligibleMethods: "Métodos de envío incluidos en la promoción de envío gratuito.",
  minPurchase: "Monto mínimo de productos (sin incluir envío) requerido para el envío gratuito.",
  processingEnabled: "Activa o desactiva el cobro de cuotas de procesamiento por método de pago.",
  cardPercentage: "Porcentaje cobrado sobre el total por usar tarjetas de crédito/débito.",
  installmentsEnabled: "Activa el cobro adicional por cuotas en tarjetas de crédito.",
  installmentsPercentage: "Porcentaje adicional por cada cuota extra (a partir de la segunda cuota).",
  psePercentage: "Porcentaje cobrado sobre el total por usar PSE (transferencia bancaria).",
  pseMaxAmount: "Monto máximo de cuota de procesamiento para PSE, sin importar el porcentaje.",
  nequiPercentage: "Porcentaje cobrado sobre el total por usar Nequi como método de pago.",
};

// Componentes personalizados para inputs numéricos
const MoneyInput = ({ value, onChange, className = "", ...props }: any) => {
  return (
    <NumericFormat
      value={value}
      onValueChange={({ floatValue }) => onChange?.(floatValue)}
      thousandSeparator={true}
      prefix="$"
      customInput={Input}
      className={`ant-input ${className}`}
      decimalScale={0}
      {...props}
    />
  );
};

const WeightInput = ({ value, onChange, className = "", ...props }: any) => {
  return (
    <NumericFormat
      value={value}
      onValueChange={({ floatValue }) => onChange?.(floatValue)}
      thousandSeparator={true}
      suffix=" kg"
      customInput={Input}
      className={`ant-input ${className}`}
      decimalScale={2}
      {...props}
    />
  );
};

const DaysInput = ({ value, onChange, className = "", ...props }: any) => {
  return (
    <NumericFormat
      value={value}
      onValueChange={({ floatValue }) => onChange?.(floatValue)}
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

// Componente para etiquetas con tooltip
const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <Space>
    {label}
    <Tooltip title={tooltip} placement="topLeft">
      <QuestionCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
    </Tooltip>
  </Space>
);

const ShippingSettings = () => {
  const queryClient = useQueryClient();
  const [baseCostsForm] = Form.useForm();
  const [weightRulesForm] = Form.useForm();
  const [locationMultipliersForm] = Form.useForm();
  const [deliveryTimesForm] = Form.useForm();
  const [freeShippingForm] = Form.useForm();
  const [processingFeesForm] = Form.useForm();

  // Fetch settings
  const { data: settings, isLoading } = useQuery<ShippingSettings>({
    queryKey: ["shippingSettings"],
    queryFn: () => ShippingSettingsService.getSettings(),
  });

  // Fetch processing fees
  const { data: processingFees, isLoading: loadingFees } = useQuery<ProcessingFees>({
    queryKey: ["processingFees"],
    queryFn: () => ShippingSettingsService.getProcessingFees(),
  });

  // Mutations
  const updateBaseCosts = useMutation({
    mutationFn: (data: { pickup_cost: number; cod_cost: number }) => 
      ShippingSettingsService.updateBaseCosts(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingSettings"] });
      message.success("Costos base actualizados");
    },
    onError: (error: any) => {
      message.error("Error al actualizar costos base: " + error.message);
    },
  });

  const updateWeightRules = useMutation({
    mutationFn: (data: { base_weight: number; extra_cost_per_kg: number }) => 
      ShippingSettingsService.updateWeightRules(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingSettings"] });
      message.success("Reglas de peso actualizadas");
    },
    onError: (error: any) => {
      message.error("Error al actualizar reglas de peso: " + error.message);
    },
  });

  const updateLocationMultipliers = useMutation({
    mutationFn: (data: { multipliers: Record<string, number> }) => 
      ShippingSettingsService.updateLocationMultipliers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingSettings"] });
          message.success("Multiplicadores por ubicación actualizados");
    },
    onError: (error: any) => {
          message.error("Error al actualizar multiplicadores: " + error.message);
    },
  });
  
  const updateDeliveryTimes = useMutation({
    mutationFn: (data: { 
      delivery_times: { 
        pickup: { min: number; max: number }; 
        cod: { min: number; max: number } 
      } 
    }) => ShippingSettingsService.updateDeliveryTimes(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingSettings"] });
      message.success("Tiempos de entrega actualizados");
    },
    onError: (error: any) => {
      message.error("Error al actualizar tiempos: " + error.message);
    },
  });

  const updateFreeShipping = useMutation({
    mutationFn: (data: { 
      threshold: number; 
      eligible_locations: string[]; 
      eligible_methods: string[]; 
      min_purchase: number 
    }) => ShippingSettingsService.updateFreeShipping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingSettings"] });
      message.success("Reglas de envío gratis actualizadas");
    },
    onError: (error: any) => {
      message.error("Error al actualizar envío gratis: " + error.message);
    },
  });

  // Mutations para cuotas de procesamiento
  const updateProcessingFees = useMutation({
    mutationFn: (data: ProcessingFees) => ShippingSettingsService.updateProcessingFees(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processingFees"] });
      queryClient.invalidateQueries({ queryKey: ["shippingSettings"] });
      message.success("Cuotas de procesamiento actualizadas");
    },
    onError: (error: any) => {
      message.error("Error al actualizar cuotas: " + error.message);
    },
  });

  const toggleProcessingFees = useMutation({
    mutationFn: (enabled: boolean) => ShippingSettingsService.toggleProcessingFees(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processingFees"] });
      message.success("Estado de cuotas actualizado");
    },
    onError: (error: any) => {
      message.error("Error al cambiar estado: " + error.message);
    },
  });

  React.useEffect(() => {
    if (settings) {
      // Inicializar formularios
      baseCostsForm.setFieldsValue({
        pickup_cost: settings.base_costs.pickup,
        cod_cost: settings.base_costs.cod,
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
  }, [settings, baseCostsForm, weightRulesForm, locationMultipliersForm, deliveryTimesForm, freeShippingForm]);

  // Inicializar formulario de cuotas de procesamiento
  React.useEffect(() => {
    if (processingFees) {
      processingFeesForm.setFieldsValue({
        enabled: processingFees.enabled ?? false,
        card_percentage: (processingFees.card?.percentage ?? 0.029) * 100,
        card_installments_enabled: processingFees.card?.installments?.enabled ?? false,
        card_installments_percentage: (processingFees.card?.installments?.percentage_per_installment ?? 0.015) * 100,
        pse_percentage: (processingFees.pse?.percentage ?? 0.025) * 100,
        pse_max_amount: processingFees.pse?.max_amount ?? 3000,
        nequi_percentage: (processingFees.nequi?.percentage ?? 0.02) * 100,
      });
    }
  }, [processingFees, processingFeesForm]);

  const locationMultipliersColumns = [
    {
      title: "Ubicación",
      dataIndex: "location",
      key: "location",
      className: "font-medium",
    },
    {
      title: (
        <LabelWithTooltip 
          label="Multiplicador" 
          tooltip={TOOLTIPS.locationMultipliers}
        />
      ),
      dataIndex: "multiplier",
      key: "multiplier",
      width: 200,
      render: (_: any, record: any) => (
        <Form.Item
          name={["multipliers", record.location]}
          initialValue={record.multiplier}
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
                    name="pickup_cost"
                    label={<LabelWithTooltip label="Costo Recoger en Tienda" tooltip={TOOLTIPS.pickupCost} />}
                    rules={[{ required: true, message: "Campo requerido" }]}
                  >
                    <MoneyInput placeholder="Ingrese el costo de recogida" />
                  </Form.Item>

                  <Form.Item
                    name="cod_cost"
                    label={<LabelWithTooltip label="Costo Contra Entrega" tooltip={TOOLTIPS.codCost} />}
                    rules={[{ required: true, message: "Campo requerido" }]}
                  >
                    <MoneyInput placeholder="Ingrese el costo contra entrega" />
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
                    label={<LabelWithTooltip label="Peso Base" tooltip={TOOLTIPS.baseWeight} />}
                    rules={[{ required: true, message: "Campo requerido" }]}
                  >
                    <WeightInput placeholder="Ingrese el peso base" />
                  </Form.Item>

                  <Form.Item
                    name="extra_cost_per_kg"
                    label={<LabelWithTooltip label="Costo Extra por Kg" tooltip={TOOLTIPS.extraCostPerKg} />}
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
                onFinish={(values) => updateLocationMultipliers.mutate(values)}
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
                    <Title level={4}>Recoger en Tienda</Title>
                    <Space
                      direction="vertical"
                      className="w-full"
                      size="middle"
                    >
                      <Form.Item
                        name={["delivery_times", "pickup", "min"]}
                        label={<LabelWithTooltip label="Mínimo" tooltip="Tiempo mínimo para recoger en tienda" />}
                        rules={[{ required: true, message: "Campo requerido" }]}
                      >
                        <DaysInput placeholder="Días mínimos" />
                      </Form.Item>

                      <Form.Item
                        name={["delivery_times", "pickup", "max"]}
                        label={<LabelWithTooltip label="Máximo" tooltip="Tiempo máximo para recoger en tienda" />}
                        rules={[{ required: true, message: "Campo requerido" }]}
                      >
                        <DaysInput placeholder="Días máximos" />
                      </Form.Item>
                    </Space>
                  </div>

                  <div>
                    <Title level={4}>Contra Entrega</Title>
                    <Space
                      direction="vertical"
                      className="w-full"
                      size="middle"
                    >
                      <Form.Item
                        name={["delivery_times", "cod", "min"]}
                        label={<LabelWithTooltip label="Mínimo" tooltip="Tiempo mínimo para entrega COD" />}
                        rules={[{ required: true, message: "Campo requerido" }]}
                      >
                        <DaysInput placeholder="Días mínimos" />
                      </Form.Item>

                      <Form.Item
                        name={["delivery_times", "cod", "max"]}
                        label={<LabelWithTooltip label="Máximo" tooltip="Tiempo máximo para entrega COD" />}
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
                    label={<LabelWithTooltip label="Monto Mínimo para Envío Gratis" tooltip={TOOLTIPS.freeShippingThreshold} />}
                    rules={[{ required: true, message: "Campo requerido" }]}
                  >
                    <MoneyInput placeholder="Ingrese el monto mínimo" />
                  </Form.Item>

                  <Form.Item
                    name="eligible_locations"
                    label={<LabelWithTooltip label="Ubicaciones Elegibles" tooltip={TOOLTIPS.eligibleLocations} />}
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
                    label={<LabelWithTooltip label="Métodos de Envío Elegibles" tooltip={TOOLTIPS.eligibleMethods} />}
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
                    label={<LabelWithTooltip label="Compra Mínima Requerida" tooltip={TOOLTIPS.minPurchase} />}
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

          {/* Cuotas de Procesamiento */}
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <CreditCardOutlined />
                Cuotas de Procesamiento
              </span>
            }
            key="6"
          >
            <Card className="shadow-sm">
              {loadingFees ? (
                <div className="flex justify-center py-8">
                  <Spin size="large" />
                </div>
              ) : (
                <Form
                  form={processingFeesForm}
                  layout="vertical"
                  onFinish={(values) => {
                    // Convertir porcentajes de vuelta a decimales
                    const data: ProcessingFees = {
                      enabled: values.enabled,
                      card: {
                        percentage: values.card_percentage / 100,
                        installments: {
                          enabled: values.card_installments_enabled,
                          percentage_per_installment: values.card_installments_percentage / 100,
                        },
                      },
                      pse: {
                        percentage: values.pse_percentage / 100,
                        max_amount: values.pse_max_amount,
                      },
                      nequi: {
                        percentage: values.nequi_percentage / 100,
                      },
                    };
                    updateProcessingFees.mutate(data);
                  }}
                >
                  <Space direction="vertical" className="w-full" size="large">
                    {/* Control principal */}
                    <Card size="small" title="Configuración General">
                      <Form.Item
                        name="enabled"
                        label={<LabelWithTooltip label="Activar cuotas de procesamiento" tooltip={TOOLTIPS.processingEnabled} />}
                        extra="Cuando está desactivado, no se cobran cuotas adicionales por método de pago"
                        valuePropName="checked"
                      >
                        <Switch
                          onChange={(checked) => {
                            toggleProcessingFees.mutate(checked);
                          }}
                        />
                      </Form.Item>
                    </Card>

                    {/* Configuración por método de pago */}
                    <Row gutter={[16, 16]}>
                      {/* Tarjetas de crédito */}
                      <Col xs={24} lg={12}>
                        <Card size="small" title="💳 Tarjetas de Crédito/Débito" className="h-full">
                          <Form.Item
                            name="card_percentage"
                            label={<LabelWithTooltip label="Porcentaje de procesamiento (%)" tooltip={TOOLTIPS.cardPercentage} />}
                            rules={[{ required: true, message: "Campo requerido" }]}
                          >
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              suffix="%"
                              placeholder="2.9"
                            />
                          </Form.Item>

                          <Form.Item
                            name="card_installments_enabled"
                            label={<LabelWithTooltip label="Cobrar por cuotas adicionales" tooltip={TOOLTIPS.installmentsEnabled} />}
                            valuePropName="checked"
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item
                            name="card_installments_percentage"
                            label={<LabelWithTooltip label="Porcentaje por cuota adicional (%)" tooltip={TOOLTIPS.installmentsPercentage} />}
                            rules={[{ required: true, message: "Campo requerido" }]}
                          >
                            <Input
                              type="number"
                              min={0}
                              max={5}
                              step={0.1}
                              suffix="%"
                              placeholder="1.5"
                            />
                          </Form.Item>
                        </Card>
                      </Col>

                      {/* PSE */}
                      <Col xs={24} lg={12}>
                        <Card size="small" title="🏦 PSE" className="h-full">
                          <Form.Item
                            name="pse_percentage"
                            label={<LabelWithTooltip label="Porcentaje de procesamiento (%)" tooltip={TOOLTIPS.psePercentage} />}
                            rules={[{ required: true, message: "Campo requerido" }]}
                          >
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              suffix="%"
                              placeholder="2.5"
                            />
                          </Form.Item>

                          <Form.Item
                            name="pse_max_amount"
                            label={<LabelWithTooltip label="Monto máximo de cuota" tooltip={TOOLTIPS.pseMaxAmount} />}
                            rules={[{ required: true, message: "Campo requerido" }]}
                          >
                            <MoneyInput placeholder="3000" />
                          </Form.Item>
                        </Card>
                      </Col>

                      {/* Nequi */}
                      <Col xs={24} lg={12}>
                        <Card size="small" title="📱 Nequi" className="h-full">
                          <Form.Item
                            name="nequi_percentage"
                            label={<LabelWithTooltip label="Porcentaje de procesamiento (%)" tooltip={TOOLTIPS.nequiPercentage} />}
                            rules={[{ required: true, message: "Campo requerido" }]}
                          >
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              suffix="%"
                              placeholder="2.0"
                            />
                          </Form.Item>
                        </Card>
                      </Col>
                    </Row>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={updateProcessingFees.isPending}
                        className="w-full md:w-auto"
                      >
                        Actualizar Cuotas de Procesamiento
                      </Button>
                    </Form.Item>
                  </Space>
                </Form>
              )}
            </Card>
          </TabPane>
        </Tabs>
      </Space>
    </div>
  );
};

export default ShippingSettings;
