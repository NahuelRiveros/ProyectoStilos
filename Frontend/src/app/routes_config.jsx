// ================================================================
// FUENTE CENTRAL DE RUTAS — routes_config.jsx
//
// AGREGAR PÁGINA NUEVA:
//   • Pública / catálogo   → PUBLIC_ROUTES
//   • Requiere login       → AUTH_ROUTES
//   • Panel admin          → ADMIN_ROUTES  (+  adminConfig.modules en app_config.js)
//
// AGREGAR AL SIDEBAR ADMIN:
//   → agregar   nav: { label, icon }   al item en ADMIN_ROUTES
//   → el sidebar se deriva automáticamente de acá
// ================================================================

import {
  LayoutDashboard, Users, CreditCard, Package,
  Tags, Boxes, Home, MessageCircle, Wallet, Upload,
} from "lucide-react";

import { cartConfig } from "../config/app_config";

// ── Páginas públicas ─────────────────────────────────────────
import HomePage            from "../components/home/home_page";
import LoginPage           from "../pages/login_page";
import RegisterPage        from "../pages/register_page";
import ForgotPasswordPage  from "../pages/forgot_password_page";
import ResetPasswordPage   from "../pages/reset_password_page";
import CatalogPage         from "../pages/productos/catalog_page";
import ProductDetailPage   from "../pages/productos/product_detail_page";
import TestPage2           from "../pages/test_page2";

// ── Páginas de usuario autenticado ───────────────────────────
import DashboardPage from "../pages/dashboard_page";
import PerfilPage    from "../pages/perfil_page";
import CartPage      from "../cart/cart_page";
import CheckoutPage  from "../pages/productos/checkout_page";

// ── Páginas admin ─────────────────────────────────────────────
import AdminDashboardPage      from "../pages/admin/admin_dashboard_page";
import AdminUsuariosPage       from "../pages/admin/admin_usuarios_page";
import AdminSuscripcionPage    from "../pages/admin/admin_suscripcion_page";
import AdminProductsPage       from "../pages/admin/admin_products_page";
import AdminProductFormPage    from "../pages/admin/admin_product_form_page";
import AdminCatalogsPage       from "../pages/admin/catalogs/index";
import AdminStockAlertsPage    from "../pages/admin/admin_stock_alerts_page";
import AdminHomeConfigPage     from "../pages/admin/admin_home_config_page";
import AdminWhatsappConfigPage from "../pages/admin/admin_whatsapp_config_page";
import AdminMediosPagoPage     from "../pages/admin/admin_medios_pago_page";
import AdminImportPage         from "../pages/admin/admin_import_page";

// ================================================================
// RUTAS PÚBLICAS  (sin login)
// { index: true } → raíz "/"
// { path }        → ruta normal
// ================================================================
export const PUBLIC_ROUTES = [
  { index: true,                    element: <HomePage /> },
  { path: "login",                  element: <LoginPage /> },
  { path: "register",               element: <RegisterPage /> },
  { path: "forgot-password",        element: <ForgotPasswordPage /> },
  { path: "reset-password",         element: <ResetPasswordPage /> },
  { path: "catalogo",               element: <CatalogPage /> },
  { path: "catalogo/:categoria",    element: <CatalogPage /> },
  { path: "damas",                  element: <CatalogPage /> },
  { path: "damas/:categoria",       element: <CatalogPage /> },
  { path: "hombre",                 element: <CatalogPage /> },
  { path: "hombre/:categoria",      element: <CatalogPage /> },
  { path: "calzado",                element: <CatalogPage /> },
  { path: "calzado/:categoria",     element: <CatalogPage /> },
  { path: "producto/:id",           element: <ProductDetailPage /> },
  { path: ":genero",                element: <CatalogPage /> },
  { path: ":genero/:categoria",     element: <CatalogPage /> },
  { path: "test",                   element: <TestPage2 /> }, // ← borrar en producción
];

