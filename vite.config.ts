import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Cargar variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // Optimización de dependencias
    optimizeDeps: {
      include: [
        "prismjs",
        "prismjs/components/prism-javascript",
        "prismjs/components/prism-typescript",
        "prismjs/components/prism-jsx",
        "prismjs/components/prism-tsx",
        "prismjs/components/prism-css",
        "prismjs/components/prism-json",
        "react",
        "react-dom",
        "antd",
      ],
      exclude: ["@tanstack/react-query-devtools"],
    },

    // Variables de entorno y definiciones
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
      __MODE__: JSON.stringify(mode),
      "process.env.VITE_API_REST_URL": JSON.stringify(env.VITE_API_REST_URL),
    },

    // Configuración del servidor de desarrollo
    server: {
      port: 3000,
      host: true,
      strictPort: true,
    },

    // Configuración de build
    build: {
      sourcemap: mode === "development",
      minify: mode === "production",
      outDir: "dist",
      assetsDir: "assets",
      // Optimizaciones para producción
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            ui: ["antd"],
            prism: ["prismjs"],
          },
        },
      },
    },

    // Resolución de módulos
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
