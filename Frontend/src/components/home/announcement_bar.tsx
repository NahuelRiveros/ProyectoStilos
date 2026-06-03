import { useState } from "react";
import type { ComponentType } from "react";
import { X, Truck, Tag, Sparkles, Gift } from "lucide-react";
import { UI_ANNOUNCEMENT } from "../styles/ui_announcement_style";

type IconKey = "truck" | "tag" | "sparkles" | "gift";
type LucideIcon = ComponentType<{ size?: number; className?: string }>;

export interface AnnouncementItem {
  icon?: IconKey;
  text: string;
  accent?: string;
}

interface AnnouncementBarProps {
  items?: AnnouncementItem[];
  dismissible?: boolean;
  speed?: number; // segundos para un ciclo completo
}

const ICONS: Record<IconKey, LucideIcon> = {
  truck:     Truck,
  tag:       Tag,
  sparkles:  Sparkles,
  gift:      Gift,
};

const DEFAULT_ITEMS: AnnouncementItem[] = [
  { icon: "truck",    text: "Envío gratis en compras mayores a", accent: "$50.000" },
  { icon: "tag",      text: "Usá el código",                    accent: "STILO10 · 10% off" },
  { icon: "sparkles", text: "Nueva colección",                  accent: "Otoño — Invierno 2026" },
  { icon: "gift",     text: "Devoluciones sin cargo en",        accent: "30 días" },
  { icon: "truck",    text: "Retiro gratis en tienda",          accent: "Formosa Capital" },
];

export default function AnnouncementBar({
  items = DEFAULT_ITEMS,
  dismissible = true,
  speed = 36,
}: AnnouncementBarProps) {
  const [visible, setVisible] = useState(true);

  if (!visible || !items.length) return null;

  // Duplicar para loop seamless (la animación va de 0% a -50%)
  const repeated = [...items, ...items];

  return (
    <div className={UI_ANNOUNCEMENT.bar}>
      <div className={UI_ANNOUNCEMENT.tickerWrapper}>
        <div
          className={UI_ANNOUNCEMENT.tickerTrack}
          style={{ animation: `ticker-scroll ${speed}s linear infinite` }}
        >
          {repeated.map((item, idx) => {
            const Icon = item.icon ? ICONS[item.icon] : null;
            return (
              <span key={idx} className={UI_ANNOUNCEMENT.item}>
                {Icon && (
                  <Icon size={11} className={UI_ANNOUNCEMENT.itemIcon} />
                )}
                <span>{item.text}</span>
                {item.accent && (
                  <span className={UI_ANNOUNCEMENT.itemAccent}>
                    {item.accent}
                  </span>
                )}
                <span className={UI_ANNOUNCEMENT.itemSep} />
              </span>
            );
          })}
        </div>
      </div>

      {dismissible && (
        <button
          type="button"
          className={UI_ANNOUNCEMENT.dismissBtn}
          onClick={() => setVisible(false)}
          aria-label="Cerrar anuncio"
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}
