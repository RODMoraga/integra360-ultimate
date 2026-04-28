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
  server: {
    port: 5173
  }
});