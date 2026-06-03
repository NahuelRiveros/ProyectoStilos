import { http, type ApiResponse } from "./http";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SlideConfig {
  activo:           boolean;
  badge:            string;
  title:            string;
  titleAccent:      string;
  subtitle:         string;
  description:      string;
  image:            string;   // URL (vacío = auto desde producto)
  imageAlt:         string;
  primaryCta:       { label: string; to: string };
  secondaryCta:     { label: string; to: string };
  tags:             string[];
}

export type AnnouncementIcon = "truck" | "tag" | "sparkles" | "gift";

export interface AnnouncementItem {
  icon:   AnnouncementIcon | "";
  text:   string;
  accent: string;
}

export type PerkIcon = "truck" | "rotate" | "shield" | "store";

export interface PerkConfig {
  icon:  PerkIcon;
  label: string;
  text:  string;
}

// Card de categoría configurable en el home (máx 5)
export interface CategoryConfig {
  slug:    string;  // identificador único, usado para key y color de fallback
  name:    string;  // texto visible en la card
  caption: string;  // texto del hover (ej: "Ver colección")
  to:      string;  // ruta de destino (ej: "/damas")
  image:   string;  // URL de Cloudinary (vacío = solo color de fondo)
}

export interface SectionConfig {
  eyebrow:  string;
  title:    string;
  linkText: string;
}

export interface BrandBannerConfig {
  eyebrow:      string;
  title:        string;
  titleAccent:  string;
  description:  string;
  primaryCta:   { label: string; to: string };
  secondaryCta: { label: string; to: string };
}

export interface HomeConfig {
  carousel:           SlideConfig[];
  announcement:       AnnouncementItem[];
  perks:              PerkConfig[];
  categories:         CategoryConfig[];
  novedades_ids:      number[];
  categorias_section: SectionConfig;
  novedades_section:  SectionConfig;
  ofertas_section:    SectionConfig;
  brand_banner:       BrandBannerConfig;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_HOME_CONFIG: HomeConfig = {
  carousel: [
    {
      activo:       true,
      badge:        "Nueva Colección",
      title:        "Vestite con",
      titleAccent:  "tu estilo.",
      subtitle:     "Otoño — Invierno 2026",
      description:  "Descubrí las piezas que definen la temporada. Calidad, confort y diseño pensados para vos.",
      image:        "",
      imageAlt:     "Colección Stilo's",
      primaryCta:   { label: "Ver colección",       to: "/catalogo"   },
      secondaryCta: { label: "Explorar categorías", to: "/categorias" },
      tags:         ["Abrigos", "Sweaters", "Botas", "Accesorios"],
    },
    {
      activo:       true,
      badge:        "Oferta especial",
      title:        "Hasta 40% off",
      titleAccent:  "en seleccionados.",
      subtitle:     "Solo esta semana",
      description:  "Aprovechá los precios especiales en cientos de productos de todas las categorías.",
      image:        "",
      imageAlt:     "Ofertas Stilo's",
      primaryCta:   { label: "Ver ofertas",    to: "/ofertas"  },
      secondaryCta: { label: "Conocer planes", to: "/premium"  },
      tags:         ["Hasta 40% off", "Envío gratis", "Tiempo limitado"],
    },
    {
      activo:       true,
      badge:        "Stilo's Premium",
      title:        "Beneficios",
      titleAccent:  "exclusivos.",
      subtitle:     "Membresía sin compromiso",
      description:  "Suscribite a Premium y obtené envío gratis, 10% de descuento permanente y acceso anticipado a colecciones.",
      image:        "",
      imageAlt:     "Stilo's Premium",
      primaryCta:   { label: "Conocer planes", to: "/premium"  },
      secondaryCta: { label: "Ver catálogo",   to: "/catalogo" },
      tags:         ["Envío gratis", "10% off", "Acceso VIP"],
    },
  ],
  announcement: [
    { icon: "truck",    text: "Envío gratis en compras mayores a", accent: "$50.000" },
    { icon: "tag",      text: "Usá el código",                     accent: "STILO10 · 10% off" },
    { icon: "sparkles", text: "Nueva colección",                   accent: "Otoño — Invierno 2026" },
    { icon: "gift",     text: "Devoluciones sin cargo en",         accent: "30 días" },
    { icon: "truck",    text: "Retiro gratis en tienda",           accent: "Formosa Capital" },
  ],
  perks: [
    { icon: "truck",   label: "Envío gratis",     text: "En compras +$50.000"      },
    { icon: "rotate",  label: "Devoluciones",     text: "30 días sin cargo"        },
    { icon: "shield",  label: "Pago seguro",      text: "Transacciones protegidas" },
    { icon: "store",   label: "Retiro en tienda", text: "CABA y GBA · sin costo"   },
  ],
  categories: [
    { slug: "mujer",      name: "Mujer",      caption: "Ver colección", to: "/damas",      image: "" },
    { slug: "hombre",     name: "Hombre",     caption: "Explorar",      to: "/hombre",     image: "" },
    { slug: "accesorios", name: "Accesorios", caption: "Descubrir",     to: "/accesorios", image: "" },
    { slug: "ofertas",    name: "Ofertas",    caption: "Aprovechar",    to: "/ofertas",    image: "" },
  ],
  novedades_ids: [],
  categorias_section: {
    eyebrow:  "Categorías",
    title:    "Explorá la tienda",
    linkText: "Ver todo",
  },
  novedades_section: {
    eyebrow:  "Novedades",
    title:    "Lo más nuevo",
    linkText: "Ver catálogo",
  },
  ofertas_section: {
    eyebrow:  "Oferta especial",
    title:    "Hasta 40% OFF",
    linkText: "Ver todas",
  },
  brand_banner: {
    eyebrow:      "Stilo's",
    title:        "La moda que",
    titleAccent:  "te define.",
    description:  "Cada pieza de nuestra colección está pensada para que te sientas única. Calidad premium, diseño sin compromiso.",
    primaryCta:   { label: "Ver colección",      to: "/catalogo" },
    secondaryCta: { label: "Conocer membresías", to: "/premium"  },
  },
};

// ─── Merge config parcial con defaults ───────────────────────────────────────

export function mergeConfig(raw: Partial<HomeConfig>): HomeConfig {
  const def = DEFAULT_HOME_CONFIG;
  return {
    carousel:           raw.carousel?.length      ? raw.carousel      : def.carousel,
    announcement:       raw.announcement?.length  ? raw.announcement  : def.announcement,
    perks:              raw.perks?.length         ? raw.perks         : def.perks,
    categories:         raw.categories?.length    ? raw.categories    : def.categories,
    novedades_ids:      Array.isArray(raw.novedades_ids) ? raw.novedades_ids : def.novedades_ids,
    categorias_section: raw.categorias_section ?? def.categorias_section,
    novedades_section:  raw.novedades_section  ?? def.novedades_section,
    ofertas_section:    raw.ofertas_section    ?? def.ofertas_section,
    brand_banner:       raw.brand_banner       ?? def.brand_banner,
  };
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function getHomeConfig(): Promise<HomeConfig> {
  const r = await http.get<ApiResponse<Partial<HomeConfig>>>("/home-config");
  return mergeConfig(r.data.data ?? {});
}

export async function saveHomeConfig(config: HomeConfig): Promise<HomeConfig> {
  const r = await http.put<ApiResponse<HomeConfig>>("/home-config", config);
  return r.data.data;
}
