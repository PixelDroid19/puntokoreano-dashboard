import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// components/ViewGroupModal.tsx
import React from "react";
import { Modal, Image, Space, Button, Popconfirm, Tooltip, Tag, notification, } from "antd";
import { DeleteOutlined, CopyOutlined, TagsOutlined, EyeOutlined, } from "@ant-design/icons";
const ViewGroupModal = ({ group, visible, onClose, onDeleteImage, onCopyUrl, }) => {
    // Estado para manejar la carga al eliminar
    const [deletingImageId, setDeletingImageId] = React.useState(null);
    // Estado para previsualización de imagen
    const [previewImage, setPreviewImage] = React.useState(null);
    // Manejar eliminación de imagen con estado de carga
    const handleDeleteImage = async (imageId) => {
        try {
            setDeletingImageId(imageId);
            await onDeleteImage(imageId);
            notification.success({
                message: "Imagen eliminada correctamente",
            });
        }
        catch (error) {
            notification.error({
                message: "Error al eliminar la imagen",
                description: error.message,
            });
        }
        finally {
            setDeletingImageId(null);
        }
    };
    // Manejar copia de URL con feedback
    const handleCopyUrl = async (url) => {
        try {
            await onCopyUrl(url);
            notification.success({
                message: "URL copiada al portapapeles",
                placement: "topRight",
            });
        }
        catch (error) {
            notification.error({
                message: "Error al copiar la URL",
                placement: "topRight",
            });
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx(Modal, { title: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TagsOutlined, { className: "text-blue-500" }), _jsxs("span", { children: ["Grupo: ", group?.identifier] })] }), open: visible, onCancel: onClose, footer: null, width: 800, className: "image-group-modal", children: group && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("h3", { className: "font-bold mb-2 flex items-center gap-2", children: [_jsx(TagsOutlined, {}), "Identificador del grupo"] }), _jsx("code", { className: "block bg-white p-3 rounded border text-sm", children: group.identifier }), _jsx("small", { className: "text-gray-500 mt-2 block", children: "Usa este identificador para asociar estas im\u00E1genes en otros lugares" })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg border", children: [_jsx("h3", { className: "font-bold mb-3", children: "Informaci\u00F3n" }), _jsx("p", { className: "text-gray-600 mb-3", children: group.description || "Sin descripción" }), _jsx("div", { className: "flex flex-wrap gap-2", children: group.tags?.map((tag) => (_jsx(Tag, { icon: _jsx(TagsOutlined, {}), className: "flex items-center gap-1", children: tag }, tag))) })] }), _jsxs("div", { children: [_jsxs("h3", { className: "font-bold mb-3 flex items-center gap-2", children: [_jsx(EyeOutlined, {}), "Im\u00E1genes (", group.images.length, ")"] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: group.images.map((image) => (_jsxs("div", { className: "relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow", children: [_jsx(Image, { src: image.url, alt: image.name, className: "w-full h-48 object-cover cursor-pointer", onClick: () => setPreviewImage(image.url), preview: false }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2 opacity-0 group-hover:opacity-100 transition-all duration-200", children: _jsxs(Space, { className: "w-full justify-center", children: [_jsx(Tooltip, { title: "Previsualizar", children: _jsx(Button, { icon: _jsx(EyeOutlined, {}), size: "small", onClick: () => setPreviewImage(image.url) }) }), _jsx(Tooltip, { title: "Copiar URL", children: _jsx(Button, { icon: _jsx(CopyOutlined, {}), size: "small", onClick: () => handleCopyUrl(image.url) }) }), _jsx(Popconfirm, { title: "\u00BFEliminar esta imagen?", description: "Esta acci\u00F3n no se puede deshacer", onConfirm: () => handleDeleteImage(image._id), okText: "S\u00ED, eliminar", cancelText: "No", children: _jsx(Tooltip, { title: "Eliminar", children: _jsx(Button, { icon: _jsx(DeleteOutlined, {}), size: "small", danger: true, loading: deletingImageId === image._id }) }) })] }) })] }, image._id))) })] })] })) }), _jsx("div", { style: { display: "none" }, children: _jsx(Image.PreviewGroup, { preview: {
                        visible: !!previewImage,
                        onVisibleChange: (visible) => {
                            if (!visible)
                                setPreviewImage(null);
                        },
                        current: group?.images.findIndex((img) => img.url === previewImage) || 0,
                    }, children: group?.images.map((image) => (_jsx(Image, { src: image.url }, image._id))) }) })] }));
};
export default ViewGroupModal;
