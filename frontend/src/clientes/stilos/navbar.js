// Links propios del cliente. Los módulos (catálogo, tienda, admin) suman sus
// propios ítems automáticamente cuando están activos en proyecto.config.js.
export const navbar = {
  mostrar_rubro: false,
  productos: "Tienda",
  // Cada categoría principal en la barra (Mujer ▾ · Hombre ▾) con sus subcategorías desplegables.
  menu_productos: "categorias",
  // "principales" = todas las categorías principales aparecen solas (no hace falta tildarlas en el panel).
  categorias_en_menu: "principales",
  novedades: false,
  ofertas: true,
  links: [
    { etiqueta: "Inicio", a: "/" },
    { etiqueta: "Contacto", a: "/#contacto" },
  ],
};
