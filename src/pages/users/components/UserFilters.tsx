import React from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface UserFiltersProps {
  searchText: string;
  statusFilter: 'active' | 'inactive' | '';
  userTypeFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: 'active' | 'inactive' | '') => void;
  onUserTypeFilterChange: (value: string) => void;
}

const { Option } = Select;

const UserFilters: React.FC<UserFiltersProps> = ({
  searchText,
  statusFilter,
  userTypeFilter,
  onSearchChange,
  onStatusFilterChange,
  onUserTypeFilterChange,
}) => {
  return (
    <Space className="mb-4 w-full flex justify-between">
      <Input
        placeholder="Buscar usuarios"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 250 }}
        allowClear
      />
      <Space>
        <Select
          value={statusFilter}
          onChange={onStatusFilterChange}
          style={{ width: 120 }}
        >
          <Option value="">Todos</Option>
          <Option value="active">Activos</Option>
          <Option value="inactive">Inactivos</Option>
        </Select>

        <Select
          value={userTypeFilter}
          onChange={onUserTypeFilterChange}
          style={{ width: 150 }}
        >
          <Option value="all">Todos</Option>
          <Option value="admin">Administradores</Option>
          <Option value="customer">Clientes</Option>
        </Select>
      </Space>
    </Space>
  );
};

export default UserFilters;