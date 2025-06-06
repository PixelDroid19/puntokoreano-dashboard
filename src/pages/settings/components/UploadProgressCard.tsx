import { Card, Progress, Typography } from "antd";

const { Title, Text } = Typography;

interface UploadProgressCardProps {
  isProcessing: boolean;
  uploadProgress: Record<string, number>;
  totalUploadProgress: number;
}

const UploadProgressCard = ({
  isProcessing,
  uploadProgress,
  totalUploadProgress,
}: UploadProgressCardProps) => {
  if (!isProcessing || Object.keys(uploadProgress).length === 0) {
    return null;
  }

  return (
    <Card
      size="small"
      bordered
      className="mb-6 bg-gray-50"
      style={{ marginTop: "24px" }}
    >
      <Title level={5} style={{ marginBottom: 12, textAlign: "center" }}>
        Subiendo Imágenes a Google Cloud Storage
      </Title>
      {Object.entries(uploadProgress).map(([fileName, progress]) => (
        <div key={fileName} className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <Text ellipsis style={{ maxWidth: "65%" }} className="text-sm">
              {fileName}
            </Text>
            <Text type="secondary" className="text-sm">
              {progress}%
            </Text>
          </div>
          <Progress percent={progress} size="small" status="active" />
        </div>
      ))}
      {totalUploadProgress > 0 && (
        <div className="mt-4">
          <Text strong className="block text-center mb-2">
            Progreso Total: {totalUploadProgress}%
          </Text>
          <Progress
            percent={totalUploadProgress}
            size="default"
            status="active"
          />
        </div>
      )}
    </Card>
  );
};

export default UploadProgressCard; 