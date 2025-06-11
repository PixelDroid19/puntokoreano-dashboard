import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Upload,
  Button,
  Switch,
  InputNumber,
  message,
  Row,
  Col,
  Modal,
  Typography,
  Divider,
  Tooltip,
  Progress,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  LoadingOutlined,
  SaveOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  TrophyOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RcFile, UploadFile } from "antd/es/upload";
import ConfigService from "../../services/config.service";
import StorageService from "../../services/storage.service";
import FilesService from "../../services/files.service";
import "./styles/highlighted-services.css";

const { Title, Text } = Typography;

interface HighlightedServiceStat {
  value: string | number;
  icon: string;
}

interface HighlightedService {
  title: string;
  description: string;
  image: string;
  imageFile?: File; // Archivo para subida diferida
  stats?: HighlightedServiceStat[];
  active?: boolean;
  order?: number;
  identifier?: string;
}

interface Achievement {
  title: string;
  value: string;
  icon: string; // URL de la imagen del icono
  icon_url?: string; // URL de la imagen en el backend
  iconFile?: File; // Archivo para subida diferida
  iconPreview?: string; // URL de vista previa local
  color: string;
  active: boolean;
  order: number;
  id?: string;
}

// Componente para cada tarjeta de servicio
const ServiceCard = ({
  service,
  index,
  onRemove,
  onChange,
}: {
  service: HighlightedService;
  index: number;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: keyof HighlightedService,
    value: any
  ) => void;
}) => {
  return (
    <Card
      title={`Servicio ${index + 1}`}
      className="service-card animate-in"
      extra={
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemove(index)}
          className="delete-button"
        />
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4">
        {/* Primera Fila: Título e Identificador */}
        <div className="md:col-span-6">
          <Form.Item
            label="Título"
            required
            validateStatus={!service.title ? "error" : ""}
            help={!service.title ? "El título es requerido" : ""}
            className="mb-3"
          >
            <Input
              className="input-field"
              value={service.title}
              onChange={(e) => onChange(index, "title", e.target.value)}
              placeholder="Ingrese el título del servicio"
              suffix={
                <Tooltip title="Nombre principal del servicio">
                  <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                </Tooltip>
              }
            />
          </Form.Item>
        </div>
        <div className="md:col-span-6">
          <Form.Item
            label="Identificador"
            required
            validateStatus={
              !service.identifier || !/^[a-z0-9-]+$/.test(service.identifier)
                ? "error"
                : ""
            }
            help={
              !service.identifier
                ? "El identificador es requerido"
                : !/^[a-z0-9-]+$/.test(service.identifier)
                ? "Solo letras minúsculas, números y guiones"
                : ""
            }
            className="mb-3"
          >
            <Input
              className="input-field"
              placeholder="ejemplo-de-identificador"
              value={service.identifier}
              onChange={(e) => onChange(index, "identifier", e.target.value)}
              suffix={
                <Tooltip title="Debe ser único y solo contener letras minúsculas, números y guiones">
                  <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                </Tooltip>
              }
            />
          </Form.Item>
        </div>

        {/* Segunda Fila: Descripción */}
        <div className="md:col-span-12">
          <Form.Item
            label="Descripción"
            required
            validateStatus={!service.description ? "error" : ""}
            help={!service.description ? "La descripción es requerida" : ""}
            className="mb-3"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input.TextArea
              className="input-field"
              rows={3}
              value={service.description}
              onChange={(e) => onChange(index, "description", e.target.value)}
              placeholder="Describa brevemente en qué consiste este servicio"
            />
          </Form.Item>
        </div>

        {/* Tercera Fila: Imagen y Orden/Estado */}
        <div className="md:col-span-4">
          <Form.Item
            label="Imagen del Servicio"
            required
            validateStatus={!service.image ? "error" : ""}
            help={!service.image ? "La imagen es requerida" : ""}
            className="mb-3"
          >
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                // Validar archivo
                const isImage = file.type.startsWith("image/");
                const isLt2M = file.size / 1024 / 1024 < 2;

                if (!isImage) {
                  message.error("Solo se permiten archivos de imagen");
                  return false;
                }
                if (!isLt2M) {
                  message.error("La imagen debe ser menor a 2MB");
                  return false;
                }

                // Crear vista previa local
                const previewUrl = URL.createObjectURL(file);
                onChange(index, "image", previewUrl);
                onChange(index, "imageFile", file); // Guardar archivo para subida diferida
                message.success("Imagen preparada (se subirá al guardar)");

                return false; // Prevenir subida automática
              }}
              accept="image/*"
            >
              {service.image ? (
                <div className="relative">
                  <img
                    src={service.image}
                    alt="preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                    <UploadOutlined className="text-white text-xl" />
                  </div>
                </div>
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Subir</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </div>

        <div className="md:col-span-8">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Orden" className="mb-1">
                <InputNumber
                  className="input-field w-full"
                  min={0}
                  value={service.order}
                  onChange={(value) => onChange(index, "order", value)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12} className="flex items-end">
              <Form.Item label="Estado" className="mb-1 w-full">
                <Switch
                  className="switch-field"
                  checkedChildren="Activo"
                  unCheckedChildren="Inactivo"
                  checked={service.active}
                  onChange={(checked) => onChange(index, "active", checked)}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
};

// Componente para la sección de servicios
const ServicesSection = ({
  services,
  onServiceChange,
  onAddService,
  onRemoveService,
}: {
  services: HighlightedService[];
  onServiceChange: (
    index: number,
    field: keyof HighlightedService,
    value: any
  ) => void;
  onAddService: () => void;
  onRemoveService: (index: number) => void;
}) => {
  return (
    <div className="section-container">
      <div className="section-title">
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <AppstoreOutlined /> Servicios Destacados
            </Title>
          </Col>
          <Col>
            <Tooltip title="Los servicios destacados se mostrarán en la página principal">
              <InfoCircleOutlined style={{ color: "#1890ff" }} />
            </Tooltip>
          </Col>
        </Row>
      </div>
      <div className="section-content">
        {services.map((service, index) => (
          <ServiceCard
            key={index}
            service={service}
            index={index}
            onRemove={onRemoveService}
            onChange={onServiceChange}
          />
        ))}

        <Button
          type="dashed"
          onClick={onAddService}
          block
          icon={<PlusOutlined />}
          className="add-button"
          style={{ marginBottom: "24px" }}
        >
          Agregar Servicio Destacado
        </Button>
      </div>
    </div>
  );
};

// Componente para cada tarjeta de logro
const AchievementCard = ({
  achievement,
  index,
  onRemove,
  onChange,
  setChangedAchievements,
}: {
  achievement: Achievement;
  index: number;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof Achievement, value: any) => void;
  onIconFileChange?: (index: number, file: File) => void;
  setChangedAchievements?: React.Dispatch<React.SetStateAction<Set<string>>>;
}) => {
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | undefined>(
    achievement.icon && !achievement.icon.startsWith("http")
      ? achievement.icon
      : undefined
  );

  const handleIconChange = async (url: string | undefined, file?: File) => {
    // Si recibimos una URL vacía, significa que es una vista previa local
    if (url === "" && file) {
      // Solo crear vista previa local, NO eliminar la imagen anterior todavía
      // La eliminación se hará en el momento del submit si es necesario
      const objectUrl = URL.createObjectURL(file);
      setLocalPreviewUrl(objectUrl);

      // Guardar el archivo para subida posterior
      onChange(index, "iconFile", file);
      // No actualizar el campo icon todavía, se hará al guardar

      console.log(`📷 Nueva imagen seleccionada para el logro ${achievement.title}, creando vista previa local`);

      // Marcar el elemento como cambiado inmediatamente
      if (
        achievement.id &&
        !achievement.id.startsWith("temp-") &&
        setChangedAchievements
      ) {
        console.log(
          `Marcando logro ${achievement.id} como modificado al cambiar imagen (vista previa)`
        );
        setChangedAchievements((prev) => new Set([...prev, achievement.id!]));
      }
    } else {
      // Si es una URL real o undefined, actualizar normalmente
      setLocalPreviewUrl(undefined);
      onChange(index, "icon", url || "");
      onChange(index, "icon_url", url || ""); // También actualizar icon_url
      if (file) {
        onChange(index, "iconFile", file);

        // Marcar el elemento como cambiado inmediatamente
        if (
          achievement.id &&
          !achievement.id.startsWith("temp-") &&
          setChangedAchievements
        ) {
          console.log(
            `Marcando logro ${achievement.id} como modificado al cambiar imagen (URL directa)`
          );
          setChangedAchievements((prev) => new Set([...prev, achievement.id!]));
        }
      } else if (url === undefined) {
        // Si estamos eliminando la imagen, también eliminar el archivo
        onChange(index, "iconFile", undefined);
        onChange(index, "icon_url", ""); // También actualizar icon_url
        console.log(`Eliminando imagen del logro ${achievement.title}`);

        // Marcar el elemento como cambiado inmediatamente
        if (
          achievement.id &&
          !achievement.id.startsWith("temp-") &&
          setChangedAchievements
        ) {
          console.log(
            `Marcando logro ${achievement.id} como modificado al eliminar imagen`
          );
          setChangedAchievements((prev) => new Set([...prev, achievement.id!]));
        }
      }
    }
  };

  // Función para eliminar explícitamente la imagen
  const handleDeleteImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Solo eliminar de GCS si es realmente una URL de Google Cloud Storage
    const isGoogleCloudStorageUrl = (url: string): boolean => {
      return url.includes('storage.googleapis.com') || 
             url.includes('storage.cloud.google.com') ||
             url.includes('.googleusercontent.com');
    };
    
    // Si hay una URL de imagen existente en GCS, eliminarla
    if (achievement.icon && 
        achievement.icon.startsWith('http') && 
        isGoogleCloudStorageUrl(achievement.icon)) {
      try {
        console.log(`🗑️ Eliminando imagen de GCS: ${achievement.icon}`);
        const deleteResult = await StorageService.deleteFileByUrl(achievement.icon);
        if (deleteResult.success) {
          console.log(`✅ Imagen eliminada exitosamente de GCS`);
          message.success('Imagen eliminada del almacenamiento');
        } else {
          console.warn(`⚠️ La imagen no pudo ser eliminada de GCS:`, deleteResult.message);
          message.warning('La imagen se quitará localmente, pero no pudo ser eliminada del almacenamiento');
        }
      } catch (error: any) {
        console.error('❌ Error al eliminar imagen de GCS:', {
          error: error.message || error,
          status: error.response?.status,
          data: error.response?.data
        });
        message.warning('Error al eliminar del almacenamiento, pero se quitará localmente');
      }
    } else if (achievement.icon && achievement.icon.startsWith('http')) {
      console.log(`ℹ️ La imagen ${achievement.icon} no es de GCS, solo se quitará localmente`);
      message.info('Imagen quitada (no estaba almacenada en nuestro sistema)');
    }
    
    setLocalPreviewUrl(undefined);
    onChange(index, "icon", "");
    onChange(index, "icon_url", ""); // También actualizar icon_url
    onChange(index, "iconFile", undefined);
    console.log(`🖼️ Imagen eliminada del logro ${achievement.title}`);
  };

  return (
    <Card
      key={index}
      className="service-card animate-in"
      extra={
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemove(index)}
          className="delete-button"
        />
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-1">
        {/* Primera fila - Título y Valor */}
        <div className="md:col-span-6">
          <Form.Item
            label={
              <span className="text-sm font-medium">
                Título <span className="text-red-500">*</span>
              </span>
            }
            required
            validateStatus={!achievement.title ? "error" : ""}
            help={!achievement.title ? "El título es requerido" : ""}
            className="mb-2"
          >
            <Input
              className="input-field"
              value={achievement.title}
              onChange={(e) => onChange(index, "title", e.target.value)}
              placeholder="Ej: Clientes Satisfechos"
              size="middle"
            />
          </Form.Item>
        </div>

        <div className="md:col-span-6">
          <Form.Item
            label={
              <span className="text-sm font-medium">
                Valor <span className="text-red-500">*</span>
              </span>
            }
            required
            validateStatus={!achievement.value ? "error" : ""}
            help={!achievement.value ? "El valor es requerido" : ""}
            className="mb-2"
          >
            <Input
              className="input-field"
              value={achievement.value}
              onChange={(e) => onChange(index, "value", e.target.value)}
              placeholder="Ej: 500+"
              size="middle"
            />
          </Form.Item>
        </div>

        {/* Segunda fila - Color y Orden */}
        <div className="md:col-span-6">
          <Form.Item
            label={
              <span className="text-sm font-medium flex items-center">
                Color
                <Tooltip title="Código hexadecimal o nombre del color (ej: #1890ff o blue)">
                  <InfoCircleOutlined className="ml-1 text-blue-500" />
                </Tooltip>
              </span>
            }
            className="mb-2"
          >
            <Input
              className="input-field"
              value={achievement.color}
              onChange={(e) => onChange(index, "color", e.target.value)}
              placeholder="Ej: #1890ff"
              style={{
                backgroundColor: achievement.color
                  ? `${achievement.color}20`
                  : "white",
              }}
              size="middle"
            />
          </Form.Item>
        </div>

        <div className="md:col-span-6">
          <Form.Item
            label={<span className="text-sm font-medium">Orden</span>}
            className="mb-2"
          >
            <InputNumber
              className="input-field"
              min={0}
              value={achievement.order}
              onChange={(value) => onChange(index, "order", value)}
              style={{ width: "100%" }}
              size="middle"
            />
          </Form.Item>
        </div>

        {/* Tercera fila - Ícono y Estado */}
        <div className="md:col-span-6">
          <Form.Item
            label={
              <span className="text-sm font-medium flex items-center">
                Ícono <span className="text-red-500">*</span>
                <Tooltip title="Formatos: JPG, PNG, GIF, SVG. Máx. 1MB. Tamaños recomendados: 32x32px, 64x64px, 128x128px para mejor calidad responsive">
                  <InfoCircleOutlined className="ml-1 text-blue-500" />
                </Tooltip>
              </span>
            }
            required
            validateStatus={!achievement.icon ? "error" : ""}
            help={!achievement.icon ? "El ícono es requerido. Use 32x32, 64x64 o 128x128px para mejor calidad" : ""}
            className="mb-1"
          >
            <div className="upload-with-actions">
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={(file) => {
                  // Validar archivo
                  const isImage = file.type.startsWith("image/");
                  const isLt1M = file.size / 1024 / 1024 < 1;

                  if (!isImage) {
                    message.error("Solo se permiten archivos de imagen");
                    return false;
                  }
                  if (!isLt1M) {
                    message.error("La imagen debe ser menor a 1MB");
                    return false;
                  }

                  // Validar dimensiones recomendadas (opcional, solo advertencia)
                  const img = new Image();
                  img.onload = () => {
                    const { width, height } = img;
                    const validSizes = [32, 64, 128];
                    const isValidSize = validSizes.includes(width) && validSizes.includes(height) && width === height;
                    
                    if (!isValidSize) {
                      message.warning(
                        `Tamaño ${width}x${height}px. Para mejor calidad use: 32x32, 64x64 o 128x128px`
                      );
                    } else {
                      message.success(`Tamaño perfecto: ${width}x${height}px`);
                    }
                    
                    URL.revokeObjectURL(img.src);
                  };
                  img.src = URL.createObjectURL(file);

                  // Usar la función existente para manejar el cambio
                  handleIconChange("", file);

                  return false; // Prevenir subida automática
                }}
                accept="image/*"
              >
                {localPreviewUrl || achievement.icon ? (
                  <div className="relative">
                    <img
                      src={localPreviewUrl || achievement.icon}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        backgroundColor: "#f0f0f0",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                      <UploadOutlined className="text-white text-xl" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 text-center opacity-0 hover:opacity-100 transition-opacity">
                      Tamaños ideales: 32x32, 64x64, 128x128px
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <PlusOutlined className="text-2xl mb-2" />
                    <div className="text-sm font-medium">Subir Ícono</div>
                    <div className="text-xs text-gray-400 mt-1 text-center">
                      32x32, 64x64 o 128x128px
                    </div>
                  </div>
                )}
              </Upload>
              {(localPreviewUrl || achievement.icon) && (
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={handleDeleteImage}
                  style={{ marginTop: "8px" }}
                >
                  Eliminar imagen
                </Button>
              )}
            </div>
          </Form.Item>
        </div>

        <div className="md:col-span-6 flex items-end">
          <Form.Item
            label={<span className="text-sm font-medium">Estado</span>}
            className="mb-1"
          >
            <Switch
              className="switch-field"
              checkedChildren="Activo"
              unCheckedChildren="Inactivo"
              checked={achievement.active}
              onChange={(checked) => onChange(index, "active", checked)}
            />
          </Form.Item>
        </div>
      </div>
    </Card>
  );
};

