// ── Configuración de WhatsApp ─────────────────────────────────────────────
// Cambiar WHATSAPP_NUMBER por el número de la tienda (con código de país, sin +).
// Ejemplo Argentina: "5493704123456"  →  +54 9 370 412-3456

export const WHATSAPP_NUMBER = "5493704000000";   // ← CAMBIAR POR EL NÚMERO REAL

export const WHATSAPP_GREETING =
  "Hola! Me interesan estos productos de Angar:";

export const WHATSAPP_CLOSING =
  "¿Podrían confirmarme disponibilidad y formas de pago/entrega? ¡Gracias!";

// Abre WhatsApp con un mensaje ya armado
export function abrirWhatsApp(mensaje) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// Construye el mensaje a partir de una lista de ítems
// item = { nombre, talle, color, precio, cantidad }
export function buildWhatsAppMessage(items) {
  const fmt = (n) => `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

  const lineas = items.map((item) => {
    const detalles = [
      item.talle  ? `Talle ${item.talle}`   : null,
      item.color  ? `Color ${item.color}`   : null,
      item.cantidad > 1 ? `x${item.cantidad}` : null,
    ].filter(Boolean).join(" · ");

    return `• ${item.nombre}${detalles ? ` (${detalles})` : ""} — ${fmt(item.precio)}`;
  });

  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);

  return [
    WHATSAPP_GREETING,
    "",
    ...lineas,
    "",
    `Total estimado: ${fmt(total)}`,
    "",
    WHATSAPP_CLOSING,
  ].join("\n");
}
