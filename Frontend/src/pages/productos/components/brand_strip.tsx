import { useRef } from "react";
import type { Marca } from "../../../api/catalogo_api";

interface BrandStripProps {
  marcas:        Marca[];
  selected:      string | null;
  onSelect:      (slug: string | null) => void;
}

export default function BrandStrip({ marcas, selected, onSelect }: BrandStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (marcas.length === 0) return null;

  return (
    <div className="relative border-b border-line bg-navy">
      {/* fade left */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-card to-transparent" />
      {/* fade right */}
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-card to-transparent" />

      <div
        ref={scrollRef}
        className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-6 py-3 scrollbar-none sm:px-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Todas */}
        <button
          onClick={() => onSelect(null)}
          className={[
            "shrink-0 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-200",
            selected === null
              ? "bg-champagne text-white  shadow-md"
              : "bg-white text-navy hover:bg-white/70 hover:text-navy",
          ].join(" ")}
        >
          Todas
        </button>

        <div className="mx-2 h-5 w-px shrink-0 bg-line" />

        {/* Brand cards */}
        {marcas.map((marca) => {
          const on = selected === marca.slug;
          return (
            <button
              key={marca.id}
              onClick={() => onSelect(on ? null : marca.slug)}
              title={marca.nombre}
              className={[
                "group relative flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-4 transition-all duration-200",
                "h-14 min-w-[80px]",
                on ? " shadow-sm" : "",
              ].join(" ")}
            >
              {/* champagne top bar when selected */}
              {on && (
                <span className="absolute inset-x-3 top-0 h-[2px] rounded-b-full bg-white" />
              )}

              {marca.logo ? (
                <div className="flex flex-col items-center justify-center gap-1">
                  <img
                    src={marca.logo}
                    alt={marca.nombre}
                    className={[
                      "h-7 w-auto max-w-[68px] object-contain transition-all duration-200",
                      on
                        ? "opacity-100 grayscale-0"
                        : "opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0",
                    ].join(" ")}
                    draggable={false}
                  />
                  {on && (
                    <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-white line-clamp-1">
                      {marca.nombre}
                    </span>
                  )}
                </div>
              ) : (
                <span className={[
                  "text-[10px] font-black uppercase tracking-[0.15em] transition-colors",
                  on ? "text-white" : "text-muted group-hover:text-ink",
                ].join(" ")}>
                  {marca.nombre}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
