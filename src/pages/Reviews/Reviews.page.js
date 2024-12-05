import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect } from "react";
import { Card, Table, Rate, Tag, Space, Button, Select, Tooltip, Typography, Modal, } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined, LikeOutlined, ShoppingOutlined, WarningOutlined, } from "@ant-design/icons";
import ModerationModal from "./components/ModerationModal";
import ReviewStats from "./components/ReviewStats";
import DashboardReviewsService from "../../services/reviews.service";
const { Option } = Select;
const { Text } = Typography;
const Reviews = () => {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = React.useState({
        page: 1,
        limit: 10,
        status: undefined,
        rating: undefined,
        verified: undefined,
        reported: undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
    });
    const [selectedReview, setSelectedReview] = React.useState(null);
    const [moderationModalVisible, setModerationModalVisible] = React.useState(false);
    // Queries
    const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
        queryKey: ["reviews", searchParams],
        queryFn: () => DashboardReviewsService.getReviews(searchParams),
    });
    const { data: statsData, isLoading: isLoadingStats } = useQuery({
        queryKey: ["reviewStats"],
        queryFn: () => DashboardReviewsService.getReviewStats(),
    });
    // Mutations
    const moderateReviewMutation = useMutation({
        mutationFn: ({ reviewId, data }) => DashboardReviewsService.moderateReview(reviewId, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["reviews"]);
            queryClient.invalidateQueries(["reviewStats"]);
            setModerationModalVisible(false);
            message.success("Review moderada exitosamente");
        },
    });
    const handleReportMutation = useMutation({
        mutationFn: ({ reviewId, data }) => DashboardReviewsService.handleReportedReview(reviewId, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["reviews"]);
            queryClient.invalidateQueries(["reviewStats"]);
            message.success("Reporte manejado exitosamente");
        },
    });
    useEffect(() => {
        console.log("reviewsData?.reviews", reviewsData?.reviews);
    }, [reviewsData?.reviews]);
    const columns = [
        {
            title: "Producto",
            dataIndex: ["product", "name"],
            key: "product",
            render: (name, record) => (_jsxs(Space, { direction: "vertical", size: 0, children: [_jsx(Text, { strong: true, children: name }), _jsxs(Text, { type: "secondary", className: "text-xs", children: ["C\u00F3digo: ", record.product.code] })] })),
        },
        {
            title: "Calificación",
            dataIndex: "rating",
            key: "rating",
            width: 140,
            render: (rating) => _jsx(Rate, { disabled: true, defaultValue: rating }),
        },
        {
            title: "Review",
            dataIndex: "title",
            key: "review",
            render: (title, record) => (_jsxs(Space, { direction: "vertical", size: 0, children: [_jsx(Text, { strong: true, children: title }), _jsx(Text, { type: "secondary", className: "text-sm line-clamp-2", children: record.content }), record.purchase_verified && (_jsx(Tag, { color: "green", icon: _jsx(ShoppingOutlined, {}), children: "Compra Verificada" }))] })),
        },
        {
            title: "Estado",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status, record) => (_jsxs(Space, { direction: "vertical", size: 2, children: [_jsx(Tag, { color: status === "approved"
                            ? "green"
                            : status === "rejected"
                                ? "red"
                                : "gold", children: status === "approved"
                            ? "Aprobada"
                            : status === "rejected"
                                ? "Rechazada"
                                : "Pendiente" }), record.reported?.count > 0 && (_jsxs(Tag, { color: "red", icon: _jsx(WarningOutlined, {}), children: [record.reported.count, " reportes"] }))] })),
        },
        {
            title: "Interacciones",
            key: "interactions",
            width: 120,
            render: (_, record) => (_jsxs(Space, { direction: "vertical", size: 2, children: [_jsxs(Text, { className: "text-sm", children: [_jsx(LikeOutlined, {}), " ", record.helpful_votes.positive, " positivos"] }), _jsxs(Text, { className: "text-sm text-red-500", children: [_jsx(CloseOutlined, {}), " ", record.helpful_votes.negative, " negativos"] })] })),
        },
        /*  {
          title: "Información",
          key: "info",
          width: 200,
          render: (_, record) => (
            <Space direction="vertical" size={2}>
              <Text className="text-sm">{record.user.name}</Text>
              <Text type="secondary" className="text-xs">
                {dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")}
              </Text>
              {record.moderation && (
                <Tooltip
                  title={`Moderado por ${record.moderation.moderatedBy.name}`}
                >
                  <Text type="secondary" className="text-xs">
                    Mod: {dayjs(record.moderation.moderatedAt).format("DD/MM/YYYY")}
                  </Text>
                </Tooltip>
              )}
            </Space>
          ),
        }, */
        {
            title: "Acciones",
            key: "actions",
            width: 150,
            render: (_, record) => (_jsxs(Space, { children: [_jsx(Tooltip, { title: "Ver detalles", children: _jsx(Button, { icon: _jsx(ExclamationCircleOutlined, {}), onClick: () => {
                                setSelectedReview(record);
                                setModerationModalVisible(true);
                            } }) }), record.status === "pending" && (_jsxs(_Fragment, { children: [_jsx(Tooltip, { title: "Aprobar", children: _jsx(Button, { type: "primary", icon: _jsx(CheckOutlined, {}), onClick: () => handleQuickModeration(record, "approved") }) }), _jsx(Tooltip, { title: "Rechazar", children: _jsx(Button, { danger: true, icon: _jsx(CloseOutlined, {}), onClick: () => handleQuickModeration(record, "rejected") }) })] })), record.reported?.count > 0 && (_jsx(Tooltip, { title: "Descartar reportes", children: _jsx(Button, { type: "default", onClick: () => handleDismissReports(record), icon: _jsx(CloseOutlined, {}) }) }))] })),
        },
    ];
    // Manejadores
    const handleQuickModeration = (review, status) => {
        Modal.confirm({
            title: `¿${status === "approved" ? "Aprobar" : "Rechazar"} esta review?`,
            icon: status === "approved" ? _jsx(CheckOutlined, {}) : _jsx(CloseOutlined, {}),
            content: "¿Estás seguro de que deseas realizar esta acción?",
            okText: "Sí",
            cancelText: "No",
            onOk: () => {
                moderateReviewMutation.mutate({
                    reviewId: review._id,
                    data: {
                        status,
                        moderationNote: `${status === "approved" ? "Aprobada" : "Rechazada"} por moderación rápida`,
                    },
                });
            },
        });
    };
    const handleDismissReports = (review) => {
        Modal.confirm({
            title: "¿Descartar reportes?",
            content: "¿Estás seguro de que deseas descartar todos los reportes de esta review?",
            okText: "Sí",
            cancelText: "No",
            onOk: () => {
                handleReportMutation.mutate({
                    reviewId: review._id,
                    data: {
                        action: "dismiss",
                        response: "Reportes descartados por moderador",
                    },
                });
            },
        });
    };
    return (_jsxs("div", { className: "p-6", children: [_jsx("div", { className: "mb-6 flex justify-between items-center", children: _jsx("h1", { className: "text-2xl font-bold", children: "Gesti\u00F3n de Reviews" }) }), !isLoadingStats && statsData && _jsx(ReviewStats, { stats: statsData }), _jsx(Card, { className: "mb-6", children: _jsxs(Space, { wrap: true, className: "w-full", children: [_jsxs(Select, { placeholder: "Estado", allowClear: true, style: { width: 120 }, onChange: (value) => setSearchParams((prev) => ({ ...prev, status: value })), children: [_jsx(Option, { value: "pending", children: "Pendientes" }), _jsx(Option, { value: "approved", children: "Aprobadas" }), _jsx(Option, { value: "rejected", children: "Rechazadas" })] }), _jsx(Select, { placeholder: "Calificaci\u00F3n", allowClear: true, style: { width: 120 }, onChange: (value) => setSearchParams((prev) => ({ ...prev, rating: value })), children: [5, 4, 3, 2, 1].map((rating) => (_jsx(Option, { value: rating, children: _jsx(Rate, { disabled: true, defaultValue: rating }) }, rating))) }), _jsxs(Select, { placeholder: "Verificaci\u00F3n", allowClear: true, style: { width: 150 }, onChange: (value) => setSearchParams((prev) => ({ ...prev, verified: value })), children: [_jsx(Option, { value: "true", children: "Verificadas" }), _jsx(Option, { value: "false", children: "No verificadas" })] }), _jsxs(Select, { placeholder: "Reportadas", allowClear: true, style: { width: 150 }, onChange: (value) => setSearchParams((prev) => ({ ...prev, reported: value })), children: [_jsx(Option, { value: "true", children: "Con reportes" }), _jsx(Option, { value: "false", children: "Sin reportes" })] })] }) }), _jsx(Card, { children: _jsx(Table, { columns: columns, dataSource: reviewsData?.reviews, loading: isLoadingReviews, rowKey: "_id", pagination: {
                        total: reviewsData?.pagination?.total,
                        pageSize: searchParams.limit,
                        current: searchParams.page,
                        onChange: (page) => setSearchParams((prev) => ({ ...prev, page })),
                    } }) }), selectedReview && (_jsx(ModerationModal, { review: selectedReview, visible: moderationModalVisible, onClose: () => {
                    setModerationModalVisible(false);
                    setSelectedReview(null);
                }, onModerate: (reviewId, data) => {
                    moderateReviewMutation.mutate({ reviewId, data });
                } }))] }));
};
export default Reviews;
