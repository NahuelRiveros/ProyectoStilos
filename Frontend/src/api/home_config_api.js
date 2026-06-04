import { http } from "./http";
import { brandConfig } from "../config/app_config";

export const DEFAULT_HOME_CONFIG = {
  carousel_activo: true,
  carousel: [
    {
      activo: true,
      badge: "Nueva coleccion",
      subtitle: "Temporada actual",
      title: "Vestite con",
      titleAccent: "tu estilo.",
      description: "Productos seleccionados, precios visibles e imagenes actualizadas.",
      primaryCta: { label: "Ver catalogo", to: "/catalogo" },
      secondaryCta: { label: "Ver novedades", to: "/catalogo" },
      tags: ["Novedades", "Ofertas", "Destacados"],
      image: "",
      imageAlt: "",
    },
    {
      activo: true,
      badge: "Ofertas",
      subtitle: "Precios destacados",
      title: "Elegidos para",
      titleAccent: "esta semana.",
      description: "Explora productos con descuentos y disponibilidad visible.",
      primaryCta: { label: "Ver ofertas", to: "/catalogo" },
      secondaryCta: { label: "Ver todo", to: "/catalogo" },
      tags: ["Descuentos", "Stock", "Temporada"],
      image: "",
      imageAlt: "",
    },
    {
      activo: false,
      badge: "Premium",
      subtitle: "Seleccion especial",
      title: "Detalles que",
      titleAccent: "se notan.",
      description: "Un espacio para destacar colecciones o marcas.",
      primaryCta: { label: "Explorar", to: "/catalogo" },
      secondaryCta: { label: "Damas", to: "/damas" },
      tags: ["Marca", "Calidad", "Estilo"],
      image: "",
      imageAlt: "",
    },
  ],
  categories: [
    { slug: "damas", name: "Damas", caption: "Ver mas", to: "/damas", image: "" },
    { slug: "hombre", name: "Hombre", caption: "Ver mas", to: "/hombre", image: "" },
    { slug: "calzado", name: "Calzado", caption: "Ver mas", to: "/calzado", image: "" },
  ],
  novedades_ids: [],
  announcement_activo: true,
  announcement: [
    { icon: "sparkles", text: "Catalogo actualizado con nuevos productos" },
  ],
  perks_activo: true,
  perks: [
    { icon: "store", title: "Catalogo visible", text: "Imagenes, descripcion y precios" },
    { icon: "shield", title: "Stock administrable", text: "Control desde el panel admin" },
    { icon: "truck", title: "Consultas directas", text: "Compra online deshabilitada por ahora" },
  ],
  categorias_section: {
    activo: true,
    eyebrow: "Categorias",
    title: "Explora la tienda",
    linkText: "Ver catalogo",
  },
  novedades_section: {
    activo: true,
    eyebrow: "Novedades",
    title: "Lo mas nuevo",
    linkText: "Ver catalogo",
  },
  ofertas_section: {
    activo: true,
    eyebrow: "Ofertas",
    title: "Precios destacados",
    linkText: "Ver catalogo",
  },
  brand_banner: {
    activo: true,
    eyebrow: brandConfig.name,
    title: "Productos para",
    titleAccent: "ver y elegir.",
    description: "Una tienda enfocada en visualizacion de productos, imagenes y precios.",
    primaryCta: { label: "Ver catalogo", to: "/catalogo" },
    secondaryCta: { label: "Damas", to: "/damas" },
  },
};

export async function getHomeConfig() {
  const { data } = await http.get("/home-config");
  return { ...DEFAULT_HOME_CONFIG, ...(data.data ?? {}) };
}

export async function saveHomeConfig(config) {
  const { data } = await http.put("/home-config", config);
  return data.data;
}
