import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
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
function Placeholder() {
    return _jsx("div", { className: "editor-placeholder", children: "Enter some rich text..." });
}
export const LexicalBlogEditor = ({ initialContent = "", onChange, }) => {
    const onError = (error) => {
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
            ? (editor) => editor.parseEditorState(initialContent)
            : undefined,
    };
    const handleChange = (editorState) => {
        const jsonContent = editorState.toJSON();
        const stringContent = JSON.stringify(jsonContent);
        onChange(stringContent);
    };
    return (_jsx(LexicalComposer, { initialConfig: editorConfig, children: _jsxs("div", { className: "editor-container", children: [_jsx(ToolbarPlugin, {}), _jsxs("div", { className: "editor-inner", children: [_jsx(RichTextPlugin, { contentEditable: _jsx(ContentEditable, { className: "editor-input" }), placeholder: _jsx(Placeholder, {}), ErrorBoundary: LexicalErrorBoundary }), _jsx(OnChangePlugin, { onChange: handleChange }), _jsx(HistoryPlugin, {}), _jsx(AutoFocusPlugin, {}), _jsx(CodeHighlightPlugin, {}), _jsx(ListPlugin, {}), _jsx(LinkPlugin, {}), _jsx(AutoLinkPlugin, {}), _jsx(ListMaxIndentLevelPlugin, { maxDepth: 7 }), _jsx(MarkdownShortcutPlugin, { transformers: TRANSFORMERS })] })] }) }));
};
export default LexicalBlogEditor;
