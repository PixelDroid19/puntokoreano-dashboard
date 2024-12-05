// src/components/LexicalBlogEditor/LexicalBlogEditor.tsx
import React, { useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import type { LexicalEditor, EditorState } from "lexical";
import LexicalPreview from "../shared/lexical/LexicalPreview/LexicalPreview";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import "./styles/styles.css";
const theme = {
  root: "p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
    fontFamily: {
      arial: "font-['Arial']",
      courier: "font-['Courier New']",
      georgia: "font-['Georgia']",
      times: "font-['Times New Roman']",
      trebuchet: "font-['Trebuchet MS']",
      verdana: "font-['Verdana']",
    },
    fontSize: {
      small: "text-sm",
      normal: "text-base",
      large: "text-lg",
      huge: "text-xl",
    },
    textColor: "text-current",
    backgroundColor: "bg-current",
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
  },
  paragraph: "mb-4",
  heading: {
    h1: "text-4xl font-bold mb-4",
    h2: "text-3xl font-bold mb-3",
    h3: "text-2xl font-bold mb-2",
    h4: "text-xl font-bold mb-2",
    h5: "text-lg font-bold mb-1",
    h6: "text-base font-bold mb-1",
  },
  list: {
    ul: "list-disc list-inside mb-4",
    ol: "list-decimal list-inside mb-4",
    listitem: "mb-1",
    nested: {
      listitem: "ml-4",
    },
    checklist: {
      listitem: "flex items-center mb-1",
      checkbox: "mr-2",
    },
  },
  quote: "border-l-4 border-gray-300 pl-4 italic my-4",
  code: "font-mono bg-gray-100 rounded px-2 py-1",
  codeHighlight: {
    atrule: "text-blue-600",
    attr: "text-purple-600",
    boolean: "text-red-600",
    builtin: "text-yellow-600",
    cdata: "text-gray-600",
    char: "text-green-600",
    class: "text-purple-600",
    "class-name": "text-purple-600",
    comment: "text-gray-600 italic",
    constant: "text-yellow-600",
    deleted: "text-red-600",
    doctype: "text-gray-600",
    entity: "text-yellow-600",
    function: "text-green-600",
    important: "text-purple-600",
    inserted: "text-green-600",
    keyword: "text-purple-600",
    namespace: "text-yellow-600",
    number: "text-red-600",
    operator: "text-purple-600",
    prolog: "text-gray-600",
    property: "text-blue-600",
    punctuation: "text-gray-600",
    regex: "text-red-600",
    selector: "text-purple-600",
    string: "text-green-600",
    symbol: "text-yellow-600",
    tag: "text-red-600",
    url: "text-blue-600",
    variable: "text-yellow-600",
  },
  image: {
    wrapper: "relative inline-block",
    image: "max-w-full h-auto",
    caption: "text-center text-sm text-gray-500 mt-1",
  },
  table: {
    table: "w-full border-collapse my-4",
    tableCell: "border border-gray-300 p-2",
    tableCellHeader: "bg-gray-100 font-bold",
    tableRow: "hover:bg-gray-50",
  },
  link: "text-blue-600 hover:text-blue-800 underline",
};

interface Props {
  initialContent?: string;
  onChange: (content: string) => void;
}

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

export const LexicalBlogEditor: React.FC<Props> = ({
  initialContent = "",
  onChange,
}) => {
  const onError = (error: Error) => {
    console.error(error);
  };

  const editorConfig = {
    namespace: "BlogEditor",
    theme,
    onError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
    ],
    editorState: initialContent
      ? (editor: LexicalEditor) => editor.parseEditorState(initialContent)
      : undefined,
  };

  const handleChange = (editorState: EditorState) => {
    const jsonContent = editorState.toJSON();
    const stringContent = JSON.stringify(jsonContent);

    onChange(stringContent);
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
          {/*    <TreeViewPlugin /> */}
          <AutoFocusPlugin />
          <CodeHighlightPlugin />
          <ListPlugin />
          <LinkPlugin />
          <AutoLinkPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </div>
    </LexicalComposer>
  );
};

export default LexicalBlogEditor;
