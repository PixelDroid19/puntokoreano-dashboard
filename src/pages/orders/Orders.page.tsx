// src/pages/orders/Orders.page.tsx

import React, { useCallback, useEffect } from "react";
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
  Tooltip,
} from "antd";
import {
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import type { RangePickerProps } from "antd/es/date-picker";
import { Order, OrderStatus, PaymentStatus } from "../../types/orders";
import dayjs from "dayjs";
import OrdersService from "../../services/orders.service";
import { useOrdersWebSocket } from "../../hooks/useOrdersWebSocket";

const { RangePicker } = DatePicker;

// Mapa de colores para estados
const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "gold",
  processing: "blue",
  shipped: "cyan",
  delivered: "green",
  cancelled: "red",
  refunded: "purple",
};

// Mapa de colores para estados de pago
const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: "gold",
  processing: "blue",
  completed: "green",
  failed: "red",
  cancelled: "red",
};

// Opciones de estado
const STATUS_OPTIONS = [
  { label: "Pendiente", value: "pending" },
  { label: "En Proceso", value: "processing" },
  { label: "Enviado", value: "shipped" },
  { label: "Entregado", value: "delivered" },
  { label: "Cancelado", value: "cancelled" },
  { label: "Reembolsado", value: "refunded" },
];

const Orders = () => {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = React.useState<
    [dayjs.Dayjs, dayjs.Dayjs] | null
  >(null);
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "">("");
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = React.useState(false);
  const [form] = Form.useForm();
  const [refundForm] = Form.useForm();
  const token = localStorage.getItem("auth_dashboard_token");

  // Query para obtener pedidos
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", dateRange, statusFilter],
    queryFn: () =>
      OrdersService.getOrders({
        fromDate: dateRange?.[0]?.format("YYYY-MM-DD"),
        toDate: dateRange?.[1]?.format("YYYY-MM-DD"),
        status: statusFilter || undefined,
      }),
  });

  // Mutación para verificar pago
  const verifyPayment = useMutation({
    mutationFn: (orderId: string) => OrdersService.verifyPayment(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      message.success("Estado de pago verificado correctamente");
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Error al verificar el pago"
      );
    },
  });

  // Mutación para verificación masiva de pagos
  const verifyPendingPayments = useMutation({
    mutationFn: () => OrdersService.verifyPendingPayments(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      message.success(`Verificados ${data.data.processed} pagos pendientes`);
    },
    onError: (error: any) => {
      message.error("Error al verificar pagos pendientes");
    },
  });

  // Mutación para actualizar estado
  const updateStatus = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: any }) =>
      OrdersService.updateOrderStatus(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      message.success("Estado actualizado correctamente");
      setIsEditModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Error al actualizar el estado"
      );
    },
  });

  // Mutación para procesar reembolso
  const processRefund = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: any }) =>
      OrdersService.processRefund(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      message.success("Reembolso procesado correctamente");
      setIsRefundModalOpen(false);
      refundForm.resetFields();
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Error al procesar el reembolso"
      );
    },
  });

  const handleInvoiceAction = async (orderId: string) => {
    try {
      message.loading("Procesando factura...");
      const pdfBlob = await OrdersService.downloadInvoice(orderId);
      OrdersService.downloadPDF(pdfBlob, `factura-${orderId}.pdf`);
      message.success("Factura descargada correctamente");
    } catch (error) {
      try {
        await OrdersService.generateInvoice(orderId);
        const pdfBlob = await OrdersService.downloadInvoice(orderId);
        OrdersService.downloadPDF(pdfBlob, `factura-${orderId}.pdf`);
        message.success("Factura generada y descargada correctamente");
      } catch (genError) {
        message.error("Error al procesar la factura");
        console.error("Error handling invoice:", genError);
      }
    }
  };

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

  const handleRefundModal = (order: Order) => {
    setSelectedOrder(order);
    setIsRefundModalOpen(true);
    refundForm.setFieldsValue({
      amount: order.payment.total,
    });
  };

  const handleRefundSubmit = async () => {
    if (!selectedOrder) return;
    try {
      const values = await refundForm.validateFields();
      processRefund.mutate({
        orderId: selectedOrder.id,
        data: values,
      });
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };


  const { isConnected } = useOrdersWebSocket({
    token, // Pasar el token directamente, sin "Bearer"
    onPaymentUpdate: (data) => {
      console.log('Payment updated:', data);
    },
    onConnectionChange: (connected) => {
      console.log('WebSocket connection status:', connected);
    }
  });

  


  const columns = [
    {
      title: "Número de Orden",
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: "Cliente",
      dataIndex: "customer",
      key: "customer",
      render: (customer: { name: string; email: string }) => (
        <div>
          <div>{customer.name}</div>
          <div className="text-gray-500 text-sm">{customer.email}</div>
        </div>
      ),
    },
    {
      title: "Total",
      dataIndex: ["payment", "total"],
      key: "total",
      render: (total: number) =>
        total?.toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
        }) || "N/A",
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: OrderStatus) => (
        <Tag color={STATUS_COLORS[status]}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Estado de Pago",
      dataIndex: ["payment", "status"],
      key: "paymentStatus",
      render: (status: PaymentStatus, record: Order) => (
        <Space>
          <Tag color={PAYMENT_STATUS_COLORS[status]}>
            {status.toUpperCase()}
          </Tag>
          {status === "pending" && (
            <Tooltip title="Verificar pago">
              <Button
                icon={<SyncOutlined />}
                size="small"
                loading={verifyPayment.isPending}
                onClick={() => verifyPayment.mutate(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Fecha",
      dataIndex: ["dates", "created"],
      key: "created",
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
                tracking_number: record.shipping?.tracking || "",
                comment: "",
              });
              setIsEditModalOpen(true);
            }}
          />
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleInvoiceAction(record.id)}
            disabled={
              record.status === "pending" ||
              record.payment.status !== "completed"
            }
          />
          {record.payment.status === "completed" && (
            <Tooltip title="Procesar reembolso">
              <Button
                danger
                onClick={() => handleRefundModal(record)}
                disabled={["refunded", "cancelled"].includes(record.status)}
              >
                Reembolsar
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <Space>
        <div>Estado de conexión: {isConnected ? 'Conectado' : 'Desconectado'}</div>
          <Button
            type="primary"
            icon={<SyncOutlined />}
            loading={verifyPendingPayments.isPending}
            onClick={() => verifyPendingPayments.mutate()}
          >
            Verificar Pagos Pendientes
          </Button>
        </Space>
        <Space>
          <RangePicker onChange={handleDateRangeChange} />
          <Select
            placeholder="Filtrar por estado"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => setStatusFilter(value as OrderStatus)}
            options={STATUS_OPTIONS}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={ordersData?.data?.orders}
        loading={isLoading}
        rowKey="id"
        pagination={{
          total: ordersData?.data?.pagination?.total,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} pedidos`,
        }}
      />

      {/* Modal de Vista */}
      <Modal
        title={`Detalles del Pedido #${selectedOrder?.orderNumber}`}
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
                <p>Nombre: {selectedOrder.customer.name}</p>
                <p>Email: {selectedOrder.customer.email}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Información del Pedido</h3>
                <p>
                  Estado:
                  <Tag
                    color={STATUS_COLORS[selectedOrder.status]}
                    className="ml-2"
                  >
                    {selectedOrder.status.toUpperCase()}
                  </Tag>
                </p>
                <p>
                  Estado de Pago:
                  <Tag
                    color={PAYMENT_STATUS_COLORS[selectedOrder.payment.status]}
                    className="ml-2"
                  >
                    {selectedOrder.payment.status.toUpperCase()}
                  </Tag>
                </p>
                <p>
                  Fecha:{" "}
                  {dayjs(selectedOrder.dates.created).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </p>
                {selectedOrder.shipping?.tracking && (
                  <p>
                    Número de Seguimiento: {selectedOrder.shipping.tracking}
                  </p>
                )}
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
                    dataIndex: ["product", "price"],
                    key: "price",
                    render: (price: number) =>
                      price?.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      }),
                  },
                  {
                    title: "Total",
                    key: "total",
                    render: (_, record: any) =>
                      (record.quantity * record.product.price).toLocaleString(
                        "es-CO",
                        {
                          style: "currency",
                          currency: "COP",
                        }
                      ),
                  },
                ]}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      Total
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      {selectedOrder.payment.total.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      })}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
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
        title={`Actualizar Estado - Pedido #${selectedOrder?.orderNumber}`}
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
            <Select options={STATUS_OPTIONS} />
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

      {/* Modal de Reembolso */}
      <Modal
        title={`Procesar Reembolso - Pedido #${selectedOrder?.orderNumber}`}
        open={isRefundModalOpen}
        onOk={handleRefundSubmit}
        onCancel={() => {
          setIsRefundModalOpen(false);
          setSelectedOrder(null);
          refundForm.resetFields();
        }}
        confirmLoading={processRefund.isPending}
      >
        <Form form={refundForm} layout="vertical">
          <Form.Item
            name="amount"
            label="Monto a reembolsar"
            rules={[
              { required: true, message: "El monto es requerido" },
              {
                type: "number",
                min: 1,
                max: selectedOrder?.payment.total || 0,
                message:
                  "El monto debe ser mayor a 0 y menor o igual al total del pedido",
              },
            ]}
          >
            <Input
              type="number"
              prefix="$"
              placeholder="Ingrese el monto a reembolsar"
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Razón del reembolso"
            rules={[{ required: true, message: "La razón es requerida" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ingrese la razón del reembolso"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Orders;
