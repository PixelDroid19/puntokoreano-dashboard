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
import BrandForm from "./forms/brand-form";

const BrandView: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Parámetros de consulta
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc" as "asc" | "desc",
    search: "",
    activeOnly: true,
  });

  // Obtener marcas
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["brands", queryParams],
    queryFn: () => VehicleFamiliesService.getBrands(queryParams),
  });

  const brandsData = apiResponse?.brands;
  const paginationData = apiResponse?.pagination;

  // Mutación para eliminar marca
  const deleteMutation = useMutation({
    // Asegúrate que el servicio espera _id
    mutationFn: (id: string) => VehicleFamiliesService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      message.success("Marca eliminada correctamente");
    },
    onError: (error) => {
      message.error(error.message || "Error al eliminar la marca");
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

  const handleEdit = (record) => {
    setEditingBrand(record);
    form.setFieldsValue({
      name: { value: record._id, label: record.name, brandData: record },
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
      // Asegurarse de que sorter.field sea un campo válido para ordenar en el backend
      sortBy: sorter.field || "name",
      sortOrder:
        sorter.order === "ascend"
          ? "asc"
          : sorter.order === "descend"
          ? "desc"
          : prevParams.sortOrder, // Mantener orden si no hay sorter
    }));
  };

  const handleAddNew = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingBrand(null);
    form.resetFields();
  };

  const columns = [
    {
      title: "Nombre", // Traducido
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Estado", // Traducido
      dataIndex: "active",
      key: "active",
      // No necesita sorter generalmente, pero se podría añadir si el backend lo soporta
      render: (active: boolean) => (
        <span style={{ color: active ? "green" : "red" }}>
          {active ? "Activo" : "Inactivo"} {/* Traducido */}
        </span>
      ),
    },
    {
      title: "Acciones", // Traducido
      key: "actions",
      render: (_: any, record) => (
        <Space size="middle">
          <Tooltip title="Editar Marca">
            <Button
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => handleEdit(record)}
              aria-label={`Editar ${record.name}`}
            />
          </Tooltip>
          <Tooltip title="Eliminar Marca">
            <Popconfirm
              title="¿Estás seguro de que deseas eliminar esta marca?"
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
                aria-label={`Eliminar ${record.name}`}
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <Input
            placeholder="Buscar marcas"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            allowClear
          />
          <Button
            type="primary"
            onClick={handleSearch}
            icon={<SearchOutlined />}
          >
            Buscar
          </Button>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined style={{ fontSize: 16 }} />}
          onClick={handleAddNew}
        >
          Nueva Marca
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={brandsData || []}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          current: paginationData?.currentPage || 1,
          pageSize: paginationData?.itemsPerPage || 10,
          total: paginationData?.totalItems || 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} marcas`,
        }}
        onChange={handleTableChange}
      />

      {/* Modal */}
      <Modal
        title={editingBrand ? "Editar Marca" : "Añadir Marca"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        destroyOnClose
      >
        {editingBrand ? (
          <div>
            <p>Modo de edición para marca: {editingBrand.name}</p>
            <p>Función de edición en desarrollo.</p>
          </div>
        ) : (
          <BrandForm />
        )}
      </Modal>
    </div>
  );
};

export default BrandView;
