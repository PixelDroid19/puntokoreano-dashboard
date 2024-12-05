import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/filters/Filters.page.tsx
import { Table, Button, Popconfirm, message, Tag, Space, Collapse, Descriptions, Modal, } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import HeaderTable from "./components/HeaderTable.component";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import FiltersService from "../../services/filters.service";
import FilterEditModal from "./components/FilterEditModal.componen";
const { Panel } = Collapse;
const Filters = () => {
    const queryClient = useQueryClient();
    const [selectedFilter, setSelectedFilter] = React.useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
    // Query para obtener filtros
    const { data, isLoading } = useQuery({
        queryKey: ["filters"],
        queryFn: () => FiltersService.getFilters(),
    });
    // Mutación para eliminar filtro
    const deleteFilter = useMutation({
        mutationFn: (id) => FiltersService.deleteFilter(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["filters"] });
            message.success("Filtro eliminado correctamente");
        },
        onError: (error) => {
            message.error(error.message);
        },
    });
    // Mutación para actualizar filtro
    const updateFilter = useMutation({
        mutationFn: (values) => FiltersService.updateFilter(values.id, values.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["filters"] });
            message.success("Filtro actualizado correctamente");
            setIsEditModalOpen(false);
            setSelectedFilter(null);
        },
        onError: (error) => {
            message.error(error.message);
        },
    });
    const renderFilterDetails = (record) => (_jsxs(Descriptions, { column: 2, bordered: true, children: [_jsx(Descriptions.Item, { label: "Familia", span: 2, children: record.family_name }), _jsx(Descriptions.Item, { label: "Familias", span: 2, children: _jsx(Collapse, { children: Object.entries(record.families).map(([year, models]) => (_jsx(Panel, { header: `Año ${year}`, children: models.map(model => (_jsx(Tag, { children: model.label }, model.value))) }, year))) }) }), _jsx(Descriptions.Item, { label: "Transmisiones", span: 2, children: _jsx(Collapse, { children: Object.entries(record.transmissions).map(([year, transmissions]) => (_jsx(Panel, { header: `Año ${year}`, children: Object.entries(transmissions).map(([model, trans]) => (_jsxs("div", { children: [_jsx(Tag, { color: "blue", children: model }), _jsx("div", { style: { marginLeft: 20 }, children: trans.map(t => (_jsx(Tag, { children: t.label }, t.value))) })] }, model))) }, year))) }) })] }));
    const columns = [
        {
            title: "Familia",
            dataIndex: "family_name",
            key: "family_name",
        },
        {
            title: "Modelos",
            key: "families",
            render: (_, record) => (_jsx(Collapse, { ghost: true, children: _jsx(Panel, { header: "Ver modelos", children: Object.entries(record.families).map(([year, models]) => (_jsxs("div", { children: [_jsx(Tag, { color: "blue", children: year }), _jsx("div", { style: { marginLeft: 20 }, children: models.map(model => (_jsx(Tag, { children: model.label }, model.value))) })] }, year))) }, "1") })),
        },
        {
            title: "Acciones",
            key: "actions",
            render: (_, record) => (_jsxs(Space, { children: [_jsx(Button, { icon: _jsx(EyeOutlined, {}), onClick: () => {
                            setSelectedFilter(record);
                            setIsViewModalOpen(true);
                        } }), _jsx(Button, { icon: _jsx(EditOutlined, {}), onClick: () => {
                            setSelectedFilter(record);
                            setIsEditModalOpen(true);
                        } }), _jsx(Popconfirm, { title: "\u00BFEliminar filtro?", description: "Esta acci\u00F3n no se puede deshacer", onConfirm: () => deleteFilter.mutate(record.id), okText: "S\u00ED", cancelText: "No", children: _jsx(Button, { icon: _jsx(DeleteOutlined, {}), danger: true }) })] })),
        },
    ];
    return (_jsxs("div", { children: [_jsx(Table, { title: () => _jsx(HeaderTable, {}), loading: isLoading, columns: columns, dataSource: data?.filters, rowKey: "id" }), _jsx(Modal, { title: "Detalles del Filtro", open: isViewModalOpen, onCancel: () => {
                    setIsViewModalOpen(false);
                    setSelectedFilter(null);
                }, footer: null, width: 1000, children: selectedFilter && renderFilterDetails(selectedFilter) }), _jsx(FilterEditModal, { filter: selectedFilter, open: isEditModalOpen, onClose: () => {
                    setIsEditModalOpen(false);
                    setSelectedFilter(null);
                }, onSave: (updatedFilter) => {
                    if (selectedFilter) {
                        updateFilter.mutate({
                            id: selectedFilter.id,
                            data: updatedFilter,
                        });
                    }
                } })] }));
};
export default Filters;
