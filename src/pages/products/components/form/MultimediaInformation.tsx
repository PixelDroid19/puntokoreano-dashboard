import type React from "react";
import { useState, useRef } from "react";
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
} from "antd";
import {
  PictureOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

const { Title, Text } = Typography;
const { Dragger } = Upload;

interface ImageFile {
  _id: string;
  name: string;
  original_name: string;
  url: string;
  display_url: string;
  size?: number;
  type?: string;
  provider?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ImageGroup {
  _id: string;
  identifier: string;
  images: ImageFile[];
  // Add other group properties if needed
}

interface MultimediaInformationProps {
  useGroupImages: boolean;
  setUseGroupImages: React.Dispatch<React.SetStateAction<boolean>>;
  fileList: UploadFile[];
  handleUpload: (options: {
    file: any;
    fileList?: UploadFile[];
  }) => boolean | void; // Adjusted signature based on typical Ant Design usage
  handlePreview: (file: UploadFile) => void; // Assuming this is for individual uploads preview modal
  imageGroups: { data?: { groups?: ImageGroup[] } } | null | undefined;
  setVideoUrl: React.Dispatch<React.SetStateAction<string>>;
  videoUrl: string;
}

const MultimediaInformation: React.FC<MultimediaInformationProps> = ({
  useGroupImages,
  setUseGroupImages,
  fileList,
  handleUpload,
  // handlePreview is used for individual file uploads modal, renaming handleImagePreview for clarity
  // handlePreview,
  imageGroups,
  setVideoUrl,
  videoUrl,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [activeField, setActiveField] = useState<string | null>(null);
  const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedGroupImages, setSelectedGroupImages] = useState<ImageFile[]>(
    []
  );
  const formRef = Form.useFormInstance(); // Get form instance if needed for resetting
  const videoUrlRef = useRef(videoUrl);

  const fieldAnimation = {
    inactive: { scale: 1 },
    active: {
      scale: 1.02,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  };

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
  };

  const renderFieldHelp = (title: string, content: string) => (
    <Tooltip title={content}>
      <QuestionCircleOutlined className="text-blue-500 ml-1 cursor-pointer hover:text-blue-700 transition-colors" />
    </Tooltip>
  );

  const handleImagePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleVideoPreview = (url: string) => {
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    }

    if (videoId) {
      setCurrentVideoUrl(`https://www.youtube.com/embed/${videoId}`);
      setVideoPreviewVisible(true);
    } else {
      notification.error({
        message: "URL de video inválida",
        description: "Por favor ingrese una URL válida de YouTube.",
        placement: "bottomRight",
      });
    }
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    videoUrlRef.current = url;

    if (url && (url.includes("youtube.com") || url.includes("youtu.be"))) {
      // Optional: Keep validation notification or remove if redundant
      // notification.success({
      //   message: "URL de video válida",
      //   description: "La URL del video ha sido validada correctamente.",
      //   placement: "bottomRight",
      // });
    }
  };

  // Specific handler for removing files from the individual upload list
  const handleRemoveFile = (fileToRemove: UploadFile) => {
    console.log("Removing file:", fileToRemove, fileList);  
    const newFileList = fileList.filter(
      (file) => file.uid !== fileToRemove.uid
    );
    // Notify the parent or form state about the change
    // This depends on how handleUpload is implemented, assuming it updates the list
    if (typeof handleUpload === "function") {
      // Ant Design's beforeUpload expects a file, but we are managing the list externally
      // We might need a separate prop like 'onFileListChange'
      // For now, let's assume handleUpload can take a fileList option
      handleUpload({ file: fileToRemove, fileList: newFileList });
    }
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title level={2} className="mb-6 text-gray-800">
          Multimedia del Producto
        </Title>
      </motion.div>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardAnimation}
          >
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
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <InfoCircleOutlined className="text-blue-500" />
                </motion.div>
              }
            >
              <motion.div
                animate={
                  activeField === "useGroupImages" ? "active" : "inactive"
                }
                variants={fieldAnimation}
              >
                <Form.Item
                  label={
                    <div className="flex items-center">
                      <span>Usar Grupo de Imágenes</span>
                      {renderFieldHelp(
                        "Grupo de Imágenes",
                        "Active esta opción para utilizar un grupo de imágenes predefinido en lugar de subir imágenes individuales."
                      )}
                    </div>
                  }
                  name="useGroupImages" // Make sure this name matches your form structure if using Form context
                  valuePropName="checked" // For Switch component with Form.Item
                >
                  <div className="flex items-center">
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Switch
                        checked={useGroupImages}
                        onChange={(checked) => {
                          setUseGroupImages(checked);
                          if (!checked) {
                            formRef?.setFieldsValue({ imageGroup: undefined });
                            setSelectedGroupImages([]);
                          }
                          notification.info({
                            message: checked
                              ? "Grupo de Imágenes Activado"
                              : "Carga Individual Activada",
                            description: checked
                              ? "Ahora puede seleccionar un grupo de imágenes predefinido."
                              : "Ahora puede subir imágenes individuales para este producto.",
                            placement: "bottomRight",
                          });
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
                      rules={[
                        {
                          required: true,
                          message: "Por favor seleccione un grupo de imágenes",
                        },
                      ]}
                      className="mb-4"
                    >
                      <Select
                        placeholder="Seleccione un grupo de imágenes"
                        className="rounded-lg"
                        size="large"
                        showSearch
                        optionFilterProp="label"
                        options={imageGroups?.data?.groups?.map(
                          (group: ImageGroup) => ({
                            label: group.identifier,
                            value: group._id,
                          })
                        )}
                        onFocus={() => setActiveField("imageGroup")}
                        onBlur={() => setActiveField(null)}
                        onChange={(selectedGroupId) => {
                          const selectedGroup = imageGroups?.data?.groups?.find(
                            (group: ImageGroup) => group._id === selectedGroupId
                          );
                          setSelectedGroupImages(
                            selectedGroup ? selectedGroup.images : []
                          );
                          notification.success({
                            message: "Grupo de Imágenes Seleccionado",
                            description: `Grupo '${
                              selectedGroup?.identifier || ""
                            }' seleccionado.`,
                            placement: "bottomRight",
                          });
                        }}
                        allowClear // Allow deselecting
                        onClear={() => setSelectedGroupImages([])} // Clear preview on deselect
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
                        Los grupos de imágenes permiten reutilizar las mismas
                        imágenes para múltiples productos similares.
                      </Text>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                      {selectedGroupImages.length > 0
                        ? selectedGroupImages.map((image) => (
                            <motion.div
                              key={image._id}
                              whileHover={{ scale: 1.05 }}
                              className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-100"
                            >
                              <img
                                src={image.display_url || image.url}
                                alt={image.original_name || `Imagen de grupo`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  // target.src = '/placeholder.svg'; // Path to your placeholder
                                  target.style.display = "none"; // Hide broken image icon
                                  // Optionally show a placeholder icon instead
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const placeholder =
                                      document.createElement("div");
                                    placeholder.className =
                                      "w-full h-full flex items-center justify-center bg-gray-200";
                                    placeholder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
                                    parent.appendChild(placeholder);
                                  }
                                  target.onerror = null;
                                }}
                              />
                              <div className="absolute top-2 right-2">
                                <Badge
                                  count="Grupo"
                                  style={{ backgroundColor: "#1890ff" }}
                                />
                              </div>
                            </motion.div>
                          ))
                        : Array.from({ length: 4 }).map((_, index) => (
                            <motion.div
                              key={`placeholder-${index}`}
                              className="relative rounded-lg overflow-hidden border border-gray-200"
                            >
                              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                <PictureOutlined
                                  style={{ fontSize: 24, color: "#d9d9d9" }}
                                />
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
                      rules={[
                        {
                          validator: async (_, value) => {
                            if (!useGroupImages && (!fileList || fileList.length === 0)) {
                              return Promise.reject('Por favor suba al menos una imagen');
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                      valuePropName="fileList"
                      getValueFromEvent={(e) => {
                        if (Array.isArray(e)) {
                          return e;
                        }
                        return e?.fileList;
                      }}
                    >
                      <motion.div
                        animate={{
                          boxShadow: dragActive
                            ? "0 0 0 2px rgba(24, 144, 255, 0.5)"
                            : "none",
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <Dragger
                          listType="picture-card"
                          fileList={fileList}
                          beforeUpload={(file) => {
                            // Prevent default upload behavior, handle manually via handleUpload prop
                            handleUpload(file);
                            return false; // Must return false to prevent default upload
                          }}
                          onPreview={handleImagePreview} // Use the modal preview handler
                          onRemove={handleRemoveFile} // Use custom remove handler
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
                            <motion.div
                              animate={{ scale: dragActive ? 1.1 : 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <p className="ant-upload-drag-icon">
                                <CloudUploadOutlined
                                  style={{ fontSize: 48, color: "#1890ff" }}
                                />
                              </p>
                            </motion.div>
                            <p className="ant-upload-text font-medium text-lg mt-2">
                              Haga clic o arrastre archivos a esta área para
                              subirlos
                            </p>
                            <p className="ant-upload-hint text-gray-500 mt-1">
                              Soporte para imágenes JPG, PNG o GIF. Tamaño
                              máximo: 5MB
                            </p>
                          </div>
                        </Dragger>
                      </motion.div>
                    </Form.Item>

                    {/* Preview area for individually uploaded files remains the same */}
                    {fileList.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <Text strong>Vista previa de imágenes subidas</Text>
                          <Badge
                            count={`${fileList.length} imágenes`}
                            style={{ backgroundColor: "#1890ff" }}
                          />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {fileList.map((file, index) => (
                            <motion.div
                              key={file.uid}
                              whileHover={{ scale: 1.05 }}
                              className="relative"
                            >
                              <div
                                className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer"
                                onClick={() => handleImagePreview(file)}
                              >
                                <img
                                  src={
                                    file.url ||
                                    file.thumbUrl ||
                                    (file.preview as string)
                                  } // Use thumbUrl if available
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute top-2 right-2 flex space-x-1">
                                <motion.div
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Tooltip title="Ver imagen">
                                    <button
                                      type="button"
                                      className="bg-white rounded-full p-1 shadow-md text-blue-500 hover:text-blue-700"
                                      onClick={() => handleImagePreview(file)}
                                    >
                                      <EyeOutlined />
                                    </button>
                                  </Tooltip>
                                </motion.div>
                                <motion.div
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Tooltip title="Eliminar imagen">
                                    <button
                                      type="button"
                                      className="bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-700"
                                      onClick={() => handleRemoveFile(file)}
                                    >
                                      <DeleteOutlined />
                                    </button>
                                  </Tooltip>
                                </motion.div>
                              </div>
                              {index === 0 && (
                                <div className="absolute bottom-2 left-2">
                                  <Badge
                                    count="Principal"
                                    style={{ backgroundColor: "#52c41a" }}
                                  />
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

          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardAnimation}
          >
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
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <InfoCircleOutlined className="text-red-500" />
                </motion.div>
              }
            >
              <motion.div
                animate={activeField === "videoUrl" ? "active" : "inactive"}
                variants={fieldAnimation}
              >
                <Form.Item
                  name="videoUrl"
                  label={
                    <div className="flex items-center">
                      <span>URL del Video (YouTube)</span>
                      {renderFieldHelp(
                        "URL del Video",
                        "Ingrese la URL completa del video de YouTube. Ejemplo: https://www.youtube.com/watch?v=XXXX"
                      )}
                    </div>
                  }
                  rules={[
                    {
                      type: "url",
                      message: "Por favor ingrese una URL válida.",
                    },
                    {
                      validator: (_, value) => {
                        if (
                          !value ||
                          value.includes("youtube.com") ||
                          value.includes("youtu.be")
                        ) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "Por favor ingrese una URL de YouTube válida."
                          )
                        );
                      },
                    },
                  ]}
                  extra={
                    <Text className="text-gray-500">
                      Ingrese la URL del video de YouTube para mostrar en la
                      página del producto
                    </Text>
                  }
                >
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={handleVideoUrlChange}
                    className="rounded-lg"
                    size="large"
                    prefix={<VideoCameraOutlined className="text-red-500" />}
                    suffix={
                      videoUrlRef.current &&
                      (videoUrlRef.current.includes("youtube.com") ||
                        videoUrlRef.current.includes("youtu.be")) ? (
                        <Tooltip title="Vista previa">
                          <EyeOutlined
                            className="cursor-pointer text-blue-500 hover:text-blue-700"
                            onClick={() =>
                              handleVideoPreview(videoUrlRef.current)
                            }
                          />
                        </Tooltip>
                      ) : null
                    }
                    onFocus={() => setActiveField("videoUrl")}
                    onBlur={() => setActiveField(null)}
                    value={videoUrl} // Ensure controlled component if managing state outside Form
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
                  <li className="mb-1">
                    Los videos pueden aumentar el interés y la comprensión del
                    producto.
                  </li>
                  <li className="mb-1">
                    Muestre el producto en uso o sus características clave.
                  </li>
                  <li>Considere mantener los videos relativamente cortos.</li>
                </ul>
              </div>

              {videoUrl &&
                (videoUrl.includes("youtube.com") ||
                  videoUrl.includes("youtu.be")) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <Badge
                      count="Video configurado"
                      style={{ backgroundColor: "#52c41a" }}
                      className="mb-2"
                    />
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <VideoCameraOutlined className="text-red-500 text-xl mr-3 flex-shrink-0" />
                        <span className="truncate">{videoUrl}</span>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="ml-3 flex-shrink-0"
                      >
                        <Button
                          type="primary"
                          icon={<EyeOutlined />}
                          onClick={() =>
                            handleVideoPreview(videoUrlRef.current)
                          }
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

      <Modal
        open={previewVisible} // Use 'open' instead of 'visible' for newer Ant Design versions
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <img
          alt="Vista previa"
          style={{ width: "100%" }}
          src={previewImage || "/placeholder.svg"}
        />
      </Modal>

      <Modal
        open={videoPreviewVisible} // Use 'open' instead of 'visible'
        title="Vista previa del video"
        footer={null}
        onCancel={() => setVideoPreviewVisible(false)}
        width={800}
        centered
        destroyOnClose // Destroy iframe when modal closes to stop video playback
      >
        <div
          style={{
            position: "relative",
            paddingBottom: "56.25%",
            height: 0,
            overflow: "hidden",
          }}
        >
          <iframe
            src={currentVideoUrl}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video Preview"
          />
        </div>
      </Modal>
    </div>
  );
};

export default MultimediaInformation;
