//src/pages/blog/Blog.page.tsx
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Row,
  Col,
  Input,
  Select,
  Button,
  Modal,
  message,
  Space,
  Empty,
  Tag,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import BlogService from "../../services/blog.service";

import BlogPostCard, { statusColors } from "./components/BlogPostCard";
import BlogPostForm from "./components/BlogPostForm";
import debounce from "lodash/debounce";
import type { BlogPost, BlogPostCreate } from "../../types/blog.types";
import dayjs from "dayjs";
import LexicalContentRenderer from "../../components/LexicalBlogEditor/LexicalContentRenderer.component";
import BlogPostModal from "./components/BlogPostModal";

const Blog = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [selectedPost, setSelectedPost] = React.useState<BlogPost | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);

  // Queries y Mutations
  const { data: postsData, isLoading } = useQuery({
    queryKey: ["blog-posts", searchText, statusFilter, categoryFilter],
    queryFn: () =>
      BlogService.getPosts({
        search: searchText,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      }),
  });

  const createPost = useMutation({
    mutationFn: (post: BlogPostCreate) => BlogService.createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      message.success("Artículo creado correctamente");
      setIsFormModalOpen(false);
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const updatePost = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogPostCreate> }) =>
      BlogService.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      message.success("Artículo actualizado correctamente");
      setIsFormModalOpen(false);
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const deletePost = useMutation({
    mutationFn: (id: string) => BlogService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      message.success("Artículo eliminado correctamente");
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  // Handlers
  const handleSearch = debounce((value: string) => {
    setSearchText(value);
  }, 500);

  const handleSubmit = (values: BlogPostCreate) => {
    console.log('selectedPost', selectedPost)
    if (selectedPost) {
      updatePost.mutate({ id: selectedPost._id, data: values });
    } else {
      createPost.mutate(values);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blog</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedPost(null);
            setIsFormModalOpen(true);
          }}
        >
          Nuevo Artículo
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Space wrap>
          <Input
            placeholder="Buscar artículos"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filtrar por estado"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { label: "Borrador", value: "draft" },
              { label: "Publicado", value: "published" },
              { label: "Archivado", value: "archived" },
            ]}
          />
          <Select
            placeholder="Filtrar por categoría"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setCategoryFilter(value)}
            options={[
              { label: "Noticias", value: "news" },
              { label: "Tutoriales", value: "tutorials" },
              { label: "Productos", value: "products" },
            ]}
          />
        </Space>
      </div>

      {/* Post Grid */}
      <Row gutter={[16, 16]}>
        {postsData?.data.posts.length === 0 ? (
          <Col span={24}>
            <Empty description="No hay artículos disponibles" />
          </Col>
        ) : (
          postsData?.data.posts.map((post) => (
            <Col key={post._id} xs={24} sm={12} lg={8} xl={6}>
              <BlogPostCard
                post={post}
                onEdit={(post) => {
                  setSelectedPost(post);
                  setIsFormModalOpen(true);
                }}
                onDelete={(post) => deletePost.mutate(post._id)}
                onView={(post) => {
                  setSelectedPost(post);
                  setIsViewModalOpen(true);
                }}
              />
            </Col>
          ))
        )}
      </Row>

      {/* Form Modal */}
      <Modal
        title={selectedPost ? "Editar Artículo" : "Nuevo Artículo"}
        open={isFormModalOpen}
        onCancel={() => {
          setIsFormModalOpen(false);
          setSelectedPost(null);
        }}
        footer={null}
        width={800}
      >
        <BlogPostForm
          initialValues={selectedPost || undefined}
          onSubmit={handleSubmit}
          loading={createPost.isPending || updatePost.isPending}
        />
      </Modal>

      {/* View Modal */}
      <BlogPostModal
        selectedPost={selectedPost}
        isViewModalOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPost(null);
        }}
      />
    </div>
  );
};

export default Blog;
