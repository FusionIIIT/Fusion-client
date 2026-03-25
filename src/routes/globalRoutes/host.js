// Single source of truth for backend base URL.
// Keep this file free of React/component imports to avoid circular dependencies.

export const host = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";
