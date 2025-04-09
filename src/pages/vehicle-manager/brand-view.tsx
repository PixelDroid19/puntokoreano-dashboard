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
} from "@ant-design/icons";
import VehicleFamiliesService from "../../services/vehicle-families.service";

interface BrandData {
  _id: string;
  name: string;
  country: string;
  active: boolean;
  // Add any other properties your API returns
}



const BrandView: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [editingBrand, setEditingBrand] = useState(null);
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
    // Asegúrate que el servicio espera _id y los datos correctos
    mutationFn: (
      { id, data }: { id: string; data } // Omitir campos no editables
    ) => VehicleFamiliesService.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      message.success("Marca actualizada correctamente");
      setIsModalVisible(false);
    },
    onError: (error) => {
      message.error("Error al actualizar la marca");
      console.error(error);
    },
  });

  // Mutación para eliminar marca
  const deleteMutation = useMutation({
    // Asegúrate que el servicio espera _id
    mutationFn: (id: string) => VehicleFamiliesService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      message.success("Marca eliminada correctamente");
    },
    onError: (error) => {
      message.error("Error al eliminar la marca");
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

  const handleEdit = (record) => {
    setEditingBrand(record);
    form.setFieldsValue({
      name: record.name,
      country: record.country,
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

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        // Tipar values
        if (editingBrand) {
          updateMutation.mutate({
            id: editingBrand._id, // Usar _id
            data: values,
          });
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
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
      title: "País", // Traducido
      dataIndex: "country",
      key: "country",
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
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            aria-label={`Editar ${record.name}`} // Accesibilidad
          />
          <Popconfirm
            title="¿Estás seguro de que deseas eliminar esta marca?" // Traducido
            onConfirm={() => handleDelete(record._id)} // Usar _id
            okText="Sí" // Traducido
            cancelText="No" // Traducido
            okButtonProps={{
              loading:
                deleteMutation.isPending &&
                deleteMutation.variables === record._id,
            }} // Mostrar carga en el botón Sí
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              aria-label={`Eliminar ${record.name}`} // Accesibilidad
              // Opcional: Deshabilitar si la mutación está en curso para *este* item
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
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Space>
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
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={brandsData || []}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          current: paginationData?.page || 1,
          pageSize: paginationData?.limit || 10,
          total: paginationData?.total || 0,
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
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={updateMutation.isPending}
        okText="Guardar"
        cancelText="Cancelar"
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="brand_form">
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="country"
            label="País"
            rules={[{ required: true, message: "Por favor ingrese el país" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="active"
            label="Activo"
            valuePropName="checked"
            initialValue={true} // O el valor por defecto que prefieras
          >
            <Switch checkedChildren="Sí" unCheckedChildren="No" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BrandView;
