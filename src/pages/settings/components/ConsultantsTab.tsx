import { Button, Card, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ConsultantForm from "./ConsultantForm";

interface ConsultantsTabProps {
  form: any;
  pendingImages: Map<string, File>;
  setPendingImages: (value: Map<string, File>) => void;
  useSharedHeaderImage: boolean;
  setUseSharedHeaderImage: (value: boolean) => void;
  sharedHeaderImage?: string;
  onFieldChange?: (fieldPath: string) => void;
}

const ConsultantsTab = ({
  form,
  pendingImages,
  setPendingImages,
  useSharedHeaderImage,
  setUseSharedHeaderImage,
  sharedHeaderImage,
  onFieldChange,
}: ConsultantsTabProps) => {
  return (
    <Card bordered={false}>
      <Form.List name="consultants" initialValue={[]}>
        {(fields, { add, remove }) => (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map((field) => (
                <ConsultantForm
                  key={field.key}
                  field={field}
                  remove={remove}
                  form={form}
                  pendingImages={pendingImages}
                  setPendingImages={setPendingImages}
                  useSharedHeaderImage={useSharedHeaderImage}
                  setUseSharedHeaderImage={setUseSharedHeaderImage}
                  sharedHeaderImage={sharedHeaderImage}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
            <Button
              type="dashed"
              onClick={() =>
                add({
                  name: "",
                  position: "",
                  phone: "",
                  active: true,
                  order: fields.length,
                  image: "",
                  headerImage:
                    useSharedHeaderImage && sharedHeaderImage
                      ? sharedHeaderImage
                      : "",
                  qrCode: "",
                })
              }
              block
              icon={<PlusOutlined />}
              className="mt-4"
            >
              Agregar Consultor
            </Button>
          </>
        )}
      </Form.List>
    </Card>
  );
};

export default ConsultantsTab; 