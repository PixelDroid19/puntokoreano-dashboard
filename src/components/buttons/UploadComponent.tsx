import { useState } from "react";
import { Upload, Button, message } from "antd";
import { PlusOutlined, DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import ConfigService from "../../services/config.service";

interface UploadComponentProps {
  value?: string;
  onChange?: (url: string | undefined, file?: File) => void;
  label?: string;
  required?: boolean;
  maxSize?: number;
  dimensions?: { width: number; height: number };
  allowedDimensions?: Array<{ width: number; height: number }>;
  validateDimensions?: boolean;
  immediateUpload?: boolean;
}

const UploadComponent = ({
  value,
  onChange,
  label,
  required = false,
  maxSize = 2, // tamaño máximo en MB
  dimensions = { width: 300, height: 300 }, // dimensiones por defecto
  allowedDimensions = [], // dimensiones permitidas específicas
  validateDimensions = false, // si es true, valida que las dimensiones sean exactamente las permitidas
  immediateUpload = true, // Si es true, sube la imagen inmediatamente; si es false, solo muestra vista previa local
}: UploadComponentProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const [loading, setLoading] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);

  const handleUpload = async (file: RcFile) => {
    try {
      const isValidFileType = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"].includes(
        file.type
      );
      const isValidFileSize = file.size / 1024 / 1024 < maxSize;

      if (!isValidFileType) {
        message.error(`Por favor, sube un archivo de imagen (JPG, PNG, GIF, SVG)`);
        return Upload.LIST_IGNORE;
      }

      if (!isValidFileSize) {
        message.error(`La imagen debe ser menor a ${maxSize}MB`);
        return Upload.LIST_IGNORE;
      }
      
      // No mostramos mensaje informativo inicial para evitar múltiples alertas

      // Crear vista previa local
      const localPreviewUrl = URL.createObjectURL(file);
      
      // Para SVG no validamos dimensiones
      if (file.type !== "image/svg+xml") {
        const image = new Image();
        image.src = localPreviewUrl;
        await new Promise<void>((resolve, reject) => {
          image.onload = () => {
            // Validar dimensiones si es necesario
            if (validateDimensions && allowedDimensions.length > 0) {
              const isDimensionValid = allowedDimensions.some(
                dim => image.width === dim.width && image.height === dim.height
              );
              
              if (!isDimensionValid) {
                const dimensionsText = allowedDimensions
                  .map(dim => `${dim.width}x${dim.height}`)
                  .join(' o ');
                
                URL.revokeObjectURL(localPreviewUrl);
                message.error(`La imagen debe tener dimensiones exactas de ${dimensionsText} píxeles`);
                const error = new Error(`Dimensiones inválidas: ${image.width}x${image.height}. Se requiere: ${dimensionsText}`);
                // Añadir una propiedad personalizada al error para indicar que ya se mostró un mensaje
                (error as any).messageShown = true;
                reject(error);
                return;
              }
            }
            resolve();
          };
          image.onerror = (err) => {
            URL.revokeObjectURL(localPreviewUrl);
            reject(err);
          }
        });
      }

      // Si se requiere subida inmediata, proceder con la carga a imgbb
      if (immediateUpload) {
        setLoading(true);
        const url = await ConfigService.uploadImage(file);
        
        if (!url) {
          URL.revokeObjectURL(localPreviewUrl);
          throw new Error("No se recibió URL del servicio de carga");
        }
        
        setPreviewUrl(url);
        onChange?.(url, file);
        URL.revokeObjectURL(localPreviewUrl);
        setLoading(false);
      } else {
        // Solo almacenar el archivo localmente y mostrar vista previa
        setPreviewUrl(localPreviewUrl);
        setLocalFile(file);
        onChange?.("", file); // Pasar string vacío como URL y el archivo para subida posterior
      }
      
      return false;
    } catch (error: any) {
      console.error("Error de carga:", error);
      
      // Solo mostrar mensaje de error si no se ha mostrado ya
      if (!error.messageShown) {
        message.error("Error al subir la imagen");
      }
      
      setLoading(false);
      return Upload.LIST_IGNORE;
    }
  };

  const handleRemove = () => {
    // Si hay una URL de vista previa local, liberarla
    if (previewUrl && !previewUrl.startsWith('http')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl(undefined);
    setLocalFile(null);
    onChange?.(undefined);
  };

  return (
    <div className="upload-component">
      <div className="upload-label">{label} {required && <span className="required">*</span>}</div>
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
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
              {!immediateUpload && localFile && (
                <div className="local-indicator" style={{ position: 'absolute', top: '0', right: '0', background: '#1890ff', color: 'white', padding: '2px 5px', fontSize: '10px', borderRadius: '0 0 0 4px' }}>
                  Local
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Subir</div>
          </div>
        )}
      </Upload>
    </div>
  );
};

export default UploadComponent; 