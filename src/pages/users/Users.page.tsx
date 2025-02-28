// src/pages/users/Users.page.tsx
// @ts-nocheck
import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Card,
  Statistic,
  Tabs,
  Badge,
  Switch,
  Tooltip,
  Alert,
  Form,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ShoppingOutlined,
  LockOutlined,
  UnlockOutlined,
  DollarOutlined,
  StarOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import UsersService from "../../services/users.service";
import type {
  User,
  CreateUserData,
  UpdateUserData,
} from "../../types/users.types";
import CreateUserModal from "./components/CreateUserModal";

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

enum UserType {
  ALL = "all",
  ADMIN = "admin",
  CUSTOMER = "customer",
}

const Users = () => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "">(
    ""
  );
  const [userTypeFilter, setUserTypeFilter] = useState<UserType>(
    UserType.CUSTOMER
  );
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<
    "stats" | "purchases" | "reviews"
  >("stats");
  const [form] = Form.useForm();

  // Queries
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["usersManagerPage", searchText, statusFilter, userTypeFilter],
    queryFn: async () => {
      const response = await UsersService.getUsers({
        search: searchText,
        active:
          statusFilter === "active"
            ? true
            : statusFilter === "inactive"
            ? false
            : undefined,
        userType: userTypeFilter,
      });
      return response.data;
    },
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["userStats", selectedUser?._id],
    queryFn: () =>
      selectedUser ? UsersService.getUserStats(selectedUser._id) : null,
    enabled: !!selectedUser && currentTab === "stats",
  });

  const { data: userPurchases, isLoading: purchasesLoading } = useQuery({
    queryKey: ["userPurchases", selectedUser?._id],
    queryFn: () =>
      selectedUser ? UsersService.getUserPurchases(selectedUser._id) : null,
    enabled: !!selectedUser && currentTab === "purchases",
  });

  const { data: userReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["userReviews", selectedUser?._id],
    queryFn: () =>
      selectedUser ? UsersService.getUserReviews(selectedUser._id) : null,
    enabled: !!selectedUser && currentTab === "reviews",
  });

  const toggleMode = useMutation({
    mutationFn: (userId: string) => UsersService.toggleDevelopmentMode(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersManagerPage"] });
      toast.success("Modo de usuario actualizado");
    },
  });

  // Mutations
  const toggleStatus = useMutation({
    mutationFn: (params: { userId: string; active: boolean }) =>
      UsersService.toggleStatus(params.userId, params.active, userTypeFilter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersManagerPage"] });
      toast.success("Estado actualizado correctamente");
    },
    onError: () => {
      toast.error("Error al actualizar el estado del usuario");
    },
  });

  const createUser = useMutation({
    mutationFn: (data: CreateUserData) =>
      userTypeFilter === UserType.ADMIN
        ? UsersService.createAdminUser(data)
        : UsersService.createCustomerUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersManagerPage"] });
      toast.success("Usuario creado correctamente");
      setCreateModalVisible(false);
      form.resetFields();
    },
    onError: () => {
      toast.error("Error al crear el usuario");
    },
  });

  const updateUser = useMutation({
    mutationFn: (data: UpdateUserData) =>
      userTypeFilter === UserType.ADMIN
        ? UsersService.updateAdminUser(editingUser!._id, data)
        : UsersService.updateCustomerUser(editingUser!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersManagerPage"] });
      toast.success("Usuario actualizado correctamente");
      setEditingUser(null);
      form.resetFields();
    },
    onError: () => {
      toast.error("Error al actualizar el usuario");
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) =>
      userTypeFilter === UserType.ADMIN
        ? UsersService.deleteAdminUser(id)
        : UsersService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersManagerPage"] });
      toast.success("Usuario eliminado correctamente");
    },
    onError: () => {
      toast.error("Error al eliminar el usuario");
    },
  });

  const blockUser = useMutation({
    mutationFn: (params: { id: string; reason: string }) =>
      UsersService.blockUser(params.id, params.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersManagerPage"] });
      toast.success("Usuario bloqueado correctamente");
    },
    onError: () => {
      toast.error("Error al bloquear el usuario");
    },
  });

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: User) => (
        <Space>
          <Badge status={record.active ? "success" : "error"} />
          {text}
          {record.role === "admin" && <Tag color="purple">Admin</Tag>}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Fecha Registro",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Estado",
      key: "active",
      render: (_: any, record: User) => (
        <Switch
          checked={record.active}
          onChange={(checked) =>
            toggleStatus.mutate({ userId: record._id, active: checked })
          }
          checkedChildren={<UnlockOutlined />}
          unCheckedChildren={<LockOutlined />}
          loading={toggleStatus.isPending}
          disabled={
            record.role === "admin" && userTypeFilter === UserType.ADMIN
          }
        />
      ),
    },
    {
      title: "Modo",
      key: "mode",
      render: (_: any, record: User) => (
        <Switch
          checked={record.isDevelopment}
          onChange={() => toggleMode.mutate(record._id)}
          checkedChildren="Dev"
          unCheckedChildren="Prod"
          loading={toggleMode.isPending}
        />
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: User) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button
              icon={<UserOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setDetailsModalVisible(true);
                setCurrentTab("stats");
              }}
            >
              Detalles
            </Button>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: User) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button
              icon={<UserOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setDetailsModalVisible(true);
                setCurrentTab("stats");
              }}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingUser(record);
                form.setFieldsValue(record);
              }}
            />
          </Tooltip>
          <Tooltip title={record.active ? "Bloquear" : "Desbloquear"}>
            <Button
              icon={record.active ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => {
                if (record.active) {
                  Modal.confirm({
                    title: "Bloquear usuario",
                    content: (
                      <Form.Item label="Razón del bloqueo" required>
                        <TextArea
                          onChange={(e) => {
                            (Modal.confirm as any).reason = e.target.value;
                          }}
                        />
                      </Form.Item>
                    ),
                    onOk: () => {
                      blockUser.mutate({
                        id: record._id,
                        reason: (Modal.confirm as any).reason,
                      });
                    },
                  });
                } else {
                  UsersService.unblockUser(record._id)
                    .then(() => {
                      queryClient.invalidateQueries({
                        queryKey: ["usersManagerPage"],
                      });
                      toast.success("Usuario desbloqueado correctamente");
                    })
                    .catch(() => {
                      toast.error("Error al desbloquear el usuario");
                    });
                }
              }}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: "¿Estás seguro de eliminar este usuario?",
                  content: "Esta acción no se puede deshacer",
                  okText: "Sí, eliminar",
                  okType: "danger",
                  cancelText: "Cancelar",
                  onOk: () => deleteUser.mutate(record._id),
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderUserDetails = () => {
    const loadingStates = {
      stats: statsLoading,
      purchases: purchasesLoading,
      reviews: reviewsLoading,
    };

    if (loadingStates[currentTab]) {
      return <Alert message="Cargando información..." type="info" />;
    }

    switch (currentTab) {
      case "stats":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <Statistic
                title="Antigüedad de la cuenta (días)"
                value={userStats?.overview?.accountAge?.days || 0}
                prefix={<CalendarOutlined />}
              />
            </Card>
            <Card>
              <Statistic
                title="Total compras"
                value={userStats?.orders?.total || 0}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
            <Card>
              <Statistic
                title="Total gastado"
                value={userStats?.orders?.totalSpent / 100 || 0}
                prefix={<DollarOutlined />}
                precision={2}
              />
            </Card>
            <Card>
              <Statistic
                title="Última compra"
                value={
                  userStats?.orders?.lastOrderDate
                    ? dayjs(userStats.orders.lastOrderDate).format("DD/MM/YYYY")
                    : "Sin compras"
                }
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
            <Card>
              <Statistic
                title="Promedio por compra"
                value={userStats?.orders?.avgOrderValue / 100 || 0}
                prefix={<DollarOutlined />}
                precision={2}
              />
            </Card>
            <Card>
              <Statistic
                title="Reseñas totales"
                value={userStats?.reviews?.total || 0}
                prefix={<StarOutlined />}
              />
            </Card>
            {userStats?.averageRating && (
              <Card>
                <Statistic
                  title="Calificación promedio"
                  value={userStats?.reviews?.avgRating}
                  precision={1}
                  suffix="/5"
                  prefix={<StarOutlined />}
                />
              </Card>
            )}
          </div>
        );

      case "purchases":
        return (
          <Table
            dataSource={userPurchases?.orders ?? []}
            columns={[
              {
                title: "ID Pedido",
                dataIndex: "tracking_number",
                width: 100,
              },
              {
                title: "Productos",
                dataIndex: "items",
                render: (products) => (
                  <ul className="list-none p-0">
                    {products.map((p: any) => (
                      <li key={p._id} className="mb-1">
                        {p.product.name} - ${p.product.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                title: "Total",
                dataIndex: "total",
                render: (total) => `$${total.toFixed(2)}`,
                width: 120,
              },
              {
                title: "Estado",
                dataIndex: "status",
                width: 120,
                render: (status: string) => {
                  const colors = {
                    pending: "gold",
                    processing: "blue",
                    completed: "green",
                    cancelled: "red",
                  };
                  return (
                    <Tag color={colors[status] || "default"}>
                      {status.toUpperCase()}
                    </Tag>
                  );
                },
              },
              {
                title: "Fecha",
                dataIndex: "createdAt",
                render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
                width: 150,
              },
            ]}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
            }}
          />
        );

      case "reviews":
        return (
          <Table
            dataSource={userReviews?.reviews}
            columns={[
              {
                title: "Producto",
                dataIndex: "product",
                ellipsis: true,
                render: (e) => {
                  return e.name;
                },
              },
              {
                title: "Calificación",
                dataIndex: "rating",
                width: 120,
                render: (rating) => {
                  return "⭐".repeat(rating);
                },
              },
              {
                title: "Comentario",
                dataIndex: "original_content",
                ellipsis: true,
                render: (e) => {
                  return e?.content;
                },
              },
              {
                title: "Fecha",
                dataIndex: "createdAt",
                width: 150,
                render: (date) => dayjs(date).format("DD/MM/YYYY"),
              },
            ]}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCreateModalVisible(true);
                form.resetFields();
              }}
            >
              Nuevo Usuario
            </Button>

            <Input
              placeholder="Buscar usuarios"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              value={userTypeFilter}
              onChange={setUserTypeFilter}
              style={{ width: 150 }}
            >
              <Option value={UserType.CUSTOMER}>Clientes</Option>
              <Option value={UserType.ADMIN}>Administradores</Option>
              <Option value={UserType.ALL}>Todos</Option>
            </Select>
            <Select
              placeholder="Estado"
              allowClear
              onChange={(value) => setStatusFilter(value)}
              style={{ width: 120 }}
            >
              <Option value="active">Activos</Option>
              <Option value="inactive">Inactivos</Option>
            </Select>
          </Space>
        </div>

        <Table
          dataSource={usersData?.users || []}
          columns={columns}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            total: usersData?.pagination?.total || 0,
            pageSize: usersData?.pagination?.limit || 10,
            current: usersData?.pagination?.page || 1,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} usuarios`,
          }}
        />
      </div>

      {/* Modal de Creación */}
      <CreateUserModal
        visible={createModalVisible}
        loading={createUser.isPending}
        onClose={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onSubmit={(values) => {
          createUser.mutate(values);
        }}
      />

      {/* Modal de Edición */}
      <Modal
        title="Editar Usuario"
        open={!!editingUser}
        onCancel={() => {
          setEditingUser(null);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setEditingUser(null)}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updateUser.isPending}
            onClick={() => form.submit()}
          >
            Actualizar
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={updateUser.mutate}>
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: "El nombre es requerido" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "El email es requerido" },
              { type: "email", message: "Email inválido" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Nueva contraseña"
            help="Dejar en blanco para mantener la actual"
          >
            <Input.Password />
          </Form.Item>
          {userTypeFilter === UserType.ADMIN && (
            <Form.Item name="permissions" label="Permisos">
              <Select mode="multiple">
                <Option value="manage_users">Gestionar usuarios</Option>
                <Option value="manage_products">Gestionar productos</Option>
                <Option value="manage_orders">Gestionar pedidos</Option>
                {/* Agregar más permisos según necesites */}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Modal de Detalles */}
      <Modal
        title={`Detalles de Usuario - ${selectedUser?.name}`}
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedUser(null);
        }}
        width={1000}
        footer={null}
      >
        <Tabs
          activeKey={currentTab}
          onChange={(key: any) => setCurrentTab(key)}
          className="mb-4"
        >
          <TabPane
            tab={
              <span>
                <ShoppingCartOutlined /> Estadísticas
              </span>
            }
            key="stats"
          />
          <TabPane
            tab={
              <span>
                <ShoppingOutlined /> Compras
              </span>
            }
            key="purchases"
          />
          <TabPane
            tab={
              <span>
                <StarOutlined /> Reseñas
              </span>
            }
            key="reviews"
          />
        </Tabs>

        {renderUserDetails()}
      </Modal>
    </div>
  );
};

export default Users;
