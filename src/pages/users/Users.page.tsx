// src/pages/users/Users.page.tsx
// @ts-nocheck
import { useState } from "react";
import { Button, Modal, Form, Select, Tabs, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import UsersService from "../../services/users.service";
import type {
  User,
  CreateUserData,
  UpdateUserData,
} from "../../types/users.types";
import CreateUserModal from "./components/CreateUserModal";
import UserTable from "./components/UserTable";
import UserDetailsModal from "./components/UserDetailsModal";
import UserFilters from "./components/UserFilters";

const { Option } = Select;

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

  // Session management mutations
  const refreshToken = useMutation({
    mutationFn: (userId: string) => UsersService.refreshToken(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersManagerPage"] });
      toast.success("Token renovado correctamente");
    },
    onError: () => {
      toast.error("Error al renovar el token");
    },
  });

  const invalidateSessions = useMutation({
    mutationFn: (userId: string) => UsersService.invalidateSessions(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersManagerPage"] });
      toast.success("Sesiones invalidadas correctamente");
    },
    onError: () => {
      toast.error("Error al invalidar las sesiones");
    },
  });

  const logoutUser = useMutation({
    mutationFn: (userId: string) => UsersService.logoutUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersManagerPage"] });
      toast.success("Usuario desconectado correctamente");
    },
    onError: () => {
      toast.error("Error al desconectar al usuario");
    },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
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
      </div>

      <UserFilters
        searchText={searchText}
        statusFilter={statusFilter}
        userTypeFilter={userTypeFilter}
        onSearchChange={setSearchText}
        onStatusFilterChange={setStatusFilter}
        onUserTypeFilterChange={setUserTypeFilter}
      />

      <UserTable
        users={usersData?.users || []}
        loading={isLoading}
        userTypeFilter={userTypeFilter}
        onViewDetails={(user) => {
          setSelectedUser(user);
          setDetailsModalVisible(true);
          setCurrentTab("stats");
        }}
        onEdit={(user) => {
          setEditingUser(user);
          form.setFieldsValue(user);
        }}
        onToggleStatus={(userId, active) =>
          toggleStatus.mutate({ userId, active })
        }
        onToggleMode={(userId) => toggleMode.mutate(userId)}
        onDelete={(userId) => deleteUser.mutate(userId)}
        onBlock={(userId, reason) => blockUser.mutate({ id: userId, reason })}
        onUnblock={(userId) =>
          UsersService.unblockUser(userId)
            .then(() => {
              queryClient.invalidateQueries({
                queryKey: ["usersManagerPage"],
              });
              toast.success("Usuario desbloqueado correctamente");
            })
            .catch(() => {
              toast.error("Error al desbloquear el usuario");
            })
        }
        onRefreshToken={(userId) => refreshToken.mutate(userId)}
        onInvalidateSessions={(userId) => invalidateSessions.mutate(userId)}
        onLogout={(userId) => logoutUser.mutate(userId)}
        isToggleStatusLoading={toggleStatus.isPending}
        isToggleModeLoading={toggleMode.isPending}
        pagination={{
          total: usersData?.pagination?.total || 0,
          pageSize: usersData?.pagination?.limit || 10,
          current: usersData?.pagination?.page || 1,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} usuarios`,
        }}
      />

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
      <UserDetailsModal
        user={selectedUser}
        visible={detailsModalVisible}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedUser(null);
        }}
        userStats={userStats}
        userPurchases={userPurchases}
        userReviews={userReviews}
        loading={{
          stats: statsLoading,
          purchases: purchasesLoading,
          reviews: reviewsLoading
        }}
      />
    </div>
  );
};

export default Users;
