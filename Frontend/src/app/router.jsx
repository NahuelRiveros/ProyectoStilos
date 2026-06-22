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
import AdminHomeConfigPage      from "../pages/admin/admin_home_config_page";
import AdminWhatsappConfigPage  from "../pages/admin/admin_whatsapp_config_page";
import AdminMediosPagoPage     from "../pages/admin/admin_medios_pago_page";

import CatalogPage from "../pages/productos/catalog_page";
import ProductDetailPage from "../pages/productos/product_detail_page";
import CartPage from "../cart/cart_page";
import CheckoutPage from "../pages/productos/checkout_page";
import { adminConfig, cartConfig } from "../config/app_config";

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

      ...(adminConfig.enabled ? [{
        path: "admin",
        element: (
          <ProtectedRoute nivel={100}>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminDashboardPage /> },
          ...(adminConfig.modules.users ? [{ path: "usuarios", element: <AdminUsuariosPage /> }] : []),
          ...(adminConfig.modules.subscription ? [{
            path: "suscripcion",
            element: (
              <ProtectedRoute roles={["SADM"]}>
                <AdminSuscripcionPage />
              </ProtectedRoute>
            ),
          }] : []),
          ...(adminConfig.modules.products ? [
            { path: "productos", element: <AdminProductsPage /> },
            { path: "productos/nuevo", element: <AdminProductFormPage /> },
            { path: "productos/:id/editar", element: <AdminProductFormPage /> },
          ] : []),
          ...(adminConfig.modules.catalogs ? [{ path: "catalogos", element: <AdminCatalogsPage /> }] : []),
          ...(adminConfig.modules.stockAlerts ? [{ path: "stock-alertas", element: <AdminStockAlertsPage /> }] : []),
          ...(adminConfig.modules.home ? [{ path: "home", element: <AdminHomeConfigPage /> }] : []),
          ...(adminConfig.modules.whatsapp    ? [{ path: "whatsapp",    element: <AdminWhatsappConfigPage /> }] : []),
          ...(adminConfig.modules.mediosPago ? [{ path: "medios-pago", element: <AdminMediosPagoPage />    }] : []),
        ],
      }] : []),

      {
        path: "carrito",
        element: cartConfig.enableCart
          ? <ProtectedRoute><CartPage /></ProtectedRoute>
          : <Navigate to="/catalogo" replace />,
      },
      {
        path: "checkout",
        element: cartConfig.enableCheckout
          ? <ProtectedRoute><CheckoutPage /></ProtectedRoute>
          : <Navigate to="/catalogo" replace />,
      },
{ path: ":genero", element: <CatalogPage /> },
      { path: ":genero/:categoria", element: <CatalogPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
