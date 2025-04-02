import React, { useEffect } from "react";
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
  Spin,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import BlogService from "../../services/blog.service";
import BlogPostCard from "./components/BlogPostCard";
import BlogPostForm from "./components/BlogPostForm";
import BlogPostModal from "./components/BlogPostModal";
import debounce from "lodash/debounce";
import { BlogPost, BlogResponse } from "../../types/blog.types";
import BrandService from "../../services/brand.service";

const Blog: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<BlogPost["status"]>();
  const [maintenanceTypeFilter, setMaintenanceTypeFilter] =
    React.useState<BlogPost["maintenance_type"]>();
  const [selectedPost, setSelectedPost] = React.useState<BlogPost | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);

  // Query para obtener los posts con manejo mejorado de filtros
  const { data: postsData, isLoading } = useQuery<BlogResponse>({
    queryKey: [
      "blog-posts",
      { searchText, statusFilter, maintenanceTypeFilter },
    ],
    queryFn: () =>
      BlogService.getPosts({
        search: searchText,
        status: statusFilter,
        maintenance_type: maintenanceTypeFilter,
      }),
    staleTime: 30000, // Datos considerados frescos por 30 segundos
  });

  // Mutación mejorada para crear posts
  const createPost = useMutation({
    mutationFn: async (post: Partial<BlogPost>) => {
      try {
        const result = await BlogService.createPost(post);
        return result;
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Error al crear el artículo"
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      message.success("Artículo creado correctamente");
      handleCloseModal();
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  // Mutación mejorada para actualizar posts
  const updatePost = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<BlogPost>;
    }) => {
      try {
        const result = await BlogService.updatePost(id, data);
        return result;
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Error al actualizar el artículo"
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      message.success("Artículo actualizado correctamente");
      handleCloseModal();
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  // Mutación mejorada para eliminar posts
  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      try {
        const result = await BlogService.deletePost(id);
        return result;
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Error al eliminar el artículo"
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      message.success("Artículo eliminado correctamente");
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const handleSearch = debounce((value: string) => {
    setSearchText(value);
  }, 500);

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedPost(null);
  };

  const handleSubmit = async (values: Partial<BlogPost>) => {
    try {
      if (selectedPost) {
        await updatePost.mutateAsync({ id: selectedPost._id, data: values });
      } else {
        await createPost.mutateAsync(values);
      }
    } catch (error) {
      // Los errores ya son manejados por las mutaciones
      console.error("Error en el envío del formulario:", error);
    }
  };

  const handleDeletePost = (post: BlogPost) => {
    Modal.confirm({
      title: "¿Eliminar artículo?",
      content: "Esta acción no se puede deshacer",
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await deletePost.mutateAsync(post._id);
        } catch (error) {
          // Error ya manejado por la mutación
        }
      },
    });
  };

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: () => BrandService.getBrands(),
  });

  // Renderizado condicional para estados de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Gestión del Blog</h1>
          <p className="text-gray-600">
            {postsData?.data.pagination.total || 0} artículos en total
          </p>
        </div>
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
            placeholder="Estado"
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
            placeholder="Tipo de mantenimiento"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => setMaintenanceTypeFilter(value)}
            options={[
              { label: "Preventivo", value: "preventive" },
              { label: "Correctivo", value: "corrective" },
              { label: "Tips", value: "tips" },
              { label: "General", value: "general" },
              { label: "Actualización", value: "upgrade" },
            ]}
          />
        </Space>
      </div>

      {/* Posts Grid */}
      <Row gutter={[16, 16]}>
        {isLoading ? (
          <Col span={24} className="text-center">
            <div className="py-8">Cargando...</div>
          </Col>
        ) : !postsData?.data.posts.length ? (
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
                onDelete={handleDeletePost}
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
        onCancel={handleCloseModal}
        footer={null}
        width={"50%"}
        destroyOnClose
      >
        <BlogPostForm
          initialValues={selectedPost}
          onSubmit={handleSubmit}
          loading={createPost.isPending || updatePost.isPending}
          brands={brands?.data || []}
        />
      </Modal>

      {/* Preview Modal */}
      <BlogPostModal
        selectedPost={selectedPost}
        isViewModalOpen={isViewModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Blog;
