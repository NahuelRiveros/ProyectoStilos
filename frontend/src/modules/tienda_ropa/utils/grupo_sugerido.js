// ROP-36: el grupo de talles que se propone para una categoría. Si no tiene uno propio, el de la
// categoría de arriba (ej. Hombre › Pantalones › Cargo usa el de Pantalones). Función pura: la prueba
// servidor/tests/ropa_web.test.mjs.

const aplanar = (nodos) => nodos.flatMap((n) => [n, ...aplanar(n.hijas ?? [])]);

/** `arbol`: categorías con `hijas` (como las devuelve el panel). Devuelve el id del grupo o null. */
export function grupoSugerido(arbol, categoriaId) {
  const porId = new Map(aplanar(arbol ?? []).map((c) => [c.id, c]));
  for (let c = porId.get(Number(categoriaId)), vueltas = 0; c && vueltas < 50; c = porId.get(c.padre_id), vueltas++) {
    if (c.grupo_talle_id) return c.grupo_talle_id;
  }
  return null;
}
