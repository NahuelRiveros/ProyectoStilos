import {
  Settings2,
  ShoppingBag,
} from "lucide-react";

export const navbar_config = {
  brand: {
    titulo: "Angar",
    subtitulo: "Catalogo de productos",
    logoUrl: null,
    linkTo: "/",
    fallbackLetter: "A",
  },

  links: [
    {
      label: "Productos",
      to: "/catalogo",
      icon: ShoppingBag,
    },
    {
      label: "Admin",
      to: "/admin",
      icon: Settings2,
      requiereAuth: true,
      roles: ["ADM"],
    },
  ],
  dropdowns: [],
};
