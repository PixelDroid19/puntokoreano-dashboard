

import { useState } from "react"
import { Upload, Button, message, Spin } from "antd"
import { UploadOutlined } from "@ant-design/icons"
import { ImageIcon, X } from "lucide-react"

interface ImageUploaderProps {
  value?: string | null
  onChange?: (url: string | null, file?: File | null) => void
  aspectRatio?: "square" | "landscape" | "portrait"
}

export default function ImageUploader({ value, onChange, aspectRatio = "landscape" }: ImageUploaderProps) {
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options

    setLoading(true)

    try {
      // In a real implementation, this would call your image upload API
      // For demo purposes, we'll simulate an upload and create an object URL

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create a local object URL for demo purposes
      const imageUrl = URL.createObjectURL(file)

      setPreviewUrl(imageUrl)
      onChange?.(imageUrl, file)
      onSuccess("ok", file)
      message.success("Image uploaded successfully")
    } catch (error) {
      console.error("Upload failed:", error)
      onError(error)
      message.error("Failed to upload image")
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

