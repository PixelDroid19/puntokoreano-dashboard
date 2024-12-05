import { Modal, Tag, Space } from 'antd';
import dayjs from 'dayjs';
import LexicalViewer from '../../../components/LexicalBlogEditor/LexicalViewer.component';
import { statusColors } from './BlogPostCard';

const BlogPostModal = ({ selectedPost, isViewModalOpen, onClose }) => {
  if (!selectedPost) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-4">
          <span className="text-xl font-semibold">{selectedPost?.title}</span>
          <Tag color={statusColors[selectedPost?.status || "draft"]}>
            {selectedPost?.status.toUpperCase()}
          </Tag>
        </div>
      }
      open={isViewModalOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      className="blog-post-modal"
    >
      <div className="blog-post-content">
        {/* Imagen destacada */}
        {selectedPost.featured_image && (
          <div className="featured-image-container mb-6">
            <img
              src={selectedPost.featured_image}
              alt={selectedPost.title}
              className="w-full h-[300px] object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Metadatos */}
        <div className="metadata mb-6">
          <Space direction="vertical" size="small">
            {/* Categorías y etiquetas */}
            <div className="flex flex-wrap gap-2">
              {selectedPost.categories.map((category) => (
                <Tag key={category} color="blue">
                  {category}
                </Tag>
              ))}
              {selectedPost.tags?.map((tag) => (
                <Tag key={tag} color="default">
                  #{tag}
                </Tag>
              ))}
            </div>

            {/* Fecha y autor */}
            <div className="text-sm text-gray-500">
              Última actualización:{" "}
              {dayjs(selectedPost.updated_at).format("DD/MM/YYYY HH:mm")}
            </div>
          </Space>
        </div>

        {/* Extracto */}
        <div className="excerpt mb-6">
          <p className="text-lg text-gray-600 italic border-l-4 border-blue-500 pl-4">
            {selectedPost.excerpt}
          </p>
        </div>

        {/* Contenido */}
        <div className="prose max-w-none">
          <LexicalViewer content={selectedPost.content} />
        </div>
      </div>
    </Modal>
  );
};

export default BlogPostModal;