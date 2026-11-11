import {
  CategoriaRopa, MarcaRopa, ColorRopa, GrupoTalle, Talle,
  Prenda, PrendaVariante, PrendaImagen, PedidoWhatsapp, PedidoWhatsappItem,
} from "./models/index.js";
import { catalogoRopaRouter } from "./routes/catalogo_router.js";
import { panelRopaRouter } from "./routes/panel_router.js";
import { pedidosRopaRouter } from "./routes/pedidos_router.js";

// Lo que el core necesita saber de este rubro (ver servidor/src/proyecto/modulos.js).
// Spec: docs/specs/cambios/2026-11-catalogo-ropa.md.
export const moduloTiendaRopa = {
  codigo: "tienda_ropa",
  descripcion: "Tienda de ropa",

  // Orden de creación: cada tabla después de las que referencia.
  modelos: [
    CategoriaRopa, MarcaRopa, ColorRopa, GrupoTalle,
    Talle,              // talle → grupo_talle
    Prenda,             // prenda → categoria_ropa, marca_ropa, grupo_talle
    PrendaVariante,     // prenda_variante → prenda, color_ropa, talle
    PrendaImagen,       // prenda_imagen → prenda, color_ropa
    PedidoWhatsapp,
    PedidoWhatsappItem, // pedido_whatsapp_item → pedido_whatsapp, prenda
  ],

  rutas: [
    ["/ropa/catalogo", catalogoRopaRouter], // tienda pública y envío de pedidos
    ["/ropa/panel", panelRopaRouter],       // catálogo del panel
    ["/ropa/pedidos", pedidosRopaRouter],   // pedidos recibidos
  ],
};
