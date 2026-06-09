// TEMA VISUAL
// Fuentes, colores y estilos de todo el sitio.
// Los valores se aplican automáticamente como variables CSS al iniciar la app.
// No hace falta tocar index.css para cambiar colores — solo editar este archivo.
//
// Tema actual: "Atelier" — cuero italiano, lujo contemporáneo, crema y terracota
// Diseñado para carteras y accesorios femeninos de calidad.

export const themeConfig = {

  // ── Fuentes ────────────────────────────────────────────────────────────────
  // Para cambiar: actualizar los <link> de Google Fonts en index.html primero.
  // fontDisplay → títulos, nombre de marca, headings de producto (serif editorial)
  // fontSans    → textos, botones, labels, UI en general
  fontDisplay: '"Cormorant Garamond", "Georgia", serif',
  fontSans:    '"DM Sans", system-ui, sans-serif',


  // ── Color de acento (marca) ────────────────────────────────────────────────
  // Afecta botones principales, badges, hovers y elementos destacados.
  accent:      "#B5836A",   // Terracota-rosa — cuero italiano, sofisticado
  accentOn:    "#1E0D07",   // Texto sobre el acento — contraste oscuro
  accentLight: "#F5E8DF",   // Blush muy claro (fondos suaves, alertas, badges)
  accentDark:  "#7A4728",   // Siena profundo (texto sobre fondos claros)

  // ── Acento secundario ──────────────────────────────────────────────────────
  // Complementa al acento principal. Útil para badges "Nuevo", "Exclusivo",
  // bordes especiales y elementos de contraste dentro del sitio.
  accentSecondary:   "#3D1F0F",   // Espresso oscuro — marrón cuero muy profundo
  accentSecondaryOn: "#F5EDE6",   // Crema cálida — texto sobre el secundario


  // ── Contenido ─────────────────────────────────────────────────────────────
  // Afecta la página, formularios, inputs, cards, modales, tablas y dropdowns.
  content: {
    navy:    "#1E0D07",   // Espresso profundo — botón primario, links, énfasis fuerte
    ink:     "#2A1710",   // Marrón cálido oscuro — texto principal de la página
    muted:   "#9B7B6A",   // Rosa-gris polvoriento — texto secundario, placeholders
    surface: "#FBF8F5",   // Blanco cremoso cálido — fondo de la página y secciones
    card:    "#FFFFFF",   // Blanco puro — fondo de cards, modales y dropdowns
    line:    "#EDE4DC",   // Borde cálido rosado-gris — separadores y bordes
  },


  // ── Barra de navegación ────────────────────────────────────────────────────
  // Afecta la barra superior fija, el mega-menú y el menú móvil.
  //
  // Ejemplos de combinaciones:
  //   Crema cálida (actual) → bg: "#FAF5F0",  text: "#1E0D07",  textDim: "#9B7B6A"
  //   Espresso oscuro       → bg: "#1E0D07",  text: "#FAF5F0",  textDim: "#9B7B6A"
  //   Terracota suave       → bg: "#F5E8DF",  text: "#3D1F0F",  textDim: "#9B7B6A"
  //   Blanco limpio         → bg: "#ffffff",  text: "#2A1710",  textDim: "#9B7B6A"
  navbar: {
    bg:       "#FAF5F0",   // Crema cálida — evoca papel de seda, lujo discreto
    bgRaised: "#F0E6DB",   // Mega-menú — tono más profundo de la crema
    bgFloat:  "#FFFFFF",   // Dropdown de usuario (siempre claro)
    text:     "#1E0D07",   // Espresso — legible y cálido
    textDim:  "#9B7B6A",   // Rosa-gris — links inactivos
  },


  // ── Footer ────────────────────────────────────────────────────────────────
  // Afecta el pie de página, redes sociales y copyright.
  //
  // Ejemplos de combinaciones:
  //   Espresso (actual) → bg: "#1E0D07",  text: "#FAF5F0",  textDim: "#9B7B6A"
  //   Terracota oscuro  → bg: "#3D1F0F",  text: "#FAF5F0",  textDim: "#C4956A"
  //   Crema             → bg: "#FAF5F0",  text: "#1E0D07",  textDim: "#9B7B6A"
  footer: {
    bg:      "#1E0D07",   // Espresso profundo — elegante y definido
    text:    "#FAF5F0",   // Crema — texto principal del footer
    textDim: "#9B7B6A",   // Rosa-gris — texto secundario y links
  },


  // ── Panel de administración ────────────────────────────────────────────────
  // Afecta el sidebar y la barra del backoffice. No afecta el frontend público.
  //
  // Ejemplos de combinaciones:
  //   Espresso (actual) → bg: "#1A0C07",  bgRaised: "#261508",  text: "#F5EDE6",  textDim: "#8B6B5A"
  //   Slate medio       → bg: "#1e293b",  bgRaised: "#334155",  text: "#f8fafc",  textDim: "#94a3b8"
  admin: {
    bg:       "#1A0C07",   // Espresso profundo
    bgRaised: "#261508",   // Sidebar activo, hover
    text:     "#F5EDE6",   // Crema — texto del panel
    textDim:  "#8B6B5A",   // Rosa-gris — texto secundario del panel
  },


  // ── Sellos de confianza (footer ecommerce) ─────────────────────────────────
  // Solo visible cuando cartConfig.enableCart: true.
  trust: {
    secure: "#22c55e",
  },

};
