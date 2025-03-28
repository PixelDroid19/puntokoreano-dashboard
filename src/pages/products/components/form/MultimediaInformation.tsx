import type React from "react"
import { useState, useRef } from "react"
import {
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Switch,
  Upload,
  type UploadFile,
  Typography,
  Badge,
  Tooltip,
  notification,
  Modal,
  Button,
} from "antd"
import {
  PictureOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons"
import { motion, AnimatePresence } from "framer-motion"

const { Title, Text, Paragraph } = Typography
const { Dragger } = Upload

interface MultimediaInformationProps {
  useGroupImages: boolean
  setUseGroupImages: React.Dispatch<React.SetStateAction<boolean>>
  fileList: UploadFile[]
  handleUpload: (file: any) => boolean
  handlePreview: (file: UploadFile) => void
  imageGroups: any
  setVideoUrl: React.Dispatch<React.SetStateAction<string>>
  videoUrl: string
}

const MultimediaInformation: React.FC<MultimediaInformationProps> = ({
  useGroupImages,
  setUseGroupImages,
  fileList,
  handleUpload,
  handlePreview,
  imageGroups,
  setVideoUrl,
  videoUrl,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState("")
  const [previewTitle, setPreviewTitle] = useState("")
  const [activeField, setActiveField] = useState<string | null>(null)
  const [videoPreviewVisible, setVideoPreviewVisible] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const formRef = Form.useFormInstance()
  const videoUrlRef = useRef(videoUrl)

  // Animación para los campos cuando están activos
  const fieldAnimation = {
    inactive: { scale: 1 },
    active: { scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 15 } },
  }

  // Animación para las tarjetas
  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  }

  // Función para mostrar tooltips explicativos
  const renderFieldHelp = (title: string, content: string) => (
    <Tooltip title={content}>
      <QuestionCircleOutlined className="text-blue-500 ml-1 cursor-pointer hover:text-blue-700 transition-colors" />
    </Tooltip>
  )

  // Función para manejar la vista previa de imágenes
  const handleImagePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File)
    }

    setPreviewImage(file.url || (file.preview as string))
    setPreviewVisible(true)
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1))
  }

  // Función para convertir archivo a base64
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Función para manejar la vista previa de video
  const handleVideoPreview = (url: string) => {
    // Extraer el ID del video de YouTube
    let videoId = ""
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0]
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0]
    }

    if (videoId) {
      setCurrentVideoUrl(`https://www.youtube.com/embed/${videoId}`)
      setVideoPreviewVisible(true)
    } else {
      notification.error({
        message: "URL de video inválida",
        description: "Por favor ingrese una URL válida de YouTube.",
        placement: "bottomRight",
      })
    }
  }

  // Función para manejar el cambio de URL de video
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setVideoUrl(url)
    videoUrlRef.current = url

    // Validar URL de YouTube
    if (url && (url.includes("youtube.com") || url.includes("youtu.be"))) {
      notification.success({
        message: "URL de video válida",
        description: "La URL del video ha sido validada correctamente.",
        placement: "bottomRight",
      })
    }
  }

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Title level={2} className="mb-6 text-gray-800">
          Multimedia del Producto
        </Title>
      </motion.div>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <motion.div custom={0} initial="hidden" animate="visible" variants={cardAnimation}>
            <Card
              title={
                <div className="flex items-center">
                  <PictureOutlined className="mr-2 text-blue-500" />
                  <span>Imágenes del Producto</span>
                </div>
              }
              className="shadow-sm hover:shadow-md transition-all duration-300"
              headStyle={{ borderBottom: "2px solid #f0f0f0" }}
              bodyStyle={{ padding: "24px" }}
              extra={
                <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 300 }}>
                  <InfoCircleOutlined className="text-blue-500" />
                </motion.div>
              }
            >
              <motion.div animate={activeField === "useGroupImages" ? "active" : "inactive"} variants={fieldAnimation}>
                <Form.Item
                  label={
                    <div className="flex items-center">
                      <span>Usar Grupo de Imágenes</span>
                      {renderFieldHelp(
                        "Grupo de Imágenes",
                        "Active esta opción para utilizar un grupo de imágenes predefinido en lugar de subir imágenes individuales.",
                      )}
                    </div>
                  }
                  name="useGroupImages"
                >
                  <div className="flex items-center">
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Switch
                        checked={useGroupImages}
                        onChange={(checked) => {
                          setUseGroupImages(checked)
                          notification.info({
                            message: checked ? "Grupo de Imágenes Activado" : "Carga Individual Activada",
                            description: checked
                              ? "Ahora puede seleccionar un grupo de imágenes predefinido."
                              : "Ahora puede subir imágenes individuales para este producto.",
                            placement: "bottomRight",
                          })
                        }}
                        onFocus={() => setActiveField("useGroupImages")}
                        onBlur={() => setActiveField(null)}
                      />
                    </motion.div>
                    <Text className="ml-2 text-sm text-gray-500">
                      {useGroupImages
                        ? "Utilizar un grupo de imágenes predefinido"
                        : "Subir imágenes individuales para este producto"}
                    </Text>
                  </div>
                </Form.Item>
              </motion.div>

              <AnimatePresence mode="wait">
                {useGroupImages ? (
                  <motion.div
                    key="imageGroup"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Form.Item
                      name="imageGroup"
                      rules={[{ required: true, message: "Por favor seleccione un grupo de imágenes" }]}
                      className="mb-4"
                    >
                      <Select
                        placeholder="Seleccione un grupo de imágenes"
                        className="rounded-lg"
                        size="large"
                        showSearch
                        optionFilterProp="label"
                        options={imageGroups?.data?.groups?.map((group: any) => ({
                          label: group.identifier,
                          value: group._id,
                        }))}
                        onFocus={() => setActiveField("imageGroup")}
                        onBlur={() => setActiveField(null)}
                        onChange={() => {
                          notification.success({
                            message: "Grupo de Imágenes Seleccionado",
                            description: "Las imágenes del grupo seleccionado se utilizarán para este producto.",
                            placement: "bottomRight",
                          })
                        }}
                      />
                    </Form.Item>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                      <div className="flex items-center mb-2">
                        <InfoCircleOutlined className="text-blue-500 mr-2" />
                        <Text strong className="text-blue-700">
                          Información sobre Grupos de Imágenes
                        </Text>
                      </div>
                      <Text className="text-blue-600 block">
                        Los grupos de imágenes permiten reutilizar las mismas imágenes para múltiples productos
                        similares.
                      </Text>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {[1, 2, 3, 4].map((item) => (
                        <motion.div
                          key={item}
                          whileHover={{ scale: 1.05 }}
                          className="relative rounded-lg overflow-hidden border border-gray-200"
                        >
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <PictureOutlined style={{ fontSize: 24, color: "#d9d9d9" }} />
                          </div>
                          <div className="absolute top-2 right-2">
                            <Badge count="Grupo" style={{ backgroundColor: "#1890ff" }} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="individualImages"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Form.Item
                      name="images"
                      rules={[{ required: true, message: "Por favor suba al menos una imagen" }]}
                    >
                      <motion.div
                        animate={{
                          boxShadow: dragActive ? "0 0 0 2px rgba(24, 144, 255, 0.5)" : "none",
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <Dragger
                          listType="picture-card"
                          fileList={fileList}
                          beforeUpload={handleUpload}
                          onPreview={handleImagePreview}
                          multiple={true}
                          accept="image/*"
                          onDragEnter={() => setDragActive(true)}
                          onDragLeave={() => setDragActive(false)}
                          onDrop={() => setDragActive(false)}
                          className="rounded-lg border-dashed"
                          style={{ padding: "20px" }}
                          onFocus={() => setActiveField("images")}
                          onBlur={() => setActiveField(null)}
                        >
                          <div className="p-4">
                            <motion.div animate={{ scale: dragActive ? 1.1 : 1 }} transition={{ duration: 0.2 }}>
                              <p className="ant-upload-drag-icon">
                                <CloudUploadOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                              </p>
                            </motion.div>
                            <p className="ant-upload-text font-medium text-lg mt-2">
                              Haga clic o arrastre archivos a esta área para subirlos
                            </p>
                            <p className="ant-upload-hint text-gray-500 mt-1">
                              Soporte para imágenes JPG, PNG o GIF. Tamaño máximo: 5MB
                            </p>
                          </div>
                        </Dragger>
                      </motion.div>
                    </Form.Item>

                    {fileList.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <Text strong>Vista previa de imágenes</Text>
                          <Badge count={`${fileList.length} imágenes`} style={{ backgroundColor: "#1890ff" }} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {fileList.map((file, index) => (
                            <motion.div key={file.uid} whileHover={{ scale: 1.05 }} className="relative">
                              <div
                                className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer"
                                onClick={() => handleImagePreview(file)}
                              >
                                <img
                                  src={file.url || file.preview}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute top-2 right-2 flex space-x-1">
                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                  <Tooltip title="Ver imagen">
                                    <button
                                      className="bg-white rounded-full p-1 shadow-md text-blue-500 hover:text-blue-700"
                                      onClick={() => handleImagePreview(file)}
                                    >
                                      <EyeOutlined />
                                    </button>
                                  </Tooltip>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                  <Tooltip title="Eliminar imagen">
                                    <button
                                      className="bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-700"
                                      onClick={() => {
                                        const newFileList = fileList.filter((item) => item.uid !== file.uid)
                                        handleUpload({ fileList: newFileList })
                                      }}
                                    >
                                      <DeleteOutlined />
                                    </button>
                                  </Tooltip>
                                </motion.div>
                              </div>
                              {index === 0 && (
                                <div className="absolute bottom-2 left-2">
                                  <Badge count="Principal" style={{ backgroundColor: "#52c41a" }} />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          <motion.div custom={1} initial="hidden" animate="visible" variants={cardAnimation}>
            <Card
              title={
                <div className="flex items-center">
                  <VideoCameraOutlined className="mr-2 text-red-500" />
                  <span>Video del Producto</span>
                </div>
              }
              className="shadow-sm hover:shadow-md transition-all duration-300 mt-6"
              headStyle={{ borderBottom: "2px solid #f0f0f0" }}
              bodyStyle={{ padding: "24px" }}
              extra={
                <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 300 }}>
                  <InfoCircleOutlined className="text-red-500" />
                </motion.div>
              }
            >
              <motion.div animate={activeField === "videoUrl" ? "active" : "inactive"} variants={fieldAnimation}>
                <Form.Item
                  name="videoUrl"
                  label={
                    <div className="flex items-center">
                      <span>URL del Video (YouTube/Vimeo)</span>
                      {renderFieldHelp(
                        "URL del Video",
                        "Ingrese la URL completa del video de YouTube o Vimeo. Ejemplo: https://youtube.com/watch?v=XXXX",
                      )}
                    </div>
                  }
                  extra={
                    <Text className="text-gray-500">
                      Ingrese la URL del video de YouTube o Vimeo para mostrar en la página del producto
                    </Text>
                  }
                >
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    onChange={handleVideoUrlChange}
                    className="rounded-lg"
                    size="large"
                    prefix={<VideoCameraOutlined className="text-red-500" />}
                    suffix={
                      <Tooltip title="Vista previa">
                        <EyeOutlined
                          className="cursor-pointer text-blue-500 hover:text-blue-700"
                          onClick={() => handleVideoPreview(videoUrlRef.current)}
                        />
                      </Tooltip>
                    }
                    onFocus={() => setActiveField("videoUrl")}
                    onBlur={() => setActiveField(null)}
                    value={videoUrl}
                  />
                </Form.Item>
              </motion.div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center mb-2">
                  <InfoCircleOutlined className="text-blue-500 mr-2" />
                  <Text strong className="text-blue-700">
                    Consejos para videos de productos
                  </Text>
                </div>
                <ul className="list-disc pl-5 text-blue-600">
                  <li className="mb-1">Los videos aumentan las conversiones en un 80%</li>
                  <li className="mb-1">Muestre el producto en uso para mejor comprensión</li>
                  <li>Videos cortos (30-90 segundos) tienen mejor retención</li>
                </ul>
              </div>

              {videoUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <Badge count="Video configurado" style={{ backgroundColor: "#52c41a" }} className="mb-2" />
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 flex items-center">
                    <VideoCameraOutlined className="text-red-500 text-xl mr-3" />
                    <div className="flex-1 truncate">{videoUrl}</div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleVideoPreview(videoUrlRef.current)}
                        className="ml-3"
                      >
                        Vista previa
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Modal para vista previa de imágenes */}
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <img alt="Vista previa" style={{ width: "100%" }} src={previewImage || "/placeholder.svg"} />
      </Modal>

      {/* Modal para vista previa de video */}
      <Modal
        visible={videoPreviewVisible}
        title="Vista previa del video"
        footer={null}
        onCancel={() => setVideoPreviewVisible(false)}
        width={800}
        centered
      >
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
          <iframe
            src={currentVideoUrl}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video Preview"
          />
        </div>
      </Modal>
    </div>
  )
}

export default MultimediaInformation

