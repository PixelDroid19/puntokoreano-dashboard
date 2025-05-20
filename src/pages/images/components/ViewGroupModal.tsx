// components/ViewGroupModal.tsx
import React from "react";
import {
  Modal,
  Typography,
  Divider,
  Card,
  Row,
  Col,
  Space,
  Button,
  Tooltip,
  Empty,
  Popconfirm,
} from "antd";
import {
  PictureOutlined,
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { ImageGroup } from "../../../services/files.service";

const { Title, Text } = Typography;

interface ViewGroupModalProps {
  group: ImageGroup | null;
  visible: boolean;
  onClose: () => void;
  onDeleteImage: (type: 'thumb' | 'carousel', index?: number) => void;
  onCopyUrl: (url: string) => void;
}

const ViewGroupModal: React.FC<ViewGroupModalProps> = ({
  group,
  visible,
  onClose,
  onDeleteImage,
  onCopyUrl,
}) => {
  if (!group) return null;

  const hasThumb = !!group.thumb;
  const hasCarousel = !!group.carousel && group.carousel.length > 0;

  return (
    <Modal
      title={
        <Space>
          <PictureOutlined /> Detalles del Grupo: <Text code>{group.identifier}</Text>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
      bodyStyle={{ 
        maxHeight: "75vh", 
        overflowY: "auto",
        padding: 20,
      }}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Title level={5}>Información General</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Identificador:</Text> {group.identifier}
                </Col>
                <Col span={12}>
                  <Text strong>Descripción:</Text>{" "}
                  {group.description || <Text type="secondary">Sin descripción</Text>}
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Creado:</Text>{" "}
                  {new Date(group.createdAt).toLocaleString()}
                </Col>
                <Col span={12}>
                  <Text strong>Última actualización:</Text>{" "}
                  {new Date(group.updatedAt).toLocaleString()}
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>

        {/* Imagen de miniatura */}
        {hasThumb && (
          <Col span={24}>
            <Card
              title={
                <Space>
                  <PictureOutlined /> Imagen Principal (Miniatura)
                </Space>
              }
              extra={
                <Space>
                  <Tooltip title="Copiar URL">
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => onCopyUrl(group.thumb!)}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="¿Eliminar esta imagen?"
                    description="Esta acción no se puede deshacer"
                    okText="Sí, eliminar"
                    cancelText="Cancelar"
                    onConfirm={() => onDeleteImage('thumb')}
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger type="text" icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              }
            >
              <div className="flex justify-center">
                <div style={{ maxWidth: "300px" }}>
                  <img
                    src={group.thumb}
                    alt="Thumbnail"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <div className="mt-2 text-center">
                    <Text type="secondary">Miniatura 300x300</Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        )}

        {/* Imágenes de carrusel */}
        <Col span={24}>
          <Card
            title={
              <Space>
                <PictureOutlined /> Imágenes de Carrusel ({hasCarousel ? group.carousel!.length : 0})
              </Space>
            }
          >
            {hasCarousel ? (
              <Row gutter={[16, 16]}>
                {group.carousel!.map((imageUrl, idx) => (
                  <Col key={idx} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      hoverable
                      cover={
                        <div
                          style={{
                            height: "150px",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <img
                            alt={`Imagen ${idx + 1}`}
                            src={imageUrl}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      }
                      actions={[
                        <Tooltip title="Ver imagen completa">
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => window.open(imageUrl, "_blank")}
                          />
                        </Tooltip>,
                        <Tooltip title="Copiar URL">
                          <Button
                            type="text"
                            icon={<CopyOutlined />}
                            onClick={() => onCopyUrl(imageUrl)}
                          />
                        </Tooltip>,
                        <Popconfirm
                          title="¿Eliminar esta imagen?"
                          description="Esta acción no se puede deshacer"
                          okText="Sí, eliminar"
                          cancelText="Cancelar"
                          onConfirm={() => onDeleteImage('carousel', idx)}
                          okButtonProps={{ danger: true }}
                        >
                          <Button danger type="text" icon={<DeleteOutlined />} />
                        </Popconfirm>,
                      ]}
                    >
                      <Card.Meta
                        title={`Imagen ${idx + 1}`}
                        description={<Text type="secondary">Carrusel 600x600</Text>}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty
                image={<PictureOutlined style={{ fontSize: 64 }} />}
                description="No hay imágenes de carrusel"
              />
            )}
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default ViewGroupModal;
