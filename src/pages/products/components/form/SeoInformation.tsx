

import type React from "react"
import { useState } from "react"
import { Card, Form, Input, Typography, Badge, Progress, Tooltip } from "antd"
import { SearchOutlined, InfoCircleOutlined, TagsOutlined } from "@ant-design/icons"
import { motion } from "framer-motion"

const { Text } = Typography

const SeoInformation: React.FC = () => {
  const [titleLength, setTitleLength] = useState(0)
  const [descriptionLength, setDescriptionLength] = useState(0)

  // Calcular la efectividad del SEO basado en la longitud de los campos
  const getTitleEffectiveness = (length: number) => {
    if (length === 0) return { percent: 0, status: "exception" }
    if (length < 30) return { percent: 40, status: "active" }
    if (length <= 55) return { percent: 100, status: "success" }
    if (length <= 60) return { percent: 70, status: "active" }
    return { percent: 50, status: "exception" }
  }

  const getDescriptionEffectiveness = (length: number) => {
    if (length === 0) return { percent: 0, status: "exception" }
    if (length < 80) return { percent: 40, status: "active" }
    if (length <= 150) return { percent: 100, status: "success" }
    if (length <= 160) return { percent: 70, status: "active" }
    return { percent: 50, status: "exception" }
  }

  const titleEffectiveness = getTitleEffectiveness(titleLength)
  const descriptionEffectiveness = getDescriptionEffectiveness(descriptionLength)

  const seoTitleValue = Form.useWatch("seoTitle")
  const seoDescriptionValue = Form.useWatch("seoDescription")

  return (
    <Card
      title={
        <div className="flex items-center">
          <SearchOutlined className="mr-2 text-blue-500" />
          <span>Optimización para Buscadores (SEO)</span>
        </div>
      }
      className="shadow-sm hover:shadow-md transition-all duration-300"
      headStyle={{ borderBottom: "2px solid #f0f0f0" }}
      bodyStyle={{ padding: "24px" }}
      extra={<InfoCircleOutlined className="text-blue-500" />}
    >
      <Form.Item
        name="seoTitle"
        label={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <span>Título SEO</span>
              <Tooltip title="El título que aparecerá en los resultados de búsqueda. Ideal entre 30-55 caracteres.">
                <InfoCircleOutlined className="ml-1 text-blue-500" />
              </Tooltip>
            </div>
            <Badge
              count={`${titleLength}/60`}
              style={{
                backgroundColor: titleLength > 55 ? "#ff4d4f" : titleLength >= 30 ? "#52c41a" : "#faad14",
                fontSize: "12px",
              }}
            />
          </div>
        }
        rules={[{ max: 60, message: "El título SEO no debe exceder 60 caracteres" }]}
      >
        <Input
          placeholder="Título para SEO (si se deja vacío se usará el nombre del producto)"
          onChange={(e) => setTitleLength(e.target.value.length)}
          suffix={
            <Tooltip title={`Efectividad: ${titleEffectiveness.percent}%`}>
              <Progress
                type="circle"
                percent={titleEffectiveness.percent}
                width={16}
                strokeWidth={12}
                status={titleEffectiveness.status as "success" | "exception" | "active" | "normal"}
                showInfo={false}
              />
            </Tooltip>
          }
        />
      </Form.Item>

      <div className="mb-4">
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
            <Text className="text-xs text-gray-500 block mb-1">Vista previa en Google:</Text>
            <Text className="text-blue-600 block text-lg font-medium truncate">
              {titleLength > 0 ? seoTitleValue : "Título de tu producto | Tu Tienda"}
            </Text>
            <Text className="text-green-700 block text-xs">www.tutienda.com/productos/tu-producto</Text>
            <Text className="text-gray-600 block text-sm line-clamp-2">
              {descriptionLength > 0
                ? seoDescriptionValue
                : "Aquí aparecerá la descripción de tu producto. Una buena descripción mejora el CTR y la visibilidad en buscadores."}
            </Text>
          </div>
        </motion.div>
      </div>

      <Form.Item
        name="seoDescription"
        label={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <span>Descripción SEO</span>
              <Tooltip title="La descripción que aparecerá en los resultados de búsqueda. Ideal entre 80-150 caracteres.">
                <InfoCircleOutlined className="ml-1 text-blue-500" />
              </Tooltip>
            </div>
            <Badge
              count={`${descriptionLength}/160`}
              style={{
                backgroundColor: descriptionLength > 150 ? "#ff4d4f" : descriptionLength >= 80 ? "#52c41a" : "#faad14",
                fontSize: "12px",
              }}
            />
          </div>
        }
        rules={[{ max: 160, message: "La descripción SEO no debe exceder 160 caracteres" }]}
      >
        <Input.TextArea
          rows={3}
          placeholder="Descripción para SEO (si se deja vacío se usará la descripción corta)"
          onChange={(e) => setDescriptionLength(e.target.value.length)}
          className="mb-1"
        />
      </Form.Item>

      <div className="mb-1 flex justify-end">
        <Tooltip title={`Efectividad: ${descriptionEffectiveness.percent}%`}>
          <Progress
            percent={descriptionEffectiveness.percent}
            size="small"
            status={descriptionEffectiveness.status as "success" | "exception" | "active" | "normal"}
            className="w-1/3"
          />
        </Tooltip>
      </div>

      <Form.Item
        name="seoKeywords"
        label={
          <div className="flex items-center">
            <TagsOutlined className="mr-1 text-green-600" />
            <span>Palabras Clave</span>
            <Tooltip title="Palabras clave relevantes separadas por comas. Aunque tienen menos impacto en SEO moderno, ayudan a categorizar el contenido.">
              <InfoCircleOutlined className="ml-1 text-blue-500" />
            </Tooltip>
          </div>
        }
      >
        <Input.TextArea rows={2} placeholder="ej: repuesto, motor, hyundai" className="rounded-lg" />
      </Form.Item>

      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4">
        <Text className="text-blue-700 block font-medium mb-1">
          <InfoCircleOutlined className="mr-1" /> Consejos SEO
        </Text>
        <ul className="list-disc pl-5 text-blue-600 text-sm">
          <li>Usa palabras clave relevantes al inicio del título</li>
          <li>Incluye el nombre de la marca en la descripción</li>
          <li>Evita repetir palabras clave (keyword stuffing)</li>
        </ul>
      </div>
    </Card>
  )
}

export default SeoInformation

