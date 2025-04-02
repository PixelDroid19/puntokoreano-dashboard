import type React from "react";

import { useState, useEffect, useRef, memo } from "react";
import { Button, Tooltip, Dropdown, message } from "antd";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Underline,
  Strikethrough,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor = memo(function RichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  const [editorValue, setEditorValue] = useState(value || "");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!isInternalChange.current && value !== editorValue) {
      setEditorValue(value || "");
    }
    isInternalChange.current = false;
  }, [value, editorValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    isInternalChange.current = true;
    setEditorValue(newValue);
    onChange(newValue);
  };

  const insertText = (before: string, after = "") => {
    if (!editorRef.current) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorValue.substring(start, end);

    const newText =
      editorValue.substring(0, start) +
      before +
      selectedText +
      after +
      editorValue.substring(end);

    isInternalChange.current = true;
    setEditorValue(newText);
    onChange(newText);

    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length + selectedText.length + after.length,
        start + before.length + selectedText.length + after.length
      );
    }, 0);
  };

  const formatText = (format: string) => {
    switch (format) {
      case "bold":
        insertText("**", "**");
        break;
      case "italic":
        insertText("*", "*");
        break;
      case "underline":
        insertText("<u>", "</u>");
        break;
      case "strikethrough":
        insertText("~~", "~~");
        break;
      case "h1":
        insertText("# ");
        break;
      case "h2":
        insertText("## ");
        break;
      case "h3":
        insertText("### ");
        break;
      case "quote":
        insertText("> ");
        break;
      case "code":
        insertText("`", "`");
        break;
      case "codeblock":
        insertText("```\n", "\n```");
        break;
      case "ul":
        insertText("- ");
        break;
      case "ol":
        insertText("1. ");
        break;
      case "link":
        insertText("[", "](https://)");
        break;
      case "image":
        insertText("![texto alternativo](", ")");
        break;
      default:
        break;
    }
  };

  const handleImageUpload = () => {
    // In a real implementation, this would open a file picker
    // and upload the image to your server
    message.info("La carga de imágenes se implementaría aquí");
    insertText(
      "![Descripción de la imagen](https://via.placeholder.com/800x400)"
    );
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-100 p-2 border-b flex flex-wrap gap-2">
        <Tooltip title="Negrita (Ctrl+B)">
          <Button
            type="text"
            icon={<Bold size={18} />}
            onClick={() => formatText("bold")}
          />
        </Tooltip>

        <Tooltip title="Cursiva (Ctrl+I)">
          <Button
            type="text"
            icon={<Italic size={18} />}
            onClick={() => formatText("italic")}
          />
        </Tooltip>

        <Tooltip title="Subrayado">
          <Button
            type="text"
            icon={<Underline size={18} />}
            onClick={() => formatText("underline")}
          />
        </Tooltip>

        <Tooltip title="Tachado">
          <Button
            type="text"
            icon={<Strikethrough size={18} />}
            onClick={() => formatText("strikethrough")}
          />
        </Tooltip>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <Dropdown
          menu={{
            items: [
              {
                key: "h1",
                label: "Encabezado 1",
                icon: <Heading1 size={16} />,
                onClick: () => formatText("h1"),
              },
              {
                key: "h2",
                label: "Encabezado 2",
                icon: <Heading2 size={16} />,
                onClick: () => formatText("h2"),
              },
              {
                key: "h3",
                label: "Encabezado 3",
                icon: <Heading3 size={16} />,
                onClick: () => formatText("h3"),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<Heading1 size={18} />} />
        </Dropdown>

        <Tooltip title="Cita">
          <Button
            type="text"
            icon={<Quote size={18} />}
            onClick={() => formatText("quote")}
          />
        </Tooltip>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <Tooltip title="Lista con viñetas">
          <Button
            type="text"
            icon={<List size={18} />}
            onClick={() => formatText("ul")}
          />
        </Tooltip>

        <Tooltip title="Lista numerada">
          <Button
            type="text"
            icon={<ListOrdered size={18} />}
            onClick={() => formatText("ol")}
          />
        </Tooltip>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <Tooltip title="Insertar enlace">
          <Button
            type="text"
            icon={<Link size={18} />}
            onClick={() => formatText("link")}
          />
        </Tooltip>

        <Tooltip title="Insertar imagen">
          <Button
            type="text"
            icon={<Image size={18} />}
            onClick={handleImageUpload}
          />
        </Tooltip>

        <Tooltip title="Insertar código">
          <Button
            type="text"
            icon={<Code size={18} />}
            onClick={() => formatText("code")}
          />
        </Tooltip>
      </div>

      <textarea
        ref={editorRef}
        value={editorValue}
        onChange={handleChange}
        className="w-full p-4 min-h-[300px] outline-none resize-y"
        placeholder="Escribe el contenido de tu post aquí..."
      />

      <div className="bg-gray-50 p-2 border-t text-xs text-gray-500 flex justify-between">
        <div>{editorValue.length} caracteres</div>
        <div>Formato Markdown soportado</div>
      </div>
    </div>
  );
});

export default RichTextEditor;
