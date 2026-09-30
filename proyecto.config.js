// ÚNICO switch del proyecto. Lo leen frontend y servidor (vía compartido/proyecto.js).
// Nunca poner secretos acá: este archivo termina dentro del bundle del navegador.

// Medios de pago: los usan el checkout de la tienda, los cobros de pedidos y la Caja.
//   en_tienda: el cliente lo puede elegir al confirmar el pedido
//   descuento: % que se descuenta del total del pedido (lo calcula el servidor)
//   detalle:   aclaración que ve el cliente
//   logos:     claves de frontend/src/assets/medios_pago (visa, mastercard, cabal, naranja_x, mercado_pago, go_cuotas)
const MEDIOS_PAGO = [
  { valor: "transferencia", etiqueta: "Transferencia bancaria", en_tienda: true, descuento: 10, detalle: "Te mostramos el CBU y el alias al confirmar el pedido." },
  { valor: "efectivo", etiqueta: "Efectivo", en_tienda: true, descuento: 0, detalle: "Pagás al retirar o al recibir el pedido." },
  { valor: "mercado_pago", etiqueta: "Mercado Pago", en_tienda: true, descuento: 0, detalle: "Te enviamos un link de pago.", logos: ["mercado_pago"] },
  {
    valor: "tarjeta",
    etiqueta: "Tarjeta de crédito o débito",
    en_tienda: true,
    descuento: 0,
    detalle: "Te enviamos un link de pago o pagás con posnet al retirar.",
    logos: ["visa", "mastercard", "cabal", "naranja_x"],
  },
  { valor: "otro", etiqueta: "Otro medio", en_tienda: false, descuento: 0 },
];

