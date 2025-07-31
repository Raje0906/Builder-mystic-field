import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const apiUrl = env.VITE_API_URL || 'http://localhost:3002';
  
  return {
    root: __dirname,
    publicDir: 'public',
    define: {
      'process.env': {},
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl)
    },
    server: {
      port: 8080,
      host: '0.0.0.0',
      strictPort: true,
      open: true,
      proxy: isProduction ? undefined : {
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true,
          secure: false,
          ws: true,
          // Configure proxy headers and logging
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
          // Don't rewrite the path - keep /api prefix
          pathRewrite: {
            '^/api': '/api' // Keep the /api prefix
          }
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            // Split vendor libraries into separate chunks
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'charts': ['recharts'],
            'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          },
        },
      },
    },
  };
});
