// Estados, pagos y formas de pago del pedido (spec 2026-11-cuentas-y-transferencias.md). Funciones
// puras: las prueba servidor/tests/ropa_web.test.mjs. Las mismas reglas las controla el servidor.

export const ETIQUETA_ESTADO = {
  recibido: "Recibido", confirmado: "Confirmado", listo_retirar: "Listo para retirar",
  enviado: "Enviado", entregado: "Entregado", cancelado: "Cancelado",
};
export const ETIQUETA_PAGO = { pendiente: "Pago pendiente", en_revision: "Comprobante en revisión", pagado: "Pagado" };
export const ETIQUETA_FORMA_PAGO = { transferencia: "Transferencia", efectivo: "Efectivo al retirar", coordinar: "A coordinar por WhatsApp" };

// Mismas reglas que servidor/src/modulos/tienda_ropa/reglas.js: acá solo deciden qué botones mostrar.
const TRANSICIONES = {
  recibido: ["confirmado", "cancelado"],
  confirmado: ["listo_retirar", "enviado", "recibido", "cancelado"],
  listo_retirar: ["entregado", "confirmado", "cancelado"],
  enviado: ["entregado", "confirmado", "cancelado"],
  entregado: ["confirmado"],
  cancelado: ["recibido"],
};
const ORDEN = { recibido: 0, confirmado: 1, listo_retirar: 2, enviado: 2, entregado: 3 };

/** A qué estados puede pasar el pedido (sin "Listo para retirar" si es envío, ni "Enviado" si retira). */
export const cambiosPosibles = ({ estado, entrega }) => (TRANSICIONES[estado] ?? [])
  .filter((e) => !(e === "listo_retirar" && entrega !== "retiro") && !(e === "enviado" && entrega !== "envio"));

/** ROP-54: cancelar, volver atrás o reabrir pide un motivo. */
export const pideMotivo = (desde, hacia) =>
  hacia === "cancelado" || desde === "cancelado" || desde === "entregado" || ORDEN[hacia] < ORDEN[desde];

/** Los pasos que ve el cliente, según cómo recibe el pedido. */
export const pasosDelPedido = (entrega) => ["recibido", "confirmado", entrega === "envio" ? "enviado" : "listo_retirar", "entregado"];

/** ROP-47: sin todos los datos bancarios no se ofrece transferencia. */
export const transferenciaDisponible = (datos) =>
  ["titular", "banco", "cbu", "alias", "cuit"].every((campo) => String(datos?.[campo] ?? "").trim() !== "");

/** ROP-44: qué formas de pago se ofrecen. Efectivo, solo si retira. */
export function formasDePago({ entrega, datosBancarios }) {
  return [
    ...(transferenciaDisponible(datosBancarios) ? ["transferencia"] : []),
    ...(entrega === "retiro" ? ["efectivo"] : []),
    "coordinar",
  ];
}

/** ROP-48: el cliente puede subir comprobante mientras el pedido siga abierto y sin pagar. */
export const puedeSubirComprobante = (pedido, max = 3) =>
  pedido.forma_pago === "transferencia" && pedido.estado !== "cancelado" && pedido.estado_pago !== "pagado"
  && (pedido.comprobantes?.length ?? 0) < max;

/** ROP-43: clave única por intento de envío; si se reintenta con la misma, el servidor no duplica el pedido. */
export const nuevaClaveEnvio = () => crypto.randomUUID();
