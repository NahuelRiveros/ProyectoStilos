import { type AnnouncementIcon, type PerkIcon } from "../../../api/home_config_api";
import { type ImagenItem } from "../../ui/image_uploader";

export function urlToItem(url: string, alt = ""): ImagenItem[] {
  return url ? [{ src: url, alt, public_id: "" }] : [];
}

export function itemToUrl(items: ImagenItem[]): string {
  return items[0]?.src ?? "";
}

export const ANNOUNCEMENT_ICONS: { value: AnnouncementIcon | ""; label: string }[] = [
  { value: "",         label: "Sin ícono"          },
  { value: "truck",    label: "Camión (envío)"      },
  { value: "tag",      label: "Etiqueta (promo)"    },
  { value: "sparkles", label: "Brillo (novedad)"    },
  { value: "gift",     label: "Regalo"              },
];

export const PERK_ICONS: { value: PerkIcon; label: string }[] = [
  { value: "truck",  label: "Camión (envío)"        },
  { value: "rotate", label: "Flechas (devolución)"  },
  { value: "shield", label: "Escudo (seguridad)"    },
  { value: "store",  label: "Tienda (retiro)"        },
];

export const SLUG_BG_OPTIONS = [
  "bg-champagne-light",
  "bg-navy/8",
  "bg-[#F0EDE8]",
  "bg-rose-50",
  "bg-emerald-50",
];

export function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 30) || `cat-${Date.now()}`;
}
