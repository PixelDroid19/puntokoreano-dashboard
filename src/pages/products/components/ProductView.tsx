import React, { useState, useRef, useEffect } from "react"; 
import {
  Modal,
  Image,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Typography,
  Tabs,
  Badge,
  Button,
  Spin, 
  Alert,
  Tooltip, 
  Rate,
  Divider,
  Upload,
  notification
} from "antd";
import type { Product } from "../../../api/types";
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import {
  ShoppingCartOutlined,
  TagOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  CarOutlined,
  HeartOutlined,
  HeartFilled,
  CheckCircleFilled,
  ShareAltOutlined,
  ZoomInOutlined,
  RightCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  PictureOutlined,
  CloudUploadOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import ProductsService from "../../../services/products.service";
import "./ProductView.css";

const { Title, Paragraph, Text } = Typography;

interface ProductViewProps {
  open: boolean;
  onClose: () => void;
  productId: string;
}

// Función auxiliar para convertir un archivo a base64
const getBase64 = (file: RcFile): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const ProductDetails: React.FC<{ product: Product }> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  // Preparar las imágenes para la galería
  const thumbImage = product.thumb || null;
  const carouselImages = product.carousel || [];
  
  // Todas las imágenes disponibles
  const allImages = thumbImage ? [thumbImage, ...carouselImages.filter(img => img !== thumbImage)] : carouselImages;

  // Fijar la primera imagen como seleccionada inicialmente si hay imágenes
  useEffect(() => {
    if (allImages.length > 0 && !selectedImage) {
      setSelectedImage(allImages[0]);
    }
  }, [allImages, selectedImage]);

  const handleImagePreview = (image: string, title: string = 'Imagen') => {
    setPreviewImage(image);
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

  const statusColor = product.active ? "green" : "red";
  const stockColor = product.stock > 10 ? "green" : product.stock > 0 ? "orange" : "red";

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null || isNaN(price)) return "-";
    return price.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const hasDiscount = product.discount?.isActive === true && product.discount?.percentage > 0;
  let finalPrice = product.price;
  
  if (hasDiscount && product.discount?.percentage) {
    // Calcularlo manualmente 
    finalPrice = Math.round(product.price * (1 - product.discount.percentage / 100));
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="product-details-container">
      {/* Header con título del producto y acciones rápidas */}
      <Card 
        bordered={false}
        className="header-card bg-gradient-to-r from-blue-100 to-indigo-100 border-0 shadow-sm mb-6 sticky top-0 z-10"
      >
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Title level={2} className="text-gray-800 m-0 font-bold">
              {product.name}
            </Title>
            <Space className="mt-2" wrap>
              <Text type="secondary" className="flex items-center text-gray-600">
                <TagOutlined className="mr-1 text-indigo-500" /> SKU: <span className="font-semibold">{product.code}</span>
              </Text>
              {product.active && (
                <Tag color="success" icon={<CheckCircleFilled />} className="px-3 py-1">
                  Producto Activo
                </Tag>
              )}
              {!product.active && (
                <Tag color="error" className="px-3 py-1">
                  Inactivo
                </Tag>
              )}
              <Tag color={stockColor} className="px-3 py-1">
                Stock: {product.stock}
              </Tag>
            </Space>
          </Col>
          <Col xs={24} md={8} className="flex justify-end gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                icon={isFavorite ? <HeartFilled className="text-red-500" /> : <HeartOutlined />} 
                size="large"
                onClick={toggleFavorite}
                className="rounded-full"
                ghost={!isFavorite}
                danger={isFavorite}
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                icon={<ShareAltOutlined />}
                size="large"
                className="rounded-full"
                ghost
              />
            </motion.div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Columna izquierda con imágenes */}
        <Col xs={24} md={12}>
          <Card
            bordered={false}
            className="images-card shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden"
            bodyStyle={{ padding: '16px' }}
          >
            {allImages.length > 0 ? (
              <>
                {/* Imagen Principal */}
                <div className="main-image-container relative overflow-hidden rounded-xl mb-4 bg-gradient-to-tr from-gray-50 to-white">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center items-center h-[400px] w-full"
                  >
                    <Image
                      src={selectedImage || allImages[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="object-contain max-h-[380px]"
                      preview={false}
                      onClick={() => handleImagePreview(selectedImage || allImages[0], 'Vista ampliada')}
                      fallback="/placeholder.svg"
                      style={{ 
                        transition: 'all 0.3s ease',
                        cursor: 'zoom-in' 
                      }}
                    />
                    <div className="absolute top-4 right-4 z-10">
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<ZoomInOutlined />}
                        onClick={() => handleImagePreview(selectedImage || allImages[0], 'Vista ampliada')}
                        className="shadow-md hover:shadow-lg"
                        size="large"
                      />
                    </div>
                    {hasDiscount && (
                      <div className="absolute top-4 left-4">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Badge.Ribbon 
                            text={`${product.discount.percentage}% OFF`}
                            color="red"
                            className="text-base font-bold py-1"
                          />
                        </motion.div>
                      </div>
                    )}
                    {selectedImage === product.thumb && product.thumb && (
                      <div className="absolute bottom-4 left-4">
                        <Tag color="green" icon={<PictureOutlined />} className="px-3 py-1 shadow-sm">
                          Imagen Principal
                        </Tag>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Miniaturas */}
                <div className="thumbnail-container mt-4 overflow-x-auto scrollbar-hide pb-2">
                  <div className="flex space-x-3">
                    {allImages.map((image, index) => (
                      <motion.div
                        key={`thumb-${index}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div 
                          className={`thumbnail-wrapper relative cursor-pointer overflow-hidden rounded-lg border-2 
                            ${selectedImage === image ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}`
                          }
                          onClick={() => setSelectedImage(image)}
                        >
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`thumbnail-${index}`}
                            width={80}
                            height={80}
                            className="object-cover transition-transform hover:scale-105"
                            preview={false}
                            fallback="/placeholder.svg"
                          />
                          {image === product.thumb && (
                            <div className="absolute top-0 left-0 w-full">
                              <Tag color="green" className="m-0 rounded-none text-xs px-1">
                                Principal
                              </Tag>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-xl">
                <EyeOutlined style={{ fontSize: 48 }} className="text-gray-400 mb-4" />
                <Text type="secondary" className="text-center">
                  No hay imágenes disponibles para este producto
                </Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Columna derecha con detalles */}
        <Col xs={24} md={12}>
          <Card
            bordered={false}
            className="details-card shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl"
            bodyStyle={{ padding: '24px' }}
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Sección de Precio */}
              <div className="price-section bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <div className="flex justify-between items-start">
                  <div>
                    <Title level={5} className="flex items-center text-gray-700 m-0 mb-2">
                      <TagOutlined className="mr-2 text-blue-500" /> Precio 
                    </Title>
                    <div className="flex flex-col">
                      {hasDiscount ? (
                        <>
                          <Text delete className="text-gray-400 text-lg">
                            {formatPrice(product.price)}
                          </Text>
                          <div className="flex items-center">
                            <Title level={2} className="text-red-500 m-0 mr-3 font-bold">
                              {formatPrice(finalPrice)}
                            </Title>
                            <Badge 
                              count={`-${product.discount.percentage}%`}
                              style={{ backgroundColor: '#ff4d4f', fontSize: '11px', fontWeight: 'bold' }}
                              className="ml-1"
                            />
                          </div>
                        </>
                      ) : (
                        <Title level={2} className="text-blue-700 m-0 mr-3 font-bold">
                          {formatPrice(product.price)}
                        </Title>
                      )}
                    </div>
                  </div>
                  {product.stock > 0 ? (
                    <Tag color="success" className="text-base px-3 py-1">
                      <CheckCircleFilled className="mr-1" /> En stock
                    </Tag>
                  ) : (
                    <Tag color="error" className="text-base px-3 py-1">
                      Agotado
                    </Tag>
                  )}
                </div>
              </div>

              <Divider className="my-2" />
              
              {/* Clasificación */}
              <div className="classification-section">
                <Title level={5} className="flex items-center text-gray-700 mb-3">
                  <InfoCircleOutlined className="mr-2 text-blue-500" /> Clasificación
                </Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card
                      size="small"
                      className="bg-indigo-50 border border-indigo-100 rounded-xl hover:shadow-md transition-all"
                    >
                      <Text strong className="block mb-1 text-indigo-700">
                        Grupo
                      </Text>
                      <Tag color="blue" className="text-sm px-3 py-1">
                        {product.group}
                      </Tag>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      size="small"
                      className="bg-cyan-50 border border-cyan-100 rounded-xl hover:shadow-md transition-all"
                    >
                      <Text strong className="block mb-1 text-cyan-700">
                        Subgrupo
                      </Text>
                      <Tag color="cyan" className="text-sm px-3 py-1">
                        {product.subgroup}
                      </Tag>
                    </Card>
                  </Col>
                </Row>
              </div>
              
              {/* Sección de vehículos compatibles */}
              {product.compatible_vehicles && product.compatible_vehicles.length > 0 && (
                <div className="vehicles-section bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <Title level={5} className="flex items-center text-indigo-800 mb-3">
                    <CarOutlined className="mr-2 text-indigo-600" /> Vehículos Compatibles
                  </Title>
                  <div className="flex flex-wrap gap-2">
                    {product.compatible_vehicles.map((vehicle, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Tag 
                          color="purple"
                          className="px-4 py-1.5 mb-2 rounded-full text-sm font-medium"
                          icon={<CarOutlined />}
                        >
                          {vehicle.line?.model?.name && vehicle.line?.name 
                            ? `${vehicle.line.model.name} ${vehicle.line.name}`
                            : vehicle.tag_id || `Vehículo ${index + 1}`}
                        </Tag>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Métodos de envío */}
              {product.shipping?.length > 0 && (
                <div className="shipping-section bg-green-50 p-4 rounded-xl border border-green-100">
                  <Title level={5} className="flex items-center text-green-800 mb-3">
                    <EnvironmentOutlined className="mr-2 text-green-600" /> Métodos de Envío
                  </Title>
                  <div className="flex flex-wrap gap-2">
                    {product.shipping.map((method, index) => {
                      let icon;
                      let color;
                      let label;
                      switch (method.toLowerCase()) {
                        case "express":
                          icon = <ClockCircleOutlined />;
                          color = "red";
                          label = "Envío Express";
                          break;
                        case "standard":
                          icon = <ShoppingCartOutlined />;
                          color = "blue";
                          label = "Envío Estándar";
                          break;
                        case "pickup":
                          icon = <EnvironmentOutlined />;
                          color = "green";
                          label = "Recoger en Tienda";
                          break;
                        default:
                          icon = <InfoCircleOutlined />;
                          color = "default";
                          label = method;
                      }
                      return (
                        <motion.div
                          key={method}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Tag
                            color={color}
                            icon={icon}
                            className="py-1.5 px-4 rounded-full text-sm font-medium"
                          >
                            {label}
                          </Tag>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Garantía */}
              {product.warranty && (
                <div className="warranty-section bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <Title level={5} className="flex items-center text-yellow-800 mb-2">
                    <ToolOutlined className="mr-2 text-yellow-600" /> Garantía
                  </Title>
                  <Paragraph className="text-yellow-800 mb-0">
                    {product.warranty}
                  </Paragraph>
                </div>
              )}

              {/* CTA */}
              <div className="cta-section mt-4">
                <Button 
                  type="primary" 
                  size="large" 
                  block
                  icon={<ShoppingCartOutlined />}
                  className="h-12 text-base font-medium rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 border-0 hover:from-blue-600 hover:to-indigo-700"
                >
                  Agregar al Carrito
                </Button>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Sección inferior con pestañas */}
        <Col span={24}>
          <Card
            bordered={false}
            className="description-card shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden"
            bodyStyle={{ padding: 0 }}
          >
            <Tabs
              defaultActiveKey="1"
              type="card"
              size="large"
              className="product-tabs"
              items={[
                {
                  key: "1",
                  label: (
                    <span className="flex items-center text-base">
                      <FileTextOutlined className="mr-2" /> Descripción
                    </span>
                  ),
                  children: (
                    <div className="description-content p-6">
                      {product.short_description && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                          <Paragraph strong className="text-blue-800 text-lg mb-0">
                            {product.short_description}
                          </Paragraph>
                        </div>
                      )}
                      {product.long_description ? (
                        <div
                          className="long-description prose max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: product.long_description,
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl">
                          <InfoCircleOutlined style={{ fontSize: 36 }} className="text-gray-400 mb-4" />
                          <Text type="secondary" className="text-center">
                            No hay descripción detallada disponible para este producto.
                          </Text>
                        </div>
                      )}
                    </div>
                  ),
                },

                ...(product.videoUrl
                  ? [
                      {
                        key: "2",
                        label: (
                          <span className="flex items-center text-base">
                            <PlayCircleOutlined className="mr-2" /> Video
                          </span>
                        ),
                        children: (
                          <div className="video-container p-6">
                            <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg">
                              <iframe
                                src={product.videoUrl}
                                title="Product Video"
                                width="100%"
                                height="500"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="border-0"
                              />
                            </div>
                          </div>
                        ),
                      },
                    ]
                  : []),

                {
                  key: "3",
                  label: (
                    <span className="flex items-center text-base">
                      <InfoCircleOutlined className="mr-2" /> SEO
                    </span>
                  ),
                  children: (
                    <div className="seo-content p-6">
                      <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                          <Card className="bg-gray-50 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                            <Title level={5} className="mb-3 text-gray-800 flex items-center">
                              <TagOutlined className="mr-2 text-blue-500" /> Título SEO
                            </Title>
                            <Paragraph className="text-blue-600 text-lg mb-0 font-medium">
                              {product.seo?.title || product.name}
                            </Paragraph>
                          </Card>
                        </Col>
                        <Col xs={24} md={12}>
                          <Card className="bg-gray-50 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                            <Title level={5} className="mb-3 text-gray-800 flex items-center">
                              <FileTextOutlined className="mr-2 text-blue-500" /> Descripción SEO
                            </Title>
                            <Paragraph className="text-blue-600">
                              {product.seo?.description || product.short_description || "No disponible"}
                            </Paragraph>
                          </Card>
                        </Col>
                        
                        {product.seo?.keywords && product.seo.keywords.length > 0 && (
                          <Col span={24}>
                            <Card className="bg-gray-50 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                              <Title level={5} className="mb-3 text-gray-800 flex items-center">
                                <TagOutlined className="mr-2 text-blue-500" /> Palabras clave
                              </Title>
                              <div className="flex flex-wrap gap-2">
                                {product.seo.keywords.map((keyword, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <Tag
                                      color="blue"
                                      className="px-3 py-1.5 rounded-full text-sm"
                                    >
                                      {keyword}
                                    </Tag>
                                  </motion.div>
                                ))}
                              </div>
                            </Card>
                          </Col>
                        )}
                      </Row>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal de preview de imagen */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="80vw"
        className="image-preview-modal"
        centered
        destroyOnClose
      >
        <div className="flex justify-center items-center h-full">
          <Image
            alt={previewTitle}
            src={previewImage || ""}
            style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
            preview={false}
            className="rounded-lg"
            fallback="/placeholder.svg"
          />
        </div>
      </Modal>

      {/* Modal de preview de video */}
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

export const ProductView = ({ open, onClose, productId }: ProductViewProps) => {
  const {
    data: productData,
    isLoading,
    isError,
    error,
  } = useQuery<Product, Error>({
    queryKey: ["product", productId],
    queryFn: () => ProductsService.getProductById(productId),
    enabled: !!productId && open,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      width={1200}
      footer={null}
      className="product-view-modal"
      destroyOnClose
      centered
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <Spin size="large" className="mb-4" />
            <Text className="text-gray-500">Cargando detalles del producto...</Text>
          </motion.div>
        )}
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert
              message="Error al cargar el producto"
              description={
                error?.message ||
                "No se pudieron obtener los detalles del producto."
              }
              type="error"
              showIcon
              className="m-4 rounded-xl"
            />
          </motion.div>
        )}
        {!isLoading && !isError && productData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ProductDetails product={productData} />
          </motion.div>
        )}
        {!isLoading && !isError && !productData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert
              message="Producto no encontrado"
              description="No se pudieron obtener los detalles para el producto solicitado."
              type="warning"
              showIcon
              className="m-4 rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};