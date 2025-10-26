import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ✅ Combined version — keeps your proxy & adds PDF.js support
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
  optimizeDeps: {
    // ✅ Ensures pdf.js worker is pre-bundled.      include: ["pdfjs-dist/build/pdf.worker.min.mjs"],
    include: ["pdfjs-dist/legacy/build/pdf.worker.min.mjs"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});


