import React, { useState, useEffect } from 'react';
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
} from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import VehicleFamiliesService from '../../services/vehicle-families.service';
import { useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';

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
      sortOrder: sortOrder,
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
    mutationFn: (values: { name: string; octane_rating?: number }) => 
      VehicleFamiliesService.addFuel(values.name, values.octane_rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuels'] });
      message.success('Combustible creado exitosamente');
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error: Error) => {
      message.error(`Error al crear combustible: ${error.message}`);
    },
  });

  const updateFuelMutation = useMutation({
    mutationFn: (values: { id: string; name: string; octane_rating?: number }) => 
      VehicleFamiliesService.updateVehicle(values.id, { 
        name: values.name.toUpperCase(),
        octane_rating: values.octane_rating 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuels'] });
      message.success('Combustible actualizado exitosamente');
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error: Error) => {
      message.error(`Error al actualizar combustible: ${error.message}`);
    },
  });

  const deleteFuelMutation = useMutation({
    mutationFn: (id: string) => VehicleFamiliesService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuels'] });
      message.success('Combustible eliminado exitosamente');
    },
    onError: (error: Error) => {
      message.error(`Error al eliminar combustible: ${error.message}`);
    },
  });

  const handleAddFuel = () => {
    setEditingFuel(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditFuel = (record: FuelData) => {
    setEditingFuel(record);
    form.setFieldsValue({
      name: record.name,
      octane_rating: record.octane_rating,
    });
    setIsModalVisible(true);
  };

  const handleDeleteFuel = (id: string) => {
    deleteFuelMutation.mutate(id);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingFuel) {
        updateFuelMutation.mutate({
          id: editingFuel._id,
          name: values.name,
          octane_rating: values.octane_rating,
        });
      } else {
        createFuelMutation.mutate(values);
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
      title: 'Octanaje',
      dataIndex: 'octane_rating',
      key: 'octane_rating',
      sorter: true,
      render: (octane_rating: number | undefined) => octane_rating || 'N/A',
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
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditFuel(record)}
            type="primary"
            size="small"
          />
          <Popconfirm
            title="¿Está seguro de eliminar este combustible?"
            onConfirm={() => handleDeleteFuel(record._id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              type="primary"
              danger
              size="small"
            />
          </Popconfirm>
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
                icon={<PlusOutlined />}
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
            current: currentPage,
            pageSize: pageSize,
            total: data?.pagination.totalItems || 0,
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
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={createFuelMutation.isPending || updateFuelMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre del combustible' }]}
          >
            <Input placeholder="Ej: DIESEL, GASOLINA" />
          </Form.Item>
          <Form.Item name="octane_rating" label="Octanaje">
            <Input type="number" placeholder="Ej: 95" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FuelView; 