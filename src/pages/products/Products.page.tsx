// Products.page.tsx
import {
  Table,
  Tag,
  Tooltip,
  Input,
  Button,
  Popconfirm,
  message,
  Space,
  Modal,
  Descriptions,
  Image,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import HeaderTable from "./components/HeaderTable.component";
import { ProductEdit } from "./components/ProductEdit";
import { useMediaQuery } from "react-responsive";
import React from "react";
import ProductsService from "../../services/products.service";
import { Product } from "../../api/types";
import debounce from "lodash/debounce";
import { ProductView } from "./components/ProductView";

const Products = () => {
  const queryClient = useQueryClient();
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1023px)" });
  const [searchText, setSearchText] = React.useState("");
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Query para obtener productos
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", pagination.current, pagination.pageSize, searchText],
    queryFn: () =>
      ProductsService.getProducts({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined,
      }),
    keepPreviousData: true,
  });

  // Mutación para eliminar producto
  const deleteProduct = useMutation({
    mutationFn: (id: string) => ProductsService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Producto eliminado correctamente");
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  // Mutación para toggle status
  const toggleStatus = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      ProductsService.toggleProductStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Estado actualizado correctamente");
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  // Manejador de cambio de página
  const handleTableChange = (pagination: any) => {
    setPagination((prev) => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  // Búsqueda debounced
  const handleSearch = debounce((value: string) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, 500);

  // Columnas de la tabla
  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      ellipsis: isTabletOrMobile,
      fixed: isTabletOrMobile,
      render: (name: string) =>
        isTabletOrMobile ? (
          <Tooltip placement="topLeft" title={name}>
            {name}
          </Tooltip>
        ) : (
          name
        ),
    },
    {
      title: "SKU",
      dataIndex: "code",
      key: "code",
      ellipsis: true,
      width: 90,
    },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      ellipsis: true,
      render: (price: number) =>
        price?.toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      ellipsis: true,
      render: (stock: number) => {
        const color = stock > 10 ? "green" : stock > 0 ? "orange" : "red";
        return <Tag color={color}>{stock.toLocaleString("es-CO")}</Tag>;
      },
    },
    {
      title: "Estado",
      dataIndex: "active",
      key: "active",
      render: (active: boolean, record: Product) => (
        <Tag
          color={active ? "green" : "volcano"}
          style={{ cursor: "pointer" }}
          onClick={() =>
            toggleStatus.mutate({ id: record.id, active: !active })
          }
        >
          {active ? "Activo" : "Inactivo"}
        </Tag>
      ),
      ellipsis: true,
    },
    {
      title: "Acciones",
      key: "action",
      width: 120,
      render: (_, record: Product) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedProduct(record);
              setIsViewModalOpen(true);
            }}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setSelectedProduct(record);
              setIsEditModalOpen(true);
            }}
          />
          <Popconfirm
            title="¿Eliminar producto?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => deleteProduct.mutate(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  React.useEffect(() => {
    if (data?.pagination) {
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    }
  }, [data]);

  if (isError) {
    return <div className="error-container">Error al cargar los productos</div>;
  }

  return (
    <div className="products-container">
      <div className="table-header">
        <HeaderTable />
        <Input
          placeholder="Buscar por nombre o SKU"
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300, marginBottom: 16 }}
        />
      </div>

      <Table
        size="middle"
        loading={isLoading}
        scroll={{ x: isTabletOrMobile ? 850 : true }}
        dataSource={data?.products.map((product) => ({
          ...product,
          key: product.id,
        }))}
        columns={columns}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} productos`,
        }}
        onChange={handleTableChange}
      />

      {/* Modal de Vista */}
      {selectedProduct && (
        <ProductView
          open={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}

      {/* ProductEdit Modal */}
      {selectedProduct && (
        <ProductEdit
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default Products;
