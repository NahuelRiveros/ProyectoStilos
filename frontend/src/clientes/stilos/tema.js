// Paleta del manual de marca de Stilos: navy #2E394B, crema #EDDAC7, siena #AF9273.
// La siena original con texto blanco no llega al contraste mínimo (2.9:1), por eso el
// acento es su versión oscura (#7A5C44: 6.1:1 con blanco, 5.4:1 sobre el fondo crema).
export const tema = {
  colores: {
    primario: "#2E394B",
    "primario-hover": "#232C3B",
    "primario-texto": "#EDDAC7",
    acento: "#7A5C44",
    fondo: "#F7F0E8",
    texto: "#1E2D3D",
    "texto-suave": "#5B6878",
    borde: "#E2D3C4",
    // Panel de administración (contraste medido): navy oscuro con texto crema (10.3:1), pestaña
    // activa crema con texto navy (10.3:1), títulos de sección 6.9:1 y contenido en gris neutro
    // para leer tablas cómodo (texto suave 5.2:1).
    "panel-fondo": "#1E2D3D",
    "panel-texto": "#EDDAC7",
    "panel-texto-suave": "#A9B7C6",
    "panel-activo": "#EDDAC7",
    "panel-activo-texto": "#1E2D3D",
    "panel-foco": "#C3A38C",
    "panel-contenido": "#F3F4F6",
  },
  fuentes: {
    titulos: "'Cormorant Garamond', Georgia, serif",
    cuerpo: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
  },
  fuentes_url:
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap",
};
