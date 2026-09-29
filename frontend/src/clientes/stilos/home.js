import { marca } from "./marca.js";

// El Home se arma con secciones reutilizables, en el orden de esta lista.
// Tipos disponibles: hero, pilares, pasos, contacto (ver src/modulos/home/secciones/).
// Iconos disponibles: ver src/componentes/ui/icono.jsx.
const WHATSAPP = "https://wa.me/5493704784641";

export const home = {
  secciones: [
    {
      tipo: "hero",
      kicker: marca.tagline,
      titulo: "Tu estilo, a un clic",
      subtitulo: "Elegí tus prendas por talle y color, armá tu pedido online y recibilo en tu casa o retiralo en el local.",
      cta_primario: { texto: "Ver la tienda", a: "/catalogo" },
      cta_secundario: { texto: "Cómo comprar", a: "/#como-comprar" },
    },
    {
      tipo: "pilares",
      id: "por-que",
      kicker: "Por qué Stilos",
      titulo: "Comprar ropa online, simple",
      items: [
        { icono: "Shirt", titulo: "Talles y colores a la vista", texto: "Cada prenda muestra qué talles y colores hay disponibles antes de agregarla." },
        { icono: "Truck", titulo: "Envío o retiro", texto: "Elegís si te lo enviamos a domicilio o si pasás a buscarlo por el local." },
        { icono: "CreditCard", titulo: "Pagá como te quede cómodo", texto: "Elegís el medio de pago al confirmar el pedido." },
      ],
    },
    {
      tipo: "pasos",
      id: "como-comprar",
      kicker: "Así de simple",
      titulo: "Cómo comprar",
      items: [
        { titulo: "Elegís tus prendas", texto: "Buscá por categoría o mirá las ofertas." },
        { titulo: "Seleccionás talle y color", texto: "Agregalas al carrito; podés dejarlo armado y volver después." },
        { titulo: "Confirmás el pedido", texto: "Te avisamos cuando esté listo para enviar o retirar." },
      ],
    },
    {
      tipo: "contacto",
      id: "contacto",
      kicker: "Hablemos",
      titulo: "Contactanos",
      items: [
        { icono: "MessageCircle", etiqueta: "WhatsApp", valor: "+54 9 370 478-4641", href: WHATSAPP },
        { icono: "MapPin", etiqueta: "Local", valor: "[COMPLETAR dirección]" },
        { icono: "Mail", etiqueta: "Email", valor: "[COMPLETAR email]" },
      ],
    },
  ],
};
