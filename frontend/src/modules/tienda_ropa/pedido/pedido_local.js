// Pedido del visitante guardado en su navegador (ROP-13): sin cuenta, dura `dias` desde el último
// cambio. Funciones puras para probarlas solas (servidor/tests/ropa_web.test.mjs).

export const CLAVE_PEDIDO = "stilos_pedido";
const DIA_MS = 86400000;

const lineaValida = (l) => Number.isInteger(l?.variante_id) && Number.isInteger(l?.cantidad) && l.cantidad > 0
  && typeof l.nombre === "string" && Number.isFinite(Number(l.precio));

/** Lo guardado, o [] si no hay, está roto o venció. */
export function leerPedido(storage, { dias, ahora = Date.now() }) {
  try {
    const guardado = JSON.parse(storage.getItem(CLAVE_PEDIDO));
    if (!guardado || !Array.isArray(guardado.items) || ahora - guardado.actualizado > dias * DIA_MS) return [];
    return guardado.items.filter(lineaValida);
  } catch { return []; }
}

export function guardarPedido(storage, items, ahora = Date.now()) {
  try {
    if (items.length) storage.setItem(CLAVE_PEDIDO, JSON.stringify({ items, actualizado: ahora }));
    else storage.removeItem(CLAVE_PEDIDO);
  } catch { /* Navegación privada o almacenamiento lleno: el pedido vive solo en esta pestaña. */ }
}

/** Suma la línea (o la cantidad, si ya estaba esa variante). Lanza un Error con el motivo. */
export function agregarLinea(items, linea, { maxLineas, maxCantidad }) {
  const actual = items.find((l) => l.variante_id === linea.variante_id);
  const cantidad = (actual?.cantidad ?? 0) + linea.cantidad;
  if (cantidad > maxCantidad) throw new Error(`Podés pedir hasta ${maxCantidad} unidades de cada prenda.`);
  if (!actual && items.length >= maxLineas) throw new Error(`Tu pedido puede tener hasta ${maxLineas} prendas distintas.`);
  return actual ? items.map((l) => (l === actual ? { ...l, cantidad } : l)) : [...items, { ...linea, cantidad }];
}

export function cambiarCantidad(items, varianteId, cantidad, maxCantidad) {
  const nueva = Math.max(1, Math.min(maxCantidad, Math.floor(Number(cantidad)) || 1));
  return items.map((l) => (l.variante_id === varianteId ? { ...l, cantidad: nueva } : l));
}

export const quitarLinea = (items, varianteId) => items.filter((l) => l.variante_id !== varianteId);

export const unidades = (items) => items.reduce((suma, l) => suma + l.cantidad, 0);

/** Total estimado del navegador; el que vale es el que calcula el servidor al enviar. */
export const totalEstimado = (items) => items.reduce((suma, l) => suma + Math.round(Number(l.precio) * 100) * l.cantidad, 0) / 100;
