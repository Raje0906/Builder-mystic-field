import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load VITE_ variables from .env files
  const env = loadEnv(mode, process.cwd());

  // Log environment variables for debugging
  console.log('Environment variables:', {
    mode,
    VITE_API_URL: env.VITE_API_URL,
    NODE_ENV: process.env.NODE_ENV
  });

  return {
    root: __dirname,
    publicDir: 'public',
    define: {
      'process.env': {},
      // Explicitly define each environment variable
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.PROD': JSON.stringify(mode === 'production'),
      'import.meta.env.DEV': JSON.stringify(mode === 'development'),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'https://laptop-crm-backend.onrender.com'),
      __APP_ENV__: JSON.stringify(mode),
    },
    // Only expose VITE_ prefixed environment variables to the client
    envPrefix: ['VITE_'],
    plugins: [
      react(),
      // Disable service worker in development
      mode === 'development' ? null : null, // Placeholder for service worker plugin if needed
    ].filter(Boolean),
    server: {
      port: 8080,
      host: '0.0.0.0',
      strictPort: true,
      open: true,
      proxy: mode === 'production' ? undefined : {
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Proxying request:', req.method, req.url);
              console.log('Proxying to:', proxyReq.path);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received response:', proxyRes.statusCode, req.url);
            });
          },
          pathRewrite: {
            '^/api': '/api'
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            ui: [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-toast',
            ],
          },
        },
      },
    },
  };
});
