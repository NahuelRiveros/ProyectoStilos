// Aplica colores y fuentes del cliente sobre los tokens de src/index.css,
// y usa la marca para el título y el ícono de la pestaña.
export function aplicarTema({ tema = {}, marca }) {
  const raiz = document.documentElement.style;
  for (const [token, valor] of Object.entries(tema.colores ?? {})) raiz.setProperty(`--${token}`, valor);
  for (const [token, valor] of Object.entries(tema.fuentes ?? {})) raiz.setProperty(`--fuente-${token}`, valor);
  // Fuentes web del cliente (ej. Google Fonts). Mientras cargan se ve la fuente de respaldo.
  const hojas = [...document.querySelectorAll("link[rel='stylesheet']")];
  if (tema.fuentes_url && !hojas.some((hoja) => hoja.getAttribute("href") === tema.fuentes_url)) {
    const hoja = document.createElement("link");
    hoja.rel = "stylesheet";
    hoja.href = tema.fuentes_url;
    document.head.append(hoja);
  }
  if (marca?.nombre) document.title = marca.nombre;
  const icono = document.querySelector("link[rel='icon']");
  if (marca?.logo && icono) icono.href = marca.logo;
}
