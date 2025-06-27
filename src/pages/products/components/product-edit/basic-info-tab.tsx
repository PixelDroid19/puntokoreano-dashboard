import type React from "react"
import { Form, Input, InputNumber, Select, Switch, Card, Row, Col, Tag, Progress, Typography } from "antd"
import { InfoCircleOutlined, TagOutlined, DollarOutlined, PercentageOutlined } from "@ant-design/icons"

const { Text } = Typography

interface BasicInfoTabProps {
  form: any
  groupsData: any
  subgroups: any[]
  handleGroupChange: (value: string) => void
  stockStatus: any
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ form, groupsData, subgroups, handleGroupChange, stockStatus }) => {
  return (
    <div className="animate-fadeIn">
      <Row gutter={24} className="mt-4">
        {/* Columna Izquierda */}
        <Col xs={24} md={12}>
          <Card
            title={
              <div className="flex items-center">
                <InfoCircleOutlined className="text-blue-600 mr-2" />
                <span>Detalles Principales</span>
              </div>
            }
            className="shadow-sm hover:shadow-md transition-shadow duration-300"
            bordered={false}
          >
            <Form.Item
              name="name"
              label="Nombre"
              rules={[{ required: true, message: "El nombre es requerido" }]}
              className="mb-4"
            >
              <Input
                placeholder="Nombre del producto"
                className="rounded-md transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="code"
              label="SKU/Código"
              rules={[{ required: true, message: "El SKU es requerido" }]}
              className="mb-4"
              tooltip="Código único para identificar el producto"
            >
              <Input
                placeholder="Código único del producto"
                className="rounded-md transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
                prefix={<TagOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label={
                    <span className="flex items-center">
                      <DollarOutlined className="mr-1 text-green-600" />
                      <span>Precio</span>
                    </span>
                  }
                  rules={[{ required: true, type: "number", min: 0 }]}
                  className="mb-4"
                >
                  <InputNumber
                    className="w-full rounded-md transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
                    formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => (value ? value.replace(/\$\s?|,/g, "") : "") as any}
                    min={0}
                    step={1}
                    placeholder="Precio de venta"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["discount", "isActive"]}
                  label={
                    <span className="flex items-center">
                      <PercentageOutlined className="mr-1 text-orange-500" />
                      <span>Descuento</span>
                    </span>
                  }
                  valuePropName="checked"
                  className="mb-4"
                >
                  <Switch
                    checkedChildren="Activo"
                    unCheckedChildren="Inactivo"
                    className="bg-gray-300 hover:bg-gray-400"
                  />
                </Form.Item>
              </Col>
            </Row>

            {form.getFieldValue(["discount", "isActive"]) && (
              <Form.Item
                name={["discount", "percentage"]}
                label="Porcentaje de Descuento"
                rules={[{ type: "number", min: 1, max: 99 }]}
                className="mb-4"
              >
                <InputNumber
                  className="w-full rounded-md"
                  min={1}
                  max={99}
                  formatter={(value) => `${value}%`}
                  parser={(value) => (value ? value.replace("%", "") : "") as any}
                  placeholder="Ej: 15%"
                />
              </Form.Item>
            )}

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="mb-2 flex justify-between items-center">
                <Text strong>Inventario</Text>
                {stockStatus && (
                  <Tag color={stockStatus.color} className="rounded-md px-2 py-1">
                    {stockStatus.available} de {stockStatus.total} disponibles
                  </Tag>
                )}
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="stock"
                    label="Stock Total"
                    rules={[{ required: true, type: "number", min: 0 }]}
                    className="mb-2"
                  >
                    <InputNumber className="w-full rounded-md" min={0} placeholder="Cantidad total" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="reservedStock"
                    label="Stock Reservado"
                    tooltip="Cantidad no disponible para venta directa"
                    rules={[
                      { type: "number", min: 0 },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const totalStock = getFieldValue("stock")
                          if (!value || !totalStock || value <= totalStock) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error("No puede exceder el stock total"))
                        },
                      }),
                    ]}
                    className="mb-2"
                  >
                    <InputNumber className="w-full rounded-md" min={0} placeholder="Reservado" />
                  </Form.Item>
                </Col>
              </Row>

              {stockStatus && (
                <Progress
                  percent={stockStatus.percent}
                  showInfo={false}
                  strokeColor={stockStatus.color}
                  className="mt-2"
                />
              )}
            </div>
          </Card>
        </Col>

        {/* Columna Derecha */}
        <Col xs={24} md={12}>
          <Card
            title={
              <div className="flex items-center">
                <TagOutlined className="text-blue-600 mr-2" />
                <span>Categorización y Envío</span>
              </div>
            }
            className="shadow-sm hover:shadow-md transition-shadow duration-300"
            bordered={false}
          >
            <Form.Item
              name="group"
              label="Grupo"
              rules={[{ required: true, message: "Seleccione un grupo" }]}
              className="mb-4"
            >
              <Select
                placeholder="Seleccionar grupo"
                onChange={handleGroupChange}
                options={groupsData?.data?.groups?.map((group: any) => ({
                  label: group.name,
                  value: group.name,
                }))}
                loading={!groupsData}
                className="rounded-md"
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item
              name="subgroup"
              label="Subgrupo"
              rules={[{ required: true, message: "Seleccione un subgrupo" }]}
              className="mb-4"
            >
              <Select
                placeholder="Seleccionar subgrupo"
                options={subgroups?.map((sg) => ({
                  label: sg.name,
                  value: sg.name,
                }))}
                disabled={!form.getFieldValue("group")}
                className="rounded-md"
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item name="shipping" label="Métodos de Envío Permitidos" className="mb-4">
              <Select
                mode="multiple"
                placeholder="Seleccionar métodos de envío"
                allowClear
                className="rounded-md"
                options={[
                  { label: "Recoger en tienda", value: "pickup" },
                  { label: "Contra entrega", value: "cod" },
                ]}
              />
            </Form.Item>

            <Form.Item name="warranty" label="Garantía" className="mb-4">
              <Input placeholder="Ej: 6 meses, 1 año" className="rounded-md" />
            </Form.Item>

            <Form.Item name="active" label="Estado del Producto" valuePropName="checked" className="mb-4">
              <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" className="bg-gray-300 hover:bg-gray-400" />
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default BasicInfoTab