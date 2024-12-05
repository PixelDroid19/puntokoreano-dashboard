//src/pages/blog/components/BlogPostForm.tsx
// @ts-nocheck
import React from "react";
import { Form, Input, Select, Upload, Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { convertToBase64 } from "../../../helpers/images.helper";
import type { BlogPostCreate } from "../../../types/blog.types";
/* import { $getRoot, EditorState } from "lexical"; */

interface BlogPostFormProps {
  initialValues?: Partial<BlogPostCreate>;
  onSubmit: (values: BlogPostCreate) => void;
  loading?: boolean;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({
  initialValues,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = React.useState<string>();
 /*  const [editorContent, setEditorContent] = React.useState<string>("");
 */
  const handleImageUpload = async (file: File) => {
    try {
      const base64 = await convertToBase64(file);
      setImageUrl(base64 as string);
      form.setFieldsValue({ featured_image: base64 });
      return false; // Prevent default upload
    } catch (error) {
      message.error("Error al cargar la imagen");
      return false;
    }
  };
/* 
  const handleEditorChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const content = JSON.stringify(root);
      setEditorContent(content);
      form.setFieldsValue({ content });
    });
  }; */

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onSubmit}
    >
      <Form.Item
        name="title"
        label="Título"
        rules={[{ required: true, message: "Por favor ingrese un título" }]}
      >
        <Input placeholder="Título del artículo" />
      </Form.Item>

      <Form.Item
        name="content"
        label="Contenido"
        rules={[{ required: true, message: "Por favor ingrese el contenido" }]}
      >
     
      </Form.Item>

      <Form.Item
        name="excerpt"
        label="Extracto"
        rules={[{ required: true, message: "Por favor ingrese un extracto" }]}
      >
        <Input.TextArea rows={3} placeholder="Breve descripción del artículo" />
      </Form.Item>

      <Form.Item
        name="categories"
        label="Categorías"
        rules={[
          { required: true, message: "Seleccione al menos una categoría" },
        ]}
      >
        <Select
          mode="tags"
          placeholder="Seleccione o cree categorías"
          options={[
            { label: "Noticias", value: "news" },
            { label: "Tutoriales", value: "tutorials" },
            { label: "Productos", value: "products" },
          ]}
        />
      </Form.Item>

      <Form.Item name="tags" label="Etiquetas">
        <Select mode="tags" placeholder="Agregue etiquetas" />
      </Form.Item>

      <Form.Item name="featured_image" label="Imagen Destacada">
        <Upload
          listType="picture-card"
          showUploadList={false}
          beforeUpload={handleImageUpload}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="featured" style={{ width: "100%" }} />
          ) : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Subir</div>
            </div>
          )}
        </Upload>
      </Form.Item>

      <Form.Item name="status" label="Estado" initialValue="draft">
        <Select>
          <Select.Option value="draft">Borrador</Select.Option>
          <Select.Option value="published">Publicado</Select.Option>
          <Select.Option value="archived">Archivado</Select.Option>
        </Select>
      </Form.Item>

      {/* SEO Section */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h3 className="text-lg font-medium mb-4">SEO</h3>
        <Form.Item name={["seo", "title"]} label="Título SEO">
          <Input placeholder="Título para SEO" />
        </Form.Item>

        <Form.Item name={["seo", "description"]} label="Descripción SEO">
          <Input.TextArea rows={2} placeholder="Descripción para SEO" />
        </Form.Item>

        <Form.Item name={["seo", "keywords"]} label="Palabras clave">
          <Select mode="tags" placeholder="Agregue palabras clave para SEO" />
        </Form.Item>
      </div>

      <Button type="primary" htmlType="submit" loading={loading}>
        Guardar
      </Button>
    </Form>
  );
};

export default BlogPostForm;
