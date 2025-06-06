

import { useState } from "react"
import { Upload, Button, message, Spin } from "antd"
import { UploadOutlined } from "@ant-design/icons"
import { ImageIcon, X } from "lucide-react"
import StorageService from "../../services/storage.service"

interface ImageUploaderProps {
  value?: string | null
  onChange?: (url: string | null, file?: File | null) => void
  aspectRatio?: "square" | "landscape" | "portrait"
  uploadMode?: "immediate" | "deferred" // Nuevo prop para controlar el modo de subida
}

export default function ImageUploader({ 
  value, 
  onChange, 
  aspectRatio = "landscape", 
  uploadMode = "deferred" 
}: ImageUploaderProps) {
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options

    setLoading(true)

    try {
      if (uploadMode === "immediate") {
        // Subida inmediata a GCS
        const uploadResponse = await StorageService.uploadSingleFile(file, 'blog/featured-images')
        
        if (uploadResponse.success && uploadResponse.data) {
          setPreviewUrl(uploadResponse.data.url)
          onChange?.(uploadResponse.data.url, file)
          onSuccess("ok", file)
          message.success("Imagen subida exitosamente a Google Cloud Storage")
        } else {
          throw new Error(uploadResponse.error || "Upload failed")
        }
      } else {
        // Modo diferido - solo crear vista previa local
        const imageUrl = URL.createObjectURL(file)
        setPreviewUrl(imageUrl)
        onChange?.(imageUrl, file)
        onSuccess("ok", file)
        message.success("Imagen preparada (se subirá al guardar)")
      }
    } catch (error) {
      console.error("Upload failed:", error)
      onError(error)
      message.error("Error al procesar la imagen")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onChange?.(null, null)
  }

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square"
      case "portrait":
        return "aspect-[3/4]"
      case "landscape":
      default:
        return "aspect-[16/9]"
    }
  }

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative">
          <div className={`relative ${getAspectRatioClass()} overflow-hidden rounded-lg border border-gray-200`}>
            <img src={previewUrl || "/placeholder.svg"} alt="Featured" className="w-full h-full object-cover" />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <Spin />
              </div>
            )}
          </div>
          <Button danger icon={<X size={16} />} onClick={handleRemove} className="absolute top-2 right-2" />
        </div>
      ) : (
        <Upload.Dragger
          name="image"
          accept="image/*"
          showUploadList={false}
          customRequest={handleUpload}
          className={getAspectRatioClass()}
        >
          <div className="p-6 flex flex-col items-center justify-center h-full">
            {loading ? (
              <Spin />
            ) : (
              <>
                <ImageIcon size={40} className="text-gray-400 mb-4" />
                <p className="text-gray-500">Drag an image here or click to upload</p>
                <p className="text-xs text-gray-400 mt-2">Supports: JPG, PNG, GIF (Max: 5MB)</p>
                <Button type="primary" icon={<UploadOutlined />} className="mt-4">
                  Select Image
                </Button>
              </>
            )}
          </div>
        </Upload.Dragger>
      )}
    </div>
  )
}

