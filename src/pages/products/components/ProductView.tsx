import React from "react";
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
} from "antd";
import { Product } from "../../../api/types";
import {
  ShoppingCartOutlined,
  TagOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import './ProductView.css'

const { Title, Paragraph, Text } = Typography;

interface ProductViewProps {
  open: boolean;
  onClose: () => void;
  product: Product;
}

export const ProductView = ({ open, onClose, product }: ProductViewProps) => {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = React.useState(false);

  const statusColor = product.active ? "green" : "red";
  const stockColor =
    product.stock > 10 ? "green" : product.stock > 0 ? "orange" : "red";

  const formatPrice = (price: number) => {
    return price?.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      width={1000}
      footer={null}
      className="product-view-modal"
    >
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card className="header-card" bordered={false}>
            <Row align="middle" justify="space-between">
              <Col>
                <Title level={4} style={{ margin: 0 }}>
                  {product.name}
                </Title>
                <Text type="secondary">SKU: {product.code}</Text>
              </Col>
              <Col>
                <Space>
                  <Tag color={statusColor} className="status-tag">
                    {product.active ? "Activo" : "Inactivo"}
                  </Tag>
                  <Tag color={stockColor} icon={<ShoppingCartOutlined />}>
                    Stock: {product.stock}
                  </Tag>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card bordered={false} className="images-card">
            <Carousel autoplay>
              {product.images.map((image, index) => (
                <div key={index}>
                  <Image
                    src={image}
                    alt={`${product.name} - ${index + 1}`}
                    className="main-image"
                    preview={false}
                    onClick={() => {
                      setSelectedImage(image);
                      setPreviewVisible(true);
                    }}
                  />
                </div>
              ))}
            </Carousel>
            <div className="thumbnail-container">
              <Space>
                {product.images.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`thumbnail-${index}`}
                    width={60}
                    height={60}
                    className="thumbnail"
                    preview={false}
                    onClick={() => {
                      setSelectedImage(image);
                      setPreviewVisible(true);
                    }}
                  />
                ))}
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card bordered={false} className="details-card">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Title level={5}>
                  <TagOutlined /> Precio
                </Title>
                <Title level={3} type="success" style={{ margin: 0 }}>
                  {formatPrice(product.price)}
                </Title>
                {product.old_price && (
                  <Text delete type="secondary" style={{ fontSize: 16 }}>
                    {formatPrice(product.old_price)}
                  </Text>
                )}
              </div>

              <div>
                <Title level={5}>
                  <InfoCircleOutlined /> Clasificación
                </Title>
                <Space direction="vertical">
                  <Text>
                    <strong>Grupo:</strong> {product.group}
                  </Text>
                  <Text>
                    <strong>Subgrupo:</strong> {product.subgroup}
                  </Text>
                </Space>
              </div>

              <div>
                <Title level={5}>Métodos de Envío</Title>
                <Space wrap>
                  {product.shipping.map((method) => (
                    <Tag key={method} color="blue">
                      {method}
                    </Tag>
                  ))}
                </Space>
              </div>
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card bordered={false} className="description-card">
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane
                tab={
                  <span>
                    <FileTextOutlined /> Descripción
                  </span>
                }
                key="1"
              >
                <div className="description-content">
                  <Paragraph strong>{product.short_description}</Paragraph>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product.long_description,
                    }}
                  />
                </div>
              </Tabs.TabPane>

              {product.videoUrl && (
                <Tabs.TabPane
                  tab={
                    <span>
                      <PlayCircleOutlined /> Video
                    </span>
                  }
                  key="2"
                >
                  <iframe
                    src={product.videoUrl}
                    title="Product Video"
                    width="100%"
                    height="400"
                    frameBorder="0"
                    allowFullScreen
                  />
                </Tabs.TabPane>
              )}

              <Tabs.TabPane
                tab={
                  <span>
                    <InfoCircleOutlined /> SEO
                  </span>
                }
                key="3"
              >
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text strong>Título SEO:</Text>
                    <Paragraph>{product.seo?.title || product.name}</Paragraph>
                  </div>
                  <div>
                    <Text strong>Descripción SEO:</Text>
                    <Paragraph>
                      {product.seo?.description || product.short_description}
                    </Paragraph>
                  </div>
                  <div>
                    <Text strong>Palabras clave:</Text>
                    <div>
                      {product.seo?.keywords.map((keyword, index) => (
                        <Tag key={index}>{keyword}</Tag>
                      ))}
                    </div>
                  </div>
                </Space>
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={900}
        className="image-preview-modal"
      >
        <Image
          alt="Preview"
          src={selectedImage || ""}
          style={{ width: "100%" }}
          preview={false}
        />
      </Modal>
    </Modal>
  );
};
