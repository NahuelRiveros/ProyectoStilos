// TEMA VISUAL
// Fuentes, colores y estilos de todo el sitio.
// Los valores se aplican automáticamente como variables CSS al iniciar la app.
// No hace falta tocar index.css para cambiar colores — solo editar este archivo.
//
// Tema actual: "Stilos" — moda urbana, azul marino y crema, tipografía editorial + chunky

export const themeConfig = {

  // ── Fuentes ────────────────────────────────────────────────────────────────
  // Para cambiar: actualizar los <link> de Google Fonts en index.html primero.
  // fontDisplay → logo, títulos editoriales, headings de producto (serif de alto contraste)
  // fontSans    → textos, botones, labels, UI en general
  // fontPromo   → headings de oferta, banners, textos chunky y de impacto
  fontDisplay: '"Cormorant Garamond", "Georgia", serif',
  fontSans:    '"DM Sans", system-ui, sans-serif',
  fontPromo:   '"Rubik One", "Impact", sans-serif',


  // ── Color de acento (marca) ────────────────────────────────────────────────
  // Afecta botones principales, badges, hovers y elementos destacados.
  accent:      "#C9A87C",   // Brass dorado — cálido, complementa navy y crema
  accentOn:    "#1C2438",   // Texto sobre el acento — contraste oscuro
  accentLight: "#F5EAD8",   // Crema suave — fondos de badges y alertas
  accentDark:  "#8A6B3A",   // Bronce oscuro — texto sobre fondos claros

  // ── Acento secundario ──────────────────────────────────────────────────────
  accentSecondary:   "#283149",   // Navy Stilos — contenedores y bloques de impacto
  accentSecondaryOn: "#F3E6D9",   // Crema Stilos — texto sobre navy


  // ── Contenido ─────────────────────────────────────────────────────────────
  // Afecta la página, formularios, inputs, cards, modales, tablas y dropdowns.
  content: {
    navy:    "#283149",   // Navy Stilos — botón primario, links, énfasis fuerte
    ink:     "#1C2438",   // Casi negro azulado — texto principal de la página
    muted:   "#8A95A8",   // Azul-gris polvoriento — texto secundario, placeholders
    surface: "#F3E6D9",   // Crema Stilos — fondo de la página y secciones
    card:    "#FFFFFF",   // Blanco puro — fondo de cards, modales y dropdowns
    line:    "#E2D3C4",   // Borde crema-cálido — separadores y bordes
  },


  // ── Barra de navegación ────────────────────────────────────────────────────
  // Afecta la barra superior fija, el mega-menú y el menú móvil.
  //
  // Ejemplos de combinaciones:
  //   Crema (actual)  → bg: "#F3E6D9",  text: "#283149",  textDim: "#7A8FA8"
  //   Navy sólido     → bg: "#283149",  text: "#F3E6D9",  textDim: "#8A95A8"
  //   Blanco limpio   → bg: "#ffffff",  text: "#1C2438",  textDim: "#8A95A8"
  navbar: {
    bg:       "#F3E6D9",   // Crema Stilos — navbar limpio que combina con el fondo de página
    bgRaised: "#EBD8C5",   // Crema más profunda — mega-menú y panel elevado
    bgFloat:  "#FFFFFF",   // Dropdown de usuario (siempre claro)
    text:     "#283149",   // Navy — legible y de marca
    textDim:  "#7A8FA8",   // Azul-gris — links inactivos
  },


  // ── Footer ────────────────────────────────────────────────────────────────
  // Afecta el pie de página, redes sociales y copyright.
  //
  // Ejemplos de combinaciones:
  //   Navy (actual)  → bg: "#283149",  text: "#F3E6D9",  textDim: "#8A95A8"
  //   Crema          → bg: "#F3E6D9",  text: "#283149",  textDim: "#7A8FA8"
  footer: {
    bg:      "#283149",   // Navy Stilos — footer sólido y de marca
    text:    "#F3E6D9",   // Crema — texto principal del footer
    textDim: "#8A95A8",   // Azul-gris — texto secundario y links
  },


  // ── Panel de administración ────────────────────────────────────────────────
  // Afecta el sidebar y la barra del backoffice. No afecta el frontend público.
  //
  // Ejemplos de combinaciones:
  //   Navy oscuro (actual) → bg: "#1C2438",  bgRaised: "#283149",  text: "#F3E6D9",  textDim: "#8A95A8"
  //   Slate medio          → bg: "#1e293b",  bgRaised: "#334155",  text: "#f8fafc",  textDim: "#94a3b8"
  admin: {
    bg:       "#1C2438",   // Navy muy oscuro — sidebar profundo
    bgRaised: "#283149",   // Navy Stilos — hover y activo
    text:     "#F3E6D9",   // Crema — texto del panel
    textDim:  "#8A95A8",   // Azul-gris — texto secundario del panel
  },


  // ── Sellos de confianza (footer ecommerce) ─────────────────────────────────
  // Solo visible cuando cartConfig.enableCart: true.
  trust: {
    secure: "#22c55e",
  },

};
