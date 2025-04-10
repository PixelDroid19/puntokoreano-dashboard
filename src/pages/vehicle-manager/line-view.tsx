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

interface LineData {
  _id: string;
  name: string;
  features: string;
  price?: number;
  model_id: {
    _id: string;
    name: string;
    year: number;
    family_id: {
      _id: string;
      name: string;
      brand_id: {
        _id: string;
        name: string;
      };
    };
  };
  active: boolean;
}

const LineView: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [editingLine, setEditingLine] = useState<LineData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  // Parámetros de consulta
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc",
    search: "",
    model_id: null as string | null,
  });

  // Obtener líneas
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["lines", queryParams],
    queryFn: () => VehicleFamiliesService.getLines(queryParams),
  });

  // Obtener modelos para el filtro y el formulario
  const { data: modelsData } = useQuery({
    queryKey: ["models"],
    queryFn: () => VehicleFamiliesService.getModels({ 
      page: 1, 
      limit: 100, 
      sortBy: "name",
      sortOrder: "asc"
    }),
  });

  const linesData = apiResponse?.lines;
  const paginationData = apiResponse?.pagination;

  // Mutación para crear línea
  const createMutation = useMutation({
    mutationFn: (values: any) => {
      const { model_id, name, features, price, active } = values;
      return VehicleFamiliesService.addLine(
        model_id,
        name,
        features,
        price,
        active
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lines"] });
      message.success("Línea creada correctamente");
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error?.message || "Error al crear la línea");
      console.error(error);
    },
  });

  // Mutación para actualizar línea
  const updateMutation = useMutation({
    mutationFn: (params: { id: string; data: any }) => {
      const { model_id, name, features, price, active } = params.data;
      // Para actualización, usamos el updateVehicle ya que no hay un método específico
      return VehicleFamiliesService.updateVehicle(params.id, {
        line_id: model_id,
        name,
        features,
        price,
        active,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lines"] });
      message.success("Línea actualizada correctamente");
      setIsModalVisible(false);
    },
    onError: (error: any) => {
      message.error(error?.message || "Error al actualizar la línea");
      console.error(error);
    },
  });

  // Mutación para eliminar línea
  const deleteMutation = useMutation({
    mutationFn: (id: string) => VehicleFamiliesService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lines"] });
      message.success("Línea eliminada correctamente");
    },
    onError: (error: any) => {
      message.error(error?.message || "Error al eliminar la línea");
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

  const handleModelChange = (value: string | null) => {
    setSelectedModelId(value);
    setQueryParams((prevParams) => ({
      ...prevParams,
      model_id: value,
      page: 1,
    }));
  };

  const handleAddNew = () => {
    setEditingLine(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: LineData) => {
    setEditingLine(record);
    form.setFieldsValue({
      name: record.name,
      features: record.features,
      price: record.price,
      model_id: record.model_id?._id,
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
        if (editingLine) {
          updateMutation.mutate({
            id: editingLine._id,
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
    setEditingLine(null);
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
      title: "Modelo",
      dataIndex: ["model_id", "name"],
      key: "model",
      sorter: true,
      render: (_, record) => (
        <span>
          {record.model_id?.name} ({record.model_id?.year})
        </span>
      ),
    },
    {
      title: "Familia",
      dataIndex: ["model_id", "family_id", "name"],
      key: "family",
      sorter: true,
    },
    {
      title: "Marca",
      dataIndex: ["model_id", "family_id", "brand_id", "name"],
      key: "brand",
      sorter: true,
    },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      sorter: true,
      render: (price) => (price ? `$${price.toLocaleString()}` : "-"),
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
            title="¿Estás seguro de que deseas eliminar esta línea?"
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

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Líneas de Vehículos</h1>
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
            placeholder="Filtrar por modelo"
            allowClear
            style={{ width: 250 }}
            onChange={handleModelChange}
            value={selectedModelId}
            options={
              modelsData?.models?.map((model) => ({
                value: model._id,
                label: `${model.family_id?.brand_id?.name || ""} - ${
                  model.family_id?.name || ""
                } - ${model.name} (${model.year})`,
              })) || []
            }
          />
          <Button type="primary" onClick={handleSearch}>
            Buscar
          </Button>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Nueva Línea
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={linesData}
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
        title={editingLine ? "Editar Línea" : "Nueva Línea"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ active: true }}>
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
          >
            <Input placeholder="Nombre de la línea" />
          </Form.Item>
          <Form.Item
            name="model_id"
            label="Modelo"
            rules={[
              { required: true, message: "Por favor seleccione el modelo" },
            ]}
          >
            <Select
              placeholder="Seleccionar modelo"
              options={
                modelsData?.models?.map((model) => ({
                  value: model._id,
                  label: `${model.family_id?.brand_id?.name || ""} - ${
                    model.family_id?.name || ""
                  } - ${model.name} (${model.year})`,
                })) || []
              }
              loading={!modelsData}
            />
          </Form.Item>
          <Form.Item name="features" label="Características">
            <Input.TextArea
              placeholder="Ej: 4x4, airbags, etc."
              rows={3}
            />
          </Form.Item>
          <Form.Item name="price" label="Precio">
            <InputNumber
              min={0}
              placeholder="Precio de la línea"
              style={{ width: "100%" }}
              formatter={(value) =>
                value ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
              }
              parser={(value) => {
                const parsed = value ? value.replace(/\$\s?|(,*)/g, "") : "";
                return parsed === "" ? undefined : parsed;
              }}
            />
          </Form.Item>
          <Form.Item name="active" label="Activo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LineView; 