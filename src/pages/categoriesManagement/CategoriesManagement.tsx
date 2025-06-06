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
  Typography,
  Avatar,
  Badge,
  Empty,
  Divider,
  Skeleton,
  Drawer,
  Collapse,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  EyeOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  TagOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CategoriesService, {
  Category,
  CategoryCreateInput,
  CategoryUpdateInput,
  SubgroupStatusUpdate,
} from "../../services/categories.service";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import FilesService from "../../services/files.service";
import "./styles.css"; // Importar estilos personalizados

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

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
  image: [{ required: true, message: "La imagen es requerida" }],
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
  const [pageSize, setPageSize] = useState(8);
  const [imageUploading, setImageUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  // Estados para el patrón diferido de subida
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);

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
    mutationFn: (data: Omit<Category, '_id'>) =>
      CategoriesService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      message.success("Categoría creada exitosamente");
      handleModalClose();
    },
  });

  const updateCategory = useMutation({
    mutationFn: (data: { id: string } & Partial<Omit<Category, '_id'>>) =>
      CategoriesService.updateCategory(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      message.success("Categoría actualizada exitosamente");
      handleModalClose();
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => CategoriesService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      message.success("Categoría eliminada exitosamente");
    },
  });

  const updateSubgroupStatus = useMutation({
    mutationFn: (data: SubgroupStatusUpdate) =>
      CategoriesService.updateSubgroupStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      message.success("Estado del subgrupo actualizado exitosamente");
    },
  });

  const handleModalOpen = useCallback(
    (mode: "create" | "edit" | "view", category: Category | null = null) => {
      setModalMode(mode);
      setSelectedCategory(category);
      if (category) {
        form.setFieldsValue(category);
        if (category.image) {
          setImageUrl(category.image);
          setImagePreview(category.image); // Para modo edit, usar la imagen existente
          setFileList([
            {
              uid: "-1",
              name: "image.png",
              status: "done",
              url: category.image,
            },
          ]);
        } else {
          setFileList([]);
          setImageUrl("");
          setImagePreview("");
        }
        setImageFile(null); // No hay archivo pendiente en modo edit
      } else {
        form.resetFields();
        setFileList([]);
        setImageUrl("");
        setImagePreview("");
        setImageFile(null);
      }
      setUploadProgress({});
      setIsProcessing(false);
      setIsModalVisible(true);
    },
    [form]
  );

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setSelectedCategory(null);
    form.resetFields();
    setFileList([]);
    setImageUrl("");
    // Limpiar estados del patrón diferido
    setImageFile(null);
    setImagePreview("");
    setUploadProgress({});
    setIsProcessing(false);
  }, [form]);

  const showCategoryDetails = (category: Category) => {
    setSelectedCategory(category);
    setDetailsVisible(true);
  };

  // Función para manejar preparación de imagen (sin subir inmediatamente)
  const handleImageUpload = async (file: RcFile) => {
    if (!beforeUpload(file)) {
      return;
    }

    try {
      // Generar vista previa usando FileReader
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setImageFile(file);
        setImageUrl(""); // Limpiar URL anterior
        
        message.success(
          "Imagen preparada correctamente. Se subirá al guardar la categoría."
        );
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error preparando imagen:", error);
      message.error("Error al preparar la imagen. Por favor, intente nuevamente.");
    }
  };

  const beforeUpload = async (file: RcFile): Promise<boolean> => {
    const allowedFormats = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const isAllowedFormat = allowedFormats.includes(file.type);

    if (!isAllowedFormat) {
      message.error(
        `Formato de archivo no permitido. Solo se aceptan: ${allowedFormats
          .map((f) => f.split("/")[1])
          .join(", ")
          .toUpperCase()}.`
      );
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      message.error(
        "La imagen debe ser menor a 5MB. Por favor, elige un archivo más pequeño."
      );
      return false;
    }

    // Validación de dimensiones
    const isValidDimensions = await new Promise<boolean>((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = document.createElement("img");
        img.src = reader.result as string;
        img.onload = () => {
          const { naturalWidth: width, naturalHeight: height } = img;
          if (width === 300 && height === 300) {
            resolve(true);
          } else {
            message.error("Las dimensiones de la imagen deben ser 300x300px.");
            resolve(false);
          }
        };
        img.onerror = () => {
          message.error(
            "No se pudo cargar la imagen para validar dimensiones."
          );
          resolve(false);
        };
      };
      reader.onerror = () => {
        message.error("Error al leer el archivo para validar dimensiones.");
        resolve(false);
      };
    });

    return isValidDimensions;
  };

  const handleSubmit = useCallback(
    async (values: CategoryCreateInput) => {
      try {
        // Subir imagen si hay una pendiente
        let finalImageUrl = imageUrl;
        if (imageFile) {
          setIsProcessing(true);
          setUploadProgress({ [imageFile.name]: 0 });
          
          try {
            const uploadResult = await FilesService.uploadToGCS(imageFile, 'categories');
            if (uploadResult.success && uploadResult.data) {
              finalImageUrl = uploadResult.data.url;
              setUploadProgress({ [imageFile.name]: 100 });
            }
          } catch (error) {
            message.error("Error al subir la imagen");
            return;
          } finally {
            setTimeout(() => {
              setUploadProgress({});
              setIsProcessing(false);
            }, 1000);
          }
        }

        // Preparar datos para envío
        const dataToSubmit = {
          ...values,
          active: values.active !== undefined ? values.active : true,
          image: finalImageUrl,
          subgroups: values.subgroups?.map(subgroup => ({
            ...subgroup,
            active: subgroup.active !== undefined ? subgroup.active : true
          })) || []
        };

        if (modalMode === "create") {
          await createCategory.mutateAsync(dataToSubmit);
        } else {
          await updateCategory.mutateAsync({
            id: selectedCategory!._id,
            ...dataToSubmit,
          });
        }
      } catch (error) {
        message.error("Error al procesar la categoría");
      }
    },
    [modalMode, selectedCategory, createCategory, updateCategory, imageUrl, imageFile]
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

  const getSubgroupCountBadge = (subgroups: Category["subgroups"]) => {
    if (!subgroups?.length) return null;

    const activeCount = subgroups.filter((s) => s.active).length;
    const totalCount = subgroups.length;

    return (
      <Tooltip title={`${activeCount} activos de ${totalCount} subgrupos`}>
        <Badge
          count={activeCount}
          style={{ backgroundColor: activeCount > 0 ? "#52c41a" : "#f5222d" }}
          overflowCount={99}
          title={`${activeCount}/${totalCount}`}
        >
          <Tag className="cursor-pointer">
            {totalCount} subgrupo{totalCount !== 1 ? "s" : ""}
          </Tag>
        </Badge>
      </Tooltip>
    );
  };

  const columns = useMemo(
    () => [
      {
        title: "",
        dataIndex: "image",
        key: "image",
        width: 70,
        render: (image: string, record: Category) => (
          <Avatar
            src={image}
            alt={record.name}
            shape="square"
            size={50}
            icon={<PictureOutlined />}
            className="shadow-sm"
          />
        ),
      },
      {
        title: "Categoría",
        key: "category",
        render: (_: any, record: Category) => (
          <div>
            <Text strong className="text-base">
              {record.name}
            </Text>
            <div className="mt-1">
              {getSubgroupCountBadge(record.subgroups)}
            </div>
          </div>
        ),
      },
      {
        title: "Acciones",
        key: "actions",
        width: 120,
        render: (_: any, record: Category) => (
          <Space size="small">
            <Tooltip title="Ver detalles">
              <Button
                icon={<EyeOutlined />}
                onClick={() => showCategoryDetails(record)}
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
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
                className="hover:text-red-500"
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [handleModalOpen, handleDelete]
  );

  const handleImageError = (type: "image" | "logo") => {
    if (type === "image") {
      setImageUrl("");
      form.setFieldValue("image", undefined);
    } else {
      form.setFieldValue("logo", undefined);
    }
    message.error(
      `Error al cargar ${
        type === "image" ? "la imagen" : "el logo"
      }. Por favor, intente nuevamente.`
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="mb-6 shadow-sm rounded-lg overflow-hidden border-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <Title level={3} className="mb-0 text-primary-600">
              Gestión de Categorías
            </Title>
            <Text type="secondary">
              Administra las categorías de productos y sus subgrupos
            </Text>
          </div>
          <Space wrap className="w-full md:w-auto">
            <Input
              placeholder="Buscar categorías"
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={(e) => setSearchText(e.target.value)}
              className="min-w-[250px]"
              size="middle"
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleModalOpen("create")}
              size="middle"
              className="flex items-center"
            >
              Nueva Categoría
            </Button>
          </Space>
        </div>

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
            defaultPageSize: 8,
            pageSizeOptions: ["8", "16", "24", "32"],
            showTotal: (total) => `Total ${total} categorías`,
            className: "mt-4",
          }}
          rowClassName="hover:bg-gray-50 transition-colors"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No hay categorías para mostrar"
              />
            ),
          }}
          className="card-table"
          size="middle"
        />
      </Card>

      {/* Drawer para ver detalles de la categoría */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <Avatar
              src={selectedCategory?.image}
              shape="square"
              size={32}
              icon={<PictureOutlined />}
            />
            <span>{selectedCategory?.name}</span>
          </div>
        }
        placement="right"
        onClose={() => setDetailsVisible(false)}
        open={detailsVisible}
        width={450}
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setDetailsVisible(false);
                handleModalOpen("edit", selectedCategory);
              }}
            >
              Editar
            </Button>
          </Space>
        }
      >
        {selectedCategory && (
          <div className="space-y-6">
            <div>
              <Text type="secondary">Descripción</Text>
              <Paragraph>{selectedCategory.description}</Paragraph>
            </div>

            <Divider orientation="left">
              Subgrupos ({selectedCategory.subgroups?.length || 0})
            </Divider>

            {!selectedCategory.subgroups?.length ? (
              <Empty
                description="No hay subgrupos definidos"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <div className="space-y-2">
                {selectedCategory.subgroups.map((subgroup, index) => (
                  <div
                    key={subgroup._id}
                    className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 border-blue-200">
                        {index + 1}
                      </Tag>
                      <Badge status={subgroup.active ? "success" : "error"} />
                      <Text>{subgroup.name}</Text>
                    </div>
                    <Switch
                      checked={subgroup.active}
                      size="small"
                      onChange={(checked) =>
                        updateSubgroupStatus.mutate({
                          categoryId: selectedCategory._id,
                          subgroupId: subgroup._id!,
                          active: checked,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Modal
        title={
          <div className="flex items-center gap-2">
            {modalMode === "create" ? (
              <PlusOutlined className="text-green-500" />
            ) : modalMode === "edit" ? (
              <EditOutlined className="text-blue-500" />
            ) : (
              <EyeOutlined className="text-purple-500" />
            )}
            <span>
              {modalMode === "create"
                ? "Nueva Categoría"
                : modalMode === "edit"
                ? "Editar Categoría"
                : "Detalles de Categoría"}
            </span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1000}
        centered
        bodyStyle={{
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "24px",
          backgroundColor: "#f9fafb",
        }}
        className="category-modal rounded-lg"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="p-2"
          disabled={modalMode === "view"}
          initialValues={{ subgroups: [] }}
        >
          <div className="grid grid-cols-12 gap-6">
            {/* Imagen de la categoría */}
            <div className="col-span-12 md:col-span-4 flex flex-col items-center">
              <Form.Item
                name="image"
                label={
                  <span className="text-base">Imagen de la categoría</span>
                }
                rules={VALIDATION_RULES.image}
                className="w-full"
              >
                <div className="flex flex-col items-center w-full">
                  <Upload
                    name="image"
                    listType="picture-card"
                    className="category-image-uploader text-center w-full"
                    showUploadList={false}
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    beforeUpload={async (file) => {
                      const isValid = await beforeUpload(file);
                      if (isValid) {
                        handleImageUpload(file);
                      }
                      return false; // Siempre retornar false para manejar la subida manualmente
                    }}
                    style={{ width: "100%" }}
                  >
                    {(imagePreview || imageUrl) ? (
                      <div className="relative w-full h-48 overflow-hidden rounded-lg">
                        <img
                          src={imagePreview || imageUrl}
                          alt="imagen"
                          className="w-full h-full object-cover"
                          onError={() => handleImageError("image")}
                        />
                        {(uploadLoading || isProcessing) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <LoadingOutlined className="text-white text-2xl" />
                          </div>
                        )}
                        {imageFile && (
                          <div className="absolute top-2 left-2">
                            <Tag color="orange">Pendiente de subir</Tag>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 h-48 w-full border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                        {(uploadLoading || isProcessing) ? (
                          <LoadingOutlined className="text-2xl mb-2" />
                        ) : (
                          <PlusOutlined className="text-2xl mb-2" />
                        )}
                        <div className="text-sm text-gray-500">
                          Haz clic o arrastra una imagen
                        </div>
                      </div>
                    )}
                  </Upload>
                  <Text
                    type="secondary"
                    className="text-xs block mt-2 text-center"
                  >
                    Tamaño recomendado: 300x300px. Máximo 5MB.
                  </Text>
                </div>
              </Form.Item>
            </div>

            {/* Información básica */}
            <div className="col-span-12 md:col-span-8">
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4 text-gray-700">
                  Información básica
                </h3>
                <Form.Item
                  name="name"
                  label="Nombre"
                  rules={VALIDATION_RULES.name}
                  className="mb-4"
                >
                  <Input
                    placeholder="Nombre de la categoría"
                    size="large"
                    prefix={<TagOutlined className="text-gray-400" />}
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Descripción"
                  rules={VALIDATION_RULES.description}
                >
                  <TextArea
                    rows={4}
                    placeholder="Descripción de la categoría"
                    showCount
                    maxLength={200}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Sección de subgrupos */}
          <div className="mt-6">
            <Card
              title={
                <div className="flex items-center gap-2">
                  <TagOutlined />
                  <span className="font-medium">Subgrupos</span>
                  <Text type="secondary" className="text-xs">
                    (Opcional) - Crear subgrupos para esta categoría
                  </Text>
                </div>
              }
              className="shadow-sm"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    const currentSubgroups =
                      form.getFieldValue("subgroups") || [];
                    form.setFieldValue("subgroups", [
                      ...currentSubgroups,
                      { name: "", active: true },
                    ]);
                  }}
                  size="small"
                >
                  Agregar
                </Button>
              }
            >
              <Form.List name="subgroups">
                {(fields, { add, remove }) => (
                  <div>
                    {fields.length === 0 ? (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No hay subgrupos. Agrega uno para organizar mejor tus productos."
                        className="my-4"
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {fields.map((field, index) => (
                          <div
                            key={field.key}
                            className="bg-white p-3 rounded-md shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 border border-blue-200 font-medium">
                                {index + 1}
                              </div>
                              <Form.Item
                                {...field}
                                name={[field.name, "name"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Nombre requerido",
                                  },
                                ]}
                                className="flex-1 mb-0"
                                label={null}
                              >
                                <Input placeholder="Nombre del subgrupo" />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                name={[field.name, "active"]}
                                valuePropName="checked"
                                className="mb-0"
                                label={null}
                              >
                                <Switch
                                  defaultChecked
                                  checkedChildren="Activo"
                                  unCheckedChildren="Inactivo"
                                />
                              </Form.Item>
                              <Button
                                type="text"
                                danger
                                onClick={() => remove(field.name)}
                                icon={<DeleteOutlined />}
                                className="ml-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Form.List>
            </Card>
          </div>

          {/* Progreso de subida (similar a productos) */}
          {isProcessing && Object.keys(uploadProgress).length > 0 && (
            <Card size="small" bordered className="mt-6 bg-gray-50">
              <Title level={5} style={{ marginBottom: 12, textAlign: "center" }}>
                Subiendo Imagen a Google Cloud Storage
              </Title>
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <Text ellipsis style={{ maxWidth: "65%" }} className="text-sm">
                      {fileName}
                    </Text>
                    <Text type="secondary" className="text-sm">
                      {progress}%
                    </Text>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </Card>
          )}

          {modalMode !== "view" && (
            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={handleModalClose}
                size="large"
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={
                  createCategory.isPending ||
                  updateCategory.isPending ||
                  imageUploading ||
                  isProcessing
                }
                disabled={imageUploading || isProcessing}
                size="large"
                className="min-w-[120px]"
              >
                {isProcessing
                  ? "Subiendo imagen..."
                  : createCategory.isPending || updateCategory.isPending
                  ? "Guardando..."
                  : modalMode === "create" ? "Crear" : "Actualizar"}
              </Button>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesManagement;
