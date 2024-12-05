import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/orders/Orders.page.tsx
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Tag, Button, Space, DatePicker, Select, Modal, Form, Input, message, Timeline, } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import OrdersService from "../../services/orders.service";
const { RangePicker } = DatePicker;
const Orders = () => {
    const queryClient = useQueryClient();
    const [dateRange, setDateRange] = React.useState(null);
    const [statusFilter, setStatusFilter] = React.useState("");
    const [selectedOrder, setSelectedOrder] = React.useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [form] = Form.useForm();
    // Query para obtener órdenes
    const { data: ordersData, isLoading } = useQuery({
        queryKey: ["orders", dateRange, statusFilter],
        queryFn: () => OrdersService.getOrders({
            fromDate: dateRange?.[0].format("YYYY-MM-DD"),
            toDate: dateRange?.[1].format("YYYY-MM-DD"),
            status: statusFilter || undefined,
        }),
    });
    // Mutación para actualizar estado
    const updateStatus = useMutation({
        mutationFn: ({ orderId, data }) => OrdersService.updateOrderStatus(orderId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            message.success("Estado actualizado correctamente");
            setIsEditModalOpen(false);
        },
        onError: (error) => {
            message.error(error.message);
        },
    });
    // Columnas de la tabla
    const columns = [
        {
            title: "Número de Orden",
            dataIndex: "order_number",
            key: "order_number",
        },
        {
            title: "Cliente",
            dataIndex: "user",
            key: "user",
            render: (user) => `${user.name} (${user.email})`,
        },
        {
            title: "Total",
            dataIndex: "total",
            key: "total",
            render: (total) => total.toLocaleString("es-CO", { style: "currency", currency: "COP" }),
        },
        {
            title: "Estado",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const statusColors = {
                    pending: "gold",
                    processing: "blue",
                    completed: "green",
                    cancelled: "red",
                    refunded: "purple",
                };
                return _jsx(Tag, { color: statusColors[status], children: status.toUpperCase() });
            },
        },
        {
            title: "Fecha",
            dataIndex: "created_at",
            key: "created_at",
            render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: "Acciones",
            key: "actions",
            render: (_, record) => (_jsxs(Space, { children: [_jsx(Button, { icon: _jsx(EyeOutlined, {}), onClick: () => {
                            setSelectedOrder(record);
                            setIsViewModalOpen(true);
                        } }), _jsx(Button, { icon: _jsx(EditOutlined, {}), onClick: () => {
                            setSelectedOrder(record);
                            form.setFieldsValue({
                                status: record.status,
                                comment: "",
                                tracking_number: "",
                            });
                            setIsEditModalOpen(true);
                        } })] })),
        },
    ];
    // Manejadores
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };
    const handleStatusUpdate = async () => {
        if (!selectedOrder)
            return;
        try {
            const values = await form.validateFields();
            updateStatus.mutate({
                orderId: selectedOrder.id,
                data: values,
            });
        }
        catch (error) {
            console.error("Validation failed:", error);
        }
    };
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-6 flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Gesti\u00F3n de Pedidos" }), _jsxs(Space, { children: [_jsx(RangePicker, { onChange: handleDateRangeChange }), _jsx(Select, { placeholder: "Filtrar por estado", allowClear: true, style: { width: 200 }, onChange: (value) => setStatusFilter(value), options: [
                                    { label: "Pendiente", value: "pending" },
                                    { label: "En Proceso", value: "processing" },
                                    { label: "Completado", value: "completed" },
                                    { label: "Cancelado", value: "cancelled" },
                                    { label: "Reembolsado", value: "refunded" },
                                ] })] })] }), _jsx(Table, { columns: columns, dataSource: ordersData?.data.orders, loading: isLoading, rowKey: "id", pagination: {
                    total: ordersData?.pagination?.total || 0,
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} pedidos`,
                } }), _jsx(Modal, { title: `Detalles del Pedido #${selectedOrder?.order_number}`, open: isViewModalOpen, onCancel: () => {
                    setIsViewModalOpen(false);
                    setSelectedOrder(null);
                }, footer: null, width: 800, children: selectedOrder && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold mb-2", children: "Informaci\u00F3n del Cliente" }), _jsxs("p", { children: ["Nombre: ", selectedOrder.user.name] }), _jsxs("p", { children: ["Email: ", selectedOrder.user.email] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold mb-2", children: "Informaci\u00F3n del Pedido" }), _jsxs("p", { children: ["Estado:", _jsx(Tag, { color: selectedOrder.status === "completed"
                                                        ? "green"
                                                        : selectedOrder.status === "processing"
                                                            ? "blue"
                                                            : selectedOrder.status === "cancelled"
                                                                ? "red"
                                                                : selectedOrder.status === "refunded"
                                                                    ? "purple"
                                                                    : "gold", className: "ml-2", children: selectedOrder.status.toUpperCase() })] }), _jsxs("p", { children: ["Fecha:", " ", dayjs(selectedOrder.created_at).format("DD/MM/YYYY HH:mm")] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold mb-2", children: "Productos" }), _jsx(Table, { dataSource: selectedOrder.items, pagination: false, columns: [
                                        {
                                            title: "Producto",
                                            dataIndex: ["product", "name"],
                                            key: "name",
                                        },
                                        {
                                            title: "Código",
                                            dataIndex: ["product", "code"],
                                            key: "code",
                                        },
                                        {
                                            title: "Cantidad",
                                            dataIndex: "quantity",
                                            key: "quantity",
                                        },
                                        {
                                            title: "Precio",
                                            dataIndex: "price",
                                            key: "price",
                                            render: (price) => price.toLocaleString("es-CO", {
                                                style: "currency",
                                                currency: "COP",
                                            }),
                                        },
                                        {
                                            title: "Subtotal",
                                            key: "subtotal",
                                            render: (_, record) => (record.price * record.quantity).toLocaleString("es-CO", {
                                                style: "currency",
                                                currency: "COP",
                                            }),
                                        },
                                    ], summary: (pageData) => {
                                        const total = pageData.reduce((acc, current) => acc + current.price * current.quantity, 0);
                                        return (_jsxs(Table.Summary.Row, { children: [_jsx(Table.Summary.Cell, { index: 0, colSpan: 4, children: "Total" }), _jsx(Table.Summary.Cell, { index: 1, children: total.toLocaleString("es-CO", {
                                                        style: "currency",
                                                        currency: "COP",
                                                    }) })] }));
                                    } })] }), selectedOrder.status_history &&
                            selectedOrder.status_history.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-bold mb-2", children: "Historial de Estados" }), _jsx(Timeline, { children: selectedOrder.status_history.map((history, index) => (_jsxs(Timeline.Item, { children: [_jsx("p", { children: history.status.toUpperCase() }), history.comment && (_jsx("p", { className: "text-gray-500", children: history.comment })), _jsx("p", { className: "text-sm text-gray-400", children: dayjs(history.date).format("DD/MM/YYYY HH:mm") })] }, index))) })] }))] })) }), _jsx(Modal, { title: `Actualizar Estado - Pedido #${selectedOrder?.order_number}`, open: isEditModalOpen, onOk: handleStatusUpdate, onCancel: () => {
                    setIsEditModalOpen(false);
                    setSelectedOrder(null);
                    form.resetFields();
                }, confirmLoading: updateStatus.isPending, children: _jsxs(Form, { form: form, layout: "vertical", children: [_jsx(Form.Item, { name: "status", label: "Estado", rules: [
                                { required: true, message: "Por favor seleccione un estado" },
                            ], children: _jsx(Select, { options: [
                                    { label: "Pendiente", value: "pending" },
                                    { label: "En Proceso", value: "processing" },
                                    { label: "Completado", value: "completed" },
                                    { label: "Cancelado", value: "cancelled" },
                                    { label: "Reembolsado", value: "refunded" },
                                ] }) }), _jsx(Form.Item, { name: "tracking_number", label: "N\u00FAmero de Seguimiento", children: _jsx(Input, { placeholder: "Ingrese el n\u00FAmero de seguimiento" }) }), _jsx(Form.Item, { name: "comment", label: "Comentario", children: _jsx(Input.TextArea, { rows: 4, placeholder: "Agregue un comentario sobre el cambio de estado" }) })] }) })] }));
};
export default Orders;
