// Same-origin in production (VITE_API_HOST="" in .env.production → "/api/...",
// proxied to gunicorn by nginx). Falls back to local gunicorn for dev.
export const host = import.meta.env.VITE_API_HOST ?? "http://127.0.0.1:8000";
// Public emailed links: same-origin in prod (no :8000, nginx-proxied), gunicorn in dev.
export const dynamicApiHost = import.meta.env.PROD
  ? window.location.origin
  : "http://127.0.0.1:8000";
export const authRoute = `${host}/api/auth/me`;
export const loginRoute = `${host}/api/auth/login/`;
export const mediaRoute = `${host}/media/`;

// OTP-based password reset
export const passwordResetSendOtp = `${host}/api/auth/password-reset/send-otp/`;
export const passwordResetVerifyOtp = `${host}/api/auth/password-reset/verify-otp/`;
export const passwordResetReset = `${host}/api/auth/password-reset/reset/`;
