import { formatearPrecio } from "../utils/dinero.js";

// ROP-31: vista previa de una prenda al compartir su link (WhatsApp, Facebook, Telegram…). Esos bots no
// ejecutan JavaScript, así que frontend/middleware.js les responde este HTML con los datos de la prenda.
// Funciones puras: las prueba servidor/tests/ropa_web.test.mjs.

const BOTS = /whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|slackbot|discordbot|linkedinbot|pinterest|skypeuripreview|redditbot|applebot|googlebot|bingbot/i;
export const esBotDeVistaPrevia = (userAgent) => BOTS.test(String(userAgent ?? ""));

/** "/catalogo/remera-taverniti-negro" → "remera-taverniti-negro"; cualquier otra ruta → null. */
export const slugDeRuta = (ruta) => /^\/catalogo\/([a-z0-9-]{1,90})\/?$/.exec(ruta)?.[1] ?? null;

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
const escapar = (valor) => String(valor ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);
const recortar = (texto, max) => (texto.length > max ? `${texto.slice(0, max - 1).trimEnd()}…` : texto);

/** La foto en el formato que muestran las vistas previas (1200×630, JPG). Otra URL vuelve tal cual. */
export function imagenParaCompartir(url) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url ?? null;
  return url.replace("/upload/", "/upload/w_1200,h_630,c_pad,b_white,f_jpg,q_auto/");
}

/** Título, descripción e imagen de la prenda (o los de la tienda si no se pudo leer la prenda). */
export function datosVistaPrevia(prenda, sitio) {
  if (!prenda) return { titulo: sitio, descripcion: `Mirá la colección de ${sitio} y armá tu pedido.`, imagen: null };
  const precio = prenda.precio_anterior
    ? `${formatearPrecio(prenda.precio)} (antes ${formatearPrecio(prenda.precio_anterior)})`
    : formatearPrecio(prenda.precio);
  const color = prenda.colores?.length === 1 ? ` · ${prenda.colores[0].nombre}` : "";
  const detalle = prenda.descripcion ? ` · ${prenda.descripcion.replace(/\s+/g, " ").trim()}` : "";
  return {
    titulo: `${prenda.nombre}${prenda.marca ? ` · ${prenda.marca.nombre}` : ""} | ${sitio}`,
    descripcion: recortar(`${precio}${color}${detalle}`, 180),
    imagen: imagenParaCompartir(prenda.imagenes?.[0]?.url),
  };
}

export function htmlVistaPrevia({ prenda, url, sitio }) {
  const { titulo, descripcion, imagen } = datosVistaPrevia(prenda, sitio);
  const meta = [
    ["og:type", prenda ? "product" : "website"], ["og:site_name", sitio], ["og:title", titulo],
    ["og:description", descripcion], ["og:url", url], ["og:locale", "es_AR"],
    ...(imagen ? [["og:image", imagen], ["og:image:width", "1200"], ["og:image:height", "630"]] : []),
  ].map(([p, v]) => `<meta property="${p}" content="${escapar(v)}">`);
  const twitter = [["twitter:card", imagen ? "summary_large_image" : "summary"], ["twitter:title", titulo], ["twitter:description", descripcion]]
    .map(([n, v]) => `<meta name="${n}" content="${escapar(v)}">`);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapar(titulo)}</title>
<meta name="description" content="${escapar(descripcion)}">${meta.join("")}${twitter.join("")}</head>
<body><p><a href="${escapar(url)}">${escapar(titulo)}</a></p></body></html>`;
}
