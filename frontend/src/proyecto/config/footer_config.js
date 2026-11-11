import { Images, MessageCircle } from "lucide-react";
import { brandConfig } from "./brand_config.js";

// Contenido del footer. `habilitado: false` apaga un ítem puntual. Describe cómo funciona el sitio:
// promesas comerciales (envíos, cambios, cuotas) solo con datos confirmados por el negocio.
export const footer_config = {
  marca: {
    tagline: brandConfig.tagline,
    estadoLabel: "Tienda online",
    selloLabel: brandConfig.rubro,
  },
  diferenciales: [
    { habilitado: true, icon: Images, titulo: "Fotos de cada color", texto: "Elegí el color y mirá cómo es antes de pedirlo." },
    { habilitado: true, icon: MessageCircle, titulo: "Pedido por WhatsApp", texto: "Armá tu pedido y envialo: te confirmamos disponibilidad." },
  ],
  callout: { titulo: "¿Cómo compro?", texto: "Elegí talle y color, sumalos a tu pedido y envialo por WhatsApp." },
  legal: {
    nombreDerechos: brandConfig.razonSocial || brandConfig.nombre,
    mostrarDesarrolladoPor: true,
    desarrolladoPor: "Riveros Edgardo Nahuel",
  },
};
