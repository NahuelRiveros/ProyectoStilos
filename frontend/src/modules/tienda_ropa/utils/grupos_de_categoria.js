// ROP-59 y ROP-60: qué grupos de características se ofrecen al cargar una prenda de una categoría.
// Función pura: la prueba servidor/tests/ropa_web.test.mjs.

const aplanar = (nodos) => nodos.flatMap((n) => [n, ...aplanar(n.hijas ?? [])]);

/** La categoría y todas las de arriba (un grupo de "Remeras" vale para Hombre › Remeras › Oversize). */
function conLasDeArriba(arbol, categoriaId) {
  const porId = new Map(aplanar(arbol ?? []).map((c) => [c.id, c]));
  const ids = new Set();
  for (let c = porId.get(Number(categoriaId)); c && !ids.has(c.id); c = porId.get(c.padre_id)) ids.add(c.id);
  return ids;
}

/**
 * Separa los grupos en los que van con la categoría (o sin categorías: van con todas) y el resto.
 * Un grupo con algo ya tildado (`tildadas`: Set de ids) siempre queda a la vista: no se esconde lo cargado.
 * Sin categoría elegida, a la vista solo quedan los tildados.
 */
export function gruposDeCategoria(grupos, arbol, categoriaId, tildadas = new Set()) {
  const camino = categoriaId ? conLasDeArriba(arbol, categoriaId) : new Set();
  const visibles = [];
  const otros = [];
  for (const grupo of grupos ?? []) {
    const categorias = grupo.categorias ?? [];
    const va = camino.size > 0 && (categorias.length === 0 || categorias.some((id) => camino.has(id)));
    const tieneTildadas = grupo.caracteristicas.some((c) => tildadas.has(c.id));
    (va || tieneTildadas ? visibles : otros).push(grupo);
  }
  return { visibles, otros };
}
