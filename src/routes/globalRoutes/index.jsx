// Use environment variable for API host, fallback to localhost
const apiHost = import.meta.env.VITE_API_HOST || "http://127.0.0.1:8000";

export const host = apiHost;
export const authRoute = `${host}/api/auth/me`;
export const loginRoute = `${host}/api/auth/login/`;
export const mediaRoute = `${host}/media/`;
export const resetPasswordRoute = `${host}/api/auth/password-reset/`;
export const changePassowordRoute = `${host}/api/auth/password-reset-confirm/`;
