import { brandConfig } from "./brand_config";
import { storeConfig } from "./store_config";

// [WHATSAPP] Numero de la tienda con codigo de pais, sin "+". Ejemplo Argentina: "5493704123456"
export const WHATSAPP_NUMBER = "5493704784641";

export const whatsappConfig = {
  // [WHATSAPP] Numero de destino al que se abre el chat
  phone: WHATSAPP_NUMBER,
  // [WHATSAPP / CARRITO] Saludo inicial del mensaje generado automaticamente
  greeting: `Hola! Me interesan estos productos de ${brandConfig.name}:`,
  // [WHATSAPP / CARRITO] Cierre del mensaje generado automaticamente
  closing: "Podrian confirmarme disponibilidad y formas de pago/entrega? Gracias!",
  // [WHATSAPP / CARRITO] Incluye el precio por item en el cuerpo del mensaje
  includePrice: storeConfig.enablePrices,
  // [WHATSAPP / CARRITO] Incluye el total estimado al final del mensaje
  includeTotal: storeConfig.enablePrices,
  // [WHATSAPP / CARRITO] Incluye la URL del producto en el mensaje
  includeProductUrl: false,
};

export const WHATSAPP_GREETING = whatsappConfig.greeting;
export const WHATSAPP_CLOSING = whatsappConfig.closing;

export function abrirWhatsApp(mensaje) {
  const url = `https://wa.me/${whatsappConfig.phone}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function buildWhatsAppMessage(items) {
  const fmt = (n) => `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

  const lineas = items.map((item) => {
    const detalles = [
      item.talle ? `Talle ${item.talle}` : null,
      item.color ? `Color ${item.color}` : null,
      item.cantidad > 1 ? `x${item.cantidad}` : null,
    ].filter(Boolean).join(" - ");

    const precio = whatsappConfig.includePrice ? ` - ${fmt(item.precio)}` : "";
    return `- ${item.nombre}${detalles ? ` (${detalles})` : ""}${precio}`;
  });

  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const message = [whatsappConfig.greeting, "", ...lineas];

  if (whatsappConfig.includeTotal) {
    message.push("", `Total estimado: ${fmt(total)}`);
  }

  message.push("", whatsappConfig.closing);
  return message.join("\n");
}
