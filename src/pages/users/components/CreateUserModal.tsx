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
};

// Función para convertir array de permisos a objeto estructurado
const convertPermissionsArrayToObject = (permissionsArray: string[]) => {
  const permissions = {
    users: { view: false, create: false, edit: false, delete: false },
    products: { view: true, create: false, edit: false, delete: false },
    orders: { view: true, process: false, refund: false },
    analytics: { view: false },
    settings: { view: false, edit: false },
  };

  permissionsArray.forEach((permission) => {
    switch (permission) {
      case "manage_users":
        permissions.users = { view: true, create: true, edit: true, delete: true };
        break;
      case "manage_products":
        permissions.products = { view: true, create: true, edit: true, delete: true };
        break;
      case "manage_orders":
        permissions.orders = { view: true, process: true, refund: true };
        break;
      case "view_analytics":
        permissions.analytics = { view: true };
        break;
      case "manage_content":
        // Agregar lógica para contenido si es necesario
        break;
      case "manage_settings":
        permissions.settings = { view: true, edit: true };
        break;
    }
  });

  return permissions;
};

const CreateUserModal = ({
  visible,
  onClose,
  onSubmit,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  loading: boolean;
}) => {
  const [form] = Form.useForm();
  const [userType, setUserType] = useState<"dashboard" | "ecommerce">(
    "ecommerce"
  );

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
    form.resetFields(["permissions", "phone", "document_type", "document_number"]);
  }, [userType, form]);

  const handleSubmit = (values: any) => {
    // Preparar los datos según el tipo de usuario
    let userData;
    
    if (userType === "dashboard") {
      // Para usuarios administradores: incluir permisos, excluir campos de e-commerce
      const { phone, document_type, document_number, confirmPassword, permissions, ...adminData } = values;
      userData = {
        ...adminData,
        userType,
        role: "admin",
        // Convertir array de permisos a objeto estructurado
        permissions: permissions ? convertPermissionsArrayToObject(permissions) : undefined,
      };
    } else {
      // Para usuarios de e-commerce: incluir campos específicos, excluir permisos
      const { permissions, confirmPassword, ...customerData } = values;
      userData = {
        ...customerData,
        userType,
        role: "customer",
      };
    }

    onSubmit(userData);
  };

  return (
    <Modal
      title="Crear Usuario"
      open={visible}
      onCancel={() => {
        form.resetFields();
        setUserType("ecommerce");
        onClose();
      }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Crear
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ userType: "ecommerce" }}
      >
        {/* Selector de tipo de usuario */}
        <Form.Item name="userType" label="Tipo de Usuario" required>
          <Select
            onChange={(value: "dashboard" | "ecommerce") => setUserType(value)}
            value={userType}
          >
            <Option value="dashboard">Administrador (Dashboard)</Option>
            <Option value="ecommerce">Cliente (E-commerce)</Option>
          </Select>
        </Form.Item>

        <Divider />

        {/* Campos comunes */}
        <Form.Item
          name="name"
          label="Nombre Completo"
          rules={[
            { required: true, message: "El nombre es requerido" },
            { min: 3, message: "El nombre debe tener al menos 3 caracteres" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "El email es requerido" },
            { type: "email", message: "Email inválido" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Contraseña"
          rules={passwordValidationRules}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirmar Contraseña"
          dependencies={["password"]}
          rules={[
            ...passwordValidationRules,
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject("Las contraseñas no coinciden");
              },
            }),
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        {/* Permisos solo para usuarios de dashboard */}
        {userType === "dashboard" && (
          <Form.Item
            name="permissions"
            label="Permisos"
            rules={[
              {
                required: true,
                message: "Seleccione al menos un permiso",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Seleccione los permisos"
              style={{ width: "100%" }}
            >
              {PERMISSIONS.DASHBOARD.map((permission) => (
                <Option key={permission.value} value={permission.value}>
                  {permission.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* Campos adicionales para usuarios de e-commerce */}
        {userType === "ecommerce" && (
          <>
            <Form.Item
              name="phone"
              label="Teléfono"
              rules={[
                {
                  pattern: /^\+?[\d\s-]{10,}$/,
                  message: "Teléfono inválido",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="document_type"
              label="Tipo de Documento"
              rules={[
                { required: true, message: "Seleccione un tipo de documento" },
              ]}
            >
              <Select>
                <Option value="cc">Cédula de Ciudadanía</Option>
                <Option value="ce">Cédula de Extranjería</Option>
                <Option value="passport">Pasaporte</Option>
                <Option value="nit">NIT</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="document_number"
              label="Número de Documento"
              rules={[
                {
                  required: true,
                  message: "El número de documento es requerido",
                },
                {
                  pattern: /^[0-9]{6,20}$/,
                  message: "Número de documento inválido",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default CreateUserModal;
