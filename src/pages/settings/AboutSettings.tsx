import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Button,
  message,
  Tabs,
} from "antd";
import {
  LoadingOutlined,
  SaveOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { AboutSettings } from "../../types/about.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AboutService from "../../services/about.service";
import StorageService from "../../services/storage.service";

// Importar componentes
import SocialMissionTab from "./components/SocialMissionTab";
import LocationTab from "./components/LocationTab";
import ConsultantsTab from "./components/ConsultantsTab";
import UploadProgressCard from "./components/UploadProgressCard";

import "./styles/about-settings.css";

const { TabPane } = Tabs;

const AboutSettingsPage = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [useSharedHeaderImage, setUseSharedHeaderImage] = useState(false);
  const [sharedHeaderImage, setSharedHeaderImage] = useState<string>();
  
  // Estados para el patrón diferido de subida de imágenes
  const [pendingImages, setPendingImages] = useState<Map<string, File>>(new Map());
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [totalUploadProgress, setTotalUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para tracking de cambios
  const [originalSettings, setOriginalSettings] = useState<any>(null);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

  const {
    data: settings,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: ["about-settings"],
    queryFn: () => AboutService.getSettings().then((res) => res.data),
  });

  useEffect(() => {
    if (isSuccess && !isFetching) {
      form.setFieldsValue(settings);
      // Guardar configuración original para comparación
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      // Limpiar cambios anteriores
      setChangedFields(new Set());
    }
  }, [isFetching, isSuccess, settings, form]);

  // Función para marcar un campo como cambiado
  const markFieldAsChanged = (fieldPath: string) => {
    setChangedFields(prev => new Set([...prev, fieldPath]));
  };

  // Función para comparar valores y detectar cambios
  const detectChanges = (currentValues: any) => {
    if (!originalSettings) return {};

    const changes: any = {};
    
    // Detectar cambios en socialMission
    if (currentValues.socialMission) {
      const originalSocial = originalSettings.socialMission || {};
      const hasChanges = 
        currentValues.socialMission.text !== originalSocial.text ||
        currentValues.socialMission.backgroundImage !== originalSocial.backgroundImage;
      
      if (hasChanges) {
        changes.socialMission = currentValues.socialMission;
      }
    }

    // Detectar cambios en location
    if (currentValues.location) {
      const originalLocation = originalSettings.location || {};
      const hasChanges = 
        currentValues.location.address !== originalLocation.address ||
        currentValues.location.mapUrl !== originalLocation.mapUrl ||
        JSON.stringify(currentValues.location.coordinates) !== JSON.stringify(originalLocation.coordinates);
      
      if (hasChanges) {
        changes.location = currentValues.location;
      }
    }

    // Detectar cambios en consultants
    if (currentValues.consultants) {
      const originalConsultants = originalSettings.consultants || [];
      const currentConsultants = currentValues.consultants || [];
      
      // Comparación más detallada de consultores
      const consultantsChanged = 
        currentConsultants.length !== originalConsultants.length ||
        currentConsultants.some((current: any, index: number) => {
          const original = originalConsultants[index];
          if (!original) return true;
          
          return (
            current.name !== original.name ||
            current.phoneNumber !== original.phoneNumber ||
            current.whatsappNumber !== original.whatsappNumber ||
            current.profileImage !== original.profileImage ||
            current.headerImage !== original.headerImage ||
            current.qrImage !== original.qrImage ||
            current.active !== original.active ||
            current.order !== original.order
          );
        });
      
      if (consultantsChanged) {
        changes.consultants = currentValues.consultants;
      }
    }

    return changes;
  };

  const updateMutation = useMutation({
    mutationFn: (data: AboutSettings) =>
      AboutService.updateSettings(data).then((res) => res.data),
    onSuccess: (responseData) => {
      message.success("Configuración actualizada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["about-settings"] });
      
      // Actualizar configuración original con los nuevos datos
      if (responseData) {
        setOriginalSettings(JSON.parse(JSON.stringify(responseData)));
        setChangedFields(new Set());
      }
    },
    onError: () => {
      message.error("Error al actualizar la configuración");
    },
  });

  // Función para subir todas las imágenes pendientes a GCS
  const uploadAllImages = async () => {
    if (pendingImages.size === 0) {
      return form.getFieldsValue();
    }

    try {
      setIsProcessing(true);
      setUploadProgress({});
      
      const currentValues = form.getFieldsValue();
      let completedUploads = 0;
      
      console.log(`🔄 Subiendo ${pendingImages.size} imágenes a GCS...`);

      // Subir cada imagen individualmente con progreso
      for (const [fieldPath, file] of pendingImages.entries()) {
        try {
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          
          // Obtener la URL de la imagen anterior si existe
          const pathArray = fieldPath === 'sharedHeaderImage' ? ['sharedHeaderImage'] : fieldPath.split('.');
          let oldImageUrl: string | undefined;
          
          // Buscar la URL anterior en los valores actuales del formulario
          let current = currentValues;
          for (let i = 0; i < pathArray.length - 1; i++) {
            if (current[pathArray[i]]) {
              current = current[pathArray[i]];
            } else {
              current = undefined;
              break;
            }
          }
          
          if (current && current[pathArray[pathArray.length - 1]]) {
            const existingValue = current[pathArray[pathArray.length - 1]];
            if (typeof existingValue === 'string' && existingValue.startsWith('http')) {
              oldImageUrl = existingValue;
            }
          }
          
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
          
          // Determinar carpeta según el tipo de imagen
          const folder = fieldPath.includes('consultant') ? 'settings/about/consultants' : 'settings/about/general';
          
          const uploadResponse = await StorageService.uploadSingleFile(file, folder);
          
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          
          if (uploadResponse.success && uploadResponse.data) {
            // Actualizar el valor en el formulario usando el fieldPath
            if (fieldPath === 'sharedHeaderImage') {
              // Caso especial para imagen compartida de encabezado
              setSharedHeaderImage(uploadResponse.data.url);
              // También actualizar todos los consultores con esta imagen
              const consultants = currentValues.consultants || [];
              consultants.forEach((_, index) => {
                if (!currentValues.consultants) currentValues.consultants = [];
                if (!currentValues.consultants[index]) currentValues.consultants[index] = {};
                currentValues.consultants[index].headerImage = uploadResponse.data.url;
              });
            } else {
              // Caso normal
            let current = currentValues;
            for (let i = 0; i < pathArray.length - 1; i++) {
              if (!current[pathArray[i]]) {
                current[pathArray[i]] = {};
              }
              current = current[pathArray[i]];
            }
            current[pathArray[pathArray.length - 1]] = uploadResponse.data.url;
            }
            
            completedUploads++;
            console.log(`✅ Imagen subida: ${file.name} -> ${uploadResponse.data.url}`);
          }
        } catch (error) {
          console.error(`❌ Error subiendo ${file.name}:`, error);
          message.error(`Error al subir ${file.name}`);
        }
        
        // Actualizar progreso total
        setTotalUploadProgress(Math.round((completedUploads / pendingImages.size) * 100));
      }

      console.log(`✅ ${completedUploads}/${pendingImages.size} imágenes subidas exitosamente`);
      
      // Limpiar imágenes pendientes
      setPendingImages(new Map());
      
      return currentValues;
      
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
    try {
      // Subir todas las imágenes pendientes a GCS primero
      const updatedValues = await uploadAllImages();
      
      // Formatear valores con las URLs de GCS actualizadas
      const formattedValues = {
        ...updatedValues,
        consultants: updatedValues.consultants?.map((consultant) => ({
          ...consultant,
          active: consultant.active ?? true,
          order: consultant.order ?? 0,
        })),
      };
      
      // Detectar solo los campos que han cambiado
      const onlyChangedFields = detectChanges(formattedValues);
      
      // Si no hay cambios y no hay imágenes pendientes, no enviar nada
      if (Object.keys(onlyChangedFields).length === 0 && pendingImages.size === 0) {
        message.info('No se detectaron cambios para guardar');
        return;
      }
      
      console.log('🔄 Enviando solo campos cambiados:', onlyChangedFields);
      
      updateMutation.mutate(onlyChangedFields);
    } catch (error) {
      console.error('Error durante la subida de imágenes:', error);
      message.error('Error al procesar las imágenes');
    }
  };

  return (
    <Card title="Configuración de la Página Nosotros">
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={settings}
        className="space-y-4"
      >
        <Tabs defaultActiveKey="1" type="card">
          <TabPane 
            tab={<span><GlobalOutlined /> Misión Social</span>} 
            key="1"
          >
            <SocialMissionTab
              form={form}
              pendingImages={pendingImages}
              setPendingImages={setPendingImages}
              settings={settings}
              onFieldChange={markFieldAsChanged}
            />
          </TabPane>

          <TabPane 
            tab={<span><EnvironmentOutlined /> Ubicación</span>} 
            key="2"
          >
            <LocationTab form={form} onFieldChange={markFieldAsChanged} />
          </TabPane>

          <TabPane 
            tab={<span><TeamOutlined /> Consultores</span>} 
            key="3"
          >
            <ConsultantsTab
              form={form}
              pendingImages={pendingImages}
              setPendingImages={setPendingImages}
              useSharedHeaderImage={useSharedHeaderImage}
              setUseSharedHeaderImage={setUseSharedHeaderImage}
              sharedHeaderImage={sharedHeaderImage}
              onFieldChange={markFieldAsChanged}
            />
          </TabPane>
        </Tabs>

        {/* Progreso de subida de imágenes */}
        <UploadProgressCard
          isProcessing={isProcessing}
          uploadProgress={uploadProgress}
          totalUploadProgress={totalUploadProgress}
        />

        <div className="flex justify-end mt-8">
          <Button
            type="primary"
            htmlType="submit"
            loading={updateMutation.isPending || isProcessing}
            icon={isProcessing ? <LoadingOutlined /> : <SaveOutlined />} 
            size="large"
            disabled={isProcessing}
          >
            {isProcessing 
              ? 'Subiendo imágenes a GCS...' 
              : updateMutation.isPending ? 'Guardando...' 
              : 'Guardar Cambios Generales'}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default AboutSettingsPage;
