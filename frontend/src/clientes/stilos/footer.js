import { marca } from "./marca.js";

export const footer = {
  descripcion: marca.tagline,
  columnas: [
    {
      titulo: "Tienda",
      links: [
        { etiqueta: "Inicio", a: "/" },
        { etiqueta: "Cómo comprar", a: "/#como-comprar" },
        { etiqueta: "Contacto", a: "/#contacto" },
      ],
    },
    {
      titulo: "Contacto",
      links: [
        { etiqueta: "WhatsApp", a: "https://wa.me/5493704784641" },
        { etiqueta: "Instagram", a: "[COMPLETAR link de Instagram]" },
        { etiqueta: "Email", a: "[COMPLETAR mailto:email]" },
      ],
    },
  ],
  legal: {
    titular: marca.razon_social || marca.nombre,
    desarrollado_por: "Riveros Edgardo Nahuel",
  },
};
