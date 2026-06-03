import { createBrowserRouter } from "react-router-dom";
import type { ReactNode } from "react";

import AppLayout   from "../layouts/app_layout";
import AdminLayout from "../layouts/admin_layout";

// ── Páginas públicas ─────────────────────────────────────────────────────────
import HomePage          from "../pages/home_page";
import LoginPage         from "../pages/login_page";
import RegisterPage      from "../pages/register_page";
import CatalogPage       from "../pages/productos/catalog_page";
import ProductDetailPage from "../pages/productos/product_detail_page";
import TestPage          from "../pages/test_page";
import TestPage2         from "../pages/test_page2";

// ── Páginas de usuario ───────────────────────────────────────────────────────
import CartPage              from "../pages/productos/cart_page";
import CheckoutPage          from "../pages/productos/checkout_page";
import OrderConfirmationPage from "../pages/order_confirmation_page";
import OrdersPage            from "../pages/orders_page";
import ProfilePage           from "../pages/profile_page";

// ── Páginas de admin ─────────────────────────────────────────────────────────
import AdminDashboardPage    from "../pages/admin/admin_dashboard_page";
import AdminProductsPage     from "../pages/admin/admin_products_page";
import AdminProductFormPage  from "../pages/admin/admin_product_form_page";
import AdminOrdersPage       from "../pages/admin/admin_orders_page";
import AdminCatalogsPage     from "../pages/admin/admin_catalogs_page";
import AdminComprobantesPage from "../pages/admin/admin_comprobantes_page";
import AdminStockAlertsPage  from "../pages/admin/admin_stock_alerts_page";
import AdminHomeConfigPage   from "../pages/admin/admin_home_config_page";

function withLayout(element: ReactNode) {
  return <AppLayout>{element}</AppLayout>;
}

export const router = createBrowserRouter([
  // ── PÚBLICAS ─────────────────────────────────────────────────────────────
  { path: "/",         element: withLayout(<HomePage />) },
  { path: "/login",    element: withLayout(<LoginPage />) },
  { path: "/register", element: withLayout(<RegisterPage />) },
  { path: "/test",     element: withLayout(<TestPage />) },
  { path: "/test2",    element: withLayout(<TestPage2 />) },

  // Catálogo y detalle de producto
  { path: "/catalogo",                        element: withLayout(<CatalogPage />) },
  { path: "/damas",                           element: withLayout(<CatalogPage />) },
  { path: "/hombre",                          element: withLayout(<CatalogPage />) },
  { path: "/calzado",                         element: withLayout(<CatalogPage />) },
  { path: "/damas/:categoria",                element: withLayout(<CatalogPage />) },
  { path: "/hombre/:categoria",               element: withLayout(<CatalogPage />) },
  { path: "/calzado/:categoria",              element: withLayout(<CatalogPage />) },
  { path: "/damas/:categoria/:sub",           element: withLayout(<CatalogPage />) },
  { path: "/hombre/:categoria/:sub",          element: withLayout(<CatalogPage />) },
  { path: "/calzado/:categoria/:sub",         element: withLayout(<CatalogPage />) },
  { path: "/producto/:id",                    element: withLayout(<ProductDetailPage />) },

  // ── USUARIO ───────────────────────────────────────────────────────────────
  { path: "/carrito",                   element: withLayout(<CartPage />) },
  { path: "/checkout",                  element: withLayout(<CheckoutPage />) },
  { path: "/confirmacion/:ordenId",     element: withLayout(<OrderConfirmationPage />) },
  { path: "/mis-ordenes",               element: withLayout(<OrdersPage />) },
  { path: "/mi-cuenta",                 element: withLayout(<ProfilePage />) },

  // ── ADMIN (layout propio con sidebar — sin AppLayout) ────────────────────
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true,                    element: <AdminDashboardPage /> },
      { path: "productos",              element: <AdminProductsPage /> },
      { path: "productos/nuevo",        element: <AdminProductFormPage /> },
      { path: "productos/:id/editar",   element: <AdminProductFormPage /> },
      { path: "ordenes",                element: <AdminOrdersPage /> },
      { path: "catalogos",              element: <AdminCatalogsPage /> },
      { path: "comprobantes",           element: <AdminComprobantesPage /> },
      { path: "stock",                  element: <AdminStockAlertsPage /> },
      { path: "home",                   element: <AdminHomeConfigPage /> },
    ],
  },

  { path: "*", element: withLayout(<HomePage />) },
]);
