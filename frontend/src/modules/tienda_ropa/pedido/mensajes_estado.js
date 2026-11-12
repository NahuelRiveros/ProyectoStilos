// ROP-62, ROP-64 y ROP-67: textos según el estado del pedido. Funciones puras (las prueba
// servidor/tests/ropa_web.test.mjs).

/** Link de seguimiento sin cuenta, o null si el pedido no tiene (pedidos anteriores al cambio). */
export const urlSeguimiento = (origen, clave) => (clave ? `${origen}/seguimiento/${clave}` : null);

/** ROP-67: qué pasa ahora, en una línea, para quien mira su pedido. */
export function queSigue({ estado, entrega }) {
  const envio = entrega === "envio";
  return {
    recibido: "Lo estamos revisando: te confirmamos la disponibilidad por WhatsApp.",
    confirmado: envio ? "Está confirmado y lo estamos preparando para enviarlo." : "Está confirmado. Te avisamos cuando esté listo para retirar.",
    listo_retirar: "¡Ya está listo! Podés pasar a retirarlo.",
    enviado: "Va en camino a tu domicilio.",
    entregado: "Entregado. ¡Gracias por tu compra!",
    cancelado: "Este pedido se canceló.",
  }[estado] ?? "";
}

const FRASE = {
  recibido: "lo recibimos y lo estamos revisando",
  confirmado: "está confirmado y lo estamos preparando",
  listo_retirar: "ya está listo para retirar",
  enviado: "ya salió para tu domicilio",
  entregado: "figura como entregado. ¡Gracias por tu compra!",
  cancelado: "se canceló",
};

/** ROP-64: mensaje que el local le manda al cliente desde el panel, con el link de seguimiento. */
export function mensajeEstadoCliente(pedido, negocio, url) {
  const nombre = String(pedido.nombre ?? "").trim().split(/\s+/)[0];
  return [
    `¡Hola${nombre ? ` ${nombre}` : ""}! Te escribimos de ${negocio} por tu pedido ${pedido.numero}: ${FRASE[pedido.estado] ?? "te contamos cómo va"}.`,
    ...(url ? [`Podés seguirlo acá: ${url}`] : []),
  ].join("\n");
}
