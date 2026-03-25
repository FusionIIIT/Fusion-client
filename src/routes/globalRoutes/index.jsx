import Login from "../../pages/login.jsx";
import { host } from "./host";

// Backend API Routes
export { host };
export const authRoute = `${host}/api/auth/me/`;
export const loginRoute = `${host}/api/auth/login/`;
export const mediaRoute = `${host}/media/`;
export const resetPasswordRoute = `${host}/api/auth/password-reset/`;
export const changePassowordRoute = `${host}/api/auth/password-reset-confirm/`;

// Frontend React Routes (Exported as an Array)
export const globalAppRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <Login />,
  },
];
