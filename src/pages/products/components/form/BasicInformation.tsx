import React from 'react';
import { Card, Col, Form, Input, InputNumber, Row, Select } from 'antd';

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
            label="Precio"
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
                { label: "Envío exprés", value: "express" },
                { label: "Envío estándar", value: "standard" },
                { label: "Recoger en tienda", value: "pickup" },
              ]}
            />
          </Form.Item>
        </Card>
      </Col>
    </Row>
  );
};

export default BasicInformation;