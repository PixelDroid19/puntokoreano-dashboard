import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Popconfirm,
  Switch,
  message,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import VehicleFamiliesService from "../../services/vehicle-families.service";
import VehicleMainForm from "./forms/VehicleMainForm";

interface Vehicle {
  _id: string;
  color: string | null;
  price: number | null;
  transmission_id: { _id: string; name: string } | null;
  fuel_id: { _id: string; name: string } | null;
  line_id: { _id: string; name: string } | null;
  active: boolean;
}

interface ApiResponse {
  vehicles: Vehicle[];
  pagination: {
    total: number;
    limit: number;
    page: number;
  };
}

interface QueryParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  search: string;
  activeOnly: boolean;
}

const VehicleView: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    search: "",
    activeOnly: true,
  });

  const { data: apiResponse, isLoading } = useQuery<ApiResponse>({
    queryKey: ["vehicles", queryParams],
    queryFn: () => VehicleFamiliesService.getVehicles(queryParams),
  });

  const vehiclesData = apiResponse?.vehicles;
  const paginationData = apiResponse?.pagination;

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      VehicleFamiliesService.updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      message.success("Vehículo actualizado correctamente");
      setIsModalVisible(false);
    },
    onError: (error: any) => {
      message.error(
        `Error al actualizar el vehículo: ${
          error.message || "Error desconocido"
        }`
      );
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => VehicleFamiliesService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      message.success("Vehículo eliminado correctamente");
      if (vehiclesData?.length === 1 && queryParams.page > 1) {
        setQueryParams((prev) => ({ ...prev, page: prev.page - 1 }));
      }
    },
    onError: (error: any) => {
      message.error(
        `Error al eliminar el vehículo: ${error.message || "Error desconocido"}`
      );
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

  const handleEdit = (record: Vehicle) => {
    setEditingVehicle(record);
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
      sortBy: sorter.field || "createdAt",
      sortOrder:
        sorter.order === "ascend"
          ? "asc"
          : sorter.order === "descend"
          ? "desc"
          : prevParams.sortOrder,
    }));
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingVehicle(null);
    form.resetFields();
  };

  const columns = [
    {
      title: "Identificador",
      dataIndex: "tag_id",
      key: "tag_id",
    },

    {
      title: "Transmisión",
      dataIndex: ["transmission_id", "name"],
      key: "transmission",
      render: (_: any, record: any) => record.transmission_id?.name || "N/D",
    },
    {
      title: "Combustible",
      dataIndex: ["fuel_id", "name"],
      key: "fuel",
      render: (_: any, record: any) => record.fuel_id?.name || "N/D",
    },
    {
      title: "Línea",
      dataIndex: ["line_id", "name"],
      key: "line",
      render: (_: any, record: any) => record.line_id?.name || "N/D",
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      sorter: true,
      render: (color) => color || "N/D",
    },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      sorter: true,
      render: (price: number | null) =>
        price != null ? `$${price.toLocaleString("es-CO")}` : "N/A",
      align: "right" as const,
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
      align: "center" as const,
    },
    {
      title: "Acciones",
      key: "actions",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Editar Vehículo">
            <Button
              type="default"
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => {}}
              aria-label={`Editar vehículo ${record.line_id?.name || record._id}`}
              disabled
            />
          </Tooltip>
          <Tooltip title="Eliminar Vehículo">
            <Popconfirm
              title="¿Estás seguro de eliminar este vehículo?"
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
                icon={<DeleteOutlined style={{ fontSize: 16 }} />}
                aria-label={`Eliminar vehículo ${record.line_id?.name || record._id}`}
                disabled={
                  deleteMutation.isPending &&
                  deleteMutation.variables === record._id
                }
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <Space>
          <Input
            placeholder="Buscar por color, línea..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            allowClear
          />
          <Button
            type="primary"
            onClick={handleSearch}
            icon={<SearchOutlined />}
          >
            Buscar
          </Button>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined style={{ fontSize: 16 }} />}
          onClick={() => {
            setEditingVehicle(null);
            setIsModalVisible(true);
            form.resetFields();
          }}
        >
          Nuevo Vehículo
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={vehiclesData || []}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          current: paginationData?.currentPage || 1,
          pageSize: paginationData?.itemsPerPage || 10,
          total: paginationData?.totalItems || 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} vehículos`,
        }}
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={editingVehicle ? "Editar Vehículo" : "Añadir Vehículo"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        destroyOnClose
        maskClosable={false}
      width={'80vh'}
      >
        <VehicleMainForm />
      </Modal>
    </div>
  );
};

export default VehicleView;
