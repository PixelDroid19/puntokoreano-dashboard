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
  Tooltip
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  LoadingOutlined,
  SaveOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RcFile } from "antd/es/upload";
import ConfigService from "../../services/config.service";
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
  stats?: HighlightedServiceStat[];
  active?: boolean;
  order?: number;
  identifier?: string;
}

interface Achievement {
  title: string;
  value: string;
  icon: string; // URL de la imagen del icono
  iconFile?: File; // Archivo para subida
  color: string;
  active: boolean;
  order: number;
  id?: string;
}

// Componente para subir imágenes
const UploadComponent = ({
  value,
  onChange,
  label,
  required = false,
  maxSize = 2, // tamaño máximo en MB
  dimensions = { width: 300, height: 300 }, // dimensiones por defecto
}: {
  value?: string;
  onChange?: (url: string | undefined, file?: File) => void;
  label: string;
  required?: boolean;
  maxSize?: number;
  dimensions?: { width: number; height: number };
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: RcFile) => {
    try {
      const isValidFileType = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"].includes(
        file.type
      );
      const isValidFileSize = file.size / 1024 / 1024 < maxSize;

      if (!isValidFileType) {
        message.error(`Por favor, sube un archivo de imagen (JPG, PNG, GIF, SVG)`);
        return Upload.LIST_IGNORE;
      }

      if (!isValidFileSize) {
        message.error(`La imagen debe ser menor a ${maxSize}MB`);
        return Upload.LIST_IGNORE;
      }

      setLoading(true);
      
      // Para SVG no validamos dimensiones
      if (file.type !== "image/svg+xml") {
        const image = new Image();
        image.src = URL.createObjectURL(file);
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = (err) => reject(err);
        });
        
        URL.revokeObjectURL(image.src);
      }

      const url = await ConfigService.uploadImage(file);

      if (!url) {
        throw new Error("No se recibió URL del servicio de carga");
      }

      setPreviewUrl(url);
      onChange?.(url, file);
      return false;
    } catch (error) {
      console.error("Error de carga:", error);
      message.error("Error al subir la imagen");
      return Upload.LIST_IGNORE;
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(undefined);
    onChange?.(undefined);
  };

  return (
    <Form.Item label={label} required={required} className="upload-component">
      <Upload
        listType="picture-card"
        showUploadList={false}
        beforeUpload={handleUpload}
      >
        {previewUrl ? (
          <div className="preview-container">
            <img
              src={previewUrl}
              alt="Vista previa"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div className="preview-actions">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Subir</div>
          </div>
        )}
      </Upload>
    </Form.Item>
  );
};

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
  onChange: (index: number, field: keyof HighlightedService, value: any) => void;
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
                  <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                </Tooltip>
              }
            />
          </Form.Item>
        </div>
        <div className="md:col-span-6">
          <Form.Item
            label="Identificador"
            required
            validateStatus={!service.identifier || !/^[a-z0-9-]+$/.test(service.identifier) ? "error" : ""}
            help={!service.identifier ? "El identificador es requerido" : !/^[a-z0-9-]+$/.test(service.identifier) ? "Solo letras minúsculas, números y guiones" : ""}
            className="mb-3"
          >
            <Input
              className="input-field"
              placeholder="ejemplo-de-identificador"
              value={service.identifier}
              onChange={(e) => onChange(index, "identifier", e.target.value)}
              suffix={
                <Tooltip title="Debe ser único y solo contener letras minúsculas, números y guiones">
                  <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
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
            <UploadComponent
              value={service.image}
              onChange={(url) => onChange(index, "image", url)}
              label=""
              required={true}
            />
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
                  style={{ width: '100%' }}
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
  onServiceChange: (index: number, field: keyof HighlightedService, value: any) => void;
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
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
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
          style={{ marginBottom: '24px' }}
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
}: {
  achievement: Achievement;
  index: number;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof Achievement, value: any) => void;
  onIconFileChange?: (index: number, file: File) => void;
}) => {
  const handleIconChange = (url: string | undefined, file?: File) => {
    onChange(index, "icon", url || "");
    if (file) {
      const updatedAchievement = { ...achievement, iconFile: file };
      onChange(index, "iconFile", file);
    }
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
                backgroundColor: achievement.color ? `${achievement.color}20` : 'white' 
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
              style={{ width: '100%' }}
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
                <Tooltip title="Formatos: JPG, PNG, GIF, SVG. Máx. 1MB. Tamaño recomendado: 64x64px">
                  <InfoCircleOutlined className="ml-1 text-blue-500" />
                </Tooltip>
              </span>
            }
            required
            validateStatus={!achievement.icon ? "error" : ""}
            help={!achievement.icon ? "El ícono es requerido" : ""}
            className="mb-1"
          >
            <UploadComponent
              value={achievement.icon}
              onChange={handleIconChange}
              label=""
              required={true}
              maxSize={1}
              dimensions={{ width: 64, height: 64 }}
            />
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
}: {
  achievements: Achievement[];
  onAchievementChange: (index: number, field: keyof Achievement, value: any) => void;
  onAddAchievement: () => void;
  onRemoveAchievement: (index: number) => void;
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
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
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
          />
        ))}

        <Button
          type="dashed"
          onClick={onAddAchievement}
          block
          icon={<PlusOutlined />}
          className="add-button"
          style={{ marginBottom: '24px' }}
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
      setServices(servicesData.data || []);
    }
  }, [servicesSuccess, servicesFetching, servicesData]);

  useEffect(() => {
    if (achievementsSuccess && !achievementsFetching && achievementsData) {
      setAchievements(achievementsData.data || []);
    }
  }, [achievementsSuccess, achievementsFetching, achievementsData]);

  const createServiceMutation = useMutation({
    mutationFn: (service: HighlightedService) => ConfigService.createHighlightedService(service),
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
    mutationFn: ({ identifier, service }: { identifier: string; service: Partial<HighlightedService> }) =>
      ConfigService.updateHighlightedService(identifier, service),
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
    mutationFn: (identifier: string) => ConfigService.deleteHighlightedService(identifier),
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
    mutationFn: async (achievement: Achievement) => {
      // Si tenemos un archivo de icono, primero lo subimos
      if (achievement.iconFile) {
        const iconUrl = await ConfigService.uploadImage(achievement.iconFile);
        return ConfigService.createAchievement({
          ...achievement,
          icon: iconUrl,
        });
      }
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
    mutationFn: async ({ id, achievement }: { id: string; achievement: Partial<Achievement> }) => {
      // Si tenemos un archivo de icono, primero lo subimos
      if (achievement.iconFile) {
        const iconUrl = await ConfigService.uploadImage(achievement.iconFile);
        return ConfigService.updateAchievement(id, {
          ...achievement,
          icon: iconUrl,
        });
      }
      return ConfigService.updateAchievement(id, achievement);
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

  const handleSubmit = () => {
    // Update services
    services.forEach((service) => {
      if (service.identifier) {
        updateServiceMutation.mutate({
          identifier: service.identifier,
          service,
        });
      } else {
        createServiceMutation.mutate(service);
      }
    });

    // Update achievements
    achievements.forEach((achievement) => {
      if (achievement.id) {
        updateAchievementMutation.mutate({
          id: achievement.id,
          achievement,
        });
      } else {
        createAchievementMutation.mutate(achievement);
      }
    });
  };

  const handleAchievementChange = (index: number, field: keyof Achievement, value: any) => {
    const newAchievements = [...achievements];
    newAchievements[index] = { ...newAchievements[index], [field]: value };
    setAchievements(newAchievements);
  };

  const handleAddAchievement = () => {
    setAchievements([...achievements, {
      title: "",
      value: "",
      icon: "",
      color: "",
      active: true,
      order: achievements.length,
    }]);
  };

  const handleRemoveAchievement = (index: number) => {
    Modal.confirm({
      title: "¿Eliminar logro?",
      content: "Esta acción no se puede deshacer",
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: () => {
        const achievement = achievements[index];
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
    setServices([...services, {
      title: "",
      description: "",
      image: "",
      stats: [],
      active: true,
      order: services.length,
      identifier: "",
    }]);
  };

  const handleRemoveService = (index: number) => {
    Modal.confirm({
      title: "¿Eliminar servicio?",
      content: "Esta acción no se puede deshacer",
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: () => {
        const service = services[index];
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

  const handleServiceChange = (index: number, field: keyof HighlightedService, value: any) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);
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
      />

      <Row justify="center" style={{ marginTop: '32px', marginBottom: '48px' }}>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={updateServiceMutation.isPending || updateAchievementMutation.isPending || createServiceMutation.isPending || createAchievementMutation.isPending}
          icon={<SaveOutlined />}
          size="large"
          className="save-button"
        >
          Guardar Cambios
        </Button>
      </Row>
    </div>
  );
};

export default HighlightedServicesSettings;