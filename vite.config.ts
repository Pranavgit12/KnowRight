import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: resolve(root, "app/frontend"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(root, "app/frontend/src"),
    },
  },
  server: {
    host: "127.0.0.1",
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
  build: {
    outDir: resolve(root, "app/frontend/dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three/")) return "three-vendor";
          if (id.includes("node_modules/@react-three/")) return "react-three-vendor";
          if (id.includes("node_modules/framer-motion/") || id.includes("node_modules/gsap/")) {
            return "motion-vendor";
          }
          return undefined;
        },
      },
    },
  },
});
