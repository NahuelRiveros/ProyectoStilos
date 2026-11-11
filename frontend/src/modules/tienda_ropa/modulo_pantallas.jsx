import { lazy } from "react";
import { rutasTienda, rutasPanel } from "./rutas.jsx";
import PedidoProvider from "./pedido/pedido_provider.jsx";
import PedidoIcono from "./pedido/pedido_icono.jsx";

// Pantallas y componentes que el core monta para este rubro (ver proyecto/pantallas_modulos.jsx).
export const pantallasTiendaRopa = {
  codigo: "tienda_ropa",
  rutasTienda,
  rutasPanel,
  Proveedor: PedidoProvider,
  extrasNavbar: [PedidoIcono],
  ResumenPanel: lazy(() => import("./admin/resumen_panel.jsx")),
  InicioTienda: lazy(() => import("./tienda/inicio_tienda.jsx")),
};
