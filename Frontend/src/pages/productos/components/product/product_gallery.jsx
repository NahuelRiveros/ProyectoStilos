import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

export default function ProductGallery({
  images,
  imgIdx,
  onPrev,
  onNext,
  onGoTo,
  badge,
  discountLabel,
  isSoldOut,
}) {
  return (
    <div className="flex gap-3">

      {/* ── Thumbnails verticales — desktop ─────────────────── */}
      {images.length > 1 && (
        <div className="hidden sm:flex flex-col gap-2 w-[3.75rem] shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onGoTo(i)}
              className={[
                "w-full overflow-hidden transition-all duration-200",
                "aspect-[2/3]",
                i === imgIdx
                  ? "opacity-100 ring-[1.5px] ring-navy ring-offset-1 ring-offset-surface"
                  : "opacity-35 hover:opacity-65",
              ].join(" ")}
              style={{ borderRadius: 0 }}
            >
              <img src={img.src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── Imagen principal ─────────────────────────────────── */}
      <div className="relative flex-1 min-w-0">

        {images.length > 0 ? (
          <>
            <div className="product-gallery">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.src}
                  alt={img.alt}
                  className={[
                    "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                    i === imgIdx ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />
              ))}

              {/* Flechas — solo mobile */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={onPrev}
                    className="sm:hidden icon-btn absolute left-3 top-1/2 z-10 -translate-y-1/2"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft size={18} className="text-ink" />
                  </button>
                  <button
                    onClick={onNext}
                    className="sm:hidden icon-btn absolute right-3 top-1/2 z-10 -translate-y-1/2"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight size={18} className="text-ink" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
                {badge === "nuevo"   && <span className="badge-ui badge-primary uppercase tracking-widest">Nuevo</span>}
                {badge === "vuelve"  && <span className="badge-ui badge-primary uppercase tracking-widest">Vuelve</span>}
                {badge === "agotado" && <span className="badge-ui bg-line text-muted uppercase tracking-widest">Agotado</span>}
                {discountLabel && !isSoldOut && <span className="badge-ui badge-danger">{discountLabel}</span>}
              </div>

              {/* Dots — solo mobile */}
              {images.length > 1 && (
                <div className="sm:hidden absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => onGoTo(i)}
                      className={[
                        "h-1.5 rounded-full transition-all duration-200",
                        i === imgIdx ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
                      ].join(" ")}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Flechas desktop — fuera del aspect-ratio, sobre la imagen */}
            {images.length > 1 && (
              <div className="hidden sm:flex absolute top-1/2 -translate-y-1/2 left-0 right-0 justify-between pointer-events-none z-10 px-3">
                <button onClick={onPrev} className="icon-btn pointer-events-auto" aria-label="Anterior">
                  <ChevronLeft size={16} className="text-ink" />
                </button>
                <button onClick={onNext} className="icon-btn pointer-events-auto" aria-label="Siguiente">
                  <ChevronRight size={16} className="text-ink" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="product-gallery flex items-center justify-center">
            <ShoppingBag size={64} className="text-champagne/20" />
          </div>
        )}
      </div>
    </div>
  );
}
