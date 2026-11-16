// ROP-70 a ROP-73: reglas del inicio de la tienda. Funciones puras (las prueba servidor/tests/ropa_web.test.mjs).
import { enOferta, formatearPrecio } from "./dinero.js";

/** ROP-73: "-35%" redondeado; null si no está en oferta. */
export function porcentajeDescuento(prenda) {
  if (!enOferta(prenda)) return null;
  const antes = Number(prenda.precio_anterior);
  const ahora = Number(prenda.precio);
  if (!(antes > ahora && ahora > 0)) return null;
  return Math.round((1 - ahora / antes) * 100);
}

/** ROP-70: lo que se ofrece, según la configuración del cliente. */
export function beneficiosTienda({ envioGratisDesde, whatsapp }) {
  return [
    ...(envioGratisDesde ? [{ id: "envio", titulo: "Envío gratis", texto: `En compras desde ${formatearPrecio(envioGratisDesde)}` }] : []),
    ...(whatsapp ? [{ id: "whatsapp", titulo: "Pedí por WhatsApp", texto: "Armá tu pedido y te confirmamos al toque" }] : []),
    { id: "retiro", titulo: "Retiro en el local", texto: "Elegí retirarlo sin costo" },
  ];
}

/** ROP-71: la primera de la lista que tenga prendas a la vista (sin importar mayúsculas ni espacios). */
export function marcaDestacada(marcas, destacadas) {
  const clave = (texto) => String(texto ?? "").trim().replace(/\s+/g, " ").toLowerCase();
  for (const nombre of destacadas ?? []) {
    const marca = (marcas ?? []).find((m) => clave(m.nombre) === clave(nombre));
    if (marca) return marca;
  }
  return null;
}

/** ROP-73: el contacto de Instagram, solo si está cargado de verdad (no "[COMPLETAR…]"). */
export function instagramDe(contactos) {
  const ig = (contactos ?? []).find((c) => c.id === "instagram");
  if (!ig?.valor || ig.valor.trim().startsWith("[")) return null;
  const usuario = ig.valor.trim().replace(/^@/, "");
  return { usuario, href: ig.href && ig.href !== "#" ? ig.href : `https://instagram.com/${usuario}` };
}
