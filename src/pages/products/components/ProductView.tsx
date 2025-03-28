// src/pages/products/components/ProductView.tsx
import React, { useState } from "react"; 
import {
  Modal,
  Image,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Typography,
  Carousel,
  Tabs,
  Divider,
  Badge,
  Button,
  Spin, 
  Alert,
  Tooltip, 
} from "antd";
import type { Product } from "../../../api/types";
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
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import ProductsService from "../../../services/products.service";
import "./ProductView.css";

const { Title, Paragraph, Text } = Typography;

interface ProductViewProps {
  open: boolean;
  onClose: () => void;
  productId: string;
}

const ProductDetails: React.FC<{ product: Product }> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  /*   useEffect(() => {
    if (product?.images?.length > 0 && !selectedImage) {
      // No necesitamos setear selectedImage aquí para el preview, solo al hacer click
    }
  }, [product]); */

  const statusColor = product.active ? "green" : "red";
  const stockColor =
    product.stock > 10 ? "green" : product.stock > 0 ? "orange" : "red";

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null || isNaN(price)) return "-";
    return price.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const hasDiscount = product.discount?.isActive === true;
  const calculatedOriginalPrice =
    hasDiscount &&
    product.discount.percentage > 0 &&
    product.discount.percentage < 100
      ? product.price / (1 - product.discount.percentage / 100)
      : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            className="header-card bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-sm"
            bordered={false}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <Title
                  level={3}
                  style={{ margin: 0 }}
                  className="text-gray-800"
                >
                  {product.name}
                </Title>
                <Space className="mt-1">
                  <Text type="secondary" className="flex items-center">
                    <TagOutlined className="mr-1" /> SKU: {product.code}
                  </Text>
                  {/* Asumiendo que 'brand' existe en el tipo Product actualizado */}
                  {product.brand && (
                    <>
                      <Divider type="vertical" />
                      <Text type="secondary" className="flex items-center">
                        <CarOutlined className="mr-1" /> Marca: {product.brand}
                      </Text>
                    </>
                  )}
                </Space>
              </Col>
              <Col>
                <Space size="large">
                  <Badge.Ribbon
                    text={product.active ? "Activo" : "Inactivo"}
                    color={statusColor}
                  >
                    <Card className="status-card border-0 bg-white shadow-sm">
                      <Space direction="vertical" align="center" size={0}>
                        <ShoppingCartOutlined
                          style={{ fontSize: 24 }}
                          className={`text-${stockColor}-500`}
                        />
                        <Tooltip
                          title={`Reservado: ${product.reservedStock ?? 0}`}
                        >
                          <Text strong className="mt-1">
                            Stock Total: {product.stock}
                          </Text>
                        </Tooltip>
                      </Space>
                    </Card>
                  </Badge.Ribbon>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            bordered={false}
            className="images-card shadow-sm hover:shadow-md transition-all duration-300"
          >
            {product?.images && product.images.length > 0 ? (
              <>
                <Carousel autoplay className="product-carousel">
                  {product.images.map((image, index) => (
                    <div key={index} className="carousel-item">
                      <div className="image-container">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${product.name} - ${index + 1}`}
                          className="main-image rounded-lg object-contain"
                          style={{ maxHeight: "400px", width: "100%" }}
                          preview={false}
                          onClick={() => {
                            setSelectedImage(image);
                            setPreviewVisible(true);
                          }}
                          fallback="/placeholder.svg"
                        />
                        <div className="image-overlay">
                          <Button
                            type="primary"
                            shape="circle"
                            icon={<InfoCircleOutlined />}
                            onClick={() => {
                              setSelectedImage(image);
                              setPreviewVisible(true);
                            }}
                            className="overlay-button"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </Carousel>
                <div className="thumbnail-container mt-4">
                  <Space wrap>
                    {product.images.map((image, index) => (
                      <motion.div
                        key={`thumb-${index}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`thumbnail-${index}`}
                          width={60}
                          height={60}
                          className="thumbnail rounded-md border-2 border-gray-200 hover:border-blue-500 transition-all object-cover"
                          preview={false}
                          onClick={() => {
                            setSelectedImage(image);
                            setPreviewVisible(true);
                          }}
                          fallback="/placeholder.svg"
                        />
                      </motion.div>
                    ))}
                  </Space>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "200px",
                  backgroundColor: "#f0f0f0",
                }}
              >
                <Text type="secondary">No hay imágenes disponibles</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            bordered={false}
            className="details-card shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div className="price-section bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <Title
                  level={5}
                  className="flex items-center text-gray-700 mb-2"
                >
                  <TagOutlined className="mr-2 text-green-500" /> Precio
                </Title>
                <div className="flex items-baseline flex-wrap">
                  {" "}
                  {/* flex-wrap para mejor responsive */}
                  <Title level={2} className="text-green-600 m-0 mr-3">
                    {" "}
                    {/* Margen derecho */}
                    {formatPrice(product.price)}
                  </Title>
                  {/* --- AJUSTE: Mostrar precio original y badge --- */}
                  {hasDiscount && (
                    <>
                      <Text delete type="secondary" className="mr-3 text-lg">
                        {" "}
                        {/* Margen derecho */}
                        {formatPrice(calculatedOriginalPrice)}
                      </Text>
                      <Badge
                        count={`-${product.discount.percentage}%`}
                        style={{ backgroundColor: "#ff4d4f" }}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="classification-section">
                <Title level={5} className="flex items-center text-gray-700">
                  <InfoCircleOutlined className="mr-2 text-blue-500" />{" "}
                  Clasificación
                </Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card
                      size="small"
                      className="bg-gray-50 border border-gray-200"
                    >
                      <Text strong className="block mb-1 text-gray-600">
                        Grupo
                      </Text>
                      <Tag color="blue" className="text-sm">
                        {product.group}
                      </Tag>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      size="small"
                      className="bg-gray-50 border border-gray-200"
                    >
                      <Text strong className="block mb-1 text-gray-600">
                        Subgrupo
                      </Text>
                      <Tag color="cyan" className="text-sm">
                        {product.subgroup}
                      </Tag>
                    </Card>
                  </Col>
                </Row>
              </div>

              {product.shipping?.length > 0 && (
                <div className="shipping-section">
                  <Title level={5} className="flex items-center text-gray-700">
                    <EnvironmentOutlined className="mr-2 text-orange-500" />{" "}
                    Métodos de Envío
                  </Title>
                  <Space wrap>
                    {product.shipping.map((method) => {
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
                        <Tag
                          key={method}
                          color={color}
                          icon={icon}
                          className="py-1 px-3"
                        >
                          {label}
                        </Tag>
                      );
                    })}
                  </Space>
                </div>
              )}

              {/* Mostrar campos adicionales si existen en el tipo Product */}
              {(product.maintenance_type || product.difficulty_level) && (
                <div className="maintenance-section bg-blue-50 p-4 rounded-lg">
                  <Title
                    level={5}
                    className="flex items-center text-gray-700 mb-2"
                  >
                    <ToolOutlined className="mr-2 text-blue-500" /> Información
                    Técnica
                  </Title>
                  <Row gutter={[16, 16]}>
                    {product.maintenance_type && (
                      <Col span={12}>
                        <Text strong className="block text-gray-600">
                          Tipo Mantenimiento
                        </Text>
                        <Tag color="purple">{product.maintenance_type}</Tag>
                      </Col>
                    )}
                    {product.difficulty_level && (
                      <Col span={12}>
                        <Text strong className="block text-gray-600">
                          Dificultad
                        </Text>
                        <Tag
                          color={
                            product.difficulty_level === "beginner"
                              ? "green"
                              : product.difficulty_level === "intermediate"
                              ? "orange"
                              : "red"
                          }
                        >
                          {product.difficulty_level}
                        </Tag>
                      </Col>
                    )}
                  </Row>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card
            bordered={false}
            className="description-card shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Tabs
              defaultActiveKey="1"
              type="card"
              items={[
                {
                  key: "1",
                  label: (
                    <span className="flex items-center">
                      <FileTextOutlined className="mr-1" /> Descripción
                    </span>
                  ),
                  children: (
                    <div className="description-content p-4">
                      {product.short_description && (
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-4">
                          <Paragraph strong className="text-yellow-800">
                            {product.short_description}
                          </Paragraph>
                        </div>
                      )}
                      {product.long_description ? (
                        <div
                          className="long-description"
                          dangerouslySetInnerHTML={{
                            __html: product.long_description,
                          }}
                        />
                      ) : (
                        <Text type="secondary">
                          No hay descripción detallada disponible.
                        </Text>
                      )}
                    </div>
                  ),
                },

                ...(product.videoUrl
                  ? [
                      {
                        key: "2",
                        label: (
                          <span className="flex items-center">
                            <PlayCircleOutlined className="mr-1" /> Video
                          </span>
                        ),
                        children: (
                          <div className="video-container p-4">
                            <iframe
                              src={product.videoUrl}
                              title="Product Video"
                              width="100%"
                              height="400"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="rounded-lg shadow-sm border-0"
                            />
                          </div>
                        ),
                      },
                    ]
                  : []),

                {
                  key: "3",
                  label: (
                    <span className="flex items-center">
                      <InfoCircleOutlined className="mr-1" /> SEO
                    </span>
                  ),
                  children: (
                    <div className="seo-content p-4">
                      <Space
                        direction="vertical"
                        size="large"
                        style={{ width: "100%" }}
                      >
                        <Card className="bg-gray-50 border border-gray-200">
                          <Text strong className="block text-gray-700 mb-1">
                            Título SEO:
                          </Text>
                          <Paragraph className="text-blue-600">
                            {product.seo?.title || product.name}
                          </Paragraph>
                        </Card>
                        <Card className="bg-gray-50 border border-gray-200">
                          <Text strong className="block text-gray-700 mb-1">
                            Descripción SEO:
                          </Text>
                          <Paragraph className="text-blue-600">
                            {product.seo?.description ||
                              product.short_description}
                          </Paragraph>
                        </Card>
                        {product.seo?.keywords &&
                          product.seo.keywords.length > 0 && (
                            <Card className="bg-gray-50 border border-gray-200">
                              <Text strong className="block text-gray-700 mb-1">
                                Palabras clave:
                              </Text>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {product.seo.keywords.map((keyword, index) => (
                                  <Tag
                                    key={index}
                                    color="geekblue"
                                    className="px-3 py-1"
                                  >
                                    {keyword}
                                  </Tag>
                                ))}
                              </div>
                            </Card>
                          )}
                      </Space>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal de preview de imagen sin cambios */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={900}
        className="image-preview-modal"
        centered
        destroyOnClose
      >
        <Image
          alt="Preview"
          src={selectedImage || ""}
          style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
          preview={false}
          className="rounded-lg"
          fallback="/placeholder.svg"
        />
      </Modal>
    </motion.div>
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
      width={1000}
      footer={null}
      className="product-view-modal"
      destroyOnClose
    >
      {isLoading && (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" tip="Cargando detalles del producto..." />
        </div>
      )}
      {isError && (
        <Alert
          message="Error al cargar el producto"
          description={
            error?.message ||
            "No se pudieron obtener los detalles del producto."
          }
          type="error"
          showIcon
          className="m-4"
        />
      )}
      {!isLoading && !isError && productData && (
        <ProductDetails product={productData} />
      )}
      {!isLoading && !isError && !productData && (
        <Alert
          message="Producto no encontrado"
          description="No se pudieron obtener los detalles para el producto solicitado."
          type="warning"
          showIcon
          className="m-4"
        />
      )}
    </Modal>
  );
};
