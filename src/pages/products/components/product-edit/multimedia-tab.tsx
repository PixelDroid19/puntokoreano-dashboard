import { useState, useEffect } from "react"
import { Form, Switch, Select, Card, Button, Tooltip, Space, Alert, Upload, message, Input, Modal } from "antd"
import { PictureOutlined, EyeOutlined, InboxOutlined, DeleteOutlined, CloudUploadOutlined } from "@ant-design/icons"
import { Product } from "../../../../api/types"
import type { RcFile, UploadFile as AntUploadFile } from "antd/es/upload"
import { motion } from "framer-motion"
import StorageService from "../../../../services/storage.service"

// Constantes para validación de imágenes
const THUMB_WIDTH = 300
const THUMB_HEIGHT = 300
const CAROUSEL_WIDTH = 600
const CAROUSEL_HEIGHT = 600
const MAX_IMAGE_SIZE_MB = 2
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
// Tolerancia para dimensiones (5% de diferencia permitida)
const DIMENSION_TOLERANCE_PERCENT = 5

// Interfaz extendida para archivos con referencia local
interface UploadFile extends AntUploadFile<any> {
  localFile?: File;
}

interface MultimediaTabProps {
  productData: Product | undefined
  useGroupImages: boolean
  setUseGroupImages: (value: boolean) => void
  imageGroupsData: any
  form: any
  onUploadPendingImagesRef?: React.MutableRefObject<(() => Promise<{
    thumbUrl?: string;
    carouselUrls: string[];
  }>) | null>;
  onImageChange?: (type: 'thumb' | 'carousel') => void;
}

const getBase64 = (file: RcFile): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