// Componente para la sección de logros
const AchievementsSection = ({
  achievements,
  onAchievementChange,
  onAddAchievement,
  onRemoveAchievement,
  setChangedAchievements,
}: {
  achievements: Achievement[];
  onAchievementChange: (
    index: number,
    field: keyof Achievement,
    value: any
  ) => void;
  onAddAchievement: () => void;
  onRemoveAchievement: (index: number) => void;
  setChangedAchievements: React.Dispatch<React.SetStateAction<Set<string>>>;
}) => {
  return (
    <div className="section-container">
      <div className="section-title">
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <TrophyOutlined /> Logros
            </Title>
          </Col>
          <Col>
            <Tooltip title="Los logros se mostrarán como estadísticas destacadas">
              <InfoCircleOutlined style={{ color: "#1890ff" }} />
            </Tooltip>
          </Col>
        </Row>
      </div>
      <div className="section-content">
        {achievements.map((achievement, index) => (
          <AchievementCard
            key={index}
            achievement={achievement}
            index={index}
            onRemove={onRemoveAchievement}
            onChange={onAchievementChange}
            setChangedAchievements={setChangedAchievements}
          />
        ))}

        <Button
          type="dashed"
          onClick={onAddAchievement}
          block
          icon={<PlusOutlined />}
          className="add-button"
          style={{ marginBottom: "24px" }}
        >
          Agregar Logro
        </Button>
      </div>
    </div>
  );
};

