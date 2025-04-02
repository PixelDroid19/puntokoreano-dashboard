

import { Skeleton, Card } from "antd"

interface LoadingSkeletonProps {
  type?: "table" | "form" | "card"
  count?: number
}

export default function LoadingSkeleton({ type = "table", count = 1 }: LoadingSkeletonProps) {
  if (type === "table") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton.Input active style={{ width: 200 }} />
          <Skeleton.Button active />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-white">
            <div className="flex justify-between">
              <Skeleton.Input active style={{ width: 150 }} />
              <div className="flex gap-2">
                <Skeleton.Button active size="small" />
                <Skeleton.Button active size="small" />
              </div>
            </div>
          </div>

          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="p-4 border-b bg-white">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton.Input active style={{ width: 300 }} />
                  <Skeleton.Input active style={{ width: 200 }} />
                </div>
                <Skeleton.Button active />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === "form") {
    return (
      <Card>
        <div className="space-y-6">
          <div className="flex justify-between">
            <Skeleton.Input active style={{ width: 200 }} />
            <div className="flex gap-2">
              <Skeleton.Button active />
              <Skeleton.Button active />
            </div>
          </div>

          <Skeleton.Input active block style={{ height: 40 }} />
          <Skeleton.Input active block style={{ height: 80 }} />
          <Skeleton.Input active block style={{ height: 200 }} />
        </div>
      </Card>
    )
  }

  // Card type
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        </Card>
      ))}
    </div>
  )
}

