import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, Eye } from "lucide-react";

const S = {
  wrap: "group relative flex flex-col overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:shadow-xl hover:shadow-navy/10 hover:-translate-y-0.5",
  imgFrame: "relative aspect-[3/4] overflow-hidden bg-surface",
  imgItem: "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
  placeholder: "flex h-full items-center justify-center",
  arrowBtn: "absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink opacity-0 shadow-md backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 hover:bg-white hover:scale-105",
  dotsWrap: "absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
  wishBtn: "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-105",
  quickView: "absolute left-3 bottom-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-white",
  overlay: "absolute inset-0 bg-navy/0 transition-colors duration-300 group-hover:bg-navy/[0.03] pointer-events-none",
  badgeWrap: "absolute left-3 top-3 z-10 flex flex-col gap-1",
  badgeNew: "bg-navy px-2.5 py-[5px] text-[9px] font-black uppercase tracking-[0.14em] text-white",
  badgeBack: "bg-ink px-2.5 py-[5px] text-[9px] font-black uppercase tracking-[0.14em] text-white",
  badgeSoldOut: "bg-line px-2.5 py-[5px] text-[9px] font-black uppercase tracking-[0.14em] text-muted",
  badgeDiscount: "bg-rose-500 px-2.5 py-[5px] text-[9px] font-black text-white",
  body: "flex flex-1 flex-col px-4 pb-4 pt-3",
  catLabel: "text-[10px] font-bold uppercase tracking-[0.14em] text-muted",
  nameLabel: "mt-1 text-sm font-semibold leading-snug text-ink line-clamp-2",
  priceRow: "mt-auto flex items-baseline gap-2 pt-3",
  priceMain: "text-sm font-bold text-ink",
  priceOld: "text-xs text-muted line-through",
  detailBtn: "mt-3 w-full border border-navy py-2.5 text-center text-[10px] font-black uppercase tracking-[0.14em] text-navy transition-all duration-200 group-hover:bg-navy group-hover:text-white",
};

export default function ProductCard({
  id,
  name,
  category,
  price,
  oldPrice,
  discount,
  images = [],
  talles = [],
  colores = [],
  badge,
  to,
  onWishlist,
}) {
  const [currentImg, setCurrentImg] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const isSoldOut = badge === "agotado";
  const hasImages = images.length > 0;
  const hasMultiple = images.length > 1;

  function stop(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function prev(e) {
    stop(e);
    setCurrentImg((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function next(e) {
    stop(e);
    setCurrentImg((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  function goTo(e, i) {
    stop(e);
    setCurrentImg(i);
  }

  function toggleWish(e) {
    stop(e);
    setWishlisted((v) => {
      onWishlist?.(id, !v);
      return !v;
    });
  }

  function handleMouseEnter() {
    if (hasMultiple) setCurrentImg(1);
  }

  function handleMouseLeave() {
    setCurrentImg(0);
  }

  const card = (
    <div className={S.wrap} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
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
            <ShoppingBag size={40} className="text-accent/20" />
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
                  className={[
                    "h-1.5 rounded-full transition-all duration-200",
                    i === currentImg ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
                  ].join(" ")}
                />
              ))}
            </div>
          </>
        )}

        <div className={S.badgeWrap}>
          {badge === "nuevo" && <span className={S.badgeNew}>Nuevo</span>}
          {badge === "vuelve" && <span className={S.badgeBack}>Vuelve</span>}
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

        <span className={S.quickView} aria-hidden="true">
          <Eye size={14} className="text-ink/70" />
        </span>
      </div>

      <div className={S.body}>
        <p className={S.catLabel}>{category}</p>
        <p className={S.nameLabel}>{name}</p>

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
            {colores.length > 5 && <span className="text-[9px] font-bold text-muted">+{colores.length - 5}</span>}
          </div>
        )}

        {talles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {talles.slice(0, 4).map((t) => (
              <span key={t} className="border border-line px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted">
                {t}
              </span>
            ))}
            {talles.length > 4 && <span className="text-[9px] font-bold text-muted">+{talles.length - 4}</span>}
          </div>
        )}

        <div className={S.priceRow}>
          <span className={S.priceMain}>{price}</span>
          {oldPrice && <span className={S.priceOld}>{oldPrice}</span>}
        </div>

        <div className={S.detailBtn}>Ver detalle</div>
      </div>
    </div>
  );

  return to ? (
    <NavLink to={to} className="block">
      {card}
    </NavLink>
  ) : (
    card
  );
}
