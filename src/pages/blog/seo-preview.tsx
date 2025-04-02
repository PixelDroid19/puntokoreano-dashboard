

import { Card } from "antd"
import { Globe } from "lucide-react"

interface SEOPreviewProps {
  title: string
  description: string
  url?: string
}

export default function SEOPreview({ title, description, url = "https://example.com" }: SEOPreviewProps) {
  const displayTitle = title || "Untitled Post"
  const displayDescription = description || "No description provided"

  return (
    <Card className="overflow-hidden">
      <div className="space-y-1">
        <div className="text-sm text-green-600 flex items-center gap-1">
          <Globe size={14} />
          <span>{url}</span>
        </div>
        <h3 className="text-blue-600 text-xl font-medium hover:underline cursor-pointer">
          {displayTitle.length > 60 ? `${displayTitle.substring(0, 60)}...` : displayTitle}
        </h3>
        <p className="text-sm text-gray-600">
          {displayDescription.length > 160 ? `${displayDescription.substring(0, 160)}...` : displayDescription}
        </p>
      </div>
    </Card>
  )
}

