# Punto Koreano - Dashboard

Dashboard administrativo para la gestión de la tienda Punto Koreano.

## Características

- Gestión de productos
- Gestión de usuarios
- Gestión de pedidos
- Análisis y estadísticas
- Gestión de blogs y contenido
- Configuración de la tienda

## Gestión de Imágenes de Productos

El sistema permite dos formas de gestionar las imágenes de los productos:

### 1. Grupos de Imágenes

Permite reutilizar conjuntos de imágenes para varios productos similares. Esto es útil para:
- Productos con las mismas imágenes pero diferentes especificaciones
- Ahorro de espacio al no duplicar imágenes
- Gestión centralizada de imágenes

### 2. Imágenes Individuales

Cada producto puede tener sus propias imágenes:
- **Imagen Principal (Thumb)**: Imagen cuadrada de 300x300px que se muestra como miniatura principal
- **Imágenes de Carrusel**: Hasta 8 imágenes de 600x600px para mostrar en la galería del producto

### Proceso de Subida de Imágenes

1. Validación de dimensiones y tamaño (máximo 2MB por imagen)
2. Previsualización antes de la subida
3. Carga asíncrona al servicio de almacenamiento de imágenes (ImgBB)
4. Posibilidad de eliminar imágenes usando el enlace de eliminación proporcionado por el servicio
5. Opción para promocionar una imagen de carrusel a imagen principal

### Requisitos de Imágenes

- **Formato**: JPG, PNG, GIF o WebP
- **Dimensiones**:
  - Imagen principal (thumb): 300x300px exactamente
  - Imágenes de carrusel: 600x600px exactamente
- **Tamaño máximo**: 2MB por imagen

## Configuración del Proyecto

### Requisitos

- Node.js v16 o superior
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Compilar para producción
npm run build
```

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
VITE_API_REST_URL=http://localhost:5000/api/v1
VITE_IMGBB_API_KEY=tu_clave_api_imgbb
```

Puedes obtener una clave API gratuita en [ImgBB](https://api.imgbb.com/).

## Estructura de Archivos

- `src/` - Código fuente de la aplicación
  - `api/` - Definiciones de endpoints y tipos
  - `components/` - Componentes reutilizables
  - `pages/` - Páginas de la aplicación
  - `services/` - Servicios para comunicación con el backend
  - `utils/` - Utilidades y funciones helper
  - `store/` - Estado global con Redux
  - `hooks/` - Custom hooks

## Licencia

Copyright © 2023 MKTG33 S.A.S. Todos los derechos reservados.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
