import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button, Col, Flex, Form, Image, Input, InputNumber, Row, Select, Switch, Upload, Tabs, Card, Space, Typography, Tooltip, } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faInfoCircle, } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { getGroups } from "../../../helpers/queries.helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { NOTIFICATIONS } from "../../../enums/contants.notifications";
import { DashboardService } from "../../../services/dashboard.service";
import FilesService from "../../../services/files.service";
const { Text } = Typography;
const { TabPane } = Tabs;
const getBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
});
// Configuración del editor Quill
const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["clean"],
        ["link"],
        [{ align: [] }],
        ["image", "video"],
    ],
};
const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "color",
    "background",
    "align",
    "image",
    "video",
];
const AddProduct = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const [previewImage, setPreviewImage] = React.useState("");
    const [fileList, setFileList] = React.useState([]);
    const [videoUrl, setVideoUrl] = React.useState("");
    const [useGroupImages, setUseGroupImages] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState("1");
    const [subgroups, setSubgroups] = React.useState([]);
    // Queries con useQuery
    const { data: groups } = useQuery({
        queryKey: ["groups"],
        queryFn: getGroups,
    });
    const { data: imageGroups } = useQuery({
        queryKey: ["imageGroups"],
        queryFn: () => FilesService.getGroups(),
    });
    const saveProduct = useMutation({
        mutationFn: (values) => {
            return DashboardService.createProduct({
                ...values,
                active: true,
            });
        },
        onSuccess: () => {
            toast.success(NOTIFICATIONS.PRODUCT_CREATED);
            navigate("/products");
        },
        onError: (error) => {
            if (error.message.includes("ya existe")) {
                toast.error(NOTIFICATIONS.PRODUCT_EXIST);
            }
            else {
                toast.error(error.message);
            }
        },
    });
    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        try {
            const response = await axios.post("https://api.imgbb.com/1/upload?key=YOUR_IMGBB_KEY", formData);
            const newFile = {
                ...file,
                name: file.name,
                status: "done",
                url: response.data.data.url,
            };
            setFileList((prevFileList) => {
                const updatedFileList = [...prevFileList, newFile];
                form.setFieldsValue({
                    images: updatedFileList.map((file) => file.url),
                });
                return updatedFileList;
            });
        }
        catch (error) {
            toast.error("Error al cargar la imagen");
            console.error(error);
        }
        return false;
    };
    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
    };
    const onFinish = (values) => {
        const productData = {
            ...values,
            active: true,
            useGroupImages,
            imageGroup: useGroupImages ? values.imageGroup : null,
            images: useGroupImages ? [] : fileList.map((file) => file.url) || [],
            videoUrl,
            seo: {
                title: values.seoTitle || values.name,
                description: values.seoDescription || values.short_description,
                keywords: values.seoKeywords?.split(",").map((k) => k.trim()) || [],
            },
        };
        saveProduct.mutate(productData);
    };
    const validateForm = () => {
        if (useGroupImages && !form.getFieldValue("imageGroup")) {
            return false;
        }
        if (!useGroupImages &&
            (!fileList.length || !form.getFieldValue("images"))) {
            return false;
        }
        return true;
    };
    const handleGroupChange = (value) => {
        const selectedGroup = groups?.data?.find((g) => g.name === value);
        if (selectedGroup) {
            setSubgroups(selectedGroup.subgroups);
            // Limpiar el subgrupo seleccionado cuando cambia el grupo
            form.setFieldValue("subgroup", undefined);
        }
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs(Flex, { align: "center", gap: 5, className: "mb-4", children: [_jsx(Button, { size: "small", type: "text", onClick: () => navigate(-1), children: _jsx(FontAwesomeIcon, { icon: faArrowLeft }) }), _jsx("h1", { className: "text-xl font-bold", children: "A\u00F1adir un producto" })] }), _jsxs(Form, { form: form, layout: "vertical", onFinish: onFinish, className: "space-y-6", children: [_jsxs(Tabs, { activeKey: activeTab, onChange: setActiveTab, children: [_jsx(TabPane, { tab: "Informaci\u00F3n B\u00E1sica", children: _jsxs(Row, { gutter: 24, children: [_jsx(Col, { span: 12, children: _jsxs(Card, { title: "Detalles Principales", className: "mb-4", children: [_jsx(Form.Item, { name: "name", label: "Nombre del Producto", rules: [{ required: true }], children: _jsx(Input, { placeholder: "Ej: Reten delantero ciguenal" }) }), _jsx(Form.Item, { name: "price", label: "Precio", rules: [{ required: true, type: "number" }], children: _jsx(InputNumber, { className: "w-full", min: 0, formatter: (value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","), parser: (value) => value.replace(/\$\s?|(,*)/g, "") }) }), _jsx(Form.Item, { name: "code", label: "SKU/C\u00F3digo", rules: [{ required: true }], children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "stock", label: "Stock Inicial", rules: [{ required: true, type: "number" }], children: _jsx(InputNumber, { className: "w-full", min: 0 }) })] }) }), _jsx(Col, { span: 12, children: _jsxs(Card, { title: "Categorizaci\u00F3n", className: "mb-4", children: [_jsx(Form.Item, { name: "group", label: "Grupo", rules: [{ required: true }], children: _jsx(Select, { placeholder: "Seleccione un grupo", onChange: handleGroupChange, options: groups?.data?.map((group) => ({
                                                                label: group.name,
                                                                value: group.name,
                                                            })) }) }), _jsx(Form.Item, { name: "subgroup", label: "Subgrupo", rules: [{ required: true }], children: _jsx(Select, { placeholder: "Seleccione un subgrupo", disabled: !form.getFieldValue("group"), options: subgroups?.map((sg) => ({
                                                                label: sg.name,
                                                                value: sg.name,
                                                            })) }) }), _jsx(Form.Item, { name: "shipping", label: "M\u00E9todos de Env\u00EDo", rules: [{ required: true }], children: _jsx(Select, { mode: "multiple", placeholder: "Seleccione los m\u00E9todos de env\u00EDo", options: [
                                                                { label: "Envío exprés", value: "express" },
                                                                { label: "Envío estándar", value: "standard" },
                                                                { label: "Recoger en tienda", value: "pickup" },
                                                            ] }) })] }) })] }) }, "1"), _jsx(TabPane, { tab: "Multimedia", children: _jsx(Row, { gutter: 24, children: _jsxs(Col, { span: 24, children: [_jsxs(Card, { title: "Im\u00E1genes del Producto", children: [_jsx(Form.Item, { label: "Usar Grupo de Im\u00E1genes", name: "useGroupImages", children: _jsx(Switch, { checked: useGroupImages, onChange: setUseGroupImages }) }), useGroupImages ? (_jsx(Form.Item, { name: "imageGroup", rules: [{ required: true }], children: _jsx(Select, { placeholder: "Seleccione un grupo de im\u00E1genes", options: imageGroups?.data?.groups?.map((group) => ({
                                                                label: group.identifier,
                                                                value: group._id,
                                                            })) }) })) : (_jsx(Form.Item, { name: "images", rules: [{ required: true }], children: _jsx(Upload, { listType: "picture-card", fileList: fileList, beforeUpload: handleUpload, onPreview: handlePreview, children: _jsxs("div", { children: [_jsx(PlusOutlined, {}), _jsx("div", { style: { marginTop: 8 }, children: "Upload" })] }) }) }))] }), _jsx(Card, { title: "Video del Producto", className: "mt-4", children: _jsx(Form.Item, { name: "videoUrl", label: "URL del Video (YouTube/Vimeo)", extra: "Ingrese la URL del video de YouTube o Vimeo", children: _jsx(Input, { placeholder: "https://youtube.com/watch?v=...", onChange: (e) => setVideoUrl(e.target.value) }) }) })] }) }) }, "2"), _jsx(TabPane, { tab: "Descripci\u00F3n", children: _jsx(Row, { gutter: 24, children: _jsxs(Col, { span: 24, children: [_jsxs(Card, { title: "Descripci\u00F3n del Producto", children: [_jsx(Form.Item, { name: "short_description", label: "Descripci\u00F3n Corta", rules: [{ required: true, max: 150 }], extra: "M\u00E1ximo 150 caracteres. Esta descripci\u00F3n aparecer\u00E1 en las vistas previas del producto.", children: _jsx(Input.TextArea, { maxLength: 150, showCount: true, rows: 3 }) }), _jsx(Form.Item, { name: "long_description", label: "Descripci\u00F3n Detallada", rules: [{ required: true }], children: _jsx(ReactQuill, { theme: "snow", modules: quillModules, formats: quillFormats, style: { height: "300px" } }) })] }), _jsx(Card, { title: "Especificaciones T\u00E9cnicas", className: "mt-4", children: _jsx(Form.List, { name: "specifications", children: (fields, { add, remove }) => (_jsxs(_Fragment, { children: [fields.map(({ key, name, ...restField }) => (_jsxs(Space, { style: { display: "flex", marginBottom: 8 }, align: "baseline", children: [_jsx(Form.Item, { ...restField, name: [name, "key"], rules: [
                                                                            {
                                                                                required: true,
                                                                                message: "Ingrese la característica",
                                                                            },
                                                                        ], children: _jsx(Input, { placeholder: "Caracter\u00EDstica" }) }), _jsx(Form.Item, { ...restField, name: [name, "value"], rules: [
                                                                            { required: true, message: "Ingrese el valor" },
                                                                        ], children: _jsx(Input, { placeholder: "Valor" }) }), _jsx(Button, { onClick: () => remove(name), type: "text", danger: true, children: "Eliminar" })] }, key))), _jsx(Button, { type: "dashed", onClick: () => add(), block: true, children: "+ Agregar Especificaci\u00F3n" })] })) }) })] }) }) }, "3"), _jsxs(TabPane, { tab: "SEO y Metadatos", children: [_jsxs(Card, { title: "Optimizaci\u00F3n para Buscadores", children: [_jsx(Form.Item, { name: "seoTitle", label: _jsxs(Space, { children: [_jsx("span", { children: "T\u00EDtulo SEO" }), _jsx(Tooltip, { title: "Si se deja vac\u00EDo, se usar\u00E1 el nombre del producto", children: _jsx(FontAwesomeIcon, { icon: faInfoCircle }) })] }), children: _jsx(Input, { placeholder: "T\u00EDtulo optimizado para motores de b\u00FAsqueda", maxLength: 60, showCount: true }) }), _jsx(Form.Item, { name: "seoDescription", label: _jsxs(Space, { children: [_jsx("span", { children: "Descripci\u00F3n SEO" }), _jsx(Tooltip, { title: "Si se deja vac\u00EDo, se usar\u00E1 la descripci\u00F3n corta", children: _jsx(FontAwesomeIcon, { icon: faInfoCircle }) })] }), children: _jsx(Input.TextArea, { placeholder: "Descripci\u00F3n optimizada para motores de b\u00FAsqueda", maxLength: 160, showCount: true, rows: 3 }) }), _jsx(Form.Item, { name: "seoKeywords", label: "Palabras clave", extra: "Separar palabras clave con comas", children: _jsx(Input.TextArea, { placeholder: "palabra1, palabra2, palabra3", rows: 2 }) })] }), _jsxs(Card, { title: "Garant\u00EDa y Detalles Adicionales", className: "mt-4", children: [_jsx(Form.Item, { name: "warranty", label: "Informaci\u00F3n de Garant\u00EDa", children: _jsx(ReactQuill, { theme: "snow", modules: {
                                                        toolbar: [
                                                            ["bold", "italic"],
                                                            [{ list: "ordered" }, { list: "bullet" }],
                                                            ["clean"],
                                                        ],
                                                    }, style: { height: "150px" } }) }), _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsx(Form.Item, { name: "warrantyMonths", label: "Duraci\u00F3n de la Garant\u00EDa (meses)", children: _jsx(InputNumber, { min: 0, className: "w-full" }) }) }), _jsx(Col, { span: 12, children: _jsx(Form.Item, { name: "brand", label: "Marca", children: _jsx(Input, { placeholder: "Marca del producto" }) }) })] })] }), _jsx(Card, { title: "Productos Relacionados", className: "mt-4", children: _jsx(Form.Item, { name: "relatedProducts", label: "Seleccionar productos relacionados", children: _jsx(Select, { mode: "multiple", placeholder: "Buscar productos...", optionFilterProp: "children", 
                                                // Aquí deberías cargar los productos existentes
                                                options: [], maxTagCount: 5 }) }) })] }, "4"), _jsx(TabPane, { tab: "Variantes", children: _jsx(Card, { title: "Variantes del Producto", children: _jsx(Form.List, { name: "variants", children: (fields, { add, remove }) => (_jsxs(_Fragment, { children: [fields.map(({ key, name, ...restField }) => (_jsx(Card, { className: "mb-4", size: "small", children: _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 8, children: _jsx(Form.Item, { ...restField, name: [name, "name"], label: "Nombre de Variante", rules: [{ required: true }], children: _jsx(Input, { placeholder: "Ej: Color, Tama\u00F1o" }) }) }), _jsx(Col, { span: 8, children: _jsx(Form.Item, { ...restField, name: [name, "value"], label: "Valor", rules: [{ required: true }], children: _jsx(Input, { placeholder: "Ej: Rojo, Grande" }) }) }), _jsx(Col, { span: 6, children: _jsx(Form.Item, { ...restField, name: [name, "price"], label: "Precio Adicional", children: _jsx(InputNumber, { className: "w-full", min: 0, formatter: (value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","), parser: (value) => value.replace(/\$\s?|(,*)/g, "") }) }) }), _jsx(Col, { span: 2, className: "flex items-center mt-8", children: _jsx(Button, { onClick: () => remove(name), type: "text", danger: true, children: "Eliminar" }) })] }) }, key))), _jsx(Button, { type: "dashed", onClick: () => add(), block: true, className: "mt-4", children: "+ Agregar Variante" })] })) }) }) }, "5")] }), _jsxs("div", { className: "flex justify-end gap-4 sticky bottom-0 bg-white p-4 border-t", children: [_jsx(Button, { onClick: () => navigate(-1), children: "Cancelar" }), _jsx(Button, { type: "primary", htmlType: "submit", loading: saveProduct.isPending, disabled: !validateForm(), children: "Guardar Producto" })] })] }), previewOpen && (_jsx(Image, { preview: {
                    visible: previewOpen,
                    onVisibleChange: (visible) => {
                        setPreviewOpen(visible);
                        if (!visible) {
                            setPreviewImage("");
                        }
                    },
                }, src: previewImage, alt: "Preview" })), _jsx("style", { jsx: true, global: true, children: `
        .quill-wrapper {
          .ql-container {
            min-height: 200px;
            font-size: 16px;
          }

          .ql-editor {
            min-height: 200px;
            padding: 12px 15px;
          }

          .ql-toolbar {
            border-radius: 6px 6px 0 0;
          }

          .ql-container {
            border-radius: 0 0 6px 6px;
          }
        }
      ` })] }));
};
export default AddProduct;
