import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// pages/Images.tsx
import React from "react";
import { Table, Space, Button, notification, Tooltip, Tag, Popconfirm, } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, TagsOutlined, FolderOpenOutlined, } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FilesService from "../../services/files.service";
import HeaderTable from "./components/HeaderTable.component";
import EditGroupModal from "./components/EditGroupModal";
import ViewGroupModal from "./components/ViewGroupModal";
const Images = () => {
    const queryClient = useQueryClient();
    const [editingGroup, setEditingGroup] = React.useState(null);
    const [viewingGroup, setViewingGroup] = React.useState(null);
    // Queries
    const { data: groups, isLoading } = useQuery({
        queryKey: ["imageGroups"],
        queryFn: async () => {
            const response = await FilesService.getGroups();
            return response.data.groups;
        },
    });
    // Mutations
    const updateGroup = useMutation({
        mutationFn: async ({ identifier, data, }) => {
            await FilesService.updateGroupDetails(identifier, {
                description: data.description,
                tags: Array.isArray(data.tags) ? data.tags : [], // Asegurar que tags sea array
            });
        },
        onError: (error) => {
            notification.error({
                message: "Error al actualizar grupo",
                description: error.message || "Ocurrió un error inesperado",
            });
        },
    });
    const addImages = useMutation({
        mutationFn: async ({ identifier, files, }) => {
            if (!files.length) {
                throw new Error("No se seleccionaron imágenes");
            }
            // Validar tamaño y tipo de archivos antes de enviar
            const validFiles = files.filter((file) => {
                const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB
                const isValidType = file.type.startsWith("image/");
                return isValidSize && isValidType;
            });
            if (validFiles.length !== files.length) {
                notification.warning({
                    message: "Algunas imágenes fueron ignoradas",
                    description: "Solo se procesaron las imágenes válidas (máx. 2MB, solo imágenes)",
                });
            }
            if (!validFiles.length) {
                throw new Error("No hay imágenes válidas para procesar");
            }
            await FilesService.addImagesToGroup(identifier, validFiles);
        },
        onError: (error) => {
            notification.error({
                message: "Error al añadir imágenes",
                description: error.message || "Ocurrió un error inesperado",
            });
        },
    });
    const deleteImage = useMutation({
        mutationFn: async ({ identifier, imageId, }) => {
            await FilesService.deleteImage(identifier, imageId);
        },
        onSuccess: () => {
            notification.success({ message: "Imagen eliminada correctamente" });
            queryClient.invalidateQueries({ queryKey: ["imageGroups"] });
        },
    });
    const deleteGroup = useMutation({
        mutationFn: async (identifier) => {
            await FilesService.deleteGroup(identifier);
        },
        onSuccess: () => {
            notification.success({ message: "Grupo eliminado correctamente" });
            queryClient.invalidateQueries({ queryKey: ["imageGroups"] });
        },
    });
    // Handlers
    const handleUpdateGroup = async (values) => {
        if (!editingGroup)
            return;
        try {
            await updateGroup.mutateAsync({
                identifier: editingGroup.identifier,
                data: values,
            });
        }
        catch (error) {
            // El error ya se maneja en onError de la mutation
            console.error("Error in handleUpdateGroup:", error);
        }
    };
    const handleAddImages = async (files) => {
        if (!editingGroup)
            return;
        try {
            await addImages.mutateAsync({
                identifier: editingGroup.identifier,
                files
            });
        }
        catch (error) {
            // El error ya se maneja en onError de la mutation
            console.error('Error in handleAddImages:', error);
        }
    };
    const handleDeleteImage = async (imageId) => {
        if (viewingGroup) {
            await deleteImage.mutateAsync({
                identifier: viewingGroup.identifier,
                imageId,
            });
        }
    };
    const handleDeleteGroup = async (identifier) => {
        await deleteGroup.mutateAsync(identifier);
    };
    const handleCopyUrl = async (url) => {
        try {
            await navigator.clipboard.writeText(url);
            notification.success({
                message: "URL copiada al portapapeles",
            });
        }
        catch (error) {
            notification.error({
                message: "Error al copiar URL",
            });
        }
    };
    // Columns definition
    const columns = [
        {
            title: "Identificador",
            dataIndex: "identifier",
            key: "identifier",
        },
        {
            title: "Descripción",
            dataIndex: "description",
            key: "description",
            render: (text) => text || "Sin descripción",
        },
        {
            title: "Etiquetas",
            key: "tags",
            render: (_, record) => (_jsx(Space, { children: record.tags?.map((tag) => (_jsx(Tag, { icon: _jsx(TagsOutlined, {}), children: tag }, tag))) })),
        },
        {
            title: "Imágenes",
            key: "imageCount",
            render: (_, record) => (_jsx(Tag, { icon: _jsx(FolderOpenOutlined, {}), color: "blue", children: record.images.length })),
        },
        {
            title: "Acciones",
            key: "actions",
            render: (_, record) => (_jsxs(Space, { children: [_jsx(Tooltip, { title: "Ver grupo", children: _jsx(Button, { icon: _jsx(EyeOutlined, {}), onClick: () => setViewingGroup(record) }) }), _jsx(Tooltip, { title: "Editar grupo", children: _jsx(Button, { icon: _jsx(EditOutlined, {}), onClick: () => setEditingGroup(record) }) }), _jsx(Popconfirm, { title: "\u00BFEliminar grupo?", description: "Esta acci\u00F3n eliminar\u00E1 todas las im\u00E1genes asociadas", onConfirm: () => handleDeleteGroup(record.identifier), children: _jsx(Tooltip, { title: "Eliminar grupo", children: _jsx(Button, { danger: true, type: "primary", icon: _jsx(DeleteOutlined, {}) }) }) })] })),
        },
    ];
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(HeaderTable, {}), _jsx(Table, { columns: columns, dataSource: groups, rowKey: "identifier", loading: isLoading, pagination: {
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} grupos`,
                } }), _jsx(EditGroupModal, { group: editingGroup, visible: !!editingGroup, onClose: () => setEditingGroup(null), onUpdate: handleUpdateGroup, onAddImages: handleAddImages }), _jsx(ViewGroupModal, { group: viewingGroup, visible: !!viewingGroup, onClose: () => setViewingGroup(null), onDeleteImage: handleDeleteImage, onCopyUrl: handleCopyUrl })] }));
};
export default Images;
