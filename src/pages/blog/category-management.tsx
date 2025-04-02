import { useState } from "react"
import { Table, Button, Input, Modal, Form, message, Popconfirm } from "antd"
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { useBlogCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "../../hooks/use-blog-queries"
import LoadingSkeleton from "./loading-skeleton"
import type { BlogCategory } from "../../types/blog.types"

export default function CategoryManagement() {
  const [searchText, setSearchText] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null)
  const [form] = Form.useForm()

  // TanStack Query hooks
  const { data, isLoading, isError, refetch } = useBlogCategories()

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const handleSearch = () => {
    // In a real app, you would filter categories based on search text
    // For this example, we'll just reload all categories
    refetch()
  }

  const showCreateModal = () => {
    setEditingCategory(null)
    form.resetFields()
    setModalVisible(true)
  }

  const showEditModal = (category: BlogCategory) => {
    setEditingCategory(category)
    form.setFieldsValue({
      name: category.name,
    })
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()

      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory._id,
          categoryData: values,
        })
        message.success("Categoría actualizada correctamente")
      } else {
        await createMutation.mutateAsync(values)
        message.success("Categoría creada correctamente")
      }

      setModalVisible(false)
    } catch (error) {
      console.error("Error en la validación del formulario:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      message.success("Category deleted successfully")
    } catch (error) {
      message.error("Failed to delete category")
      console.error(error)
    }
  }

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Creado",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: BlogCategory) => (
        <div className="flex gap-2">
          <Button icon={<EditOutlined />} size="small" onClick={() => showEditModal(record)}>
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de que deseas eliminar esta categoría?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger>
              Eliminar
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingSkeleton type="table" count={3} />
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Error al cargar las categorías</p>
        <Button onClick={() => refetch()}>Intentar de nuevo</Button>
      </div>
    )
  }

  const categories = data?.categories || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar categorías..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            className="w-64"
          />
          <Button onClick={handleSearch} type="primary">
            Buscar
          </Button>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
          Añadir Categoría
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500 mb-4">No hay categorías disponibles</p>
          <Button type="primary" onClick={showCreateModal}>
            Crear primera categoría
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="_id"
          loading={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        title={editingCategory ? "Editar Categoría" : "Crear Categoría"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingCategory ? "Actualizar" : "Crear"}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre de Categoría"
            rules={[{ required: true, message: "Por favor ingresa el nombre de la categoría" }]}
          >
            <Input placeholder="Ingresa el nombre de la categoría" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

