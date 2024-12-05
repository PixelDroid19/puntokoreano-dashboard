// src/pages/orders/Orders.page.tsx
// @ts-nocheck
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Tag,
  Button,
  Space,
  DatePicker,
  Select,
  Modal,
  Form,
  Input,
  message,
  Timeline,
} from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import type { RangePickerProps } from "antd/es/date-picker";

import { Order, OrderStatus } from "../../types/orders";
import dayjs from "dayjs";
import OrdersService from "../../services/orders.service";

const { RangePicker } = DatePicker;

const Orders = () => {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = React.useState<
    [dayjs.Dayjs, dayjs.Dayjs] | null
  >(null);
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "">("");
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [form] = Form.useForm();

  // Query para obtener órdenes
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", dateRange, statusFilter],
    queryFn: () =>
      OrdersService.getOrders({
        fromDate: dateRange?.[0].format("YYYY-MM-DD"),
        toDate: dateRange?.[1].format("YYYY-MM-DD"),
        status: statusFilter || undefined,
      }),
  });

  // Mutación para actualizar estado
  const updateStatus = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: any }) =>
      OrdersService.updateOrderStatus(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      message.success("Estado actualizado correctamente");
      setIsEditModalOpen(false);
    },
    onError: (error: Error) => {
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
      render: (user: Order["user"]) => `${user.name} (${user.email})`,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total: number) =>
        total.toLocaleString("es-CO", { style: "currency", currency: "COP" }),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: OrderStatus) => {
        const statusColors = {
          pending: "gold",
          processing: "blue",
          completed: "green",
          cancelled: "red",
          refunded: "purple",
        };
        return <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Fecha",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Order) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setIsViewModalOpen(true);
            }}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              form.setFieldsValue({
                status: record.status,
                comment: "",
                tracking_number: "",
              });
              setIsEditModalOpen(true);
            }}
          />
        </Space>
      ),
    },
  ];

  // Manejadores
  const handleDateRangeChange: RangePickerProps["onChange"] = (dates) => {
    setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    try {
      const values = await form.validateFields();
      updateStatus.mutate({
        orderId: selectedOrder.id,
        data: values,
      });
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
        <Space>
          <RangePicker onChange={handleDateRangeChange} />
          <Select
            placeholder="Filtrar por estado"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => setStatusFilter(value as OrderStatus)}
            options={[
              { label: "Pendiente", value: "pending" },
              { label: "En Proceso", value: "processing" },
              { label: "Completado", value: "completed" },
              { label: "Cancelado", value: "cancelled" },
              { label: "Reembolsado", value: "refunded" },
            ]}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={ordersData?.data.orders}
        loading={isLoading}
        rowKey="id"
        pagination={{
          total: ordersData?.pagination?.total || 0,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} pedidos`,
        }}
      />

      {/* Modal de Vista */}
      <Modal
        title={`Detalles del Pedido #${selectedOrder?.order_number}`}
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedOrder(null);
        }}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2">Información del Cliente</h3>
                <p>Nombre: {selectedOrder.user.name}</p>
                <p>Email: {selectedOrder.user.email}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Información del Pedido</h3>
                <p>
                  Estado:
                  <Tag
                    color={
                      selectedOrder.status === "completed"
                        ? "green"
                        : selectedOrder.status === "processing"
                        ? "blue"
                        : selectedOrder.status === "cancelled"
                        ? "red"
                        : selectedOrder.status === "refunded"
                        ? "purple"
                        : "gold"
                    }
                    className="ml-2"
                  >
                    {selectedOrder.status.toUpperCase()}
                  </Tag>
                </p>
                <p>
                  Fecha:{" "}
                  {dayjs(selectedOrder.created_at).format("DD/MM/YYYY HH:mm")}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2">Productos</h3>
              <Table
                dataSource={selectedOrder.items}
                pagination={false}
                columns={[
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
                    render: (price: number) =>
                      price.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      }),
                  },
                  {
                    title: "Subtotal",
                    key: "subtotal",
                    render: (_, record) =>
                      (record.price * record.quantity).toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      }),
                  },
                ]}
                summary={(pageData) => {
                  const total = pageData.reduce(
                    (acc, current) => acc + current.price * current.quantity,
                    0
                  );
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        Total
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        {total.toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                        })}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
              />
            </div>

            {selectedOrder.status_history &&
              selectedOrder.status_history.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2">Historial de Estados</h3>
                  <Timeline>
                    {selectedOrder.status_history.map((history, index) => (
                      <Timeline.Item key={index}>
                        <p>{history.status.toUpperCase()}</p>
                        {history.comment && (
                          <p className="text-gray-500">{history.comment}</p>
                        )}
                        <p className="text-sm text-gray-400">
                          {dayjs(history.date).format("DD/MM/YYYY HH:mm")}
                        </p>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </div>
              )}
          </div>
        )}
      </Modal>

      {/* Modal de Edición */}
      <Modal
        title={`Actualizar Estado - Pedido #${selectedOrder?.order_number}`}
        open={isEditModalOpen}
        onOk={handleStatusUpdate}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedOrder(null);
          form.resetFields();
        }}
        confirmLoading={updateStatus.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="Estado"
            rules={[
              { required: true, message: "Por favor seleccione un estado" },
            ]}
          >
            <Select
              options={[
                { label: "Pendiente", value: "pending" },
                { label: "En Proceso", value: "processing" },
                { label: "Completado", value: "completed" },
                { label: "Cancelado", value: "cancelled" },
                { label: "Reembolsado", value: "refunded" },
              ]}
            />
          </Form.Item>

          <Form.Item name="tracking_number" label="Número de Seguimiento">
            <Input placeholder="Ingrese el número de seguimiento" />
          </Form.Item>

          <Form.Item name="comment" label="Comentario">
            <Input.TextArea
              rows={4}
              placeholder="Agregue un comentario sobre el cambio de estado"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Orders;
