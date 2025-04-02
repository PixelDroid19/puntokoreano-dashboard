import { useState } from "react";
import { Table, Button, Input, Modal, Form, message, Popconfirm } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  useBlogTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from "../../hooks/use-blog-queries";
import LoadingSkeleton from "./loading-skeleton";
import { BlogTag } from "../../types/blog.types";

export default function TagManagement() {
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null);
  const [form] = Form.useForm();

  // TanStack Query hooks
  const { data, isLoading, isError, refetch } = useBlogTags();

  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  const handleSearch = () => {
    // In a real app, you would filter tags based on search text
    // For this example, we'll just reload all tags
    refetch();
  };

  const showCreateModal = () => {
    setEditingTag(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (tag: BlogTag) => {
    setEditingTag(tag);
    form.setFieldsValue({
      name: tag.name,
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingTag) {
        await updateMutation.mutateAsync({
          id: editingTag._id,
          tagData: values,
        });
        message.success("Etiqueta actualizada correctamente");
      } else {
        await createMutation.mutateAsync(values);
        message.success("Etiqueta creada correctamente");
      }

      setModalVisible(false);
    } catch (error) {
      console.error("Error en la validación del formulario:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Tag deleted successfully");
    } catch (error) {
      message.error("Failed to delete tag");
      console.error(error);
    }
  };

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
      render: (_: any, record: BlogTag) => (
        <div className="flex gap-2">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => showEditModal(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de que deseas eliminar esta etiqueta?"
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
  ];

  if (isLoading) {
    return <LoadingSkeleton type="table" count={3} />;
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Error al cargar las etiquetas</p>
        <Button onClick={() => refetch()}>Intentar de nuevo</Button>
      </div>
    );
  }

  const tags = data?.tags || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar etiquetas..."
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Añadir Etiqueta
        </Button>
      </div>

      {tags.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500 mb-4">No hay etiquetas disponibles</p>
          <Button type="primary" onClick={showCreateModal}>
            Crear primera etiqueta
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={tags}
          rowKey="_id"
          loading={
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending
          }
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        title={editingTag ? "Editar Etiqueta" : "Crear Etiqueta"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingTag ? "Actualizar" : "Crear"}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre de Etiqueta"
            rules={[
              {
                required: true,
                message: "Por favor ingresa el nombre de la etiqueta",
              },
            ]}
          >
            <Input placeholder="Ingresa el nombre de la etiqueta" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
