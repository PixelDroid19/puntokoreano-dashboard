import React from 'react';
import { StagewiseToolbar as Toolbar } from '@stagewise/toolbar-react';
import { createRoot } from 'react-dom/client';

// Configuración básica de la barra de herramientas
const stagewiseConfig = {
  plugins: []
};

/**
 * Componente para inicializar la barra de herramientas Stagewise
 * Solo se renderiza en entorno de desarrollo
 */
export const initStagewiseToolbar = () => {
  // Verificar que estamos en entorno de desarrollo (para Vite)
  if (!import.meta.env.DEV) {
    return;
  }

  // Crear un contenedor independiente para la barra de herramientas
  const toolbarContainer = document.createElement('div');
  toolbarContainer.id = 'stagewise-toolbar-container';
  document.body.appendChild(toolbarContainer);

  // Crear una raíz de React separada para la barra de herramientas
  const toolbarRoot = createRoot(toolbarContainer);
  toolbarRoot.render(
    <React.StrictMode>
      <Toolbar config={stagewiseConfig} />
    </React.StrictMode>
  );
};

export default initStagewiseToolbar; 