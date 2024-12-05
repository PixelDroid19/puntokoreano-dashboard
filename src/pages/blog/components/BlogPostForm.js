import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
//src/pages/blog/components/BlogPostForm.tsx
import React from "react";
import { Form, Input, Select, Upload, Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { convertToBase64 } from "../../../helpers/images.helper";
import { $getRoot } from "lexical";
import LexicalBlogEditor from "../../../components/LexicalBlogEditor/LexicalBlogEditor.component";
const BlogPostForm = ({ initialValues, onSubmit, loading, }) => {
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = React.useState();
    const [editorContent, setEditorContent] = React.useState("");
    const handleImageUpload = async (file) => {
        try {
            const base64 = await convertToBase64(file);
            setImageUrl(base64);
            form.setFieldsValue({ featured_image: base64 });
            return false; // Prevent default upload
        }
        catch (error) {
            message.error("Error al cargar la imagen");
            return false;
        }
    };
    const handleEditorChange = (editorState) => {
        editorState.read(() => {
            const root = $getRoot();
            const content = JSON.stringify(root);
            setEditorContent(content);
            form.setFieldsValue({ content });
        });
    };
    return (_jsxs(Form, { form: form, layout: "vertical", initialValues: initialValues, onFinish: onSubmit, children: [_jsx(Form.Item, { name: "title", label: "T\u00EDtulo", rules: [{ required: true, message: "Por favor ingrese un título" }], children: _jsx(Input, { placeholder: "T\u00EDtulo del art\u00EDculo" }) }), _jsx(Form.Item, { name: "content", label: "Contenido", rules: [{ required: true, message: "Por favor ingrese el contenido" }], children: _jsx(LexicalBlogEditor, { namespace: "blogPost", theme: {} }) }), _jsx(Form.Item, { name: "excerpt", label: "Extracto", rules: [{ required: true, message: "Por favor ingrese un extracto" }], children: _jsx(Input.TextArea, { rows: 3, placeholder: "Breve descripci\u00F3n del art\u00EDculo" }) }), _jsx(Form.Item, { name: "categories", label: "Categor\u00EDas", rules: [
                    { required: true, message: "Seleccione al menos una categoría" },
                ], children: _jsx(Select, { mode: "tags", placeholder: "Seleccione o cree categor\u00EDas", options: [
                        { label: "Noticias", value: "news" },
                        { label: "Tutoriales", value: "tutorials" },
                        { label: "Productos", value: "products" },
                    ] }) }), _jsx(Form.Item, { name: "tags", label: "Etiquetas", children: _jsx(Select, { mode: "tags", placeholder: "Agregue etiquetas" }) }), _jsx(Form.Item, { name: "featured_image", label: "Imagen Destacada", children: _jsx(Upload, { listType: "picture-card", showUploadList: false, beforeUpload: handleImageUpload, children: imageUrl ? (_jsx("img", { src: imageUrl, alt: "featured", style: { width: "100%" } })) : (_jsxs("div", { children: [_jsx(PlusOutlined, {}), _jsx("div", { style: { marginTop: 8 }, children: "Subir" })] })) }) }), _jsx(Form.Item, { name: "status", label: "Estado", initialValue: "draft", children: _jsxs(Select, { children: [_jsx(Select.Option, { value: "draft", children: "Borrador" }), _jsx(Select.Option, { value: "published", children: "Publicado" }), _jsx(Select.Option, { value: "archived", children: "Archivado" })] }) }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-md mb-4", children: [_jsx("h3", { className: "text-lg font-medium mb-4", children: "SEO" }), _jsx(Form.Item, { name: ["seo", "title"], label: "T\u00EDtulo SEO", children: _jsx(Input, { placeholder: "T\u00EDtulo para SEO" }) }), _jsx(Form.Item, { name: ["seo", "description"], label: "Descripci\u00F3n SEO", children: _jsx(Input.TextArea, { rows: 2, placeholder: "Descripci\u00F3n para SEO" }) }), _jsx(Form.Item, { name: ["seo", "keywords"], label: "Palabras clave", children: _jsx(Select, { mode: "tags", placeholder: "Agregue palabras clave para SEO" }) })] }), _jsx(Button, { type: "primary", htmlType: "submit", loading: loading, children: "Guardar" })] }));
};
export default BlogPostForm;
