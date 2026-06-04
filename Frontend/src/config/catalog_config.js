export const catalogConfig = {
  // [ROUTER] Ruta base del catalogo de productos
  basePath: "/catalogo",

  // [NAVBAR] Labels de los links del menu principal
  navProductsLabel: "Productos",
  navHomeLabel: "Home",

  // [NAVBAR / FILTROS] Labels de las categorias — aparecen en filtros y breadcrumbs
  groupLabel: "Coleccion",
  categoryLabel: "Categoria",
  subcategoryLabel: "Subcategoria",

  // [NAVBAR] Muestra el link "Home" en el menu principal
  showHomeLink: true,
  // [NAVBAR] Muestra el link "Productos" en el menu principal
  showProductsLink: true,
  // [NAVBAR] Muestra los grupos/colecciones como items en el menu
  showGroupsInNavbar: true,
  // [NAVBAR] Muestra un dropdown con productos dentro del menu (false = link directo)
  showProductsDropdown: false,

  // [ROUTER] Ruta de fallback cuando la categoria buscada no existe
  categoryFallbackPath: "/catalogo",
};
