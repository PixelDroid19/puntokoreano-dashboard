import {
  Button,
  Flex,
  Form,
  GetProp,
  Modal,
  Tabs,
  UploadFile,
  UploadProps,
  notification,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { RcFile } from "antd/es/upload";
import { getGroups } from "../../../helpers/queries.helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { NOTIFICATIONS } from "../../../enums/contants.notifications";
import { ProductCreateInput } from "../../../api/types";
import { DashboardService } from "../../../services/dashboard.service";
import FilesService from "../../../services/files.service";
import axios from "axios";

import BasicInformation from "./form/BasicInformation";
import MultimediaInformation from "./form/MultimediaInformation";
import DescriptionInformation from "./form/DescriptionInformation";
import SeoInformation from "./form/SeoInformation";

const { TabPane } = Tabs;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

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
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  // const [videoUrl, setVideoUrl] = React.useState<string>(""); // Comentar si videoUrl es parte del form
  const [useGroupImages, setUseGroupImages] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("1");
  const [subgroups, setSubgroups] = React.useState<Array<{ name: string }>>([]);

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
      navigate("/products");
    },
    onError: (error: Error) => {
      let description = error.message || "Ocurrió un error inesperado.";
      if (error.message.includes("ya existe")) {
        description = NOTIFICATIONS.PRODUCT_EXIST;
      }
      notification.error({
        message: "Error al guardar",
        description: description,
        placement: "bottomRight",
      });
      console.error("Error creating product:", error);
    },
  });

  const handleUpload: UploadProps["beforeUpload"] = async (file: RcFile) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${
          import.meta.env.VITE_IMGBB_API_KEY
        }`,
        formData
      );

      const newFile: UploadFile = {
        uid: file.uid,
        name: file.name,
        status: "done",
        url: response.data.data.url,
        // thumbUrl: response.data.data.thumb.url, // Opcional: si la API provee miniatura
      };

      setFileList((prevFileList) => [...prevFileList, newFile]);

      notification.success({
        message: "Imagen subida",
        description: `"${file.name}" se ha subido correctamente.`,
        placement: "bottomRight",
      });
    } catch (error) {
      notification.error({
        message: "Error de subida",
        description: `Error al subir "${file.name}". ${
          error instanceof Error ? error.message : ""
        }`,
        placement: "bottomRight",
      });
      console.error("Error uploading to ImgBB:", error);
    }

    return false;
  };

  const handlePreview = async (file: UploadFile) => {
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

  const onFinish = (values: any) => {
    console.log("Valores recibidos del formulario:", values);

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
        return;
      }
    }

    const finalImages = useGroupImages
      ? []
      : fileList.map((file) => file.url).filter((url): url is string => !!url); // Obtener URLs válidas

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
      images: finalImages,
      videoUrl: values.videoUrl || undefined,

      // Otros
      shipping: values.shipping || [],
      warranty: values.warranty || "",
      discount: discountData,
      compatible_vehicles: compatibleVehicleIds,

      // SEO
      seoTitle: values.seoTitle || values.name,
      seoDescription: values.seoDescription || values.short_description || "",
      seoKeywords: values.seoKeywords || [],

      variants: values.variants || [],
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
        className="space-y-8"
        initialValues={{
          active: true,
          discount: { isActive: false, type: "permanent", percentage: 0 },
        }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane tab="1. Información Básica" key="1">
            <BasicInformation
              form={form}
              groups={groups}
              subgroups={subgroups}
              handleGroupChange={handleGroupChange}
            />
          </TabPane>

          <TabPane tab="2. Multimedia" key="2">
            <MultimediaInformation
              form={form}
              useGroupImages={useGroupImages}
              setUseGroupImages={setUseGroupImages}
              fileList={fileList}
              setFileList={setFileList}
              handleUpload={handleUpload}
              handlePreview={handlePreview}
              imageGroups={imageGroups}
            />
          </TabPane>

          <TabPane tab="3. Descripción y Detalles" key="3">
            <DescriptionInformation
              form={form}
              quillModules={quillModules}
              quillFormats={quillFormats}
            />
          </TabPane>

          <TabPane tab="4. SEO" key="4">
            <SeoInformation form={form} />
          </TabPane>
        </Tabs>

        <div className="flex justify-end mt-8 pt-5 border-t border-gray-200">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={saveProduct.isPending}
          >
            {saveProduct.isPending ? "Guardando..." : "Guardar Producto"}
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
