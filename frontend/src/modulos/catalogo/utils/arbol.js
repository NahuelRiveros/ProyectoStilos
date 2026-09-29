// El API devuelve las categorías en lista plana (con padre_id); acá se arma el árbol.

/** [{...categoria, hijos: [...]}] ordenado como vino del API. */
export function armarArbol(categorias = []) {
  const porId = new Map(categorias.map((c) => [c.id, { ...c, hijos: [] }]));
  const raices = [];
  for (const nodo of porId.values()) {
    const padre = nodo.padre_id != null ? porId.get(nodo.padre_id) : null;
    (padre ? padre.hijos : raices).push(nodo);
  }
  return raices;
}

/** Lista en orden de árbol con `nivel`, para selects con sangría. */
export function aplanarConNivel(categorias = []) {
  const salida = [];
  const recorrer = (nodos, nivel) => {
    for (const nodo of nodos) {
      salida.push({ ...nodo, nivel });
      recorrer(nodo.hijos, nivel + 1);
    }
  };
  recorrer(armarArbol(categorias), 0);
  return salida;
}

/** Ids de la categoría y todas sus subcategorías (para no dejar elegirlas como padre de sí misma). */
export function idsDelSubarbol(categorias = [], id) {
  const hijosDe = new Map();
  for (const c of categorias) {
    if (!hijosDe.has(c.padre_id)) hijosDe.set(c.padre_id, []);
    hijosDe.get(c.padre_id).push(c.id);
  }
  const ids = new Set([id]);
  const pendientes = [id];
  while (pendientes.length) {
    for (const hijo of hijosDe.get(pendientes.pop()) ?? []) {
      ids.add(hijo);
      pendientes.push(hijo);
    }
  }
  return ids;
}

/** "Almacén › Galletitas › Dulces" */
export function rutaCategoria(categorias = [], id) {
  const porId = new Map(categorias.map((c) => [c.id, c]));
  const partes = [];
  let actual = porId.get(id);
  while (actual && partes.length < 20) {
    partes.unshift(actual.nombre);
    actual = porId.get(actual.padre_id);
  }
  return partes.join(" › ");
}

/** Productos de la categoría sumando los de sus subcategorías. */
export function totalConSubcategorias(nodo) {
  return nodo.cantidad_productos + nodo.hijos.reduce((suma, hijo) => suma + totalConSubcategorias(hijo), 0);
}

/**
 * Lo que muestra el filtro "por niveles" del catálogo para la categoría elegida (id o "" = ninguna):
 *   ruta     → de la principal a la elegida (Mujer › Jeans), para el camino de migas.
 *   padre    → la categoría cuyas subcategorías se listan (null = se listan las principales).
 *   opciones → esas subcategorías, solo las que tienen productos.
 * Si la elegida no tiene subcategorías con productos, se listan sus hermanas (queda marcada entre ellas).
 */
export function nivelDeCategoria(categorias = [], id) {
  const raices = armarArbol(categorias);
  const porId = new Map();
  const indexar = (nodos) => {
    for (const n of nodos) {
      porId.set(n.id, n);
      indexar(n.hijos);
    }
  };
  indexar(raices);
  const conProductos = (nodos) => nodos.filter((n) => totalConSubcategorias(n) > 0);

  const actual = porId.get(Number(id));
  const ruta = [];
  for (let n = actual; n && ruta.length < 20; n = porId.get(n.padre_id)) ruta.unshift(n);

  if (!actual) return { ruta, padre: null, opciones: conProductos(raices) };
  if (conProductos(actual.hijos).length > 0) return { ruta, padre: actual, opciones: conProductos(actual.hijos) };
  const padre = porId.get(actual.padre_id) ?? null;
  return { ruta, padre, opciones: conProductos(padre ? padre.hijos : raices) };
}
