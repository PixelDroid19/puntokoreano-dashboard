import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/products/components/ProductEdit.tsx
import { Modal, Form, Input, InputNumber, Select, Switch, message, Tabs, Card, Row, Col, } from "antd";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import ProductsService from "../../../services/products.service";
import { getGroups } from "../../../helpers/queries.helper";
import FilesService from "../../../services/files.service";
import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
const { TabPane } = Tabs;
const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["clean"],
    ],
};
export const ProductEdit = ({ open, onClose, product }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [subgroups, setSubgroups] = React.useState([]);
    const [useGroupImages, setUseGroupImages] = React.useState(product.useGroupImages);
    // Queries
    const { data: groups } = useQuery({
        queryKey: ["groups"],
        queryFn: getGroups,
    });
    const { data: imageGroups } = useQuery({
        queryKey: ["imageGroups"],
        queryFn: () => FilesService.getGroups(),
    });
    const updateMutation = useMutation({
        mutationFn: (values) => ProductsService.updateProduct(product.id, values),
        onSuccess: () => {
            message.success("Producto actualizado correctamente");
            queryClient.invalidateQueries({ queryKey: ["products"] });
            onClose();
        },
        onError: (error) => {
            message.error(error.message);
        },
    });
    React.useEffect(() => {
        if (product.group && groups?.data) {
            const selectedGroup = groups.data.find((g) => g.name === product.group);
            if (selectedGroup) {
                setSubgroups(selectedGroup.subgroups);
            }
        }
        // Inicializar el formulario con los valores del producto
        form.setFieldsValue({
            ...product,
            imageGroup: product.imageGroup,
            useGroupImages: product.useGroupImages,
            seoTitle: product.seo?.title || "",
            seoDescription: product.seo?.description || "",
            seoKeywords: product.seo?.keywords?.join(", ") || "",
        });
    }, [product, groups?.data]);
    const handleGroupChange = (value) => {
        const selectedGroup = groups?.data?.find((g) => g.name === value);
        if (selectedGroup) {
            setSubgroups(selectedGroup.subgroups);
            form.setFieldValue("subgroup", undefined);
        }
    };
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            // Preparar datos del producto
            const productData = {
                ...values,
                useGroupImages,
                imageGroup: useGroupImages ? values.imageGroup : null,
                images: useGroupImages ? [] : values.images || [],
                seo: {
                    title: values.seoTitle, // Enviamos el valor directamente
                    description: values.seoDescription,
                    keywords: values.seoKeywords
                        ? values.seoKeywords
                            .split(",")
                            .map((k) => k.trim())
                            .filter(Boolean)
                        : [],
                },
            };
            // Remover campos temporales
            delete productData.seoTitle;
            delete productData.seoDescription;
            delete productData.seoKeywords;
            updateMutation.mutate(productData);
        }
        catch (error) {
            console.error("Validation failed:", error);
        }
    };
    return (_jsx(Modal, { title: "Editar Producto", open: open, onCancel: onClose, onOk: handleSubmit, confirmLoading: updateMutation.isPending, width: 800, children: _jsxs(Form, { form: form, layout: "vertical", initialValues: product, children: [_jsxs(Tabs, { defaultActiveKey: "1", children: [_jsx(TabPane, { tab: "Informaci\u00F3n B\u00E1sica", children: _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsxs(Card, { title: "Detalles Principales", size: "small", children: [_jsx(Form.Item, { name: "name", label: "Nombre", rules: [{ required: true }], children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "price", label: "Precio", rules: [{ required: true, type: "number" }], children: _jsx(InputNumber, { className: "w-full", formatter: (value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","), parser: (value) => value.replace(/\$\s?|(,*)/g, "") }) }), _jsx(Form.Item, { name: "code", label: "SKU/C\u00F3digo", rules: [{ required: true }], children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "stock", label: "Stock", rules: [{ required: true }], children: _jsx(InputNumber, { className: "w-full", min: 0 }) })] }) }), _jsx(Col, { span: 12, children: _jsxs(Card, { title: "Categorizaci\u00F3n", size: "small", children: [_jsx(Form.Item, { name: "group", label: "Grupo", rules: [{ required: true }], children: _jsx(Select, { onChange: handleGroupChange, options: groups?.data?.map((group) => ({
                                                            label: group.name,
                                                            value: group.name,
                                                        })) }) }), _jsx(Form.Item, { name: "subgroup", label: "Subgrupo", rules: [{ required: true }], children: _jsx(Select, { options: subgroups?.map((sg) => ({
                                                            label: sg.name,
                                                            value: sg.name,
                                                        })) }) }), _jsx(Form.Item, { name: "shipping", label: "M\u00E9todos de Env\u00EDo", rules: [{ required: true }], children: _jsx(Select, { mode: "multiple", options: [
                                                            { label: "Envío exprés", value: "express" },
                                                            { label: "Envío estándar", value: "standard" },
                                                            { label: "Recoger en tienda", value: "pickup" },
                                                        ] }) })] }) })] }) }, "1"), _jsx(TabPane, { tab: "Multimedia", children: _jsxs(Card, { title: "Im\u00E1genes", children: [_jsx(Form.Item, { label: "Usar Grupo de Im\u00E1genes", name: "useGroupImages", children: _jsx(Switch, { checked: useGroupImages, onChange: (checked) => {
                                                setUseGroupImages(checked);
                                                if (checked) {
                                                    form.setFieldsValue({ images: [] });
                                                }
                                                else {
                                                    form.setFieldsValue({ imageGroup: undefined });
                                                }
                                            } }) }), useGroupImages ? (_jsx(Form.Item, { name: "imageGroup", label: "Grupo de Im\u00E1genes", rules: [{ required: useGroupImages }], children: _jsx(Select, { options: imageGroups?.data?.groups?.map((group) => ({
                                                label: group.identifier,
                                                value: group._id,
                                            })) }) })) : null] }) }, "2"), _jsx(TabPane, { tab: "Descripci\u00F3n", children: _jsxs(Card, { title: "Contenido", size: "small", children: [_jsx(Form.Item, { name: "short_description", label: "Descripci\u00F3n Corta", rules: [{ required: true, max: 150 }], children: _jsx(Input.TextArea, { rows: 3, maxLength: 150, showCount: true }) }), _jsx(Form.Item, { name: "long_description", label: "Descripci\u00F3n Detallada", rules: [{ required: true }], children: _jsx(ReactQuill, { modules: quillModules }) })] }) }, "3"), _jsx(TabPane, { tab: "SEO", children: _jsxs(Card, { title: "Optimizaci\u00F3n para Buscadores", size: "small", children: [_jsx(Form.Item, { name: "seoTitle", label: "T\u00EDtulo SEO", rules: [
                                            {
                                                max: 60,
                                                message: "El título SEO no debe exceder 60 caracteres",
                                            },
                                        ], children: _jsx(Input, { placeholder: "T\u00EDtulo para SEO (si se deja vac\u00EDo se usar\u00E1 el nombre del producto)" }) }), _jsx(Form.Item, { name: "seoDescription", label: "Descripci\u00F3n SEO", rules: [
                                            {
                                                max: 160,
                                                message: "La descripción SEO no debe exceder 160 caracteres",
                                            },
                                        ], children: _jsx(Input.TextArea, { rows: 3, placeholder: "Descripci\u00F3n para SEO (si se deja vac\u00EDo se usar\u00E1 la descripci\u00F3n corta)", showCount: true, maxLength: 160 }) }), _jsx(Form.Item, { name: "seoKeywords", label: "Palabras Clave", help: "Separar palabras clave por comas", children: _jsx(Input.TextArea, { rows: 2, placeholder: "ej: repuesto, motor, hyundai" }) })] }) }, "4")] }), _jsx(Form.Item, { name: "active", valuePropName: "checked", children: _jsx(Switch, { checkedChildren: "Activo", unCheckedChildren: "Inactivo" }) })] }) }));
};
