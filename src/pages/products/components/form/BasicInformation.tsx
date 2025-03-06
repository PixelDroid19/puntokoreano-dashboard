import React from 'react';
import { Card, Col, Form, Input, InputNumber, Row, Select, Switch, DatePicker } from 'antd';

interface BasicInformationProps {
  form: any;
  groups: any;
  subgroups: any;
  handleGroupChange: (value: string) => void;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  form,
  groups,
  subgroups,
  handleGroupChange,
}) => {
  return (
    <Row gutter={24}>
      <Col span={12}>
        <Card title="Detalles Principales" className="mb-4">
          <Form.Item
            name="name"
            label="Nombre del Producto"
            rules={[{ required: true }]}
          >
            <Input placeholder="Ej: Reten delantero ciguenal" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Precio Actual"
            rules={[{ required: true, type: "number" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            name="old_price"
            label="Precio Original"
            rules={[{ type: "number" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
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
            label="Stock Inicial"
            rules={[{ required: true, type: "number" }]}
          >
            <InputNumber className="w-full" min={0} />
          </Form.Item>

          <Form.Item name="active" label="Activo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Card>

        <Card title="Información de Descuento" className="mb-4">
          <Form.Item name={["discount", "isActive"]} label="Descuento Activo" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name={["discount", "type"]} label="Tipo de Descuento">
            <Select>
              <Select.Option value="permanent">Permanente</Select.Option>
              <Select.Option value="temporary">Temporal</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name={["discount", "percentage"]} label="Porcentaje de Descuento">
            <InputNumber
              className="w-full"
              min={0}
              max={100}
              formatter={(value) => `${value}%`}
              parser={(value) => value!.replace('%', '')}
            />
          </Form.Item>

          <Form.Item name={["discount", "startDate"]} label="Fecha de Inicio">
            <DatePicker />
          </Form.Item>

          <Form.Item name={["discount", "endDate"]} label="Fecha de Fin">
            <DatePicker />
          </Form.Item>
        </Card>
      </Col>

      <Col span={12}>
        <Card title="Categorización" className="mb-4">
          <Form.Item
            name="group"
            label="Grupo"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Seleccione un grupo"
              onChange={handleGroupChange}
              options={groups?.data?.groups?.map((group: any) => ({
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
              placeholder="Seleccione un subgrupo"
              disabled={!form.getFieldValue("group")}
              options={subgroups?.map((sg: any) => ({
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
              placeholder="Seleccione los métodos de envío"
              options={[
                { label: "Envío Estándar", value: "standard" },
                { label: "Envío Express", value: "express" },
                { label: "Recogida en Tienda", value: "pickup" },
              ]}
            />
          </Form.Item>
        </Card>
      </Col>
    </Row>
  );
};

export default BasicInformation;