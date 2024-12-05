import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// components/EditGroupModal.tsx
import React from "react";
import { Modal, Form, Input, Button, notification, Progress } from "antd";
import { PlusOutlined, TagOutlined, FileImageOutlined, EditOutlined, InboxOutlined, DeleteOutlined, } from "@ant-design/icons";
import "./EditGroupModal.css";
import Dragger from "antd/es/upload/Dragger";
const EditGroupModal = ({ group, visible, onClose, onUpdate, onAddImages, }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState({});
    React.useEffect(() => {
        if (group) {
            const tagsString = Array.isArray(group.tags) ? group.tags.join(", ") : "";
            form.setFieldsValue({
                description: group.description,
                tags: tagsString,
            });
        }
        // Limpiar estado al abrir/cerrar modal
        return () => {
            setFileList([]);
            setUploadProgress({});
        };
    }, [group, form, visible]);
    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            // Formatear tags
            const formattedTags = values.tags
                ? values.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                : [];
            // Actualizar grupo
            await onUpdate({
                description: values.description,
                tags: formattedTags,
            });
            // Subir imágenes si hay nuevas
            if (fileList.length > 0) {
                const files = fileList
                    .filter((file) => file.originFileObj)
                    .map((file) => file.originFileObj);
                // Inicializar progreso para cada archivo
                files.forEach((file) => {
                    setUploadProgress((prev) => ({
                        ...prev,
                        [file.name]: 0,
                    }));
                });
                await onAddImages(files);
            }
            notification.success({
                message: "Grupo actualizado",
                description: "Los cambios se guardaron correctamente",
            });
            setFileList([]);
            setUploadProgress({});
            form.resetFields();
            onClose();
        }
        catch (error) {
            notification.error({
                message: "Error",
                description: error.message || "Error al actualizar el grupo",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const uploadProps = {
        name: "file",
        multiple: true,
        fileList,
        listType: "picture-card",
        accept: "image/*",
        beforeUpload: (file) => {
            if (file.size > 2 * 1024 * 1024) {
                notification.error({
                    message: "Error",
                    description: `${file.name} excede el tamaño máximo de 2MB`,
                });
                return false;
            }
            if (!file.type.startsWith("image/")) {
                notification.error({
                    message: "Error",
                    description: `${file.name} no es un archivo de imagen válido`,
                });
                return false;
            }
            return false; // Prevenir upload automático
        },
        onChange: ({ fileList: newFileList }) => {
            setFileList(newFileList);
        },
        onRemove: (file) => {
            setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
            setUploadProgress((prev) => {
                const newProgress = { ...prev };
                delete newProgress[file.name];
                return newProgress;
            });
            return true;
        },
    };
    return (_jsxs(Modal, { title: _jsxs("div", { className: "flex items-center gap-2 text-lg", children: [_jsx(EditOutlined, { className: "text-blue-500" }), _jsx("span", { children: "Editar Grupo de Im\u00E1genes" })] }), open: visible, onCancel: () => {
            setFileList([]);
            setUploadProgress({});
            form.resetFields();
            onClose();
        }, onOk: handleSubmit, confirmLoading: loading, okText: "Guardar cambios", cancelText: "Cancelar", width: 700, className: "edit-group-modal", children: [_jsxs("div", { className: "bg-gray-50 p-4 mb-4 rounded-lg", children: [_jsx("div", { className: "font-medium text-gray-700", children: "ID del grupo:" }), _jsx("code", { className: "block bg-white p-3 rounded border text-sm mt-1", children: group?.identifier })] }), _jsxs(Form, { form: form, layout: "vertical", className: "space-y-4", children: [_jsx(Form.Item, { name: "description", label: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(FileImageOutlined, {}), "Descripci\u00F3n del grupo"] }), rules: [
                            {
                                max: 500,
                                message: "La descripción no puede exceder los 500 caracteres",
                            },
                        ], children: _jsx(Input.TextArea, { rows: 3, placeholder: "Describe el prop\u00F3sito o contenido de este grupo de im\u00E1genes...", className: "resize-none" }) }), _jsx(Form.Item, { name: "tags", label: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(TagOutlined, {}), "Etiquetas"] }), help: "Separa las etiquetas con comas (ej: producto, banner, promoci\u00F3n)", children: _jsx(Input, { placeholder: "producto, banner, promoci\u00F3n...", className: "rounded-md" }) }), _jsxs(Form.Item, { label: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(PlusOutlined, {}), "A\u00F1adir im\u00E1genes"] }), children: [_jsxs(Dragger, { ...uploadProps, className: "upload-area", children: [_jsx("p", { className: "ant-upload-drag-icon", children: _jsx(InboxOutlined, { className: "text-4xl text-blue-500" }) }), _jsx("p", { className: "ant-upload-text font-medium", children: "Haz clic o arrastra im\u00E1genes aqu\u00ED" }), _jsx("p", { className: "ant-upload-hint text-gray-500", children: "Soporta m\u00FAltiples archivos. M\u00E1ximo 2MB por imagen" })] }), fileList.length > 0 && (_jsx("div", { className: "space-y-4 mt-4", children: fileList.map((file) => (_jsxs("div", { className: "flex items-center gap-4 bg-gray-50 p-3 rounded", children: [_jsx("img", { src: file.thumbUrl ||
                                                (file.originFileObj &&
                                                    URL.createObjectURL(file.originFileObj)), alt: file.name, className: "w-16 h-16 object-cover rounded" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex justify-between items-center mb-1", children: [_jsx("span", { className: "text-sm font-medium truncate", children: file.name }), _jsx(Button, { type: "text", danger: true, icon: _jsx(DeleteOutlined, {}), onClick: () => uploadProps.onRemove(file), size: "small" })] }), uploadProgress[file.name] !== undefined && (_jsx(Progress, { percent: uploadProgress[file.name], size: "small", status: uploadProgress[file.name] === 100
                                                        ? "success"
                                                        : "active" }))] })] }, file.uid))) }))] })] })] }));
};
export default EditGroupModal;
