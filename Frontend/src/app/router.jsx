import { createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout       from "../layouts/app_layout";
import ProtectedRoute  from "./protected_route";

import HomePage           from "../pages/home_page";
import LoginPage          from "../pages/login_page";
import RegisterPage       from "../pages/register_page";
import ForgotPasswordPage from "../pages/forgot_password_page";
import ResetPasswordPage  from "../pages/reset_password_page";
import DashboardPage      from "../pages/dashboard_page";
import PerfilPage         from "../pages/perfil_page";
import TestPage           from "../pages/test_page";
import TestPage2          from "../pages/test_page2";

import AdminLayout          from "../pages/admin/admin_layout";
import AdminDashboardPage   from "../pages/admin/admin_dashboard_page";
import AdminUsuariosPage    from "../pages/admin/admin_usuarios_page";
import AdminSuscripcionPage from "../pages/admin/admin_suscripcion_page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true,              element: <HomePage /> },
      { path: "login",            element: <LoginPage /> },
      { path: "register",         element: <RegisterPage /> },
      { path: "forgot-password",  element: <ForgotPasswordPage /> },
      { path: "reset-password",   element: <ResetPasswordPage /> },

      {
        path: "dashboard",
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
      },
      {
        path: "perfil",
        element: <ProtectedRoute><PerfilPage /></ProtectedRoute>,
      },

      // ── Admin area (nivel 100 / ADM) ──────────────────────────
      {
        path: "admin",
        element: (
          <ProtectedRoute roles={["ADM"]}>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true,           element: <AdminDashboardPage /> },
          { path: "usuarios",      element: <AdminUsuariosPage /> },
          { path: "suscripcion",   element: <AdminSuscripcionPage /> },
        ],
      },

      // ── Dev / test ────────────────────────────────────────────
      {
        path: "test",
        element: <ProtectedRoute roles={["ADM"]}><TestPage /></ProtectedRoute>,
      },
      { path: "test2", element: <TestPage2 /> },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
