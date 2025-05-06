import type React from "react"
import { Form, Card, Input, Divider, Alert } from "antd"
import { EditOutlined } from "@ant-design/icons"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
}

const DescriptionTab: React.FC = () => {
  return (
    <div className="animate-fadeIn mt-4">
      <Card
        title={
          <div className="flex items-center">
            <EditOutlined className="text-blue-500 mr-2" />
            <span>Contenido Descriptivo</span>
          </div>
        }
        className="shadow-sm hover:shadow-md transition-shadow duration-300"
        bordered={false}
      >
        <Form.Item
          name="short_description"
          label="Descripción Corta"
          rules={[{ required: true, message: "Requerida" }, { max: 200 }]}
          className="mb-6"
        >
          <Input.TextArea
            rows={3}
            maxLength={200}
            showCount
            placeholder="Breve descripción para mostrar en listados y resultados de búsqueda..."
            className="rounded-md transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
          />
        </Form.Item>

        <Divider className="my-6" />

        <Form.Item
          name="long_description"
          label="Descripción Detallada"
          rules={[
            {
              validator: (_, value) =>
                !value || value === "<p><br></p>" ? Promise.reject(new Error("Requerida")) : Promise.resolve(),
              required: true,
            },
          ]}
          className="mb-4"
        >
          <ReactQuill
            modules={quillModules}
            theme="snow"
            style={{
              minHeight: "200px",
              border: "1px solid #d9d9d9",
              borderRadius: "8px",
            }}
            className="bg-white"
          />
        </Form.Item>

        <Alert
          type="info"
          message="Consejos para una buena descripción"
          description={
            <ul className="list-disc pl-5 mt-2 text-sm">
              <li>Incluya especificaciones técnicas relevantes</li>
              <li>Destaque los beneficios del producto</li>
              <li>Mencione materiales, dimensiones y características importantes</li>
              <li>Evite errores ortográficos y gramaticales</li>
            </ul>
          }
          showIcon
          className="mt-6 shadow-sm"
        />
      </Card>
    </div>
  )
}

export default DescriptionTab
