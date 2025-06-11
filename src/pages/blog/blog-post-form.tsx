import { useEffect, useState, Suspense } from "react";
import { useForm, Controller } from "react-hook-form"; 
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Card,
  message,
  Tabs,
  Spin,
  Switch,
  Divider,
  Modal,
  Drawer,
  Progress,
  Typography,
} from "antd";
import {
  SaveOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { FileText, Settings, ImageIcon, Globe } from "lucide-react";
import dayjs from "dayjs";
import ImageUploader from "./image-uploader";
import BlogPostPreview from "./blog-post-preview"; 
import SEOPreview from "./seo-preview";
import {
  useBlogDetail,
  useCreateBlog,
  useUpdateBlog,
  useBlogCategories,
  useBlogTags,
} from "../../hooks/use-blog-queries";
import type { BlogPost, BlogCategory, BlogTag } from "../../types/blog";
import LoadingSkeleton from "./loading-skeleton";
import { BlogPostDataToSend } from "../../types/blog.types";
import RichTextEditor from "./rich-text-editor";
import StorageService from "../../services/storage.service";

interface BlogPostFormProps {
  postId?: string | null;
  onCancel: () => void;
}

export default function BlogPostForm({ postId, onCancel }: BlogPostFormProps) {
  const [activeTab, setActiveTab] = useState("content");
  const [postStatus, setPostStatus] = useState<"draft" | "published" | "scheduled">("draft");
  const [scheduledDate, setScheduledDate] = useState<dayjs.Dayjs | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [seoPreviewVisible, setSeoPreviewVisible] = useState(false);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);

  const { data: postData, isLoading: isLoadingPost } = useBlogDetail(
    postId || ""
  );
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useBlogCategories();
  const { data: tagsData, isLoading: isLoadingTags } = useBlogTags();
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();

  const {
    control,
    handleSubmit,
    setValue,
    reset, 
    getValues,
    formState: { errors, isDirty },
  } = useForm<BlogPost>({
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      featuredImage: null,
      categories: [],
      tags: [],
      metaTitle: "",
      metaDescription: "",
      status: "draft",
    },
  });


  useEffect(() => {
    if (postData) {
      reset({
        ...postData,
        categories:
          postData.categories?.map((cat) =>
            typeof cat === "string" ? cat : cat._id
          ) || [],
        tags:
          postData.tags?.map((tag) =>
            typeof tag === "string" ? tag : tag._id
          ) || [],
      });
      setPostStatus(postData.status || "draft");
      setScheduledDate(
        postData.scheduledAt ? dayjs(postData.scheduledAt) : null
      );
    } else if (!postId) {
      reset({
        title: "",
        content: "",
        excerpt: "",
        featuredImage: null,
        categories: [],
        tags: [],
        metaTitle: "",
        metaDescription: "",
        status: "draft",
      });
      setPostStatus("draft");
      setScheduledDate(null);
      setFeaturedImageFile(null);
      setFeaturedImagePreview(null);
    }
  }, [postData, postId, reset]);

  const onSubmit = async (data: BlogPost) => {
    try {
      setIsUploading(true);
      let finalFeaturedImageUrl = data.featuredImage;

      // Si hay una imagen pendiente de subir, subirla ahora
      if (featuredImageFile) {
        console.log('📤 Subiendo imagen a GCS antes de guardar...');
        const uploadedUrl = await uploadImageToGCS(featuredImageFile);
        if (uploadedUrl) {
          finalFeaturedImageUrl = uploadedUrl;
          message.success('Imagen subida exitosamente a Google Cloud Storage');
        } else {
          message.error('Error al subir la imagen. Por favor intente nuevamente.');
          return; // No continuar si falló la subida
        }
      }

      // Asegurar que las categorías y tags sean arrays de strings
      const categoriesAsStrings = Array.isArray(data.categories) 
        ? data.categories.map(cat => typeof cat === 'string' ? cat : cat._id)
        : [];
      
      const tagsAsStrings = Array.isArray(data.tags)
        ? data.tags.map(tag => typeof tag === 'string' ? tag : tag._id) 
        : [];

      const postDataToSend: Partial<BlogPostDataToSend> = {
        ...data,
        featuredImage: finalFeaturedImageUrl,
        categories: categoriesAsStrings,
        tags: tagsAsStrings,
        status: postStatus,
        scheduledAt:
          postStatus === "scheduled" ? scheduledDate?.toISOString() : null,
      };

      if (postId) {
        await updateMutation.mutateAsync({
          id: postId,
          postData: postDataToSend,
        });
        message.success("Post actualizado correctamente");
      } else {
        await createMutation.mutateAsync(postDataToSend);
        message.success("Post creado correctamente");
        reset();
        setFeaturedImageFile(null);
        setFeaturedImagePreview(null);
      }
      onCancel();
    } catch (error) {
      message.error("Error al guardar el post");
      console.error(error);
    } finally {
      setIsUploading(false);
      // Limpiar progreso después de un tiempo
      setTimeout(() => {
        setUploadProgress({});
      }, 2000);
    }
  };

  const handleStatusChange = (value: "draft" | "published" | "scheduled") => {
    setPostStatus(value);
    setValue("status", value);
  };

  // Función para generar vista previa base64
  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Función para subir imagen a GCS (solo al guardar)
  const uploadImageToGCS = async (file: File): Promise<string | null> => {
    try {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

      const uploadResponse = await StorageService.uploadSingleFile(file, 'blog/images');
      
      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      
      if (uploadResponse.success && uploadResponse.data) {
        console.log(`✅ Imagen "${file.name}" subida exitosamente a GCS`);
        return uploadResponse.data.url;
      } else {
        throw new Error(uploadResponse.message || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Error subiendo imagen a GCS:', error);
      message.error(`Error al subir "${file.name}": ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return null;
    }
  };

  const handleImageChange = async (url: string | null, file?: File | null) => {
    if (file) {
      // Solo preparar vista previa local, NO subir todavía
      try {
        const previewUrl = await getBase64(file);
        setFeaturedImageFile(file);
        setFeaturedImagePreview(previewUrl);
        setValue("featuredImage", previewUrl, { shouldDirty: true }); // Vista previa temporal
        message.success(`Imagen "${file.name}" preparada (se subirá al guardar)`);
      } catch (error) {
        message.error('Error al procesar la imagen');
        console.error('Error processing image:', error);
      }
    } else {
      // Si no hay archivo (eliminación), limpiar todo
      setFeaturedImageFile(null);
      setFeaturedImagePreview(null);
      setValue("featuredImage", url, { shouldDirty: true }); 
    }
  };

  const showPreview = () => setPreviewVisible(true);
  const showSeoPreview = () => setSeoPreviewVisible(true);

  const isLoading =
    isLoadingPost ||
    isLoadingCategories ||
    isLoadingTags ||
    createMutation.isPending ||
    updateMutation.isPending ||
    isUploading;
  const categories = categoriesData?.categories || [];
  const tags = tagsData?.tags || [];

  // Componente RichTextEditor envuelto para Suspense y Controller
  const RichTextEditorWithFallback = () => (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center border rounded-md">
          <Spin />
        </div>
      }
    >
      <Controller
        name="content"
        control={control}
        rules={{ required: "El contenido es obligatorio" }}
        render={({ field }) => (
          <RichTextEditor
            value={field.value || ""} // Asegurar que siempre sea string
            onChange={field.onChange} // *** Pasar field.onChange directamente ***
          />
        )}
      />
      {errors.content && (
        <div className="text-red-500 text-sm mt-1">
          {errors.content.message}
        </div>
      )}
    </Suspense>
  );

  // Preparamos los datos para la preview SEO usando getValues al abrir el modal
  // para no depender de watch() constantemente
  const getCurrentSeoValues = () => {
    const values = getValues();
    return {
      metaTitle: values.metaTitle || "",
      title: values.title || "",
      metaDescription: values.metaDescription || "",
      excerpt: values.excerpt || ""
    };
  };

  const tabItems = [
    {
      key: "content",
      label: (
        <span className="flex items-center gap-2">
          <FileText size={16} /> Contenido
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Controller
            name="title"
            control={control}
            rules={{ required: "El título es obligatorio" }}
            render={({ field }) => (
              <Form.Item
                label="Título"
                validateStatus={errors.title ? "error" : ""}
                help={errors.title?.message}
              >
                <Input
                  {...field}
                  placeholder="Ingresa el título del post"
                  className="text-lg"
                  size="large"
                />
              </Form.Item>
            )}
          />
          <Controller
            name="excerpt"
            control={control}
            rules={{ required: "El extracto es obligatorio" }}
            render={({ field }) => (
              <Form.Item
                label="Extracto"
                validateStatus={errors.excerpt ? "error" : ""}
                help={errors.excerpt?.message}
              >
                <Input.TextArea
                  {...field}
                  placeholder="Ingresa un breve extracto"
                  rows={3}
                />
              </Form.Item>
            )}
          />
          <Form.Item label="Contenido">
            <RichTextEditorWithFallback />
          </Form.Item>
        </div>
      ),
    },
    {
      key: "media",
      label: (
        <span className="flex items-center gap-2">
          <ImageIcon size={16} /> Imagen Destacada
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Form.Item label="Imagen Destacada">
            <Controller
              name="featuredImage"
              control={control}
              render={({ field }) => (
                <ImageUploader
                  value={field.value}
                  onChange={(url, file) => handleImageChange(url, file)}
                  aspectRatio="landscape"
                />
              )}
            />
          </Form.Item>
        </div>
      ),
    },
    {
      key: "settings",
      label: (
        <span className="flex items-center gap-2">
          <Settings size={16} /> Configuración
        </span>
      ),
      children: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Controller
                name="categories"
                control={control}
                render={({ field }) => (
                  <Form.Item label="Categorías">
                    <Select
                      {...field}
                      mode="multiple"
                      placeholder="Seleccionar categorías"
                      options={categories.map((cat: BlogCategory) => ({
                        label: cat.name,
                        value: cat._id,
                      }))}
                      className="w-full"
                      loading={isLoadingCategories}
                    />
                  </Form.Item>
                )}
              />
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <Form.Item label="Etiquetas">
                    <Select
                      {...field}
                      mode="multiple"
                      placeholder="Seleccionar etiquetas"
                      options={tags.map((tag: BlogTag) => ({
                        label: tag.name,
                        value: tag._id,
                      }))}
                      className="w-full"
                      loading={isLoadingTags}
                    />
                  </Form.Item>
                )}
              />
            </div>
            <div>
              <Form.Item label="Estado de Publicación">
                <Card className="w-full">
                  <div className="space-y-4">
                    {/* Switches de estado (sin cambios funcionales) */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={postStatus === "draft"}
                          onChange={(checked) =>
                            checked && handleStatusChange("draft")
                          }
                        />
                        <span className="font-medium">Borrador</span>
                      </div>
                      <div className="text-xs text-gray-500 ml-10">
                        Guardar como borrador para continuar editando más tarde
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={postStatus === "published"}
                          onChange={(checked) =>
                            checked && handleStatusChange("published")
                          }
                        />
                        <span className="font-medium">Publicado</span>
                      </div>
                      <div className="text-xs text-gray-500 ml-10">
                        Hacer este post visible públicamente
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={postStatus === "scheduled"}
                          onChange={(checked) =>
                            checked && handleStatusChange("scheduled")
                          }
                        />
                        <span className="font-medium">Programado</span>
                      </div>
                      {postStatus === "scheduled" && (
                        <div className="ml-10">
                          <DatePicker
                            showTime
                            value={scheduledDate}
                            onChange={setScheduledDate}
                            placeholder="Seleccionar fecha y hora"
                            className="w-full"
                          />
                        </div>
                      )}
                      <div className="text-xs text-gray-500 ml-10">
                        Programar este post para publicación futura
                      </div>
                    </div>
                  </div>
                </Card>
              </Form.Item>
            </div>
          </div>
          <Divider />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Configuración SEO</h3>
              <Button icon={<Globe size={16} />} onClick={showSeoPreview}>
                Vista previa SEO
              </Button>
            </div>
            <Controller
              name="metaTitle"
              control={control}
              render={({ field }) => (
                <Form.Item label="Meta Título">
                  <Input
                    {...field}
                    placeholder="Título SEO (por defecto usa el título del post si está vacío)"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Longitud recomendada: 50-60 caracteres
                  </div>
                </Form.Item>
              )}
            />
            <Controller
              name="metaDescription"
              control={control}
              render={({ field }) => (
                <Form.Item label="Meta Descripción">
                  <Input.TextArea
                    {...field}
                    placeholder="Descripción SEO (por defecto usa el extracto si está vacío)"
                    rows={3}
                    showCount
                    maxLength={160}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Longitud recomendada: 150-160 caracteres
                  </div>
                </Form.Item>
              )}
            />
          </div>
        </div>
      ),
    },
  ];

  if (isLoadingPost) {
    return <LoadingSkeleton type="form" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {postId ? "Editar Post" : "Crear Nuevo Post"}
          </h2>
          <div className="flex gap-2">
            <Button icon={<EyeOutlined />} onClick={showPreview}>
              Vista Previa
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={(!isDirty && !featuredImageFile) || isUploading}
            >
              Guardar
            </Button>
          </div>
        </div>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* Progreso de subida de imágenes */}
      {isUploading && Object.keys(uploadProgress).length > 0 && (
        <Card size="small" bordered className="mb-6 bg-gray-50">
          <Typography.Title level={5} style={{ marginBottom: 12, textAlign: "center" }}>
            Subiendo Imagen a Google Cloud Storage
          </Typography.Title>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <Typography.Text ellipsis style={{ maxWidth: "70%" }} className="text-sm">
                  {fileName}
                </Typography.Text>
                <Typography.Text type="secondary" className="text-sm">
                  {progress}%
                </Typography.Text>
              </div>
              <Progress 
                percent={progress} 
                size="small" 
                status={progress === 100 ? "success" : "active"}
                strokeColor={progress === 100 ? "#52c41a" : "#1890ff"}
              />
            </div>
          ))}
        </Card>
      )}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button
          type="primary"
          icon={
            postStatus === "draft" ? (
              <SaveOutlined />
            ) : postStatus === "published" ? (
              <CheckCircleOutlined />
            ) : (
              <ClockCircleOutlined />
            )
          }
          onClick={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={(!isDirty && !featuredImageFile) || isUploading}
        >
          {isUploading 
            ? "Subiendo imagen..." 
            : postStatus === "draft"
            ? "Guardar como Borrador"
            : postStatus === "published"
            ? "Publicar"
            : "Programar"}
        </Button>
      </div>

      {/* Preview Modal (Drawer) */}
      <Drawer
        title="Vista Previa del Post"
        placement="right"
        width={720}
        onClose={() => setPreviewVisible(false)}
        open={previewVisible}
        extra={
          <Button type="primary" onClick={() => setPreviewVisible(false)}>
            Cerrar
          </Button>
        }
      >
        {/* *** Pasar el control al componente de Preview *** */}
        <BlogPostPreview control={control} />
      </Drawer>

      {/* SEO Preview Modal */}
      <Modal
        title="Vista Previa SEO"
        open={seoPreviewVisible}
        onCancel={() => setSeoPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSeoPreviewVisible(false)}>
            Cerrar
          </Button>,
        ]}
      >
        <SEOPreview
          // Usar getValues para obtener los datos actuales al mostrar
          title={(() => {
            const values = getCurrentSeoValues();
            return values.metaTitle || values.title || "";
          })()}
          description={(() => {
            const values = getCurrentSeoValues();
            return values.metaDescription || values.excerpt || "";
          })()}
        />
        {/* Resto del contenido del modal SEO (sin cambios) */}
        <div className="mt-4 text-sm text-gray-500">
          <p>
            Así es como podría aparecer tu post en los resultados de búsqueda.
          </p>
          <ul className="list-disc ml-5 mt-2">
            <li>
              El título debe tener 50-60 caracteres para una visualización
              óptima
            </li>
            <li>La descripción debe tener 150-160 caracteres</li>
            <li>
              Usa palabras clave de forma natural tanto en el título como en la
              descripción
            </li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}