// ================================================================
// RUTAS CON LOGIN  (envueltas en <ProtectedRoute>)
// enabled + fallback → redirige si el módulo está desactivado
// ================================================================
export const AUTH_ROUTES = [
  { path: "dashboard",  element: <DashboardPage /> },
  { path: "perfil",     element: <PerfilPage />    },
  {
    path:     "carrito",
    element:  <CartPage />,
    enabled:  () => cartConfig.enableCart,
    fallback: "/catalogo",
  },
  {
    path:     "checkout",
    element:  <CheckoutPage />,
    enabled:  () => cartConfig.enableCheckout,
    fallback: "/catalogo",
  },
];

// ================================================================
// RUTAS ADMIN
//
// Propiedades de cada entrada:
//   module    → clave en adminConfig.modules (desactiva la ruta si es false)
//   path      → segmento de URL bajo /admin/ (omitir si index: true)
//   index     → true solo para el dashboard (ruta /admin exacta)
//   element   → componente de la página
//   nivelMin  → nivel mínimo requerido (50 = staff, 100 = admin)
//   soloSADM  → true: solo super-admin (ruta + sidebar)
//   nav       → si está presente, aparece en el sidebar
//     nav.label → texto del link
//     nav.icon  → ícono de lucide-react
//     nav.end   → true: solo activo en ruta exacta (solo dashboard)
//   extra     → sub-rutas del mismo módulo que NO aparecen en el sidebar
//
// PARA AGREGAR UNA PÁGINA ADMIN NUEVA:
//   1. Importar el componente arriba
//   2. Agregar una entrada en ADMIN_ROUTES con module, path, element, nivelMin, nav
//   3. Agregar   miModulo: true   en adminConfig.modules (src/config/app_config.js)
//   ¡Listo! Ruta y sidebar quedan configurados automáticamente.
// ================================================================
export const ADMIN_ROUTES = [
  {
    index:    true,
    module:   "dashboard",
    nivelMin: 50,
    nav:      { label: "Dashboard",   icon: LayoutDashboard, end: true },
    element:  <AdminDashboardPage />,
  },
  {
    path:     "productos",
    module:   "products",
    nivelMin: 50,
    nav:      { label: "Productos",   icon: Package },
    element:  <AdminProductsPage />,
    extra: [
      { path: "productos/nuevo",       nivelMin: 100, element: <AdminProductFormPage /> },
      { path: "productos/:id/editar",  nivelMin: 100, element: <AdminProductFormPage /> },
    ],
  },
  {
    path:     "stock-alertas",
    module:   "stockAlerts",
    nivelMin: 50,
    nav:      { label: "Stock",       icon: Boxes },
    element:  <AdminStockAlertsPage />,
  },
  {
    path:     "catalogos",
    module:   "catalogs",
    nivelMin: 100,
    nav:      { label: "Catalogos",   icon: Tags },
    element:  <AdminCatalogsPage />,
  },
  {
    path:     "home",
    module:   "home",
    nivelMin: 100,
    nav:      { label: "Home",        icon: Home },
    element:  <AdminHomeConfigPage />,
  },
  {
    path:     "whatsapp",
    module:   "whatsapp",
    nivelMin: 100,
    nav:      { label: "WhatsApp",    icon: MessageCircle },
    element:  <AdminWhatsappConfigPage />,
  },
  {
    path:     "medios-pago",
    module:   "mediosPago",
    nivelMin: 100,
    nav:      { label: "Medios pago", icon: Wallet },
    element:  <AdminMediosPagoPage />,
  },
  {
    path:     "importar",
    module:   "import",
    nivelMin: 100,
    nav:      { label: "Importar",    icon: Upload },
    element:  <AdminImportPage />,
  },
  {
    path:     "usuarios",
    module:   "users",
    nivelMin: 100,
    nav:      { label: "Usuarios",    icon: Users },
    element:  <AdminUsuariosPage />,
  },
  {
    path:     "suscripcion",
    module:   "subscription",
    soloSADM: true,
    nivelMin: 100,
    nav:      { label: "Suscripcion", icon: CreditCard },
    element:  <AdminSuscripcionPage />,
  },
];
