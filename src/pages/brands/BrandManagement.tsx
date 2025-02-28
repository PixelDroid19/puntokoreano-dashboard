// src/pages/brands/BrandManagement.tsx
import React, { useState } from "react";
import { Table, Button, Form, message, Space, Tag, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BrandService from "../../services/brand.service";
import { Brand } from "../../api/types";
import BrandFormModal from "./BrandFormModal";

const BrandManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const queryClient = useQueryClient();

  const { data: brands, isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: () => BrandService.getBrands(),
  });

  const createBrand = useMutation({
    mutationFn: (values: Partial<Brand>) => BrandService.createBrand(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      message.success("Marca creada correctamente");
      setIsModalVisible(false);
      form.resetFields();
    },
  });

  const updateBrand = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Brand> }) =>
      BrandService.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      message.success("Marca actualizada correctamente");
      setIsModalVisible(false);
      setEditingBrand(null);
      form.resetFields();
    },
  });

  const deleteBrand = useMutation({
    mutationFn: (id: string) => BrandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      message.success("Marca eliminada correctamente");
    },
  });


  const columns = [
    {
      title: "Logo",
      dataIndex: ["logo", "url"],
      key: "logo",
      render: (url: string) => (
        <img
          src={url || "/placeholder-logo.png"}
          alt="logo"
          className="w-12 h-12 object-contain"
          onError={(e) => {
            e.currentTarget.src = "/placeholder-logo.png";
          }}
        />
      ),
    },
    {
      title: "Nombre",
      dataIndex: "display_name",
      key: "display_name",
      sorter: (a: Brand, b: Brand) =>
        a.display_name.localeCompare(b.display_name),
    },
    {
      title: "Identificador",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Artículos",
      dataIndex: "stats",
      key: "stats",
      render: (blogs: {
        articleCount: number;
        totalViews: number;
        latestArticle: number;
      }) => (
        <Tag color="blue">
          {blogs?.articleCount || 0} artículo
          {blogs?.articleCount !== 1 ? "s" : ""}
        </Tag>
      ),
    },
    {
      title: "Período",
      key: "period",
      render: (_: unknown, record: Brand) => (
        <span>
          {record.metadata?.year_start} -{" "}
          {record.metadata?.year_end || "Actual"}
        </span>
      ),
    },
    {
      title: "Estado",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (
        <Tag color={active ? "success" : "error"}>
          {active ? "Activo" : "Inactivo"}
        </Tag>
      ),
      filters: [
        { text: "Activo", value: true },
        { text: "Inactivo", value: false },
      ],
      onFilter: (value: boolean, record: Brand) => record.active === value,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (text: string, record: Brand) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingBrand(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="¿Eliminar marca?"
            onConfirm={() => deleteBrand.mutate(record._id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      name: values.name.toLowerCase(),
      metadata: {
        year_start: values.year_range?.[0]?.year(),
        year_end: values.year_range?.[1]?.year(),
        popular_models: values.metadata?.popular_models || [],
      },
      image: values.image || undefined,
      logo: values.logo || undefined,
      styles: {
        background: values.styles?.background || "bg-blue-500",
        text_color: values.styles?.text_color || "text-white",
        border_color: values.styles?.border_color || "border-blue-500",
      },
    };

    if (editingBrand) {
      console.log("editingBrand", editingBrand);
      updateBrand.mutate({
        id: editingBrand.id,
        data: formattedValues,
      });
    } else {
      createBrand.mutate(formattedValues);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Marcas</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Nueva Marca
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={brands?.data}
        loading={isLoading}
        rowKey="_id"
        pagination={{
          total: brands?.total,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} marcas`,
        }}
      />

      <BrandFormModal
        form={form}
        isVisible={isModalVisible}
        editingBrand={editingBrand}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingBrand(null);
          form.resetFields();
        }}
        onFinish={handleFinish}
        loading={createBrand.isPending || updateBrand.isPending}
      />
    </div>
  );
};

export default BrandManagement;
