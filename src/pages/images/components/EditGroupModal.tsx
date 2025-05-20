// components/EditGroupModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
  notification,
  Typography,
  Space,
  Divider,
  Card,
  Tabs,
  Row,
  Col,
  Image,
  Popconfirm
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  InboxOutlined,
  LinkOutlined,
  FileImageOutlined,
  PictureOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined
} from "@ant-design/icons";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import { ImageGroup } from "../../../services/files.service";
import "./EditGroupModal.css";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface EditGroupModalProps {
  group: ImageGroup | null;
  visible: boolean;
  onClose: () => void;
  onUpdate: (values: any) => Promise<void>;
  onAddImages: (files: File[]) => Promise<void>;
  onDeleteImage?: (type: 'thumb' | 'carousel', index?: number) => Promise<void>;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  group,
  visible,
  onClose,
  onUpdate,
  onAddImages,
  onDeleteImage
}) => {
  const [form] = Form.useForm();
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [thumbFile, setThumbFile] = useState<UploadFile | null>(null);
  const [carouselUrls, setCarouselUrls] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("info");

  // Reset form on open
  useEffect(() => {
    if (visible && group) {
      form.setFieldsValue({
        identifier: group.identifier,
        description: group.description || "",
        carouselUrls: "",
      });
      setUploadedFiles([]);
      setThumbFile(null);
      setCarouselUrls([]);
    }
  }, [visible, group, form]);

  // Handle form submit
  const handleSubmit = async () => {
    if (!group) return;
    
    try {
      setUpdating(true);
      const values = await form.validateFields(['description']);
      
      // Solo enviar la descripción para actualizar
      await onUpdate({
        description: values.description
      });
      
      notification.success({
        message: "Grupo actualizado",
        description: "La información del grupo se actualizó correctamente",
      });
      setActiveTab("info");
    } catch (error: any) {
      notification.error({
        message: "Error al actualizar",
        description: error.message || "No se pudo actualizar el grupo",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Handle carousel files upload
  const handleUploadCarouselFiles = async () => {
    if (!group || uploadedFiles.length === 0) {
      notification.warning({
        message: "No hay imágenes seleccionadas",
        description: "Por favor, seleccione al menos una imagen para subir",
      });
      return;
    }
    try {
      setUploading(true);
      // Extraer los archivos de File de los UploadFile
      const files = uploadedFiles
        .filter((file) => file.originFileObj)
        .map((file) => file.originFileObj as File);

      // Validar que haya archivos válidos
      if (files.length === 0) {
        notification.warning({
          message: "No hay archivos válidos",
          description: "Los archivos seleccionados no son válidos",
        });
        setUploading(false);
        return;
      }

      // Llamar a la función de añadir imágenes
      await onAddImages(files);
      
      notification.success({
        message: "Imágenes subidas",
        description: "Las imágenes se subieron correctamente al carrusel",
      });
      setUploadedFiles([]);
    } catch (error: any) {
      notification.error({
        message: "Error al subir imágenes",
        description: error.message || "No se pudieron subir las imágenes",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle thumbnail upload
  const handleUploadThumb = async () => {
    if (!thumbFile?.originFileObj || !group) {
      notification.warning({
        message: "No hay imagen seleccionada",
        description: "Por favor, seleccione una imagen para la miniatura",
      });
      return;
    }
    try {
      setUploading(true);
      // Crear un FormData y añadir el archivo de miniatura
      const formData = new FormData();
      formData.append('thumb', thumbFile.originFileObj);
      
      // Pasar el archivo directamente
      await onUpdate({
        thumb: thumbFile.originFileObj
      });
      
      notification.success({
        message: "Miniatura actualizada",
        description: "La imagen de miniatura se actualizó correctamente",
      });
      setThumbFile(null);
    } catch (error: any) {
      notification.error({
        message: "Error al actualizar miniatura",
        description: error.message || "No se pudo actualizar la miniatura",
      });
    } finally {
      setUploading(false);
    }
  };
  
  // Handle carousel URL upload
  const handleAddCarouselUrls = async () => {
    if (!group) return;

    try {
      const values = await form.validateFields(['carouselUrls']);
      if (!values.carouselUrls) {
        notification.warning({
          message: "No hay URLs ingresadas",
          description: "Por favor, ingrese al menos una URL de imagen para añadir al carrusel"
        });
        return;
      }
      
      setUploading(true);
      const urlsArray = values.carouselUrls
        .split('\n')
        .map((url: string) => url.trim())
        .filter((url: string) => url);
        
      if (urlsArray.length === 0) {
        notification.warning({
          message: "No hay URLs válidas",
          description: "Por favor, ingrese URLs válidas (una por línea)"
        });
        setUploading(false);
        return;
      }
      
      // Pasar el array de URLs al servicio
      await onUpdate({ 
        carousel: urlsArray 
      });
      
      notification.success({
        message: "URLs añadidas",
        description: `Se añadieron ${urlsArray.length} imágenes al carrusel desde URLs`
      });
      
      form.resetFields(['carouselUrls']);
    } catch (error: any) {
      notification.error({
        message: "Error al añadir URLs",
        description: error.message || "No se pudieron añadir las URLs al carrusel"
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle delete carousel image
  const handleDeleteCarouselImage = async (index: number) => {
    if (!onDeleteImage || !group) return;
    
    try {
      await onDeleteImage('carousel', index);
      notification.success({
        message: "Imagen eliminada",
        description: "La imagen se eliminó correctamente del carrusel"
      });
    } catch (error: any) {
      notification.error({
        message: "Error al eliminar imagen",
        description: error.message || "No se pudo eliminar la imagen"
      });
    }
  };

  // Validate image file
  const validateImageFile = (file: RcFile) => {
    const isImage = /^image\/(jpeg|png|gif|webp)$/.test(file.type);
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) {
      notification.error({
        message: "Tipo de archivo no válido",
        description: "Solo se permiten imágenes (JPG, PNG, GIF, WEBP)",
      });
      return false;
    }
    if (!isLt2M) {
      notification.error({
        message: "Archivo demasiado grande",
        description: "La imagen debe ser menor a 2MB",
      });
      return false;
    }
    
    return isImage && isLt2M;
  };

  // Carousel file upload props
  const carouselUploadProps = {
    name: "file",
    multiple: true,
    listType: "picture" as const,
    onRemove: (file: UploadFile) => {
      setUploadedFiles((prev) => prev.filter((f) => f.uid !== file.uid));
    },
    beforeUpload: (file: RcFile) => {
      if (!validateImageFile(file)) {
        return Upload.LIST_IGNORE;
      }
      setUploadedFiles((prev) => [...prev, file as UploadFile]);
      return false;
    },
    fileList: uploadedFiles,
  };

  // Thumbnail upload props
  const thumbUploadProps = {
    name: "thumb",
    listType: "picture-card" as const,
    showUploadList: true,
    maxCount: 1,
    onRemove: () => {
      setThumbFile(null);
    },
    beforeUpload: (file: RcFile) => {
      if (!validateImageFile(file)) {
        return Upload.LIST_IGNORE;
      }
      // Crear objeto URL para previsualización
      const thumbUrl = URL.createObjectURL(file);
      setThumbFile({
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: thumbUrl,
        originFileObj: file,
      });
      return false;
    },
    fileList: thumbFile ? [thumbFile] : [],
  };

  return (
    <Modal
      title={
        <Space>
          <EditOutlined /> Editar Grupo: {group?.identifier}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="mt-4">
        <TabPane 
          tab={<span><EditOutlined /> Información</span>} 
          key="info"
        >
          <Form form={form} layout="vertical" className="mt-4">
            <Card>
              <Form.Item label="Identificador" name="identifier">
                <Input disabled />
              </Form.Item>
              <Form.Item 
                label="Descripción" 
                name="description"
                rules={[
                  { max: 200, message: "La descripción no puede exceder los 200 caracteres" }
                ]}
              >
                <TextArea 
                  rows={3} 
                  maxLength={200} 
                  showCount
                  placeholder="Descripción del grupo de imágenes"
                />
              </Form.Item>
              <div className="flex justify-end">
                <Button 
                  type="primary" 
                  onClick={handleSubmit} 
                  loading={updating}
                >
                  Actualizar Información
                </Button>
              </div>
            </Card>
          </Form>
        </TabPane>
        
        <TabPane 
          tab={<span><PictureOutlined /> Miniatura</span>} 
          key="thumb"
        >
          <div className="mt-4">
            <Card title="Actualizar Imagen Principal (Miniatura)">
              <Row gutter={[16, 16]}>
                {group?.thumb && (
                  <Col xs={24} md={12}>
                    <Card title="Miniatura Actual" className="h-full">
                      <div className="flex justify-center">
                        <Image 
                          src={group.thumb} 
                          alt="Miniatura actual" 
                          style={{ maxWidth: '100%', maxHeight: '200px' }}
                        />
                      </div>
                      <Text type="secondary" className="block text-center mt-2">
                        La nueva imagen reemplazará a esta (300x300px)
                      </Text>
                    </Card>
                  </Col>
                )}
                
                <Col xs={24} md={group?.thumb ? 12 : 24}>
                  <Card title="Nueva Miniatura" className="h-full">
                    <Text type="secondary" className="mb-4 block">
                      Suba una nueva imagen para reemplazar la miniatura actual (se redimensionará a 300x300px).
                    </Text>
                    <Upload {...thumbUploadProps}>
                      {!thumbFile && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Subir</div>
                        </div>
                      )}
                    </Upload>
                    <div className="flex justify-end mt-4">
                      <Button 
                        type="primary" 
                        icon={<UploadOutlined />} 
                        disabled={!thumbFile} 
                        loading={uploading}
                        onClick={handleUploadThumb}
                      >
                        Actualizar Miniatura
                      </Button>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>
          </div>
        </TabPane>
        
        <TabPane 
          tab={<span><FileImageOutlined /> Imágenes del Carrusel</span>} 
          key="carousel-all"
        >
          <div className="mt-2">
            <Row gutter={[12, 12]}>
              {/* Columna izquierda: Imágenes existentes */}
              <Col xs={24} md={12}>
                <Card 
                  title="Imágenes Existentes" 
                  className="h-full" 
                  style={{ maxHeight: "50vh", overflow: "auto" }}
                  bodyStyle={{ padding: '8px' }}
                  size="small"
                >
                  {group?.carousel && group.carousel.length > 0 ? (
                    <Row gutter={[8, 8]}>
                      {group.carousel.map((imageUrl, idx) => (
                        <Col key={`carousel-${idx}`} xs={24} sm={12}>
                          <Card
                            size="small"
                            style={{ marginBottom: '0' }}
                            cover={
                              <div className="flex justify-center items-center" style={{ height: '100px', overflow: 'hidden' }}>
                                <Image
                                  src={imageUrl}
                                  alt={`Carrusel ${idx + 1}`}
                                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                  preview={{
                                    mask: <EyeOutlined />,
                                  }}
                                />
                              </div>
                            }
                            actions={[
                              <Popconfirm
                                key="delete"
                                title="¿Eliminar esta imagen?"
                                description="Esta acción no se puede deshacer"
                                onConfirm={() => handleDeleteCarouselImage(idx)}
                                okText="Sí, eliminar"
                                cancelText="Cancelar"
                                okButtonProps={{ danger: true }}
                              >
                                <Button 
                                  type="text" 
                                  danger 
                                  icon={<DeleteOutlined />}
                                  size="small"
                                >
                                  Eliminar
                                </Button>
                              </Popconfirm>
                            ]}
                          >
                            <Card.Meta
                              title={`Imagen ${idx + 1}`}
                              description={<Text type="secondary" ellipsis className="block text-xs">600x600px</Text>}
                              style={{ padding: '0', margin: '0' }}
                            />
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <div className="text-center py-2">
                      <Text type="secondary">No hay imágenes en el carrusel</Text>
                    </div>
                  )}
                </Card>
              </Col>

              {/* Columna derecha: Añadir nuevas imágenes */}
              <Col xs={24} md={12}>
                <Card 
                  title="Añadir Nuevas Imágenes" 
                  className="h-full"
                  bodyStyle={{ padding: '8px' }}
                  size="small"
                >
                  <Tabs defaultActiveKey="files" size="small" tabBarStyle={{ marginBottom: '4px' }}>
                    <TabPane tab="Archivos" key="files">
                      <Upload.Dragger {...carouselUploadProps} style={{ minHeight: '80px', padding: '8px 0' }}>
                        <p className="ant-upload-drag-icon m-0">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text m-0">
                          Haga clic o arrastre archivos
                        </p>
                        <p className="ant-upload-hint text-xs m-0">
                          JPG, PNG, GIF, WEBP. Máx. 2MB
                        </p>
                      </Upload.Dragger>
                      <div className="flex justify-end mt-1">
                        <Button
                          type="primary"
                          size="small"
                          icon={<UploadOutlined />}
                          onClick={handleUploadCarouselFiles}
                          loading={uploading}
                          disabled={uploadedFiles.length === 0}
                        >
                          {uploading ? "Subiendo..." : "Subir"}
                        </Button>
                      </div>
                    </TabPane>
                    
                    <TabPane tab="URLs" key="urls">
                      <Form.Item 
                        name="carouselUrls" 
                        rules={[
                          { 
                            pattern: /^(https?:\/\/.*\.(jpeg|jpg|png|gif|webp))$/im, 
                            message: "Ingrese URLs válidas", 
                            validateTrigger: "onBlur" 
                          }
                        ]}
                        style={{ marginBottom: '4px' }}
                      >
                        <TextArea
                          rows={2}
                          placeholder="https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"
                        />
                      </Form.Item>
                      <div className="flex justify-end">
                        <Button
                          type="primary"
                          size="small"
                          icon={<LinkOutlined />}
                          onClick={handleAddCarouselUrls}
                          loading={uploading}
                        >
                          Añadir URLs
                        </Button>
                      </div>
                    </TabPane>
                  </Tabs>
                </Card>
              </Col>
            </Row>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default EditGroupModal;
