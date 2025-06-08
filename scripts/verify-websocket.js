#!/usr/bin/env node

/**
 * Script de verificación de WebSocket para el Dashboard
 * Ayuda a diagnosticar problemas de configuración y conexión
 */

import { io } from 'socket.io-client';

// Colores para el output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.cyan}🔍 ${msg}${colors.reset}`),
  divider: () => console.log(`${colors.white}${'='.repeat(60)}${colors.reset}`)
};

// Simular la función getWsUrl del frontend
const getWsUrl = (envVars = {}) => {
  const isProduction = envVars.VITE_NODE_ENV === 'production';
  const envWsUrl = envVars.VITE_WS_URL;
  const envApiUrl = envVars.VITE_API_REST_URL;

  // Si hay una URL de WebSocket específica configurada, usarla
  if (envWsUrl) {
    log.info(`Usando URL de WebSocket configurada: ${envWsUrl}`);
    return envWsUrl;
  }

  // Derivar URL de WebSocket desde la API REST
  let wsUrl;

  if (isProduction) {
    if (!envApiUrl) {
      throw new Error("VITE_API_REST_URL no configurada en producción");
    }
    
    // Convertir URL de API REST a WebSocket
    wsUrl = envApiUrl
      .replace(/^https?:\/\//, '') // Quitar protocolo
      .replace(/\/api\/v1$/, ''); // Quitar ruta de API
    
    // Agregar protocolo WebSocket seguro para producción
    wsUrl = `wss://${wsUrl}`;
  } else {
    // En desarrollo, usar localhost
    wsUrl = "ws://localhost:5000";
  }

  return wsUrl;
};

// Verificar configuración de variables de entorno
const checkEnvironmentConfig = () => {
  log.title("Verificando configuración de variables de entorno");
  
  const scenarios = [
    {
      name: "Desarrollo Local",
      env: {
        VITE_NODE_ENV: 'development',
        VITE_API_REST_URL: 'http://localhost:5000/api/v1'
      }
    },
    {
      name: "Producción",
      env: {
        VITE_NODE_ENV: 'production',
        VITE_API_REST_URL: 'https://puntokoreano-1087641765613.us-central1.run.app/api/v1'
      }
    },
    {
      name: "Producción con WebSocket específico",
      env: {
        VITE_NODE_ENV: 'production',
        VITE_API_REST_URL: 'https://puntokoreano-1087641765613.us-central1.run.app/api/v1',
        VITE_WS_URL: 'wss://puntokoreano-1087641765613.us-central1.run.app'
      }
    }
  ];

  scenarios.forEach(scenario => {
    try {
      const wsUrl = getWsUrl(scenario.env);
      log.success(`${scenario.name}: ${wsUrl}`);
    } catch (error) {
      log.error(`${scenario.name}: ${error.message}`);
    }
  });
};

// Verificar conectividad HTTP al backend
const checkHttpConnectivity = async (baseUrl) => {
  log.title("Verificando conectividad HTTP al backend");
  
  const endpoints = [
    '/health',
    '/health/websocket',
    '/api/v1/auth/dashboard/check-session'
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `${baseUrl}${endpoint}`;
      log.info(`Probando: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WebSocket-Verifier/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        log.success(`${endpoint}: ${response.status} - ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        log.warning(`${endpoint}: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      log.error(`${endpoint}: ${error.message}`);
    }
  }
};

// Probar conexión WebSocket
const testWebSocketConnection = async (wsUrl, timeout = 10000) => {
  log.title(`Probando conexión WebSocket a: ${wsUrl}`);
  
  return new Promise((resolve) => {
    const socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: timeout,
      forceNew: true,
      autoConnect: true
    });

    const connectionTimer = setTimeout(() => {
      log.error(`Timeout de conexión después de ${timeout}ms`);
      socket.disconnect();
      resolve(false);
    }, timeout);

    socket.on('connect', () => {
      clearTimeout(connectionTimer);
      log.success(`WebSocket conectado exitosamente`);
      log.info(`  - Socket ID: ${socket.id}`);
      log.info(`  - Transporte: ${socket.io.engine.transport.name}`);
      
      socket.disconnect();
      resolve(true);
    });

    socket.on('connect_error', (error) => {
      clearTimeout(connectionTimer);
      log.error(`Error de conexión: ${error.message}`);
      socket.disconnect();
      resolve(false);
    });

    socket.on('disconnect', (reason) => {
      log.info(`Desconectado: ${reason}`);
    });
  });
};

// Función principal de verificación
const main = async () => {
  log.divider();
  console.log(`${colors.magenta}🔌 Verificador de WebSocket - Dashboard Punto Koreano${colors.reset}`);
  log.divider();

  // 1. Verificar configuración de variables de entorno
  checkEnvironmentConfig();
  log.divider();

  // 2. Detectar URL del backend desde argumentos o usar por defecto
  const backendUrl = process.argv[2] || 'https://puntokoreano-1087641765613.us-central1.run.app';
  
  // 3. Verificar conectividad HTTP
  await checkHttpConnectivity(backendUrl);
  log.divider();

  // 4. Probar conexiones WebSocket
  const wsUrlProduction = backendUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const wsUrls = [
    `wss://${wsUrlProduction}`,
    `ws://localhost:5000` // Para pruebas locales
  ];

  for (const wsUrl of wsUrls) {
    await testWebSocketConnection(wsUrl);
    log.divider();
  }

  // 5. Mostrar recomendaciones
  log.title("Recomendaciones");
  
  console.log(`
${colors.green}✅ Para resolver problemas de WebSocket:${colors.reset}

1. ${colors.yellow}Variables de entorno requeridas:${colors.reset}
   - VITE_API_REST_URL=${backendUrl}/api/v1
   - VITE_WS_URL=wss://${wsUrlProduction} (opcional)

2. ${colors.yellow}Verificar en el navegador:${colors.reset}
   - Abrir DevTools → Console
   - Buscar logs que empiecen con 🔧, 🔌, ✅, ❌
   - Verificar que no hay errores de CORS

3. ${colors.yellow}Verificar backend:${colors.reset}
   - Health check: ${backendUrl}/health/websocket
   - Verificar logs de Google Cloud Run
   - Confirmar que CORS incluye la URL del dashboard

4. ${colors.yellow}Si el problema persiste:${colors.reset}
   - Verificar configuración de red/firewall
   - Probar desde diferentes navegadores
   - Revisar logs del servidor en tiempo real
  `);

  log.divider();
  log.success("Verificación completada");
};

// Manejo de errores
process.on('unhandledRejection', (error) => {
  log.error(`Error no manejado: ${error.message}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log.error(`Excepción no capturada: ${error.message}`);
  process.exit(1);
});

// Ejecutar verificación
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log.error(`Error durante la verificación: ${error.message}`);
    process.exit(1);
  });
}

export { getWsUrl, testWebSocketConnection, checkHttpConnectivity }; 