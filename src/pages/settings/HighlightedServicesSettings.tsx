import { useEffect, useState } from "react";
import {
  Button,
  message,
  Row,
  Col,
  Modal,
  Typography,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ConfigService from "../../services/config.service";
import "./styles/highlighted-services.css";
import ServiceCard from "./components/ServiceCard";
import AchievementCard from "./components/AchievementCard";

const { Title } = Typography;

interface HighlightedServiceStat {
  value: string | number;
  icon_url: string;
}

interface HighlightedService {
  title: string;
  description: string;
  image: string;
  stats?: HighlightedServiceStat[];
  active?: boolean;
  order?: number;
  _id?: string;
}

interface Achievement {
  title: string;
  value: string;
  color: string;
  active: boolean;
  order: number;
  _id?: string;
  icon_url?: string;
}

const HighlightedServicesSettings = () => {
  const [services, setServices] = useState<HighlightedService[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [originalServices, setOriginalServices] = useState<
    HighlightedService[]
  >([]);
  const [originalAchievements, setOriginalAchievements] = useState<
    Achievement[]
  >([]);
  const [modifiedServiceIds, setModifiedServiceIds] = useState<Set<string>>(
    new Set()
  );
  const [modifiedAchievementIds, setModifiedAchievementIds] = useState<
    Set<string>
  >(new Set());
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
      const servicesFromApi = servicesData.data || [];
      setServices(servicesFromApi);
      setOriginalServices(JSON.parse(JSON.stringify(servicesFromApi)));
      setModifiedServiceIds(new Set());
    }
  }, [servicesSuccess, servicesFetching, servicesData]);

  useEffect(() => {
    if (achievementsSuccess && !achievementsFetching && achievementsData) {
      const achievementsFromApi = achievementsData.data || [];
      setAchievements(achievementsFromApi);
      setOriginalAchievements(JSON.parse(JSON.stringify(achievementsFromApi)));
      setModifiedAchievementIds(new Set());
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
      id,
      service,
    }: {
      id: string;
      service: Partial<HighlightedService>;
    }) => ConfigService.updateHighlightedService(id, service),
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
    mutationFn: (id: string) => ConfigService.deleteHighlightedService(id),
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
    mutationFn: (achievement: Achievement) =>
      ConfigService.createAchievement(achievement),
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
    }: {
      id: string;
      achievement: Partial<Achievement>;
    }) => ConfigService.updateAchievement(id, achievement),
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

  // Helper function to get changed fields between original and current object
  const getChangedFields = <T extends Record<string, any>>(
    original: T,
    current: T
  ): Partial<T> => {
    const changedFields: Partial<T> = {};

    Object.keys(current).forEach((key) => {
      // Skip _id field
      if (key === "_id") return;

      // Handle nested objects and arrays with deep comparison
      if (
        typeof current[key] === "object" &&
        current[key] !== null &&
        typeof original[key] === "object" &&
        original[key] !== null
      ) {
        if (Array.isArray(current[key]) && Array.isArray(original[key])) {
          if (JSON.stringify(current[key]) !== JSON.stringify(original[key])) {
            changedFields[key as keyof T] = current[key] as T[keyof T];
          }
        } else {
          const nestedChanges = getChangedFields(original[key], current[key]);
          if (Object.keys(nestedChanges).length > 0) {
            changedFields[key as keyof T] = current[key] as T[keyof T];
          }
        }
      } else if (current[key] !== original[key]) {
        changedFields[key as keyof T] = current[key];
      }
    });

    return changedFields;
  };

  const handleSubmit = () => {
    // Handle new services
    services.forEach((service) => {
      if (!service._id) {
        createServiceMutation.mutate(service);
      }
    });

    // Handle modified existing services
    services
      .filter((service) => service._id && modifiedServiceIds.has(service._id))
      .forEach((service) => {
        const originalService = originalServices.find(
          (s) => s._id === service._id
        );
        if (originalService) {
          const changedFields = getChangedFields(originalService, service);
          if (Object.keys(changedFields).length > 0) {
            updateServiceMutation.mutate({
              id: service._id!,
              service: changedFields,
            });
          }
        }
      });

    // Handle new achievements
    achievements.forEach((achievement) => {
      if (!achievement._id) {
        createAchievementMutation.mutate(achievement);
      }
    });

    // Handle modified existing achievements
    achievements
      .filter(
        (achievement) =>
          achievement._id && modifiedAchievementIds.has(achievement._id)
      )
      .forEach((achievement) => {
        const originalAchievement = originalAchievements.find(
          (a) => a._id === achievement._id
        );
        if (originalAchievement) {
          const changedFields = getChangedFields(
            originalAchievement,
            achievement
          );
          if (Object.keys(changedFields).length > 0) {
            updateAchievementMutation.mutate({
              id: achievement._id!,
              achievement: changedFields,
            });
          }
        }
      });

    setModifiedServiceIds(new Set());
    setModifiedAchievementIds(new Set());
  };

  const handleAchievementChange = (
    index: number,
    field: keyof Achievement,
    value: any
  ) => {
    const newAchievements = [...achievements];
    newAchievements[index] = { ...newAchievements[index], [field]: value };

    // Track modified achievements
    const achievement = newAchievements[index];
    if (achievement._id) {
      setModifiedAchievementIds((prev) => new Set(prev).add(achievement._id!));
    }

    setAchievements(newAchievements);
  };

  const handleAddAchievement = () => {
    const newAchievement = {
      title: "",
      value: "",
      icon_url: "",
      color: "",
      active: true,
      order: achievements.length,
    };
    const updatedAchievements = [...achievements, newAchievement];
    setAchievements(updatedAchievements);
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
        if (achievement._id) {
          deleteAchievementMutation.mutate(achievement._id);
        } else {
          const newAchievements = [...achievements];
          newAchievements.splice(index, 1);
          setAchievements(newAchievements);
        }
      },
    });
  };

  const handleAddService = () => {
    const newService = {
      title: "",
      description: "",
      image: "",
      stats: [],
      active: true,
      order: services.length,
    };
    const updatedServices = [...services, newService];
    setServices(updatedServices);
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
        if (service._id) {
          deleteServiceMutation.mutate(service._id);
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
    newServices[index] = { ...newServices[index], [field]: value };

    // Track modified services
    const service = newServices[index];
    if (service._id) {
      setModifiedServiceIds((prev) => new Set(prev).add(service._id!));
    }

    setServices(newServices);
  };

  return (
    <div className="highlighted-services-container">
      <div className="section-container">
        <div className="section-header mb-4">
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                <AppstoreOutlined /> Servicios Destacados
              </Title>
              <p className="text-gray-600 mt-2">
                Gestiona los servicios que se mostrarán en la sección destacada de la página principal. 
                Cada servicio puede incluir un título, descripción, imagen y estado de activación.
              </p>
            </Col>
            <Col>
              <Tooltip title="Los servicios destacados se mostrarán en la página principal en el orden especificado. Los servicios inactivos no serán visibles.">
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
              onServiceChange={handleServiceChange}
              onRemoveService={handleRemoveService}
            />
          ))}

          <Button
            type="dashed"
            onClick={handleAddService}
            block
            icon={<PlusOutlined />}
            className="add-button"
            style={{ marginBottom: "24px" }}
          >
            Agregar Servicio Destacado
          </Button>
        </div>
      </div>

      <div className="section-container">
        <div className="section-header mb-4">
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                <TrophyOutlined /> Logros
              </Title>
              <p className="text-gray-600 mt-2">
                Configura los logros y estadísticas destacadas que se mostrarán en la página principal. 
                Cada logro puede incluir un título, valor numérico, ícono y color personalizado.
              </p>
            </Col>
            <Col>
              <Tooltip title="Los logros se mostrarán como estadísticas destacadas. Puedes personalizar el color y el orden de aparición. Los logros inactivos no serán visibles.">
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
              onAchievementChange={handleAchievementChange}
              onRemoveAchievement={handleRemoveAchievement}
            />
          ))}

          <Button
            type="dashed"
            onClick={handleAddAchievement}
            block
            icon={<PlusOutlined />}
            className="add-button"
            style={{ marginBottom: "24px" }}
          >
            Agregar Logro
          </Button>
        </div>
      </div>

      <Row justify="center" style={{ marginTop: "32px", marginBottom: "48px" }}>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={
            updateServiceMutation.isPending ||
            updateAchievementMutation.isPending ||
            createServiceMutation.isPending ||
            createAchievementMutation.isPending
          }
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
