import { proyecto } from "compartido/proyecto.js";

// Cada carpeta de clientes/ exporta { cliente } desde su index.js.
// Sumar un cliente = copiar la carpeta demo/ y cambiar proyecto.config.js → cliente.
const disponibles = import.meta.glob("./*/index.js", { eager: true });
const modulo = disponibles[`./${proyecto.cliente}/index.js`];

if (!modulo) {
  throw new Error(
    `No existe frontend/src/clientes/${proyecto.cliente}/. Clientes disponibles: ` +
      Object.keys(disponibles).map((ruta) => ruta.split("/")[1]).join(", "),
  );
}

export const cliente = modulo.cliente;

/** Nombre de la sección de productos para el comprador (clientes/<id>/navbar.js → productos). */
export const nombreProductos = cliente.navbar.productos ?? "Productos";
export const verProductos = `Ver ${nombreProductos.toLowerCase()}`;

/** ¿El menú de la tienda muestra categorías? (navbar.js → menu_productos "categorias" o "desplegable"). */
export const menuPorCategorias = ["categorias", "desplegable"].includes(cliente.navbar.menu_productos);

/**
 * Qué categorías van en el menú (navbar.js → categorias_en_menu):
 *   "marcadas"    → las tildadas "Mostrar en el menú" en el panel (por defecto).
 *   "principales" → todas las categorías principales, solas (tienda de ropa: Mujer, Hombre...).
 */
export const categoriasEnMenu = cliente.navbar.categorias_en_menu ?? "marcadas";
export const categoriasPrincipalesEnMenu = categoriasEnMenu === "principales";
export const estaEnMenu = (categoria, modo = categoriasEnMenu) => (modo === "principales" ? categoria.padre_id == null : Boolean(categoria.en_menu));
