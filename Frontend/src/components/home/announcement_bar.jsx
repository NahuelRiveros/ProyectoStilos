import { useState } from "react";
import {
  X, Truck, Tag, Sparkles, Gift, Star, Percent, Zap,
  Heart, Crown, BadgeCheck, Clock, ShoppingBag, MapPin, Phone,
} from "lucide-react";
import { UI_ANNOUNCEMENT } from "../styles/ui_announcement_style";
const ICONS = {
  truck:    Truck,
  tag:      Tag,
  sparkles: Sparkles,
  gift:     Gift,
  star:     Star,
  percent:  Percent,
  zap:      Zap,
  heart:    Heart,
  crown:    Crown,
  badge:    BadgeCheck,
  clock:    Clock,
  bag:      ShoppingBag,
  pin:      MapPin,
  phone:    Phone,
};
const DEFAULT_ITEMS = [
  { icon: "truck", text: "Env\xEDo gratis en compras mayores a", accent: "$50.000" },
  { icon: "tag", text: "Us\xE1 el c\xF3digo", accent: "STILO10 \xB7 10% off" },
  { icon: "sparkles", text: "Nueva colecci\xF3n", accent: "Oto\xF1o \u2014 Invierno 2026" },
  { icon: "gift", text: "Devoluciones sin cargo en", accent: "30 d\xEDas" },
  { icon: "truck", text: "Retiro gratis en tienda", accent: "Formosa Capital" }
];
function AnnouncementBar({
  items = DEFAULT_ITEMS,
  dismissible = true,
  speed = 36
}) {
  const [visible, setVisible] = useState(true);
  if (!visible || !items.length) return null;
  const repeated = [...items, ...items];
  return <div className={UI_ANNOUNCEMENT.bar}>
      <div className={UI_ANNOUNCEMENT.tickerWrapper}>
        <div
    className={UI_ANNOUNCEMENT.tickerTrack}
    style={{ animation: `ticker-scroll ${speed}s linear infinite` }}
  >
          {repeated.map((item, idx) => {
    const Icon = item.icon ? ICONS[item.icon] : null;
    return <span key={idx} className={UI_ANNOUNCEMENT.item}>
                {Icon && <Icon size={11} className={UI_ANNOUNCEMENT.itemIcon} />}
                <span>{item.text}</span>
                {item.accent && <span className={UI_ANNOUNCEMENT.itemAccent}>
                    {item.accent}
                  </span>}
                <span className={UI_ANNOUNCEMENT.itemSep} />
              </span>;
  })}
        </div>
      </div>

      {dismissible && <button
    type="button"
    className={UI_ANNOUNCEMENT.dismissBtn}
    onClick={() => setVisible(false)}
    aria-label="Cerrar anuncio"
  >
          <X size={11} />
        </button>}
    </div>;
}
export {
  AnnouncementBar as default
};
