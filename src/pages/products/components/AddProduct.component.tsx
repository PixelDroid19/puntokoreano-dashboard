import {
  Badge, // <-- Importar Badge
  Button,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Flex,
  Form,
  GetProp,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Tabs,
  UploadFile,
  UploadProps,
  notification,
  Input,
  Typography,
  Upload,
  type UploadFile as AntdUploadFile,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { RcFile } from "antd/es/upload";
import { getGroups } from "../../../helpers/queries.helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { NOTIFICATIONS } from "../../../enums/contants.notifications";
import { ProductCreateInput } from "../../../api/types";
import { DashboardService } from "../../../services/dashboard.service";
import FilesService from "../../../services/files.service";

import BasicInformation from "./form/BasicInformation";
import MultimediaInformation from "./form/MultimediaInformation";
import DescriptionInformation from "./form/DescriptionInformation";
import SeoInformation from "./form/SeoInformation";

const { TabPane } = Tabs;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

// Extender la interfaz UploadFile para incluir delete_url
interface ExtendedUploadFile extends UploadFile<any> {
  delete_url?: string;
  preview?: string;
}

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["clean"],
    ["link"],
    [{ align: [] }],
    ["image", "video"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "link",
  "color",
  "background",
  "align",
  "image",
  "video",
];

const AddProduct = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [previewOpen, setPreviewOpen] = React.useState<boolean>(false);
  const [previewImage, setPreviewImage] = React.useState("");
  const [fileList, setFileList] = React.useState<ExtendedUploadFile[]>([]);
  const [useGroupImages, setUseGroupImages] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("1");
  const [subgroups, setSubgroups] = React.useState<Array<{ name: string }>>([]);
  const [tabErrors, setTabErrors] = React.useState<Record<string, number>>({}); // <-- Estado para errores por pestaña
  const [videoUrl, setVideoUrl] = React.useState("");
  const [previewTitle, setPreviewTitle] = React.useState("");

  // Estados para manejar imágenes como File objects hasta la subida final
  const [thumbImageFile, setThumbImageFile] = React.useState<File | null>(null);
  const [carouselImageFiles, setCarouselImageFiles] = React.useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});
  const [totalUploadProgress, setTotalUploadProgress] = React.useState(0);

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
  });

  const { data: imageGroups } = useQuery({
    queryKey: ["imageGroups"],
    queryFn: () => FilesService.getGroups(),
  });

  const saveProduct = useMutation({
    mutationFn: (productInput: ProductCreateInput) => {
      return DashboardService.createProduct(productInput);
    },
    onSuccess: () => {
      notification.success({
        message: "Éxito",
        description: NOTIFICATIONS.PRODUCT_CREATED,
        placement: "bottomRight",
      });
      // Limpiar estados de progreso
      setUploadProgress({});
      setTotalUploadProgress(0);
      navigate("/products");
    },
    onError: (error: Error) => {
      notification.error({
        message: "Error al guardar",
        description: error.message || "Ocurrió un error inesperado.",
        placement: "bottomRight",
      });
      // Limpiar estados de progreso en caso de error
      setUploadProgress({});
      setTotalUploadProgress(0);
    },
  });

  // Función para manejar archivos localmente (sin subir inmediatamente)
  const handleUpload = async (file: RcFile) => {
    try {
      // Solo generar vista previa y almacenar archivo localmente
      const previewBase64 = await getBase64(file);

      // Crear objeto para vista previa local
      const localFile: ExtendedUploadFile = {
        uid: file.uid,
        name: file.name,
        status: "done",
        url: previewBase64, // Usar base64 para vista previa local
        thumbUrl: previewBase64,
        preview: previewBase64,
        originFileObj: file, // Mantener referencia al archivo original
      };

      setFileList((prevFileList) => [...prevFileList, localFile]);

      notification.success({
        message: "Imagen preparada",
        description: `"${file.name}" está lista para subir al crear el producto.`,
        placement: "bottomRight",
      });
      
      // Devolver información del archivo local
      return {
        uid: file.uid,
        name: file.name,
        url: previewBase64,
        thumbUrl: previewBase64,
        preview: previewBase64,
        file: file, // Archivo original para subir después
      };
    } catch (error) {
      console.error("Error preparando archivo:", error);
      notification.error({
        message: "Error de preparación",
        description: `Error al preparar "${file.name}". ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        placement: "bottomRight",
      });
      return false;
    }
  };

  const handlePreview = async (file: ExtendedUploadFile) => {
    if (!file.url && !file.preview) {
      if (file.originFileObj) {
        try {
          file.preview = await getBase64(file.originFileObj as FileType);
        } catch (error) {
          console.error("Error generating base64 preview:", error);
          notification.error({
            message: "Error",
            description: "No se pudo generar la vista previa.",
          });
          return;
        }
      } else {
        notification.warning({
          message: "Advertencia",
          description: "No hay archivo original para previsualizar.",
        });
        return;
      }
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  // Función para mapear campos a pestañas
  const getTabForKey = (fieldName: string): string | null => {
    const fieldNameStr = Array.isArray(fieldName) ? fieldName.join('.') : fieldName;
    // Tab 1: Información Básica
    if (["name", "code", "price", "stock", "reservedStock", "group", "subgroup", "active", "discount", "compatible_vehicles", "applicabilityGroups"].includes(fieldNameStr)) return "1";
    // Tab 2: Multimedia
    if (["useGroupImages", "imageGroup", "images", "videoUrl"].includes(fieldNameStr)) return "2";
    // Tab 3: Descripción y Detalles
    if (["short_description", "long_description", "shipping", "warranty", "variants"].includes(fieldNameStr)) return "3";
    // Tab 4: SEO
    if (["seoTitle", "seoDescription", "seoKeywords"].includes(fieldNameStr)) return "4";
    return null;
  };

  // Manejador para cuando la validación falla
  const onFinishFailed = (errorInfo: any) => {
    console.log("Validation Failed:", errorInfo);
    const errors: Record<string, number> = {"1": 0, "2": 0, "3": 0, "4": 0};
    let firstErrorTab: string | null = null;

    errorInfo.errorFields.forEach((errorField: any) => {
      // errorField.name es un array, unimos para facilitar la comparación
      const fieldName = Array.isArray(errorField.name) ? errorField.name.join('.') : String(errorField.name);
      const tabKey = getTabForKey(fieldName);

      // Lógica específica para la pestaña Multimedia (Tab 2)
      if (fieldName === 'images' || fieldName === 'imageGroup') {
        errors['2'] = (errors['2'] || 0) + 1;
        if (!firstErrorTab) firstErrorTab = '2';
      } else if (tabKey) {
        // Lógica general para otras pestañas
        errors[tabKey] = (errors[tabKey] || 0) + 1;
        if (!firstErrorTab) {
          firstErrorTab = tabKey;
        }
      }
    });

    // Comprobación adicional para Multimedia si no hay errores directos pero falta la selección
    // Es importante obtener los valores actuales del formulario para esta lógica
    const currentValues = form.getFieldsValue();
    const imagesField = currentValues.images; // Puede ser UploadFile[] o undefined
    const imageGroupField = currentValues.imageGroup; // Puede ser string o undefined

    if (!currentValues.useGroupImages && (!imagesField || (Array.isArray(imagesField) && imagesField.length === 0))) {
        if (errors['2'] === 0) { // Solo si no se contó ya un error directo
            errors['2'] = 1;
            if (!firstErrorTab) firstErrorTab = '2';
        }
    }
    if (currentValues.useGroupImages && !imageGroupField) {
        if (errors['2'] === 0) { // Solo si no se contó ya un error directo
            errors['2'] = 1;
            if (!firstErrorTab) firstErrorTab = '2';
        }
    }

    setTabErrors(errors);
    if (firstErrorTab) {
      setActiveTab(firstErrorTab); // Cambiar a la primera pestaña con errores
    }

    notification.error({
      message: "Errores de Validación",
      description: "Por favor, corrija los errores marcados en las pestañas antes de guardar.",
      placement: "bottomRight",
    });
  };

  const onFinish = async (values: any) => {
    console.log("Valores recibidos del formulario:", values);
    setTabErrors({}); // Limpiar errores si la validación es exitosa

    const rawCompatibleVehicles = values.compatible_vehicles;
    let compatibleVehicleIds: string[] = [];

    if (rawCompatibleVehicles) {
      const vehiclesArray = Array.isArray(rawCompatibleVehicles)
        ? rawCompatibleVehicles
        : [rawCompatibleVehicles];

      compatibleVehicleIds = vehiclesArray
        .map((vehicle) => vehicle?.value)
        .filter((id): id is string => typeof id === "string" && id.length > 0);
    }
    console.log(
      "IDs de vehículos compatibles extraídos:",
      compatibleVehicleIds
    );

    // Procesar grupos de aplicabilidad
    const rawApplicabilityGroups = values.applicabilityGroups;
    let applicabilityGroupIds: string[] = [];

    if (rawApplicabilityGroups) {
      const groupsArray = Array.isArray(rawApplicabilityGroups)
        ? rawApplicabilityGroups
        : [rawApplicabilityGroups];

      applicabilityGroupIds = groupsArray
        .map((group) => group?.value)
        .filter((id): id is string => typeof id === "string" && id.length > 0);
    }
    console.log(
      "IDs de grupos de aplicabilidad extraídos:",
      applicabilityGroupIds
    );

    let discountData = values.discount || { isActive: false };

    if (!discountData.isActive) {
      discountData = {
        isActive: false,
        type: undefined,
        percentage: undefined,
        startDate: undefined,
        endDate: undefined,
      };
    } else {
      if (discountData.type === "temporary") {
        if (!discountData.startDate || !discountData.endDate) {
          notification.error({
            message: "Error de Validación",
            description:
              "Los descuentos temporales requieren fechas de inicio y fin.",
          });
          // Marcar error en la pestaña correspondiente si es necesario
          setTabErrors(prev => ({ ...prev, "1": (prev["1"] || 0) + 1 }));
          setActiveTab("1");
          return;
        }
      }

      if (
        discountData.percentage === undefined ||
        discountData.percentage <= 0 ||
        discountData.percentage > 100
      ) {
        notification.error({
          message: "Error de Validación",
          description:
            "El porcentaje de descuento debe ser un número entre 0.01 y 100.",
        });
         // Marcar error en la pestaña correspondiente si es necesario
         setTabErrors(prev => ({ ...prev, "1": (prev["1"] || 0) + 1 }));
         setActiveTab("1");
        return;
      }
    }

    // Subir imágenes y validar según el modo
    let thumbUrl: string | undefined = undefined;
    let carouselUrls: string[] = [];

    if (!useGroupImages) {
      // Validar que tengamos imágenes si no usamos un grupo
      if (fileList.length === 0) {
        notification.error({
          message: "Error de Validación",
          description: "Debe subir al menos una imagen manualmente si no usa un grupo.",
        });
        setTabErrors(prev => ({ ...prev, "2": (prev["2"] || 0) + 1 }));
        setActiveTab("2");
        return;
      }

      // Subir todas las imágenes pendientes
      try {
        notification.info({
          message: "Subiendo imágenes",
          description: "Subiendo imágenes a Google Cloud Storage...",
          placement: "bottomRight",
        });

        const uploadResults = await uploadAllImages();
        thumbUrl = uploadResults.thumbUrl;
        carouselUrls = uploadResults.carouselUrls;

        console.log("Imágenes subidas exitosamente:", { thumbUrl, carouselUrls });
      } catch (error) {
        console.error("Error subiendo imágenes:", error);
        notification.error({
          message: "Error subiendo imágenes",
          description: "No se pudieron subir todas las imágenes. Por favor, inténtelo de nuevo.",
        });
        setTabErrors(prev => ({ ...prev, "2": (prev["2"] || 0) + 1 }));
        setActiveTab("2");
        return;
      }
    } else if (useGroupImages && !values.imageGroup) {
      notification.error({
        message: "Error de Validación",
        description: "Debe seleccionar un grupo de imágenes si la opción está activada.",
      });
      setTabErrors(prev => ({ ...prev, "2": (prev["2"] || 0) + 1 }));
      setActiveTab("2");
      return;
    }

    const productData: ProductCreateInput = {
      name: values.name,
      code: values.code,
      price: values.price,
      stock: values.stock ?? 0,
      reservedStock: values.reservedStock ?? 0,
      group: values.group,
      subgroup: values.subgroup,
      short_description: values.short_description || "",
      long_description: values.long_description || "",
      active: values.active !== undefined ? values.active : true,

      // Multimedia
      useGroupImages: useGroupImages,
      imageGroup: useGroupImages ? values.imageGroup : undefined,
      thumb: !useGroupImages ? thumbUrl : undefined,
      carousel: !useGroupImages ? carouselUrls : undefined,

      // Otros
      videoUrl: values.videoUrl || undefined,
      shipping: values.shipping || [],
      warranty: values.warranty || "",
      discount: discountData,
      compatible_vehicles: compatibleVehicleIds,

      // SEO
      seoTitle: values.seoTitle || values.name,
      seoDescription: values.seoDescription || values.short_description || "",
      seoKeywords: values.seoKeywords || [],

      variants: values.variants || [],

      // Aplicabilidad
      applicabilityGroups: applicabilityGroupIds,
    };

    console.log(
      "Enviando datos al backend:",
      JSON.stringify(productData, null, 2)
    );
    saveProduct.mutate(productData);
  };

  const handleGroupChange = (value: string) => {
    const selectedGroup = groups?.data?.groups?.find(
      (g: any) => g.name === value
    );
    if (selectedGroup) {
      setSubgroups(selectedGroup.subgroups || []);
      form.setFieldValue("subgroup", undefined);
      notification.info({
        message: "Grupo cambiado",
        description: "Se actualizaron los subgrupos disponibles.",
        placement: "bottomRight",
      });
    } else {
      setSubgroups([]);
    }
  };

  // Función para renderizar el título de la pestaña con el badge de error
  const renderTabTitle = (title: string, tabKey: string) => {
    const errorCount = tabErrors[tabKey];
    return (
      <span>
        {title}
        {errorCount > 0 && (
          <Badge count={errorCount} size="small" status="error" style={{ marginLeft: 8 }} />
        )}
      </span>
    );
  };

  // Función para subir todas las imágenes pendientes al crear el producto
  const uploadAllImages = async () => {
    console.log("🔍 Verificando archivos para subir...");
    console.log("📁 FileList total:", fileList.length);
    console.log("📁 FileList contenido:", fileList.map(f => ({ 
      name: f.name, 
      hasOriginFileObj: !!f.originFileObj,
      status: f.status 
    })));
    
    const imagesToUpload = fileList.filter(file => file.originFileObj);
    
    console.log("📤 Imágenes para subir:", imagesToUpload.length);
    
    if (imagesToUpload.length === 0) {
      console.log("⚠️ No hay imágenes para subir");
      return { thumbUrl: undefined, carouselUrls: [] };
    }

    setUploadProgress({});
    setTotalUploadProgress(0);

    // Inicializar progreso para todos los archivos
    imagesToUpload.forEach(file => {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
    });

    const uploadResults = {
      thumbUrl: undefined as string | undefined,
      carouselUrls: [] as string[]
    };

    try {
      // Subir todas las imágenes en paralelo
      for (let i = 0; i < imagesToUpload.length; i++) {
        const file = imagesToUpload[i];
        const originalFile = file.originFileObj as File;

        try {
          console.log(`Subiendo imagen ${i + 1}/${imagesToUpload.length}: ${file.name}`);
          
          // Simular progreso inicial
          setUploadProgress(prev => ({ ...prev, [file.name]: 25 }));
          
          const uploadResult = await FilesService.uploadProductImage(originalFile, 'products/images');

          if (uploadResult.success && uploadResult.data) {
            // Determinar si es thumb o carousel basado en el orden (primer archivo = thumb)
            if (i === 0) {
              uploadResults.thumbUrl = uploadResult.data.url;
            } else {
              uploadResults.carouselUrls.push(uploadResult.data.url);
            }

            // Marcar como completado
            setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
            setTotalUploadProgress(Math.round(((i + 1) / imagesToUpload.length) * 100));

            console.log(`✅ Imagen subida exitosamente: ${uploadResult.data.url}`);
          } else {
            throw new Error("Error en la respuesta del servidor");
          }
        } catch (error) {
          console.error(`❌ Error subiendo ${file.name}:`, error);
          // Continúar con los demás archivos aunque uno falle
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          notification.error({
            message: "Error subiendo imagen",
            description: `No se pudo subir "${file.name}". Continuando con las demás...`,
            placement: "bottomRight",
          });
        }

        // Pequeña pausa para mostrar el progreso
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log("✅ Todas las imágenes subidas exitosamente");
      return uploadResults;
    } catch (error) {
      console.error("Error general en subida de imágenes:", error);
      throw error;
    } finally {
      // Limpiar progreso al final
      setTimeout(() => {
        setUploadProgress({});
        setTotalUploadProgress(0);
      }, 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Flex align="center" gap={10} className="mb-6">
        <Button
          shape="circle"
          type="text"
          onClick={() => navigate(-1)}
          icon={<FontAwesomeIcon icon={faArrowLeft} />}
        />
        <h1 className="text-2xl font-semibold text-gray-800 m-0">
          Añadir Nuevo Producto
        </h1>
      </Flex>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        className="space-y-8"
        initialValues={{
          active: true,
          discount: { isActive: false, type: "permanent", percentage: 0 },
          useGroupImages: false,
          imageGroup: undefined,
          images: [],
          videoUrl: "", // Asegurarse de inicializar el videoUrl
        }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane tab={renderTabTitle("1. Información Básica", "1")} key="1">
            <BasicInformation
              form={form}
              groups={groups}
              subgroups={subgroups}
              handleGroupChange={handleGroupChange}
            />
          </TabPane>

          <TabPane tab={renderTabTitle("2. Multimedia", "2")} key="2">
            <MultimediaInformation
              useGroupImages={useGroupImages}
              setUseGroupImages={setUseGroupImages}
              fileList={fileList}
              setFileList={setFileList}
              handleUpload={handleUpload}
              handlePreview={handlePreview}
              imageGroups={imageGroups}
              form={form}
              uploadProgress={uploadProgress}
              totalUploadProgress={totalUploadProgress}
              isUploading={saveProduct.isPending}
            />
          </TabPane>

          <TabPane tab={renderTabTitle("3. Descripción y Detalles", "3")} key="3">
            <DescriptionInformation
              quillModules={quillModules}
              quillFormats={quillFormats}
            />
          </TabPane>

          <TabPane tab={renderTabTitle("4. SEO", "4")} key="4">
            <SeoInformation />
          </TabPane>
        </Tabs>

        <div className="flex justify-end mt-8 pt-5 border-t border-gray-200">
          <Button
            type="primary"
            htmlType="submit" // htmlType="submit" activará onFinish/onFinishFailed
            size="large"
            loading={saveProduct.isPending}
          >
            {saveProduct.isPending 
              ? totalUploadProgress > 0 && totalUploadProgress < 100
                ? `Subiendo imágenes... (${totalUploadProgress}%)`
                : "Guardando producto..."
              : "Guardar Producto"
            }
          </Button>
        </div>
      </Form>

      <Modal
        open={previewOpen}
        title="Vista previa de Imagen"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width={800}
      >
        <img
          alt="Vista previa"
          style={{ width: "100%", height: "auto" }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

export default AddProduct;
