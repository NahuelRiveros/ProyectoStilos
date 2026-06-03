import {
  Users,
  FileText,
  HelpCircle,
  Shield,
  ClipboardList,
  History,
  LayoutDashboard,
  Settings2,
} from "lucide-react";

export const navbar_config = {
  brand: {
    titulo: "Base Proyecto",
    subtitulo: "Proyectos Nahuel Riveros",
    logoUrl: null,
    linkTo: "/",
    fallbackLetter: "SC",
  },

  links: [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: LayoutDashboard,
      requiereAuth: true,
      roles: [],
    },
    {
      label: "Guías/Dudas",
      to: "/guias",
      icon: HelpCircle,
    },
    {
      label: "Admin",
      to: "/admin",
      icon: Settings2,
      requiereAuth: true,
      roles: ["ADM"],
    },
  ],

  dropdowns: [
    {
      id: "visitantes",
      label: "Visitantes",
      icon: Users,
      items: [
        { label: "Visitantes", to: "/visitantes", icon: Users },
        { label: "Reporte visitantes", to: "/visitantes/reporte", icon: ClipboardList },
        { label: "Histórico visitantes", to: "/visitantes/historico", icon: History },
      ],
    },
    {
      id: "notas",
      label: "Notas",
      icon: FileText,
      items: [
        { label: "Notas", to: "/notas", icon: FileText },
        { label: "Reporte notas", to: "/notas/reporte", icon: ClipboardList },
        { label: "Histórico notas", to: "/notas/historico", icon: History },
      ],
    },
  ],
};
