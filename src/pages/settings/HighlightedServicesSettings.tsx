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
import UploadComponent from "../../components/buttons/UploadComponent";

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
  icon_url?: string; // URL de la imagen en el backend
  iconFile?: File; // Archivo para subida
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
  
    const handleIconChange = (url: string | undefined, file?: File) => {
    // Si recibimos una URL vacía, significa que es una vista previa local
    if (url === "" && file) {
      // Crear una URL local para vista previa
      const objectUrl = URL.createObjectURL(file);
      setLocalPreviewUrl(objectUrl);
      
      // Guardar el archivo para subida posterior
      onChange(index, "iconFile", file);
      // No actualizar el campo icon todavía, se hará al guardar
      
      // Marcar el elemento como cambiado inmediatamente
      if (achievement.id && !achievement.id.startsWith('temp-') && setChangedAchievements) {
        console.log(`Marcando logro ${achievement.id} como modificado al cambiar imagen (vista previa)`);
        setChangedAchievements(prev => new Set([...prev, achievement.id!]));
      }
    } else {
      // Si es una URL real o undefined, actualizar normalmente
      setLocalPreviewUrl(undefined);
      onChange(index, "icon", url || "");
      onChange(index, "icon_url", url || ""); // También actualizar icon_url
      if (file) {
        onChange(index, "iconFile", file);
        
        // Marcar el elemento como cambiado inmediatamente
        if (achievement.id && !achievement.id.startsWith('temp-') && setChangedAchievements) {
          console.log(`Marcando logro ${achievement.id} como modificado al cambiar imagen (URL directa)`);
          setChangedAchievements(prev => new Set([...prev, achievement.id!]));
        }
      } else if (url === undefined) {
        // Si estamos eliminando la imagen, también eliminar el archivo
        onChange(index, "iconFile", undefined);
        onChange(index, "icon_url", ""); // También actualizar icon_url
        console.log(`Eliminando imagen del logro ${achievement.title}`);
        
        // Marcar el elemento como cambiado inmediatamente
        if (achievement.id && !achievement.id.startsWith('temp-') && setChangedAchievements) {
          console.log(`Marcando logro ${achievement.id} como modificado al eliminar imagen`);
          setChangedAchievements(prev => new Set([...prev, achievement.id!]));
        }
      }
    }
  };
  
  // Función para eliminar explícitamente la imagen
  const handleDeleteImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalPreviewUrl(undefined);
    onChange(index, "icon", "");
    onChange(index, "icon_url", ""); // También actualizar icon_url
    onChange(index, "iconFile", undefined);
    console.log(`Imagen eliminada del logro ${achievement.title}`);
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
            <div className="upload-with-actions">
              <UploadComponent
                value={localPreviewUrl || achievement.icon}
                onChange={handleIconChange}
                label=""
                required={true}
                maxSize={1}
                dimensions={{ width: 64, height: 64 }}
                allowedDimensions={[
                  { width: 64, height: 64 },
                  { width: 48, height: 48 }
                ]}
                validateDimensions={true}
                immediateUpload={false}
              />
              {(localPreviewUrl || achievement.icon) && (
                <Button 
                  type="primary" 
                  danger 
                  icon={<DeleteOutlined />} 
                  size="small"
                  onClick={handleDeleteImage}
                  style={{ marginTop: '8px' }}
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
  onAchievementChange: (index: number, field: keyof Achievement, value: any) => void;
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
            setChangedAchievements={setChangedAchievements}
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
  const [originalServices, setOriginalServices] = useState<HighlightedService[]>([]);
  const [originalAchievements, setOriginalAchievements] = useState<Achievement[]>([]);
  const [changedServices, setChangedServices] = useState<Set<string>>(new Set());
  const [changedAchievements, setChangedAchievements] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
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
        id: service._id || service.identifier
      }));
      setServices(servicesWithIds);
      setOriginalServices(JSON.parse(JSON.stringify(servicesWithIds)));
      setChangedServices(new Set());
    }
  }, [servicesSuccess, servicesFetching, servicesData]);

  useEffect(() => {
    if (achievementsSuccess && !achievementsFetching && achievementsData) {
      const achievementsWithIds = (achievementsData.data || []).map((achievement: any, index: number) => ({
        ...achievement,
        id: achievement._id || index.toString(),
        icon: achievement.icon_url // Mapear icon_url a icon para que el componente pueda mostrar la imagen
      }));
      console.log('Logros recibidos del backend:', achievementsData.data);
      console.log('Logros mapeados con icon:', achievementsWithIds);
      setAchievements(achievementsWithIds);
      setOriginalAchievements(JSON.parse(JSON.stringify(achievementsWithIds)));
      setChangedAchievements(new Set());
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
    mutationFn: ({ identifier, service, changedFields }: { identifier: string; service: Partial<HighlightedService>; changedFields?: string[] }) =>
      ConfigService.updateHighlightedService(identifier, service, changedFields),
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
    mutationFn: async ({ id, achievement, changedFields }: { id: string; achievement: Partial<Achievement>; changedFields?: string[] }) => {
      // Si tenemos un archivo de icono, primero lo subimos
      if (achievement.iconFile) {
        const iconUrl = await ConfigService.uploadImage(achievement.iconFile);
        return ConfigService.updateAchievement(id, {
          ...achievement,
          icon: iconUrl,
        }, changedFields);
      }
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

  const handleSubmit = async () => {
    console.log('=== SUBMIT DEBUG ===');
    console.log('Changed services:', Array.from(changedServices));
    console.log('Changed achievements:', Array.from(changedAchievements));
    
    // Check if there are any new or changed items to process
    const newServices = services.filter(s => !s.identifier || s.identifier.startsWith('temp-'));
    const newAchievements = achievements.filter(a => !a.id || a.id.startsWith('temp-'));
    
    // Identificar logros con imágenes pendientes de subir o eliminar
    const achievementsWithPendingImages = achievements.filter(a => 
      // Imágenes nuevas para subir
      (a.iconFile && (!a.icon || a.icon === "" || !a.icon.startsWith('http'))) || 
      // Imágenes para eliminar (icon vacío pero tenía una imagen antes)
      (a.icon === "" && originalAchievements.find(orig => orig.id === a.id)?.icon) ||
      // También verificar si la URL de la imagen ha cambiado
      (a.icon && a.id && originalAchievements.find(orig => orig.id === a.id)?.icon !== a.icon)
    );
    
    // Marcar como cambiados todos los elementos que tienen imágenes pendientes
    achievementsWithPendingImages.forEach(achievement => {
      if (achievement.id && !achievement.id.startsWith('temp-')) {
        setChangedAchievements(prev => new Set([...prev, achievement.id!]));
        console.log(`Marcando logro ${achievement.id} como modificado por tener imagen pendiente`);
      }
    });
    
    console.log('Logros con imágenes pendientes:', achievementsWithPendingImages);
    
    if (changedServices.size === 0 && changedAchievements.size === 0 && 
        newServices.length === 0 && newAchievements.length === 0 &&
        achievementsWithPendingImages.length === 0) {
      console.log('No changes detected, nothing to submit');
      message.info('No se detectaron cambios');
      return;
    }
    
    // Verificar explícitamente si hay cambios en las imágenes
    let imageChangesDetected = false;
    for (const achievement of achievements) {
      if (achievement.id && !achievement.id.startsWith('temp-')) {
        const original = originalAchievements.find(a => a.id === achievement.id);
        if (original && original.icon !== achievement.icon) {
          imageChangesDetected = true;
          console.log(`Cambio de imagen detectado en logro ${achievement.id}: ${original.icon} -> ${achievement.icon}`);
          // Asegurarse de que este logro esté marcado como cambiado
          setChangedAchievements(prev => new Set([...prev, achievement.id!]));
        }
      }
    }
    
    if (imageChangesDetected) {
      console.log('Se detectaron cambios en imágenes');
    }
    
    // Check for duplicate IDs in arrays
    const serviceIds = new Set<string>();
    const duplicateServices = services
      .filter(s => s.identifier && !s.identifier.startsWith('temp-'))
      .filter(s => {
        if (serviceIds.has(s.identifier!)) return true;
        serviceIds.add(s.identifier!);
        return false;
      });
      
    const achievementIds = new Set<string>();
    const duplicateAchievements = achievements
      .filter(a => a.id && !a.id.startsWith('temp-'))
      .filter(a => {
        if (achievementIds.has(a.id!)) return true;
        achievementIds.add(a.id!);
        return false;
      });
    
    if (duplicateServices.length > 0 || duplicateAchievements.length > 0) {
      console.error('Duplicate items detected:', {
        services: duplicateServices.map(s => s.identifier),
        achievements: duplicateAchievements.map(a => a.id)
      });
      message.error('Error: Se detectaron elementos duplicados');
      return;
    }
    
    setSubmitting(true);
    const processedServices = new Set<string>();
    const processedAchievements = new Set<string>();
    let changesMade = false;

    try {
            // Primero subir todas las imágenes pendientes
      if (achievementsWithPendingImages.length > 0) {
        setUploadingImages(true);
        message.loading('Procesando imágenes...', 0);
        
        const updatedAchievements = [...achievements];
        let achievementsToUpdate = []; // Array para almacenar los logros que necesitan actualizarse en el backend
        
        for (const achievement of achievementsWithPendingImages) {
          const index = updatedAchievements.findIndex(a => 
            (a.id && a.id === achievement.id) || 
            (!a.id && a.title === achievement.title)
          );
          
          if (index === -1) continue;
          
          // Caso 1: Subir nueva imagen
          if (achievement.iconFile) {
            try {
              console.log(`Subiendo imagen para logro: ${achievement.title}`);
              const imageUrl = await ConfigService.uploadImage(achievement.iconFile);
              
                          if (imageUrl) {
              updatedAchievements[index] = {
                ...updatedAchievements[index],
                icon: imageUrl,
                icon_url: imageUrl // Asegurarse de que también se actualice icon_url para mantener consistencia
              };
              console.log(`Imagen subida exitosamente: ${imageUrl}`);
              
              // Marcar el elemento como cambiado para que se detecte al guardar
              if (achievement.id && !achievement.id.startsWith('temp-')) {
                setChangedAchievements(prev => new Set([...prev, achievement.id!]));
                console.log(`Marcando logro ${achievement.id} como modificado después de subir imagen`);
                
                // Agregar a la lista de logros para actualizar en el backend
                achievementsToUpdate.push({
                  id: achievement.id,
                  achievement: { 
                    ...updatedAchievements[index],
                    icon_url: imageUrl // Asegurarse de que se envía icon_url al backend
                  },
                  changedFields: ['icon', 'icon_url'] // Especificar que han cambiado ambos campos
                });
              }
            }
            } catch (error) {
              console.error(`Error al subir imagen para ${achievement.title}:`, error);
              message.error(`Error al subir imagen para ${achievement.title}`);
            }
          } 
          // Caso 2: Eliminar imagen existente
          else if (achievement.icon === "") {
            console.log(`Eliminando imagen del logro: ${achievement.title}`);
            // La eliminación real ocurre en el backend, aquí solo aseguramos que se envía el valor vacío
            updatedAchievements[index] = {
              ...updatedAchievements[index],
              icon: "",
              icon_url: "" // También actualizar icon_url para mantener consistencia
            };
            
            // Marcar como cambiado si no lo está ya
            if (achievement.id && !changedAchievements.has(achievement.id)) {
              setChangedAchievements(prev => new Set([...prev, achievement.id!]));
              
              // Agregar a la lista de logros para actualizar en el backend
              achievementsToUpdate.push({
                id: achievement.id,
                achievement: { 
                  ...updatedAchievements[index],
                  icon_url: "" // Asegurarse de que se envía icon_url vacío al backend
                },
                changedFields: ['icon', 'icon_url'] // Especificar que han cambiado ambos campos
              });
            }
          }
        }
        
        setAchievements(updatedAchievements);
        message.destroy();
        setUploadingImages(false);
        
        // Actualizar inmediatamente los logros con imágenes en el backend
        if (achievementsToUpdate.length > 0) {
          console.log(`Actualizando ${achievementsToUpdate.length} logros con imágenes en el backend:`, achievementsToUpdate);
          
          // Actualizar cada logro en el backend
          for (const { id, achievement, changedFields } of achievementsToUpdate) {
            try {
              await new Promise((resolve, reject) => {
                updateAchievementMutation.mutate({
                  id,
                  achievement,
                  changedFields
                }, {
                  onSuccess: () => {
                    console.log(`Logro ${id} actualizado exitosamente en el backend`);
                    resolve(undefined);
                  },
                  onError: (error) => {
                    console.error(`Error al actualizar logro ${id} en el backend:`, error);
                    reject(error);
                  }
                });
              });
            } catch (error) {
              console.error(`Error al actualizar logro ${id}:`, error);
              message.error(`Error al actualizar logro con ID ${id}`);
            }
          }
          
          // Limpiar el conjunto de logros cambiados después de actualizarlos
          setChangedAchievements(new Set());
          message.success('Imágenes guardadas exitosamente');
          
          // Recargar los datos para asegurar que todo esté sincronizado
          queryClient.invalidateQueries({ queryKey: ["achievements"] });
        }
      }

      // Process new services first
      for (const service of newServices) {
        const newService = { ...service };
        if (newService.identifier?.startsWith('temp-')) {
          delete newService.identifier;
        }
        console.log('Creating new service:', newService.title);
        await new Promise((resolve, reject) => {
          createServiceMutation.mutate(newService, {
            onSuccess: () => {
              changesMade = true;
              resolve(undefined);
            },
            onError: reject
          });
        });
      }

      // Then process changed services
      for (const serviceId of changedServices) {
        const service = services.find(s => s.identifier === serviceId);
        if (!service) {
          console.log(`Service ${serviceId} not found in current list`);
          continue;
        }
        
        const original = originalServices.find(s => s.identifier === serviceId);
        if (!original) {
          console.log(`Original service ${serviceId} not found`);
          continue;
        }
        
        const changedFields: string[] = [];
        Object.keys(service).forEach(key => {
          if (key !== 'id' && JSON.stringify(service[key as keyof HighlightedService]) !== 
              JSON.stringify(original[key as keyof HighlightedService])) {
            changedFields.push(key);
          }
        });
        
        if (changedFields.length > 0) {
          console.log(`Updating service ${serviceId}, fields:`, changedFields);
          await new Promise((resolve, reject) => {
            updateServiceMutation.mutate({
              identifier: serviceId,
              service,
              changedFields
            }, {
              onSuccess: () => {
                changesMade = true;
                resolve(undefined);
              },
              onError: reject
            });
          });
        } else {
          console.log(`No actual changes for service ${serviceId}`);
        }
      }

      // Process new achievements
      for (const achievement of newAchievements) {
        // Asegurarnos de que estamos usando la versión actualizada con la URL de la imagen
        const updatedAchievement = achievements.find(a => 
          (!a.id && a.title === achievement.title) || 
          (a.id && a.id === achievement.id)
        ) || achievement;
        
        console.log('Creating new achievement:', updatedAchievement.title);
        
        // Eliminar el archivo de imagen ya que ya subimos la imagen
        const achievementToSend = { ...updatedAchievement };
        delete achievementToSend.iconFile;
        
        await new Promise((resolve, reject) => {
          createAchievementMutation.mutate(achievementToSend, {
            onSuccess: () => {
              changesMade = true;
              resolve(undefined);
            },
            onError: reject
          });
        });
      }

      // Process changed achievements
      for (const achievementId of changedAchievements) {
        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement) {
          console.log(`Achievement ${achievementId} not found in current list`);
          continue;
        }
        
        const original = originalAchievements.find(a => a.id === achievementId);
        if (!original) {
          console.log(`Original achievement ${achievementId} not found`);
          continue;
        }
        
        const changedFields: string[] = [];
        Object.keys(achievement).forEach(key => {
          if (key !== 'id' && key !== '_id' && key !== 'iconFile' && 
              JSON.stringify(achievement[key as keyof Achievement]) !== 
              JSON.stringify(original[key as keyof Achievement])) {
            changedFields.push(key);
          }
        });
        
        // Verificar específicamente si la imagen ha cambiado
        if (achievement.icon !== original.icon) {
          if (!changedFields.includes('icon')) {
            changedFields.push('icon');
          }
          console.log(`Detectado cambio en la imagen del logro ${achievementId}`);
        }
        
        if (changedFields.length > 0) {
          console.log(`Updating achievement ${achievementId}, fields:`, changedFields);
          
          // Eliminar el archivo de imagen ya que ya subimos la imagen
          const achievementToSend = { ...achievement };
          delete achievementToSend.iconFile;
          
          await new Promise((resolve, reject) => {
            updateAchievementMutation.mutate({
              id: achievementId,
              achievement: achievementToSend,
              changedFields
            }, {
              onSuccess: (data) => {
                console.log(`Logro ${achievementId} actualizado exitosamente:`, data);
                changesMade = true;
                resolve(undefined);
              },
              onError: (error) => {
                console.error(`Error al actualizar logro ${achievementId}:`, error);
                reject(error);
              }
            });
          });
        } else {
          console.log(`No actual changes for achievement ${achievementId}`);
        }
      }

      // Clear change tracking after successful submission
      setChangedServices(new Set());
      setChangedAchievements(new Set());
      
      if (changesMade) {
        message.success('Cambios guardados exitosamente');
      } else {
        message.info('No se realizaron cambios');
      }
      
    } catch (error) {
      console.error('Error during submit:', error);
      message.error('Error al guardar los cambios');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAchievementChange = (index: number, field: keyof Achievement, value: any) => {
    const newAchievements = [...achievements];
    const oldValue = newAchievements[index][field];
    newAchievements[index] = { ...newAchievements[index], [field]: value };
    setAchievements(newAchievements);
    
    // Only mark as changed if it has a real id and the value actually changed
    if (newAchievements[index].id && !newAchievements[index].id.startsWith('temp-')) {
      const original = originalAchievements.find(a => a.id === newAchievements[index].id);
      
      // Para cambios de imagen, marcar siempre como cambiado
      if (field === 'icon' || field === 'iconFile') {
        console.log(`Achievement ${newAchievements[index].id} marked as changed (image field: ${String(field)})`);
        setChangedAchievements(prev => new Set([...prev, newAchievements[index].id!]));
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
          } else if (typeof value === 'object' && value !== null) {
            valueChanged = JSON.stringify(value) !== JSON.stringify(originalValue);
          } else {
            valueChanged = value !== originalValue;
          }
          
          if (valueChanged) {
            setChangedAchievements(prev => new Set([...prev, newAchievements[index].id!]));
            console.log(`Achievement ${newAchievements[index].id} marked as changed (field: ${String(field)}, from:`, originalValue, 'to:', value, ')');
          } else {
            console.log(`No actual change for achievement ${newAchievements[index].id} (field: ${String(field)})`);
          }
        } catch (error) {
          console.error('Error comparing values:', error);
          // Si hay error en la comparación, marcarlo como cambiado por seguridad
          setChangedAchievements(prev => new Set([...prev, newAchievements[index].id!]));
        }
      }
    }
  };

  const handleAddAchievement = () => {
    setAchievements([...achievements, {
      title: "",
      value: "",
      icon: "",
      color: "",
      active: true,
      order: achievements.length,
      id: `temp-${Date.now()}` // Temporary ID for new items
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
      identifier: `temp-${Date.now()}`, // Temporary identifier for new items
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
    const oldValue = newServices[index][field];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);
    
    // Only mark as changed if it has a real identifier and the value actually changed
    if (newServices[index].identifier && !newServices[index].identifier.startsWith('temp-')) {
      const original = originalServices.find(s => s.identifier === newServices[index].identifier);
      
      // Para cambios de imagen, marcar siempre como cambiado
      if (field === 'image') {
        console.log(`Service ${newServices[index].identifier} marked as changed (image field)`);
        setChangedServices(prev => new Set([...prev, newServices[index].identifier!]));
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
          } else if (typeof value === 'object' && value !== null) {
            valueChanged = JSON.stringify(value) !== JSON.stringify(originalValue);
          } else {
            valueChanged = value !== originalValue;
          }
          
          if (valueChanged) {
            setChangedServices(prev => new Set([...prev, newServices[index].identifier!]));
            console.log(`Service ${newServices[index].identifier} marked as changed (field: ${String(field)}, from:`, originalValue, 'to:', value, ')');
          } else {
            console.log(`No actual change for service ${newServices[index].identifier} (field: ${String(field)})`);
          }
        } catch (error) {
          console.error('Error comparing values:', error);
          // Si hay error en la comparación, marcarlo como cambiado por seguridad
          setChangedServices(prev => new Set([...prev, newServices[index].identifier!]));
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

      <Row justify="center" style={{ marginTop: '32px', marginBottom: '48px' }}>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={submitting || updateServiceMutation.isPending || updateAchievementMutation.isPending || createServiceMutation.isPending || createAchievementMutation.isPending}
          icon={uploadingImages ? <LoadingOutlined /> : <SaveOutlined />}
          size="large"
          className="save-button"
        >
          {uploadingImages ? 'Subiendo imágenes...' : submitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Row>
    </div>
  );
};

export default HighlightedServicesSettings;