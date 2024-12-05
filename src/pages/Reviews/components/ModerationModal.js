import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Modal, Form, Input, Select, Space, Image, Typography, Rate, } from "antd";
const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;
const ModerationModal = ({ review, visible, onClose, onModerate, }) => {
    const [form] = Form.useForm();
    // Si no hay review, no mostramos el modal
    if (!review || !visible)
        return null;
    // Validar que existan las propiedades necesarias
    const productName = review?.product?.name || 'N/A';
    const userName = review?.user?.name || 'N/A';
    const rating = review?.rating || 0;
    const title = review?.title || 'N/A';
    const content = review?.content || 'N/A';
    const images = review?.images || [];
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onModerate(review._id, values);
        }
        catch (error) {
            console.error("Validation failed:", error);
        }
    };
    return (_jsx(Modal, { title: "Moderar Review", open: visible, onOk: handleSubmit, onCancel: onClose, width: 800, destroyOnClose: true, children: _jsxs(Form, { form: form, layout: "vertical", initialValues: { status: review.status }, children: [_jsxs("div", { className: "mb-6 bg-gray-50 p-4 rounded", children: [_jsxs("div", { className: "mb-2", children: [_jsx(Text, { strong: true, children: "Producto: " }), _jsx(Text, { children: productName })] }), _jsxs("div", { className: "mb-2", children: [_jsx(Text, { strong: true, children: "Usuario: " }), _jsx(Text, { children: userName })] }), _jsxs("div", { className: "mb-2", children: [_jsx(Text, { strong: true, children: "Calificaci\u00F3n: " }), _jsx(Rate, { disabled: true, value: rating })] }), _jsxs("div", { className: "mb-2", children: [_jsx(Text, { strong: true, children: "T\u00EDtulo: " }), _jsx(Text, { children: title })] }), _jsxs("div", { className: "mb-2", children: [_jsx(Text, { strong: true, children: "Contenido: " }), _jsx(Text, { children: content })] }), images.length > 0 && (_jsxs("div", { children: [_jsx(Text, { strong: true, className: "mb-2 block", children: "Im\u00E1genes:" }), _jsx(Space, { wrap: true, children: images.map((image, index) => (_jsx(Image, { src: image.url, width: 100, height: 100, style: { objectFit: "cover" } }, index))) })] }))] }), _jsx(Form.Item, { name: "status", label: "Estado", rules: [
                        { required: true, message: "Por favor seleccione un estado" },
                    ], children: _jsxs(Select, { children: [_jsx(Option, { value: "approved", children: "Aprobar" }), _jsx(Option, { value: "rejected", children: "Rechazar" })] }) }), _jsx(Form.Item, { name: "moderationNote", label: "Nota de Moderaci\u00F3n", rules: [{ required: true, message: "Por favor ingrese una nota" }], children: _jsx(TextArea, { rows: 4, placeholder: "Ingrese una nota detallando la raz\u00F3n de la moderaci\u00F3n..." }) }), review.images && review.images.length > 0 && (_jsx(Form.Item, { name: "approvedImageIds", label: "Im\u00E1genes Aprobadas", children: _jsx(Select, { mode: "multiple", placeholder: "Seleccione las im\u00E1genes a aprobar", optionLabelProp: "label", children: review.images.map((image, index) => (_jsx(Option, { value: image._id, label: `Imagen ${index + 1}`, children: _jsxs(Space, { children: [_jsx("img", { src: image.url, alt: `Imagen ${index + 1}`, style: { width: 50, height: 50, objectFit: "cover" } }), _jsxs("span", { children: ["Imagen ", index + 1] })] }) }, image._id || index))) }) }))] }) }));
};
export default ModerationModal;
