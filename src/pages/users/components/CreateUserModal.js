import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/users/components/CreateUserModal.tsx
import { useState, useEffect } from "react";
import { Button, Input, Select, Modal, Form, Divider } from "antd";
const { Option } = Select;
// Definimos los tipos de permisos disponibles
const PERMISSIONS = {
    DASHBOARD: [
        { value: "manage_users", label: "Gestionar usuarios" },
        { value: "manage_products", label: "Gestionar productos" },
        { value: "manage_orders", label: "Gestionar pedidos" },
        { value: "view_analytics", label: "Ver analíticas" },
        { value: "manage_content", label: "Gestionar contenido" },
        { value: "manage_settings", label: "Gestionar configuración" },
    ],
    ECOMMERCE: [
        { value: "place_orders", label: "Realizar pedidos" },
        { value: "write_reviews", label: "Escribir reseñas" },
        { value: "view_orders", label: "Ver pedidos" },
        { value: "manage_profile", label: "Gestionar perfil" },
    ],
};
const CreateUserModal = ({ visible, onClose, onSubmit, loading, }) => {
    const [form] = Form.useForm();
    const [userType, setUserType] = useState("ecommerce");
    const passwordValidationRules = [
        { required: true, message: "La contraseña es requerida" },
        { min: 8, message: "La contraseña debe tener al menos 8 caracteres" },
        {
            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
            message: "La contraseña debe contener letras y números",
        },
    ];
    // Reset form when user type changes
    useEffect(() => {
        form.resetFields(["permissions"]);
    }, [userType, form]);
    const handleSubmit = (values) => {
        // Preparar los datos según el tipo de usuario
        const userData = {
            ...values,
            userType, // Incluir el tipo de usuario
            role: userType === "dashboard" ? "admin" : "customer",
        };
        onSubmit(userData);
    };
    return (_jsx(Modal, { title: "Crear Usuario", open: visible, onCancel: () => {
            form.resetFields();
            setUserType("ecommerce");
            onClose();
        }, footer: [
            _jsx(Button, { onClick: onClose, children: "Cancelar" }, "cancel"),
            _jsx(Button, { type: "primary", loading: loading, onClick: () => form.submit(), children: "Crear" }, "submit"),
        ], width: 600, children: _jsxs(Form, { form: form, layout: "vertical", onFinish: handleSubmit, initialValues: { userType: "ecommerce" }, children: [_jsx(Form.Item, { name: "userType", label: "Tipo de Usuario", required: true, children: _jsxs(Select, { onChange: (value) => setUserType(value), value: userType, children: [_jsx(Option, { value: "dashboard", children: "Administrador (Dashboard)" }), _jsx(Option, { value: "ecommerce", children: "Cliente (E-commerce)" })] }) }), _jsx(Divider, {}), _jsx(Form.Item, { name: "name", label: "Nombre Completo", rules: [
                        { required: true, message: "El nombre es requerido" },
                        { min: 3, message: "El nombre debe tener al menos 3 caracteres" },
                    ], children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "email", label: "Email", rules: [
                        { required: true, message: "El email es requerido" },
                        { type: "email", message: "Email inválido" },
                    ], children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "password", label: "Contrase\u00F1a", rules: passwordValidationRules, hasFeedback: true, children: _jsx(Input.Password, {}) }), _jsx(Form.Item, { name: "confirmPassword", label: "Confirmar Contrase\u00F1a", dependencies: ["password"], rules: [
                        ...passwordValidationRules,
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("password") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject("Las contraseñas no coinciden");
                            },
                        }),
                    ], hasFeedback: true, children: _jsx(Input.Password, {}) }), _jsx(Form.Item, { name: "permissions", label: "Permisos", rules: [
                        {
                            required: true,
                            message: "Seleccione al menos un permiso",
                        },
                    ], children: _jsx(Select, { mode: "multiple", placeholder: "Seleccione los permisos", style: { width: "100%" }, children: (userType === "dashboard"
                            ? PERMISSIONS.DASHBOARD
                            : PERMISSIONS.ECOMMERCE).map((permission) => (_jsx(Option, { value: permission.value, children: permission.label }, permission.value))) }) }), userType === "ecommerce" && (_jsxs(_Fragment, { children: [_jsx(Form.Item, { name: "phone", label: "Tel\u00E9fono", rules: [
                                {
                                    pattern: /^\+?[\d\s-]{10,}$/,
                                    message: "Teléfono inválido",
                                },
                            ], children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "document_type", label: "Tipo de Documento", rules: [
                                { required: true, message: "Seleccione un tipo de documento" },
                            ], children: _jsxs(Select, { children: [_jsx(Option, { value: "cc", children: "C\u00E9dula de Ciudadan\u00EDa" }), _jsx(Option, { value: "ce", children: "C\u00E9dula de Extranjer\u00EDa" }), _jsx(Option, { value: "passport", children: "Pasaporte" }), _jsx(Option, { value: "nit", children: "NIT" })] }) }), _jsx(Form.Item, { name: "document_number", label: "N\u00FAmero de Documento", rules: [
                                {
                                    required: true,
                                    message: "El número de documento es requerido",
                                },
                                {
                                    pattern: /^[0-9]{6,20}$/,
                                    message: "Número de documento inválido",
                                },
                            ], children: _jsx(Input, {}) })] }))] }) }));
};
export default CreateUserModal;
