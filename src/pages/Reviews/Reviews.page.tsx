// @ts-nocheck
import React, { useEffect } from "react";
import {
  Card,
  Table,
  Rate,
  Tag,
  Space,
  Button,
  Select,
  Tooltip,
  Typography,
  Modal,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  LikeOutlined,
  ShoppingOutlined,
  WarningOutlined,
} from "@ant-design/icons";
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
    sortOrder: "desc" as "asc" | "desc",
  });
  const [selectedReview, setSelectedReview] = React.useState(null);
  const [moderationModalVisible, setModerationModalVisible] =
    React.useState(false);

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
    mutationFn: ({ reviewId, data }) =>
      DashboardReviewsService.moderateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews"]);
      queryClient.invalidateQueries(["reviewStats"]);
      setModerationModalVisible(false);
      message.success("Review moderada exitosamente");
    },
  });

  const handleReportMutation = useMutation({
    mutationFn: ({ reviewId, data }) =>
      DashboardReviewsService.handleReportedReview(reviewId, data),
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
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" className="text-xs">
            Código: {record?.product?.code}
          </Text>
        </Space>
      ),
    },
    {
      title: "Calificación",
      dataIndex: "rating",
      key: "rating",
      width: 140,
      render: (rating) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: "Review",
      dataIndex: "title",
      key: "review",
      render: (title, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{title}</Text>
          <Text type="secondary" className="text-sm line-clamp-2">
            {record.content}
          </Text>
          {record.purchase_verified && (
            <Tag color="green" icon={<ShoppingOutlined />}>
              Compra Verificada
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status, record) => (
        <Space direction="vertical" size={2}>
          <Tag
            color={
              status === "approved"
                ? "green"
                : status === "rejected"
                ? "red"
                : "gold"
            }
          >
            {status === "approved"
              ? "Aprobada"
              : status === "rejected"
              ? "Rechazada"
              : "Pendiente"}
          </Tag>
          {record.reported?.count > 0 && (
            <Tag color="red" icon={<WarningOutlined />}>
              {record.reported.count} reportes
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Interacciones",
      key: "interactions",
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text className="text-sm">
            <LikeOutlined /> {record.helpful_votes.positive} positivos
          </Text>
          <Text className="text-sm text-red-500">
            <CloseOutlined /> {record.helpful_votes.negative} negativos
          </Text>
        </Space>
      ),
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
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button
              icon={<ExclamationCircleOutlined />}
              onClick={() => {
                setSelectedReview(record);
                setModerationModalVisible(true);
              }}
            />
          </Tooltip>
          {record.status === "pending" && (
            <>
              <Tooltip title="Aprobar">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleQuickModeration(record, "approved")}
                />
              </Tooltip>
              <Tooltip title="Rechazar">
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleQuickModeration(record, "rejected")}
                />
              </Tooltip>
            </>
          )}
          {record.reported?.count > 0 && (
            <Tooltip title="Descartar reportes">
              <Button
                type="default"
                onClick={() => handleDismissReports(record)}
                icon={<CloseOutlined />}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Manejadores
  const handleQuickModeration = (review, status) => {
    Modal.confirm({
      title: `¿${status === "approved" ? "Aprobar" : "Rechazar"} esta review?`,
      icon: status === "approved" ? <CheckOutlined /> : <CloseOutlined />,
      content: "¿Estás seguro de que deseas realizar esta acción?",
      okText: "Sí",
      cancelText: "No",
      onOk: () => {
        moderateReviewMutation.mutate({
          reviewId: review._id,
          data: {
            status,
            moderationNote: `${
              status === "approved" ? "Aprobada" : "Rechazada"
            } por moderación rápida`,
          },
        });
      },
    });
  };

  const handleDismissReports = (review) => {
    Modal.confirm({
      title: "¿Descartar reportes?",
      content:
        "¿Estás seguro de que deseas descartar todos los reportes de esta review?",
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

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Reviews</h1>
      </div>

      {/* Estadísticas */}
      {!isLoadingStats && statsData && <ReviewStats stats={statsData} />}

      {/* Filtros */}
      <Card className="mb-6">
        <Space wrap className="w-full">
          <Select
            placeholder="Estado"
            allowClear
            style={{ width: 120 }}
            onChange={(value) =>
              setSearchParams((prev) => ({ ...prev, status: value }))
            }
          >
            <Option value="pending">Pendientes</Option>
            <Option value="approved">Aprobadas</Option>
            <Option value="rejected">Rechazadas</Option>
          </Select>
          <Select
            placeholder="Calificación"
            allowClear
            style={{ width: 120 }}
            onChange={(value) =>
              setSearchParams((prev) => ({ ...prev, rating: value }))
            }
          >
            {[5, 4, 3, 2, 1].map((rating) => (
              <Option key={rating} value={rating}>
                <Rate disabled defaultValue={rating} />
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Verificación"
            allowClear
            style={{ width: 150 }}
            onChange={(value) =>
              setSearchParams((prev) => ({ ...prev, verified: value }))
            }
          >
            <Option value="true">Verificadas</Option>
            <Option value="false">No verificadas</Option>
          </Select>
          <Select
            placeholder="Reportadas"
            allowClear
            style={{ width: 150 }}
            onChange={(value) =>
              setSearchParams((prev) => ({ ...prev, reported: value }))
            }
          >
            <Option value="true">Con reportes</Option>
            <Option value="false">Sin reportes</Option>
          </Select>
        </Space>
      </Card>

      {/* Tabla de Reviews */}
      <Card>
        <Table
          columns={columns}
          dataSource={reviewsData?.reviews}
          loading={isLoadingReviews}
          rowKey="_id"
          pagination={{
            total: reviewsData?.pagination?.total,
            pageSize: searchParams.limit,
            current: searchParams.page,
            onChange: (page) => setSearchParams((prev) => ({ ...prev, page })),
          }}
        />
      </Card>

      {/* Modal de Moderación */}
      {selectedReview && (
        <ModerationModal
          review={selectedReview}
          visible={moderationModalVisible}
          onClose={() => {
            setModerationModalVisible(false);
            setSelectedReview(null);
          }}
          onModerate={(reviewId, data) => {
            moderateReviewMutation.mutate({ reviewId, data });
          }}
        />
      )}
    </div>
  );
};

export default Reviews;
