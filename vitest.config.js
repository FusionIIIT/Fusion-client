/// <reference types="vitest" />
// eslint-disable-next-line import/no-unresolved
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Test config kept separate from vite.config.js so the production build is
// never affected by test settings.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    css: false,
  },
});
