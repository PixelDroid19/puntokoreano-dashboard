import React from 'react';
import { Card, Form, Input } from 'antd';

const SeoInformation: React.FC = () => {
  return (
    <Card title="Optimización para Buscadores">
      <Form.Item
        name="seoTitle"
        label="Título SEO"
        rules={[
          {
            max: 60,
            message: "El título SEO no debe exceder 60 caracteres",
          },
        ]}
      >
        <Input placeholder="Título para SEO (si se deja vacío se usará el nombre del producto)" />
      </Form.Item>

      <Form.Item
        name="seoDescription"
        label="Descripción SEO"
        rules={[
          {
            max: 160,
            message:
              "La descripción SEO no debe exceder 160 caracteres",
          },
        ]}
      >
        <Input.TextArea
          rows={3}
          placeholder="Descripción para SEO (si se deja vacío se usará la descripción corta)"
          showCount
          maxLength={160}
        />
      </Form.Item>

      <Form.Item
        name="seoKeywords"
        label="Palabras Clave"
        help="Separar palabras clave por comas"
      >
        <Input.TextArea
          rows={2}
          placeholder="ej: repuesto, motor, hyundai"
        />
      </Form.Item>
    </Card>
  );
};

export default SeoInformation;