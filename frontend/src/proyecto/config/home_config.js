// Contenido fijo del inicio de la tienda. Las promociones (carrusel y cinta) no van acá: se cargan
// desde el panel, en "Banners y promociones". El nombre y la frase salen de brand_config.js.
import { clientConfig } from "../../../../proyecto/client_config.js";

// Contactos del pie de página { id, icono, label, valor, href }. Los que siguen con [COMPLETAR] no se muestran.
export const HOME_CONTACTOS = [
  { id: "whatsapp", icono: "MessageCircle", label: "WhatsApp", valor: "+54 9 370 478-4641", href: `https://wa.me/${clientConfig.whatsapp}` },
  { id: "ubicacion", icono: "MapPin", label: "Local", valor: "[COMPLETAR dirección]", href: "#" },
  { id: "instagram", icono: "Instagram", label: "Instagram", valor: "[COMPLETAR usuario de Instagram]", href: "#" },
];

// Textos del inicio de la tienda (los usa el rubro tienda_ropa).
export const HOME_TIENDA = {
  categoriasEtiqueta: "Explorá",
  categoriasTitulo: "Comprá por categoría",
  novedadesEtiqueta: "Recién llegado",
  novedadesTitulo: "Novedades",
  verTodo: "Ver todo",
};
