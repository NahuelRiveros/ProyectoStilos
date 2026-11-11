// Permisos de los rubros de ESTE proyecto (los del core están en core/permisos_config.js, que
// los suma a la misma lista). ⚠️ No cambiar un `codigo` existente: el arranque borra los que salen
// de la lista y, con ellos, lo que se haya tildado en el panel (PER-31).

// ── Tienda de ropa (ROP-20, ROP-57) ─────────────────────────────────────────────────
const TIENDA_ROPA = {
  grupos: [
    { codigo: "catalogo", nombre: "Catálogo" },
    { codigo: "pedidos", nombre: "Pedidos" },
  ],
  permisos: [
    // "productos.editar" también habilita subir fotos (upload_router del core).
    { codigo: "productos.editar", grupo: "catalogo", nombre: "Editar productos", descripcion: "Prendas, fotos, categorías, marcas, colores y talles.", porDefecto: ["supervisor"] },
    { codigo: "pedidos.ver", grupo: "pedidos", nombre: "Ver pedidos", descripcion: "Pedidos que llegaron por WhatsApp.", porDefecto: ["supervisor", "vendedor"] },
    { codigo: "pedidos.gestionar", grupo: "pedidos", nombre: "Gestionar pedidos", descripcion: "Cambiar el estado de los pedidos (confirmar, enviar, entregar, cancelar).", porDefecto: ["supervisor", "vendedor"], requiere: ["pedidos.ver"] },
    // ROP-57: mover dinero es aparte: el Vendedor ve los comprobantes pero no marca pagos.
    { codigo: "pagos.registrar", grupo: "pedidos", nombre: "Registrar pagos", descripcion: "Aceptar o rechazar comprobantes y marcar pedidos como pagados.", porDefecto: ["supervisor"], requiere: ["pedidos.ver"] },
  ],
};

export const PERMISOS_DE_RUBROS = [TIENDA_ROPA];
