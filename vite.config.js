import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Let Rollup chunk automatically. A hand-rolled manualChunks that split the
    // React runtime (react / react-dom / scheduler / use-sync-external-store /
    // react-redux) across separate chunks caused an init-order crash in the
    // production build ("Cannot read properties of undefined (reading
    // 'useSyncExternalStore')") and a blank page. The big load-time win comes
    // from the lazy-loaded placement tabs, which split regardless of this.
    chunkSizeWarningLimit: 1500,
  },
});
