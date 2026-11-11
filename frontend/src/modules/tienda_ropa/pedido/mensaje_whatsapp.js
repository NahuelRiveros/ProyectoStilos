import { formatearPrecio } from "../utils/dinero.js";
import { textoEntrega } from "./entrega.js";

/**
 * ROP-14: texto que el cliente le manda al negocio. Usa el pedido que devolvió el servidor (número,
 * precios y total de la base), así el negocio lo encuentra en el panel por su número.
 */
export function mensajePedido(pedido, negocio) {
  const lineas = pedido.items.map((i) => `• ${i.cantidad} × ${i.nombre_prenda} (${i.color}, talle ${i.talle}): ${formatearPrecio(i.subtotal)}`);
  return [
    `¡Hola ${negocio}! Te envío mi pedido ${pedido.numero}:`,
    ...lineas,
    `Total: ${formatearPrecio(pedido.total)}`,
    `Entrega: ${textoEntrega(pedido)}`,
    ...(pedido.entrega === "envio" ? [pedido.envio_gratis ? "Envío gratis." : "¿Cuánto sale el envío?"] : []),
    `A nombre de: ${pedido.nombre}`,
    "¿Me confirmás si hay disponibilidad? Gracias.",
  ].join("\n");
}

/** Link de WhatsApp con el mensaje escrito. `numero`: con código de país, sin "+" ni espacios. */
export const linkWhatsapp = (numero, texto) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
