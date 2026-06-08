/**
 * TEMA VISUAL — editar este archivo para personalizar cada cliente.
 *
 * Los valores se inyectan automáticamente como CSS custom properties
 * al iniciar la app. No hace falta tocar index.css para cambiar colores.
 *
 * Secciones:
 *   accent   → color de marca (botones, badges, hovers)
 *   content  → página, formularios, cards, tablas
 *   navbar   → barra superior y menú
 *   footer   → pie de página (independiente del navbar)
 *   admin    → panel backoffice
 *   trust    → sellos de confianza del footer (ecommerce)
 */

export const themeConfig = {

  // ── FUENTES ──────────────────────────────────────────────────────────
  // Para cambiar: importar la fuente en index.html y actualizar aquí
  fontSans:    '"Outfit", system-ui, sans-serif',
  fontDisplay: '"Outfit", system-ui, sans-serif',


  // ── ACENTO DE MARCA ──────────────────────────────────────────────────
  // Afecta: botón accent, badge de la marca en navbar, hovers activos,
  //         badges de producto, alertas y elementos destacados
  accent:      "#fbbf24",   // color principal de acento
  accentOn:    "#0a0f1a",   // texto sobre el acento — debe contrastar bien
  accentLight: "#fef3c7",   // versión muy clara del acento (fondos suaves)
  accentDark:  "#b45309",   // versión oscura del acento (texto sobre fondos claros)


  // ── CONTENIDO ────────────────────────────────────────────────────────
  // Afecta: página, formularios, inputs, cards, modales, tablas, dropdowns
  content: {
    navy:    "#060d1f",   // botón primario, links, texto fuerte
    ink:     "#111827",   // texto principal de la página
    muted:   "#64748b",   // texto secundario, placeholders, labels
    surface: "#f8fafc",   // fondo de la página y secciones
    card:    "#ffffff",   // fondo de cards, modales y dropdowns
    line:    "#e2e8f0",   // bordes y separadores
  },


  // ── NAVBAR ───────────────────────────────────────────────────────────
  // Afecta: barra superior fija, mega-menu desplegable, menú móvil
  // NO afecta el footer (tiene su propio bloque)
  //
  // Presets de ejemplo:
  //   Oscuro navy  → bg:"#060d1f",  text:"#ffffff",  textDim:"#94a3b8"
  //   Champagne    → bg:"#fef3c7",  text:"#1c0f00",  textDim:"#78593a"
  //   Slate medio  → bg:"#0f172a",  text:"#f1f5f9",  textDim:"#64748b"
  //   Blanco       → bg:"#ffffff",  text:"#111827",  textDim:"#64748b"
  navbar: {
    bg:       "#fef3c7",   // fondo de la barra
    bgRaised: "#fde68a",   // fondo del mega-menu desplegable
    bgFloat:  "#ffffff",   // fondo del dropdown de usuario (siempre claro)
    text:     "#1c0f00",   // texto y links activos
    textDim:  "#78593a",   // links inactivos, íconos secundarios
  },


  // ── FOOTER ───────────────────────────────────────────────────────────
  // Afecta: pie de página, redes sociales, copyright, sellos de confianza
  // Independiente del navbar — podés combinar libremente
  //
  // Presets de ejemplo:
  //   Oscuro navy  → bg:"#060d1f",  text:"#ffffff",  textDim:"#94a3b8"
  //   Champagne    → bg:"#fef3c7",  text:"#1c0f00",  textDim:"#78593a"
  //   Slate medio  → bg:"#0f172a",  text:"#f1f5f9",  textDim:"#64748b"
  footer: {
    bg:      "#060d1f",   // fondo del footer
    text:    "#ffffff",   // texto principal
    textDim: "#94a3b8",   // texto secundario, links
  },


  // ── ADMIN PANEL ──────────────────────────────────────────────────────
  // Afecta: sidebar del backoffice, barra superior del admin
  // No afecta el frontend público
  //
  // Presets de ejemplo:
  //   Oscuro navy  → bg:"#060d1f",  bgRaised:"#0a1528",  text:"#f1f5f9",  textDim:"#64748b"
  //   Slate medio  → bg:"#1e293b",  bgRaised:"#334155",  text:"#f8fafc",  textDim:"#94a3b8"
  admin: {
    bg:       "#060d1f",
    bgRaised: "#0a1528",
    text:     "#f1f5f9",
    textDim:  "#64748b",
  },


  // ── SELLOS DE CONFIANZA (footer ecommerce) ───────────────────────────
  // Solo visible cuando cartConfig.enableCart: true
  // mpColor es fijo (#009EE3) — es la marca de MercadoPago
  trust: {
    secure: "#22c55e",   // color del badge "Compra Segura"
  },

};
