import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Switch,
  Popconfirm,
  message,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import VehicleFamiliesService from "../../services/vehicle-families.service";

interface FamilyData {
  _id: string;
  name: string;
  brand_id: {
    _id: string;
    name: string;
  };
  active: boolean;
}

const FamilyView: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [editingFamily, setEditingFamily] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  // Parámetros de consulta
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc",
    search: "",
    activeOnly: true,
    brand_id: null,
  });

  // Obtener familias
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["families", queryParams],
    queryFn: () => VehicleFamiliesService.getFamilies(queryParams),
  });

  // Obtener marcas para el filtro y el formulario
  const { data: brandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: () =>
      VehicleFamiliesService.getBrands({ activeOnly: true, limit: 100 }),
  });

  const familiesData = apiResponse?.families;
  const paginationData = apiResponse?.pagination;

  // Mutación para crear familia
  const createMutation = useMutation({
    mutationFn: (data) => VehicleFamiliesService.createFamily(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      message.success("Familia creada correctamente");
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error("Error al crear la familia");
      console.error(error);
    },
  });

  // Mutación para actualizar familia
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => VehicleFamiliesService.updateFamily(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      message.success("Familia actualizada correctamente");
      setIsModalVisible(false);
    },
    onError: (error) => {
      message.error("Error al actualizar la familia");
      console.error(error);
    },
  });

  // Mutación para eliminar familia
  const deleteMutation = useMutation({
    mutationFn: (id: string) => VehicleFamiliesService.deleteFamily(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      message.success("Familia eliminada correctamente");
    },
    onError: (error) => {
      message.error("Error al eliminar la familia");
      console.error(error);
    },
  });

  const handleSearch = () => {
    // Reiniciar a la página 1 al buscar
    setQueryParams((prevParams) => ({
      ...prevParams,
      search: searchText,
      page: 1,
    }));
  };

  const handleBrandChange = (value) => {
    setSelectedBrandId(value);
    setQueryParams((prevParams) => ({
      ...prevParams,
      brand_id: value,
      page: 1,
    }));
  };

  const handleAddNew = () => {
    setEditingFamily(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingFamily(record);
    form.setFieldsValue({
      name: record.name,
      brand_id: record.brand_id?._id,
      active: record.active,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setQueryParams((prevParams) => ({
      ...prevParams,
      page: pagination.current,
      limit: pagination.pageSize,
      sortBy: sorter.field || "name",
      sortOrder:
        sorter.order === "ascend"
          ? "asc"
          : sorter.order === "descend"
          ? "desc"
          : prevParams.sortOrder,
    }));
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingFamily) {
          updateMutation.mutate({
            id: editingFamily._id,
            data: values,
          });
        } else {
          createMutation.mutate(values);
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingFamily(null);
    form.resetFields();
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Marca",
      dataIndex: ["brand_id", "name"],
      key: "brand",
      sorter: true,
    },
    {
      title: "Estado",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (
        <span style={{ color: active ? "green" : "red" }}>
          {active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            aria-label={`Editar ${record.name}`}
          />
          <Popconfirm
            title="¿Estás seguro de que deseas eliminar esta familia?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sí"
            cancelText="No"
            okButtonProps={{
              loading:
                deleteMutation.isPending &&
                deleteMutation.variables === record._id,
            }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              aria-label={`Eliminar ${record.name}`}
              disabled={
                deleteMutation.isPending &&
                deleteMutation.variables === record._id
              }
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Familias de Vehículos</h1>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <Input
            placeholder="Buscar..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filtrar por marca"
            allowClear
            style={{ width: 200 }}
            onChange={handleBrandChange}
            value={selectedBrandId}
            options={
              brandsData?.brands?.map((brand) => ({
                value: brand._id,
                label: brand.name,
              })) || []
            }
          />
          <Button type="primary" onClick={handleSearch}>
            Buscar
          </Button>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
        >
          Nueva Familia
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={familiesData}
        rowKey="_id"
        loading={isLoading}
        onChange={handleTableChange}
        pagination={{
          current: paginationData?.currentPage || 1,
          pageSize: paginationData?.itemsPerPage || 10,
          total: paginationData?.totalItems || 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
        }}
      />

      {/* Modal para crear/editar */}
      <Modal
        title={editingFamily ? "Editar Familia" : "Nueva Familia"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ active: true }}
        >
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
          >
            <Input placeholder="Nombre de la familia" />
          </Form.Item>
          <Form.Item
            name="brand_id"
            label="Marca"
            rules={[{ required: true, message: "Por favor seleccione la marca" }]}
          >
            <Select
              placeholder="Seleccionar marca"
              options={
                brandsData?.brands?.map((brand) => ({
                  value: brand._id,
                  label: brand.name,
                })) || []
              }
              loading={!brandsData}
            />
          </Form.Item>
          <Form.Item
            name="active"
            label="Activo"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FamilyView; 