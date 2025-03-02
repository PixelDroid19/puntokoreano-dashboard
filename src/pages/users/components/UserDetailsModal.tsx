import React from 'react';
import { Modal, Tabs, Alert, Card, Statistic, Table, Tag } from 'antd';
import { CalendarOutlined, ShoppingCartOutlined, DollarOutlined, StarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { User } from '../../../types/users.types';

interface UserDetailsModalProps {
  user: User | null;
  visible: boolean;
  onClose: () => void;
  currentTab: 'stats' | 'purchases' | 'reviews';
  onTabChange: (tab: 'stats' | 'purchases' | 'reviews') => void;
  userStats: any;
  userPurchases: any;
  userReviews: any;
  statsLoading: boolean;
  purchasesLoading: boolean;
  reviewsLoading: boolean;
}

const { TabPane } = Tabs;

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  visible,
  onClose,
  currentTab,
  onTabChange,
  userStats,
  userPurchases,
  userReviews,
  statsLoading,
  purchasesLoading,
  reviewsLoading,
}) => {
  const renderContent = () => {
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
    <Modal
      title={`Detalles de Usuario: ${user?.name || ''}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Tabs
        activeKey={currentTab}
        onChange={(key) => onTabChange(key as 'stats' | 'purchases' | 'reviews')}
      >
        <TabPane tab="Estadísticas" key="stats" />
        <TabPane tab="Compras" key="purchases" />
        <TabPane tab="Reseñas" key="reviews" />
      </Tabs>
      {renderContent()}
    </Modal>
  );
};

export default UserDetailsModal;