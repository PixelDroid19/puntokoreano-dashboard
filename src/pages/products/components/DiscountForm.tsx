// src/pages/products/components/DiscountForm.tsx
import React, { useEffect, useState } from "react";
import {
  Form,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Space,
  Divider,
  Alert,
  Typography,
  Row,
  Col,
} from "antd";

import { DiscountData } from "../../../services/discount.service";
import dayjs from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface DiscountFormProps {
  initialValues?: Partial<DiscountData>;
  originalPrice?: number;
  currentPrice?: number;
  onSubmit: (values: DiscountData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const DiscountForm: React.FC<DiscountFormProps> = ({
  initialValues,
  originalPrice = 0,
  currentPrice = 0,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [discountType, setDiscountType] = useState<"permanent" | "temporary">(
    initialValues?.type || "permanent"
  );

  const [calculationMethod, setCalculationMethod] = useState<
    "percentage" | "fixedPrice"
  >(initialValues?.percentage ? "percentage" : "fixedPrice");
  const [calculatedPercentage, setCalculatedPercentage] = useState<
    number | undefined
  >(initialValues?.percentage);
  const [calculatedFinalPrice, setCalculatedFinalPrice] = useState<
    number | undefined
  >();

  const handleValuesChange = (changedValues: any, allValues: any) => {
    let finalPercentage: number | undefined = undefined;
    let finalPrice: number | undefined = undefined;

    if (calculationMethod === "percentage") {
      const percentage = allValues.percentage;
      if (percentage !== undefined && percentage >= 1 && percentage <= 99) {
        finalPercentage = percentage;
        finalPrice = originalPrice * (1 - percentage / 100);
      } else {
        finalPrice = undefined;
      }
      setCalculatedPercentage(finalPercentage);
    } else if (calculationMethod === "fixedPrice") {
      const fixedValue = allValues.fixedValue;
      if (
        fixedValue !== undefined &&
        fixedValue > 0 &&
        fixedValue < originalPrice
      ) {
        finalPercentage = parseFloat(
          (((originalPrice - fixedValue) / originalPrice) * 100).toFixed(2)
        );
        finalPrice = fixedValue;

        form.setFieldsValue({ percentage: finalPercentage });
      } else {
        finalPercentage = undefined;
        form.setFieldsValue({ percentage: undefined });
      }
      setCalculatedPercentage(finalPercentage);
    }
    setCalculatedFinalPrice(finalPrice);
  };

  useEffect(() => {
    if (initialValues) {
      const { startDate, endDate, ...restValues } = initialValues;
      let formValues: any = { ...restValues };

      if (discountType === "temporary" && startDate && endDate) {
        formValues.dateRange = [dayjs(startDate), dayjs(endDate)];
      }

      if (initialValues.percentage) {
        formValues.percentage = initialValues.percentage;
      }

      form.setFieldsValue(formValues);

      setCalculationMethod(
        initialValues.percentage ? "percentage" : "fixedPrice"
      );
      setDiscountType(initialValues.type || "permanent");

      handleValuesChange({}, formValues);
    } else {
      form.resetFields();
      setDiscountType("permanent");
      setCalculationMethod("percentage");
      setCalculatedPercentage(undefined);
      setCalculatedFinalPrice(undefined);
    }
  }, [initialValues, form, originalPrice]);

  const handleFinish = (values: any) => {
    if (
      calculatedPercentage === undefined ||
      calculatedPercentage < 1 ||
      calculatedPercentage > 99
    ) {
      message.error(
        "Porcentaje de descuento inválido. Debe estar entre 1 y 99."
      );
      return;
    }

    const discountData: DiscountData = {
      isActive: true,
      type: discountType,
      percentage: calculatedPercentage,
    };

    if (discountType === "temporary") {
      if (!values.dateRange || values.dateRange.length !== 2) {
        message.error(
          "Por favor seleccione un rango de fechas válido para descuentos temporales."
        );
        return;
      }

      discountData.startDate = values.dateRange[0].toISOString();
      discountData.endDate = values.dateRange[1].toISOString();
    }

    onSubmit(discountData);
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return "-";
    return value.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      onValuesChange={handleValuesChange}
      initialValues={{ type: discountType }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Alert
            message="Precios de Referencia"
            description={
              <div>
                <Text>Precio Original (Base): </Text>
                <Text strong>{formatCurrency(originalPrice)}</Text>
                <br />
                <Text>Precio Actual: </Text>
                <Text strong>{formatCurrency(currentPrice)}</Text>
                {calculatedFinalPrice !== undefined && (
                  <>
                    <br />
                    <Text>Nuevo Precio Calculado: </Text>
                    <Text strong type="success">
                      {formatCurrency(calculatedFinalPrice)}
                    </Text>
                  </>
                )}
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="type"
            label="Tipo de Descuento"
            rules={[
              {
                required: true,
                message: "Por favor seleccione el tipo de descuento",
              },
            ]}
          >
            <Select
              onChange={(value) => setDiscountType(value)}
              options={[
                { label: "Permanente", value: "permanent" },
                { label: "Temporal", value: "temporary" },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      {discountType === "temporary" && (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="dateRange"
              label="Período del Descuento"
              rules={[
                {
                  required: true,
                  message: "Por favor seleccione el período del descuento",
                },
              ]}
            >
              <RangePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD HH:mm"
                showTime
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>
          </Col>
        </Row>
      )}

      <Divider>Método de Ingreso</Divider>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label="Calcular por">
            <Select
              value={calculationMethod}
              onChange={(value) => {
                setCalculationMethod(value);
              }}
              options={[
                { label: "Porcentaje (%)", value: "percentage" },
                { label: "Precio Final Deseado", value: "fixedPrice" },
              ]}
              style={{ marginBottom: 16 }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        {calculationMethod === "percentage" ? (
          <Col span={24}>
            <Form.Item
              name="percentage"
              label="Porcentaje de Descuento"
              rules={[
                { required: true, message: "Ingrese el porcentaje" },
                {
                  type: "number",
                  min: 1,
                  max: 99.99,
                  message: "El % debe estar entre 1 y 99.99",
                },
              ]}
              extra={
                calculatedPercentage
                  ? `Equivale a un precio final aprox. de ${formatCurrency(
                      calculatedFinalPrice
                    )}`
                  : " "
              }
            >
              <InputNumber
                min={1}
                max={99.99}
                step={0.01}
                formatter={(value) => `${value}%`}
                parser={(value) => (value ? value.replace("%", "") : "")}
                style={{ width: "100%" }}
                placeholder="Ej: 15"
              />
            </Form.Item>
          </Col>
        ) : (
          <Col span={24}>
            <Form.Item
              name="fixedValue"
              label="Nuevo Precio Final"
              rules={[
                { required: true, message: "Ingrese el precio final deseado" },

                {
                  type: "number",
                  min: 0.01,
                  message: "El precio debe ser mayor a 0",
                },
                {
                  validator: (_, value) =>
                    !value || value < originalPrice
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            "El precio final debe ser menor al original"
                          )
                        ),
                },
              ]}
              extra={
                calculatedPercentage
                  ? `Equivale a un descuento aprox. del ${calculatedPercentage}%`
                  : " "
              }
            >
              <InputNumber
                min={0.01}
                max={originalPrice - 0.01}
                step={1}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => (value ? value.replace(/\$\s?|,/g, "") : "")}
                placeholder={`Ej: ${Math.round(
                  originalPrice * 0.8
                )} (para 20% dcto)`}
              />
            </Form.Item>
          </Col>
        )}
      </Row>

      <Divider />

      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!calculatedPercentage}
          >
            {initialValues?.isActive
              ? "Actualizar Descuento"
              : "Aplicar Descuento"}
          </Button>
          <Button onClick={onCancel}>Cancelar</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default DiscountForm;
