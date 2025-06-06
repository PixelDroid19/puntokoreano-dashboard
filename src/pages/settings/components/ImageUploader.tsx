import { useEffect, useState } from "react";
import { Upload, Button, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import StorageService from "../../../services/storage.service";

interface ImageUploaderProps {
  value?: string;
  onChange?: (url: string | undefined) => void;
  label: string;
  required?: boolean;
  fieldPath?: string;
  size?: 'small' | 'default' | 'large';
  pendingImages: Map<string, File>;
  setPendingImages: (value: Map<string, File>) => void;
}

const ImageUploader = ({
  value,
  onChange,
  label,
  required = false,
  fieldPath,
  size = 'default',
  pendingImages,
  setPendingImages
}: ImageUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);

  useEffect(() => {
    if (value !== previewUrl) {
      setPreviewUrl(value);
    }
  }, [value, previewUrl]);

  const sizeClasses = {
    small: 'w-20 h-16',
    default: 'w-32 h-24',
    large: 'w-48 h-32'
  };

  const handleUpload = async (file: RcFile) => {
    try {
      const isImage = file.type.startsWith('image/');
      const isLt2M = file.size / 1024 / 1024 < 2;
      
      if (!isImage) {
        message.error('Solo se permiten archivos de imagen');
        return false;
      }
      if (!isLt2M) {
        message.error('La imagen debe ser menor a 2MB');
        return false;
      }
      
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      onChange?.(objectUrl);
      
      if (fieldPath) {
        const newMap = new Map(pendingImages);
        newMap.set(fieldPath, file);
        setPendingImages(newMap);
      }
      
      message.success("Imagen cargada");
      return false;
    } catch (error) {
      message.error("Error al procesar la imagen");
      return Upload.LIST_IGNORE;
    }
  };

  const handleRemove = async () => {
    if (value && value.startsWith('http')) {
      try {
        await StorageService.deleteFileByUrl(value);
        message.success('Imagen eliminada');
      } catch (error) {
        message.warning('Error al eliminar');
      }
    }
    
    setPreviewUrl(undefined);
    onChange?.(undefined);
    
    if (fieldPath) {
      const newMap = new Map(pendingImages);
      newMap.delete(fieldPath);
      setPendingImages(newMap);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {previewUrl && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {previewUrl.startsWith('blob:') ? (
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Pendiente</span>
            ) : (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Guardado</span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-start gap-4">
        <div className={`${sizeClasses[size]} border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0`}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              Sin imagen
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-3">
          <Upload
            listType="picture-card"
            showUploadList={false}
            beforeUpload={handleUpload}
            accept="image/*"
            className="w-fit"
          >
            <div className="flex flex-col items-center justify-center w-16 h-16 text-gray-500 hover:text-blue-500 transition-colors">
              <PlusOutlined className="text-base mb-1" />
              <div className="text-xs font-medium">Subir</div>
            </div>
          </Upload>
          
          {previewUrl && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={handleRemove}
              className="text-xs"
            >
              Eliminar imagen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader; 