const MultimediaTab: React.FC<MultimediaTabProps> = ({
  productData,
  useGroupImages,
  setUseGroupImages,
  imageGroupsData,
  form,
  onUploadPendingImagesRef,
  onImageChange,
}) => {
  const [thumbImage, setThumbImage] = useState<UploadFile | null>(null)
  const [carouselImages, setCarouselImages] = useState<UploadFile[]>([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>("")
  const [previewTitle, setPreviewTitle] = useState<string>("")
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [uploading, setUploading] = useState(false)

  // Inicializar con datos del producto
  useEffect(() => {
    if (productData) {
      console.log("Datos del producto en MultimediaTab:", productData)
      
      // Establecer videoUrl
      if (productData.videoUrl) {
        setVideoUrl(productData.videoUrl)
        form.setFieldValue("videoUrl", productData.videoUrl)
      }

      // Si no usa grupo de imágenes, inicializar thumb y carousel
      if (!productData.useGroupImages) {
        // Inicializar thumbImage si existe
        if (productData.thumb) {
          const thumbFile: UploadFile = {
            uid: "thumb",
            name: "Imagen principal",
            status: "done",
            url: productData.thumb,
            thumbUrl: productData.thumb,
          }
          setThumbImage(thumbFile)
          form.setFieldValue("thumb", productData.thumb)
        }

        // Inicializar carouselImages si existen
        if (productData.carousel && productData.carousel.length > 0) {
          console.log("Imágenes del carrusel recibidas:", productData.carousel)
          const carouselFiles: UploadFile[] = productData.carousel.map((url, index) => ({
            uid: `carousel-${index}`,
            name: `Imagen ${index + 1}`,
            status: "done",
            url: url,
            thumbUrl: url,
          }))
          setCarouselImages(carouselFiles)
          form.setFieldValue("carousel", productData.carousel)
        } else {
          console.log("No se encontraron imágenes del carrusel")
          setCarouselImages([])
        }
      }
    }
  }, [productData, form])

  // Actualizar campos ocultos del formulario cuando cambien las imágenes
  useEffect(() => {
    if (thumbImage && thumbImage.url) {
      form.setFieldValue("thumb", thumbImage.url)
    } else {
      form.setFieldValue("thumb", undefined)
    }

    if (carouselImages.length > 0) {
      const carouselUrls = carouselImages.filter(img => img.url).map(img => img.url)
      form.setFieldValue("carousel", carouselUrls)
      console.log("URLs del carrusel actualizadas:", carouselUrls)
    } else {
      form.setFieldValue("carousel", [])
    }
  }, [thumbImage, carouselImages, form])

  // Validar imagen
  const validateImage = async (file: RcFile, expectedWidth: number, expectedHeight: number): Promise<boolean> => {
    // Validar tipo de archivo
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      message.error(`${file.name} no es un formato válido (JPG, PNG, GIF, WEBP).`)
      return false
    }

    // Validar tamaño del archivo
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      message.error(`${file.name} excede el tamaño máximo de ${MAX_IMAGE_SIZE_MB}MB.`)
      return false
    }

    // Validar dimensiones de la imagen
    return new Promise<boolean>((resolve) => {
      const image = new Image()
      image.src = URL.createObjectURL(file)
      
      image.onload = () => {
        URL.revokeObjectURL(image.src)
        
        // Calcular tolerancia permitida
        const widthTolerance = expectedWidth * DIMENSION_TOLERANCE_PERCENT / 100
        const heightTolerance = expectedHeight * DIMENSION_TOLERANCE_PERCENT / 100
        
        // Verificar si las dimensiones están dentro del rango permitido
        const widthInRange = Math.abs(image.width - expectedWidth) <= widthTolerance
        const heightInRange = Math.abs(image.height - expectedHeight) <= heightTolerance
        
        if (!widthInRange || !heightInRange) {
          message.error(
            <div>
              <div>{`${file.name} tiene dimensiones incorrectas:`}</div>
              <div>{`Actual: ${image.width}x${image.height}px`}</div>
              <div>{`Requerido: ${expectedWidth}x${expectedHeight}px (±${DIMENSION_TOLERANCE_PERCENT}%)`}</div>
              <div>{`Rango permitido: ${Math.round(expectedWidth - widthTolerance)}-${Math.round(expectedWidth + widthTolerance)} x ${Math.round(expectedHeight - heightTolerance)}-${Math.round(expectedHeight + heightTolerance)}px`}</div>
            </div>
          )
          resolve(false)
        } else {
          if (image.width !== expectedWidth || image.height !== expectedHeight) {
            message.warning(
              <div>
                <div>{`La imagen ${file.name} tiene dimensiones ligeramente diferentes a las ideales:`}</div>
                <div>{`Actual: ${image.width}x${image.height}px`}</div>
                <div>{`Ideal: ${expectedWidth}x${expectedHeight}px`}</div>
                <div>La imagen se aceptará, pero se recomienda usar las dimensiones exactas.</div>
              </div>
            )
          }
          resolve(true)
        }
      }
      
      image.onerror = () => {
        URL.revokeObjectURL(image.src)
        message.error(`No se pudo leer el archivo ${file.name} para validación.`)
        resolve(false)
      }
    })
  }

  // Manejar previsualización de imagen
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile)
    }
    setPreviewImage(file.url || (file.preview as string))
    setPreviewVisible(true)
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1))
  }

  // Manejar subida de imagen principal
  const handleThumbUpload = async (file: RcFile) => {
    try {
      // Validar la imagen
      const isValid = await validateImage(file, THUMB_WIDTH, THUMB_HEIGHT)
      if (!isValid) {
        return false
      }
      
      // Mostrar una vista previa antes de subir
      const previewUrl = await getBase64(file)
      
      // Crear un objeto de archivo temporal para mostrar mientras se sube
      const tempFile: UploadFile = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        percent: 100,
        preview: previewUrl,
        originFileObj: file,
        localFile: file // Guardamos el archivo original para subirlo después
      }
      
      // Establecer como imagen principal temporal
      setThumbImage(tempFile)
      message.success(`${file.name} preparado como imagen principal`)
      
      // Notificar al componente padre sobre el cambio
      onImageChange && onImageChange('thumb');
      
    } catch (error) {
      console.error("Error al procesar la imagen principal:", error)
      setThumbImage(null)
      message.error("No se pudo procesar la imagen principal")
    }
    
    return false // Prevenir comportamiento por defecto
  }

  // Manejar subida de imágenes de carrusel
  const handleCarouselUpload = async (file: RcFile) => {
    try {
      // Verificar límite de imágenes
      if (carouselImages.length >= 8) {
        message.warning("Has alcanzado el máximo de 8 imágenes para el carrusel")
        return false
      }
      
      // Validar la imagen
      const isValid = await validateImage(file, CAROUSEL_WIDTH, CAROUSEL_HEIGHT)
      if (!isValid) {
        return false
      }
      
      // Mostrar una vista previa antes de subir
      const previewUrl = await getBase64(file)
      
      // Crear un objeto de archivo temporal para mostrar mientras se sube
      const tempFile: UploadFile = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        percent: 100,
        preview: previewUrl,
        originFileObj: file,
        localFile: file // Guardamos el archivo original para subirlo después
      }
      
      // Agregar al carrusel temporalmente
      setCarouselImages(prev => [...prev, tempFile])
      message.success(`${file.name} preparado para el carrusel`)
      
      // Notificar al componente padre sobre el cambio
      onImageChange && onImageChange('carousel');
      
    } catch (error) {
      console.error("Error al procesar la imagen de carrusel:", error)
      message.error("No se pudo procesar la imagen al carrusel")
    }
    
    return false // Prevenir comportamiento por defecto
  }

  // Eliminar imagen principal
  const handleRemoveThumb = async () => {
    if (thumbImage) {
      // Si tiene URL de GCS, eliminarla del storage
      if (thumbImage.url && thumbImage.url.includes('storage.googleapis.com')) {
        try {
          await StorageService.deleteFileByUrl(thumbImage.url);
          message.success("Imagen eliminada de Google Cloud Storage");
        } catch (error) {
          console.error('Error al eliminar imagen de GCS:', error);
          message.warning("Imagen removida localmente, pero no se pudo eliminar del almacenamiento");
        }
      }
      
      setThumbImage(null)
      message.info("Se ha eliminado la imagen principal")
      
      // Notificar al componente padre sobre el cambio
      onImageChange && onImageChange('thumb');
    }
  }

  // Eliminar imagen de carrusel
  const handleRemoveCarouselImage = async (uid: string) => {
    // Encontrar la imagen para obtener su URL
    const imageToRemove = carouselImages.find(img => img.uid === uid)
    
    // Si tiene URL de GCS, eliminarla del storage
    if (imageToRemove && imageToRemove.url && imageToRemove.url.includes('storage.googleapis.com')) {
      try {
        await StorageService.deleteFileByUrl(imageToRemove.url);
        message.success("Imagen eliminada de Google Cloud Storage");
      } catch (error) {
        console.error('Error al eliminar imagen de GCS:', error);
        message.warning("Imagen removida localmente, pero no se pudo eliminar del almacenamiento");
      }
    }
    
    setCarouselImages(prev => prev.filter(img => img.uid !== uid))
    message.info("Se ha eliminado la imagen del carrusel")
    
    // Notificar al componente padre sobre el cambio
    onImageChange && onImageChange('carousel');
  }

  // Promover imagen de carrusel a principal
  const promoteToThumb = (index: number) => {
    const selectedImage = carouselImages[index]
    const oldThumb = thumbImage
    
    // Establecer la imagen seleccionada como principal
    setThumbImage(selectedImage)
    
    // Eliminar la imagen seleccionada del carrusel
    const newCarousel = carouselImages.filter((_, i) => i !== index)
    
    // Si había una imagen principal, añadirla al carrusel
    if (oldThumb) {
      newCarousel.unshift(oldThumb)
    }
    
    setCarouselImages(newCarousel)
    message.success("Se ha cambiado la imagen principal")
    
    // Notificar al componente padre sobre el cambio (ambos tipos ya que afecta a ambos)
    onImageChange && onImageChange('thumb');
    onImageChange && onImageChange('carousel');
  }

  // Función para subir todas las imágenes pendientes
  const uploadPendingImages = async (): Promise<{
    thumbUrl?: string;
    carouselUrls: string[];
  }> => {
    setUploading(true);
    message.loading("Subiendo imágenes...", 0);
    
    try {
      // Resultado que devolveremos
      const result: {
        thumbUrl?: string;
        carouselUrls: string[];
      } = {
        thumbUrl: undefined,
        carouselUrls: []
      };
      
      // 1. Subir imagen principal si existe y tiene archivo local
      if (thumbImage?.localFile) {
        try {
          console.log("Subiendo imagen principal:", thumbImage.name);
          const uploadResult = await StorageService.uploadSingleFile(thumbImage.localFile, 'products/thumbnails');
          
          if (uploadResult && uploadResult.success) {
            result.thumbUrl = uploadResult.data?.url;
            
            // Actualizar el estado local con la URL real
            const updatedThumb: UploadFile = {
              ...thumbImage,
              status: 'done',
              url: uploadResult.data?.url,
              thumbUrl: uploadResult.data?.url,
            };
            
            setThumbImage(updatedThumb);
            form.setFieldValue("thumb", uploadResult.data?.url);
            console.log("Imagen principal subida exitosamente:", uploadResult.data?.url);
          } else {
            message.error(`Error al subir la imagen principal: ${thumbImage.name}`);
          }
        } catch (error) {
          console.error("Error al subir imagen principal:", error);
          message.error(`Error al subir la imagen principal: ${thumbImage.name}`);
        }
      } else if (thumbImage?.url) {
        // Si ya tiene URL, simplemente la usamos
        result.thumbUrl = thumbImage.url;
      }
      
      // 2. Subir imágenes del carrusel si existen y tienen archivos locales
      const updatedCarouselImages = [...carouselImages];
      
      // Procesar cada imagen del carrusel que tiene un archivo local
      for (let i = 0; i < updatedCarouselImages.length; i++) {
        const img = updatedCarouselImages[i];
        
        if (img.localFile) {
          try {
            console.log("Subiendo imagen de carrusel:", img.name);
            const uploadResult = await StorageService.uploadSingleFile(img.localFile, 'products/carousel');
            
            if (uploadResult && uploadResult.success) {
              // Actualizar la imagen con la URL real
              updatedCarouselImages[i] = {
                ...img,
                status: 'done',
                url: uploadResult.data?.url,
                thumbUrl: uploadResult.data?.url,
              };
              
              // Añadir la URL al resultado
              if (uploadResult.data?.url) {
                result.carouselUrls.push(uploadResult.data.url);
              }
              console.log("Imagen de carrusel subida exitosamente:", uploadResult.data?.url);
            } else {
              message.error(`Error al subir la imagen de carrusel: ${img.name}`);
            }
          } catch (error) {
            console.error(`Error al subir imagen de carrusel ${img.name}:`, error);
            message.error(`Error al subir la imagen de carrusel: ${img.name}`);
          }
        } else if (img.url) {
          // Si ya tiene URL, simplemente la usamos
          result.carouselUrls.push(img.url);
        }
      }
      
      // Actualizar el estado con las nuevas imágenes
      setCarouselImages(updatedCarouselImages);
      
      // Actualizar el campo oculto del formulario
      form.setFieldValue("carousel", result.carouselUrls);
      
      console.log("Imágenes subidas exitosamente:", result);
      return result;
    } catch (error) {
      console.error("Error al subir imágenes:", error);
      message.error("Error al subir imágenes");
      return { thumbUrl: undefined, carouselUrls: [] };
    } finally {
      setUploading(false);
      message.destroy(); // Quitar mensaje de carga
    }
  };
  
  // Exponer la función de subida de imágenes al componente padre
  useEffect(() => {
    if (onUploadPendingImagesRef) {
      onUploadPendingImagesRef.current = uploadPendingImages;
    }
  }, [thumbImage, carouselImages]);

  return (
    <div className="animate-fadeIn mt-4">
      {/* Campos ocultos para almacenar las URLs */}
      <Form.Item name="thumb" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="carousel" hidden>
        <Input />
      </Form.Item>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primero mostramos el componente de imágenes de carrusel y luego el de imagen principal */}
              {/* Columna de Imágenes del Carrusel */}
              <div className="flex flex-col h-full">
                <div className="mb-2 font-medium">
                  Imágenes del Carrusel (600x600px ±5%)
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Máx. 8
                  </span>
                </div>
                <div className="mb-2 text-sm text-gray-500">
                  Estas imágenes se mostrarán en el carrusel del producto.
                </div>
                
                {/* Previsualización de imágenes del carrusel - Mostramos primero la visualización */}
                {carouselImages.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">Imágenes del carrusel</div>
                      <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {carouselImages.length}/8
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                                icon={<EyeOutlined className="text-base" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreview(file);
                                }}
                                className="shadow-md flex items-center justify-center p-2 h-auto"
                              />
                            </Tooltip>
                            <Tooltip title="Eliminar imagen">
                              <Button
                                type="default"
                                icon={<DeleteOutlined className="text-base" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveCarouselImage(file.uid);
              }}
                                className="shadow-md flex items-center justify-center p-2 h-auto"
                                danger
                              />
                            </Tooltip>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <Tooltip title="Establecer como imagen principal">
                              <Button
                                type="primary"
                                size="small"
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
                
                {/* Componente para subir imágenes al carrusel - Después de la visualización */}
              <Upload.Dragger
                  beforeUpload={handleCarouselUpload}
                  showUploadList={false}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="bg-gray-50 hover:bg-gray-100 transition-colors mb-4 flex-grow"
                  disabled={carouselImages.length >= 8 || uploading}
                  multiple={true}
              >
                <p className="ant-upload-drag-icon">
                    <CloudUploadOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                </p>
                  <p className="ant-upload-text">
                    Haga clic o arrastre imágenes aquí
                  </p>
                  <p className="ant-upload-hint">
                    Soporte para JPG, PNG, GIF o WEBP. Dimensiones recomendadas: 600x600px (±5%). Máx. 2MB
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
              </div>

              {/* Columna de Imagen Principal (Thumb) */}
              <div className="flex flex-col h-full">
                <div className="mb-2 font-medium">Imagen Principal (300x300px ±5%)</div>
                <div className="mb-2 text-sm text-gray-500">
                  Esta imagen se usará como miniatura principal del producto.
                </div>
                
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
                            icon={<EyeOutlined className="text-base" />}
                            onClick={() => handlePreview(thumbImage)}
                            className="shadow-md flex items-center justify-center p-2 h-auto"
                          />
                        </Tooltip>
                        <Tooltip title="Eliminar imagen">
                          <Button
                            type="default"
                            icon={<DeleteOutlined className="text-base" />}
                            onClick={handleRemoveThumb}
                            className="shadow-md flex items-center justify-center p-2 h-auto"
                            danger
                          />
                        </Tooltip>
                      </div>
                    </div>
                    <div className="mt-2 text-center text-sm text-gray-500">
                      {thumbImage.name}
                    </div>
                  </div>
                ) : (
                  <Upload.Dragger
                    beforeUpload={handleThumbUpload}
                    showUploadList={false}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="bg-gray-50 hover:bg-gray-100 transition-colors flex-grow"
                    multiple={false}
                    disabled={uploading}
                  >
                    <p className="ant-upload-drag-icon">
                      <CloudUploadOutlined style={{ fontSize: 48, color: "#52c41a" }} />
                    </p>
                    <p className="ant-upload-text">
                      Haga clic o arrastre una imagen aquí
                    </p>
                    <p className="ant-upload-hint">
                      Soporte para JPG, PNG, GIF o WEBP. Dimensiones recomendadas: 300x300px (±5%). Máx. 2MB
                    </p>
                  </Upload.Dragger>
                )}
              </div>
            </div>
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
          <Input 
            placeholder="https://..." 
            className="rounded-md" 
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(e.target.value)
              form.setFieldsValue({ videoUrl: e.target.value })
            }}
          />
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

      {/* Modal de previsualización de imagen */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="Vista previa" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  )
}

export default MultimediaTab
