import EditableConsultantCard from "./EditableConsultantCard";

interface ConsultantFormProps {
  field: any;
  remove: (index: number) => void;
  form: any;
  pendingImages: Map<string, File>;
  setPendingImages: (value: Map<string, File>) => void;
  useSharedHeaderImage: boolean;
  setUseSharedHeaderImage: (value: boolean) => void;
  sharedHeaderImage?: string;
  onFieldChange?: (fieldPath: string) => void;
}

const ConsultantForm = ({
  field,
  remove,
  form,
  pendingImages,
  setPendingImages,
  useSharedHeaderImage,
  setUseSharedHeaderImage,
  sharedHeaderImage,
  onFieldChange,
}: ConsultantFormProps) => {
  const currentConsultant = form.getFieldValue(["consultants", field.name]);

  return (
    <div className="mb-8">
      <EditableConsultantCard
        consultant={currentConsultant}
        fieldName={field.name}
        form={form}
        pendingImages={pendingImages}
        setPendingImages={setPendingImages}
        useSharedHeaderImage={useSharedHeaderImage}
        setUseSharedHeaderImage={setUseSharedHeaderImage}
        sharedHeaderImage={sharedHeaderImage}
        remove={remove}
        onFieldChange={onFieldChange}
      />
    </div>
  );
};

export default ConsultantForm; 