import {
  Settings2,
  ShoppingBag,
  HomeIcon
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
      label: "Home",
      to: "/",
      icon: HomeIcon,
    },
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
