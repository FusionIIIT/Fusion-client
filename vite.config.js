import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  esbuild:
    mode === "production"
      ? { pure: ["console.log", "console.debug", "console.info"] }
      : {},
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Emit a single JS bundle (no code-split chunks). The static test
        // server was returning 404 for hashed dynamic-import chunks (stale /
        // partial deploys leave the index referencing chunk files that aren't
        // present), which blanked the app. One bundle has nothing to 404 on and
        // loads in a single request — the most robust shape for this host.
        inlineDynamicImports: true,
      },
    },
  },
}));
