import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");
  const apiTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8000";
  return {
    plugins: [react()],
    resolve: { alias: { "@": resolve(root, "src") } },
    server: {
      host: "127.0.0.1",
      proxy: { "/api": { target: apiTarget, changeOrigin: false } },
    },
  };
});
