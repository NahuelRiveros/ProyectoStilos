// Fotos por color (indumentaria): cada foto puede ser de un color o general (color_id null).

/** Colores de la prenda, sin repetir, en el orden de la lista del panel. */
export function coloresDelProducto(producto) {
  const porId = new Map();
  for (const v of producto?.variantes ?? []) if (v.color && !porId.has(v.color.id)) porId.set(v.color.id, v.color);
  return [...porId.values()].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.nombre.localeCompare(b.nombre));
}

/**
 * Qué fotos mostrar con un color elegido: las de ese color primero y después las generales.
 * Si el color no tiene fotos propias, las generales; si tampoco hay, todas (nunca queda vacía).
 */
export function fotosDelColor(imagenes = [], color_id = null) {
  if (color_id == null) return imagenes;
  const propias = imagenes.filter((i) => i.color_id === color_id);
  const generales = imagenes.filter((i) => i.color_id == null);
  if (propias.length > 0) return [...propias, ...generales];
  return generales.length > 0 ? generales : imagenes;
}

/** Listado filtrado por color: el primero de los colores filtrados que la prenda tiene (null = sin filtro o no tiene). */
export function colorDeTarjeta(producto, coloresFiltro = []) {
  const tiene = new Set((producto?.variantes ?? []).map((v) => v.color_id).filter(Boolean));
  return coloresFiltro.find((id) => tiene.has(id)) ?? null;
}

/** Foto de la tarjeta: la primera de ese color; si no tiene, la principal. */
export const fotoDeTarjeta = (imagenes = [], color_id = null) => (color_id != null && imagenes.find((i) => i.color_id === color_id)) || imagenes[0];
