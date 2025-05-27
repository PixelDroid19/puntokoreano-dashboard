import type React from "react"
import { useCallback, useEffect, useState, useRef } from "react"
import { Modal, Form, Tabs, Button, Spin, Alert, Badge, message } from "antd"
import {
  CarOutlined,
  PictureOutlined,
  TagOutlined,
  InfoCircleOutlined,
  ShoppingOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import BasicInfoTab from "./basic-info-tab"
import VehiclesTab from "./vehicles-tab"
import MultimediaTab from "./multimedia-tab"
import DescriptionTab from "./description-tab"
import SeoTab from "./seo-tab"
import { Product } from "../../../../api/types"
import ProductsService from "../../../../services/products.service"
import { getGroups } from "../../../../helpers/queries.helper"
import FilesService from "../../../../services/files.service"

// Importar estilos
import "../ProductView.css"
import { isEqual } from "lodash"

interface ProductEditProps {
  open: boolean
  onClose: () => void
  productId: string
}

interface Subgroup {
  name: string
}

interface GroupOption {
  name: string
  subgroups: Subgroup[]
}

interface ImageGroupOption {
  _id: string
  identifier: string
}

interface GroupsApiResponse {
  success: boolean
  data: {
    groups: GroupOption[]
    pagination?: any
  }
}

interface ImageGroupsApiResponse {
  success: boolean
  data: {
    groups: ImageGroupOption[]
    pagination?: any
  }
}

export const ProductEdit: React.FC<ProductEditProps> = ({ open, onClose, productId }) => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [subgroups, setSubgroups] = useState<Subgroup[]>([])
  const [useGroupImages, setUseGroupImages] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState("1")
  const [initialValues, setInitialValues] = useState<any>(null)
  const [changedFields, setChangedFields] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState<boolean>(false)
  const [hasImageChanges, setHasImageChanges] = useState<boolean>(false)
  
  // Referencia a la función de subida de imágenes en MultimediaTab
  const uploadPendingImagesRef = useRef<(() => Promise<{
    thumbUrl?: string;
    carouselUrls: string[];
  }>) | null>(null);

  const {
    data: productData,
    isLoading: isLoadingProduct,
    isError: isErrorProduct,
    error: errorProduct,
  } = useQuery<Product, Error>({
    queryKey: ["product", productId],
    queryFn: () => ProductsService.getProductById(productId),
    enabled: !!productId && open,
    staleTime: 5 * 60 * 1000,
  })

  const { data: groupsData } = useQuery<GroupsApiResponse, Error>({
    queryKey: ["groups"],
    queryFn: getGroups,
  })

  const { data: imageGroupsData } = useQuery<ImageGroupsApiResponse, Error>({
    queryKey: ["imageGroups"],
    queryFn: () => FilesService.getGroups(),
  })

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Product>) => ProductsService.updateProduct(productId, payload),
    onSuccess: () => {
      message.success("Producto actualizado correctamente")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["product", productId] })
      onClose()
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || error.message || "Error al actualizar el producto")
    },
  })

  // Función para detectar cambios en el formulario
  const onValuesChange = useCallback(
    (changedValues: any, allValues: any) => {
      if (!initialValues) return

      // Identificar qué campos han cambiado
      const newChangedFields = new Set(changedFields)

      // Función recursiva para comparar objetos anidados
      const compareValues = (path: string, oldVal: any, newVal: any) => {
        if (typeof oldVal === "object" && oldVal !== null && typeof newVal === "object" && newVal !== null) {
          // Para arrays
          if (Array.isArray(oldVal) && Array.isArray(newVal)) {
            if (!isEqual(oldVal, newVal)) {
              newChangedFields.add(path)
            }
          } else {
            // Para objetos
            Object.keys({ ...oldVal, ...newVal }).forEach((key) => {
              const newPath = path ? `${path}.${key}` : key
              compareValues(newPath, oldVal?.[key], newVal?.[key])
            })
          }
        } else if (!isEqual(oldVal, newVal)) {
          newChangedFields.add(path)
        }
      }

      // Comparar los valores cambiados
      Object.keys(changedValues).forEach((key) => {
        compareValues(key, initialValues[key], allValues[key])
      })

      setChangedFields(Array.from(newChangedFields))
    },
    [initialValues, changedFields],
  )

  useEffect(() => {
    if (productData && groupsData?.data?.groups) {
      const currentGroup = groupsData.data.groups.find((g) => g.name === productData.group)
      setSubgroups(currentGroup?.subgroups || [])
      setUseGroupImages(productData.useGroupImages || false)

      // Transformar compatible_vehicles para el selector de vehículos múltiple
      const vehicleOptions =
        productData.compatible_vehicles?.map((vehicle) => {
          // Crear un nombre completo del vehículo usando la información de línea y modelo
          const modelName = vehicle.line?.model?.name || ""
          const lineName = vehicle.line?.name || ""
          const label = modelName && lineName ? `${modelName} ${lineName}` : vehicle.tag_id || "Vehículo"

          return {
            label,
            value: vehicle.id || vehicle._id,
          }
        }) || []

      const formValues = {
        ...productData,
        seoTitle: productData.seo?.title || "",
        seoDescription: productData.seo?.description || "",
        seoKeywords: productData.seo?.keywords?.join(", ") || "",
        imageGroup: productData.imageGroup || undefined,
        thumb: productData.thumb || null,
        carousel: productData.carousel || [],
        compatible_vehicles: vehicleOptions,
        active: productData.active !== undefined ? productData.active : true,
        discount: {
          isActive: productData.discount?.isActive || false,
          type: productData.discount?.type || "permanent",
          startDate: productData.discount?.startDate || null,
          endDate: productData.discount?.endDate || null,
          percentage: productData.discount?.percentage || 0,
        },
      }

      form.setFieldsValue(formValues)
      setInitialValues(formValues)
      setChangedFields([])
    }
  }, [productData, groupsData, form, open])

  const handleGroupChange = (value: string) => {
    const selectedGroup = groupsData?.data?.groups?.find((g) => g.name === value)
    setSubgroups(selectedGroup?.subgroups || [])
    form.setFieldsValue({ subgroup: undefined })
  }

  // Función para extraer solo los campos modificados
  const getChangedValues = (values: any) => {
    const changedValues: any = {}

    // Función recursiva para extraer valores cambiados de objetos anidados
    const extractChangedValues = (path: string, obj: any, target: any) => {
      if (!path) return

      const parts = path.split(".")
      const key = parts[0]

      if (parts.length === 1) {
        // Es un campo directo
        target[key] = obj[key]
      } else {
        // Es un campo anidado
        if (!target[key]) {
          target[key] = {}
        }
        const remainingPath = parts.slice(1).join(".")
        extractChangedValues(remainingPath, obj[key], target[key])
      }
    }

    // Extraer solo los campos que han cambiado
    changedFields.forEach((field) => {
      extractChangedValues(field, values, changedValues)
    })

    // Casos especiales que requieren procesamiento adicional
    if ("compatible_vehicles" in changedValues) {
      changedValues.compatible_vehicles =
        values.compatible_vehicles?.map((vehicle: any) => (typeof vehicle === "string" ? vehicle : vehicle.value)) || []
    }

    if ("seoTitle" in changedValues || "seoDescription" in changedValues || "seoKeywords" in changedValues) {
      changedValues.seo = {
        title: values.seoTitle || values.name,
        description: values.seoDescription || values.short_description,
        keywords: values.seoKeywords
          ? values.seoKeywords
              .split(",")
              .map((k: string) => k.trim())
              .filter(Boolean)
          : [],
      }
      delete changedValues.seoTitle
      delete changedValues.seoDescription
      delete changedValues.seoKeywords
    }

    // Asegurarse de que useGroupImages y imageGroup estén correctamente configurados
    if ("useGroupImages" in changedValues || useGroupImages !== initialValues?.useGroupImages) {
      changedValues.useGroupImages = useGroupImages
      if (useGroupImages) {
        changedValues.imageGroup = values.imageGroup
      } else {
        changedValues.imageGroup = null
      }
    }

    return changedValues
  }

  // Función para marcar cambios en las imágenes
  const handleImageChange = useCallback((type: 'thumb' | 'carousel') => {
    console.log('Cambio de imagen detectado:', type);
    setHasImageChanges(true);
    
    // Asegurarse de que solo el tipo específico de imagen está en los campos cambiados
    setChangedFields(prev => {
      const newChangedFields = new Set(prev);
      newChangedFields.add(type); // Solo añadir el campo que ha cambiado
      return Array.from(newChangedFields);
    });
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      // Verificación adicional de stock vs reservedStock
      if (values.reservedStock > values.stock) {
        message.error("El stock reservado no puede exceder el stock total disponible")
        return
      }

      // Obtener solo los campos que han cambiado
      const changedValues = getChangedValues(values)

      // Si hay cambios en las imágenes, asegurarse de incluir los campos correspondientes
      if (hasImageChanges) {
        if (!changedValues.thumb) changedValues.thumb = values.thumb;
        if (!changedValues.carousel) changedValues.carousel = values.carousel;
      }

      // Si no hay cambios, mostrar mensaje y no hacer nada
      if (Object.keys(changedValues).length === 0 && !hasImageChanges) {
        message.info("No se han detectado cambios en el producto")
        return
      }

      // Mostrar los campos que se van a actualizar (para depuración)
      console.log("Campos modificados:", changedFields)
      console.log("Valores a enviar:", changedValues)
      console.log("¿Hay cambios en imágenes?", hasImageChanges)
      
      // Si hay imágenes pendientes de subir, subirlas primero
      if (uploadPendingImagesRef.current) {
        setIsUploadingImages(true);
        try {
          message.loading("Subiendo imágenes...", 0);
          const imageResults = await uploadPendingImagesRef.current();
          message.destroy();
          
          // Actualizar los valores de las imágenes con las URLs reales
          if (imageResults.thumbUrl) {
            changedValues.thumb = imageResults.thumbUrl;
          }
          
          if (imageResults.carouselUrls.length > 0) {
            changedValues.carousel = imageResults.carouselUrls;
          }
          
          console.log("Imágenes subidas:", imageResults);
          console.log("Valores actualizados a enviar:", changedValues);
        } catch (error) {
          console.error("Error al subir imágenes:", error);
          message.error("Error al subir imágenes. No se guardará el producto.");
          setIsUploadingImages(false);
          return;
        } finally {
          setIsUploadingImages(false);
        }
      }

      // Enviar solo los campos modificados
      updateMutation.mutate(changedValues)
    } catch (errorInfo) {
      console.error("Validation Failed:", errorInfo)
      message.error("Por favor revise los campos del formulario.")
    }
  }

  const calculateStockStatus = () => {
    if (!productData) return null

    const stock = productData.stock || 0
    const reserved = productData.reservedStock || 0
    const available = stock - reserved

    let color = "green"
    if (available <= 0) {
      color = "red"
    } else if (available < stock * 0.2) {
      color = "orange"
    } else if (available < stock * 0.5) {
      color = "gold"
    }

    const percent = stock > 0 ? (available / stock) * 100 : 0

    return {
      available,
      total: stock,
      percent,
      color,
    }
  }

  const stockStatus = calculateStockStatus()

  // Determinar si hay cambios para habilitar el botón de guardar
  const hasChanges = changedFields.length > 0 || hasImageChanges;

  if (isLoadingProduct) {
    return (
      <Modal
        title="Editar Producto"
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={1000}
        className="product-edit-modal"
      >
        <div className="flex flex-col items-center justify-center py-16">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">Cargando datos del producto...</div>
        </div>
      </Modal>
    )
  }

  if (isErrorProduct) {
    return (
      <Modal
        title={
          <div className="flex items-center text-red-500">
            <WarningOutlined className="mr-2" />
            <span>Error</span>
          </div>
        }
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={600}
      >
        <Alert
          message="Error al cargar datos"
          description={errorProduct?.message || "No se pudieron obtener los detalles del producto."}
          type="error"
          showIcon
          className="my-4"
        />
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </Modal>
    )
  }

  const tabItems = [
    {
      key: "1",
      label: (
        <span className="flex items-center">
          <InfoCircleOutlined className="mr-1" />
          <span>Información Básica</span>
        </span>
      ),
    },
    {
      key: "vehicles",
      label: (
        <span className="flex items-center">
          <CarOutlined className="mr-1" />
          <span>Vehículos Compatibles</span>
        </span>
      ),
    },
    {
      key: "4",
      label: (
        <span className="flex items-center">
          <PictureOutlined className="mr-1" />
          <span>Multimedia</span>
        </span>
      ),
    },
    {
      key: "5",
      label: (
        <span className="flex items-center">
          <EditOutlined className="mr-1" />
          <span>Descripción</span>
        </span>
      ),
    },
    {
      key: "6",
      label: (
        <span className="flex items-center">
          <TagOutlined className="mr-1" />
          <span>SEO</span>
        </span>
      ),
    },
  ]

  return (
    <Modal
      title={
        <div className="flex items-center">
          <ShoppingOutlined className="mr-2 text-blue-600 text-xl" />
          <span className="text-lg font-medium">
            {productData?.active ? (
              <Badge status="success" text={productData?.name || "Producto"} className="font-medium" />
            ) : (
              <Badge status="error" text={productData?.name || "Producto"} className="font-medium" />
            )}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} className="mr-2">
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={updateMutation.isPending || isUploadingImages}
          className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
          disabled={!hasChanges}
        >
          <CheckCircleOutlined className="mr-1" />
          {isUploadingImages ? "Subiendo imágenes..." : 
           hasChanges ? `Guardar Cambios (${changedFields.length})` : "No hay cambios"}
        </Button>,
      ]}
      width={1000}
      destroyOnClose
      maskClosable={false}
      className="product-edit-modal"
      bodyStyle={{ maxHeight: "calc(90vh - 150px)", overflowY: "auto", padding: "16px" }}
    >
      <Form
        form={form}
        layout="vertical"
        className="product-edit-form"
        requiredMark="optional"
        onValuesChange={onValuesChange}
      >
        <Tabs
          defaultActiveKey="1"
          type="card"
          className="product-tabs"
          onChange={setActiveTab}
          items={tabItems}
          animated={{ inkBar: true, tabPane: true }}
        ></Tabs>

        {/* Renderizar el contenido de la pestaña activa */}
        {activeTab === "1" && (
          <BasicInfoTab
            form={form}
            groupsData={groupsData}
            subgroups={subgroups}
            handleGroupChange={handleGroupChange}
            stockStatus={stockStatus}
          />
        )}

        {activeTab === "vehicles" && <VehiclesTab productData={productData} />}

        {activeTab === "4" && (
          <MultimediaTab
            productData={productData}
            useGroupImages={useGroupImages}
            setUseGroupImages={setUseGroupImages}
            imageGroupsData={imageGroupsData}
            form={form}
            onUploadPendingImagesRef={uploadPendingImagesRef}
            onImageChange={handleImageChange}
          />
        )}

        {activeTab === "5" && <DescriptionTab />}

        {activeTab === "6" && <SeoTab />}

        {hasChanges && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="font-medium text-blue-700 mb-2">
              {hasImageChanges ? "Cambios en imágenes y campos" : "Campos modificados"} ({changedFields.length}):
            </div>
            <div className="flex flex-wrap gap-2">
              {changedFields.includes('thumb') && (
                <Badge
                  count="imagen principal"
                  className="site-badge-count-4"
                  style={{ backgroundColor: "#f50" }}
                />
              )}
              {changedFields.includes('carousel') && (
                <Badge
                  count="imágenes de carrusel"
                  className="site-badge-count-4"
                  style={{ backgroundColor: "#f50" }}
                />
              )}
              {changedFields
                .filter(field => field !== 'thumb' && field !== 'carousel')
                .map((field) => (
                <Badge
                  key={field}
                  count={field}
                  className="site-badge-count-4"
                  style={{ backgroundColor: "#1890ff" }}
                />
              ))}
            </div>
          </div>
        )}
      </Form>
    </Modal>
  )
}

export default ProductEdit
