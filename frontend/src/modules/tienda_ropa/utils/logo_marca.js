// ROP-35: qué logo se muestra de una marca. Función pura (la prueba servidor/tests/ropa_web.test.mjs);
// la configuración (LOGOS_MARCAS) se pasa de afuera porque importa imágenes.

const clave = (nombre) => String(nombre ?? "").trim().replace(/\s+/g, " ").toLowerCase();

/**
 * El subido desde el panel (logo_url) tiene prioridad; si no hay, el del archivo de configuración;
 * si tampoco, null (se muestra el nombre). `fondo`: color del recuadro para logos claros.
 */
export function logoDeMarca(marca, logos = {}) {
  const local = Object.entries(logos).find(([nombre]) => clave(nombre) === clave(marca?.nombre))?.[1];
  if (marca?.logo_url) return { url: marca.logo_url, fondo: local?.fondo ?? null };
  if (local?.logo) return { url: local.logo, fondo: local.fondo ?? null };
  return null;
}
