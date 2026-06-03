import type { ComponentType } from "react";
import {
  Shield,
  Shirt,
  Tag,
  Gem,
  Crown,
  Layers,
  Wind,
  CircleDot,
  Ribbon,
  Package,
  Sparkles,
} from "lucide-react";

// ─── Tipos de ícono ───────────────────────────────────────────────────────────

export type LucideIcon = ComponentType<{
  size?: number;
  className?: string;
  color?: string;
}>;

// ─── Tipos de estructura ──────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  to: string;
  icon?: LucideIcon;
  requiereAuth?: boolean;
  ocultarSiAuth?: boolean;
  roles?: string[];
}

export interface NavDropdownLeaf {
  label: string;
  to: string;
  icon?: LucideIcon;
  children?: never;
}

export interface NavDropdownGroup {
  label: string;
  icon?: LucideIcon;
  children: NavDropdownLeaf[];
  to?: never;
}

export type NavDropdownItem = NavDropdownLeaf | NavDropdownGroup;

export interface NavDropdown {
  id: string;
  label: string;
  icon?: LucideIcon;
  items: NavDropdownItem[];
  requiereAuth?: boolean;
  ocultarSiAuth?: boolean;
  roles?: string[];
  wide?: boolean;
}

export interface NavBrand {
  titulo: string;
  subtitulo: string;
  logoUrl: string | null;
  linkTo: string;
  fallbackLetter: string;
}

// ─── NavbarTheme ──────────────────────────────────────────────────────────────

export interface NavbarTheme {
  // ── Barra principal ──────────────────────────────────────────────
  bar: string;
  barShadow: string;
  accentLine: string | null;

  // ── Brand ────────────────────────────────────────────────────────
  brandLogo: string;
  brandTitle: string;
  brandSubtitle: string;

  // ── Links desktop ────────────────────────────────────────────────
  linkDefault: string;
  linkActive: string;

  // ── Trigger de dropdown desktop ──────────────────────────────────
  dropdownTrigger: string;
  dropdownTriggerOpen: string;

  // ── Ítems compartidos (panel dropdown + mobile) ──────────────────
  itemDefault: string;
  itemActive: string;
  itemIconDefault: string;
  groupLabel: string;
  groupIcon: string;

  // ── Panel dropdown desktop ───────────────────────────────────────
  panelWrap: string;
  panelHeader: string;

  // ── Menú mobile ──────────────────────────────────────────────────
  mobileWrap: string;
  mobileCardDefault: string;
  mobileCardOpen: string;
  mobileTriggerOpen: string;
  mobileChevron: string;
  mobileChevronOpen: string;
  mobileSeparator: string;

  // ── Botón de login mobile ────────────────────────────────────────
  mobileLoginBtn: string;

  // ── Avatar de usuario ────────────────────────────────────────────
  avatar: string;

  // ── Backdrop mobile ──────────────────────────────────────────────
  backdrop: string;
}

// ─── Presets de tema ──────────────────────────────────────────────────────────

export const NAVBAR_THEMES = {
  ecommerce: {
    bar:        "bg-champagne/40 border-champagne-light/60 backdrop-blur-sm",
    barShadow:  "shadow-md shadow-navy/10",
    accentLine: null,

    brandLogo:     "bg-navy shadow-sm shadow-navy/20",
    brandTitle:    "text-navy",
    brandSubtitle: "text-navy/55",

    linkDefault: "text-navy/80 hover:bg-white/50 hover:text-navy",
    linkActive:  "bg-white text-navy font-semibold shadow-sm shadow-navy/10",

    dropdownTrigger:     "text-navy/80 hover:bg-white/50 hover:text-navy",
    dropdownTriggerOpen: "bg-white text-navy shadow-sm shadow-navy/10",

    itemDefault:     "text-muted hover:bg-navy/6 hover:text-ink",
    itemActive:      "bg-navy text-white shadow-sm",
    itemIconDefault: "bg-surface text-muted",
    groupLabel:      "text-muted",
    groupIcon:       "bg-champagne/15 text-champagne",

    panelWrap:   "border-line bg-card shadow-xl shadow-navy/8",
    panelHeader: "border-b border-line bg-champagne-light/40",

    mobileWrap:        "border-champagne-light/60 bg-champagne",
    mobileCardDefault: "border-line bg-card",
    mobileCardOpen:    "border-champagne/40 bg-card shadow-sm shadow-navy/5",
    mobileTriggerOpen: "bg-champagne-light/40",
    mobileChevron:     "text-navy/40",
    mobileChevronOpen: "rotate-180 text-navy",
    mobileSeparator:   "border-navy/90",
    mobileLoginBtn:    "bg-navy text-white shadow-sm shadow-navy/20",

    avatar: "bg-navy shadow-sm shadow-navy/40",

    backdrop: "bg-navy/20 backdrop-blur-[2px]",
  } satisfies NavbarTheme,

  dark: {
    bar:        "bg-slate-900/98 border-slate-700/50 backdrop-blur-md",
    barShadow:  "shadow-xl shadow-black/30",
    accentLine: "bg-linear-to-r from-slate-700 to-slate-600",

    brandLogo:     "bg-slate-700 shadow-sm shadow-black/30",
    brandTitle:    "text-slate-100",
    brandSubtitle: "text-slate-500",

    linkDefault: "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
    linkActive:  "bg-slate-700 text-white",

    dropdownTrigger:     "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
    dropdownTriggerOpen: "bg-slate-800 text-slate-100",

    itemDefault:     "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
    itemActive:      "bg-slate-700 text-white shadow-sm",
    itemIconDefault: "bg-slate-800 text-slate-500",
    groupLabel:      "text-slate-600",
    groupIcon:       "bg-slate-800 text-slate-500",

    panelWrap:   "border-slate-700 bg-slate-900 shadow-2xl shadow-black/40",
    panelHeader: "border-b border-slate-700/60 bg-slate-800/60",

    mobileWrap:        "border-slate-700 bg-slate-900",
    mobileCardDefault: "border-slate-700 bg-slate-800",
    mobileCardOpen:    "border-slate-600 bg-slate-800 shadow-sm shadow-black/20",
    mobileTriggerOpen: "bg-slate-700/60",
    mobileChevron:     "text-slate-600",
    mobileChevronOpen: "rotate-180 text-slate-300",
    mobileSeparator:   "border-slate-700/60",
    mobileLoginBtn:    "bg-slate-700 text-white shadow-sm shadow-black/20",

    avatar: "bg-slate-700 shadow-sm shadow-black/20",

    backdrop: "bg-black/50 backdrop-blur-[2px]",
  } satisfies NavbarTheme,
} as const;

