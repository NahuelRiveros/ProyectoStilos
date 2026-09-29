import { categoriasEnMenu, estaEnMenu } from "@/clientes/index.js";
import { useCategorias } from "./use_catalogo.js";
import { armarArbol, totalConSubcategorias } from "../utils/arbol.js";

export const aCategoria = (id) => `/catalogo?categoria=${id}`;

/** Categorías del menú (ver estaEnMenu), en el orden del panel, cada una con sus subcategorías con productos. */
export function useItemsMenu(modo = categoriasEnMenu) {
  const { data, isPending } = useCategorias();
  const items = [];
  const recorrer = (nodos) => {
    for (const n of nodos) {
      if (estaEnMenu(n, modo)) items.push({ id: n.id, nombre: n.nombre, hijos: n.hijos.filter((h) => totalConSubcategorias(h) > 0) });
      recorrer(n.hijos);
    }
  };
  recorrer(armarArbol(data ?? []));
  return { items, isPending };
}
