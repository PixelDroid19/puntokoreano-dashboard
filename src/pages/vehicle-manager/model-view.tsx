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
  InputNumber,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import VehicleFamiliesService from "../../services/vehicle-families.service";

interface ModelData {
  _id: string;
  name: string;
  year: number;
  engine_type: string;
  family_id: {
    _id: string;
    name: string;
    brand_id: {
      _id: string;
      name: string;
    };
  };
  active: boolean;
}

const ModelView: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [editingModel, setEditingModel] = useState<ModelData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);

  // Parámetros de consulta
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc",
    search: "",
    active: true,
    family_id: null as string | null,
  });

  // Obtener modelos
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["models", queryParams],
    queryFn: () => VehicleFamiliesService.getModels(queryParams),
  });

  // Obtener familias para el filtro y el formulario
  const { data: familiesData } = useQuery({
    queryKey: ["families"],
    queryFn: () => VehicleFamiliesService.getFamilies({ active: true, limit: 100 }),
  });

  const modelsData = apiResponse?.models;
  const paginationData = apiResponse?.pagination;

  // Mutación para crear modelo
  const createMutation = useMutation({
    mutationFn: (data: any) => VehicleFamiliesService.addModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      message.success("Modelo creado correctamente");
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error?.message || "Error al crear el modelo");
      console.error(error);
    },
  });

  // Mutación para actualizar modelo
  const updateMutation = useMutation({
    mutationFn: (params: { id: string, data: any }) => 
      VehicleFamiliesService.updateVehicle(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      message.success("Modelo actualizado correctamente");
      setIsModalVisible(false);
    },
    onError: (error: any) => {
      message.error(error?.message || "Error al actualizar el modelo");
      console.error(error);
    },
  });

  // Mutación para eliminar modelo
  const deleteMutation = useMutation({
    mutationFn: (id: string) => VehicleFamiliesService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      message.success("Modelo eliminado correctamente");
    },
    onError: (error: any) => {
      message.error(error?.message || "Error al eliminar el modelo");
      console.error(error);
    },
  });

  const handleSearch = () => {
    setQueryParams((prevParams) => ({
      ...prevParams,
      search: searchText,
      page: 1,
    }));
  };

  const handleFamilyChange = (value: string | null) => {
    setSelectedFamilyId(value);
    setQueryParams((prevParams) => ({
      ...prevParams,
      family_id: value,
      page: 1,
    }));
  };

  const handleAddNew = () => {
    setEditingModel(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: ModelData) => {
    setEditingModel(record);
    form.setFieldsValue({
      name: record.name,
      year: record.year,
      engine_type: record.engine_type,
      family_id: record.family_id?._id,
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
        const modelData = {
          name: values.name,
          familyId: values.family_id,
          year: values.year.toString(),
          engineType: values.engine_type,
          active: values.active
        };

        if (editingModel) {
          updateMutation.mutate({
            id: editingModel._id,
            data: modelData,
          });
        } else {
          createMutation.mutate(modelData);
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingModel(null);
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
      title: "Año",
      dataIndex: "year",
      key: "year",
      sorter: true,
    },
    {
      title: "Tipo de Motor",
      dataIndex: "engine_type",
      key: "engine_type",
      sorter: true,
    },
    {
      title: "Familia",
      dataIndex: ["family_id", "name"],
      key: "family",
      sorter: true,
    },
    {
      title: "Marca",
      dataIndex: ["family_id", "brand_id", "name"],
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
            title="¿Estás seguro de que deseas eliminar este modelo?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sí"
            cancelText="No"
            okButtonProps={{
              loading:
                deleteMutation.isPending && deleteMutation.variables === record._id,
            }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              aria-label={`Eliminar ${record.name}`}
              disabled={
                deleteMutation.isPending && deleteMutation.variables === record._id
              }
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 40 }, (_, i) => currentYear - i); // Últimos 40 años

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Modelos de Vehículos</h1>
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
            placeholder="Filtrar por familia"
            allowClear
            style={{ width: 200 }}
            onChange={handleFamilyChange}
            value={selectedFamilyId}
            options={
              familiesData?.families?.map((family) => ({
                value: family._id,
                label: `${family.brand_id?.name || ''} - ${family.name}`,
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
          Nuevo Modelo
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={modelsData}
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
        title={editingModel ? "Editar Modelo" : "Nuevo Modelo"}
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
            <Input placeholder="Nombre del modelo" />
          </Form.Item>
          <Form.Item
            name="year"
            label="Año"
            rules={[{ required: true, message: "Por favor seleccione el año" }]}
          >
            <InputNumber 
              min={1950} 
              max={currentYear + 2}
              placeholder="Año del modelo" 
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="engine_type"
            label="Tipo de Motor"
            rules={[{ required: true, message: "Por favor ingrese el tipo de motor" }]}
          >
            <Input placeholder="Ej: 2.0L Turbo, V6 3.5L, etc." />
          </Form.Item>
          <Form.Item
            name="family_id"
            label="Familia"
            rules={[{ required: true, message: "Por favor seleccione la familia" }]}
          >
            <Select
              placeholder="Seleccionar familia"
              options={
                familiesData?.families?.map((family) => ({
                  value: family._id,
                  label: `${family.brand_id?.name || ''} - ${family.name}`,
                })) || []
              }
              loading={!familiesData}
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

export default ModelView; 