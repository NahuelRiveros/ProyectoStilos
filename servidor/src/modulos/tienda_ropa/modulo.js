import {
  CategoriaRopa, MarcaRopa, ColorRopa, GrupoTalle, Talle, GrupoCaracteristica, Caracteristica, GrupoCaracteristicaCategoria,
  Prenda, PrendaCaracteristica, PrendaVariante, PrendaImagen, PedidoWhatsapp, PedidoWhatsappItem,
  PedidoRopaHistorial, PedidoRopaComprobante, ClienteRopa,
} from "./models/index.js";
import { catalogoRopaRouter } from "./routes/catalogo_router.js";
import { panelRopaRouter } from "./routes/panel_router.js";
import { pedidosRopaRouter } from "./routes/pedidos_router.js";
import { miCuentaRopaRouter } from "./routes/mi_cuenta_router.js";

// Lo que el core necesita saber de este rubro (ver servidor/src/proyecto/modulos.js).
// Spec: docs/specs/cambios/2026-11-catalogo-ropa.md.
export const moduloTiendaRopa = {
  codigo: "tienda_ropa",
  descripcion: "Tienda de ropa",

  // Orden de creación: cada tabla después de las que referencia.
  modelos: [
    GrupoTalle,
    Talle,              // talle → grupo_talle
    CategoriaRopa,      // categoria_ropa → grupo_talle (talles sugeridos)
    MarcaRopa, ColorRopa,
    GrupoCaracteristica,
    Caracteristica,     // caracteristica → grupo_caracteristica
    GrupoCaracteristicaCategoria, // → grupo_caracteristica, categoria_ropa
    Prenda,             // prenda → categoria_ropa, marca_ropa, grupo_talle
    PrendaCaracteristica, // → prenda, caracteristica
    PrendaVariante,     // prenda_variante → prenda, color_ropa, talle
    PrendaImagen,       // prenda_imagen → prenda, color_ropa
    PedidoWhatsapp,     // pedido_whatsapp → usuario (core)
    PedidoWhatsappItem, // pedido_whatsapp_item → pedido_whatsapp, prenda
    PedidoRopaHistorial,   // → pedido_whatsapp, usuario
    PedidoRopaComprobante, // → pedido_whatsapp, usuario
    ClienteRopa,           // → usuario
  ],

  rutas: [
    ["/ropa/catalogo", catalogoRopaRouter], // tienda pública y envío de pedidos
    ["/ropa/panel", panelRopaRouter],       // catálogo del panel
    ["/ropa/pedidos", pedidosRopaRouter],   // pedidos recibidos
    ["/ropa/mi-cuenta", miCuentaRopaRouter], // datos y pedidos del cliente que ingresó
  ],
};
