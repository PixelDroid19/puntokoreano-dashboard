import React from 'react';

// Función que interpreta el JSON de Lexical
const renderNode = (node) => {
  if (node.type === 'text') {
    // Renderiza el texto
    return <span style={{ fontFamily: 'Arial, sans-serif' }}>{node.text}</span>;
  } else if (node.type === 'paragraph') {
    // Renderiza un párrafo
    return <p>{node.children.map(renderNode)}</p>;
  }
  // Agregar más casos según la complejidad de tu estructura, como listas, encabezados, etc.
  return null;
};

// Componente que renderiza el contenido en base al JSON
const LexicalContent = ({ content }) => {
  return (
    <div>
      {content.children.map((node, index) => (
        <div key={index}>
          {renderNode(node)}
        </div>
      ))}
    </div>
  );
};

// Ejemplo de uso en una página
const BlogArticle = () => {
  const content = {
    "root": {
      "children": [
        {
          "children": [
            {
              "detail": 0,
              "format": 0,
              "mode": "normal",
              "style": "",
              "text": "Este es un artículo de ejemplo.",
              "type": "text",
              "version": 1
            }
          ],
          "direction": "ltr",
          "format": "",
          "indent": 0,
          "type": "paragraph",
          "version": 1,
          "textFormat": 0
        }
      ],
      "direction": "ltr",
      "format": "",
      "indent": 0,
      "type": "root",
      "version": 1
    }
  };

  return (
    <div>
      <h1>Mi Blog</h1>
      <LexicalContent content={content.root} />
    </div>
  );
};

export default BlogArticle;
