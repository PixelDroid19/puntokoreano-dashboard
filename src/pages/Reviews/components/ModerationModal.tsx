import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Space,
  Image,
  Typography,
  Rate,
  Tag,
  Collapse,
  Alert,
  Progress,
} from "antd";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;
const { Panel } = Collapse;

interface ReviewImage {
  _id: string;
  url: string;
  approved: boolean;
}

interface ReviewData {
  _id: string;
  product: {
    name: string;
    code: string;
  };
  user: {
    name: string;
    email: string;
  };
  rating: number;
  title: string;
  content: string;
  status: string;
  images?: ReviewImage[];
  quality_score: number;
  quality_metrics: {
    length_score: number;
    uniqueness_score: number;
    helpfulness_ratio: number;
    verified_purchase_bonus: number;
    sentiment_score: number;
  };
  sentiment: {
    score: number;
    keywords: string[];
    automated_flags: string[];
  };
  spam_score: number;
  spam_flags: string[];
  engagement: {
    views: number;
    shares: number;
  };
  rewards: {
    points_earned: number;
    badges: string[];
    featured: boolean;
  };
  reported?: {
    count: number;
    reasons: Array<{
      reason: string;
      details: string;
      status: string;
    }>;
  };
}

interface ModerationModalProps {
  review: ReviewData | null;
  visible: boolean;
  onClose: () => void;
  onModerate: (reviewId: string, values: any) => void;
}

const ReviewInfoField = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="mb-2">
    <Text strong>{label}: </Text>
    <Text>{value || "N/A"}</Text>
  </div>
);

const ReviewImages = ({ images }: { images: ReviewImage[] }) =>
  images.length > 0 && (
    <div>
      <Text strong className="mb-2 block">
        Imágenes:
      </Text>
      <Space wrap>
        {images.map((image, index) => (
          <div key={index} className="relative">
            <Image
              src={image.url}
              width={100}
              height={100}
              style={{ objectFit: "cover" }}
            />
            {image.approved && (
              <Tag color="success" className="absolute top-0 right-0">
                Aprobada
              </Tag>
            )}
          </div>
        ))}
      </Space>
    </div>
  );

const QualityMetrics = ({
  metrics,
  score,
}: {
  metrics: ReviewData["quality_metrics"];
  score: number;
}) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <Text strong>Puntuación de Calidad:</Text>
      <Progress
        type="circle"
        percent={score}
        width={60}
        status={score >= 80 ? "success" : score >= 50 ? "normal" : "exception"}
      />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Text>Longitud: {metrics?.length_score}</Text>
        <Progress percent={metrics?.length_score * 3.33} size="small" />
      </div>
      <div>
        <Text>Originalidad: {metrics?.uniqueness_score}</Text>
        <Progress percent={metrics?.uniqueness_score * 5} size="small" />
      </div>
      <div>
        <Text>Utilidad: {Math.round(metrics?.helpfulness_ratio * 100)}%</Text>
        <Progress percent={metrics?.helpfulness_ratio * 100} size="small" />
      </div>
      <div>
        <Text>Sentimiento: {metrics?.sentiment_score}</Text>
        <Progress percent={metrics?.sentiment_score * 5} size="small" />
      </div>
    </div>
  </div>
);

const ReviewFlags = ({ review }: { review: ReviewData }) => {
  const hasFlags =
    review.spam_flags.length > 0 ||
    review.sentiment.automated_flags.length > 0 ||
    (review.reported && review.reported.count > 0);

  if (!hasFlags) return null;

  return (
    <div className="mb-4">
      <Alert
        type="warning"
        message={
          <div>
            <Text strong>Alertas detectadas:</Text>
            <div className="mt-2">
              {review.spam_flags.length > 0 && (
                <Tag color="error">Spam Detectado</Tag>
              )}
              {review.sentiment.automated_flags.map((flag, index) => (
                <Tag key={index} color="warning">
                  {flag}
                </Tag>
              ))}
              {review.reported && review.reported.count > 0 && (
                <Tag color="error">{review.reported.count} Reportes</Tag>
              )}
            </div>
          </div>
        }
      />
    </div>
  );
};

const ModerationModal: React.FC<ModerationModalProps> = ({
  review,
  visible,
  onClose,
  onModerate,
}) => {
  const [form] = Form.useForm();

  if (!review || !visible) return null;

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onModerate(review._id, values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Moderar Review"
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: review.status,
          approvedImageIds: review.images
            ?.filter((img) => img.approved)
            .map((img) => img._id),
        }}
      >
        <Collapse defaultActiveKey={["basic", "quality"]}>
          <Panel header="Información Básica" key="basic">
            <div className="bg-gray-50 p-4 rounded">
              <ReviewInfoField label="Producto" value={review.product?.name} />
              <ReviewInfoField label="Usuario" value={review.user?.name} />
              <div className="mb-2">
                <Text strong>Calificación: </Text>
                <Rate disabled value={review.rating || 0} />
              </div>
              <ReviewInfoField label="Título" value={review.title} />
              <ReviewInfoField label="Contenido" value={review.content} />
              <ReviewImages images={review.images || []} />
            </div>
          </Panel>

          <Panel header="Métricas de Calidad" key="quality">
            <QualityMetrics
              metrics={review.quality_metrics}
              score={review.quality_score}
            />
            {review.rewards && (
              <div className="mb-4">
                <Text strong>Recompensas:</Text>
                <div className="mt-2">
                  <Space wrap>
                    {review.rewards.badges.map((badge, index) => (
                      <Tag key={index} color="blue">
                        {badge}
                      </Tag>
                    ))}
                    {review.rewards.featured && (
                      <Tag color="gold">Review Destacada</Tag>
                    )}
                  </Space>
                </div>
              </div>
            )}
          </Panel>

          <Panel header="Alertas y Reportes" key="flags">
            <ReviewFlags review={review} />
            {review.reported && review.reported.count > 0 && (
              <div className="mt-4">
                <Text strong>Detalles de Reportes:</Text>
                {review.reported.reasons.map((report, index) => (
                  <Alert
                    key={index}
                    type="info"
                    message={report.reason}
                    description={report.details}
                    className="mt-2"
                  />
                ))}
              </div>
            )}
          </Panel>
        </Collapse>

        <Form.Item
          name="status"
          label="Estado"
          rules={[
            { required: true, message: "Por favor seleccione un estado" },
          ]}
          className="mt-4"
        >
          <Select>
            <Option value="approved">Aprobar</Option>
            <Option value="rejected">Rechazar</Option>
            <Option value="flagged">Marcar para Revisión</Option>
            <Option value="spam">Marcar como Spam</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="moderationNote"
          label="Nota de Moderación"
          rules={[{ required: true, message: "Por favor ingrese una nota" }]}
        >
          <TextArea
            rows={4}
            placeholder="Ingrese una nota detallando la razón de la moderación..."
          />
        </Form.Item>

        {review.images?.length > 0 && (
          <Form.Item name="approvedImageIds" label="Imágenes Aprobadas">
            <Select
              mode="multiple"
              placeholder="Seleccione las imágenes a aprobar"
              optionLabelProp="label"
            >
              {review.images.map((image, index) => (
                <Option
                  key={image._id || index}
                  value={image._id}
                  label={`Imagen ${index + 1}`}
                >
                  <Space>
                    <img
                      src={image.url}
                      alt={`Imagen ${index + 1}`}
                      style={{ width: 50, height: 50, objectFit: "cover" }}
                    />
                    <span>Imagen {index + 1}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default ModerationModal;
