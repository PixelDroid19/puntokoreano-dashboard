import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

const LexicalViewer = ({ content }) => {
  const renderNode = (node) => {
    if (!node) return null;

    // Manejar nodos de texto
    if (node.type === 'text') {
      let textContent = node.text;
      
      // Aplicar formatos si existen
      if (node.format & 1) textContent = <strong>{textContent}</strong>;
      if (node.format & 2) textContent = <em>{textContent}</em>;
      if (node.format & 4) textContent = <u>{textContent}</u>;
      if (node.format & 8) textContent = <del>{textContent}</del>;
      
      return textContent;
    }

    // Manejar párrafos
    if (node.type === 'paragraph') {
      return (
        <Paragraph className="mb-4">
          {node.children?.map((child, index) => (
            <React.Fragment key={index}>
              {renderNode(child)}
            </React.Fragment>
          ))}
        </Paragraph>
      );
    }

    // Manejar encabezados
    if (node.type === 'heading') {
      return (
        <Title level={node.tag === 'h1' ? 1 : 2}>
          {node.children?.map((child, index) => (
            <React.Fragment key={index}>
              {renderNode(child)}
            </React.Fragment>
          ))}
        </Title>
      );
    }

    // Manejar listas
    if (node.type === 'list') {
      const ListComponent = node.listType === 'number' ? 'ol' : 'ul';
      return (
        <ListComponent className="pl-6 mb-4">
          {node.children?.map((child, index) => (
            <React.Fragment key={index}>
              {renderNode(child)}
            </React.Fragment>
          ))}
        </ListComponent>
      );
    }

    // Manejar elementos de lista
    if (node.type === 'listitem') {
      return (
        <li className="mb-2">
          {node.children?.map((child, index) => (
            <React.Fragment key={index}>
              {renderNode(child)}
            </React.Fragment>
          ))}
        </li>
      );
    }

    // Manejar citas
    if (node.type === 'quote') {
      return (
        <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600">
          {node.children?.map((child, index) => (
            <React.Fragment key={index}>
              {renderNode(child)}
            </React.Fragment>
          ))}
        </blockquote>
      );
    }

    // Recursivamente renderizar los hijos si existen
    if (node.children) {
      return node.children.map((child, index) => (
        <React.Fragment key={index}>
          {renderNode(child)}
        </React.Fragment>
      ));
    }

    return null;
  };

  try {
    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    
    return (
      <div className="lexical-content">
        {parsedContent.root.children.map((node, index) => (
          <React.Fragment key={index}>
            {renderNode(node)}
          </React.Fragment>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error al procesar el contenido Lexical:', error);
    return (
      <div className="text-red-600">
        Error al cargar el contenido
      </div>
    );
  }
};

export default LexicalViewer;