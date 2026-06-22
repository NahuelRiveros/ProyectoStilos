import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { storeConfig } from "../../config/app_config";

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
  const hasImages  = images.length > 0;
  const hasMultiple = images.length > 1;

  function stop(e) { e.preventDefault(); e.stopPropagation(); }
  function goTo(e, i) { stop(e); setCurrentImg(i); }
  function toggleWish(e) {
    stop(e);
    setWishlisted((v) => { onWishlist?.(id, !v); return !v; });
  }

  function onMouseEnter() { if (hasMultiple) setCurrentImg(1); }
  function onMouseLeave() { setCurrentImg(0); }

  const card = (
    <article
      className="group relative flex flex-col overflow-hidden bg-card"
      style={{ boxShadow: "0 0 0 1px var(--color-line)" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── IMAGE FRAME ─────────────────────────────────────── */}
      <div className="relative aspect-[3/4] overflow-hidden" style={{ background: "var(--color-surface)" }}>

        {/* Images */}
        {hasImages ? (
          images.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.alt ?? name}
              className={[
                "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[650ms] ease-out",
                i === currentImg ? "opacity-100" : "opacity-0 scale-[1.04]",
              ].join(" ")}
              style={{
                transform: i === currentImg ? undefined : "scale(1.04)",
                filter: isSoldOut ? "grayscale(35%) brightness(0.96)" : undefined,
              }}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <span
              className="font-display font-bold italic select-none"
              style={{ fontSize: "5rem", color: "var(--color-navy)", opacity: 0.08 }}
            >
              S
            </span>
          </div>
        )}

        {/* Image scale layer on hover */}
        {hasImages && !isSoldOut && (
          <div
            className="absolute inset-0 transition-transform duration-[650ms] ease-out group-hover:scale-[1.04] pointer-events-none"
            style={{ background: "transparent" }}
          />
        )}

        {/* ── BADGES — flush left edge, no border-radius ────── */}
        <div className="absolute left-0 top-3.5 z-20 flex flex-col gap-px">
          {badge === "nuevo" && (
            <span
              className="py-1 pl-3 pr-3.5 text-[8px] font-black uppercase tracking-[0.22em]"
              style={{ background: "var(--color-navy)", color: "var(--color-surface)" }}
            >
              Nuevo
            </span>
          )}
          {badge === "vuelve" && (
            <span
              className="py-1 pl-3 pr-3.5 text-[8px] font-black uppercase tracking-[0.22em]"
              style={{ background: "var(--color-navy)", color: "var(--color-surface)" }}
            >
              Vuelve
            </span>
          )}
          {badge === "agotado" && (
            <span
              className="py-1 pl-3 pr-3.5 text-[8px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.82)", color: "var(--color-muted)" }}
            >
              Agotado
            </span>
          )}
          {discount && !isSoldOut && (
            <span
              className="py-1 pl-3 pr-3.5 text-[9px] font-black tracking-[0.08em]"
              style={{ background: "var(--color-accent)", color: "var(--color-navy)" }}
            >
              {discount}
            </span>
          )}
        </div>

        {/* ── WISHLIST ─────────────────────────────────────── */}
        {storeConfig.enableWishlist && (
          <button
            onClick={toggleWish}
            className={[
              "absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center transition-all duration-200",
              wishlisted
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100",
            ].join(" ")}
            style={{
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(6px)",
            }}
            aria-label={wishlisted ? "Quitar de favoritos" : "Guardar en favoritos"}
          >
            <Heart
              size={13}
              strokeWidth={1.5}
              className={wishlisted ? "fill-rose-500 text-rose-500" : "text-ink/50"}
            />
          </button>
        )}

        {/* ── HOVER OVERLAY — rises from bottom like a curtain ── */}
        {!isSoldOut && (
          <div
            className="absolute inset-x-0 bottom-0 z-10 translate-y-full transition-transform duration-[380ms] ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:translate-y-0"
            style={{
              background: "linear-gradient(to top, rgba(40,49,73,0.95) 0%, rgba(40,49,73,0.78) 50%, transparent 100%)",
              paddingTop: "3rem",
              paddingBottom: "0.875rem",
              paddingLeft: "0.875rem",
              paddingRight: "0.875rem",
            }}
          >
            {/* Talles in overlay */}
            {talles.length > 0 && (
              <div className="mb-2.5 flex flex-wrap gap-1">
                {talles.slice(0, 5).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em]"
                    style={{ border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.72)" }}
                  >
                    {t}
                  </span>
                ))}
                {talles.length > 5 && (
                  <span className="text-[8px]" style={{ color: "rgba(255,255,255,0.38)" }}>+{talles.length - 5}</span>
                )}
              </div>
            )}

            {/* Colores stacked in overlay */}
            {colores.length > 0 && (
              <div className="mb-3 flex items-center">
                {colores.slice(0, 7).map((c, i) => (
                  <div
                    key={c.id}
                    title={c.nombre}
                    className="h-3.5 w-3.5 rounded-full"
                    style={{
                      backgroundColor: c.hex ?? "#e5e7eb",
                      border: "1.5px solid rgba(255,255,255,0.45)",
                      marginLeft: i > 0 ? "-4px" : 0,
                    }}
                  />
                ))}
                {colores.length > 7 && (
                  <span className="ml-2 text-[8px]" style={{ color: "rgba(255,255,255,0.45)" }}>+{colores.length - 7}</span>
                )}
              </div>
            )}

            {/* Ver detalle — brass rule */}
            <div className="flex items-center gap-2">
              <div className="h-px flex-1" style={{ background: "rgba(201,168,124,0.35)" }} />
              <span
                className="text-[9px] font-black uppercase tracking-[0.24em]"
                style={{ color: "var(--color-accent)" }}
              >
                Ver detalle
              </span>
              <div className="h-px w-4" style={{ background: "var(--color-accent)" }} />
            </div>
          </div>
        )}

        {/* Image dots (above overlay area) */}
        {hasMultiple && (
          <div className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => goTo(e, i)}
                className={[
                  "h-px rounded-full transition-all duration-200",
                  i === currentImg ? "w-6 bg-white" : "w-2 bg-white/40",
                ].join(" ")}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── BODY STRIP — minimal, always visible ─────────── */}
      <div
        className="flex flex-1 flex-col px-3 pb-3.5 pt-2.5"
        style={{ borderTop: "1px solid var(--color-line)" }}
      >
        <p
          className="text-muted"
          style={{ fontSize: "8.5px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em" }}
        >
          {category}
        </p>

        <p
          className="mt-1 font-display text-ink line-clamp-2"
          style={{ fontSize: "0.8125rem", fontWeight: 500, lineHeight: "1.35", letterSpacing: "0.01em" }}
        >
          {name}
        </p>

        {price && (
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-semibold text-ink" style={{ fontSize: "13px", letterSpacing: "-0.01em" }}>
              {price}
            </span>
            {oldPrice && (
              <span className="text-muted line-through" style={{ fontSize: "11px" }}>
                {oldPrice}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );

  return to ? (
    <NavLink
      to={to}
      className="block transition-shadow duration-300 hover:shadow-[0_8px_32px_rgba(40,49,73,0.13)]"
    >
      {card}
    </NavLink>
  ) : (
    card
  );
}
