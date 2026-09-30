// Filtros de marca, color y talle en la URL del catálogo: "?color=1,3&talle=52".

export const CLAVES_ATRIBUTOS = ["marca", "color", "talle"];

/** "1,3" → [1, 3] (ignora lo que no sea un número). */
export const leerIds = (texto) =>
  (texto ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);

/** Agrega el id si no estaba, lo saca si estaba. Devuelve el texto para la URL ("" = sin filtro). */
export function alternarId(texto, id) {
  const ids = leerIds(texto);
  const nuevos = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  return nuevos.join(",");
}

/** Filtros elegidos con su nombre, para los chips de "filtros activos". */
export function filtrosActivos(elegidos, disponibles) {
  if (!disponibles) return [];
  const listas = { marca: disponibles.marcas, color: disponibles.colores, talle: disponibles.talles };
  return CLAVES_ATRIBUTOS.flatMap((clave) =>
    leerIds(elegidos[clave])
      .map((id) => listas[clave].find((x) => x.id === id))
      .filter(Boolean)
      .map((x) => ({ clave, id: x.id, nombre: clave === "talle" ? `Talle ${x.nombre}` : x.nombre, hex: x.hex })),
  );
}
