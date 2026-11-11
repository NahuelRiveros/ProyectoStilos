/**
 * ROP-22: compartir una prenda. En el celular abre el menú del teléfono (Web Share); si no existe,
 * copia el link. Recibe `nav` (el navigator) para poder probarla sin navegador.
 * Devuelve "compartido", "copiado", "cancelado" o "error".
 */
export async function compartir({ titulo, texto, url }, nav) {
  if (typeof nav?.share === "function") {
    try {
      await nav.share({ title: titulo, text: texto, url });
      return "compartido";
    } catch (error) {
      // Cerrar el menú sin elegir no es un error.
      if (error?.name === "AbortError") return "cancelado";
    }
  }
  try {
    await nav.clipboard.writeText(url);
    return "copiado";
  } catch {
    return "error";
  }
}
