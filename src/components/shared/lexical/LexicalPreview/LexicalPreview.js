import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { Typography } from 'antd';
const PreviewContainer = styled.div `
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  margin-top: 1rem;
`;
const processLexicalContent = (content) => {
    try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        if (parsed.root?.children) {
            return parsed.root.children.map((node) => {
                // Manejar diferentes tipos de nodos
                switch (node.type) {
                    case 'heading':
                        const HeadingTag = `h${node.tag}`;
                        return (_jsx(HeadingTag, { children: node.children?.[0]?.text || '' }, Math.random()));
                    case 'list':
                        const ListTag = node.listType === 'number' ? 'ol' : 'ul';
                        return (_jsx(ListTag, { children: node.children?.map((item) => (_jsx("li", { children: item.children?.[0]?.text || '' }, Math.random()))) }, Math.random()));
                    case 'quote':
                        return (_jsx("blockquote", { className: "border-l-4 border-gray-300 pl-4 italic", children: node.children?.[0]?.text || '' }, Math.random()));
                    case 'code':
                        return (_jsx("pre", { className: "bg-gray-100 p-4 rounded", children: _jsx("code", { children: node.children?.[0]?.text || '' }) }, Math.random()));
                    // Nodo de párrafo por defecto
                    default:
                        return (_jsx("p", { children: node.children?.map((child) => {
                                let text = child.text || '';
                                // Aplicar formatos
                                if (child.format & 1)
                                    text = _jsx("strong", { children: text }, Math.random());
                                if (child.format & 2)
                                    text = _jsx("em", { children: text }, Math.random());
                                if (child.format & 4)
                                    text = _jsx("u", { children: text }, Math.random());
                                if (child.format & 8)
                                    text = _jsx("s", { children: text }, Math.random());
                                return text;
                            }) }, Math.random()));
                }
            });
        }
        return _jsx("p", { children: content });
    }
    catch (error) {
        console.error('Error processing Lexical content:', error);
        return _jsx("p", { children: content });
    }
};
const LexicalPreview = ({ content }) => {
    return (_jsxs(PreviewContainer, { children: [_jsx(Typography.Title, { level: 5, className: "mb-4", children: "Vista previa" }), _jsx("div", { className: "prose max-w-none", children: processLexicalContent(content) })] }));
};
export default LexicalPreview;
