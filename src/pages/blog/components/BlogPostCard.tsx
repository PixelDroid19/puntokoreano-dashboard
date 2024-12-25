// src/pages/blog/components/BlogPostCard.tsx
import React, { useEffect } from "react";
import {
  Card,
  Tag,
  Space,
  Button,
  Popconfirm,
  Typography,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { BlogPost } from "../../../types/blog.types";
import styled from "styled-components";

const { Text, Title } = Typography;

// Estilos personalizados
const StyledCard = styled(Card)`
  transition: all 0.3s ease;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .ant-card-cover {
    overflow: hidden;
    border-radius: 8px 8px 0 0;

    img {
      height: 200px;
      object-fit: cover;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .ant-card-meta-title {
    font-size: 1.25rem;
    margin-bottom: 12px;
    font-weight: 600;
    white-space: normal;
    line-height: 1.4;
  }

  .ant-card-actions {
    border-top: 1px solid #f0f0f0;
    background: #fafafa;
  }
`;

const CategoryTag = styled(Tag)`
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: capitalize;
`;

const StatusBadge = styled(Tag)`
  padding: 2px 12px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

interface BlogPostCardProps {
  post: BlogPost;
  onEdit: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
  onView: (post: BlogPost) => void;
}

export const statusColors = {
  draft: "#faad14",
  published: "#52c41a",
  archived: "#ff4d4f",
};

const statusLabels = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

const BlogPostCard: React.FC<BlogPostCardProps> = ({
  post,
  onEdit,
  onDelete,
  onView,
}) => {
  // Procesar el extracto para mostrarlo correctamente
  const processExcerpt = (excerpt: string) => {
    try {
      const parsed = JSON.parse(excerpt);
      if (parsed.root?.children) {
        return parsed.root.children
          .map((node: any) => node.children?.[0]?.text || "")
          .filter(Boolean)
          .join(" ");
      }
      return excerpt;
    } catch {
      return excerpt;
    }
  };

  return (
    <StyledCard
      hoverable
      cover={
        post.featured_image && (
          <div className="relative">
            <img
              alt={post.featured_image.alt}
              src={post.featured_image.url}
              className="w-full"
            />
            <StatusBadge
              color={statusColors[post.status]}
              className="absolute top-3 right-3"
            >
              {statusLabels[post.status]}
            </StatusBadge>
          </div>
        )
      }
      actions={[
        <Tooltip title="Ver artículo">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView(post)}
            className="text-blue-600 hover:text-blue-700"
          />
        </Tooltip>,
        <Tooltip title="Editar artículo">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(post)}
            className="text-green-600 hover:text-green-700"
          />
        </Tooltip>,
        <Tooltip title="Eliminar artículo">
          <Popconfirm
            title="¿Eliminar artículo?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => onDelete(post)}
            okText="Sí"
            cancelText="No"
            placement="topRight"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Tooltip>,
      ]}
    >
      <Card.Meta
        title={
          <Title level={4} ellipsis={{ rows: 2 }}>
            {post.title}
          </Title>
        }
        description={
          <Space direction="vertical" size="middle" className="w-full">
            {/* Extracto */}
            <Text className="text-gray-600 line-clamp-2">
              {processExcerpt(post.excerpt)}
            </Text>

            {/* Categorías */}
            <Space wrap>
              {/*   {post.categories.map(category => (
                <CategoryTag 
                  key={category}
                  color="processing"
                >
                  {category}
                </CategoryTag>
              ))} */}
            </Space>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <Space wrap>
                {post.tags.map((tag) => (
                  <Tag key={tag} className="text-gray-500">
                    #{tag}
                  </Tag>
                ))}
              </Space>
            )}

            {/* Fecha de actualización */}
            <div className="flex items-center text-gray-400 text-sm">
              <ClockCircleOutlined className="mr-2" />
              <Text type="secondary">
                {dayjs(post.updated_at).format("DD/MM/YYYY HH:mm")}
              </Text>
            </div>
          </Space>
        }
      />
    </StyledCard>
  );
};

export default BlogPostCard;
