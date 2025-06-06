import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Switch,
  Upload,
  type UploadFile as AntdUploadFile,
  Typography,
  Badge,
  Tooltip,
  notification,
  Modal,
  Button,
  Alert,
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
import { RcFile } from "antd/es/upload";
import StorageService from "../../../../services/storage.service";

const { Title, Text } = Typography;
const { Dragger } = Upload;

// Constantes para validación de imágenes
const THUMB_WIDTH = 300;
const THUMB_HEIGHT = 300;
const CAROUSEL_WIDTH = 600;
const CAROUSEL_HEIGHT = 600;
const MAX_IMAGE_SIZE_MB = 2;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Extender la interfaz UploadFile para archivos con vista previa
interface UploadFile extends AntdUploadFile<any> {
  preview?: string;
}

// Interfaz para la imagen individual (compatible con files.service.ts)
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

// Interfaz para grupo de imágenes (compatible con files.service.ts)
interface ImageGroup {
  _id: string;
  identifier: string;
  description?: string;
  thumb?: string;
  carousel?: string[];
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaz para la respuesta del servicio
interface ImageGroupsResponse {
  success: boolean;
  data: {
    groups: ImageGroup[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

interface MultimediaInformationProps {
  useGroupImages: boolean;
  setUseGroupImages: React.Dispatch<React.SetStateAction<boolean>>;
  fileList: UploadFile[];
  setFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>;
  handleUpload: (file: RcFile) => boolean | void | Promise<boolean | any>;
  handlePreview: (file: UploadFile) => void;
  imageGroups: { success?: boolean; data?: { groups?: ImageGroup[] } } | null | undefined;
  setVideoUrl?: React.Dispatch<React.SetStateAction<string>>;
  videoUrl?: string;
  form?: any; // Form instance opcional
  uploadProgress?: Record<string, number>;
  totalUploadProgress?: number;
  isUploading?: boolean;
}

const MultimediaInformation: React.FC<MultimediaInformationProps> = ({
  useGroupImages,
  setUseGroupImages,
  fileList,
  setFileList,
  handleUpload,
  handlePreview,
  imageGroups,
  setVideoUrl,
  videoUrl = "",
  form,
  uploadProgress = {},
  totalUploadProgress = 0,
  isUploading = false,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [activeField, setActiveField] = useState<string | null>(null);
  const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ImageGroup | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const formRef = form || Form.useFormInstance(); // Get form instance if needed for resetting
  const videoUrlRef = useRef(videoUrl);
  
  // Estado separado para la imagen principal y las imágenes del carrusel
  const [thumbImage, setThumbImage] = useState<UploadFile | null>(null);
  const [carouselImages, setCarouselImages] = useState<UploadFile[]>([]);
  
  // Actualizar fileList cuando cambien thumbImage o carouselImages
  useEffect(() => {
    const newFileList: UploadFile[] = [];
    if (thumbImage) {
      newFileList.push(thumbImage);
    }
    if (carouselImages.length > 0) {
      newFileList.push(...carouselImages);
    }
    setFileList(newFileList);
  }, [thumbImage, carouselImages, setFileList]);

  // Inicializar thumbImage y carouselImages desde fileList al montar el componente
  useEffect(() => {
    if (fileList.length > 0 && !thumbImage) {
      setThumbImage(fileList[0]);
      if (fileList.length > 1) {
        setCarouselImages(fileList.slice(1));
      }
    }
  }, []);

  // Agregar un campo oculto para almacenar las URLs de las imágenes
  useEffect(() => {
    // Si tenemos una imagen principal, actualizar el campo thumb
    if (thumbImage && thumbImage.url) {
      formRef?.setFieldsValue({ thumb: thumbImage.url });
    }

    // Si tenemos imágenes de carrusel, actualizar el campo carousel
    if (carouselImages.length > 0) {
      const carouselUrls = carouselImages
        .filter(img => img.url) // Solo incluir imágenes con URL
        .map(img => img.url);
      
      formRef?.setFieldsValue({ carousel: carouselUrls });
    }
  }, [thumbImage, carouselImages]);

  // Hook personalizado para manejar eventos de arrastrar y soltar
  const dragProps = {
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDrop: () => setDragActive(false)
  };

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
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  const getBase64 = (file: RcFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Función para validar dimensiones y tipo de imagen
  const validateImage = async (
    file: RcFile,
    expectedWidth: number,
    expectedHeight: number,
    maxSizeMB: number = MAX_IMAGE_SIZE_MB
  ): Promise<boolean> => {
    // Validar tipo de archivo
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      notification.error({
        message: "Formato no permitido",
        description: `${file.name} no es un formato válido (JPG, PNG, GIF, WEBP).`,
        placement: "bottomRight",
      });
      return false;
    }

    // Validar tamaño del archivo
    if (file.size > maxSizeMB * 1024 * 1024) {
      notification.error({
        message: "Archivo muy grande",
        description: `${file.name} excede el tamaño máximo de ${maxSizeMB}MB.`,
        placement: "bottomRight",
      });
      return false;
    }

    // Validar dimensiones de la imagen
    return new Promise<boolean>((resolve) => {
      const image = new Image();
      image.src = URL.createObjectURL(file);
      
      image.onload = () => {
        URL.revokeObjectURL(image.src);
        
        if (image.width !== expectedWidth || image.height !== expectedHeight) {
          notification.error({
            message: "Dimensiones incorrectas",
            description: `${file.name} debe tener exactamente ${expectedWidth}x${expectedHeight}px. Dimensiones actuales: ${image.width}x${image.height}px.`,
            placement: "bottomRight",
          });
          resolve(false);
        } else {
          resolve(true);
        }
      };
      
      image.onerror = () => {
        URL.revokeObjectURL(image.src);
        notification.error({
          message: "Error al procesar imagen",
          description: `No se pudo leer el archivo ${file.name} para validación.`,
          placement: "bottomRight",
        });
        resolve(false);
      };
    });
  };

  const handleGroupImagePreview = (url: string, title: string) => {
    setPreviewImage(url);
    setPreviewTitle(title);
    setPreviewVisible(true);
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
    if (setVideoUrl) {
    setVideoUrl(url);
    }
    formRef?.setFieldsValue({ videoUrl: url });
    videoUrlRef.current = url;
  };

  // Manejar preparación de imagen principal (sin subir inmediatamente)
  const handleThumbUpload = async (file: RcFile) => {
    try {
      // Validar la imagen
      const isValid = await validateImage(file, THUMB_WIDTH, THUMB_HEIGHT);
      if (!isValid) {
        return false;
      }
      
      // Generar vista previa local usando base64
      const previewUrl = await getBase64(file);
      
      // Crear un objeto de archivo para almacenar localmente (sin subir aún)
      const localFile: UploadFile = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: previewUrl, // Usar base64 para vista previa local
        thumbUrl: previewUrl,
        preview: previewUrl as string,
        originFileObj: file, // Mantener referencia al archivo original para subir después
      };
      
      // Establecer como imagen principal local
      setThumbImage(localFile);
      
      notification.success({
        message: "Imagen principal preparada",
        description: `"${file.name}" está lista para subir al crear el producto.`,
        placement: "bottomRight",
      });
      
      console.log("Imagen principal preparada localmente:", file.name);
    } catch (error) {
      console.error("Error preparando imagen principal:", error);
      notification.error({
        message: "Error de preparación",
        description: `Error al preparar "${file.name}". ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        placement: "bottomRight",
      });
    }
    
    return false; // Prevenir comportamiento por defecto de Upload
  };

  // Manejar preparación de imágenes de carrusel (sin subir inmediatamente)
  const handleCarouselUpload = async (file: RcFile) => {
    try {
      // Verificar límite de imágenes
      if (carouselImages.length >= 8) {
        notification.warning({
          message: "Límite alcanzado",
          description: "Has alcanzado el máximo de 8 imágenes para el carrusel.",
          placement: "bottomRight",
        });
        return false;
      }
      
      // Validar la imagen
      const isValid = await validateImage(file, CAROUSEL_WIDTH, CAROUSEL_HEIGHT);
      if (!isValid) {
        return false;
      }
      
      // Generar vista previa local usando base64
      const previewUrl = await getBase64(file);
      
      // Crear un objeto de archivo para almacenar localmente (sin subir aún)
      const localFile: UploadFile = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: previewUrl, // Usar base64 para vista previa local
        thumbUrl: previewUrl,
        preview: previewUrl as string,
        originFileObj: file, // Mantener referencia al archivo original para subir después
      };
      
      // Agregar al carrusel localmente
      setCarouselImages(prev => [...prev, localFile]);
      
      notification.success({
        message: "Imagen de carrusel preparada",
        description: `"${file.name}" está lista para subir al crear el producto.`,
        placement: "bottomRight",
      });
      
      console.log("Imagen de carrusel preparada localmente:", file.name);
    } catch (error) {
      console.error("Error preparando imagen de carrusel:", error);
      notification.error({
        message: "Error de preparación",
        description: `Error al preparar "${file.name}". ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        placement: "bottomRight",
      });
    }
    
    return false; // Prevenir comportamiento por defecto de Upload
  };

  // Eliminar imagen principal
  const handleRemoveThumb = async () => {
    if (thumbImage) {
      setThumbImage(null);
      
      notification.success({
        message: "Imagen principal eliminada",
        description: "Se ha eliminado la imagen principal de la lista.",
        placement: "bottomRight",
      });
    }
  };

  // Eliminar imagen de carrusel
  const handleRemoveCarouselImage = async (uid: string) => {
    // Remover de la lista local
    setCarouselImages(prev => prev.filter(img => img.uid !== uid));
    
    notification.success({
      message: "Imagen de carrusel eliminada",
      description: "Se ha eliminado la imagen del carrusel de la lista.",
      placement: "bottomRight",
    });
  };

  // Promover imagen de carrusel a principal
  const promoteToThumb = (index: number) => {
    const selectedImage = carouselImages[index];
    const oldThumb = thumbImage;
    
    // Establecer la imagen seleccionada como principal
    setThumbImage(selectedImage);
    
    // Eliminar la imagen seleccionada del carrusel
    const newCarousel = carouselImages.filter((_, i) => i !== index);
    
    // Si había una imagen principal, añadirla al carrusel
    if (oldThumb) {
      newCarousel.unshift(oldThumb);
    }
    
    setCarouselImages(newCarousel);
    
    notification.success({
      message: "Imagen principal actualizada",
      description: "Se ha cambiado la imagen principal",
      placement: "bottomRight",
    });
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

      {/* Campos ocultos para almacenar las URLs */}
      <Form.Item name="thumb" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="carousel" hidden>
        <Input />
      </Form.Item>

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
                onFocus={() => setActiveField("useGroupImages")}
                onBlur={() => setActiveField(null)}
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
                  name="useGroupImages"
                  valuePropName="checked"
                >
                  <div className="flex items-center">
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Switch
                        checked={useGroupImages}
                        onChange={(checked) => {
                          setUseGroupImages(checked);
                          if (!checked) {
                            formRef?.setFieldsValue({ imageGroup: undefined });
                            setSelectedGroup(null);
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
                    <div
                      onFocus={() => setActiveField("imageGroup")}
                      onBlur={() => setActiveField(null)}
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
                        onChange={(selectedGroupId) => {
                            const selected = imageGroups?.data?.groups?.find(
                            (group: ImageGroup) => group._id === selectedGroupId
                          );
                            setSelectedGroup(selected || null);
                          notification.success({
                            message: "Grupo de Imágenes Seleccionado",
                            description: `Grupo '${
                                selected?.identifier || ""
                            }' seleccionado.`,
                            placement: "bottomRight",
                          });
                        }}
                          allowClear
                          onClear={() => setSelectedGroup(null)}
                      />
                    </Form.Item>
                    </div>

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

                    {selectedGroup && (
                            <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <Text strong>Vista previa de imágenes del grupo</Text>
                          <Badge
                            count={`${(selectedGroup.carousel?.length || 0) + (selectedGroup.thumb ? 1 : 0)} imágenes`}
                            style={{ backgroundColor: "#1890ff" }}
                          />
                        </div>
                        
                        {/* Thumbnail (Main image) */}
                        {selectedGroup.thumb && (
                          <div className="mb-4">
                            <Text strong className="mb-2 block">Imagen Principal (Miniatura)</Text>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="relative w-full max-w-xs mx-auto"
                            >
                              <div
                                className="rounded-lg overflow-hidden border border-green-500 aspect-square bg-gray-100 cursor-pointer shadow-md"
                                onClick={() => handleGroupImagePreview(selectedGroup.thumb!, "Imagen Principal")}
                            >
                              <img
                                  src={selectedGroup.thumb}
                                  alt="Imagen Principal"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                      const placeholder = document.createElement("div");
                                      placeholder.className = "w-full h-full flex items-center justify-center bg-gray-200";
                                    placeholder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
                                    parent.appendChild(placeholder);
                                  }
                                }}
                              />
                              <div className="absolute top-2 right-2">
                                <Badge
                                    count="Principal"
                                    style={{ backgroundColor: "#52c41a" }}
                                  />
                                </div>
                                <div className="absolute bottom-2 right-2">
                                  <motion.div
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Tooltip title="Ver imagen">
                                      <button
                                        type="button"
                                        className="bg-white rounded-full p-1 shadow-md text-blue-500 hover:text-blue-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleGroupImagePreview(selectedGroup.thumb!, "Imagen Principal");
                                        }}
                                      >
                                        <EyeOutlined />
                                      </button>
                                    </Tooltip>
                                  </motion.div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        )}
                        
                        {/* Carousel images */}
                        {selectedGroup.carousel && selectedGroup.carousel.length > 0 && (
                          <div>
                            <Text strong className="mb-2 block">Imágenes de Carrusel</Text>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {selectedGroup.carousel.map((imageUrl, index) => (
                                <motion.div
                                  key={`carousel-${index}`}
                                  whileHover={{ scale: 1.05 }}
                                  className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-100 cursor-pointer"
                                  onClick={() => handleGroupImagePreview(imageUrl, `Imagen de carrusel ${index + 1}`)}
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`Imagen de carrusel ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      const parent = target.parentElement;
                                      if (parent) {
                                        const placeholder = document.createElement("div");
                                        placeholder.className = "w-full h-full flex items-center justify-center bg-gray-200";
                                        placeholder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
                                        parent.appendChild(placeholder);
                                      }
                                    }}
                                  />
                                  <div className="absolute top-2 right-2">
                                    <Badge
                                      count={`#${index + 1}`}
                                  style={{ backgroundColor: "#1890ff" }}
                                />
                              </div>
                                  <div className="absolute bottom-2 right-2">
                                    <motion.div
                                      whileHover={{ scale: 1.2 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Tooltip title="Ver imagen">
                                        <button
                                          type="button"
                                          className="bg-white rounded-full p-1 shadow-md text-blue-500 hover:text-blue-700"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleGroupImagePreview(imageUrl, `Imagen de carrusel ${index + 1}`);
                                          }}
                                        >
                                          <EyeOutlined />
                                        </button>
                                      </Tooltip>
                            </motion.div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {!selectedGroup.thumb && (!selectedGroup.carousel || selectedGroup.carousel.length === 0) && (
                          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <Text type="secondary">Este grupo no tiene imágenes definidas.</Text>
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    {!selectedGroup && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                        {Array.from({ length: 4 }).map((_, index) => (
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
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="individualImages"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Row gutter={[24, 24]}>
                      {/* Columna de Imagen Principal (Thumb) */}
                      <Col xs={24} md={12}>
                        <Card 
                          title={
                            <div className="flex items-center">
                              <PictureOutlined className="mr-2 text-green-500" />
                              <span>Imagen Principal</span>
                              <Badge 
                                count="Thumb" 
                                style={{ 
                                  backgroundColor: '#52c41a',
                                  marginLeft: '8px'
                                }} 
                              />
                            </div>
                          }
                          className="shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="mb-2">
                            <Text type="secondary">
                              Esta imagen se usará como miniatura principal del producto. Debe tener exactamente 300x300px.
                            </Text>
                          </div>
                          
                    <Form.Item
                            name="thumb"
                      rules={[
                        {
                                required: !useGroupImages && !thumbImage,
                                message: "Por favor suba una imagen principal",
                        },
                      ]}
                          >
                            {thumbImage ? (
                              <div className="mb-4">
                                <div className="relative">
                                  <div 
                                    className="aspect-square rounded-lg overflow-hidden border-2 border-green-500 bg-gray-50 cursor-pointer"
                                    onClick={() => handlePreview(thumbImage)}
                      >
                                    <img
                                      src={thumbImage.url || thumbImage.thumbUrl || (thumbImage.preview as string)}
                                      alt="Imagen principal"
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="absolute top-2 right-2 flex space-x-1">
                                    <Tooltip title="Ver imagen">
                                      <Button
                                        type="default"
                                        shape="circle"
                                        icon={<EyeOutlined />}
                                        onClick={() => handlePreview(thumbImage)}
                                        className="shadow-md"
                                      />
                                    </Tooltip>
                                    <Tooltip title="Eliminar imagen">
                                      <Button
                                        type="default"
                                        shape="circle"
                                        icon={<DeleteOutlined />}
                                        onClick={handleRemoveThumb}
                                        className="shadow-md"
                                        danger
                                      />
                                    </Tooltip>
                                  </div>
                                </div>
                                <Text type="secondary" className="block mt-2 text-center">
                                  {thumbImage.name}
                                </Text>
                              </div>
                            ) : (
                              <Upload.Dragger
                                beforeUpload={handleThumbUpload}
                                showUploadList={false}
                          accept="image/*"
                                className="bg-gray-50 hover:bg-gray-100 transition-colors"
                                multiple={false}
                            >
                              <p className="ant-upload-drag-icon">
                                  <CloudUploadOutlined style={{ fontSize: 48, color: "#52c41a" }} />
                              </p>
                                <p className="ant-upload-text">
                                  Haga clic o arrastre una imagen aquí
                            </p>
                                <p className="ant-upload-hint">
                                  Soporte para JPG, PNG, GIF o WEBP. Debe ser exactamente de 300x300px. Máx. 2MB
                            </p>
                              </Upload.Dragger>
                            )}
                    </Form.Item>
                        </Card>
                      </Col>
                      
                      {/* Columna de Imágenes del Carrusel */}
                      <Col xs={24} md={12}>
                        <Card 
                          title={
                            <div className="flex items-center">
                              <PictureOutlined className="mr-2 text-blue-500" />
                              <span>Imágenes del Carrusel</span>
                          <Badge
                                count={`Máx. 8`} 
                                style={{ 
                                  backgroundColor: '#1890ff',
                                  marginLeft: '8px'
                                }} 
                          />
                        </div>
                          }
                          className="shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="mb-2">
                            <Text type="secondary">
                              Estas imágenes se mostrarán en el carrusel del producto. Cada imagen debe tener exactamente 600x600px.
                            </Text>
                          </div>
                          
                          <Form.Item name="carousel">
                            <Upload.Dragger
                              beforeUpload={handleCarouselUpload}
                              showUploadList={false}
                              accept="image/*"
                              className="bg-gray-50 hover:bg-gray-100 transition-colors"
                              disabled={carouselImages.length >= 8}
                              multiple={true}
                            >
                              <p className="ant-upload-drag-icon">
                                <CloudUploadOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                              </p>
                              <p className="ant-upload-text">
                                Haga clic o arrastre imágenes aquí
                              </p>
                              <p className="ant-upload-hint">
                                Soporte para JPG, PNG, GIF o WEBP. Debe ser exactamente de 600x600px. Máx. 2MB
                              </p>
                              {carouselImages.length >= 8 && (
                                <Alert
                                  message="Límite alcanzado"
                                  description="Has alcanzado el máximo de 8 imágenes para el carrusel"
                                  type="warning"
                                  showIcon
                                  className="mt-4"
                                />
                              )}
                            </Upload.Dragger>
                          </Form.Item>
                          
                          {/* Previsualización de imágenes del carrusel */}
                          {carouselImages.length > 0 && (
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-2">
                                <Text strong>Imágenes del carrusel</Text>
                                <Badge count={`${carouselImages.length}/8`} style={{ backgroundColor: "#1890ff" }} />
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {carouselImages.map((file, index) => (
                            <motion.div
                              key={file.uid}
                              whileHover={{ scale: 1.05 }}
                              className="relative"
                            >
                              <div
                                className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer"
                                      onClick={() => handlePreview(file)}
                              >
                                <img
                                        src={file.url || file.thumbUrl || (file.preview as string)}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute top-2 right-2 flex space-x-1">
                                  <Tooltip title="Ver imagen">
                                        <Button
                                          type="default"
                                          shape="circle"
                                          size="small"
                                          icon={<EyeOutlined />}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePreview(file);
                                          }}
                                          className="shadow-md"
                                        />
                                  </Tooltip>
                                  <Tooltip title="Eliminar imagen">
                                        <Button
                                          type="default"
                                          shape="circle"
                                          size="small"
                                          icon={<DeleteOutlined />}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveCarouselImage(file.uid);
                                          }}
                                          className="shadow-md"
                                          danger
                                        />
                                  </Tooltip>
                              </div>
                                <div className="absolute bottom-2 left-2">
                                      <Tooltip title="Establecer como imagen principal">
                                        <Button
                                          type="primary"
                                          size="small"
                                          icon={<PictureOutlined />}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            promoteToThumb(index);
                                          }}
                                        >
                                          Principal
                                        </Button>
                                      </Tooltip>
                                </div>
                            </motion.div>
                          ))}
                        </div>
                            </div>
                    )}
                        </Card>
                      </Col>
                    </Row>
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
                onFocus={() => setActiveField("videoUrl")}
                onBlur={() => setActiveField(null)}
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

      {/* Progreso de subida (igual que en CreateGroupModal) */}
      {isUploading && Object.keys(uploadProgress).length > 0 && (
        <Card size="small" bordered className="mt-6 bg-gray-50">
          <Title level={5} style={{ marginBottom: 12, textAlign: "center" }}>
            Subiendo Imágenes a Google Cloud Storage
          </Title>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <Text ellipsis style={{ maxWidth: "65%" }} className="text-sm">
                  {fileName}
                </Text>
                <Text type="secondary" className="text-sm">
                  {progress}%
                </Text>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
          {Object.keys(uploadProgress).length > 1 && (
            <>
              <div className="border-t border-gray-300 my-4" />
              <div className="flex justify-between items-center mb-1">
                <Text strong className="text-base">
                  Progreso Total
                </Text>
                <Text strong className="text-base">
                  {totalUploadProgress}%
                </Text>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    totalUploadProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${totalUploadProgress}%` }}
                />
              </div>
            </>
          )}
        </Card>
      )}

      <Modal
        open={previewVisible}
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
        open={videoPreviewVisible}
        title="Vista previa del video"
        footer={null}
        onCancel={() => setVideoPreviewVisible(false)}
        width={800}
        centered
        destroyOnClose
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
