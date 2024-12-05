import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Tag, Space, Button, Popconfirm, Typography, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styled from 'styled-components';
const { Text, Title } = Typography;
// Estilos personalizados
const StyledCard = styled(Card) `
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
const CategoryTag = styled(Tag) `
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: capitalize;
`;
const StatusBadge = styled(Tag) `
  padding: 2px 12px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;
export const statusColors = {
    draft: '#faad14',
    published: '#52c41a',
    archived: '#ff4d4f'
};
const statusLabels = {
    draft: 'Borrador',
    published: 'Publicado',
    archived: 'Archivado'
};
const BlogPostCard = ({ post, onEdit, onDelete, onView }) => {
    // Procesar el extracto para mostrarlo correctamente
    const processExcerpt = (excerpt) => {
        try {
            const parsed = JSON.parse(excerpt);
            if (parsed.root?.children) {
                return parsed.root.children
                    .map((node) => node.children?.[0]?.text || '')
                    .filter(Boolean)
                    .join(' ');
            }
            return excerpt;
        }
        catch {
            return excerpt;
        }
    };
    return (_jsx(StyledCard, { hoverable: true, cover: post.featured_image && (_jsxs("div", { className: "relative", children: [_jsx("img", { alt: post.title, src: post.featured_image, className: "w-full" }), _jsx(StatusBadge, { color: statusColors[post.status], className: "absolute top-3 right-3", children: statusLabels[post.status] })] })), actions: [
            _jsx(Tooltip, { title: "Ver art\u00EDculo", children: _jsx(Button, { type: "text", icon: _jsx(EyeOutlined, {}), onClick: () => onView(post), className: "text-blue-600 hover:text-blue-700" }) }),
            _jsx(Tooltip, { title: "Editar art\u00EDculo", children: _jsx(Button, { type: "text", icon: _jsx(EditOutlined, {}), onClick: () => onEdit(post), className: "text-green-600 hover:text-green-700" }) }),
            _jsx(Tooltip, { title: "Eliminar art\u00EDculo", children: _jsx(Popconfirm, { title: "\u00BFEliminar art\u00EDculo?", description: "Esta acci\u00F3n no se puede deshacer", onConfirm: () => onDelete(post), okText: "S\u00ED", cancelText: "No", placement: "topRight", children: _jsx(Button, { type: "text", danger: true, icon: _jsx(DeleteOutlined, {}) }) }) })
        ], children: _jsx(Card.Meta, { title: _jsx(Title, { level: 4, ellipsis: { rows: 2 }, children: post.title }), description: _jsxs(Space, { direction: "vertical", size: "middle", className: "w-full", children: [_jsx(Text, { className: "text-gray-600 line-clamp-2", children: processExcerpt(post.excerpt) }), _jsx(Space, { wrap: true, children: post.categories.map(category => (_jsx(CategoryTag, { color: "processing", children: category }, category))) }), post.tags && post.tags.length > 0 && (_jsx(Space, { wrap: true, children: post.tags.map(tag => (_jsxs(Tag, { className: "text-gray-500", children: ["#", tag] }, tag))) })), _jsxs("div", { className: "flex items-center text-gray-400 text-sm", children: [_jsx(ClockCircleOutlined, { className: "mr-2" }), _jsx(Text, { type: "secondary", children: dayjs(post.updated_at).format('DD/MM/YYYY HH:mm') })] })] }) }) }));
};
export default BlogPostCard;
