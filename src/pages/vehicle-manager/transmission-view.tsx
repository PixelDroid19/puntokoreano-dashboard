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
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import VehicleFamiliesService from "../../services/vehicle-families.service";

interface TransmissionData {
  _id: string;
  name: string;
  active: boolean;
}

const TransmissionView: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [editingTransmission, setEditingTransmission] = useState<TransmissionData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Parámetros de consulta
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc",
    search: "",
  });

  // Obtener transmisiones
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["transmissions", queryParams],
    queryFn: () => VehicleFamiliesService.getTransmissions(queryParams),
  });

  const transmissionsData = apiResponse?.transmissions;
  const paginationData = apiResponse?.pagination;

  // Mutación para crear transmisión
  const createMutation = useMutation({
    mutationFn: (values: { name: string; active: boolean }) => 
      VehicleFamiliesService.addTransmission(values.name, values.active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transmissions"] });
      message.success("Transmisión creada correctamente");
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error?.message || "Error al crear la transmisión");
      console.error(error);
    },
  });

  // Mutación para actualizar transmisión (asume que existe un método para actualizar)
  const updateMutation = useMutation({
    mutationFn: (params: { id: string; data: { name: string; active: boolean } }) => {
      // Asumimos que podemos usar updateVehicle para esto o se creará un método específico
      return VehicleFamiliesService.updateVehicle(params.id, {
        name: params.data.name,
        active: params.data.active,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transmissions"] });
      message.success("Transmisión actualizada correctamente");
      setIsModalVisible(false);
    },
    onError: (error: any) => {
      message.error(error?.message || "Error al actualizar la transmisión");
      console.error(error);
    },
  });

  // Mutación para eliminar transmisión
  const deleteMutation = useMutation({
    mutationFn: (id: string) => VehicleFamiliesService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transmissions"] });
      message.success("Transmisión eliminada correctamente");
    },
    onError: (error: any) => {
      message.error(error?.message || "Error al eliminar la transmisión");
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

  const handleAddNew = () => {
    setEditingTransmission(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: TransmissionData) => {
    setEditingTransmission(record);
    form.setFieldsValue({
      name: record.name,
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
        if (editingTransmission) {
          updateMutation.mutate({
            id: editingTransmission._id,
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
    setEditingTransmission(null);
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
      render: (_, record: TransmissionData) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            aria-label={`Editar ${record.name}`}
          />
          <Popconfirm
            title="¿Estás seguro de que deseas eliminar esta transmisión?"
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
      <h1>Gestión de Transmisiones de Vehículos</h1>
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
          <Button type="primary" onClick={handleSearch}>
            Buscar
          </Button>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
        >
          Nueva Transmisión
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={transmissionsData}
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
        title={editingTransmission ? "Editar Transmisión" : "Nueva Transmisión"}
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
            <Input placeholder="Nombre de la transmisión" />
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

export default TransmissionView; 