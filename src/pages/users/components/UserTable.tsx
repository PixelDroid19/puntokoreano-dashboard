import React from 'react';
import { Table, Tag, Space, Badge, Switch, Button, Tooltip } from 'antd';
import { UserOutlined, UnlockOutlined, LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { User } from '../../../types/users.types';
import UserActions from './UserActions';

interface UserTableProps {
  users: User[];
  userTypeFilter: string;
  onViewDetails: (user: User) => void;
  onToggleStatus: (userId: string, active: boolean) => void;
  onToggleMode: (userId: string) => void;
  onEdit: (user: User) => void;
  onBlock: (id: string, reason: string) => void;
  onUnblock: (id: string) => void;
  onDelete: (id: string) => void;
  onRefreshToken: (id: string) => void;
  onInvalidateSessions: (id: string) => void;
  onLogout: (id: string) => void;
  isToggleStatusLoading: boolean;
  isToggleModeLoading: boolean;
  loading?: boolean;
  pagination?: any;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  userTypeFilter,
  onViewDetails,
  onToggleStatus,
  onToggleMode,
  onEdit,
  onBlock,
  onUnblock,
  onDelete,
  onRefreshToken,
  onInvalidateSessions,
  onLogout,
  isToggleStatusLoading,
  isToggleModeLoading,
  loading,
  pagination
}) => {
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
          onChange={(checked) => onToggleStatus(record._id, checked)}
          checkedChildren={<UnlockOutlined />}
          unCheckedChildren={<LockOutlined />}
          loading={isToggleStatusLoading}
          disabled={record.role === "admin" && userTypeFilter === "admin"}
        />
      ),
    },
    {
      title: "Modo",
      key: "mode",
      render: (_: any, record: User) => (
        <Switch
          checked={record.isDevelopment}
          onChange={() => onToggleMode(record._id)}
          checkedChildren="Dev"
          unCheckedChildren="Prod"
          loading={isToggleModeLoading}
        />
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: User) => (
        <Space>
          <UserActions
            user={record}
            onEdit={onEdit}
            onBlock={onBlock}
            onUnblock={onUnblock}
            onDelete={onDelete}
            onRefreshToken={onRefreshToken}
            onInvalidateSessions={onInvalidateSessions}
            onLogout={onLogout}
          />
          <Tooltip title="Ver detalles">
            <Button
              icon={<UserOutlined />}
              onClick={() => onViewDetails(record)}
            >
              Detalles
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={users}
      columns={columns}
      rowKey="_id"
      loading={loading}
      pagination={pagination}
    />
  );
};

export default UserTable;