// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/Rajea/OneDrive/Desktop/build3_check/Builder-mystic-field/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Rajea/OneDrive/Desktop/build3_check/Builder-mystic-field/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\Rajea\\OneDrive\\Desktop\\build3_check\\Builder-mystic-field";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  console.log("Environment variables:", {
    mode,
    VITE_API_URL: env.VITE_API_URL,
    NODE_ENV: process.env.NODE_ENV
  });
  return {
    root: __vite_injected_original_dirname,
    publicDir: "public",
    define: {
      "process.env": {},
      // Explicitly define each environment variable
      "import.meta.env.MODE": JSON.stringify(mode),
      "import.meta.env.PROD": JSON.stringify(mode === "production"),
      "import.meta.env.DEV": JSON.stringify(mode === "development"),
      "import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL || "https://laptop-crm-backend.onrender.com"),
      __APP_ENV__: JSON.stringify(mode)
    },
    // Only expose VITE_ prefixed environment variables to the client
    envPrefix: ["VITE_"],
    plugins: [
      react(),
      // Disable service worker in development
      mode === "development" ? null : null
      // Placeholder for service worker plugin if needed
    ].filter(Boolean),
    server: {
      port: 8080,
      host: "0.0.0.0",
      strictPort: true,
      open: true,
      proxy: {
        "/api": {
          target: "http://localhost:3002",
          changeOrigin: true,
          secure: false,
          ws: true,
          // Keep the /api prefix when forwarding to the backend
          rewrite: (path2) => path2
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: mode === "development",
      chunkSizeWarningLimit: 1e3,
      rollupOptions: {
        input: {
          main: path.resolve(__vite_injected_original_dirname, "index.html")
        },
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            charts: ["recharts"],
            ui: [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-toast"
            ]
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxSYWplYVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGJ1aWxkM19jaGVja1xcXFxCdWlsZGVyLW15c3RpYy1maWVsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcUmFqZWFcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxidWlsZDNfY2hlY2tcXFxcQnVpbGRlci1teXN0aWMtZmllbGRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1JhamVhL09uZURyaXZlL0Rlc2t0b3AvYnVpbGQzX2NoZWNrL0J1aWxkZXItbXlzdGljLWZpZWxkL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIC8vIExvYWQgVklURV8gdmFyaWFibGVzIGZyb20gLmVudiBmaWxlc1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpO1xuXG4gIC8vIExvZyBlbnZpcm9ubWVudCB2YXJpYWJsZXMgZm9yIGRlYnVnZ2luZ1xuICBjb25zb2xlLmxvZygnRW52aXJvbm1lbnQgdmFyaWFibGVzOicsIHtcbiAgICBtb2RlLFxuICAgIFZJVEVfQVBJX1VSTDogZW52LlZJVEVfQVBJX1VSTCxcbiAgICBOT0RFX0VOVjogcHJvY2Vzcy5lbnYuTk9ERV9FTlZcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBfX2Rpcm5hbWUsXG4gICAgcHVibGljRGlyOiAncHVibGljJyxcbiAgICBkZWZpbmU6IHtcbiAgICAgICdwcm9jZXNzLmVudic6IHt9LFxuICAgICAgLy8gRXhwbGljaXRseSBkZWZpbmUgZWFjaCBlbnZpcm9ubWVudCB2YXJpYWJsZVxuICAgICAgJ2ltcG9ydC5tZXRhLmVudi5NT0RFJzogSlNPTi5zdHJpbmdpZnkobW9kZSksXG4gICAgICAnaW1wb3J0Lm1ldGEuZW52LlBST0QnOiBKU09OLnN0cmluZ2lmeShtb2RlID09PSAncHJvZHVjdGlvbicpLFxuICAgICAgJ2ltcG9ydC5tZXRhLmVudi5ERVYnOiBKU09OLnN0cmluZ2lmeShtb2RlID09PSAnZGV2ZWxvcG1lbnQnKSxcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9BUElfVVJMJzogSlNPTi5zdHJpbmdpZnkoZW52LlZJVEVfQVBJX1VSTCB8fCAnaHR0cHM6Ly9sYXB0b3AtY3JtLWJhY2tlbmQub25yZW5kZXIuY29tJyksXG4gICAgICBfX0FQUF9FTlZfXzogSlNPTi5zdHJpbmdpZnkobW9kZSksXG4gICAgfSxcbiAgICAvLyBPbmx5IGV4cG9zZSBWSVRFXyBwcmVmaXhlZCBlbnZpcm9ubWVudCB2YXJpYWJsZXMgdG8gdGhlIGNsaWVudFxuICAgIGVudlByZWZpeDogWydWSVRFXyddLFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KCksXG4gICAgICAvLyBEaXNhYmxlIHNlcnZpY2Ugd29ya2VyIGluIGRldmVsb3BtZW50XG4gICAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnID8gbnVsbCA6IG51bGwsIC8vIFBsYWNlaG9sZGVyIGZvciBzZXJ2aWNlIHdvcmtlciBwbHVnaW4gaWYgbmVlZGVkXG4gICAgXS5maWx0ZXIoQm9vbGVhbiksXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiA4MDgwLFxuICAgICAgaG9zdDogJzAuMC4wLjAnLFxuICAgICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICAgIG9wZW46IHRydWUsXG4gICAgICBwcm94eToge1xuICAgICAgICAnL2FwaSc6IHtcbiAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDInLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICAgIHdzOiB0cnVlLFxuICAgICAgICAgIC8vIEtlZXAgdGhlIC9hcGkgcHJlZml4IHdoZW4gZm9yd2FyZGluZyB0byB0aGUgYmFja2VuZFxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICB9LFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogJ2Rpc3QnLFxuICAgICAgZW1wdHlPdXREaXI6IHRydWUsXG4gICAgICBzb3VyY2VtYXA6IG1vZGUgPT09ICdkZXZlbG9wbWVudCcsXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgbWFpbjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2luZGV4Lmh0bWwnKSxcbiAgICAgICAgfSxcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAgIGNoYXJ0czogWydyZWNoYXJ0cyddLFxuICAgICAgICAgICAgdWk6IFtcbiAgICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1kaWFsb2cnLFxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnUnLFxuICAgICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXRvYXN0JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtWSxTQUFTLGNBQWMsZUFBZTtBQUN6YSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBRXhDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFHdkMsVUFBUSxJQUFJLDBCQUEwQjtBQUFBLElBQ3BDO0FBQUEsSUFDQSxjQUFjLElBQUk7QUFBQSxJQUNsQixVQUFVLFFBQVEsSUFBSTtBQUFBLEVBQ3hCLENBQUM7QUFFRCxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsTUFDTixlQUFlLENBQUM7QUFBQTtBQUFBLE1BRWhCLHdCQUF3QixLQUFLLFVBQVUsSUFBSTtBQUFBLE1BQzNDLHdCQUF3QixLQUFLLFVBQVUsU0FBUyxZQUFZO0FBQUEsTUFDNUQsdUJBQXVCLEtBQUssVUFBVSxTQUFTLGFBQWE7QUFBQSxNQUM1RCxnQ0FBZ0MsS0FBSyxVQUFVLElBQUksZ0JBQWdCLHlDQUF5QztBQUFBLE1BQzVHLGFBQWEsS0FBSyxVQUFVLElBQUk7QUFBQSxJQUNsQztBQUFBO0FBQUEsSUFFQSxXQUFXLENBQUMsT0FBTztBQUFBLElBQ25CLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQTtBQUFBLE1BRU4sU0FBUyxnQkFBZ0IsT0FBTztBQUFBO0FBQUEsSUFDbEMsRUFBRSxPQUFPLE9BQU87QUFBQSxJQUNoQixRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsVUFDTixRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsVUFDUixJQUFJO0FBQUE7QUFBQSxVQUVKLFNBQVMsQ0FBQ0EsVUFBU0E7QUFBQSxRQUNyQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixhQUFhO0FBQUEsTUFDYixXQUFXLFNBQVM7QUFBQSxNQUNwQix1QkFBdUI7QUFBQSxNQUN2QixlQUFlO0FBQUEsUUFDYixPQUFPO0FBQUEsVUFDTCxNQUFNLEtBQUssUUFBUSxrQ0FBVyxZQUFZO0FBQUEsUUFDNUM7QUFBQSxRQUNBLFFBQVE7QUFBQSxVQUNOLGNBQWM7QUFBQSxZQUNaLFFBQVEsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUEsWUFDakQsUUFBUSxDQUFDLFVBQVU7QUFBQSxZQUNuQixJQUFJO0FBQUEsY0FDRjtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsicGF0aCJdCn0K
