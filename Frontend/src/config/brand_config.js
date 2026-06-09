// IDENTIDAD DE MARCA
// Nombre, logo y textos que aparecen en todo el sitio.

export const brandConfig = {

  // ── Nombre y logo ─────────────────────────────────────────────────────────
  // Nombre completo — aparece en el menú y en el título del navegador
  name: "Angar",
  // Abreviación del nombre — se muestra cuando el espacio en el menú es reducido (celular)
  shortName: "A",
  // Frase corta que describe el negocio — aparece en la home y ayuda al SEO
  tagline: "Catálogo de productos",
  // URL del logo. null = se muestra el nombre en texto.
  // Subir el logo a Cloudinary y pegar la URL, o usar "/logo.png" dentro de /public
  logoUrl: null,
  // Ruta de destino al hacer clic en el logo
  homePath: "/",

  // ── Panel de administración ────────────────────────────────────────────────
  // Nombre que aparece en el encabezado del backoffice
  adminName: "Angar Backoffice",

  // ── Footer ─────────────────────────────────────────────────────────────────
  footerName: "Angar",
  // Frase debajo del nombre en el footer
  footerSubtitle: "Base ecommerce modular",
  // Texto de copyright al pie de página
  footerLicense: "Base ecommerce",

  // Redes sociales — dejar vacío ("") para ocultar el ícono en el footer
  social: {
    instagram: "https://www.instagram.com/angar.accesorios",
    facebook: "",
    linkedin: "",
    github: "",
  },
};
