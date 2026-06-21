import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Split heavy third-party libraries into their own long-term-cacheable
        // chunks instead of one multi-megabyte bundle, so the browser can load
        // them in parallel and reuse them across route/code-split chunks.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react-big-calendar") || id.includes("date-fns")) {
            return "vendor-calendar";
          }
          if (id.includes("mantine-react-table") || id.includes("@tanstack")) {
            return "vendor-table";
          }
          if (id.includes("@mantine")) return "vendor-mantine";
          if (
            id.includes("xhtml2pdf") ||
            id.includes("jspdf") ||
            id.includes("html2canvas") ||
            id.includes("dompurify")
          ) {
            return "vendor-pdf";
          }
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("react-router") ||
            id.includes("redux")
          ) {
            return "vendor-react";
          }
          return "vendor";
        },
      },
    },
  },
});
