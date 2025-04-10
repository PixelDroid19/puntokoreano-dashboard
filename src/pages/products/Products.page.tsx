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
  Typography,
  Card,
  Badge,
} from "antd";
const { Text } = Typography;
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PercentageOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import HeaderTable from "./components/HeaderTable.component";
import { ProductEdit } from "./components/ProductEdit";
import { useMediaQuery } from "react-responsive";
import ProductsService from "../../services/products.service";
import type { Product } from "../../api/types";
import debounce from "lodash/debounce";
import { ProductView } from "./components/ProductView";
import DiscountModal from "./components/DiscountModal";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const Products = () => {
  const queryClient = useQueryClient();
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1023px)" });
  const [searchText, setSearchText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", pagination.current, pagination.pageSize, searchText],
    queryFn: () =>
      ProductsService.getProducts({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined,
      }),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => ProductsService.deleteProduct(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });

      message.success("Producto eliminado correctamente");
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message ||
          error.message ||
          "Error al eliminar producto"
      );
    },
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      ProductsService.updateProduct(id, { active }),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(
        ["products", pagination.current, pagination.pageSize, searchText],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            products: oldData.products.map((p: Product) =>
              p.id === variables.id ? { ...p, active: variables.active } : p
            ),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
      message.success("Estado actualizado correctamente");
    },
    onError: (error: any, variables) => {
      message.error(
        error?.response?.data?.message ||
          error.message ||
          "Error al actualizar estado"
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleTableChange = (newPagination: any) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleSearch = debounce((value: string) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, 500);

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      ellipsis: isTabletOrMobile,

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
      render: (price: number, record: Product) => {
        // Calcular precio con descuento si hay descuento activo
        const hasDiscount = record.discount?.isActive === true && record.discount?.percentage > 0;
        let finalPrice = price;
        
        if (hasDiscount && record.discount?.percentage) {
          // Calcularlo manualmente 
          finalPrice = Math.round(price * (1 - record.discount.percentage / 100));
        }
        
        return (
          <div className="flex flex-row gap-1">
            {hasDiscount ? (
              <>
               <Text delete className="text-gray-400 text-xs">
                  {price.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </Text>
                <Text className="text-red-500 font-medium">
                  {finalPrice.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </Text>

                <Badge
                  count={`-${record.discount.percentage}%`}
                  style={{ backgroundColor: "#ff4d4f", fontSize: "10px" }}
                  className="mt-1"
                />
              </>
            ) : (
              <Text>
                {price.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      ellipsis: true,
      // render no necesita cambios si solo depende de 'stock'
      render: (stock: number) => {
        const color = stock > 10 ? "green" : stock > 0 ? "orange" : "red";
        return (
          <Tag color={color} className="px-2 py-1 font-medium">
            {stock.toLocaleString("es-CO")}
          </Tag>
        );
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
          className="px-2 py-1 transition-all hover:shadow-sm"
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
      width: 150,
      fixed: !isTabletOrMobile ? "right" as const : undefined,

      render: (_: any, record: Product) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button
              icon={<EyeOutlined />}
              size="middle"
              className="text-blue-500 hover:text-blue-600 hover:border-blue-500 transition-colors"
              onClick={() => {
                setSelectedProduct(record);
                setIsViewModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              size="middle"
              className="text-green-500 hover:text-green-600 hover:border-green-500 transition-colors"
              onClick={() => {
                setSelectedProduct(record);
                setIsEditModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Gestionar descuento">
            <Button
              icon={<PercentageOutlined />}
              size="middle"
              className="text-purple-500 hover:text-purple-600 hover:border-purple-500 transition-colors"
              onClick={() => {
                setSelectedProduct(record);
                setIsDiscountModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Eliminar producto?"
              description="Esta acción no se puede deshacer"
              onConfirm={() => deleteProduct.mutate(record.id)}
              okText="Sí"
              cancelText="No"
              placement="left"
              okButtonProps={{ danger: true }}
            >
              <Button
                icon={<DeleteOutlined />}
                size="middle"
                danger
                className="hover:bg-red-50 transition-colors"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    if (data?.pagination) {
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    }
  }, [data?.pagination]);

  if (isError) {
    return (
      <div className="error-container p-8 text-center">
        <Card className="bg-red-50 border-red-200">
          <Text type="danger" className="text-lg">
            Error al cargar los productos
          </Text>
          <div className="mt-4">
            <Button
              type="primary"
              danger
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
            >
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <HeaderTable />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-4"
      >
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          {" "}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <Input
              placeholder="Buscar por nombre o SKU"
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ maxWidth: 300 }}
              size="large"
              allowClear
              className="rounded-lg"
            />
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                size="large"
                onClick={() => refetch()}
                loading={isLoading}
                className="hover:bg-blue-50 transition-colors"
              >
                Actualizar
              </Button>
            </Space>
          </div>
          <Table
            size="middle"
            loading={isLoading}
            scroll={{ x: isTabletOrMobile ? 850 : "max-content" }}
            dataSource={
              data?.products?.map((product) => ({
                ...product,
                key: product.id,
              })) || []
            }
            columns={columns}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} de ${total} productos`,
              className: "pagination-custom mt-4",
              showQuickJumper: true,
            }}
            onChange={handleTableChange}
            className="products-table"
            rowClassName="hover:bg-gray-50 transition-colors cursor-pointer"
          />
        </Card>
      </motion.div>

      <AnimatePresence>
        {selectedProduct && isViewModalOpen && (
          <ProductView
            open={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedProduct(null);
            }}
            productId={selectedProduct.id}
          />
        )}

        {selectedProduct && isEditModalOpen && (
          <ProductEdit
            open={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedProduct(null);
            }}
            productId={selectedProduct.id}
          />
        )}

        {selectedProduct && isDiscountModalOpen && (
          <DiscountModal
            open={isDiscountModalOpen}
            onClose={() => {
              setIsDiscountModalOpen(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
