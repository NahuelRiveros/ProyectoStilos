// IDENTIDAD DE MARCA
// Nombre, logo y textos que aparecen en todo el sitio.

export const brandConfig = {

  // ── Nombre y logo ─────────────────────────────────────────────────────────
  // Nombre completo — aparece en el menú y en el título del navegador
  name: "Stilos",
  // Abreviación del nombre — se muestra cuando el espacio en el menú es reducido (celular)
  shortName: "S",
  // Frase corta que describe el negocio — aparece en la home y ayuda al SEO
  tagline: "Moda y estilo",
  // URL del logo. null = se muestra el nombre en texto.
  // Subir el logo a Cloudinary y pegar la URL, o usar "/logo.png" dentro de /public
  logoUrl: null,
  // Ruta de destino al hacer clic en el logo
  homePath: "/",

  // ── Panel de administración ────────────────────────────────────────────────
  // Nombre que aparece en el encabezado del backoffice
  adminName: "Stilos Backoffice",

  // ── Footer ─────────────────────────────────────────────────────────────────
  footerName: "Stilos",
  // Frase debajo del nombre en el footer
  footerSubtitle: "Moda y estilo",
  // Texto de copyright al pie de página
  footerLicense: "Stilos",

  // Redes sociales — dejar vacío ("") para ocultar el ícono en el footer
  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
    github: "",
  },
};
