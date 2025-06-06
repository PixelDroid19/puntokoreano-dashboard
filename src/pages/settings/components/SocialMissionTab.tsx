import { useState, useEffect } from "react";
import { Form, Input, Upload, message } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";

interface SocialMissionTabProps {
  form: any;
  pendingImages: Map<string, File>;
  setPendingImages: (value: Map<string, File>) => void;
  settings?: any; // Agregar los settings para observar cuando se cargan
  onFieldChange?: (fieldPath: string) => void;
}

const SocialMissionTab = ({
  form,
  pendingImages,
  setPendingImages,
  settings,
  onFieldChange,
}: SocialMissionTabProps) => {
  const [backgroundImage, setBackgroundImage] = useState<string>("");

  // Observar cambios en la imagen de fondo y cargar valor inicial
  useEffect(() => {
    if (form) {
      const currentValue = form.getFieldValue(['socialMission', 'backgroundImage']);
      setBackgroundImage(currentValue || "");
    }
  }, [form]);

  // Cargar valor inicial cuando lleguen los settings del servidor
  useEffect(() => {
    if (settings?.socialMission?.backgroundImage) {
      setBackgroundImage(settings.socialMission.backgroundImage);
    }
  }, [settings]);
  // Manejar subida de imagen
  const handleImageUpload = async (file: RcFile) => {
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

      // Crear vista previa local
      const previewUrl = URL.createObjectURL(file);
      form.setFieldValue(["socialMission", "backgroundImage"], previewUrl);
      setBackgroundImage(previewUrl); // Actualizar estado local

      // Guardar archivo para subida diferida
      const fieldPath = "socialMission.backgroundImage";
      const newMap = new Map(pendingImages);
      newMap.set(fieldPath, file);
      setPendingImages(newMap);

      // Notificar cambio al componente padre
      onFieldChange?.("socialMission.backgroundImage");

      message.success("Imagen preparada (se subirá al guardar)");
      return false; // Prevenir subida automática
    } catch (error) {
      message.error("Error al procesar la imagen");
      return false;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Imagen de Fondo de la Misión Social <span className="text-red-500">*</span>
        </label>
        
        <Upload
          listType="picture-card"
          showUploadList={false}
          beforeUpload={handleImageUpload}
          accept="image/*"
          className="social-mission-upload"
          style={{ width: "100%" }}
        >
          {backgroundImage ? (
            <div className="relative w-full h-full">
              <img
                src={backgroundImage}
                alt="Imagen de fondo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                <UploadOutlined className="text-white text-xl" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <PlusOutlined className="text-2xl mb-2" />
              <div className="text-sm font-medium">Subir Imagen</div>
              <div className="text-xs text-gray-400 mt-1 text-center">
                Imagen de fondo para la misión social
              </div>
            </div>
          )}
        </Upload>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Texto de la Misión <span className="text-red-500">*</span>
        </label>
        <Form.Item
          name={["socialMission", "text"]}
          rules={[
            {
              required: true,
              message: "El texto de la misión social es requerido",
            },
          ]}
          className="mb-0"
        >
          <Input.TextArea
            rows={4}
            placeholder="Describe la misión social de la empresa"
            className="resize-none"
            onChange={() => onFieldChange?.("socialMission.text")}
          />
        </Form.Item>
      </div>
    </div>
  );
};

export default SocialMissionTab; 