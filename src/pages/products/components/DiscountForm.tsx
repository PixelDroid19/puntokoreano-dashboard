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
  Radio,
  Input,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd/es/form";
import { DiscountData } from "../../../services/discount.service";
import dayjs from "dayjs";
import locale from "antd/es/date-picker/locale/es_ES";

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface DiscountFormProps {
  initialValues?: DiscountData;
  originalPrice: number;
  currentPrice?: number;
  onSubmit: (values: DiscountData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const DiscountForm: React.FC<DiscountFormProps> = ({
  initialValues,
  originalPrice,
  currentPrice,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [discountType, setDiscountType] = useState<"permanent" | "temporary">(
    initialValues?.type || "permanent"
  );
  const [percentage, setPercentage] = useState<number | undefined>(
    initialValues?.percentage
  );
  const [calculatedDiscount, setCalculatedDiscount] = useState({
    finalPrice: 0,
    savings: 0,
  });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        isActive: initialValues.isActive,
        type: initialValues.type,
        percentage: initialValues.percentage,
        ...(initialValues.startDate && {
          startDate: dayjs(initialValues.startDate),
        }),
        ...(initialValues.endDate && {
          endDate: dayjs(initialValues.endDate),
        }),
        old_price: initialValues.old_price || originalPrice,
        reason: initialValues.reason || '',
      });
    } else {
      form.setFieldsValue({
        isActive: true,
        type: 'permanent',
        old_price: originalPrice,
      });
    }
  }, [form, initialValues, originalPrice]);

  useEffect(() => {
    if (percentage && percentage > 0 && percentage <= 100) {
      const newPrice = originalPrice * (1 - percentage / 100);
      const roundedPrice = Math.round(newPrice);
      setCalculatedDiscount({
        finalPrice: roundedPrice,
        savings: originalPrice - roundedPrice,
      });
    } else {
      setCalculatedDiscount({
        finalPrice: originalPrice,
        savings: 0,
      });
    }
  }, [percentage, originalPrice]);

  const handleFormSubmit = (values: any) => {
    const discountData: DiscountData = {
      isActive: true,
      type: values.type,
      percentage: values.percentage,
      ...(values.type === 'temporary' && {
        startDate: values.startDate?.toISOString(),
        endDate: values.endDate?.toISOString(),
      }),
      old_price: values.old_price || originalPrice,
      reason: values.reason,
    };
    
    onSubmit(discountData);
  };

  const handlePercentageChange = (value: number | null) => {
    setPercentage(value || undefined);
  };

  const handleTypeChange = (e: any) => {
    setDiscountType(e.target.value);
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '-';
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormSubmit}
      requiredMark={false}
      initialValues={{
        isActive: true,
        type: 'permanent',
      }}
    >
      <Form.Item name="isActive" hidden>
        <Input type="hidden" />
      </Form.Item>

      <Form.Item
        name="type"
        label="Tipo de descuento"
        rules={[{ required: true, message: 'Por favor seleccione un tipo de descuento' }]}
      >
        <Radio.Group onChange={handleTypeChange}>
          <Radio.Button value="permanent">Permanente</Radio.Button>
          <Radio.Button value="temporary">Temporal</Radio.Button>
        </Radio.Group>
      </Form.Item>

      {discountType === 'temporary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="startDate"
            label="Fecha de inicio"
            rules={[{ required: true, message: 'Por favor seleccione una fecha de inicio' }]}
          >
            <DatePicker
              locale={locale}
              className="w-full"
              format="DD/MM/YYYY"
              placeholder="Inicio del descuento"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Fecha de fin"
            rules={[
              { required: true, message: 'Por favor seleccione una fecha de fin' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('startDate') || getFieldValue('startDate').isBefore(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('La fecha de fin debe ser posterior a la de inicio'));
                },
              }),
            ]}
          >
            <DatePicker
              locale={locale}
              className="w-full"
              format="DD/MM/YYYY"
              placeholder="Fin del descuento"
              disabledDate={(current) =>
                current && current < dayjs().add(1, 'day').startOf('day')
              }
            />
          </Form.Item>
        </div>
      )}

      <Form.Item
        name="percentage"
        label="Porcentaje de descuento"
        rules={[
          { required: true, message: 'Por favor ingrese el porcentaje de descuento' },
          { type: 'number', min: 1, max: 99, message: 'El porcentaje debe estar entre 1 y 99' },
        ]}
        tooltip="Ingrese un valor entre 1 y 99"
      >
        <InputNumber
          className="w-full"
          min={1}
          max={99}
          formatter={(value) => `${value}%`}
          parser={(value) => {
            if (!value) return 0;
            const parsed = parseFloat(value.replace('%', ''));
            return isNaN(parsed) ? 0 : parsed;
          }}
          onChange={handlePercentageChange}
        />
      </Form.Item>

      <Form.Item name="old_price" hidden>
        <InputNumber />
      </Form.Item>

      <Form.Item
        name="reason"
        label="Motivo (opcional)"
        tooltip="Un motivo para el descuento, útil para el historial"
      >
        <Input.TextArea
          rows={2}
          placeholder="Ejemplo: Rebajas de verano, Oferta especial..."
          maxLength={100}
          showCount
        />
      </Form.Item>

      {percentage && percentage > 0 && (
        <div className="mb-6">
          <Alert
            type="info"
            icon={<InfoCircleOutlined />}
            message={
              <div>
                <p className="font-semibold mb-1">Información del descuento:</p>
                <ul className="list-disc pl-5">
                  <li>Precio original: {formatPrice(originalPrice)}</li>
                  <li className="text-green-700 font-semibold">
                    Precio con descuento: {formatPrice(calculatedDiscount.finalPrice)}
                  </li>
                  <li>Ahorro: {formatPrice(calculatedDiscount.savings)}</li>
                </ul>
              </div>
            }
          />
        </div>
      )}

      <Divider />

      <div className="flex justify-end space-x-2">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues?.isActive ? 'Actualizar descuento' : 'Aplicar descuento'}
        </Button>
      </div>
    </Form>
  );
};

export default DiscountForm;
