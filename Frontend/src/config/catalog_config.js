// CATÁLOGO DE PRODUCTOS
// Cómo se navega el catálogo, qué links aparecen en el menú y cómo se llaman las categorías.

export const catalogConfig = {

  // ── Navegación ─────────────────────────────────────────────────────────────
  // Ruta base del catálogo de productos
  basePath: "/catalogo",

  // ¿Mostrar el link "Home" en el menú principal?
  showHomeLink: true,
  // ¿Mostrar el link "Productos" en el menú principal?
  showProductsLink: true,
  // ¿Mostrar los grupos/colecciones como items en el menú?
  showGroupsInNavbar: true,
  // false = link directo a productos / true = dropdown con productos al pasar el cursor
  showProductsDropdown: false,
  // ¿Mostrar el link "Nosotros" en el menú? (requiere crear la página /nosotros)
  showAboutLink: false,
  // ¿Mostrar el link "Contacto" en el menú? (requiere crear la página /contacto)
  showContactLink: false,

  // ── Textos del menú ────────────────────────────────────────────────────────
  navProductsLabel: "Productos",
  navHomeLabel: "Home",
  navAboutLabel: "Nosotros",
  navContactLabel: "Contacto",

  // ── Cómo se llaman las categorías en este negocio ──────────────────────────
  // Aparecen en filtros, breadcrumbs y menús del catálogo
  groupLabel: "Colección",            // Nivel 1 (ej: "Hombre", "Mujer", "Temporada")
  categoryLabel: "Categoría",         // Nivel 2 (ej: "Remeras", "Pantalones")
  subcategoryLabel: "Subcategoría",   // Nivel 3

  // Ruta de fallback si la categoría buscada no existe
  categoryFallbackPath: "/catalogo",
};
