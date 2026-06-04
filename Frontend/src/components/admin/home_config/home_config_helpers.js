function urlToItem(url, alt = "") {
  return url ? [{ src: url, alt, public_id: "" }] : [];
}
function itemToUrl(items) {
  return items[0]?.src ?? "";
}

// Íconos para el ticker de anuncios
const ANNOUNCEMENT_ICONS = [
  { value: "",          label: "Sin ícono" },
  { value: "sparkles",  label: "✨ Brillo (novedad)" },
  { value: "truck",     label: "🚚 Camión (envío)" },
  { value: "tag",       label: "🏷  Etiqueta (promo)" },
  { value: "percent",   label: "% Porcentaje (descuento)" },
  { value: "zap",       label: "⚡ Rayo (flash sale)" },
  { value: "gift",      label: "🎁 Regalo" },
  { value: "star",      label: "⭐ Estrella (destacado)" },
  { value: "heart",     label: "❤  Favorito" },
  { value: "crown",     label: "👑 Corona (premium)" },
  { value: "badge",     label: "✔  Garantizado" },
  { value: "clock",     label: "⏰ Tiempo limitado" },
  { value: "bag",       label: "🛍  Tienda" },
  { value: "pin",       label: "📍 Ubicación" },
  { value: "phone",     label: "📞 Contacto" },
];

// Íconos para la barra de beneficios (perks)
const PERK_ICONS = [
  { value: "truck",     label: "🚚 Camión (envío)" },
  { value: "store",     label: "🏪 Tienda (retiro)" },
  { value: "shield",    label: "🛡  Seguridad / garantía" },
  { value: "rotate",    label: "🔄 Devolución" },
  { value: "sparkles",  label: "✨ Novedad" },
  { value: "star",      label: "⭐ Destacado" },
  { value: "percent",   label: "% Descuento" },
  { value: "zap",       label: "⚡ Flash / rápido" },
  { value: "heart",     label: "❤  Favorito" },
  { value: "crown",     label: "👑 Premium" },
  { value: "badge",     label: "✔  Calidad garantizada" },
  { value: "package",   label: "📦 Producto / packaging" },
  { value: "bag",       label: "🛍  Compra online" },
  { value: "pin",       label: "📍 Ubicación tienda" },
  { value: "phone",     label: "📞 Atención al cliente" },
];

const SLUG_BG_OPTIONS = [
  "bg-champagne-light",
  "bg-navy/8",
  "bg-[#F0EDE8]",
  "bg-rose-50",
  "bg-emerald-50"
];

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 30) || `cat-${Date.now()}`;
}

export {
  ANNOUNCEMENT_ICONS,
  PERK_ICONS,
  SLUG_BG_OPTIONS,
  itemToUrl,
  slugify,
  urlToItem
};
