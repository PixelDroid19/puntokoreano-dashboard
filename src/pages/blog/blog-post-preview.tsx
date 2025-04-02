import { Card, Divider, Tag, Avatar } from "antd";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { useWatch, Control } from "react-hook-form";
import type { BlogPost, BlogCategory, BlogTag } from "../../types/blog";
import { formatDate } from "../../lib/utils";
import dayjs from "dayjs";

interface BlogPostPreviewProps {
  control: Control<BlogPost>;
}

const convertContentToHtml = (content: string | undefined | null): string => {
  if (!content) {
    return "";
  }
  let html = content;
  // Convert **bold** to <strong>
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Convert *italic* to <em>
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  // Convert <u>underline</u> to <u>
  html = html.replace(/<u>(.*?)<\/u>/g, "<u>$1</u>");
  // Convert ~~strikethrough~~ to <del>
  html = html.replace(/~~(.*?)~~/g, "<del>$1</del>");
  // Convert # H1 to <h1> (simplificado, solo al inicio de línea)
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  // Convert ## H2 to <h2>
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  // Convert ### H3 to <h3>
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  // Convert > Quote to <blockquote> (simplificado)
  html = html.replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>");
  // Convert ``` codeblock ``` to <pre><code> (muy básico)
  html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
  // Convert `code` to <code>
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");
  // Convert lists -* o - list to <ul><li> (muy básico)
  html = html.replace(/^\* (.*$)/gim, "<li>$1</li>");
  html = html.replace(/^- (.*$)/gim, "<li>$1</li>");
  // Wrap sequences of <li> in <ul> (aproximado)
  html = html.replace(/(<li>.*<\/li>\s*)+/g, "<ul>$&</ul>");
  // Convert lists 1. list to <ol><li> (muy básico)
  html = html.replace(/^\d+\. (.*$)/gim, "<li>$1</li>");
  // Wrap sequences of <li> from numbered list in <ol> (aproximado, podría conflictuar con ul)
  // html = html.replace(/(<ol>)?(<li>.*<\/li>\s*)+(<\/ol>)?/g, '<ol>$2</ol>'); // Esto es más complejo de hacer bien con regex
  // Convert [text](url) to <a>
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  // Convert ![alt](url) to <img>
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />');

  // Convert paragraphs (newlines to <p>) - Se hace al final
  html = html
    .split("\n") // Divide por cada línea nueva primero
    .map((line) => line.trim()) // Quita espacios en blanco
    .filter((line) => line.length > 0) // Quita líneas vacías
    .map((line) => {
      // Evita envolver en <p> si ya es un elemento de bloque (h1, li, blockquote, pre)
      if (/^<(h[1-6]|li|blockquote|pre|ul|ol|img|a)/.test(line)) {
        return line;
      }
      return `<p>${line}</p>`;
    })
    .join("\n"); // Unir de nuevo (los <p> crean los saltos visuales)

  return html;
};


export default function BlogPostPreview({ control }: BlogPostPreviewProps) {
  // Usa useWatch para obtener los datos del formulario dinámicamente
  const watchedData = useWatch({ control });

  // Procesa el contenido directamente en cada render
  const htmlContent = convertContentToHtml(watchedData.content);

  // Datos para mostrar (con fallbacks)
  const title = watchedData.title || "Título (aún no escrito)";
  const featuredImage = watchedData.featuredImage;
  const excerpt = watchedData.excerpt || "";
  // Para categorías y tags, asumimos que watchedData tiene los IDs/valores seleccionados
  const categories = Array.isArray(watchedData.categories)
    ? watchedData.categories
    : [];
  const tags = Array.isArray(watchedData.tags) ? watchedData.tags : [];

  // Placeholder para autor y fecha en la preview
  const authorName = "Tú (Preview)";
  const displayDate = dayjs().toISOString();

  return (
    <Card bordered={false} className="overflow-hidden">
      <div className="space-y-4">
        {featuredImage && (
          <div className="aspect-[2/1] overflow-hidden rounded-lg -mx-6 -mt-6 mb-6 bg-gray-100">
            <img
              src={featuredImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-2xl lg:text-3xl font-bold">{title}</h1>

        <div className="flex flex-wrap gap-x-4 gap-y-1 items-center text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <UserOutlined />
            <span>{authorName}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarOutlined />
            {/* Usamos formatDate si existe, o un formato simple de dayjs */}
            <span>
              {formatDate
                ? formatDate(displayDate)
                : dayjs(displayDate).format("DD MMM YYYY")}
            </span>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 font-medium mr-1">
              Categorías:
            </span>
            {categories.map((category: any) => (
              <Tag
                color="blue"
                key={typeof category === "string" ? category : category._id}
              >
                {typeof category === "string"
                  ? `ID: ${category}`
                  : category.name}
              </Tag>
            ))}
          </div>
        )}

        {excerpt && (
          <div className="text-base text-gray-600 italic border-l-4 border-gray-300 pl-4 py-2 my-4">
            {excerpt}
          </div>
        )}

        <Divider dashed />

        {/* Cuidado con XSS - Asegúrate que la conversión HTML es segura o sanitiza */}
        <div
          className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {tags.length > 0 && (
          <div className="pt-4 mt-4 border-t">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 font-medium mr-1">
                Etiquetas:
              </span>
              {tags.map((tag: any) => (
                <Tag color="cyan" key={typeof tag === "string" ? tag : tag._id}>
                  {typeof tag === "string" ? `ID: ${tag}` : tag.name}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
