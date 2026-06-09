// TEMA VISUAL
// Fuentes, colores y estilos de todo el sitio.
// Los valores se aplican automáticamente como variables CSS al iniciar la app.
// No hace falta tocar index.css para cambiar colores — solo editar este archivo.

export const themeConfig = {

  // ── Fuentes ────────────────────────────────────────────────────────────────
  // Para cambiar: importar la fuente en index.html y actualizar aquí.
  fontSans:    '"Outfit", system-ui, sans-serif',
  fontDisplay: '"Outfit", system-ui, sans-serif',


  // ── Color de acento (marca) ────────────────────────────────────────────────
  // Afecta botones principales, badges, hovers y elementos destacados del sitio.
  accent:      "#fbbf24",   // Color principal de la marca
  accentOn:    "#0a0f1a",   // Texto sobre el acento — debe contrastar bien con `accent`
  accentLight: "#fef3c7",   // Versión muy clara del acento (fondos suaves, alertas)
  accentDark:  "#b45309",   // Versión oscura del acento (texto sobre fondos claros)


  // ── Contenido ─────────────────────────────────────────────────────────────
  // Afecta la página, formularios, cards, modales, tablas y dropdowns.
  content: {
    navy:    "#060d1f",   // Botón primario, links, texto con énfasis fuerte
    ink:     "#111827",   // Texto principal de la página
    muted:   "#64748b",   // Texto secundario, placeholders, labels
    surface: "#f8fafc",   // Fondo de la página y secciones
    card:    "#ffffff",   // Fondo de cards, modales y dropdowns
    line:    "#e2e8f0",   // Bordes y separadores
  },


  // ── Barra de navegación ────────────────────────────────────────────────────
  // Afecta la barra superior fija, el mega-menú desplegable y el menú móvil.
  // No afecta el footer — el footer tiene su propio bloque abajo.
  //
  // Ejemplos de combinaciones:
  //   Oscuro navy   → bg: "#060d1f",  text: "#ffffff",  textDim: "#94a3b8"
  //   Champagne     → bg: "#fef3c7",  text: "#1c0f00",  textDim: "#78593a"
  //   Slate medio   → bg: "#0f172a",  text: "#f1f5f9",  textDim: "#64748b"
  //   Blanco limpio → bg: "#ffffff",  text: "#111827",  textDim: "#64748b"
  navbar: {
    bg:       "#fef3c7",   // Fondo de la barra
    bgRaised: "#fde68a",   // Fondo del mega-menú desplegable
    bgFloat:  "#ffffff",   // Fondo del dropdown de usuario (conviene mantenerlo claro)
    text:     "#1c0f00",   // Texto y links activos
    textDim:  "#78593a",   // Links inactivos e íconos secundarios
  },


  // ── Footer ────────────────────────────────────────────────────────────────
  // Afecta el pie de página, redes sociales, copyright y sellos de confianza.
  // Se puede combinar libremente con el navbar.
  //
  // Ejemplos de combinaciones:
  //   Oscuro navy   → bg: "#060d1f",  text: "#ffffff",  textDim: "#94a3b8"
  //   Champagne     → bg: "#fef3c7",  text: "#1c0f00",  textDim: "#78593a"
  //   Slate medio   → bg: "#0f172a",  text: "#f1f5f9",  textDim: "#64748b"
  footer: {
    bg:      "#060d1f",   // Fondo del footer
    text:    "#ffffff",   // Texto principal
    textDim: "#94a3b8",   // Texto secundario, links
  },


  // ── Panel de administración ────────────────────────────────────────────────
  // Afecta el sidebar del backoffice y la barra superior del admin.
  // No afecta el frontend público.
  //
  // Ejemplos de combinaciones:
  //   Oscuro navy → bg: "#060d1f",  bgRaised: "#0a1528",  text: "#f1f5f9",  textDim: "#64748b"
  //   Slate medio → bg: "#1e293b",  bgRaised: "#334155",  text: "#f8fafc",  textDim: "#94a3b8"
  admin: {
    bg:       "#060d1f",
    bgRaised: "#0a1528",
    text:     "#f1f5f9",
    textDim:  "#64748b",
  },


  // ── Sellos de confianza (footer ecommerce) ─────────────────────────────────
  // Solo visible cuando cartConfig.enableCart: true.
  // El color de MercadoPago (#009EE3) es fijo — es su color oficial de marca.
  trust: {
    secure: "#22c55e",   // Color del badge "Compra Segura"
  },

};
