import React from "react";
import { Card, Form, Input, Button, Switch, InputNumber, Row, Col } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import UploadComponent from "./UploadComponent";

interface Achievement {
  title: string;
  value: string;
  color: string;
  active: boolean;
  order: number;
  _id?: string;
  icon_url?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
  onAchievementChange: (index: number, field: keyof Achievement, value: any) => void;
  onRemoveAchievement: (index: number) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  index,
  onAchievementChange,
  onRemoveAchievement,
}) => {
  return (
    <Card
      key={index}
      title={`Logro ${index + 1}`}
      className="service-card animate-in"
      extra={
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemoveAchievement(index)}
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
                value={achievement.title}
                onChange={(e) => onAchievementChange(index, "title", e.target.value)}
                placeholder="Título del logro"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Orden">
              <InputNumber
                className="input-field"
                min={0}
                value={achievement.order}
                onChange={(value) => onAchievementChange(index, "order", value)}
                placeholder="Orden de visualización"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Valor" required>
              <Input
                className="input-field"
                value={achievement.value}
                onChange={(e) => onAchievementChange(index, "value", e.target.value)}
                placeholder="Valor del logro (ej: 500+)"
              />
            </Form.Item>
          </Col>
        </Row>

   

        <UploadComponent
          label="Imagen de ícono (opcional)"
          value={achievement.icon_url}
          onChange={(url) => onAchievementChange(index, "icon_url", url || "")}
          isIcon={true}
        />

        <Form.Item label="Activo" className="switch-field">
          <Switch
            checked={achievement.active}
            onChange={(checked) => onAchievementChange(index, "active", checked)}
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AchievementCard;