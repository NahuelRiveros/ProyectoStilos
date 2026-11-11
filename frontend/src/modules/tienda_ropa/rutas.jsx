import { lazy } from "react";
import { protegida } from "../../core/app/routes/route_helpers.jsx";

const CatalogoPage = lazy(() => import("./tienda/catalogo_page.jsx"));
const PrendaPage = lazy(() => import("./tienda/prenda_page.jsx"));
const PedidoPage = lazy(() => import("./pedido/pedido_page.jsx"));
const MisDatosPage = lazy(() => import("./cuenta/mis_datos_page.jsx"));
const MisPedidosPage = lazy(() => import("./cuenta/mis_pedidos_page.jsx"));
const MiPedidoPage = lazy(() => import("./cuenta/mi_pedido_page.jsx"));
const PrendasPage = lazy(() => import("./admin/prendas_page.jsx"));
const PrendaFormPage = lazy(() => import("./admin/prenda_form_page.jsx"));
const CategoriasPage = lazy(() => import("./admin/categorias_page.jsx"));
const PedidosPage = lazy(() => import("./admin/pedidos_page.jsx"));
const listas = () => import("./admin/listas_pages.jsx");
const MarcasPage = lazy(() => listas().then((m) => ({ default: m.MarcasPage })));
const DisenosPage = lazy(() => listas().then((m) => ({ default: m.DisenosPage })));
const ColoresPage = lazy(() => listas().then((m) => ({ default: m.ColoresPage })));
const TallesPage = lazy(() => listas().then((m) => ({ default: m.TallesPage })));

// La web oculta lo que no corresponde; el servidor vuelve a controlar cada permiso.
const CATALOGO = { permisos: ["productos.editar"] };
const PEDIDOS = { permisos: ["pedidos.ver"] };

export const rutasTienda = [
  { path: "/catalogo", element: <CatalogoPage /> },
  { path: "/catalogo/:slug", element: <PrendaPage /> },
  { path: "/pedido", element: <PedidoPage /> },
  // Cuenta del cliente (ROP-41 a ROP-53): piden ingresar; el servidor controla que cada pedido sea suyo.
  { path: "/mi-cuenta", element: protegida(<MisDatosPage />) },
  { path: "/mis-pedidos", element: protegida(<MisPedidosPage />) },
  { path: "/mis-pedidos/:id", element: protegida(<MiPedidoPage />) },
];

export const rutasPanel = [
  { path: "/admin/ropa/prendas", element: protegida(<PrendasPage />, CATALOGO) },
  { path: "/admin/ropa/prendas/nueva", element: protegida(<PrendaFormPage />, CATALOGO) },
  { path: "/admin/ropa/prendas/:id", element: protegida(<PrendaFormPage />, CATALOGO) },
  { path: "/admin/ropa/categorias", element: protegida(<CategoriasPage />, CATALOGO) },
  { path: "/admin/ropa/marcas", element: protegida(<MarcasPage />, CATALOGO) },
  { path: "/admin/ropa/disenos", element: protegida(<DisenosPage />, CATALOGO) },
  { path: "/admin/ropa/colores", element: protegida(<ColoresPage />, CATALOGO) },
  { path: "/admin/ropa/talles", element: protegida(<TallesPage />, CATALOGO) },
  { path: "/admin/ropa/pedidos", element: protegida(<PedidosPage />, PEDIDOS) },
];
