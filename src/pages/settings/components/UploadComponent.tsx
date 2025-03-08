import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Loader2, X, Link as LinkIcon } from 'lucide-react';
import ConfigService from '../../../services/config.service';

interface UploadComponentProps {
  value?: string;
  onChange?: (url: string | undefined) => void;
  label: string;
  required?: boolean;
  isIcon?: boolean;
}

const UploadComponent: React.FC<UploadComponentProps> = ({
  value,
  onChange,
  label,
  required = false,
  isIcon = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const [loading, setLoading] = useState(false);
  const [useManualUrl, setUseManualUrl] = useState<boolean>(true);
  const [manualUrl, setManualUrl] = useState<string>(value || "");

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const isValidFileType = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"].includes(
        file.type
      );
      const isValidFileSize = file.size / 1024 / 1024 < 2;

      if (!isValidFileType) {
        alert("Por favor, sube un archivo de imagen (JPG, PNG, GIF, SVG)");
        return;
      }

      if (!isValidFileSize) {
        alert("La imagen debe ser menor a 2MB");
        return;
      }

      setLoading(true);
      const url = await ConfigService.uploadImage(file);

      if (!url) {
        throw new Error("No se recibió URL del servicio de carga");
      }

      setPreviewUrl(url);
      onChange?.(url);
    } catch (error) {
      console.error("Error de carga:", error);
      alert("Error al subir la imagen");
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

  const handleToggleManualUrl = () => {
    setUseManualUrl(!useManualUrl);
    if (useManualUrl && previewUrl) {
      // Keep the current preview URL when switching back to upload mode
    } else if (!useManualUrl && !manualUrl) {
      // Clear preview when switching to manual mode without a URL
      setPreviewUrl(undefined);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={handleToggleManualUrl}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          {useManualUrl ? (
            <>
              <Plus className="w-4 h-4" />
              <span>Subir archivo</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4" />
              <span>Usar URL</span>
            </>
          )}
        </button>
      </div>

      {useManualUrl ? (
        <div className="relative">
          <input
            type="text"
            placeholder={isIcon ? "Ingrese la URL del ícono" : "Ingrese la URL de la imagen"}
            value={manualUrl}
            onChange={handleManualUrlChange}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200 pr-10"
          />
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            id="image-upload"
            disabled={loading}
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer block w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-500/50 hover:bg-blue-50/50 transition-colors duration-200"
          >
            <div className="flex flex-col items-center justify-center h-full gap-2">
              {loading ? (
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              ) : previewUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove();
                    }}
                    className="absolute top-2 right-2 p-1 bg-white/90 backdrop-blur-sm hover:bg-white/95 rounded-full shadow-sm transition-all duration-200 hover:shadow"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {isIcon ? "Subir ícono" : "Subir imagen"}
                  </span>
                </>
              )}
            </div>
          </label>
        </div>
      )}
    </div>
  );
};

export default UploadComponent;