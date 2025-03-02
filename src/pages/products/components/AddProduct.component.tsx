// @ts-nocheck

import {
  Button,
  Flex,
  Form,
  GetProp,
  Modal,
  Tabs,
  UploadFile,
  UploadProps,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import React from "react";
import { RcFile } from "antd/es/upload";
import { getGroups } from "../../../helpers/queries.helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { NOTIFICATIONS } from "../../../enums/contants.notifications";
import { ProductCreateInput } from "../../../api/types";
import { DashboardService } from "../../../services/dashboard.service";
import FilesService from "../../../services/files.service";
import axios from "axios";
import ENDPOINTS from "../../../api";

// Import form components
import BasicInformation from "./form/BasicInformation";
import VehicleInformation from "./form/VehicleInformation";
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

// Configuración del editor Quill
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
  const [videoUrl, setVideoUrl] = React.useState<string>("");
  const [useGroupImages, setUseGroupImages] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("1");
  const [subgroups, setSubgroups] = React.useState<[]>([]);
  const [filters, setFilters] = React.useState({
    brand: "",
    model: "",
    family: "",
    transmission: "",
    fuel: "",
    line: "",
  });

  // Queries con useQuery
  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
  });

  const { data: imageGroups } = useQuery({
    queryKey: ["imageGroups"],
    queryFn: () => FilesService.getGroups(),
  });

  const { data: filterData } = useQuery({
    queryKey: ["getFilters"],
    queryFn: async () => {
      const response = await axios.get(ENDPOINTS.FILTERS.GET_ALL.url);
      return response.data;
    },
  });
  
  const saveProduct = useMutation({
    mutationFn: (values: ProductCreateInput) => {
      return DashboardService.createProduct({
        ...values,
        active: true,
      });
    },
    onSuccess: () => {
      toast.success(NOTIFICATIONS.PRODUCT_CREATED);
      navigate("/products");
    },
    onError: (error: Error) => {
      if (error.message.includes("ya existe")) {
        toast.error(NOTIFICATIONS.PRODUCT_EXIST);
      } else {
        toast.error(error.message);
      }
    },
  });

  const handleUpload = async (file: RcFile) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${
          import.meta.env.VITE_IMGBB_API_KEY
        }`,
        formData
      );
      const newFile = {
        ...file,
        name: file.name,
        status: "done",
        url: response.data.data.url,
      };
      setFileList((prevFileList) => {
        const updatedFileList = [...prevFileList, newFile];
        form.setFieldsValue({
          images: updatedFileList.map((file) => file.url),
        });
        return updatedFileList;
      });
    } catch (error) {
      toast.error("Error al cargar la imagen");
      console.error(error);
    }

    return false;
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const onFinish = (values: ProductCreateInput) => {
    // Prepare the product data with all required and optional fields
    const productData = {
      // Required fields
      name: values.name,
      price: values.price,
      group: values.group,
      subgroup: values.subgroup,
      code: values.code, // Ensure code is sent as is (string or number)
      
      // Optional fields with defaults
      stock: values.stock || 0,
      shipping: values.shipping || [],
      short_description: values.short_description || '',
      long_description: values.long_description || '',
      active: true,
      
      // Image handling
      useGroupImages,
      imageGroup: useGroupImages ? values.imageGroup : null,
      images: useGroupImages ? [] : fileList.map((file) => file.url) || [],
      
      // Additional fields
      videoUrl: values.videoUrl || videoUrl,
      warranty: values.warranty || '',
      warrantyMonths: values.warrantyMonths,
      brand: values.brand || '',
      specifications: values.specifications || [],
      variants: values.variants || [],
      relatedProducts: values.relatedProducts || [],
      
      // Vehicle-specific fields
      model: values.model || '',
      family: values.family || '',
      transmission: values.transmission || '',
      fuel: values.fuel || '',
      line: values.line || '',
      
      // SEO information
      seo: {
        title: values.seoTitle || values.name,
        description: values.seoDescription || values.short_description,
        keywords: values.seoKeywords?.split(",").map((k) => k.trim()) || [],
      },
    };

    saveProduct.mutate(productData);
  };

  // Funciones para obtener opciones de los filtros
  const getFamilyOptions = () => {
    if (!filters.model) return [];
    return filterData?.data?.families?.[filters.model] || [];
  };

  const getTransmissionOptions = () => {
    if (!filters.model || !filters.family) return [];
    return filterData?.data?.transmissions?.[filters.model]?.[filters.family] || [];
  };

  const getFuelOptions = () => {
    if (!filters.model || !filters.family || !filters.transmission) return [];
    return filterData?.data?.fuels?.[filters.model]?.[filters.family]?.[filters.transmission] || [];
  };

  const getLineOptions = () => {
    if (!filters.model || !filters.family || !filters.transmission || !filters.fuel) return [];
    return filterData?.data?.lines?.[filters.model]?.[filters.family]?.[filters.transmission]?.[filters.fuel] || [];
  };

  const handleGroupChange = (value: string) => {
    const selectedGroup = groups?.data?.groups?.find((g) => g.name === value);
    if (selectedGroup) {
      setSubgroups(selectedGroup.subgroups);
      // Limpiar el subgrupo seleccionado cuando cambia el grupo
      form.setFieldValue("subgroup", undefined);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Flex align="center" gap={5} className="mb-4">
        <Button size="small" type="text" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </Button>
        <h1 className="text-xl font-bold">Añadir un producto</h1>
      </Flex>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-6"
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Información Básica" key="1">
            <BasicInformation 
              form={form}
              groups={groups}
              subgroups={subgroups}
              handleGroupChange={handleGroupChange}
            />
          </TabPane>

          <TabPane tab="Información del Vehículo" key="6">
            <VehicleInformation 
              filters={filters}
              setFilters={setFilters}
              getFamilyOptions={getFamilyOptions}
              getTransmissionOptions={getTransmissionOptions}
              getFuelOptions={getFuelOptions}
              getLineOptions={getLineOptions}
            />
          </TabPane>

          <TabPane tab="Multimedia" key="2">
            <MultimediaInformation 
              useGroupImages={useGroupImages}
              setUseGroupImages={setUseGroupImages}
              fileList={fileList}
              handleUpload={handleUpload}
              handlePreview={handlePreview}
              imageGroups={imageGroups}
              setVideoUrl={setVideoUrl}
            />
          </TabPane>

          <TabPane tab="Descripción" key="3">
            <DescriptionInformation 
              quillModules={quillModules}
              quillFormats={quillFormats}
            />
          </TabPane>

          <TabPane tab="SEO" key="4">
            <SeoInformation />
          </TabPane>
        </Tabs>

        <div className="flex justify-end">
          <Button type="primary" htmlType="submit" size="large">
            Guardar Producto
          </Button>
        </div>
      </Form>

      <Modal
        open={previewOpen}
        title="Vista previa"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default AddProduct;
