import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/users/Users.page.tsx
import { useState } from "react";
import { Table, Tag, Button, Space, Input, Select, Modal, Card, Statistic, Tabs, Badge, Switch, Tooltip, Alert, Form, } from "antd";
import { SearchOutlined, UserOutlined, ShoppingOutlined, LockOutlined, UnlockOutlined, DollarOutlined, StarOutlined, ShoppingCartOutlined, PlusOutlined, EditOutlined, DeleteOutlined, } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import UsersService from "../../services/users.service";
import CreateUserModal from "./components/CreateUserModal";
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
var UserType;
(function (UserType) {
    UserType["ALL"] = "all";
    UserType["ADMIN"] = "admin";
    UserType["CUSTOMER"] = "customer";
})(UserType || (UserType = {}));
const Users = () => {
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [userTypeFilter, setUserTypeFilter] = useState(UserType.CUSTOMER);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [currentTab, setCurrentTab] = useState("stats");
    const [form] = Form.useForm();
    // Queries
    const { data: usersData, isLoading } = useQuery({
        queryKey: ["usersPage", searchText, statusFilter, userTypeFilter],
        queryFn: async () => {
            const response = await UsersService.getUsers({
                search: searchText,
                active: statusFilter === "active"
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
        queryFn: () => selectedUser ? UsersService.getUserStats(selectedUser._id) : null,
        enabled: !!selectedUser && currentTab === "stats",
    });
    const { data: userPurchases, isLoading: purchasesLoading } = useQuery({
        queryKey: ["userPurchases", selectedUser?._id],
        queryFn: () => selectedUser ? UsersService.getUserPurchases(selectedUser._id) : null,
        enabled: !!selectedUser && currentTab === "purchases",
    });
    const { data: userReviews, isLoading: reviewsLoading } = useQuery({
        queryKey: ["userReviews", selectedUser?._id],
        queryFn: () => selectedUser ? UsersService.getUserReviews(selectedUser._id) : null,
        enabled: !!selectedUser && currentTab === "reviews",
    });
    // Mutations
    const toggleStatus = useMutation({
        mutationFn: (params) => UsersService.toggleStatus(params.userId, params.active, userTypeFilter),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usersPage"] });
            toast.success("Estado actualizado correctamente");
        },
        onError: () => {
            toast.error("Error al actualizar el estado del usuario");
        },
    });
    const createUser = useMutation({
        mutationFn: (data) => userTypeFilter === UserType.ADMIN
            ? UsersService.createAdminUser(data)
            : UsersService.createCustomerUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usersPage"] });
            toast.success("Usuario creado correctamente");
            setCreateModalVisible(false);
            form.resetFields();
        },
        onError: () => {
            toast.error("Error al crear el usuario");
        },
    });
    const updateUser = useMutation({
        mutationFn: (data) => userTypeFilter === UserType.ADMIN
            ? UsersService.updateAdminUser(editingUser._id, data)
            : UsersService.updateCustomerUser(editingUser._id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usersPage"] });
            toast.success("Usuario actualizado correctamente");
            setEditingUser(null);
            form.resetFields();
        },
        onError: () => {
            toast.error("Error al actualizar el usuario");
        },
    });
    const deleteUser = useMutation({
        mutationFn: (id) => userTypeFilter === UserType.ADMIN
            ? UsersService.deleteAdminUser(id)
            : UsersService.deleteCustomer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usersPage"] });
            toast.success("Usuario eliminado correctamente");
        },
        onError: () => {
            toast.error("Error al eliminar el usuario");
        },
    });
    const blockUser = useMutation({
        mutationFn: (params) => UsersService.blockUser(params.id, params.reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usersPage"] });
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
            render: (text, record) => (_jsxs(Space, { children: [_jsx(Badge, { status: record.active ? "success" : "error" }), text, record.role === "admin" && _jsx(Tag, { color: "purple", children: "Admin" })] })),
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
            render: (date) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
            title: "Estado",
            key: "active",
            render: (_, record) => (_jsx(Switch, { checked: record.active, onChange: (checked) => toggleStatus.mutate({ userId: record._id, active: checked }), checkedChildren: _jsx(UnlockOutlined, {}), unCheckedChildren: _jsx(LockOutlined, {}), loading: toggleStatus.isPending, disabled: record.role === "admin" && userTypeFilter === UserType.ADMIN })),
        },
        {
            title: "Acciones",
            key: "actions",
            render: (_, record) => (_jsx(Space, { children: _jsx(Tooltip, { title: "Ver detalles", children: _jsx(Button, { icon: _jsx(UserOutlined, {}), onClick: () => {
                            setSelectedUser(record);
                            setDetailsModalVisible(true);
                            setCurrentTab("stats");
                        }, children: "Detalles" }) }) })),
        },
        {
            title: "Acciones",
            key: "actions",
            render: (_, record) => (_jsxs(Space, { children: [_jsx(Tooltip, { title: "Ver detalles", children: _jsx(Button, { icon: _jsx(UserOutlined, {}), onClick: () => {
                                setSelectedUser(record);
                                setDetailsModalVisible(true);
                                setCurrentTab("stats");
                            } }) }), _jsx(Tooltip, { title: "Editar", children: _jsx(Button, { icon: _jsx(EditOutlined, {}), onClick: () => {
                                setEditingUser(record);
                                form.setFieldsValue(record);
                            } }) }), _jsx(Tooltip, { title: record.active ? "Bloquear" : "Desbloquear", children: _jsx(Button, { icon: record.active ? _jsx(LockOutlined, {}) : _jsx(UnlockOutlined, {}), onClick: () => {
                                if (record.active) {
                                    Modal.confirm({
                                        title: "Bloquear usuario",
                                        content: (_jsx(Form.Item, { label: "Raz\u00F3n del bloqueo", required: true, children: _jsx(TextArea, { onChange: (e) => {
                                                    Modal.confirm.reason = e.target.value;
                                                } }) })),
                                        onOk: () => {
                                            blockUser.mutate({
                                                id: record._id,
                                                reason: Modal.confirm.reason,
                                            });
                                        },
                                    });
                                }
                                else {
                                    UsersService.unblockUser(record._id)
                                        .then(() => {
                                        queryClient.invalidateQueries({
                                            queryKey: ["usersPage"],
                                        });
                                        toast.success("Usuario desbloqueado correctamente");
                                    })
                                        .catch(() => {
                                        toast.error("Error al desbloquear el usuario");
                                    });
                                }
                            } }) }), _jsx(Tooltip, { title: "Eliminar", children: _jsx(Button, { danger: true, icon: _jsx(DeleteOutlined, {}), onClick: () => {
                                Modal.confirm({
                                    title: "¿Estás seguro de eliminar este usuario?",
                                    content: "Esta acción no se puede deshacer",
                                    okText: "Sí, eliminar",
                                    okType: "danger",
                                    cancelText: "Cancelar",
                                    onOk: () => deleteUser.mutate(record._id),
                                });
                            } }) })] })),
        },
    ];
    const renderUserDetails = () => {
        const loadingStates = {
            stats: statsLoading,
            purchases: purchasesLoading,
            reviews: reviewsLoading,
        };
        if (loadingStates[currentTab]) {
            return _jsx(Alert, { message: "Cargando informaci\u00F3n...", type: "info" });
        }
        switch (currentTab) {
            case "stats":
                return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsx(Card, { children: _jsx(Statistic, { title: "Total compras", value: userStats?.totalOrders || 0, prefix: _jsx(ShoppingCartOutlined, {}) }) }), _jsx(Card, { children: _jsx(Statistic, { title: "Total gastado", value: userStats?.totalSpent || 0, prefix: _jsx(DollarOutlined, {}), precision: 2 }) }), _jsx(Card, { children: _jsx(Statistic, { title: "Promedio por compra", value: userStats?.averagePurchase || 0, prefix: _jsx(DollarOutlined, {}), precision: 2 }) }), _jsx(Card, { children: _jsx(Statistic, { title: "Rese\u00F1as totales", value: userStats?.totalReviews || 0, prefix: _jsx(StarOutlined, {}) }) }), userStats?.averageRating && (_jsx(Card, { children: _jsx(Statistic, { title: "Calificaci\u00F3n promedio", value: userStats.averageRating, precision: 1, suffix: "/5", prefix: _jsx(StarOutlined, {}) }) }))] }));
            case "purchases":
                return (_jsx(Table, { dataSource: userPurchases, columns: [
                        {
                            title: "ID Pedido",
                            dataIndex: "orderId",
                            width: 100,
                        },
                        {
                            title: "Productos",
                            dataIndex: "products",
                            render: (products) => (_jsx("ul", { className: "list-none p-0", children: products.map((p) => (_jsxs("li", { className: "mb-1", children: [p.name, " x", p.quantity, " - $", p.price.toFixed(2)] }, p.productId))) })),
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
                            render: (status) => {
                                const colors = {
                                    pending: "gold",
                                    processing: "blue",
                                    completed: "green",
                                    cancelled: "red",
                                };
                                return (_jsx(Tag, { color: colors[status] || "default", children: status.toUpperCase() }));
                            },
                        },
                        {
                            title: "Fecha",
                            dataIndex: "createdAt",
                            render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
                            width: 150,
                        },
                    ], pagination: {
                        pageSize: 5,
                        showSizeChanger: false,
                    } }));
            case "reviews":
                return (_jsx(Table, { dataSource: userReviews, columns: [
                        {
                            title: "Producto",
                            dataIndex: "productName",
                            ellipsis: true,
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
                            dataIndex: "comment",
                            ellipsis: true,
                        },
                        {
                            title: "Fecha",
                            dataIndex: "createdAt",
                            width: 150,
                            render: (date) => dayjs(date).format("DD/MM/YYYY"),
                        },
                    ], pagination: {
                        pageSize: 5,
                        showSizeChanger: false,
                    } }));
            default:
                return null;
        }
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Gesti\u00F3n de Usuarios" }), _jsxs(Space, { children: [_jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: () => {
                                            setCreateModalVisible(true);
                                            form.resetFields();
                                        }, children: "Nuevo Usuario" }), _jsx(Input, { placeholder: "Buscar usuarios", prefix: _jsx(SearchOutlined, {}), onChange: (e) => setSearchText(e.target.value), style: { width: 200 } }), _jsxs(Select, { value: userTypeFilter, onChange: setUserTypeFilter, style: { width: 150 }, children: [_jsx(Option, { value: UserType.CUSTOMER, children: "Clientes" }), _jsx(Option, { value: UserType.ADMIN, children: "Administradores" }), _jsx(Option, { value: UserType.ALL, children: "Todos" })] }), _jsxs(Select, { placeholder: "Estado", allowClear: true, onChange: (value) => setStatusFilter(value), style: { width: 120 }, children: [_jsx(Option, { value: "active", children: "Activos" }), _jsx(Option, { value: "inactive", children: "Inactivos" })] })] })] }), _jsx(Table, { dataSource: usersData?.users || [], columns: columns, loading: isLoading, rowKey: "_id", pagination: {
                            total: usersData?.pagination?.total || 0,
                            pageSize: usersData?.pagination?.limit || 10,
                            current: usersData?.pagination?.page || 1,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} usuarios`,
                        } })] }), _jsx(CreateUserModal, { visible: createModalVisible, loading: createUser.isPending, onClose: () => {
                    setCreateModalVisible(false);
                    form.resetFields();
                }, onSubmit: (values) => {
                    createUser.mutate(values);
                } }), _jsx(Modal, { title: "Editar Usuario", open: !!editingUser, onCancel: () => {
                    setEditingUser(null);
                    form.resetFields();
                }, footer: [
                    _jsx(Button, { onClick: () => setEditingUser(null), children: "Cancelar" }, "cancel"),
                    _jsx(Button, { type: "primary", loading: updateUser.isPending, onClick: () => form.submit(), children: "Actualizar" }, "submit"),
                ], children: _jsxs(Form, { form: form, layout: "vertical", onFinish: updateUser.mutate, children: [_jsx(Form.Item, { name: "name", label: "Nombre", rules: [{ required: true, message: "El nombre es requerido" }], children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "email", label: "Email", rules: [
                                { required: true, message: "El email es requerido" },
                                { type: "email", message: "Email inválido" },
                            ], children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "password", label: "Nueva contrase\u00F1a", help: "Dejar en blanco para mantener la actual", children: _jsx(Input.Password, {}) }), userTypeFilter === UserType.ADMIN && (_jsx(Form.Item, { name: "permissions", label: "Permisos", children: _jsxs(Select, { mode: "multiple", children: [_jsx(Option, { value: "manage_users", children: "Gestionar usuarios" }), _jsx(Option, { value: "manage_products", children: "Gestionar productos" }), _jsx(Option, { value: "manage_orders", children: "Gestionar pedidos" })] }) }))] }) }), _jsxs(Modal, { title: `Detalles de Usuario - ${selectedUser?.name}`, open: detailsModalVisible, onCancel: () => {
                    setDetailsModalVisible(false);
                    setSelectedUser(null);
                }, width: 1000, footer: null, children: [_jsxs(Tabs, { activeKey: currentTab, onChange: (key) => setCurrentTab(key), className: "mb-4", children: [_jsx(TabPane, { tab: _jsxs("span", { children: [_jsx(ShoppingCartOutlined, {}), " Estad\u00EDsticas"] }) }, "stats"), _jsx(TabPane, { tab: _jsxs("span", { children: [_jsx(ShoppingOutlined, {}), " Compras"] }) }, "purchases"), _jsx(TabPane, { tab: _jsxs("span", { children: [_jsx(StarOutlined, {}), " Rese\u00F1as"] }) }, "reviews")] }), renderUserDetails()] })] }));
};
export default Users;
