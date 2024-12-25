import React from "react";
import { Modal, Tag, Space, Descriptions, Typography } from "antd";
import { ClockCircleOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import DOMPurify from "dompurify";
import "./BlogPostModal.css";

const { Title, Text } = Typography;

const difficultyColors = {
  beginner: "#87d068",
  intermediate: "#faad14",
  advanced: "#f5222d",
};

const maintenanceTypeLabels = {
  preventive: "Preventivo",
  corrective: "Correctivo",
  upgrade: "Actualización",
  tips: "Tips",
  general: "General",
};

const difficultyLabels = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

const BlogPostModal = ({ selectedPost, isViewModalOpen, onClose }) => {
  if (!selectedPost) return null;

  return (
    <Modal
      title={null}
      open={isViewModalOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      className="blog-post-modal"
    >
      <div className="blog-post-preview">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="mb-4">
            {selectedPost.title}
          </Title>
          <Space size={[0, 8]} wrap className="mb-4">
            <Tag color="blue">
              {maintenanceTypeLabels[selectedPost.maintenance_type]}
            </Tag>
            <Tag color={difficultyColors[selectedPost.difficulty_level]}>
              {difficultyLabels[selectedPost.difficulty_level]}
            </Tag>
            {selectedPost.estimated_time && (
              <Tag icon={<ClockCircleOutlined />} color="default">
                {selectedPost.estimated_time.value}{" "}
                {selectedPost.estimated_time.unit}
              </Tag>
            )}
            <Tag icon={<EyeOutlined />} color="default">
              {selectedPost.views} vistas
            </Tag>
          </Space>
        </div>

        {/* Featured Image */}
        {selectedPost.featured_image?.url && (
          <div className="mb-8">
            <img
              src={selectedPost.featured_image.url}
              alt={selectedPost.featured_image.alt || selectedPost.title}
              className="w-full h-[400px] object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Vehicle Information */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <Title level={4} className="mb-4">
            Información del Vehículo
          </Title>
          <Descriptions column={2}>
            <Descriptions.Item label="Marca">
              {selectedPost.vehicle?.brand}
            </Descriptions.Item>
            <Descriptions.Item label="Modelo">
              {selectedPost.vehicle?.model}
            </Descriptions.Item>
            <Descriptions.Item label="Motor">
              {selectedPost.vehicle?.engine}
            </Descriptions.Item>
            <Descriptions.Item label="Años">
              {selectedPost.vehicle?.year_range?.start} -{" "}
              {selectedPost.vehicle?.year_range?.end}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Content */}
        <div className="rich-content mb-8">
          <div
            className="ql-editor"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(selectedPost.content),
            }}
          />
        </div>

        {/* Required Parts & Tools */}
        {(selectedPost.parts_required?.length > 0 ||
          selectedPost.tools_required?.length > 0) && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="grid grid-cols-2 gap-6">
              {selectedPost.parts_required?.length > 0 && (
                <div>
                  <Title level={4} className="mb-4">
                    Repuestos Necesarios
                  </Title>
                  <ul className="list-disc pl-6">
                    {selectedPost.parts_required.map((part, index) => (
                      <li key={index} className="mb-2">
                        <Text strong>{part.name}</Text>
                        {part.part_number && (
                          <div className="text-gray-500 text-sm">
                            Código: {part.part_number}
                          </div>
                        )}
                        {part.quantity && (
                          <div className="text-gray-500 text-sm">
                            Cantidad: {part.quantity}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPost.tools_required?.length > 0 && (
                <div>
                  <Title level={4} className="mb-4">
                    Herramientas Necesarias
                  </Title>
                  <ul className="list-disc pl-6">
                    {selectedPost.tools_required.map((tool, index) => (
                      <li key={index} className="mb-2">
                        <Text>{tool}</Text>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gallery */}
        {selectedPost.gallery?.length > 0 && (
          <div className="mb-8">
            <Title level={4} className="mb-4">
              Galería
            </Title>
            <div className="grid grid-cols-3 gap-4">
              {selectedPost.gallery.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.url}
                    alt={image.alt || `Imagen ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                  />
                  {image.caption && (
                    <div className="mt-2 text-sm text-gray-600">
                      {image.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Information */}
        {selectedPost.seo && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <Title level={4} className="mb-4">
              Información SEO
            </Title>
            <Descriptions column={1}>
              <Descriptions.Item label="Título SEO">
                {selectedPost.seo.title}
              </Descriptions.Item>
              <Descriptions.Item label="Descripción SEO">
                {selectedPost.seo.description}
              </Descriptions.Item>
              <Descriptions.Item label="Palabras clave">
                {selectedPost.seo.keywords?.map((keyword, index) => (
                  <Tag key={index}>{keyword}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}

        {/* Footer Information */}
        <div className="border-t pt-6 mt-8">
          <Space direction="vertical" size="small" className="w-full">
            <div className="flex justify-between text-gray-500">
              <span>
                Creado:{" "}
                {dayjs(selectedPost.createdAt).format("DD/MM/YYYY HH:mm")}
              </span>
              <span>
                Última actualización:{" "}
                {dayjs(selectedPost.updatedAt).format("DD/MM/YYYY HH:mm")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Text type="secondary">Estado:</Text>
              <Tag
                color={
                  selectedPost.status === "published"
                    ? "success"
                    : selectedPost.status === "draft"
                    ? "warning"
                    : "default"
                }
              >
                {selectedPost.status === "published"
                  ? "Publicado"
                  : selectedPost.status === "draft"
                  ? "Borrador"
                  : "Archivado"}
              </Tag>
            </div>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default BlogPostModal;
