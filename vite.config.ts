import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      strictPort: true,
      proxy: {
        '^/api': {
          target: 'http://localhost:3002',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', {
                method: req.method,
                url: req.url,
                path: proxyReq.path,
                headers: proxyReq.getHeaders(),
              });
            });
          },
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || '/api'),
      'process.env': {}
    },
    // Enable source maps in development
    build: {
      sourcemap: mode === 'development',
    },
  };
});
