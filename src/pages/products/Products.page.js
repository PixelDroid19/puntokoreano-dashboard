import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Products.page.tsx
import { Table, Tag, Tooltip, Input, Button, Popconfirm, message, Space, } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SearchOutlined, DeleteOutlined, EditOutlined, EyeOutlined, } from "@ant-design/icons";
import HeaderTable from "./components/HeaderTable.component";
import { ProductEdit } from "./components/ProductEdit";
import { useMediaQuery } from "react-responsive";
import React from "react";
import ProductsService from "../../services/products.service";
import debounce from "lodash/debounce";
import { ProductView } from "./components/ProductView";
const Products = () => {
    const queryClient = useQueryClient();
    const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1023px)" });
    const [searchText, setSearchText] = React.useState("");
    const [selectedProduct, setSelectedProduct] = React.useState(null);
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
        queryFn: () => ProductsService.getProducts({
            page: pagination.current,
            limit: pagination.pageSize,
            search: searchText || undefined,
        }),
        keepPreviousData: true,
    });
    // Mutación para eliminar producto
    const deleteProduct = useMutation({
        mutationFn: (id) => ProductsService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            message.success("Producto eliminado correctamente");
        },
        onError: (error) => {
            message.error(error.message);
        },
    });
    // Mutación para toggle status
    const toggleStatus = useMutation({
        mutationFn: ({ id, active }) => ProductsService.toggleProductStatus(id, active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            message.success("Estado actualizado correctamente");
        },
        onError: (error) => {
            message.error(error.message);
        },
    });
    // Manejador de cambio de página
    const handleTableChange = (pagination) => {
        setPagination((prev) => ({
            ...prev,
            current: pagination.current,
            pageSize: pagination.pageSize,
        }));
    };
    // Búsqueda debounced
    const handleSearch = debounce((value) => {
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
            render: (name) => isTabletOrMobile ? (_jsx(Tooltip, { placement: "topLeft", title: name, children: name })) : (name),
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
            render: (price) => price?.toLocaleString("es-CO", {
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
            render: (stock) => {
                const color = stock > 10 ? "green" : stock > 0 ? "orange" : "red";
                return _jsx(Tag, { color: color, children: stock.toLocaleString("es-CO") });
            },
        },
        {
            title: "Estado",
            dataIndex: "active",
            key: "active",
            render: (active, record) => (_jsx(Tag, { color: active ? "green" : "volcano", style: { cursor: "pointer" }, onClick: () => toggleStatus.mutate({ id: record.id, active: !active }), children: active ? "Activo" : "Inactivo" })),
            ellipsis: true,
        },
        {
            title: "Acciones",
            key: "action",
            width: 120,
            render: (_, record) => (_jsxs(Space, { children: [_jsx(Button, { icon: _jsx(EyeOutlined, {}), size: "small", onClick: () => {
                            setSelectedProduct(record);
                            setIsViewModalOpen(true);
                        } }), _jsx(Button, { icon: _jsx(EditOutlined, {}), size: "small", onClick: () => {
                            setSelectedProduct(record);
                            setIsEditModalOpen(true);
                        } }), _jsx(Popconfirm, { title: "\u00BFEliminar producto?", description: "Esta acci\u00F3n no se puede deshacer", onConfirm: () => deleteProduct.mutate(record.id), okText: "S\u00ED", cancelText: "No", children: _jsx(Button, { icon: _jsx(DeleteOutlined, {}), size: "small", danger: true }) })] })),
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
        return _jsx("div", { className: "error-container", children: "Error al cargar los productos" });
    }
    return (_jsxs("div", { className: "products-container", children: [_jsxs("div", { className: "table-header", children: [_jsx(HeaderTable, {}), _jsx(Input, { placeholder: "Buscar por nombre o SKU", prefix: _jsx(SearchOutlined, {}), onChange: (e) => handleSearch(e.target.value), style: { width: 300, marginBottom: 16 } })] }), _jsx(Table, { size: "middle", loading: isLoading, scroll: { x: isTabletOrMobile ? 850 : true }, dataSource: data?.products.map((product) => ({
                    ...product,
                    key: product.id,
                })), columns: columns, pagination: {
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} productos`,
                }, onChange: handleTableChange }), selectedProduct && (_jsx(ProductView, { open: isViewModalOpen, onClose: () => {
                    setIsViewModalOpen(false);
                    setSelectedProduct(null);
                }, product: selectedProduct })), selectedProduct && (_jsx(ProductEdit, { open: isEditModalOpen, onClose: () => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(null);
                }, product: selectedProduct }))] }));
};
export default Products;
