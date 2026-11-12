/** La categoría `id` y las de arriba, de la raíz a ella (o [] si no está en el árbol). */
export function caminoA(arbol, id) {
  for (const nodo of arbol ?? []) {
    if (nodo.id === id) return [nodo];
    const debajo = caminoA(nodo.hijas, id);
    if (debajo.length) return [nodo, ...debajo];
  }
  return [];
}
