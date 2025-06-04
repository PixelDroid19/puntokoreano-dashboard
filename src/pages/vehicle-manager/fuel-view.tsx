import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Space,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Card,
  Tooltip,
} from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import VehicleFamiliesService from '../../services/vehicle-families.service';
import { useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';
import FuelForm from "./forms/fuel-form";

interface FuelData {
  _id: string;
  name: string;
  octane_rating?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const FuelView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState<string>(searchParams.get('search') || '');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingFuel, setEditingFuel] = useState<FuelData | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  const currentPage = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('limit') || '10');
  const sortField = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const searchQuery = searchParams.get('search') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['fuels', currentPage, pageSize, sortField, sortOrder, searchQuery],
    queryFn: () => VehicleFamiliesService.getFuels({
      page: currentPage,
      limit: pageSize,
      sortBy: sortField,
      sortOrder: sortOrder as "asc" | "desc",
      search: searchQuery
    }),
  });

  const updateQueryParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const debouncedSearch = debounce((value: string) => {
    updateQueryParams({ search: value, page: '1' });
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const createFuelMutation = useMutation({
    mutationFn: (values: { name: string }) =>
      VehicleFamiliesService.addFuel(values.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuels"] });
      message.success("Combustible creado exitosamente");
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error: Error) => {
      message.error(error?.message || "Error al crear combustible");
    },
  });

  const updateFuelMutation = useMutation({
    mutationFn: (values: { id: string; name: string }) =>
      VehicleFamiliesService.updateFuel(values.id, { name: values.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuels"] });
      message.success("Combustible actualizado exitosamente");
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error: Error) => {
      message.error(error?.message || "Error al actualizar combustible");
    },
  });

  const deleteFuelMutation = useMutation({
    mutationFn: (id: string) => VehicleFamiliesService.deleteFuel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuels"] });
      message.success("Combustible eliminado exitosamente");
    },
    onError: (error: Error) => {
      message.error(error?.message || "Error al eliminar combustible");
    },
  });

  const handleAddFuel = () => {
    setIsModalVisible(true);
  };

  const handleEditFuel = (record: FuelData) => {
    setEditingFuel(record);
    form.setFieldsValue({
      name: { value: record._id, label: record.name, fuelData: record },
    });
    setIsModalVisible(true);
  };

  const handleDeleteFuel = (id: string) => {
    deleteFuelMutation.mutate(id);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const payload = {
        ...values,
        name: values.name?.label,
      };
      if (editingFuel) {
        updateFuelMutation.mutate({
          id: editingFuel._id,
          ...payload,
        });
      } else {
        createFuelMutation.mutate(payload);
      }
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    updateQueryParams({
      page: pagination.current.toString(),
      limit: pagination.pageSize.toString(),
      sortBy: sorter.field || 'createdAt',
      sortOrder: sorter.order ? (sorter.order === 'ascend' ? 'asc' : 'desc') : 'desc',
    });
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      sorter: true,
      render: (active: boolean) => (
        <span style={{ color: active ? 'green' : 'red' }}>
          {active ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      title: 'Fecha de creación',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: FuelData) => (
        <Space size="middle">
          <Tooltip title="Editar Combustible">
            <Button
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => {}}
              type="default"
              size="small"
              aria-label={`Editar ${record.name}`}
              disabled
            />
          </Tooltip>
          <Tooltip title="Eliminar Combustible">
            <Popconfirm
              title="¿Está seguro de eliminar este combustible?"
              onConfirm={() => handleDeleteFuel(record._id)}
              okText="Sí"
              cancelText="No"
            >
              <Button
                icon={<DeleteOutlined style={{ fontSize: 16 }} />}
                type="primary"
                danger
                size="small"
                aria-label={`Eliminar ${record.name}`}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col>
            <Typography.Title level={4}>Gestión de Combustibles</Typography.Title>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Buscar combustible"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={handleSearchChange}
                style={{ width: 250 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined style={{ fontSize: 16 }} />}
                onClick={handleAddFuel}
              >
                Agregar Combustible
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          dataSource={data?.fuels}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: data?.pagination?.currentPage || 1,
            pageSize: data?.pagination?.itemsPerPage || 10,
            total: data?.pagination?.totalItems || 0,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          onChange={handleTableChange}
          style={{ marginTop: '20px' }}
        />
      </Card>

      <Modal
        title={editingFuel ? 'Editar Combustible' : 'Agregar Combustible'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        {editingFuel ? (
          <FuelForm
            mode="edit"
            initialValues={{
              name: editingFuel.name,
              active: editingFuel.active,
            }}
            onSubmit={(values) => {
              updateFuelMutation.mutate({
                id: editingFuel._id,
                ...values,
              }, {
                onSuccess: () => {
                  setIsModalVisible(false);
                  setEditingFuel(null);
                  form.resetFields();
                }
              });
            }}
          />
        ) : (
          <FuelForm />
        )}
      </Modal>
    </div>
  );
};

export default FuelView; 