import type React from "react"
import { Form, Card, Input, Alert } from "antd"
import { TagOutlined } from "@ant-design/icons"

const SeoTab: React.FC = () => {
  return (
    <div className="animate-fadeIn mt-4">
      <Card
        title={
          <div className="flex items-center">
            <TagOutlined className="text-blue-500 mr-2" />
            <span>Optimización para Buscadores</span>
          </div>
        }
        className="shadow-sm hover:shadow-md transition-shadow duration-300"
        bordered={false}
      >
        <Form.Item
          name="seoTitle"
          label="Título SEO"
          rules={[{ max: 70 }]}
          extra="Si se deja vacío, se utilizará el nombre del producto."
          className="mb-4"
        >
          <Input
            placeholder="Título atractivo (max 70 caracteres)"
            maxLength={70}
            showCount
            className="rounded-md transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
          />
        </Form.Item>

        <Form.Item
          name="seoDescription"
          label="Meta Descripción"
          rules={[{ max: 160 }]}
          extra="Si se deja vacío, se utilizará la descripción corta."
          className="mb-4"
        >
          <Input.TextArea
            rows={3}
            maxLength={160}
            showCount
            placeholder="Resumen conciso (max 160 caracteres)"
            className="rounded-md transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
          />
        </Form.Item>

        <Form.Item
          name="seoKeywords"
          label="Palabras Clave (Opcional)"
          extra="Separar por comas. Estas palabras ayudarán a encontrar su producto en búsquedas."
          className="mb-6"
        >
          <Input.TextArea
            rows={2}
            placeholder="Ej: repuesto, motor, hyundai"
            className="rounded-md transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
          />
        </Form.Item>

        <Alert
          type="success"
          message="Mejores prácticas SEO"
          description={
            <ul className="list-disc pl-5 mt-2 text-sm">
              <li>Use palabras clave específicas al sector automotriz</li>
              <li>Incluya el nombre de marca y modelo cuando sea relevante</li>
              <li>Mantenga títulos concisos y descriptivos</li>
              <li>Evite la repetición excesiva de palabras clave</li>
            </ul>
          }
          showIcon
          className="mt-4 shadow-sm"
        />
      </Card>
    </div>
  )
}

export default SeoTab
