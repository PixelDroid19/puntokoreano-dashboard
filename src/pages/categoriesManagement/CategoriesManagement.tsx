import { useState, useCallback, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Modal,
  Form,
  Space,
  Tag,
  Tooltip,
  Upload,
  message,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CategoriesService, {
  Category,
  CategoryCreateInput,
  CategoryUpdateInput,
  SubgroupStatusUpdate,
} from "../../services/categories.service";

const { TextArea } = Input;

const VALIDATION_RULES = {
  name: [
    { required: true, message: "El nombre es requerido" },
    { min: 3, message: "El nombre debe tener al menos 3 caracteres" },
    { max: 50, message: "El nombre no puede exceder 50 caracteres" },
  ],
  description: [
    { required: true, message: "La descripción es requerida" },
    { max: 200, message: "La descripción no puede exceder 200 caracteres" },
  ],
};

const CategoriesManagement = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ["categories", searchText, currentPage, pageSize],
    queryFn: () =>
      CategoriesService.getCategories({
        search: searchText,
        page: currentPage,
        limit: pageSize,
      }),
  });

  const createCategory = useMutation({
    mutationFn: (data: CategoryCreateInput) =>
      CategoriesService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      message.success("Categoría creada exitosamente");
      handleModalClose();
    },
  });

  const updateCategory = useMutation({
    mutationFn: (data: CategoryUpdateInput) =>
      CategoriesService.updateCategory(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      message.success("Categoría actualizada exitosamente");
      handleModalClose();
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => CategoriesService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      message.success("Categoría eliminada exitosamente");
    },
  });

  const updateSubgroupStatus = useMutation({
    mutationFn: (data: SubgroupStatusUpdate) =>
      CategoriesService.updateSubgroupStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      message.success("Estado del subgrupo actualizado exitosamente");
    },
  });

  const handleModalOpen = useCallback(
    (mode: "create" | "edit" | "view", category: Category | null = null) => {
      setModalMode(mode);
      setSelectedCategory(category);
      if (category) {
        form.setFieldsValue(category);
      } else {
        form.resetFields();
      }
      setIsModalVisible(true);
    },
    [form]
  );

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setSelectedCategory(null);
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(
    async (values: CategoryCreateInput) => {
      try {
        if (modalMode === "create") {
          await createCategory.mutateAsync(values);
        } else {
          await updateCategory.mutateAsync({
            id: selectedCategory!._id,
            ...values,
          });
        }
      } catch (error) {
        message.error("Error al procesar la categoría");
      }
    },
    [modalMode, selectedCategory, createCategory, updateCategory]
  );

  const handleDelete = useCallback(
    (category: Category) => {
      Modal.confirm({
        title: "¿Está seguro de eliminar esta categoría?",
        content: "Esta acción no se puede deshacer",
        okText: "Sí, eliminar",
        cancelText: "Cancelar",
        okType: "danger",
        onOk: () => deleteCategory.mutate(category._id),
      });
    },
    [deleteCategory]
  );

  const columns = useMemo(
    () => [
      {
        title: "Imagen",
        dataIndex: "image",
        key: "image",
        width: 100,
        render: (image: string) => (
          <img
            src={image}
            alt="Categoría"
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
        ),
      },
      {
        title: "Nombre",
        dataIndex: "name",
        key: "name",
        sorter: (a: Category, b: Category) => a.name.localeCompare(b.name),
      },
      {
        title: "Descripción",
        dataIndex: "description",
        key: "description",
        ellipsis: true,
      },
      {
        title: "Subgrupos",
        dataIndex: "subgroups",
        key: "subgroups",
        render: (subgroups: Category["subgroups"], record: Category) => (
          <Space wrap>
            {subgroups?.map((subgroup) => (
              <Tag
                key={subgroup._id}
                color={subgroup.active ? "green" : "red"}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  updateSubgroupStatus.mutate({
                    categoryId: record._id,
                    subgroupId: subgroup._id!,
                    active: !subgroup.active,
                  })
                }
              >
                {subgroup.name}
              </Tag>
            ))}
          </Space>
        ),
      },
      {
        title: "Acciones",
        key: "actions",
        width: 150,
        render: (_: any, record: Category) => (
          <Space>
            <Tooltip title="Ver detalles">
              <Button
                icon={<EyeOutlined />}
                onClick={() => handleModalOpen("view", record)}
              />
            </Tooltip>
            <Tooltip title="Editar">
              <Button
                icon={<EditOutlined />}
                onClick={() => handleModalOpen("edit", record)}
              />
            </Tooltip>
            <Tooltip title="Eliminar">
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [handleModalOpen, handleDelete, updateSubgroupStatus]
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
        <Space>
          <Input
            placeholder="Buscar categorías"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleModalOpen("create")}
          >
            Nueva Categoría
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={data?.categories}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize,
            total: data?.pagination.total,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            },
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} categorías`,
          }}
        />
      </Card>

      <Modal
        title={
          modalMode === "create"
            ? "Nueva Categoría"
            : modalMode === "edit"
            ? "Editar Categoría"
            : "Ver Categoría"
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
          disabled={modalMode === "view"}
        >
          <Form.Item name="name" label="Nombre" rules={VALIDATION_RULES.name}>
            <Input placeholder="Nombre de la categoría" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descripción"
            rules={VALIDATION_RULES.description}
          >
            <TextArea rows={4} placeholder="Descripción de la categoría" />
          </Form.Item>

          <Form.Item name="image" label="Imagen">
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/");
                if (!isImage) {
                  message.error("Solo se permiten archivos de imagen!");
                }
                return isImage ? true : Upload.LIST_IGNORE;
              }}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Subir</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.List name="subgroups">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Space key={field.key} align="baseline">
                    <Form.Item
                      {...field}
                      name={[field.name, "name"]} // Cambiar para acceder al campo 'name'
                      label={index === 0 ? "Subgrupos" : ""}
                      rules={[{ required: true, message: "Nombre requerido" }]}
                    >
                      <Input placeholder="Nombre del subgrupo" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, "active"]}
                      valuePropName="checked"
                    >
                      <Switch defaultChecked />
                    </Form.Item>
                    <Button
                      type="link"
                      danger
                      onClick={() => remove(field.name)}
                      icon={<DeleteOutlined />}
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Agregar Subgrupo
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          {modalMode !== "view" && (
            <div className="flex justify-end gap-2">
              <Button onClick={handleModalClose}>Cancelar</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createCategory.isPending || updateCategory.isPending}
              >
                {modalMode === "create" ? "Crear" : "Actualizar"}
              </Button>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesManagement;
