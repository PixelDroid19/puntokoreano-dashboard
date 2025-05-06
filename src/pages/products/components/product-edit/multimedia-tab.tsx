

import type React from "react"
import { Form, Switch, Select, Card, Button, Tooltip, Space, Alert, Upload, message, Input } from "antd"
import { PictureOutlined, EyeOutlined, InboxOutlined } from "@ant-design/icons"
import { Product } from "../../../../api/types"

interface MultimediaTabProps {
  productData: Product | undefined
  useGroupImages: boolean
  setUseGroupImages: (value: boolean) => void
  imageGroupsData: any
  form: any
}

const MultimediaTab: React.FC<MultimediaTabProps> = ({
  productData,
  useGroupImages,
  setUseGroupImages,
  imageGroupsData,
  form,
}) => {
  return (
    <div className="animate-fadeIn mt-4">
      <Card
        title={
          <div className="flex items-center">
            <PictureOutlined className="text-blue-500 mr-2" />
            <span>Imágenes</span>
          </div>
        }
        className="shadow-sm hover:shadow-md transition-shadow duration-300 mb-6"
        bordered={false}
      >
        <Form.Item label="Usar Grupo de Imágenes" name="useGroupImages" valuePropName="checked" className="mb-4">
          <Switch onChange={setUseGroupImages} className="bg-gray-300 hover:bg-gray-400" />
        </Form.Item>

        {useGroupImages && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 transition-all duration-300 hover:bg-gray-100">
            <Form.Item
              name="imageGroup"
              label="Seleccionar Grupo de Imágenes"
              rules={[
                {
                  required: useGroupImages,
                  message: "Seleccione un grupo",
                },
              ]}
              className="mb-4"
            >
              <Select
                placeholder="Buscar o seleccionar grupo"
                showSearch
                allowClear
                optionFilterProp="label"
                className="rounded-md"
                options={imageGroupsData?.data?.groups?.map((group: any) => ({
                  label: group.identifier,
                  value: group._id,
                }))}
                loading={!imageGroupsData}
              />
            </Form.Item>
          </div>
        )}

        {useGroupImages && productData?.imageGroup && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {imageGroupsData?.data?.groups
              ?.find((g: any) => g._id === productData.imageGroup)
              ?.images?.map((image: any) => (
                <div
                  key={image._id}
                  className="group relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  <img src={image.url || "/placeholder.svg"} alt={image.name} className="w-full h-48 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <Space className="w-full justify-center">
                      <Tooltip title="Ver imagen">
                        <Button
                          icon={<EyeOutlined />}
                          size="small"
                          onClick={() => window.open(image.url, "_blank")}
                          className="bg-white/90 hover:bg-white"
                        />
                      </Tooltip>
                    </Space>
                  </div>
                </div>
              ))}
          </div>
        )}

        {!useGroupImages && (
          <div className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100">
            <Form.Item
              name="images"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e
                }
                return e?.fileList
              }}
              className="mb-4"
            >
              <Upload.Dragger
                multiple
                listType="picture-card"
                accept="image/*"
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith("image/")
                  if (!isImage) {
                    message.error(`${file.name} no es un archivo de imagen válido`)
                  }
                  return false
                }}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                  showDownloadIcon: false,
                }}
                className="upload-area transition-all duration-300 hover:border-blue-400"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined className="text-blue-500" />
                </p>
                <p className="ant-upload-text">Haga clic o arrastre archivos aquí</p>
                <p className="ant-upload-hint text-xs text-gray-500">Soporte para imágenes JPG, PNG o GIF</p>
              </Upload.Dragger>
            </Form.Item>

            {productData?.images && productData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {productData.images.map((image: any, index: number) => (
                  <div
                    key={index}
                    className="group relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <img src={image.url || image} alt={`Imagen ${index + 1}`} className="w-full h-48 object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Space className="w-full justify-center">
                        <Tooltip title="Ver imagen">
                          <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => window.open(image.url || image, "_blank")}
                            className="bg-white/90 hover:bg-white"
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      <Card
        title={
          <div className="flex items-center">
            <span className="material-icons mr-2 text-blue-500">videocam</span>
            <span>Video (Opcional)</span>
          </div>
        }
        className="shadow-sm hover:shadow-md transition-shadow duration-300"
        bordered={false}
      >
        <Form.Item name="videoUrl" label="URL del Video (YouTube, Vimeo)" className="mb-4">
          <Input placeholder="https://..." className="rounded-md" />
        </Form.Item>

        {form.getFieldValue("videoUrl") && (
          <Alert
            type="success"
            message="Video configurado"
            description="El video se mostrará en la galería del producto junto con las imágenes."
            showIcon
            className="mt-4 shadow-sm"
          />
        )}
      </Card>
    </div>
  )
}

export default MultimediaTab
