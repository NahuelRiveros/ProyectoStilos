// TEMA VISUAL
// Fuentes, colores y estilos de todo el sitio.
// Los valores se aplican automáticamente como variables CSS al iniciar la app.
// No hace falta tocar index.css para cambiar colores — solo editar este archivo.
//
// Tema actual: "Stilos" — Manual de marca oficial
// Paleta exacta del manual: navy #2E394B · crema #EDDAC7 · cobre #C3A38C · siena #AF9273

export const themeConfig = {

  // ── Fuentes ────────────────────────────────────────────────────────────────
  // fontDisplay → La fuente oficial del manual es "Stylish Mother" (no disponible en Google Fonts).
  //               Cormorant Garamond es la alternativa más fiel disponible.
  //               Para usar Stylish Mother: colocar los archivos en /public/fonts/ y
  //               agregar @font-face en index.css con font-family: "Stylish Mother".
  fontDisplay: '"Cormorant Garamond", "Georgia", serif',
  fontSans:    '"DM Sans", system-ui, sans-serif',
  fontPromo:   '"Rubik One", "Impact", sans-serif',


  // ── Color de acento (marca) ────────────────────────────────────────────────
  // Afecta botones principales, badges, hovers y elementos destacados.
  accent:      "#AF9273",   // Siena cálido — acento principal del manual de marca
  accentOn:    "#2E394B",   // Navy Stilos — texto sobre el acento (contraste 5:1)
  accentLight: "#F2E4D5",   // Crema muy suave — fondos de badges y alertas
  accentDark:  "#7A5C44",   // Marrón cálido — texto sobre fondos con acento claro

  // ── Acento secundario ──────────────────────────────────────────────────────
  accentSecondary:   "#2E394B",   // Navy Stilos — contenedores y bloques de impacto
  accentSecondaryOn: "#EDDAC7",   // Crema oficial — texto sobre navy


  // ── Contenido ─────────────────────────────────────────────────────────────
  // Afecta la página, formularios, inputs, cards, modales, tablas y dropdowns.
  content: {
    navy:    "#2E394B",   // Navy oficial del manual — botón primario, links, énfasis
    ink:     "#1E2D3D",   // Navy oscuro — texto principal (mayor contraste que el navy puro)
    muted:   "#8A95A8",   // Azul-gris polvoriento — texto secundario, placeholders
    surface: "#EDDAC7",   // Crema oficial del manual — fondo de la página y secciones
    card:    "#FFFFFF",   // Blanco puro — fondo de cards, modales y dropdowns
    line:    "#D8C3AC",   // Borde beige-cálido — separadores y bordes (derivado del crema)
  },


  // ── Barra de navegación ────────────────────────────────────────────────────
  // Afecta la barra superior fija, el mega-menú y el menú móvil.
  //
  // Ejemplos de combinaciones:
  //   Crema (actual)  → bg: "#EDDAC7",  text: "#2E394B",  textDim: "#7A8FA8"
  //   Navy sólido     → bg: "#2E394B",  text: "#EDDAC7",  textDim: "#8A95A8"
  //   Blanco limpio   → bg: "#ffffff",  text: "#1E2D3D",  textDim: "#8A95A8"
  navbar: {
    bg:       "#EDDAC7",   // Crema oficial — navbar limpio, combina con fondo de página
    bgRaised: "#DFC7AE",   // Crema más profunda — mega-menú y panel elevado
    bgFloat:  "#FFFFFF",   // Dropdown de usuario (siempre claro)
    text:     "#2E394B",   // Navy oficial — legible y de marca
    textDim:  "#7A8FA8",   // Azul-gris — links inactivos
  },


  // ── Footer ────────────────────────────────────────────────────────────────
  // Afecta el pie de página, redes sociales y copyright.
  //
  // Ejemplos de combinaciones:
  //   Navy (actual)  → bg: "#2E394B",  text: "#EDDAC7",  textDim: "#8A95A8"
  //   Crema          → bg: "#EDDAC7",  text: "#2E394B",  textDim: "#7A8FA8"
  footer: {
    bg:      "#2E394B",   // Navy oficial — footer sólido y de marca
    text:    "#EDDAC7",   // Crema oficial — texto principal del footer
    textDim: "#8A95A8",   // Azul-gris — texto secundario y links
  },


  // ── Panel de administración ────────────────────────────────────────────────
  // Afecta el sidebar y la barra del backoffice. No afecta el frontend público.
  //
  // Ejemplos de combinaciones:
  //   Navy oscuro (actual) → bg: "#1E2D3D",  bgRaised: "#2E394B",  text: "#EDDAC7",  textDim: "#8A95A8"
  //   Slate medio          → bg: "#1e293b",  bgRaised: "#334155",  text: "#f8fafc",  textDim: "#94a3b8"
  admin: {
    bg:       "#1E2D3D",   // Navy muy oscuro — sidebar profundo (ligeramente más oscuro que el navy)
    bgRaised: "#2E394B",   // Navy oficial — hover y activo
    text:     "#EDDAC7",   // Crema oficial — texto del panel
    textDim:  "#8A95A8",   // Azul-gris — texto secundario del panel
  },


  // ── Sellos de confianza (footer ecommerce) ─────────────────────────────────
  // Solo visible cuando cartConfig.enableCart: true.
  trust: {
    secure: "#22c55e",
  },

};
