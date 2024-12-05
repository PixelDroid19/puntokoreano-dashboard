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
} from "antd";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

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
}

interface ModerationModalProps {
  review: ReviewData | null;
  visible: boolean;
  onClose: () => void;
  onModerate: (reviewId: string, values: any) => void;
}

const ModerationModal: React.FC<ModerationModalProps> = ({
  review,
  visible,
  onClose,
  onModerate,
}) => {
  const [form] = Form.useForm();

  // Si no hay review, no mostramos el modal
  if (!review || !visible) return null;

  // Validar que existan las propiedades necesarias
  const productName = review?.product?.name || 'N/A';
  const userName = review?.user?.name || 'N/A';
  const rating = review?.rating || 0;
  const title = review?.title || 'N/A';
  const content = review?.content || 'N/A';
  const images = review?.images || [];

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
        initialValues={{ status: review.status }}
      >
        <div className="mb-6 bg-gray-50 p-4 rounded">
          <div className="mb-2">
            <Text strong>Producto: </Text>
            <Text>{productName}</Text>
          </div>
          <div className="mb-2">
            <Text strong>Usuario: </Text>
            <Text>{userName}</Text>
          </div>
          <div className="mb-2">
            <Text strong>Calificación: </Text>
            <Rate disabled value={rating} />
          </div>
          <div className="mb-2">
            <Text strong>Título: </Text>
            <Text>{title}</Text>
          </div>
          <div className="mb-2">
            <Text strong>Contenido: </Text>
            <Text>{content}</Text>
          </div>

          {images.length > 0 && (
            <div>
              <Text strong className="mb-2 block">
                Imágenes:
              </Text>
              <Space wrap>
                {images.map((image, index) => (
                  <Image
                    key={index}
                    src={image.url}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                  />
                ))}
              </Space>
            </div>
          )}
        </div>

        <Form.Item
          name="status"
          label="Estado"
          rules={[
            { required: true, message: "Por favor seleccione un estado" },
          ]}
        >
          <Select>
            <Option value="approved">Aprobar</Option>
            <Option value="rejected">Rechazar</Option>
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

        {review.images && review.images.length > 0 && (
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
