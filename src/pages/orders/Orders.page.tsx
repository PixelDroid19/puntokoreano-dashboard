import React, { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Tag,
  Button,
  Space,
  Typography,
  DatePicker,
  Select,
  Modal,
  Form,
  Input,
  message,
  Timeline,
  Tooltip,
  Badge,
  Card,
  Statistic,
  Tabs,
  Alert,
  Switch,
  InputNumber,
  Divider,
  Progress,
} from "antd";
import {
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  SyncOutlined,
  MailOutlined,
  WifiOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ExportOutlined,
  ImportOutlined,
  ReloadOutlined,
  AlertOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import type { RangePickerProps } from "antd/es/date-picker";
import { Order, OrderStatus, PaymentStatus } from "../../types/orders";
import dayjs from "dayjs";
import OrdersService from "../../services/orders.service";
import { useOrdersWebSocket } from "../../hooks/useOrdersWebSocket";
import { ACCESS_TOKEN_KEY } from "../../api";
import WebSocketStatus from "../../components/shared/WebSocketStatus";
import PaymentSettingsService from "../../services/payment-settings.service";
import { PaymentSystemMetrics, CronServiceStatus, PaymentSettings } from "../../services/payment-settings.types";
import { DashboardService } from "../../services/dashboard.service";
import { CardContent, CardHeader, CardTitle } from "../vehicle-manager/ui/card";
import { Activity, CheckCircle, Clock, DollarSign, ShoppingCart } from "lucide-react";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Mapa de colores para estados
const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "gold",
  processing: "blue",
  shipped: "cyan",
  delivered: "green",
  completed: "green",
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
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [form] = Form.useForm();
  const [refundForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [paymentSettingsForm] = Form.useForm();
  const [isPaymentSettingsModalOpen, setIsPaymentSettingsModalOpen] = React.useState(false);
  const [activePaymentTab, setActivePaymentTab] = React.useState("metrics");
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [paymentVerificationStatus, setPaymentVerificationStatus] = useState<any>(null);

  // Query para obtener pedidos con actualización automática
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", dateRange, statusFilter],
    queryFn: () =>
      OrdersService.getOrders({
        fromDate: dateRange?.[0]?.format("YYYY-MM-DD"),
        toDate: dateRange?.[1]?.format("YYYY-MM-DD"),
        status: statusFilter || undefined,
      }),
    refetchInterval: 60000, // Actualizar cada 60 segundos
    refetchIntervalInBackground: true, // Continuar actualizando en background
    staleTime: 30000, // Considerar datos obsoletos después de 30 segundos
  });

  const { data: paymentSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: () => PaymentSettingsService.getCurrentSettings(),
  });

  // Queries solo para el modal de configuración de pagos
  const { data: paymentMetrics } = useQuery({
    queryKey: ["payment-metrics"],
    queryFn: () => PaymentSettingsService.getSystemMetrics("24h"),
    enabled: isPaymentSettingsModalOpen, // Solo cargar cuando el modal esté abierto
    refetchInterval: isPaymentSettingsModalOpen ? 60000 : false,
  });

  const { data: cronStatus } = useQuery({
    queryKey: ["cron-status"],
    queryFn: () => PaymentSettingsService.getCronStatus(),
    enabled: isPaymentSettingsModalOpen, // Solo cargar cuando el modal esté abierto
    refetchInterval: isPaymentSettingsModalOpen ? 30000 : false,
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

  // Mutación para enviar factura por correo
  const sendInvoiceByEmail = useMutation({
    mutationFn: ({
      orderId,
      emailAddress,
    }: {
      orderId: string;
      emailAddress?: string;
    }) => OrdersService.sendInvoiceByEmail(orderId, emailAddress),
    onSuccess: () => {
      message.success("Factura enviada correctamente por correo electrónico");
      setIsEmailModalOpen(false);
      emailForm.resetFields();
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Error al enviar la factura por correo"
      );
    },
  });

  // Mutaciones para sistema de pagos
  const restartCronService = useMutation({
    mutationFn: () => PaymentSettingsService.restartCronService(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cron-status"] });
      message.success("Servicio de cron reiniciado correctamente");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Error al reiniciar el servicio");
    },
  });

  const runManualVerification = useMutation({
    mutationFn: (params: any) => PaymentSettingsService.runManualVerification(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["payment-metrics"] });
      message.success(`Verificación completada. Procesados: ${data.data.data.processed}`);
    },
    onError: (error: any) => {
      message.error("Error en la verificación manual");
    },
  });

  const updatePaymentSettings = useMutation({
    mutationFn: (settings: Partial<PaymentSettings>) => 
      PaymentSettingsService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-settings"] });
      queryClient.invalidateQueries({ queryKey: ["cron-status"] });
      message.success("Configuración actualizada correctamente");
      setIsPaymentSettingsModalOpen(false);
    },
    onError: (error: any) => {
      message.error("Error al actualizar la configuración");
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

  const handleSendInvoiceEmail = async () => {
    if (!selectedOrder) return;

    try {
      const values = await emailForm.validateFields();
      sendInvoiceByEmail.mutate({
        orderId: selectedOrder.id,
        emailAddress: values.emailAddress,
      });
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleEmailModal = (order: Order) => {
    setSelectedOrder(order);
    setIsEmailModalOpen(true);
    emailForm.setFieldsValue({
      emailAddress: order.customer.email,
    });
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

  // 🆕 Callbacks estables para evitar re-creación de listeners
  const handlePaymentUpdate = useCallback((data: any) => {
    console.log("Payment updated:", data);
    // Invalidar queries para refrescar automáticamente
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  }, [queryClient]);

  const handleConnectionChange = useCallback((connected: boolean) => {
    console.log("WebSocket connection status:", connected);
    if (connected) {
      console.log("✅ Conexión WebSocket restaurada - sincronizando datos");
      // Refrescar datos cuando se reconecte
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  }, [queryClient]);

  const { isConnected, reconnect, reset } = useOrdersWebSocket({
    token,
    onPaymentUpdate: handlePaymentUpdate,
    onConnectionChange: handleConnectionChange,
  });

  // Calcular estadísticas
  const totalOrders = ordersData?.data?.orders?.length || 0;
  const totalRevenue = ordersData?.data?.orders?.reduce(
    (sum: number, order: Order) => sum + (order.payment?.total || 0),
    0
  ) || 0;
  const pendingOrders = ordersData?.data?.orders?.filter(
    (order: Order) => order.status === "pending"
  ).length || 0;
  const completedOrders = ordersData?.data?.orders?.filter(
    (order: Order) => order.status === "completed"
  ).length || 0;

  // Configuración del sistema de pagos
  const paymentSettingsData = paymentSettings?.data?.data?.settings;
  // Solo para el modal de configuración
  const paymentMetricsData = paymentMetrics?.data?.data;
  const cronStatusData = cronStatus?.data?.data;

  const formatCurrency = (value: number) => {
    return value?.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
    });
  };

  const formatPercentage = (value: number) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const columns = [
    {
      title: "Número de Orden",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (orderNumber: string) => (
        <Text strong className="text-blue-600">
          #{orderNumber}
        </Text>
      ),
    },
    {
      title: "Cliente",
      dataIndex: "customer",
      key: "customer",
      render: (customer: { name: string; email: string }) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{customer.name}</div>
          <div className="text-sm text-gray-500">{customer.email}</div>
        </div>
      ),
    },
    {
      title: "Total",
      dataIndex: ["payment", "total"],
      key: "total",
      render: (total: number) => (
        <Text strong className="text-green-600 text-lg">
          {total?.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
          }) || "N/A"}
        </Text>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: OrderStatus) => (
        <Tag
          color={STATUS_COLORS[status]}
          className="px-3 py-1 rounded-full font-medium"
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Estado de Pago",
      dataIndex: ["payment", "status"],
      key: "paymentStatus",
      render: (status: PaymentStatus, record: Order) => (
        <>
          {" "}
          <Space align="center" size={4}>
            {" "}
            <Tag
              color={PAYMENT_STATUS_COLORS[status]}
              className="px-3 py-1 rounded-full font-medium"
            >
              {" "}
              {status.toUpperCase()}{" "}
            </Tag>{" "}
            {record.payment?.isDevelopment && (
              <Tooltip title="Esta orden fue creada en ambiente de pruebas">
                {" "}
                <Tag
                  color="purple"
                   className="px-3 py-1 rounded-full font-medium"
                >
                  {" "}
                  PRUEBA{" "}
                </Tag>{" "}
              </Tooltip>
            )}{" "}
            {status === "pending" && (
              <Tooltip title="Verificar pago">
                {" "}
                <Button
                  icon={<SyncOutlined />}
                  size="small"
                  type="primary"
                  ghost
                  loading={verifyPayment.isPending}
                  onClick={() => verifyPayment.mutate(record.id)}
                  className="border-blue-500 text-blue-500 hover:bg-blue-50"
                />{" "}
              </Tooltip>
            )}{" "}
          </Space>{" "}
        </>
      ),
    },
    {
      title: "Fecha",
      dataIndex: ["dates", "created"],
      key: "created",
      render: (date: string) => (
        <div className="text-gray-600">
          {dayjs(date).format("DD/MM/YYYY")}
          <br />
          <span className="text-sm text-gray-400">
            {dayjs(date).format("HH:mm")}
          </span>
        </div>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Order) => (
        <Space size="small" className="flex flex-wrap">
          <Tooltip title="Ver detalles">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedOrder(record);
                setIsViewModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              type="default"
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
          </Tooltip>
          <Tooltip title="Descargar factura">
            <Button
              icon={<DownloadOutlined />}
              type="default"
              onClick={() => handleInvoiceAction(record.id)}
              disabled={
                record.status === "pending" ||
                record.payment.status !== "completed"
              }
            />
          </Tooltip>
          <Tooltip title="Enviar factura por correo">
            <Button
              icon={<MailOutlined />}
              type="default"
              onClick={() => handleEmailModal(record)}
              disabled={
                record.status === "pending" ||
                record.payment.status !== "completed"
              }
            />
          </Tooltip>
          {record.payment.status === "completed" && (
            <Tooltip title="Procesar reembolso">
              <Button
                danger
                onClick={() => handleRefundModal(record)}
                disabled={["refunded", "cancelled"].includes(record.status)}
                className="bg-red-50 border-red-500 text-red-500 hover:bg-red-100 disabled:bg-gray-50 disabled:border-gray-300 disabled:text-gray-400"
              >
                Reembolsar
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Nuevo efecto para obtener estado de verificaciones y sincronizar órdenes
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const response = await DashboardService.getPaymentVerificationMetrics();
        setPaymentVerificationStatus(response);
        
        // Si hay una verificación reciente (últimos 2 minutos), refrescar órdenes
        const lastRun = response.lastVerification?.lastRun;
        if (lastRun) {
          const lastRunTime = new Date(lastRun).getTime();
          const now = new Date().getTime();
          const timeDiff = now - lastRunTime;
          
          // Si la última verificación fue hace menos de 2 minutos, refrescar órdenes
          if (timeDiff < 2 * 60 * 1000) {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            message.info("🔄 Órdenes actualizadas automáticamente - Verificación de pagos completada", 3);
          }
        }
      } catch (error) {
        console.error("Error fetching verification status:", error);
      }
    };

    fetchVerificationStatus();
    
    // Actualizar estado cada 30 segundos
    const interval = setInterval(fetchVerificationStatus, 30000);
    
    return () => clearInterval(interval);
  }, [queryClient]);

  return (
    <div className="">
      <div className=" mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <Title level={2} className="!mb-2 text-gray-800">
                Gestión de Órdenes
              </Title>
              <WebSocketStatus 
                isConnected={isConnected}
                onReconnect={reconnect}
                onReset={reset}
              />
            </div>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => queryClient.invalidateQueries({ queryKey: ["orders"] })}
                size="large"
                className="border-gray-400 text-gray-600 hover:bg-gray-50"
                title="Actualizar vista de órdenes"
              >
                Actualizar Vista
              </Button>
              <Button
                icon={<SettingOutlined />}
                onClick={() => setIsPaymentSettingsModalOpen(true)}
                size="large"
                className="border-purple-500 text-purple-500 hover:bg-purple-50"
              >
                Configuración de Pagos
              </Button>
              <Button
                type="primary"
                icon={<SyncOutlined />}
                loading={verifyPendingPayments.isPending}
                onClick={() => verifyPendingPayments.mutate()}
                size="large"
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-md"
              >
                Verificar Pagos Pendientes
              </Button>
            </Space>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Órdenes
                  </p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pendientes
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {pendingOrders}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completadas
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {completedOrders}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ingresos Totales
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estado del Sistema de Verificaciones */}
        {paymentVerificationStatus && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Sistema de Verificaciones Automáticas (cada 3 minutos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    paymentVerificationStatus.systemStatus?.isActive 
                      ? 'bg-green-500 animate-pulse' 
                      : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <p className="font-medium">
                      {paymentVerificationStatus.systemStatus?.isActive ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Frecuencia</p>
                  <p className="font-medium">
                    {paymentVerificationStatus.systemStatus?.frequency || 'Cada 3 minutos'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="font-medium">
                    {paymentVerificationStatus.systemStatus?.pendingPayments || 0} pagos
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Último procesamiento</p>
                  <p className="font-medium text-xs">
                    {paymentVerificationStatus.lastVerification?.lastRun 
                      ? new Date(paymentVerificationStatus.lastVerification.lastRun).toLocaleString()
                      : 'Nunca'
                    }
                  </p>
                </div>
              </div>
              {paymentVerificationStatus.lastVerification?.totalProcessed > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span>Última verificación: {paymentVerificationStatus.lastVerification.totalProcessed} órdenes procesadas</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      paymentVerificationStatus.lastVerification.failed === 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {paymentVerificationStatus.lastVerification.failed === 0 
                        ? '✓ Sin errores' 
                        : `${paymentVerificationStatus.lastVerification.failed} errores`
                      }
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Text strong className="block mb-2 text-gray-700">
                Rango de Fechas
              </Text>
              <RangePicker
                onChange={handleDateRangeChange}
                size="large"
                className="w-full"
                placeholder={["Fecha inicio", "Fecha fin"]}
              />
            </div>
            <div className="flex-1">
              <Text strong className="block mb-2 text-gray-700">
                Estado
              </Text>
              <Select
                placeholder="Filtrar por estado"
                allowClear
                size="large"
                className="w-full"
                onChange={(value) => setStatusFilter(value as OrderStatus)}
                options={STATUS_OPTIONS}
              />
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={ordersData?.data?.orders}
            loading={isLoading}
            rowKey="id"
            className="custom-table"
            scroll={{ x: 1200 }}
            pagination={{
              total: ordersData?.data?.pagination?.total,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} de ${total} pedidos`,
              className: "px-4 py-4",
            }}
          />
        </Card>

        {/* Modal de Vista */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <EyeOutlined className="text-blue-500" />
              <span>Detalles del Pedido #{selectedOrder?.orderNumber}</span>
            </div>
          }
          open={isViewModalOpen}
          onCancel={() => {
            setIsViewModalOpen(false);
            setSelectedOrder(null);
          }}
          footer={null}
          width={900}
          className="custom-modal"
        >
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card size="small" className="shadow-sm">
                  <Title level={4} className="!mb-4 text-gray-800">
                    Información del Cliente
                  </Title>
                  <div className="space-y-2">
                    <div>
                      <Text strong>Nombre: </Text>
                      <Text>{selectedOrder.customer.name}</Text>
                    </div>
                    <div>
                      <Text strong>Email: </Text>
                      <Text className="text-blue-600">
                        {selectedOrder.customer.email}
                      </Text>
                    </div>
                  </div>
                </Card>

                <Card size="small" className="shadow-sm">
                  <Title level={4} className="!mb-4 text-gray-800">
                    Información del Pedido
                  </Title>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Text strong>Estado:</Text>
                      <Tag
                        color={STATUS_COLORS[selectedOrder.status]}
                        className="px-3 py-1 rounded-full"
                      >
                        {selectedOrder.status.toUpperCase()}
                      </Tag>
                    </div>
                    <div className="flex items-center justify-between">
                      {" "}
                      <Text strong>Estado de Pago:</Text>{" "}
                      <Space align="center" size={4}>
                        {" "}
                        <Tag
                          color={
                            PAYMENT_STATUS_COLORS[selectedOrder.payment.status]
                          }
                          className="px-3 py-1 rounded-full m-0"
                        >
                          {" "}
                          {selectedOrder.payment.status.toUpperCase()}{" "}
                        </Tag>{" "}
                        {selectedOrder.payment.isDevelopment && (
                          <Tooltip title="Esta orden fue creada en ambiente de pruebas">
                            {" "}
                            <Tag
                              color="purple"
                              className="px-2 py-0 rounded-full text-xs m-0"
                            >
                              {" "}
                              PRUEBA{" "}
                            </Tag>{" "}
                          </Tooltip>
                        )}{" "}
                      </Space>{" "}
                    </div>
                    <div>
                      <Text strong>Fecha: </Text>
                      <Text>
                        {dayjs(selectedOrder.dates.created).format(
                          "DD/MM/YYYY HH:mm"
                        )}
                      </Text>
                    </div>
                    {selectedOrder.shipping?.tracking && (
                      <div>
                        <Text strong>Número de Seguimiento: </Text>
                        <Text className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {selectedOrder.shipping.tracking}
                        </Text>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <Card size="small" className="shadow-sm">
                <Title level={4} className="!mb-4 text-gray-800">
                  Productos
                </Title>
                <Table
                  dataSource={selectedOrder.items}
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: "Producto",
                      dataIndex: ["product", "name"],
                      key: "name",
                      render: (name: string) => <Text strong>{name}</Text>,
                    },
                    {
                      title: "Código",
                      dataIndex: ["product", "code"],
                      key: "code",
                      render: (code: string) => (
                        <Text className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                          {code}
                        </Text>
                      ),
                    },
                    {
                      title: "Cantidad",
                      dataIndex: "quantity",
                      key: "quantity",
                      render: (quantity: number) => <Badge count={quantity} />,
                    },
                    {
                      title: "Precio",
                      dataIndex: ["product", "price"],
                      key: "price",
                      render: (price: number) => (
                        <Text strong className="text-green-600">
                          {price?.toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                          })}
                        </Text>
                      ),
                    },
                    {
                      title: "Total",
                      key: "total",
                      render: (_, record: any) => (
                        <Text strong className="text-green-600 text-lg">
                          {(
                            record.quantity * record.product.price || 0
                          ).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                          })}
                        </Text>
                      ),
                    },
                  ]}
                  summary={() => (
                    <Table.Summary.Row className="bg-gray-50">
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <Text strong className="text-lg">
                          Total
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text strong className="text-xl text-green-600">
                          {selectedOrder.payment.total.toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                          })}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
              </Card>

              {selectedOrder.status_history &&
                selectedOrder.status_history.length > 0 && (
                  <Card size="small" className="shadow-sm">
                    <Title level={4} className="!mb-4 text-gray-800">
                      Historial de Estados
                    </Title>
                    <Timeline>
                      {selectedOrder.status_history.map((history, index) => (
                        <Timeline.Item
                          key={index}
                          color={STATUS_COLORS[history.status as OrderStatus]}
                        >
                          <div className="space-y-1">
                            <Text strong className="text-gray-800">
                              {history.status.toUpperCase()}
                            </Text>
                            {history.comment && (
                              <div className="text-gray-600 bg-gray-50 p-2 rounded">
                                {history.comment}
                              </div>
                            )}
                            <div className="text-sm text-gray-400">
                              {dayjs(history.date).format("DD/MM/YYYY HH:mm")}
                            </div>
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Card>
                )}
            </div>
          )}
        </Modal>

        {/* Modal de Edición */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <EditOutlined className="text-orange-500" />
              <span>
                Actualizar Estado - Pedido #{selectedOrder?.orderNumber}
              </span>
            </div>
          }
          open={isEditModalOpen}
          onOk={handleStatusUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedOrder(null);
            form.resetFields();
          }}
          confirmLoading={updateStatus.isPending}
          okText="Actualizar"
          cancelText="Cancelar"
          className="custom-modal"
        >
          <Form form={form} layout="vertical" className="space-y-4">
            <Form.Item
              name="status"
              label={<Text strong>Estado</Text>}
              rules={[
                { required: true, message: "Por favor seleccione un estado" },
              ]}
            >
              <Select options={STATUS_OPTIONS} size="large" />
            </Form.Item>

            <Form.Item
              name="tracking_number"
              label={<Text strong>Número de Seguimiento</Text>}
            >
              <Input
                placeholder="Ingrese el número de seguimiento"
                size="large"
                className="font-mono"
              />
            </Form.Item>

            <Form.Item name="comment" label={<Text strong>Comentario</Text>}>
              <Input.TextArea
                rows={4}
                placeholder="Agregue un comentario sobre el cambio de estado"
                className="resize-none"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal de Reembolso */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <DollarOutlined className="text-red-500" />
              <span>
                Procesar Reembolso - Pedido #{selectedOrder?.orderNumber}
              </span>
            </div>
          }
          open={isRefundModalOpen}
          onOk={handleRefundSubmit}
          onCancel={() => {
            setIsRefundModalOpen(false);
            setSelectedOrder(null);
            refundForm.resetFields();
          }}
          confirmLoading={processRefund.isPending}
          okText="Procesar Reembolso"
          cancelText="Cancelar"
          okButtonProps={{ danger: true }}
          className="custom-modal"
        >
          <Form form={refundForm} layout="vertical" className="space-y-4">
            <Form.Item
              name="amount"
              label={<Text strong>Monto a reembolsar</Text>}
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
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="reason"
              label={<Text strong>Razón del reembolso</Text>}
              rules={[{ required: true, message: "La razón es requerida" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Ingrese la razón del reembolso"
                className="resize-none"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal de Configuración de Pagos */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <SettingOutlined className="text-purple-500" />
              <span>Configuración del Sistema de Pagos</span>
            </div>
          }
          open={isPaymentSettingsModalOpen}
          onCancel={() => {
            setIsPaymentSettingsModalOpen(false);
            paymentSettingsForm.resetFields();
          }}
          footer={null}
          width={1200}
          className="custom-modal"
        >
          <Tabs 
            activeKey={activePaymentTab} 
            onChange={setActivePaymentTab}
            className="mt-4"
          >
            <TabPane 
              tab={
                <span>
                  <BarChartOutlined />
                  Métricas del Sistema
                </span>
              } 
              key="metrics"
            >
              <div className="space-y-6">
                {/* Estado del Sistema */}
                <Card size="small" className="shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <Title level={4} className="!mb-0">Estado del Sistema</Title>
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${cronStatusData?.isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
                      <Text>{cronStatusData?.isRunning ? 'Activo' : 'Inactivo'}</Text>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {paymentMetricsData?.orders?.successRate || "0.0%"}
                      </div>
                      <div className="text-sm text-gray-600">Tasa de Éxito</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {paymentMetricsData?.system?.lastVerification?.updated || 0}
                      </div>
                      <div className="text-sm text-gray-600">Pagos Automatizados</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {paymentMetricsData?.system?.lastVerification?.duration || 0}ms
                      </div>
                      <div className="text-sm text-gray-600">Tiempo Promedio</div>
                    </div>
                  </div>
                </Card>

                {/* Errores Recientes */}
                {paymentMetricsData?.system?.lastVerification?.errors?.length > 0 && (
                  <Card size="small" className="shadow-sm">
                    <Title level={4} className="!mb-4">Errores Recientes</Title>
                    <div className="space-y-2">
                      {paymentMetricsData.system.lastVerification.errors.slice(0, 5).map((error, index) => (
                                                 <Alert
                           key={index}
                           message={error.type || 'Error de verificación'}
                           description={
                             <div>
                               <div>{error.message || 'Sin mensaje'}</div>
                               {error.orderId && (
                                 <Text type="secondary" className="text-xs">
                                   Orden: {error.orderId}
                                 </Text>
                               )}
                             </div>
                           }
                           type="error"
                           showIcon
                         />
                      ))}
                    </div>
                  </Card>
                )}

                {/* Acciones Rápidas */}
                <Card size="small" className="shadow-sm">
                  <Title level={4} className="!mb-4">Acciones Rápidas</Title>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      icon={<PlayCircleOutlined />}
                      loading={runManualVerification.isPending}
                      onClick={() => runManualVerification.mutate({ timeWindow: 24 })}
                      size="large"
                      block
                    >
                      Verificación Manual (24h)
                    </Button>
                    <Button
                      icon={<ExportOutlined />}
                      onClick={async () => {
                        try {
                          const blob = await PaymentSettingsService.downloadBackup();
                          const filename = `payment-config-${new Date().toISOString().split('T')[0]}.json`;
                          PaymentSettingsService.downloadFile(blob, filename);
                          message.success("Configuración exportada correctamente");
                        } catch (error) {
                          message.error("Error al exportar configuración");
                        }
                      }}
                      size="large"
                      block
                    >
                      Exportar Configuración
                    </Button>
                  </div>
                </Card>
              </div>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <SettingOutlined />
                  Configuración
                </span>
              } 
              key="settings"
            >
              {paymentSettingsData && (
                <Form
                  form={paymentSettingsForm}
                  layout="vertical"
                  initialValues={paymentSettingsData}
                  onFinish={(values) => updatePaymentSettings.mutate(values)}
                  className="space-y-6"
                >
                  <Card size="small" className="shadow-sm">
                    <Title level={4} className="!mb-4">Verificación Automática</Title>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name={["verification", "enabled"]}
                        label="Activar Verificación Automática"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        name={["verification", "cronSchedule"]}
                        label="Horario de Ejecución (Cron)"
                      >
                        <Input placeholder="*/5 * * * *" />
                      </Form.Item>
                      <Form.Item
                        name={["verification", "timeWindow"]}
                        label="Ventana de Tiempo (horas)"
                      >
                        <InputNumber min={1} max={168} className="w-full" />
                      </Form.Item>
                      <Form.Item
                        name={["verification", "batchSize"]}
                        label="Tamaño de Lote"
                      >
                        <InputNumber min={1} max={50} className="w-full" />
                      </Form.Item>
                    </div>
                  </Card>

                  <Card size="small" className="shadow-sm">
                    <Title level={4} className="!mb-4">Timeout de Stock</Title>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name={["stockTimeout", "enabled"]}
                        label="Activar Timeout de Stock"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        name={["stockTimeout", "timeoutMinutes"]}
                        label="Timeout en Minutos"
                      >
                        <InputNumber min={5} max={1440} className="w-full" />
                      </Form.Item>
                    </div>
                  </Card>

                  <Card size="small" className="shadow-sm">
                    <Title level={4} className="!mb-4">Alertas</Title>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name={["alerts", "enabled"]}
                        label="Activar Alertas"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        name={["alerts", "failureThreshold"]}
                        label="Umbral de Fallos"
                      >
                        <InputNumber min={1} max={100} className="w-full" />
                      </Form.Item>
                    </div>
                  </Card>

                  <div className="flex justify-end space-x-4">
                    <Button onClick={() => setIsPaymentSettingsModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      loading={updatePaymentSettings.isPending}
                    >
                      Guardar Configuración
                    </Button>
                  </div>
                </Form>
              )}
            </TabPane>
          </Tabs>
        </Modal>

        {/* Modal para Enviar Factura por Correo */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <MailOutlined className="text-purple-500" />
              <span>
                Enviar Factura por Correo - Pedido #{selectedOrder?.orderNumber}
              </span>
            </div>
          }
          open={isEmailModalOpen}
          onOk={handleSendInvoiceEmail}
          onCancel={() => {
            setIsEmailModalOpen(false);
            setSelectedOrder(null);
            emailForm.resetFields();
          }}
          confirmLoading={sendInvoiceByEmail.isPending}
          okText="Enviar Factura"
          cancelText="Cancelar"
          className="custom-modal"
        >
          <Form form={emailForm} layout="vertical" className="space-y-4">
            <Form.Item
              name="emailAddress"
              label={<Text strong>Correo Electrónico</Text>}
              rules={[
                { required: true, message: "El correo es requerido" },
                {
                  type: "email",
                  message: "Ingrese un correo electrónico válido",
                },
              ]}
            >
              <Input
                placeholder="Ingrese el correo electrónico del destinatario"
                size="large"
                prefix={<MailOutlined className="text-gray-400" />}
              />
            </Form.Item>
            <div className="bg-blue-50 p-4 rounded-lg">
              <Text className="text-blue-700">
                La factura será enviada al correo electrónico especificado en
                formato PDF.
              </Text>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Orders;
