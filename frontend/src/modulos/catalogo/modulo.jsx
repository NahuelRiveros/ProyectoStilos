import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { FileSpreadsheet, FolderTree, Package, Palette, Ruler, Store, Tag } from "lucide-react";
import { proyecto } from "compartido/proyecto.js";
import { ROLES_PANEL } from "compartido/reglas/roles.js";
import { cliente, nombreProductos } from "@/clientes/index.js";
import MenuCategorias from "./tienda/menu_categorias.jsx";
import MenuTienda from "./tienda/menu_tienda.jsx";

// proyecto.config.js → catalogo.variantes: colores y talles solo en indumentaria (las marcas, en todos los rubros).
const USA_TALLE_COLOR = proyecto.catalogo.variantes === "talle_color";

// clientes/<id>/navbar.js → menu_productos. "enlace" (o cualquier otro valor) = un solo link.
const MENU_PRODUCTOS = {
  categorias: { clave: "menu-categorias", Componente: MenuCategorias },
  desplegable: { clave: "menu-tienda", Componente: MenuTienda },
};

// Todo lo que el módulo catálogo aporta a la app. Las pantallas se cargan recién
// cuando se visitan (lazy), así la tienda no descarga el código del panel.
const cargar = (importar) => async () => ({ Component: (await importar()).default });

export const moduloCatalogo = {
  codigo: "catalogo",

  // Navbar de la tienda: según clientes/<id>/navbar.js, un link "Productos", el menú por categorías
  // o un solo desplegable con las categorías en columnas,
  // más "Novedades" y "Ofertas" si están activados.
  navbar: [
    MENU_PRODUCTOS[cliente.navbar.menu_productos] ?? { etiqueta: nombreProductos, a: "/catalogo" },
    ...(cliente.navbar.novedades ? [{ etiqueta: "Novedades", a: "/catalogo?orden=reciente" }] : []),
    ...(cliente.navbar.ofertas ? [{ etiqueta: "Ofertas", a: "/catalogo?oferta=1" }] : []),
  ],

  rutasPublicas: [
    { path: "catalogo", lazy: cargar(() => import("./tienda/catalogo_page.jsx")) },
    { path: "catalogo/:slug", lazy: cargar(() => import("./tienda/producto_detalle_page.jsx")) },
  ],

  // Rutas dentro de /admin
  rutasAdmin: [
    { path: "catalogo", element: <Navigate to="productos" replace /> },
    { path: "catalogo/productos", lazy: cargar(() => import("./admin/productos_page.jsx")) },
    { path: "catalogo/productos/nuevo", lazy: cargar(() => import("./admin/producto_form_page.jsx")) },
    { path: "catalogo/productos/:id", lazy: cargar(() => import("./admin/producto_form_page.jsx")) },
    { path: "catalogo/categorias", lazy: cargar(() => import("./admin/categorias_page.jsx")) },
    { path: "catalogo/marcas", lazy: cargar(() => import("./admin/marcas_page.jsx")) },
    ...(USA_TALLE_COLOR
      ? [
          { path: "catalogo/colores", lazy: cargar(() => import("./admin/colores_page.jsx")) },
          { path: "catalogo/talles", lazy: cargar(() => import("./admin/talles_page.jsx")) },
        ]
      : []),
    { path: "catalogo/importar", lazy: cargar(() => import("./admin/importacion/importacion_page.jsx")) },
  ],

  // Sección del menú lateral del panel
  menuAdmin: {
    titulo: "Catálogo",
    icono: Store,
    roles: ROLES_PANEL,
    items: [
      { etiqueta: "Productos", a: "/admin/catalogo/productos", icono: Package },
      { etiqueta: "Categorías", a: "/admin/catalogo/categorias", icono: FolderTree },
      { etiqueta: "Marcas", a: "/admin/catalogo/marcas", icono: Tag },
      ...(USA_TALLE_COLOR
        ? [
            { etiqueta: "Colores", a: "/admin/catalogo/colores", icono: Palette },
            { etiqueta: "Talles", a: "/admin/catalogo/talles", icono: Ruler },
          ]
        : []),
      { etiqueta: "Importar Excel", a: "/admin/catalogo/importar", icono: FileSpreadsheet },
    ],
  },

  // Tarjetas en el inicio del panel
  resumenAdmin: lazy(() => import("./admin/resumen_catalogo.jsx")),
};
