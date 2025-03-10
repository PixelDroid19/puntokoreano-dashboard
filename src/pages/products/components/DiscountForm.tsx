// src/pages/products/components/DiscountForm.tsx
import React, { useEffect } from 'react';
import {
  Form,
  Input,
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
} from 'antd';
import { DiscountData } from '../../../services/discount.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface DiscountFormProps {
  initialValues?: DiscountData;
  productPrice?: number;
  onSubmit: (values: DiscountData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const DiscountForm: React.FC<DiscountFormProps> = ({
  initialValues,
  productPrice = 0,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [discountType, setDiscountType] = React.useState<'permanent' | 'temporary'>(
    initialValues?.type || 'permanent'
  );
  const [calculationMethod, setCalculationMethod] = React.useState<'percentage' | 'fixed'>(
    initialValues?.percentage ? 'percentage' : 'fixed'
  );

  // Calculate the other value when one changes
  const updateValues = (values: any) => {
    const { percentage, old_price } = values;
    
    if (calculationMethod === 'percentage' && percentage !== undefined) {
      // Calculate old_price based on percentage
      const calculatedOldPrice = Math.round(productPrice / (1 - percentage / 100));
      form.setFieldsValue({ old_price: calculatedOldPrice });
    } else if (calculationMethod === 'fixed' && old_price !== undefined) {
      // Calculate percentage based on old_price
      if (old_price > productPrice) {
        const calculatedPercentage = Math.round(((old_price - productPrice) / old_price) * 100);
        form.setFieldsValue({ percentage: calculatedPercentage });
      }
    }
  };

  useEffect(() => {
    // Initialize form with initial values
    if (initialValues) {
      const formValues = { ...initialValues };
      
      // Convert dates to dayjs objects if they exist
      if (formValues.startDate && formValues.endDate) {
        form.setFieldsValue({
          ...formValues,
          dateRange: [
            dayjs(formValues.startDate),
            dayjs(formValues.endDate)
          ]
        });
      } else {
        form.setFieldsValue(formValues);
      }
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    const discountData: DiscountData = {
      isActive: true,
      type: discountType,
      percentage: values.percentage,
      old_price: values.old_price,
      reason: values.reason,
    };

    // Add dates for temporary discounts
    if (discountType === 'temporary' && values.dateRange) {
      discountData.startDate = values.dateRange[0].format('YYYY-MM-DD');
      discountData.endDate = values.dateRange[1].format('YYYY-MM-DD');
    }

    onSubmit(discountData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      onValuesChange={updateValues}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Alert
            message="Información de Descuento"
            description={
              <>
                <Text>El precio actual del producto es: </Text>
                <Text strong>
                  {productPrice.toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                  })}
                </Text>
              </>
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
            initialValue={discountType}
            rules={[{ required: true, message: 'Por favor seleccione el tipo de descuento' }]}
          >
            <Select
              onChange={(value) => setDiscountType(value)}
              options={[
                { label: 'Permanente', value: 'permanent' },
                { label: 'Temporal', value: 'temporary' },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      {discountType === 'temporary' && (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="dateRange"
              label="Período del Descuento"
              rules={[{ required: true, message: 'Por favor seleccione el período del descuento' }]}
            >
              <RangePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>
      )}

      <Divider>Método de Cálculo</Divider>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item>
            <Select
              value={calculationMethod}
              onChange={(value) => setCalculationMethod(value)}
              options={[
                { label: 'Por Porcentaje', value: 'percentage' },
                { label: 'Por Precio Original', value: 'fixed' },
              ]}
              style={{ marginBottom: 16 }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        {calculationMethod === 'percentage' ? (
          <Col span={24}>
            <Form.Item
              name="percentage"
              label="Porcentaje de Descuento"
              rules={[
                { required: true, message: 'Por favor ingrese el porcentaje de descuento' },
                { type: 'number', min: 1, max: 99, message: 'El porcentaje debe estar entre 1 y 99' },
              ]}
            >
              <InputNumber
                min={1}
                max={99}
                formatter={(value) => `${value}%`}
                parser={(value) => value!.replace('%', '')}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        ) : (
          <Col span={24}>
            <Form.Item
              name="old_price"
              label="Precio Original"
              rules={[
                { required: true, message: 'Por favor ingrese el precio original' },
                { type: 'number', min: productPrice + 1, message: 'El precio original debe ser mayor al precio con descuento' },
              ]}
            >
              <InputNumber
                min={productPrice + 1}
                style={{ width: '100%' }}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
        )}
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="reason"
            label="Razón del Descuento"
          >
            <Input.TextArea
              rows={3}
              placeholder="Ej: Promoción de temporada, Liquidación de inventario, etc."
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Aplicar Descuento
          </Button>
          <Button onClick={onCancel}>Cancelar</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default DiscountForm;