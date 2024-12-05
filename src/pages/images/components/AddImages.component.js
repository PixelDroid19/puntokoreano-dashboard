import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// pages/images/AddImages.tsx
import React from "react";
import { InboxOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Upload, notification, Input, Form, Space, Progress, } from "antd";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import FilesService from "../../../services/files.service";
const { Dragger } = Upload;
const AddImages = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [fileList, setFileList] = React.useState([]);
    const [form] = Form.useForm();
    const [uploadProgress, setUploadProgress] = React.useState({});
    const [totalProgress, setTotalProgress] = React.useState(0);
    // Mutación para subir imágenes
    const uploadMutation = useMutation({
        mutationFn: async ({ identifier, files, }) => {
            let progress = 0;
            const totalFiles = files.length;
            for (const file of files) {
                // Inicializar progreso para cada archivo
                setUploadProgress((prev) => ({
                    ...prev,
                    [file.name]: 0,
                }));
                // Subir archivo individual
                await FilesService.uploadImages(identifier, [file], (progressEvent) => {
                    const fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress((prev) => ({
                        ...prev,
                        [file.name]: fileProgress,
                    }));
                });
                progress += 1;
                setTotalProgress(Math.round((progress / totalFiles) * 100));
            }
        },
        onSuccess: () => {
            notification.success({
                message: "Éxito",
                description: "Imágenes subidas correctamente",
            });
            queryClient.invalidateQueries({ queryKey: ["imageGroups"] });
            setTimeout(() => navigate("/images"), 1500);
        },
        onError: (error) => {
            notification.error({
                message: "Error",
                description: error.message || "Error al subir las imágenes",
            });
        },
        onSettled: () => {
            // Limpiar estados de progreso
            setUploadProgress({});
            setTotalProgress(0);
        },
    });
    // Props para el componente Upload
    const uploadProps = {
        name: "file",
        multiple: true,
        fileList,
        listType: "picture-card",
        accept: "image/*",
        beforeUpload: (file) => {
            // Validar tamaño (2MB)
            if (file.size > 2 * 1024 * 1024) {
                notification.error({
                    message: "Error",
                    description: `${file.name} excede el tamaño máximo de 2MB`,
                });
                return false;
            }
            // Validar tipo
            if (!file.type.startsWith("image/")) {
                notification.error({
                    message: "Error",
                    description: `${file.name} no es una imagen válida`,
                });
                return false;
            }
            return false; // Prevenir upload automático
        },
        onRemove: (file) => {
            setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
            return true;
        },
        onChange: ({ fileList: newFileList }) => {
            setFileList(newFileList);
        },
    };
    const handleSubmit = async (values) => {
        if (fileList.length === 0) {
            notification.warning({
                message: "Sin archivos",
                description: "Por favor seleccione al menos una imagen",
            });
            return;
        }
        const files = fileList
            .filter((file) => file.originFileObj)
            .map((file) => file.originFileObj);
        try {
            await uploadMutation.mutateAsync({
                identifier: values.identifier,
                files,
            });
        }
        catch (error) {
            // El error ya se maneja en el onError de la mutación
            console.error("Error en upload:", error);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Space, { className: "mb-6", children: [_jsx(Button, { icon: _jsx(ArrowLeftOutlined, {}), onClick: () => navigate(-1), children: "Volver" }), _jsx("h1", { className: "text-2xl font-bold", children: "Cargar im\u00E1genes" })] }), _jsxs(Form, { form: form, layout: "vertical", onFinish: handleSubmit, children: [_jsx(Form.Item, { name: "identifier", label: "Identificador del grupo", rules: [
                            { required: true, message: "Por favor ingrese un identificador" },
                            {
                                pattern: /^[a-zA-Z0-9_-]+$/,
                                message: "Solo letras, números, guiones y guiones bajos",
                            },
                        ], help: "Este identificador se usar\u00E1 para referenciar las im\u00E1genes desde otros lugares", children: _jsx(Input, { placeholder: "Ej: product_123" }) }), _jsxs(Dragger, { ...uploadProps, className: "mb-6 p-8", children: [_jsx(InboxOutlined, { className: "text-5xl text-blue-500" }), _jsx("p", { className: "font-bold mt-4", children: "Haga clic o arrastre las im\u00E1genes a esta \u00E1rea para cargarlas" }), _jsx("p", { className: "text-gray-400 mt-2", children: "Admite carga \u00FAnica o masiva. M\u00E1ximo 2MB por imagen." })] }), Object.entries(uploadProgress).map(([fileName, progress]) => (_jsxs("div", { className: "mb-2", children: [_jsxs("div", { className: "flex justify-between mb-1", children: [_jsx("span", { className: "text-sm", children: fileName }), _jsxs("span", { className: "text-sm", children: [progress, "%"] })] }), _jsx(Progress, { percent: progress, size: "small" })] }, fileName))), totalProgress > 0 && (_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex justify-between mb-1", children: [_jsx("span", { className: "font-medium", children: "Progreso total" }), _jsxs("span", { children: [totalProgress, "%"] })] }), _jsx(Progress, { percent: totalProgress })] })), _jsx(Button, { type: "primary", htmlType: "submit", disabled: uploadMutation.isPending || fileList.length === 0, loading: uploadMutation.isPending, block: true, children: uploadMutation.isPending
                            ? `Subiendo (${totalProgress}%)`
                            : "Subir imágenes" })] })] }));
};
export default AddImages;
