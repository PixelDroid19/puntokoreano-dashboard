import { useState } from "react";
import {
  Button,
  Upload,
  Input,
  InputNumber,
  Switch,
  Form,
  Tooltip,
  message,
} from "antd";
import {
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  CameraOutlined,
  IdcardOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { RcFile } from "antd/es/upload";

interface EditableConsultantCardProps {
  consultant: any;
  fieldName: number;
  form: any;
  pendingImages: Map<string, File>;
  setPendingImages: (value: Map<string, File>) => void;
  useSharedHeaderImage: boolean;
  setUseSharedHeaderImage: (value: boolean) => void;
  sharedHeaderImage?: string;
  remove: (index: number) => void;
  onFieldChange?: (fieldPath: string) => void;
}

const EditableConsultantCard = ({
  consultant,
  fieldName,
  form,
  pendingImages,
  setPendingImages,
  useSharedHeaderImage,
  setUseSharedHeaderImage,
  sharedHeaderImage,
  remove,
  onFieldChange,
}: EditableConsultantCardProps) => {
  const [showBack, setShowBack] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Helper function to update form value
  const updateField = (key: string, value: any) => {
    form.setFieldValue(["consultants", fieldName, key], value);
    onFieldChange?.(`consultants.${fieldName}.${key}`);
  };

  // Handle image upload for profile
  const handleProfileImageUpload = async (file: RcFile) => {
    try {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        message.error("Solo se permiten archivos de imagen");
        return false;
      }
      if (!isLt2M) {
        message.error("La imagen debe ser menor a 2MB");
        return false;
      }

      const objectUrl = URL.createObjectURL(file);
      updateField("image", objectUrl);

      const fieldPath = `consultants.${fieldName}.image`;
      const newMap = new Map(pendingImages);
      newMap.set(fieldPath, file);
      setPendingImages(newMap);

      message.success("Imagen cargada");
      return false;
    } catch (error) {
      message.error("Error al procesar la imagen");
      return Upload.LIST_IGNORE;
    }
  };

  // Handle image upload for header
  const handleHeaderImageUpload = async (file: RcFile) => {
    try {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage || !isLt2M) {
        message.error("Solo se permiten imágenes de menos de 2MB");
        return false;
      }

      const objectUrl = URL.createObjectURL(file);

      if (useSharedHeaderImage) {
        // Actualizar imagen compartida
        form.setFieldValue("sharedHeaderImage", objectUrl);
        const newMap = new Map(pendingImages);
        newMap.set("sharedHeaderImage", file);
        setPendingImages(newMap);

        // Actualizar todas las tarjetas con esta imagen
        const consultants = form.getFieldValue("consultants") || [];
        consultants.forEach((_, index: number) => {
          form.setFieldValue(["consultants", index, "headerImage"], objectUrl);
        });
      } else {
        // Actualizar solo esta tarjeta
        updateField("headerImage", objectUrl);
        const fieldPath = `consultants.${fieldName}.headerImage`;
        const newMap = new Map(pendingImages);
        newMap.set(fieldPath, file);
        setPendingImages(newMap);
      }

      message.success("Imagen de encabezado cargada");
      return false;
    } catch (error) {
      message.error("Error al procesar la imagen");
      return Upload.LIST_IGNORE;
    }
  };

  // Handle QR code upload
  const handleQRCodeUpload = async (file: RcFile) => {
    try {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage || !isLt2M) {
        message.error("Solo se permiten imágenes de menos de 2MB");
        return false;
      }

      const objectUrl = URL.createObjectURL(file);
      updateField("qrCode", objectUrl);

      const fieldPath = `consultants.${fieldName}.qrCode`;
      const newMap = new Map(pendingImages);
      newMap.set(fieldPath, file);
      setPendingImages(newMap);

      message.success("Código QR cargado");
      return false;
    } catch (error) {
      message.error("Error al procesar la imagen");
      return Upload.LIST_IGNORE;
    }
  };

  // Front card with editable fields
  const FrontCard = () => (
    <div className="w-full h-full bg-white rounded-2xl overflow-hidden relative">
      {/* Profile Image with Upload */}
      <div className="relative h-full w-full">
        <Upload
          showUploadList={false}
          beforeUpload={handleProfileImageUpload}
          accept="image/*"
          className="w-full h-full block"
        >
          <div className="w-full h-full cursor-pointer">
            {consultant?.image ? (
              <div className="relative w-full h-full">
                <img
                  src={consultant.image}
                  alt={consultant?.name || "Consultor"}
                  className="w-full h-full rounded-2xl object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                  <UploadOutlined className="text-white text-3xl" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 rounded-2xl">
                <PlusOutlined className="text-4xl text-gray-400 mb-4" />
                <div className="text-gray-400 text-lg">Subir Foto de Perfil</div>
              </div>
            )}
          </div>
        </Upload>
      </div>

      {/* Bottom Info Section */}
      <div className="absolute bottom-0 left-0 w-full rounded-b-xl">
        {/* Editable overlay on click */}
        {editMode ? (
          <div className="bg-black/80 backdrop-blur-md p-4 rounded-b-xl">
            <Form.Item
              name={[fieldName, "name"]}
              className="mb-2"
              rules={[{ required: true, message: "Nombre requerido" }]}
            >
              <Input
                placeholder="Nombre completo"
                className="text-white text-xl bg-transparent border border-white/30"
              />
            </Form.Item>
            <Form.Item
              name={[fieldName, "position"]}
              className="mb-0"
              rules={[{ required: true, message: "Cargo requerido" }]}
            >
              <Input
                placeholder="Cargo o posición"
                className="text-white bg-transparent border border-white/30"
              />
            </Form.Item>

            {/* Toggle off edit mode */}
            <Button
              type="link"
              onClick={() => setEditMode(false)}
              className="text-white mt-2 text-xs"
              size="small"
            >
              Guardar cambios
            </Button>
          </div>
        ) : (
          <section
            className="text-white text-xl bg-black/50 w-full rounded-b-xl px-6 py-3 backdrop-blur-sm cursor-pointer"
            onClick={() => setEditMode(true)}
          >
            <h3 className="text-end font-semibold">
              {consultant?.name || "Nombre del Consultor"}
            </h3>
            <p className="text-end">{consultant?.position || "Cargo"}</p>
            <div className="text-end text-xs opacity-70 mt-1">
              Click para editar
            </div>
          </section>
        )}
      </div>
    </div>
  );

  // Back card with editable fields
  const BackCard = () => (
    <div className="h-full flex flex-col">
      {/* Banner Image Section - Upload with Preview */}
      <div className="relative h-[30%]">
        <Upload
          showUploadList={false}
          beforeUpload={handleHeaderImageUpload}
          accept="image/*"
          className="w-full h-full block"
        >
          <div className="w-full h-full cursor-pointer">
            {consultant?.headerImage ? (
              <div className="relative w-full h-full">
                <img
                  className="w-full h-full object-cover rounded-t-2xl brightness-50 grayscale"
                  src={consultant.headerImage}
                  alt="banner"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-t-2xl">
                  <UploadOutlined className="text-white text-2xl" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 rounded-t-2xl">
                <PlusOutlined className="text-2xl text-gray-400 mb-2" />
                <div className="text-gray-400 text-sm">Subir Banner</div>
              </div>
            )}
          </div>
        </Upload>
      </div>

      {/* Consultant Information Section - Inspired by VirtualCard layout */}
      <div className="flex-1 bg-[#E8E6E7] rounded-b-2xl relative flex flex-col">
        {/* Consultant Image - Overlapping from header like VirtualCard */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10">
          <Upload
            showUploadList={false}
            beforeUpload={handleProfileImageUpload}
            accept="image/*"
            className="block"
          >
            <div className="w-20 h-20 cursor-pointer">
              {consultant?.image ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#5c4dce]">
                  <img
                    className="w-full h-full object-cover"
                    src={consultant.image}
                    alt={consultant?.name || "Consultor"}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                    <UploadOutlined className="text-white text-lg" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full border-2 border-[#5c4dce] bg-gray-200 flex flex-col items-center justify-center">
                  <PlusOutlined className="text-lg text-gray-400 mb-1" />
                  <div className="text-gray-400 text-xs">Foto</div>
                </div>
              )}
            </div>
          </Upload>
        </div>

        {/* Consultant Details - Optimized spacing */}
        <div className="mt-8 text-center px-3 flex-1 overflow-hidden">
          {editMode ? (
            <div className="bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-lg h-full overflow-y-auto">
              <Form.Item
                name={[fieldName, "name"]}
                className="mb-1"
                rules={[{ required: true, message: "Nombre requerido" }]}
              >
                <Input
                  placeholder="Nombre completo"
                  className="text-center font-bold text-sm"
                  size="small"
                />
              </Form.Item>

              <Form.Item
                name={[fieldName, "position"]}
                className="mb-1"
                rules={[{ required: true, message: "Cargo requerido" }]}
              >
                <Input
                  placeholder="Cargo o posición"
                  className="text-center text-sm"
                  size="small"
                />
              </Form.Item>

              <Form.Item name={[fieldName, "email"]} className="mb-1">
                <Input
                  placeholder="Correo electrónico"
                  className="text-center text-sm"
                  size="small"
                />
              </Form.Item>

              <Button
                type="primary"
                onClick={() => setEditMode(false)}
                size="small"
                className="text-sm mt-1"
              >
                Guardar
              </Button>
            </div>
          ) : (
            <div
              onClick={() => setEditMode(true)}
              className="cursor-pointer hover:bg-white/10 p-1 rounded-lg h-full overflow-hidden"
            >
              <div className="text-center mb-2">
              
                <h3 className="text-lg font-bold text-gray-800 truncate">
                  {consultant?.name || "Nombre del Consultor"}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {consultant?.position || "Cargo"}
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  Punto Koreano, Inc
                </p>
              </div>

              <div className="text-left space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tel:</span> {consultant?.phone || "+57 300123456"}
                </p>
                {consultant?.email && (
                  <p className="text-sm text-gray-600 truncate">
                    <span className="font-medium">Email:</span> {consultant?.email}
                  </p>
                )}
              </div>

              <div className="text-sm text-gray-400 mt-2 text-center">
                Click para editar
              </div>
            </div>
          )}
        </div>

        {/* Contact Settings - Compact */}
        <div className="px-3 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Teléfono
              </label>
              <Form.Item
                name={[fieldName, "phone"]}
                className="mb-0"
                rules={[{ required: true, message: "Requerido" }]}
              >
                <Input
                  placeholder="+57 300 123 4567"
                  className="text-center text-sm"
                  size="small"
                />
              </Form.Item>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                WhatsApp
              </label>
              <Form.Item name={[fieldName, "whatsapp"]} className="mb-0">
                <Input 
                  placeholder="Opcional" 
                  className="text-center text-sm" 
                  size="small"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* QR Code Display/Upload - Horizontal Layout */}
        <div className="mt-2 mb-2 px-3">
          {consultant?.qrCode ? (
            <div className="flex items-center justify-between bg-white/50 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <img 
                  src={consultant.qrCode} 
                  alt="QR Code" 
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <span className="text-gray-600 text-sm font-medium">Código QR</span>
              </div>
              <Upload
                showUploadList={false}
                beforeUpload={handleQRCodeUpload}
                accept="image/*"
              >
                <Button size="small" className="text-sm" type="link">
                  Cambiar
                </Button>
              </Upload>
            </div>
          ) : (
            <Upload
              showUploadList={false}
              beforeUpload={handleQRCodeUpload}
              accept="image/*"
            >
              <div className="flex items-center justify-center bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-2 cursor-pointer hover:bg-blue-100 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500 mr-2">
                  <path d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H11V13H9V11M15,11H17V13H19V11H21V13H19V15H21V19H19V21H17V19H13V21H11V17H15V15H17V13H15V11M19,19V15H17V19H19M15,3H21V9H15V3M17,5V7H19V5H17M3,3H9V9H3V3M5,5V7H7V5H5M3,15H9V21H3V15M5,17V19H7V17H5Z" />
                </svg>
                <span className="text-blue-600 text-sm font-medium">Subir Código QR</span>
              </div>
            </Upload>
          )}
        </div>

        {/* Config Section - Compact */}
        <div className="border-t border-gray-300 px-3 py-1 flex justify-between items-center">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Orden
            </label>
            <Form.Item
              name={[fieldName, "order"]}
              className="mb-0"
              initialValue={0}
            >
              <InputNumber size="small" min={0} className="w-10" />
            </Form.Item>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1 text-center">
              Estado
            </label>
            <Form.Item
              name={[fieldName, "active"]}
              valuePropName="checked"
              initialValue={true}
              className="mb-0 flex justify-center"
            >
              <Switch
                checkedChildren="On"
                unCheckedChildren="Off"
                size="small"
              />
            </Form.Item>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Título del consultor */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
          <TeamOutlined className="text-xl text-[#5c4dce]" />
          Consultor {fieldName + 1}
        </h3>
      </div>

      <div className="editable-consultant-card relative w-full max-w-[350px] h-[550px] border-4 border-[#5c4dce] rounded-2xl shadow-xl bg-white mx-auto overflow-hidden">
        {showBack ? <BackCard /> : <FrontCard />}

        {/* Controles superiores en fila */}
        <div className="absolute top-3 right-3 z-30 flex gap-2">
          {/* Botón eliminar */}
          <Button
            danger
            type="primary"
            icon={<DeleteOutlined />}
            onClick={() => remove(fieldName)}
            className="shadow-lg"
            size="small"
            shape="circle"
          />
          
          {/* Botón flip */}
          <div
            className="bg-black/80 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-black/90 transition-colors flex items-center justify-center"
            onClick={() => setShowBack(!showBack)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4V2.21c0-.45.54-.67.85-.35l2.8 2.79c.2.2.2.51 0 .71l-2.8 2.79c-.31.32-.85.09-.85-.35V6c-3.31 0-6 2.69-6 6 0 1.01.25 1.97.7 2.8l-1.46 1.46C4.51 15.03 4 13.57 4 12c0-4.42 3.58-8 8-8zm7.25 4.74L18.79 8.2c.48 1.23.21 2.68-.7 3.59-.91.91-2.36 1.18-3.59.7l-.46.46c1.5.5 3.18.19 4.35-.98 1.17-1.17 1.48-2.85.98-4.35l.46-.46z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3 mt-4">
        <Button
          type={showBack ? "default" : "primary"}
          size="small"
          onClick={() => setShowBack(false)}
          icon={<CameraOutlined />}
        >
          Frente
        </Button>
        <Button
          type={showBack ? "primary" : "default"}
          size="small"
          onClick={() => setShowBack(true)}
          icon={<IdcardOutlined />}
        >
          Reverso
        </Button>
      </div>
    </div>
  );
};

export default EditableConsultantCard; 