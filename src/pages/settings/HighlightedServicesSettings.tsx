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
  icon: string;
  color: string;
  active: boolean;
  order: number;
  id?: string;
}

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
    mutationFn: (achievement: Achievement) => ConfigService.createAchievement(achievement),
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
    mutationFn: ({ id, achievement }: { id: string; achievement: Partial<Achievement> }) =>
      ConfigService.updateAchievement(id, achievement),
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

  const handleAddStat = (serviceIndex: number) => {
    const newServices = [...services];
    newServices[serviceIndex].stats = [
      ...(newServices[serviceIndex].stats || []),
      { value: "", icon: "" },
    ];
    setServices(newServices);
  };

  const handleRemoveStat = (serviceIndex: number, statIndex: number) => {
    const newServices = [...services];
    newServices[serviceIndex].stats.splice(statIndex, 1);
    setServices(newServices);
  };

  const handleServiceChange = (index: number, field: keyof HighlightedService, value: any) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);
  };

  const handleStatChange = (serviceIndex: number, statIndex: number, field: keyof HighlightedServiceStat, value: any) => {
    const newServices = [...services];
    newServices[serviceIndex].stats = newServices[serviceIndex].stats || [];
    newServices[serviceIndex].stats[statIndex] = {
      ...newServices[serviceIndex].stats[statIndex],
      [field]: value,
    };
    setServices(newServices);
  };

  const UploadComponent = ({
    value,
    onChange,
    label,
    required = false,
  }: {
    value?: string;
    onChange?: (url: string | undefined) => void;
    label: string;
    required?: boolean;
  }) => {
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
    const [loading, setLoading] = useState(false);

    const handleUpload = async (file: RcFile) => {
      try {
        const isValidFileType = ["image/jpeg", "image/png", "image/gif"].includes(
          file.type
        );
        const isValidFileSize = file.size / 1024 / 1024 < 2;

        if (!isValidFileType) {
          message.error("Por favor, sube un archivo de imagen (JPG, PNG, GIF)");
          return Upload.LIST_IGNORE;
        }

        if (!isValidFileSize) {
          message.error("La imagen debe ser menor a 2MB");
          return Upload.LIST_IGNORE;
        }

        setLoading(true);
        const url = await ConfigService.uploadImage(file);

        if (!url) {
          throw new Error("No se recibió URL del servicio de carga");
        }

        setPreviewUrl(url);
        onChange?.(url);
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

  return (
    <div className="highlighted-services-container">
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
          {services.map((service, serviceIndex) => (
            <Card
              key={serviceIndex}
              title={`Servicio ${serviceIndex + 1}`}
              className="service-card animate-in"
              extra={
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveService(serviceIndex)}
                  className="delete-button"
                />
              }
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="Título"
                    required
                    validateStatus={!service.title ? "error" : ""}
                    help={!service.title ? "El título es requerido" : ""}
                  >
                    <Input
                      className="input-field"
                      value={service.title}
                      onChange={(e) => handleServiceChange(serviceIndex, "title", e.target.value)}
                      placeholder="Ingrese el título del servicio"
                      suffix={
                        <Tooltip title="Nombre principal del servicio">
                          <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                        </Tooltip>
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Identificador"
                    required
                    validateStatus={!service.identifier || !/^[a-z0-9-]+$/.test(service.identifier) ? "error" : ""}
                    help={!service.identifier ? "El identificador es requerido" : !/^[a-z0-9-]+$/.test(service.identifier) ? "Solo letras minúsculas, números y guiones" : ""}
                  >
                    <Input
                      className="input-field"
                      placeholder="ejemplo-de-identificador"
                      value={service.identifier}
                      onChange={(e) => handleServiceChange(serviceIndex, "identifier", e.target.value)}
                      suffix={
                        <Tooltip title="Debe ser único y solo contener letras minúsculas, números y guiones">
                          <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                        </Tooltip>
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Descripción"
                required
                validateStatus={!service.description ? "error" : ""}
                help={!service.description ? "La descripción es requerida" : ""}
              >
                <Input.TextArea
                  className="input-field"
                  rows={4}
                  value={service.description}
                  onChange={(e) => handleServiceChange(serviceIndex, "description", e.target.value)}
                  placeholder="Describa brevemente en qué consiste este servicio"
                />
              </Form.Item>

              <Row gutter={24}>
                <Col span={10}>
                  <Form.Item
                  
                    required
                    validateStatus={!service.image ? "error" : ""}
                    help={!service.image ? "La imagen es requerida" : ""}
                  >
                    <UploadComponent
                      value={service.image}
                      onChange={(url) => handleServiceChange(serviceIndex, "image", url)}
                      label="Imagen del Servicio"
                      required={true}
                    />
                  </Form.Item>
                </Col>
                <Col span={14}>
                  <div className="stats-section">
                    <Row align="middle" justify="space-between">
                      <Col>
                        <Text strong><EyeOutlined /> Estadísticas</Text>
                      </Col>
                      <Col>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Estos valores se mostrarán como datos destacados</Text>
                      </Col>
                    </Row>
                    <Divider style={{ margin: '12px 0' }} />
                    
                    {service.stats.map((stat, statIndex) => (
                      <Card
                        key={statIndex}
                        size="small"
                        className="stat-card animate-in"
                        extra={
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveStat(serviceIndex, statIndex)}
                            className="delete-button"
                          />
                        }
                      >
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item
                              label="Valor"
                              required
                              validateStatus={!stat.value ? "error" : ""}
                              help={!stat.value ? "El valor es requerido" : ""}
                            >
                              <Input
                                value={stat.value}
                                onChange={(e) => handleStatChange(serviceIndex, statIndex, "value", e.target.value)}
                                placeholder="Ej: 100+"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={16}>
                            <Form.Item
                              label="Icono"
                              required
                              validateStatus={!stat.icon ? "error" : ""}
                              help={!stat.icon ? "El icono es requerido" : ""}
                            >
                              <Input
                                value={stat.icon}
                                onChange={(e) => handleStatChange(serviceIndex, statIndex, "icon", e.target.value)}
                                placeholder="Nombre del icono"
                                suffix={
                                  <Tooltip title="Nombre del icono de Ant Design o Font Awesome">
                                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                  </Tooltip>
                                }
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => handleAddStat(serviceIndex)}
                      block
                      icon={<PlusOutlined />}
                      className="add-button"
                      style={{ marginTop: '12px' }}
                    >
                      Agregar Estadística
                    </Button>
                  </div>
                </Col>
              </Row>

              <Divider style={{ margin: '24px 0 16px' }} />
              
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Orden">
                    <InputNumber
                      className="input-field w-full"
                      min={0}
                      value={service.order}
                      onChange={(value) => handleServiceChange(serviceIndex, "order", value)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Estado">
                    <Switch
                      className="switch-field"
                      checkedChildren="Activo"
                      unCheckedChildren="Inactivo"
                      checked={service.active}
                      onChange={(checked) => handleServiceChange(serviceIndex, "active", checked)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}

          <Button
            type="dashed"
            onClick={handleAddService}
            block
            icon={<PlusOutlined />}
            className="add-button"
            style={{ marginBottom: '24px' }}
          >
            Agregar Servicio Destacado
          </Button>
        </div>
      </div>

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
            <Card
              key={index}
              className="service-card animate-in"
              extra={
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveAchievement(index)}
                  className="delete-button"
                />
              }
            >
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    label="Título"
                    required
                    validateStatus={!achievement.title ? "error" : ""}
                    help={!achievement.title ? "El título es requerido" : ""}
                  >
                    <Input
                      className="input-field"
                      value={achievement.title}
                      onChange={(e) => handleAchievementChange(index, "title", e.target.value)}
                      placeholder="Ej: Clientes Satisfechos"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Valor"
                    required
                    validateStatus={!achievement.value ? "error" : ""}
                    help={!achievement.value ? "El valor es requerido" : ""}
                  >
                    <Input
                      className="input-field"
                      value={achievement.value}
                      onChange={(e) => handleAchievementChange(index, "value", e.target.value)}
                      placeholder="Ej: 500+"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Ícono"
                    required
                    validateStatus={!achievement.icon ? "error" : ""}
                    help={!achievement.icon ? "El ícono es requerido" : ""}
                  >
                    <Input
                      className="input-field"
                      value={achievement.icon}
                      onChange={(e) => handleAchievementChange(index, "icon", e.target.value)}
                      placeholder="Ej: UserOutlined"
                      suffix={
                        <Tooltip title="Nombre del ícono de Ant Design">
                          <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                        </Tooltip>
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item 
                    label="Color"
                    help="Código hexadecimal o nombre del color (ej: #1890ff o blue)"
                  >
                    <Input
                      className="input-field"
                      value={achievement.color}
                      onChange={(e) => handleAchievementChange(index, "color", e.target.value)}
                      placeholder="Ej: #1890ff"
                      style={{ 
                        backgroundColor: achievement.color ? `${achievement.color}20` : 'white' 
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Orden">
                    <InputNumber
                      className="input-field"
                      min={0}
                      value={achievement.order}
                      onChange={(value) => handleAchievementChange(index, "order", value)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Estado">
                    <Switch
                      className="switch-field"
                      checkedChildren="Activo"
                      unCheckedChildren="Inactivo"
                      checked={achievement.active}
                      onChange={(checked) => handleAchievementChange(index, "active", checked)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}

          <Button
            type="dashed"
            onClick={handleAddAchievement}
            block
            icon={<PlusOutlined />}
            className="add-button"
            style={{ marginBottom: '24px' }}
          >
            Agregar Logro
          </Button>
        </div>
      </div>

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