// ─── Tipo del config completo ─────────────────────────────────────────────────

export interface NavbarConfig {
  brand: NavBrand;
  links: NavLink[];
  dropdowns: NavDropdown[];
  theme: NavbarTheme;
}

// ─── Configuración activa ─────────────────────────────────────────────────────

export const navbar_config: NavbarConfig = {
  brand: {
    titulo:         "Stilos",
    subtitulo:      "Moda & Tendencias",
    logoUrl:        null,
    linkTo:         "/",
    fallbackLetter: "ST",
  },

  theme: NAVBAR_THEMES.ecommerce,

  // ── Links simples en la barra principal ────────────────────────────────────
  links: [
    {
      label: "Ofertas",
      to:    "/catalogo",
      icon:  Sparkles,
    },
    {
      label:        "Panel Admin",
      to:           "/admin",
      icon:         Shield,
      requiereAuth: true,
      roles:        ["Administrador"],
    },
  ],

  // ── Dropdowns del catálogo ─────────────────────────────────────────────────
  dropdowns: [
    {
      id:    "damas",
      label: "Damas",
      icon:  Gem,
      items: [
        { label: "Ver todo Damas",  to: "/damas",               icon: Gem    },
        { label: "Vestidos",        to: "/damas/vestidos",       icon: Gem    },
        { label: "Ropa de Noche",   to: "/damas/ropa-de-noche",  icon: Crown  },
        { label: "Remeras",         to: "/damas/remeras",        icon: Shirt  },
        { label: "Jeans",           to: "/damas/jeans",          icon: Tag    },
        { label: "Busos",           to: "/damas/busos",          icon: Layers },
        { label: "Camperas",        to: "/damas/camperas",       icon: Wind   },
        { label: "Sweaters",        to: "/damas/sweaters",       icon: Layers },
      ],
    },

    {
      id:    "hombre",
      label: "Hombre",
      icon:  Shirt,
      items: [
        { label: "Ver todo Hombre", to: "/hombre",               icon: Shirt     },
        { label: "Camisas",         to: "/hombre/camisas",       icon: Shirt     },
        { label: "Remeras",         to: "/hombre/remeras",       icon: Shirt     },
        { label: "Chombas",         to: "/hombre/chombas",       icon: Shirt     },
        { label: "Jeans",           to: "/hombre/jeans",         icon: Tag       },
        { label: "Busos",           to: "/hombre/busos",         icon: Layers    },
        { label: "Camperas",        to: "/hombre/camperas",      icon: Wind      },
        { label: "Gorros",          to: "/hombre/gorros",        icon: CircleDot },
        { label: "Cintos",          to: "/hombre/cintos",        icon: Ribbon    },
      ],
    },

    {
      id:    "calzado",
      label: "Calzado",
      icon:  Package,
      items: [
        { label: "Ver todo Calzado",    to: "/calzado",                    icon: Package },
        { label: "Zapatillas Dama",     to: "/calzado/zapatillas-dama",    icon: Package },
        { label: "Zapatillas Hombre",   to: "/calzado/zapatillas-hombre",  icon: Package },
        { label: "Zapatos Dama",        to: "/calzado/zapatos-dama",       icon: Package },
        { label: "Zapatos Hombre",      to: "/calzado/zapatos-hombre",     icon: Package },
      ],
    },
  ],
};
