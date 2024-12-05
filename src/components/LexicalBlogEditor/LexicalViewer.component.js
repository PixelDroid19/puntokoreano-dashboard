import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Typography } from 'antd';
const { Title, Paragraph, Text } = Typography;
const LexicalViewer = ({ content }) => {
    const renderNode = (node) => {
        if (!node)
            return null;
        // Manejar nodos de texto
        if (node.type === 'text') {
            let textContent = node.text;
            // Aplicar formatos si existen
            if (node.format & 1)
                textContent = _jsx("strong", { children: textContent });
            if (node.format & 2)
                textContent = _jsx("em", { children: textContent });
            if (node.format & 4)
                textContent = _jsx("u", { children: textContent });
            if (node.format & 8)
                textContent = _jsx("del", { children: textContent });
            return textContent;
        }
        // Manejar párrafos
        if (node.type === 'paragraph') {
            return (_jsx(Paragraph, { className: "mb-4", children: node.children?.map((child, index) => (_jsx(React.Fragment, { children: renderNode(child) }, index))) }));
        }
        // Manejar encabezados
        if (node.type === 'heading') {
            return (_jsx(Title, { level: node.tag === 'h1' ? 1 : 2, children: node.children?.map((child, index) => (_jsx(React.Fragment, { children: renderNode(child) }, index))) }));
        }
        // Manejar listas
        if (node.type === 'list') {
            const ListComponent = node.listType === 'number' ? 'ol' : 'ul';
            return (_jsx(ListComponent, { className: "pl-6 mb-4", children: node.children?.map((child, index) => (_jsx(React.Fragment, { children: renderNode(child) }, index))) }));
        }
        // Manejar elementos de lista
        if (node.type === 'listitem') {
            return (_jsx("li", { className: "mb-2", children: node.children?.map((child, index) => (_jsx(React.Fragment, { children: renderNode(child) }, index))) }));
        }
        // Manejar citas
        if (node.type === 'quote') {
            return (_jsx("blockquote", { className: "border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600", children: node.children?.map((child, index) => (_jsx(React.Fragment, { children: renderNode(child) }, index))) }));
        }
        // Recursivamente renderizar los hijos si existen
        if (node.children) {
            return node.children.map((child, index) => (_jsx(React.Fragment, { children: renderNode(child) }, index)));
        }
        return null;
    };
    try {
        const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
        return (_jsx("div", { className: "lexical-content", children: parsedContent.root.children.map((node, index) => (_jsx(React.Fragment, { children: renderNode(node) }, index))) }));
    }
    catch (error) {
        console.error('Error al procesar el contenido Lexical:', error);
        return (_jsx("div", { className: "text-red-600", children: "Error al cargar el contenido" }));
    }
};
export default LexicalViewer;
