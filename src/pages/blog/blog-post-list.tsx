import { useState } from "react"
import { Table, Button, Tag, Input, Dropdown, message, Modal, Tooltip, Empty } from "antd"
import { SearchOutlined, FilterOutlined, MoreOutlined } from "@ant-design/icons"
import { Edit, Trash2, Eye, Calendar, Clock, Plus } from "lucide-react"
import LoadingSkeleton from "./loading-skeleton"
import { useBlogs, useDeleteBlog } from  "../../hooks/use-blog-queries"
import { formatDate } from "../../lib/utils"
import type { BlogPost } from "../../types/blog"

interface BlogPostListProps {
  onEditPost: (post: BlogPost) => void
  onCreatePost: () => void
}

export default function BlogPostList({ onEditPost, onCreatePost }: BlogPostListProps) {
  const [searchText, setSearchText] = useState("")
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
  })
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)

  // TanStack Query hooks
  const { data, isLoading, isError, refetch } = useBlogs(filters)

  const deleteMutation = useDeleteBlog()

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchText,
      page: 1, // Reset to first page on new search
    }))
  }

  const handleTableChange = (pagination: any) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }))
  }

  const confirmDelete = (id: string) => {
    setPostToDelete(id)
    setDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!postToDelete) return

    try {
      await deleteMutation.mutateAsync(postToDelete)
      message.success("Post eliminado correctamente")
      setDeleteModalOpen(false)
    } catch (error) {
      message.error("Error al eliminar el post")
      console.error(error)
    }
  }

  const getStatusTag = (status: string) => {
    switch (status) {
      case "published":
        return <Tag color="green">Publicado</Tag>
      case "draft":
        return <Tag color="gray">Borrador</Tag>
      case "scheduled":
        return <Tag color="blue">Programado</Tag>
      default:
        return <Tag>Desconocido</Tag>
    }
  }

  const columns = [
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: BlogPost) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500 truncate max-w-xs">{record.excerpt}</div>
        </div>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Categorías",
      dataIndex: "categories",
      key: "categories",
      render: (categories: any[]) => (
        <div className="flex flex-wrap gap-1">
          {categories?.map((cat) => (
            <Tag key={typeof cat === "string" ? cat : cat._id}>{typeof cat === "string" ? cat : cat.name}</Tag>
          )) || "Ninguna"}
        </div>
      ),
    },
    {
      title: "Fecha",
      key: "date",
      render: (text: string, record: BlogPost) => {
        const date = record.publishedAt || record.scheduledAt || record.createdAt
        const icon = record.publishedAt ? (
          <Eye size={14} />
        ) : record.scheduledAt ? (
          <Calendar size={14} />
        ) : (
          <Clock size={14} />
        )

        return (
          <Tooltip title={record.publishedAt ? "Publicado" : record.scheduledAt ? "Programado" : "Creado"}>
            <div className="flex items-center gap-1">
              {icon}
              <span>{formatDate(date)}</span>
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: BlogPost) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: (
                  <button className="flex items-center gap-2 w-full" onClick={() => onEditPost(record)}>
                    <Edit size={14} />
                    Editar
                  </button>
                ),
              },
              {
                key: "delete",
                label: (
                  <button
                    className="flex items-center gap-2 w-full text-red-500"
                    onClick={() => confirmDelete(record._id)}
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                ),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingSkeleton type="table" count={5} />
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Error al cargar los posts del blog</p>
        <Button onClick={() => refetch()}>Intentar de nuevo</Button>
      </div>
    )
  }

  const posts = data?.posts || []
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, pages: 0 }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar posts..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            className="w-full sm:w-64"
          />
          <Button onClick={handleSearch} type="primary">
            Buscar
          </Button>
        </div>
        <div className="flex gap-2">
          <Button icon={<FilterOutlined />}>Filtrar</Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={onCreatePost}>
            Crear Nuevo Post
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <Empty description="No se encontraron posts" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Table
          columns={columns}
          dataSource={posts}
          rowKey="_id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
          className="bg-white rounded-lg shadow-sm"
          loading={isLoading || deleteMutation.isPending}
        />
      )}

      <Modal
        title="Eliminar Post del Blog"
        open={deleteModalOpen}
        onOk={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        okText="Eliminar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
      >
        <p>¿Estás seguro de que deseas eliminar este post? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  )
}

