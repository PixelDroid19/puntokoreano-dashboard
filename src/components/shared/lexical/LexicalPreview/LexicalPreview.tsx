// src/components/LexicalPreview/LexicalPreview.tsx
import React from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';

const PreviewContainer = styled.div`
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  margin-top: 1rem;
`;

const processLexicalContent = (content: string) => {
  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    if (parsed.root?.children) {
      return parsed.root.children.map((node: any) => {
        // Manejar diferentes tipos de nodos
        switch (node.type) {
          case 'heading':
            const HeadingTag = `h${node.tag}` as keyof JSX.IntrinsicElements;
            return (
              <HeadingTag key={Math.random()}>
                {node.children?.[0]?.text || ''}
              </HeadingTag>
            );
          
          case 'list':
            const ListTag = node.listType === 'number' ? 'ol' : 'ul';
            return (
              <ListTag key={Math.random()}>
                {node.children?.map((item: any) => (
                  <li key={Math.random()}>{item.children?.[0]?.text || ''}</li>
                ))}
              </ListTag>
            );
          
          case 'quote':
            return (
              <blockquote key={Math.random()} className="border-l-4 border-gray-300 pl-4 italic">
                {node.children?.[0]?.text || ''}
              </blockquote>
            );
          
          case 'code':
            return (
              <pre key={Math.random()} className="bg-gray-100 p-4 rounded">
                <code>{node.children?.[0]?.text || ''}</code>
              </pre>
            );

          // Nodo de párrafo por defecto
          default:
            return (
              <p key={Math.random()}>
                {node.children?.map((child: any) => {
                  let text = child.text || '';
                  
                  // Aplicar formatos
                  if (child.format & 1) text = <strong key={Math.random()}>{text}</strong>;
                  if (child.format & 2) text = <em key={Math.random()}>{text}</em>;
                  if (child.format & 4) text = <u key={Math.random()}>{text}</u>;
                  if (child.format & 8) text = <s key={Math.random()}>{text}</s>;
                  
                  return text;
                })}
              </p>
            );
        }
      });
    }
    return <p>{content}</p>;
  } catch (error) {
    console.error('Error processing Lexical content:', error);
    return <p>{content}</p>;
  }
};

interface LexicalPreviewProps {
  content: string;
}

const LexicalPreview: React.FC<LexicalPreviewProps> = ({ content }) => {
  return (
    <PreviewContainer>
      <Typography.Title level={5} className="mb-4">Vista previa</Typography.Title>
      <div className="prose max-w-none">
        {processLexicalContent(content)}
      </div>
    </PreviewContainer>
  );
};

export default LexicalPreview;