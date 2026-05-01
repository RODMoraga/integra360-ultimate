import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

/**
 * Frontend bundler config.
 * - Enables Vue SFC support.
 * - Defines '@' alias to '/src'.
 * - Uses fixed dev server port for predictable local setup.
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  build: {
    // ApexCharts is intentionally isolated as a lazy vendor chunk and is large by design.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("apexcharts") || id.includes("vue3-apexcharts")) {
            return "vendor-apexcharts";
          }

          if (id.includes("datatables.net")) {
            return "vendor-datatables";
          }

          if (id.includes("bootstrap") || id.includes("sweetalert2")) {
            return "vendor-ui";
          }

          if (id.includes("@tanstack") || id.includes("axios") || id.includes("pinia") || id.includes("vue-router")) {
            return "vendor-core";
          }

          return "vendor";
        }
      }
    }
  },
  server: {
    port: 5173
  }
});