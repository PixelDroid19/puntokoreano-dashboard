import React from 'react';
import { Card, Col, Form, Input, Row, Select } from 'antd';

interface VehicleInformationProps {
  filters: {
    brand: string;
    model: string;
    family: string;
    transmission: string;
    fuel: string;
    line: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    brand: string;
    model: string;
    family: string;
    transmission: string;
    fuel: string;
    line: string;
  }>>;
  getFamilyOptions: () => any[];
  getTransmissionOptions: () => any[];
  getFuelOptions: () => any[];
  getLineOptions: () => any[];
}

const VehicleInformation: React.FC<VehicleInformationProps> = ({
  filters,
  setFilters,
  getFamilyOptions,
  getTransmissionOptions,
  getFuelOptions,
  getLineOptions,
}) => {
  return (
    <Card title="Detalles del Vehículo">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="model" label="Modelo">
            <Select
              placeholder="Seleccione el modelo"
              onChange={(value) => setFilters(prev => ({ ...prev, model: value }))}
              options={Array.from({ length: 2025 - 2003 + 1 }, (_, i) => ({
                label: `${2003 + i}`,
                value: `${2003 + i}`,
              }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="family" label="Familia">
            <Select
              placeholder="Seleccione la familia"
              onChange={(value) => setFilters(prev => ({ ...prev, family: value }))}
              options={getFamilyOptions()}
              disabled={!filters.model}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="transmission" label="Transmisión">
            <Select
              placeholder="Seleccione la transmisión"
              onChange={(value) => setFilters(prev => ({ ...prev, transmission: value }))}
              options={getTransmissionOptions()}
              disabled={!filters.family}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="fuel" label="Combustible">
            <Select
              placeholder="Seleccione el combustible"
              onChange={(value) => setFilters(prev => ({ ...prev, fuel: value }))}
              options={getFuelOptions()}
              disabled={!filters.transmission}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="line" label="Línea">
            <Select
              placeholder="Seleccione la línea"
              options={getLineOptions()}
              disabled={!filters.fuel}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="brand" label="Marca">
            <Input placeholder="Marca del vehículo" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default VehicleInformation;