import { proyecto } from "../proyecto.js";

// Límite de fotos de un producto: por color (indumentaria) y aparte las generales (color_id null).
// La usan el panel (para avisar antes de subir) y el servidor (que es el que manda).

export const LIMITES_IMAGENES = {
  por_color: proyecto.catalogo.max_imagenes_por_color,
  generales: proyecto.catalogo.max_imagenes_generales,
};

/** Cuántas fotos se permiten de un color (null = generales). */
export const maximoImagenes = (color_id = null, limites = LIMITES_IMAGENES) => (color_id == null ? limites.generales : limites.por_color);

/** Cuántas fotos ya tiene ese color (null = generales). */
export const contarImagenes = (imagenes = [], color_id = null) => imagenes.filter((i) => (i.color_id ?? null) === (color_id ?? null)).length;

/** Cuántas fotos más se pueden subir de ese color (nunca negativo). */
export const lugarImagenes = (imagenes = [], color_id = null, limites = LIMITES_IMAGENES) =>
  Math.max(maximoImagenes(color_id, limites) - contarImagenes(imagenes, color_id), 0);