export const proyecto = {
  // Carpeta de frontend/src/clientes/ con marca, tema, Home, navbar y footer.
  cliente: "stilos",

  // Define "qué día" es un cobro o un movimiento (un cobro a las 23:30 no pasa al día siguiente).
  zona_horaria: "America/Argentina/Buenos_Aires",

  // Módulos de negocio. Apagado = sin rutas en el servidor, sin pantallas ni navbar.
  // catalogo/stock/tienda se implementan en los pasos 3 a 5 de docs/WORKFLOW.md.
  modulos: {
    catalogo: true,
    stock: true,
    tienda: true,
    caja: true,
    // Mercado Pago: queda listo, pero sin credenciales (servidor/.env) no se ofrece el botón de pago.
    pagos_online: true,
  },

  usuarios: {
    registro_publico: true,
    contrasena_min: 8,
    contrasena_max: 72, // límite de bcrypt
  },

  catalogo: {
    // Cómo se llama "lo que se compra" en este rubro: "Presentación", "Variante", "Talle y color"...
    etiqueta_variante: "Talle y color",
    etiqueta_variantes: "Talles y colores",
    iva_por_defecto: 21,
    alicuotas_iva: [21, 10.5, 27, 0],
    productos_por_pagina: 24,
    max_niveles_categoria: 10,
    // Indumentaria: varias fotos por color en el mismo producto (ej. 15 colores de una remera).
    max_imagenes_producto: 40,
    // Cómo se arman las variantes:
    //   "presentacion" → texto libre ("500 g", "1 kg"). Distribuidoras.
    //   "talle_color"  → se eligen de las listas de Colores y Talles del panel (indumentaria).
    variantes: "talle_color",
    // Grupos que ofrece el botón "Cargar grupos sugeridos" en Catálogo → Talles (se pueden editar después).
    grupos_talle_sugeridos: [
      { nombre: "Ropa", talles: ["S", "M", "L", "XL", "XXL", "XXXL"] },
      { nombre: "Jeans", talles: ["36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56"] },
      { nombre: "Calzado", talles: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"] },
    ],
  },

  tienda: {
    catalogo_publico: true,
    carrito_invitado: true,
    // Filtro de categorías del catálogo: "arbol" = el árbol completo (distribuidoras, pocas categorías);
    // "niveles" = solo el nivel donde se está, con camino de migas y chips en el celular (indumentaria).
    filtro_categorias: "niveles",
    precios_con_iva: true,
    max_lineas_carrito: 200,
    max_cantidad_item: 9999,
    dias_vida_carrito: 15,
    // null = sin mínimo. Ej: 50000 para exigir un pedido mínimo de $ 50.000 (con IVA).
    pedido_minimo: null,
    // La entrega se coordina con el cliente: no se calcula costo de envío.
    modalidades_entrega: [
      { valor: "envio", etiqueta: "Envío a domicilio" },
      { valor: "retiro", etiqueta: "Retiro en el local" },
    ],
  },

  stock: {
    // Cuándo se descuenta el stock de un pedido: "envio_pedido" | "confirmacion" | "entrega"
    descontar_en: "confirmacion",
    // Tienda: false = "Disponible / Últimas unidades / Sin stock"; true = "Quedan N".
    mostrar_cantidad_en_tienda: false,
    // Tienda: true = los productos sin stock no se listan; false = se muestran marcados.
    ocultar_sin_stock: false,
    motivos_ajuste: ["Conteo de inventario", "Rotura", "Vencimiento", "Robo o faltante", "Corrección de carga", "Otro"],
  },

  // Flujo comercial (probado en DistribuCG). El cobro es independiente del estado:
  // se puede preparar o entregar "a cuenta".
  pedidos: {
    estados: {
      pendiente: { etiqueta: "Recibido", tono: "warning" },
      // Pagado online (o el negocio confirmó el pago) y esperando que lo preparen.
      pago_recibido: { etiqueta: "Pago recibido", tono: "success" },
      en_preparacion: { etiqueta: "En preparación", tono: "info" },
      entregado: { etiqueta: "Entregado", tono: "success" },
      cancelado: { etiqueta: "Cancelado", tono: "danger" },
    },
    transiciones: {
      pendiente: ["pago_recibido", "en_preparacion", "cancelado"],
      pago_recibido: ["en_preparacion", "cancelado"],
      en_preparacion: ["pendiente", "entregado", "cancelado"],
      entregado: ["en_preparacion"],
      cancelado: ["pendiente"],
    },
    // Estados a los que no se puede avanzar con el cobro pendiente. Ej: ["entregado"].
    estados_requieren_cobro: [],
    // Cambios "hacia atrás" o cancelaciones que exigen motivo.
    motivo_requerido: [
      "en_preparacion:pendiente",
      "entregado:en_preparacion",
      "cancelado:pendiente",
      "pendiente:cancelado",
      "pago_recibido:cancelado",
      "en_preparacion:cancelado",
    ],
    metodos_cobro: MEDIOS_PAGO,
  },

  // Pagos online (módulo pagos_online). Las credenciales van en servidor/.env (MERCADOPAGO_*):
  // sin ellas el botón "Pagar" no aparece y todo sigue como nota de pedido.
  pagos_online: {
    // El cliente elige al confirmar: pagar ahora online o coordinar el pago. También puede pagar
    // después desde "Mis pedidos" mientras quede saldo.
    // Solo los pedidos con estos medios de pago ofrecen el botón (el descuento de "transferencia"
    // no vale para un pago con tarjeta).
    medios: ["mercado_pago", "tarjeta"],
    // Al aprobarse el pago, un pedido "Recibido" pasa a este estado (null = queda como está).
    estado_al_aprobar: "pago_recibido",
  },

  // Caja: ingresos y egresos del negocio. Los cobros de pedidos entran solos como ingresos
  // (si el módulo tienda está activo); lo demás se carga a mano con su categoría.
  // Cómo se paga: se muestra en la ficha del producto y en el pedido.
  // ⚠️ TODO lo marcado EJEMPLO son datos de muestra: reemplazarlos por los reales antes de publicar.
  pagos: {
    medios: MEDIOS_PAGO,
    // Datos para transferir (no son secretos: se le muestran al cliente). null = no se muestran.
    datos_transferencia: {
      titular: "EJEMPLO S.A.",
      cuit: "30-00000000-7",
      banco: "Banco EJEMPLO",
      cbu: "0000000000000000000000",
      alias: "EJEMPLO.TIENDA.DEMO",
    },
    // Financiación. interes: % de recargo sobre el precio (0 = sin interés).
    // Con interés, la ley exige informar el CFT: completar "cft" (ej. "CFTEA 45,5 %").
    financiacion: [
      {
        nombre: "Mercado Pago",
        logos: ["mercado_pago"],
        medio: "mercado_pago",
        planes: [
          { cuotas: 3, interes: 0 },
          { cuotas: 6, interes: 0 },
          //{ cuotas: 12, interes: 35, cft: "CFTEA EJEMPLO" },
        ],
      },
      {
        nombre: "Tarjetas de crédito",
        logos: ["visa", "mastercard", "cabal", "naranja_x"],
        medio: "tarjeta",
        planes: [
          { cuotas: 3, interes: 0 },
          //{ cuotas: 6, interes: 15, cft: "CFTEA EJEMPLO" },
        ],
      },
      {
        nombre: "GoCuotas (tarjeta de débito)",
        logos: ["go_cuotas"],
        medio: "tarjeta",
        planes: [{ cuotas: 4, interes: 0 }],
      },
    ],
    // Promociones bancarias. dias: vacío = todos los días. hasta: último día vigente (AAAA-MM-DD).
    promociones: [
      { banco: "Banco EJEMPLO", detalle: "20% de reintegro con tarjeta de crédito", dias: ["jueves"], hasta: "2026-12-31", tope: "Tope $ 10.000 por mes" },
    ],
    // Cinta destacada en la ficha. null = se arma sola con el mejor descuento y la mejor cuota sin interés.
    cinta: null,
  },

  caja: {
    medios: MEDIOS_PAGO,
    // Etiqueta de los cobros de pedidos en el balance y el calendario.
    etiqueta_ventas_tienda: "Ventas de la tienda",
  },
};
