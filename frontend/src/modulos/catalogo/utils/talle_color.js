import { sinStock } from "./disponibilidad.js";
import { presentacionMasBarata } from "./precios.js";

// Ficha de una prenda: primero se elige el color y después el talle (cada combinación es una variante).

/** ¿El producto se arma con talle y color (y no con presentaciones de nombre libre)? */
export const usaTalleColor = (producto) => (producto?.variantes ?? []).some((v) => v.color_id || v.talle_id);

/** Variantes de un color (o todas si la prenda no varía por color), ordenadas por talle. */
export function tallesDelColor(variantes = [], color_id = null) {
  return variantes
    .filter((v) => (v.color_id ?? null) === (color_id ?? null))
    .sort((a, b) => (a.talle?.orden ?? 0) - (b.talle?.orden ?? 0) || a.id - b.id);
}

/**
 * Al tocar otro color: el mismo talle si ese color lo tiene; si no, el primer talle con stock;
 * si no hay ninguno con stock, el primero (así se ve "Sin stock" en vez de quedar sin elegir).
 */
export function varianteAlCambiarColor(variantes, actual, color_id) {
  const delColor = tallesDelColor(variantes, color_id);
  return (
    delColor.find((v) => actual?.talle_id != null && v.talle_id === actual.talle_id) ??
    delColor.find((v) => !sinStock(v)) ??
    delColor[0] ??
    actual
  );
}

/** Un color está agotado si ninguno de sus talles tiene stock. */
export const colorAgotado = (variantes, color_id) => tallesDelColor(variantes, color_id).every(sinStock);

/** Al abrir la ficha: un talle del color que viene en el link (?color=5), si la prenda lo tiene; si no, la más barata. */
export function varianteInicial(producto, color_id = null) {
  const delColor = color_id ? tallesDelColor(producto.variantes, color_id) : [];
  if (delColor.length === 0) return presentacionMasBarata(producto);
  return delColor.find((v) => !sinStock(v)) ?? delColor[0];
}
