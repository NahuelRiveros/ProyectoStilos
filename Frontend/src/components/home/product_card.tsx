import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, Eye, Check } from "lucide-react";
import { useCart } from "../../context/cart_context";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ProductImage {
  src: string;
  alt?: string;
}

export type ProductBadge = "nuevo" | "vuelve" | "agotado";

export interface ColorDot {
  id: number;
  nombre: string;
  hex: string | null;
}

export interface ProductCardProps {
  id: number | string;
  name: string;
  category: string;
  price: string;
  priceRaw?: number;           // precio numérico para el carrito
  oldPrice?: string | null;
  discount?: string | null;
  images?: ProductImage[];
  talles?: string[];           // talles disponibles con stock
  colores?: ColorDot[];        // colores disponibles
  badge?: ProductBadge | null;
  to?: string;
  onAddToCart?: (id: number | string) => void;
  onWishlist?: (id: number | string, active: boolean) => void;
}

// ─── Clases estáticas ─────────────────────────────────────────────────────────

const S = {
  wrap:         "group relative flex flex-col overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:shadow-xl hover:shadow-navy/10 hover:-translate-y-0.5",
  imgFrame:     "relative aspect-[3/4] overflow-hidden bg-surface",
  imgItem:      "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
  placeholder:  "flex h-full items-center justify-center",
  arrowBtn:     "absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink opacity-0 shadow-md backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 hover:bg-white hover:scale-105",
  dotsWrap:     "absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
  wishBtn:      "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-105",
  quickView:    "absolute left-3 bottom-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-white",
  overlay:      "absolute inset-0 bg-navy/0 transition-colors duration-300 group-hover:bg-navy/[0.03] pointer-events-none",
  badgeWrap:    "absolute left-3 top-3 z-10 flex flex-col gap-1",
  badgeNew:     "bg-navy px-2.5 py-[5px] text-[9px] font-black uppercase tracking-[0.14em] text-white",
  badgeBack:    "bg-ink px-2.5 py-[5px] text-[9px] font-black uppercase tracking-[0.14em] text-white",
  badgeSoldOut: "bg-line px-2.5 py-[5px] text-[9px] font-black uppercase tracking-[0.14em] text-muted",
  badgeDiscount:"bg-rose-500 px-2.5 py-[5px] text-[9px] font-black text-white",
  body:         "flex flex-1 flex-col px-4 pb-4 pt-3",
  catLabel:     "text-[10px] font-bold uppercase tracking-[0.14em] text-muted",
  nameLabel:    "mt-1 text-sm font-semibold leading-snug text-ink line-clamp-2",
  priceRow:     "mt-auto flex items-baseline gap-2 pt-3",
  priceMain:    "text-sm font-bold text-ink",
  priceOld:     "text-xs text-muted line-through",
  addBtn:       "mt-3 w-full border border-navy py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-navy transition-all duration-200 hover:bg-navy hover:text-white active:scale-[0.98]",
  addBtnSoldOut:"mt-3 w-full border border-line py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted cursor-not-allowed",
  addBtnOk:     "mt-3 w-full border border-emerald-500 bg-emerald-500 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-white",
} as const;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ProductCard({
  id,
  name,
  category,
  price,
  priceRaw,
  oldPrice,
  discount,
  images = [],
  talles = [],
  colores = [],
  badge,
  to,
  onWishlist,
}: ProductCardProps) {
  const { addItem } = useCart();

  const [currentImg,   setCurrentImg]   = useState(0);
  const [wishlisted,   setWishlisted]   = useState(false);
  const [showTalles,   setShowTalles]   = useState(false);
  const [addedKey,     setAddedKey]     = useState<string | null>(null);

  const isSoldOut   = badge === "agotado";
  const hasImages   = images.length > 0;
  const hasMultiple = images.length > 1;
  const hasTalles   = talles.length > 0;

  function stop(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function prev(e: React.MouseEvent) { stop(e); setCurrentImg((i) => (i === 0 ? images.length - 1 : i - 1)); }
  function next(e: React.MouseEvent) { stop(e); setCurrentImg((i) => (i === images.length - 1 ? 0 : i + 1)); }
  function goTo(e: React.MouseEvent, i: number) { stop(e); setCurrentImg(i); }

  function toggleWish(e: React.MouseEvent) {
    stop(e);
    setWishlisted((v) => { onWishlist?.(id, !v); return !v; });
  }

  function handleAddClick(e: React.MouseEvent) {
    stop(e);
    if (isSoldOut) return;
    if (hasTalles) {
      setShowTalles((v) => !v);
    } else {
      doAdd(undefined);
    }
  }

  function handleTalleClick(e: React.MouseEvent, talle: string) {
    stop(e);
    doAdd(talle);
  }

  function doAdd(talle?: string) {
    const key = `${id}-${talle ?? "u"}`;
    addItem({
      producto_id: Number(id),
      nombre:      name,
      categoria:   category,
      precio:      priceRaw ?? parseFloat(price.replace(/[^0-9,]/g, "").replace(",", ".")),
      imagen:      images[0],
      talle:       talle ?? null,
      cantidad:    1,
    });
    setShowTalles(false);
    setAddedKey(key);
    setTimeout(() => setAddedKey(null), 1800);
  }

  function handleMouseEnter() { if (hasMultiple) setCurrentImg(1); }
  function handleMouseLeave() { setCurrentImg(0); setShowTalles(false); }

  const justAdded = addedKey !== null;

  const card = (
    <div
      className={S.wrap}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── IMAGEN ─────────────────────────────────────────────────────────── */}
      <div className={S.imgFrame}>
        {hasImages ? (
          images.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.alt ?? name}
              className={[S.imgItem, i === currentImg ? "opacity-100" : "opacity-0"].join(" ")}
            />
          ))
        ) : (
          <div className={S.placeholder}>
            <ShoppingBag size={40} className="text-champagne/20" />
          </div>
        )}

        <div className={S.overlay} />

        {hasMultiple && (
          <>
            <button onClick={prev} className={[S.arrowBtn, "left-2"].join(" ")} aria-label="Imagen anterior">
              <ChevronLeft size={15} />
            </button>
            <button onClick={next} className={[S.arrowBtn, "right-2"].join(" ")} aria-label="Imagen siguiente">
              <ChevronRight size={15} />
            </button>
            <div className={S.dotsWrap}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => goTo(e, i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  className={["h-1.5 rounded-full transition-all duration-200", i === currentImg ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"].join(" ")}
                />
              ))}
            </div>
          </>
        )}

        <div className={S.badgeWrap}>
          {badge === "nuevo"   && <span className={S.badgeNew}>Nuevo</span>}
          {badge === "vuelve"  && <span className={S.badgeBack}>Vuelve</span>}
          {badge === "agotado" && <span className={S.badgeSoldOut}>Agotado</span>}
          {discount && !isSoldOut && <span className={S.badgeDiscount}>{discount}</span>}
        </div>

        <button
          onClick={toggleWish}
          className={[S.wishBtn, wishlisted ? "opacity-100" : "opacity-0 group-hover:opacity-100"].join(" ")}
          aria-label={wishlisted ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <Heart size={14} className={wishlisted ? "fill-rose-500 text-rose-500" : "text-ink/60"} />
        </button>

        <button onClick={stop} className={S.quickView} aria-label="Vista rápida">
          <Eye size={14} className="text-ink/70" />
        </button>
      </div>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      <div className={S.body}>
        <p className={S.catLabel}>{category}</p>
        <p className={S.nameLabel}>{name}</p>

        {/* Puntos de color */}
        {colores.length > 0 && (
          <div className="mt-2 flex items-center gap-1">
            {colores.slice(0, 5).map((c) => (
              <div
                key={c.id}
                title={c.nombre}
                className="h-3.5 w-3.5 rounded-full border border-white shadow-sm ring-1 ring-line"
                style={{ backgroundColor: c.hex ?? "#e5e7eb" }}
              />
            ))}
            {colores.length > 5 && (
              <span className="text-[9px] font-bold text-muted">+{colores.length - 5}</span>
            )}
          </div>
        )}

        <div className={S.priceRow}>
          <span className={S.priceMain}>{price}</span>
          {oldPrice && <span className={S.priceOld}>{oldPrice}</span>}
        </div>

        {/* Selector de talles (inline) */}
        {showTalles && hasTalles && (
          <div className="mt-3 flex flex-wrap gap-1.5" onClick={stop}>
            {talles.map((t) => (
              <button
                key={t}
                onClick={(e) => handleTalleClick(e, t)}
                className="border border-navy px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-navy transition-colors hover:bg-navy hover:text-white"
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Botón agregar */}
        <button
          onClick={handleAddClick}
          disabled={isSoldOut}
          className={
            isSoldOut ? S.addBtnSoldOut
            : justAdded ? S.addBtnOk
            : S.addBtn
          }
        >
          {isSoldOut ? "Sin stock"
           : justAdded ? <span className="flex items-center justify-center gap-1.5"><Check size={12} /> Agregado</span>
           : showTalles ? "Elegir talle ↑"
           : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );

  return to ? <NavLink to={to} className="block">{card}</NavLink> : card;
}
