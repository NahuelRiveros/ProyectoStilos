// WHATSAPP
// Número de contacto y texto del mensaje que se genera cuando el cliente consulta.

import { brandConfig } from "./brand_config";
import { storeConfig } from "./store_config";

// Número de WhatsApp del negocio — sin "+" y con código de país.
// Argentina: 54 + 9 + código de área sin 0 + número sin 15
// Ejemplo: +54 9 370 478-4641 → "5493704784641"
export const WHATSAPP_NUMBER = "5493704784641";

export const whatsappConfig = {
  // Número al que se abre el chat cuando el cliente consulta
  phone: WHATSAPP_NUMBER,

  // Saludo al inicio del mensaje generado automáticamente
  greeting: `Hola! Me interesan estos productos de ${brandConfig.name}:`,

  // Cierre del mensaje generado automáticamente
  closing: "¿Podrían confirmarme disponibilidad y formas de pago/entrega? Gracias!",

  // Incluir el precio por producto en el mensaje
  includePrice: storeConfig.enablePrices,

  // Incluir el total estimado al final del mensaje
  includeTotal: storeConfig.enablePrices,

  // Incluir la URL del producto en el mensaje
  includeProductUrl: false,
};

// Abre WhatsApp con un mensaje ya escrito.
// Pasar `phone` para usar la config del servidor; si no se pasa usa el valor del archivo.
export function abrirWhatsApp(mensaje, phone = whatsappConfig.phone) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// Arma el texto del mensaje con la lista de productos del carrito de consulta.
// Pasar `config` para usar la config del servidor; si no se pasa usa los valores del archivo.
export function buildWhatsAppMessage(items, config = whatsappConfig) {
  const fmt = (n) => `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

  const lineas = items.map((item) => {
    const detalles = [
      item.talle    ? `Talle ${item.talle}`    : null,
      item.color    ? `Color ${item.color}`    : null,
      item.cantidad > 1 ? `x${item.cantidad}` : null,
    ].filter(Boolean).join(" - ");

    const precio = config.includePrice ? ` - ${fmt(item.precio)}` : "";
    return `- ${item.nombre}${detalles ? ` (${detalles})` : ""}${precio}`;
  });

  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const message = [config.greeting, "", ...lineas];

  if (config.includeTotal) {
    message.push("", `Total estimado: ${fmt(total)}`);
  }

  message.push("", config.closing);
  return message.join("\n");
}
