import React from "react";
import { Card, Form, Input, Button, Switch, InputNumber, Row, Col, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import UploadComponent from "./UploadComponent";

interface HighlightedServiceStat {
  value: string | number;
}

interface HighlightedService {
  title: string;
  description: string;
  image: string;
  stats?: HighlightedServiceStat[];
  active?: boolean;
  order?: number;
  identifier?: string;
  _id?: string;
}

interface ServiceCardProps {
  service: HighlightedService;
  index: number;
  onServiceChange: (index: number, field: keyof HighlightedService, value: any) => void;
  onRemoveService: (index: number) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  index,
  onServiceChange,
  onRemoveService,
}) => {
  return (
    <Card
      key={index}
      title={`Servicio ${index + 1}`}
      className="service-card animate-in"
      extra={
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemoveService(index)}
          className="delete-button"
        >
          Eliminar
        </Button>
      }
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Título" required>
              <Input
                className="input-field"
                value={service.title}
                onChange={(e) => onServiceChange(index, "title", e.target.value)}
                placeholder="Título del servicio"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Orden">
              <InputNumber
                className="input-field"
                min={0}
                value={service.order}
                onChange={(value) => onServiceChange(index, "order", value)}
                placeholder="Orden de visualización"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Descripción" required>
          <Input.TextArea
            className="input-field"
            value={service.description}
            onChange={(e) => onServiceChange(index, "description", e.target.value)}
            placeholder="Descripción del servicio"
            rows={4}
          />
        </Form.Item>

        <UploadComponent
          label="Imagen"
          value={service.image}
          onChange={(url) => onServiceChange(index, "image", url || "")}
          required
        />

        <Form.Item label="Activo" className="switch-field">
          <Switch
            checked={service.active}
            onChange={(checked) => onServiceChange(index, "active", checked)}
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ServiceCard;