// Componente principal
const HighlightedServicesSettings = () => {
  const [services, setServices] = useState<HighlightedService[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [originalServices, setOriginalServices] = useState<
    HighlightedService[]
  >([]);
  const [originalAchievements, setOriginalAchievements] = useState<
    Achievement[]
  >([]);
  const [changedServices, setChangedServices] = useState<Set<string>>(
    new Set()
  );
  const [changedAchievements, setChangedAchievements] = useState<Set<string>>(
    new Set()
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  // Estados para el patrón diferido de subida
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [totalUploadProgress, setTotalUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: servicesData,
    isSuccess: servicesSuccess,
    isFetching: servicesFetching,
  } = useQuery({
    queryKey: ["highlighted-services"],
    queryFn: () => ConfigService.getHighlightedServices(),
  });

  const {
    data: achievementsData,
    isSuccess: achievementsSuccess,
    isFetching: achievementsFetching,
  } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => ConfigService.getAchievements(),
  });

  useEffect(() => {
    if (servicesSuccess && !servicesFetching && servicesData) {
      const servicesWithIds = (servicesData.data || []).map((service: any) => ({
        ...service,
        id: service._id || service.identifier,
      }));
      setServices(servicesWithIds);
      setOriginalServices(JSON.parse(JSON.stringify(servicesWithIds)));
      setChangedServices(new Set());
    }
  }, [servicesSuccess, servicesFetching, servicesData]);

  useEffect(() => {
    if (achievementsSuccess && !achievementsFetching && achievementsData) {
      const achievementsWithIds = (achievementsData.data || []).map(
        (achievement: any, index: number) => ({
          ...achievement,
          id: achievement._id || index.toString(),
          icon: achievement.icon_url, // Mapear icon_url a icon para que el componente pueda mostrar la imagen
        })
      );
      console.log("Logros recibidos del backend:", achievementsData.data);
      console.log("Logros mapeados con icon:", achievementsWithIds);
      setAchievements(achievementsWithIds);
      setOriginalAchievements(JSON.parse(JSON.stringify(achievementsWithIds)));
      setChangedAchievements(new Set());
    }
  }, [achievementsSuccess, achievementsFetching, achievementsData]);

  const createServiceMutation = useMutation({
    mutationFn: (service: HighlightedService) =>
      ConfigService.createHighlightedService(service),
    onSuccess: () => {
      message.success("Servicio creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["highlighted-services"] });
    },
    onError: (error) => {
      console.error("Error creating service:", error);
      message.error("Error al crear el servicio");
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({
      identifier,
      service,
      changedFields,
    }: {
      identifier: string;
      service: Partial<HighlightedService>;
      changedFields?: string[];
    }) =>
      ConfigService.updateHighlightedService(
        identifier,
        service,
        changedFields
      ),
    onSuccess: () => {
      message.success("Servicio actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["highlighted-services"] });
    },
    onError: (error) => {
      console.error("Error updating service:", error);
      message.error("Error al actualizar el servicio");
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (identifier: string) =>
      ConfigService.deleteHighlightedService(identifier),
    onSuccess: () => {
      message.success("Servicio eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["highlighted-services"] });
    },
    onError: (error) => {
      console.error("Error deleting service:", error);
      message.error("Error al eliminar el servicio");
    },
  });

  const createAchievementMutation = useMutation({
    mutationFn: (achievement: Achievement) => {
      // Las imágenes ya fueron subidas por uploadAllImages(), simplemente crear
      return ConfigService.createAchievement(achievement);
    },
    onSuccess: () => {
      message.success("Logro creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
    onError: (error) => {
      console.error("Error creating achievement:", error);
      message.error("Error al crear el logro");
    },
  });

  const updateAchievementMutation = useMutation({
    mutationFn: ({
      id,
      achievement,
      changedFields,
    }: {
      id: string;
      achievement: Partial<Achievement>;
      changedFields?: string[];
    }) => {
      // Las imágenes ya fueron subidas por uploadAllImages(), simplemente actualizar
      return ConfigService.updateAchievement(id, achievement, changedFields);
    },
    onSuccess: () => {
      message.success("Logro actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
    onError: (error) => {
      console.error("Error updating achievement:", error);
      message.error("Error al actualizar el logro");
    },
  });

  const deleteAchievementMutation = useMutation({
    mutationFn: (id: string) => ConfigService.deleteAchievement(id),
    onSuccess: () => {
      message.success("Logro eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
    onError: (error) => {
      console.error("Error deleting achievement:", error);
      message.error("Error al eliminar el logro");
    },
  });

  // Función para subir todas las imágenes pendientes a GCS
  const uploadAllImages = async () => {
    const imagesToUpload = [];

    // Función helper para verificar si una URL es de Google Cloud Storage
    const isGoogleCloudStorageUrl = (url: string): boolean => {
      return url.includes('storage.googleapis.com') || 
             url.includes('storage.cloud.google.com') ||
             url.includes('.googleusercontent.com');
    };

    // Recopilar servicios con imágenes pendientes
    services.forEach((service, index) => {
      if (service.imageFile) {
        // Solo incluir oldImageUrl si es realmente de GCS
        const oldImageUrl = service.image && 
                           service.image.startsWith('http') && 
                           isGoogleCloudStorageUrl(service.image) 
                           ? service.image 
                           : undefined;
        
        imagesToUpload.push({
          type: "service",
          index,
          file: service.imageFile,
          identifier: service.identifier || `service-${index}`,
          oldImageUrl,
        });
      }
    });

    // Recopilar logros con imágenes pendientes
    achievements.forEach((achievement, index) => {
      if (achievement.iconFile) {
        // Solo incluir oldImageUrl si es realmente de GCS
        const oldImageUrl = achievement.icon && 
                           achievement.icon.startsWith('http') && 
                           isGoogleCloudStorageUrl(achievement.icon) 
                           ? achievement.icon 
                           : undefined;
        
        imagesToUpload.push({
          type: "achievement",
          index,
          file: achievement.iconFile,
          identifier: achievement.id || `achievement-${index}`,
          oldImageUrl,
        });
      }
    });

    if (imagesToUpload.length === 0) {
      return { updatedServices: services, updatedAchievements: achievements };
    }

    try {
      setIsProcessing(true);
      setUploadProgress({});

      const updatedServices = [...services];
      const updatedAchievements = [...achievements];
      let completedUploads = 0;

      console.log(`🔄 Subiendo ${imagesToUpload.length} imágenes a GCS...`);

      // Subir cada imagen individualmente con progreso
      for (const { type, index, file, identifier, oldImageUrl } of imagesToUpload) {
        try {
          setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

          // Eliminar imagen anterior si existe (solo al confirmar guardado)
          if (oldImageUrl) {
            try {
              console.log(`🗑️ Eliminando imagen anterior de GCS antes de subir nueva: ${oldImageUrl}`);
              const deleteResult = await StorageService.deleteFileByUrl(oldImageUrl);
              if (deleteResult.success) {
                console.log(`✅ Imagen anterior eliminada exitosamente de GCS`);
              } else {
                console.warn(`⚠️ La imagen anterior no pudo ser eliminada de GCS:`, deleteResult.message);
              }
            } catch (error: any) {
              console.error('❌ Error al eliminar imagen anterior de GCS:', {
                error: error.message || error,
                status: error.response?.status,
                data: error.response?.data
              });
              // Continuar con la subida de la nueva imagen aunque falle la eliminación
              console.log('⚠️ Continuando con la subida de la nueva imagen...');
            }
          }

          // Determinar carpeta según el tipo
          const folder =
            type === "service"
              ? "settings/highlighted-services"
              : "settings/achievements";

          const uploadResponse = await StorageService.uploadSingleFile(
            file,
            folder
          );

          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

          if (uploadResponse.success && uploadResponse.data) {
            if (type === "service") {
              updatedServices[index] = {
                ...updatedServices[index],
                image: uploadResponse.data.url,
                imageFile: undefined, // Limpiar el archivo después de subir
              };
            } else {
              updatedAchievements[index] = {
                ...updatedAchievements[index],
                icon: uploadResponse.data.url,
                icon_url: uploadResponse.data.url,
                iconFile: undefined, // Limpiar el archivo después de subir
              };
            }

            completedUploads++;
            console.log(
              `✅ Imagen subida: ${file.name} -> ${uploadResponse.data.url}`
            );
          }
        } catch (error) {
          console.error(`❌ Error subiendo ${file.name}:`, error);
          message.error(`Error al subir ${file.name}`);
        }

        // Actualizar progreso total
        setTotalUploadProgress(
          Math.round((completedUploads / imagesToUpload.length) * 100)
        );
      }

      console.log(
        `✅ ${completedUploads}/${imagesToUpload.length} imágenes subidas exitosamente`
      );
      return { updatedServices, updatedAchievements };
    } catch (error) {
      console.error("Error general en subida de imágenes:", error);
      throw error;
    } finally {
      // Limpiar progreso al final
      setTimeout(() => {
        setUploadProgress({});
        setTotalUploadProgress(0);
        setIsProcessing(false);
      }, 2000);
    }
  };

  const handleSubmit = async () => {
    console.log("=== SUBMIT DEBUG ===");
    console.log("Changed services:", Array.from(changedServices));
    console.log("Changed achievements:", Array.from(changedAchievements));

    // Check if there are any new or changed items to process
    const newServices = services.filter(
      (s) => !s.identifier || s.identifier.startsWith("temp-")
    );
    const newAchievements = achievements.filter(
      (a) => !a.id || a.id.startsWith("temp-")
    );

    if (
      changedServices.size === 0 &&
      changedAchievements.size === 0 &&
      newServices.length === 0 &&
      newAchievements.length === 0
    ) {
      console.log("No changes detected, nothing to submit");
      message.info("No se detectaron cambios");
      return;
    }

    // Check for duplicate IDs in arrays
    const serviceIds = new Set<string>();
    const duplicateServices = services
      .filter((s) => s.identifier && !s.identifier.startsWith("temp-"))
      .filter((s) => {
        if (serviceIds.has(s.identifier!)) return true;
        serviceIds.add(s.identifier!);
        return false;
      });

    const achievementIds = new Set<string>();
    const duplicateAchievements = achievements
      .filter((a) => a.id && !a.id.startsWith("temp-"))
      .filter((a) => {
        if (achievementIds.has(a.id!)) return true;
        achievementIds.add(a.id!);
        return false;
      });

    if (duplicateServices.length > 0 || duplicateAchievements.length > 0) {
      console.error("Duplicate items detected:", {
        services: duplicateServices.map((s) => s.identifier),
        achievements: duplicateAchievements.map((a) => a.id),
      });
      message.error("Error: Se detectaron elementos duplicados");
      return;
    }

    setSubmitting(true);
    const processedServices = new Set<string>();
    const processedAchievements = new Set<string>();
    let changesMade = false;

    try {
      // Subir todas las imágenes pendientes a GCS usando el nuevo patrón
      const { updatedServices, updatedAchievements } = await uploadAllImages();

      // Actualizar los estados con las URLs de GCS
      setServices(updatedServices);
      setAchievements(updatedAchievements);

      // Usar las versiones actualizadas para el resto del proceso
      const currentServices = updatedServices;
      const currentAchievements = updatedAchievements;

      // El procesamiento de imágenes ya se hizo en uploadAllImages()

      // Process new services first (usar currentServices)
      const newCurrentServices = currentServices.filter(
        (s) => !s.identifier || s.identifier.startsWith("temp-")
      );
      for (const service of newCurrentServices) {
        const newService = { ...service };
        if (newService.identifier?.startsWith("temp-")) {
          delete newService.identifier;
        }
        console.log("Creating new service:", newService.title);
        await new Promise((resolve, reject) => {
          createServiceMutation.mutate(newService, {
            onSuccess: () => {
              changesMade = true;
              resolve(undefined);
            },
            onError: reject,
          });
        });
      }

      // Then process changed services
      for (const serviceId of changedServices) {
        const service = currentServices.find((s) => s.identifier === serviceId);
        if (!service) {
          console.log(`Service ${serviceId} not found in current list`);
          continue;
        }

        const original = originalServices.find(
          (s) => s.identifier === serviceId
        );
        if (!original) {
          console.log(`Original service ${serviceId} not found`);
          continue;
        }

        const changedFields: string[] = [];
        Object.keys(service).forEach((key) => {
          if (
            key !== "id" &&
            JSON.stringify(service[key as keyof HighlightedService]) !==
              JSON.stringify(original[key as keyof HighlightedService])
          ) {
            changedFields.push(key);
          }
        });

        if (changedFields.length > 0) {
          console.log(`Updating service ${serviceId}, fields:`, changedFields);
          await new Promise((resolve, reject) => {
            updateServiceMutation.mutate(
              {
                identifier: serviceId,
                service,
                changedFields,
              },
              {
                onSuccess: () => {
                  changesMade = true;
                  resolve(undefined);
                },
                onError: reject,
              }
            );
          });
        } else {
          console.log(`No actual changes for service ${serviceId}`);
        }
      }

      // Process new achievements (usar currentAchievements)
      const newCurrentAchievements = currentAchievements.filter(
        (a) => !a.id || a.id.startsWith("temp-")
      );
      for (const achievement of newCurrentAchievements) {
        console.log("Creating new achievement:", achievement.title);

        // Crear copia sin el archivo de imagen ya que ya subimos la imagen
        const achievementToSend = { ...achievement };
        delete achievementToSend.iconFile;

        await new Promise((resolve, reject) => {
          createAchievementMutation.mutate(achievementToSend, {
            onSuccess: () => {
              changesMade = true;
              resolve(undefined);
            },
            onError: reject,
          });
        });
      }

      // Process changed achievements
      for (const achievementId of changedAchievements) {
        const achievement = currentAchievements.find(
          (a) => a.id === achievementId
        );
        if (!achievement) {
          console.log(`Achievement ${achievementId} not found in current list`);
          continue;
        }

        const original = originalAchievements.find(
          (a) => a.id === achievementId
        );
        if (!original) {
          console.log(`Original achievement ${achievementId} not found`);
          continue;
        }

        const changedFields: string[] = [];
        Object.keys(achievement).forEach((key) => {
          if (
            key !== "id" &&
            key !== "_id" &&
            key !== "iconFile" &&
            JSON.stringify(achievement[key as keyof Achievement]) !==
              JSON.stringify(original[key as keyof Achievement])
          ) {
            changedFields.push(key);
          }
        });

        // Verificar específicamente si la imagen ha cambiado
        if (achievement.icon !== original.icon) {
          if (!changedFields.includes("icon")) {
            changedFields.push("icon");
          }
          console.log(
            `Detectado cambio en la imagen del logro ${achievementId}`
          );
        }

        if (changedFields.length > 0) {
          console.log(
            `Updating achievement ${achievementId}, fields:`,
            changedFields
          );

          // Eliminar el archivo de imagen ya que ya subimos la imagen
          const achievementToSend = { ...achievement };
          delete achievementToSend.iconFile;

          await new Promise((resolve, reject) => {
            updateAchievementMutation.mutate(
              {
                id: achievementId,
                achievement: achievementToSend,
                changedFields,
              },
              {
                onSuccess: (data) => {
                  console.log(
                    `Logro ${achievementId} actualizado exitosamente:`,
                    data
                  );
                  changesMade = true;
                  resolve(undefined);
                },
                onError: (error) => {
                  console.error(
                    `Error al actualizar logro ${achievementId}:`,
                    error
                  );
                  reject(error);
                },
              }
            );
          });
        } else {
          console.log(`No actual changes for achievement ${achievementId}`);
        }
      }

      // Clear change tracking after successful submission
      setChangedServices(new Set());
      setChangedAchievements(new Set());

      if (changesMade) {
        message.success("Cambios guardados exitosamente");
      } else {
        message.info("No se realizaron cambios");
      }
    } catch (error) {
      console.error("Error during submit:", error);
      message.error("Error al guardar los cambios");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAchievementChange = (
    index: number,
    field: keyof Achievement,
    value: any
  ) => {
    const newAchievements = [...achievements];
    const oldValue = newAchievements[index][field];
    newAchievements[index] = { ...newAchievements[index], [field]: value };
    setAchievements(newAchievements);

    // Only mark as changed if it has a real id and the value actually changed
    if (
      newAchievements[index].id &&
      !newAchievements[index].id.startsWith("temp-")
    ) {
      const original = originalAchievements.find(
        (a) => a.id === newAchievements[index].id
      );

      // Para cambios de imagen, marcar siempre como cambiado
      if (field === "icon" || field === "iconFile") {
        console.log(
          `Achievement ${
            newAchievements[index].id
          } marked as changed (image field: ${String(field)})`
        );
        setChangedAchievements(
          (prev) => new Set([...prev, newAchievements[index].id!])
        );
        return;
      }

      // Verificar si el valor realmente cambió
      let valueChanged = false;

      if (original) {
        try {
          // Comparar valores primitivos o convertir objetos a JSON para comparación
          const originalValue = original[field];

          if (typeof value !== typeof originalValue) {
            valueChanged = true;
          } else if (typeof value === "object" && value !== null) {
            valueChanged =
              JSON.stringify(value) !== JSON.stringify(originalValue);
          } else {
            valueChanged = value !== originalValue;
          }

          if (valueChanged) {
            setChangedAchievements(
              (prev) => new Set([...prev, newAchievements[index].id!])
            );
            console.log(
              `Achievement ${
                newAchievements[index].id
              } marked as changed (field: ${String(field)}, from:`,
              originalValue,
              "to:",
              value,
              ")"
            );
          } else {
            console.log(
              `No actual change for achievement ${
                newAchievements[index].id
              } (field: ${String(field)})`
            );
          }
        } catch (error) {
          console.error("Error comparing values:", error);
          // Si hay error en la comparación, marcarlo como cambiado por seguridad
          setChangedAchievements(
            (prev) => new Set([...prev, newAchievements[index].id!])
          );
        }
      }
    }
  };

  const handleAddAchievement = () => {
    setAchievements([
      ...achievements,
      {
        title: "",
        value: "",
        icon: "",
        color: "",
        active: true,
        order: achievements.length,
        id: `temp-${Date.now()}`, // Temporary ID for new items
      },
    ]);
  };

  const handleRemoveAchievement = (index: number) => {
    Modal.confirm({
      title: "¿Eliminar logro?",
      content: "Esta acción no se puede deshacer",
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        const achievement = achievements[index];
        
        // Función helper para verificar si una URL es de Google Cloud Storage
        const isGoogleCloudStorageUrl = (url: string): boolean => {
          return url.includes('storage.googleapis.com') || 
                 url.includes('storage.cloud.google.com') ||
                 url.includes('.googleusercontent.com');
        };
        
        // Eliminar imagen de GCS solo si es realmente de GCS
        if (achievement.icon && 
            achievement.icon.startsWith('http') && 
            isGoogleCloudStorageUrl(achievement.icon)) {
          try {
            console.log(`🗑️ Eliminando imagen de GCS al eliminar logro: ${achievement.icon}`);
            const deleteResult = await StorageService.deleteFileByUrl(achievement.icon);
            if (deleteResult.success) {
              console.log(`✅ Imagen eliminada exitosamente de GCS al eliminar logro`);
            } else {
              console.warn(`⚠️ La imagen no pudo ser eliminada de GCS al eliminar logro:`, deleteResult.message);
            }
          } catch (error: any) {
            console.error('❌ Error al eliminar imagen de GCS al eliminar logro:', {
              error: error.message || error,
              status: error.response?.status,
              data: error.response?.data
            });
            // Continuar con la eliminación del logro aunque falle la eliminación de la imagen
          }
        } else if (achievement.icon && achievement.icon.startsWith('http')) {
          console.log(`ℹ️ La imagen del logro ${achievement.icon} no es de GCS, no se eliminará del almacenamiento`);
        }
        
        if (achievement.id) {
          deleteAchievementMutation.mutate(achievement.id);
        } else {
          const newAchievements = [...achievements];
          newAchievements.splice(index, 1);
          setAchievements(newAchievements);
        }
      },
    });
  };

  const handleAddService = () => {
    setServices([
      ...services,
      {
        title: "",
        description: "",
        image: "",
        stats: [],
        active: true,
        order: services.length,
        identifier: `temp-${Date.now()}`, // Temporary identifier for new items
      },
    ]);
  };

  const handleRemoveService = (index: number) => {
    Modal.confirm({
      title: "¿Eliminar servicio?",
      content: "Esta acción no se puede deshacer",
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        const service = services[index];
        
        // Función helper para verificar si una URL es de Google Cloud Storage
        const isGoogleCloudStorageUrl = (url: string): boolean => {
          return url.includes('storage.googleapis.com') || 
                 url.includes('storage.cloud.google.com') ||
                 url.includes('.googleusercontent.com');
        };
        
        // Eliminar imagen de GCS solo si es realmente de GCS
        if (service.image && 
            service.image.startsWith('http') && 
            isGoogleCloudStorageUrl(service.image)) {
          try {
            console.log(`🗑️ Eliminando imagen de GCS al eliminar servicio: ${service.image}`);
            const deleteResult = await StorageService.deleteFileByUrl(service.image);
            if (deleteResult.success) {
              console.log(`✅ Imagen eliminada exitosamente de GCS al eliminar servicio`);
            } else {
              console.warn(`⚠️ La imagen no pudo ser eliminada de GCS al eliminar servicio:`, deleteResult.message);
            }
          } catch (error: any) {
            console.error('❌ Error al eliminar imagen de GCS al eliminar servicio:', {
              error: error.message || error,
              status: error.response?.status,
              data: error.response?.data
            });
            // Continuar con la eliminación del servicio aunque falle la eliminación de la imagen
          }
        } else if (service.image && service.image.startsWith('http')) {
          console.log(`ℹ️ La imagen del servicio ${service.image} no es de GCS, no se eliminará del almacenamiento`);
        }
        
        if (service.identifier) {
          deleteServiceMutation.mutate(service.identifier);
        } else {
          const newServices = [...services];
          newServices.splice(index, 1);
          setServices(newServices);
        }
      },
    });
  };

  const handleServiceChange = (
    index: number,
    field: keyof HighlightedService,
    value: any
  ) => {
    const newServices = [...services];
    const oldValue = newServices[index][field];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);

    // Only mark as changed if it has a real identifier and the value actually changed
    if (
      newServices[index].identifier &&
      !newServices[index].identifier.startsWith("temp-")
    ) {
      const original = originalServices.find(
        (s) => s.identifier === newServices[index].identifier
      );

      // Para cambios de imagen, marcar siempre como cambiado
      if (field === "image") {
        console.log(
          `Service ${newServices[index].identifier} marked as changed (image field)`
        );
        setChangedServices(
          (prev) => new Set([...prev, newServices[index].identifier!])
        );
        return;
      }

      // Verificar si el valor realmente cambió
      let valueChanged = false;

      if (original) {
        try {
          // Comparar valores primitivos o convertir objetos a JSON para comparación
          const originalValue = original[field];

          if (typeof value !== typeof originalValue) {
            valueChanged = true;
          } else if (typeof value === "object" && value !== null) {
            valueChanged =
              JSON.stringify(value) !== JSON.stringify(originalValue);
          } else {
            valueChanged = value !== originalValue;
          }

          if (valueChanged) {
            setChangedServices(
              (prev) => new Set([...prev, newServices[index].identifier!])
            );
            console.log(
              `Service ${
                newServices[index].identifier
              } marked as changed (field: ${String(field)}, from:`,
              originalValue,
              "to:",
              value,
              ")"
            );
          } else {
            console.log(
              `No actual change for service ${
                newServices[index].identifier
              } (field: ${String(field)})`
            );
          }
        } catch (error) {
          console.error("Error comparing values:", error);
          // Si hay error en la comparación, marcarlo como cambiado por seguridad
          setChangedServices(
            (prev) => new Set([...prev, newServices[index].identifier!])
          );
        }
      }
    }
  };

  return (
    <div className="highlighted-services-container">
      <ServicesSection
        services={services}
        onServiceChange={handleServiceChange}
        onAddService={handleAddService}
        onRemoveService={handleRemoveService}
      />

      <AchievementsSection
        achievements={achievements}
        onAchievementChange={handleAchievementChange}
        onAddAchievement={handleAddAchievement}
        onRemoveAchievement={handleRemoveAchievement}
        setChangedAchievements={setChangedAchievements}
      />

      {/* Progreso de subida de imágenes */}
      {isProcessing && Object.keys(uploadProgress).length > 0 && (
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
      )}

      <Row justify="center" style={{ marginTop: "32px", marginBottom: "48px" }}>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={
            submitting ||
            updateServiceMutation.isPending ||
            updateAchievementMutation.isPending ||
            createServiceMutation.isPending ||
            createAchievementMutation.isPending ||
            isProcessing
          }
          icon={isProcessing ? <LoadingOutlined /> : <SaveOutlined />}
          size="large"
          className="save-button"
          disabled={isProcessing}
        >
          {isProcessing
            ? "Subiendo imágenes a GCS..."
            : submitting
            ? "Guardando..."
            : "Guardar Cambios"}
        </Button>
      </Row>
    </div>
  );
};

export default HighlightedServicesSettings;
