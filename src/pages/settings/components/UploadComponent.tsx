import { useState } from "react";
import { Form, Upload, Button, message, Switch, Input } from "antd";
import { PlusOutlined, DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import ConfigService from "../../../services/config.service";
import { Typography } from "antd";

const { Text } = Typography;

interface UploadComponentProps {
  value?: string;
  onChange?: (url: string | undefined) => void;
  label: string;
  required?: boolean;
  isIcon?: boolean;
}

const UploadComponent = ({
  value,
  onChange,
  label,
  required = false,
  isIcon = false,
}: UploadComponentProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const [loading, setLoading] = useState(false);
  const [useManualUrl, setUseManualUrl] = useState<boolean>(false);
  const [manualUrl, setManualUrl] = useState<string>(value || "");

  const handleUpload = async (file: RcFile) => {
    try {
      const isValidFileType = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"].includes(
        file.type
      );
      const isValidFileSize = file.size / 1024 / 1024 < 2;

      if (!isValidFileType) {
        message.error("Por favor, sube un archivo de imagen (JPG, PNG, GIF, SVG)");
        return Upload.LIST_IGNORE;
      }

      if (!isValidFileSize) {
        message.error("La imagen debe ser menor a 2MB");
        return Upload.LIST_IGNORE;
      }

      if (isIcon) {
        const img = new Image();
        const imgPromise = new Promise<boolean>((resolve, reject) => {
          img.onload = () => {
            const maxSize = 128;
            if (img.width > maxSize || img.height > maxSize) {
              message.warning(`El ícono debe ser de máximo ${maxSize}x${maxSize}px para mejor visualización`);
            }
            resolve(true);
          };
          img.onerror = () => {
            reject(new Error("Error al cargar la imagen para verificar dimensiones"));
          };
        });
        
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        
        try {
          await imgPromise;
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      }

      setLoading(true);
      const url = await ConfigService.uploadImage(file);

      if (!url) {
        throw new Error("No se recibió URL del servicio de carga");
      }

      setPreviewUrl(url);
      onChange?.(url);
      return false;
    } catch (error) {
      console.error("Error de carga:", error);
      message.error("Error al subir la imagen");
      return Upload.LIST_IGNORE;
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(undefined);
    setManualUrl("");
    onChange?.(undefined);
  };

  const handleManualUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setManualUrl(url);
    setPreviewUrl(url);
    onChange?.(url);
  };

  const handleToggleManualUrl = (checked: boolean) => {
    setUseManualUrl(checked);
    if (!checked && previewUrl) {
      // Keep the current preview URL when switching back to upload mode
    } else if (checked && !manualUrl) {
      // Clear preview when switching to manual mode without a URL
      setPreviewUrl(undefined);
    }
  };

  return (
    <Form.Item label={label} required={required} className="upload-component">
      <div style={{ marginBottom: 8 }}>
        <Switch 
          checked={useManualUrl} 
          onChange={handleToggleManualUrl} 
          checkedChildren="URL Manual" 
          unCheckedChildren="Subir Imagen"
        />
      </div>

      {useManualUrl ? (
        <Input 
          placeholder={isIcon ? "Ingrese la URL del ícono" : "Ingrese la URL de la imagen"} 
          value={manualUrl} 
          onChange={handleManualUrlChange}
          suffix={
            previewUrl && (
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                onClick={handleRemove}
              />
            )
          }
        />
      ) : (
        <Upload
          listType="picture-card"
          showUploadList={false}
          beforeUpload={handleUpload}
        >
          {previewUrl ? (
            <div className="preview-container">
              <img
                src={previewUrl}
                alt="Vista previa"
                style={{
                  width: isIcon ? "64px" : "100%", 
                  height: isIcon ? "64px" : "100%", 
                  objectFit: isIcon ? "contain" : "cover",
                  margin: isIcon ? "auto" : "0"
                }}
              />
              <div className="preview-actions">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                />
              </div>
            </div>
          ) : (
            <div>
              {loading ? <LoadingOutlined /> : <PlusOutlined />}
              <div style={{ marginTop: 8 }}>Subir</div>
            </div>
          )}
        </Upload>
      )}
      {previewUrl && (
        <div style={{ marginTop: 8, textAlign: "center" }}>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {useManualUrl ? "URL ingresada manualmente" : "Imagen subida"}
          </Text>
        </div>
      )}
    </Form.Item>
  );
};

export default UploadComponent;