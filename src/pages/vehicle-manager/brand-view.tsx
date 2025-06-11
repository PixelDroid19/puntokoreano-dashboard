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

  // Mutación para actualizar marca
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      VehicleFamiliesService.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      message.success("Marca actualizada correctamente");
      setIsModalVisible(false);
      setEditingBrand(null);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error?.message || "Error al actualizar la marca");
      console.error(error);
    },
  });

  // Mutación para eliminar marca
  const deleteMutation = useMutation({
    mutationFn: (id: string) => VehicleFamiliesService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      message.success("Marca eliminada correctamente");
    },
    onError: (error: any) => {
      message.error(error?.message || "Error al eliminar la marca");
    },
  });

  const handleSearch = () => {
    setQueryParams((prevParams) => ({
      ...prevParams,
      search: searchText,
      page: 1,
    }));
  };

  const handleEdit = (record: any) => {
    setEditingBrand(record);
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
      render: (_: any, record: any) => (
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
          <BrandForm
            mode="edit"
            initialValues={{
              name: editingBrand.name,
              active: editingBrand.active,
            }}
            onSubmit={(values) => {
              updateMutation.mutate({
                id: editingBrand._id,
                data: values,
              });
            }}
          />
        ) : (
          <BrandForm />
        )}
      </Modal>
    </div>
  );
};

export default BrandView;
