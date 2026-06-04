import { createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout from "../layouts/app_layout";
import ProtectedRoute from "./protected_route";

import HomePage from "../pages/home_page";
import LoginPage from "../pages/login_page";
import RegisterPage from "../pages/register_page";
import ForgotPasswordPage from "../pages/forgot_password_page";
import ResetPasswordPage from "../pages/reset_password_page";
import DashboardPage from "../pages/dashboard_page";
import PerfilPage from "../pages/perfil_page";

import AdminLayout from "../pages/admin/admin_layout";
import AdminDashboardPage from "../pages/admin/admin_dashboard_page";
import AdminUsuariosPage from "../pages/admin/admin_usuarios_page";
import AdminSuscripcionPage from "../pages/admin/admin_suscripcion_page";
import AdminProductsPage from "../pages/admin/admin_products_page";
import AdminProductFormPage from "../pages/admin/admin_product_form_page";
import AdminCatalogsPage from "../pages/admin/admin_catalogs_page";
import AdminStockAlertsPage from "../pages/admin/admin_stock_alerts_page";
import AdminHomeConfigPage from "../pages/admin/admin_home_config_page";

import CatalogPage from "../pages/productos/catalog_page";
import ProductDetailPage from "../pages/productos/product_detail_page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },

      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "perfil",
        element: (
          <ProtectedRoute>
            <PerfilPage />
          </ProtectedRoute>
        ),
      },

      { path: "catalogo", element: <CatalogPage /> },
      { path: "catalogo/:categoria", element: <CatalogPage /> },
      { path: "damas", element: <CatalogPage /> },
      { path: "damas/:categoria", element: <CatalogPage /> },
      { path: "hombre", element: <CatalogPage /> },
      { path: "hombre/:categoria", element: <CatalogPage /> },
      { path: "calzado", element: <CatalogPage /> },
      { path: "calzado/:categoria", element: <CatalogPage /> },
      { path: "producto/:id", element: <ProductDetailPage /> },

      {
        path: "admin",
        element: (
          <ProtectedRoute roles={["ADM"]}>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "usuarios", element: <AdminUsuariosPage /> },
          { path: "suscripcion", element: <AdminSuscripcionPage /> },
          { path: "productos", element: <AdminProductsPage /> },
          { path: "productos/nuevo", element: <AdminProductFormPage /> },
          { path: "productos/:id/editar", element: <AdminProductFormPage /> },
          { path: "catalogos", element: <AdminCatalogsPage /> },
          { path: "stock-alertas", element: <AdminStockAlertsPage /> },
          { path: "home", element: <AdminHomeConfigPage /> },
        ],
      },

      { path: "carrito", element: <Navigate to="/catalogo" replace /> },
      { path: "checkout", element: <Navigate to="/catalogo" replace /> },
      { path: "test", element: <Navigate to="/catalogo" replace /> },
      { path: "test2", element: <Navigate to="/catalogo" replace /> },
      { path: ":genero", element: <CatalogPage /> },
      { path: ":genero/:categoria", element: <CatalogPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
