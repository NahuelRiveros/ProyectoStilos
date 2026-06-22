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
    <div className="space-y-3">
      <div className="product-gallery">
        {images.length > 0 ? (
          <>
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

            {images.length > 1 && (
              <>
                <button
                  onClick={onPrev}
                  className="icon-btn absolute left-3 top-1/2 z-10 -translate-y-1/2"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={18} className="text-ink" />
                </button>
                <button
                  onClick={onNext}
                  className="icon-btn absolute right-3 top-1/2 z-10 -translate-y-1/2"
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

            {/* Dots nav */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
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
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag size={64} className="text-champagne/20" />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onGoTo(i)}
              className={[
                "h-20 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                i === imgIdx
                  ? "border-navy shadow-sm"
                  : "border-transparent opacity-55 hover:opacity-90 hover:border-line",
              ].join(" ")}
            >
              <img src={img.src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
