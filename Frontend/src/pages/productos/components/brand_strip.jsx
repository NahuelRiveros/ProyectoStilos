import { useRef } from "react";

export default function BrandStrip({ marcas, selected, onSelect }) {
  const scrollRef = useRef(null);

  if (marcas.length === 0) return null;

  return (
    <div className="relative border-b border-white/5 bg-navy">

      {/* fades que coinciden con el fondo oscuro */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-14 bg-linear-to-r from-navy to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-14 bg-linear-to-l from-navy to-transparent" />

      <div
        ref={scrollRef}
        className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto px-8 py-2.5 sm:px-10"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >

        {/* label izquierdo */}
        <span className="mr-3 shrink-0 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400 select-none">
          Marcas
        </span>

        {/* "Todas" */}
        <button
          onClick={() => onSelect(null)}
          className={[
            "shrink-0 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-200",
            selected === null
              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25"
              : "bg-white/8 text-slate-200 hover:bg-white/12 hover:text-white",
          ].join(" ")}
        >
          Todas
        </button>

        <div className="mx-2 h-4 w-px shrink-0 bg-white/10" />

        {/* cards de marcas */}
        {marcas.map((marca) => {
          const on = selected === marca.slug;
          return (
            <button
              key={marca.id}
              onClick={() => onSelect(on ? null : marca.slug)}
              title={marca.nombre}
              className={[
                "group relative flex h-12 shrink-0 items-center justify-center rounded-xl px-5 transition-all duration-200",
                on
                  ? "bg-white shadow-lg shadow-black/25 ring-1 ring-white/20"
                  : "bg-white/5 hover:bg-white/10",
              ].join(" ")}
              style={{ minWidth: 76 }}
            >

              {/* indicador activo — línea ámbar abajo del strip */}
              {on && (
                <span className="absolute -bottom-3.25 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-amber-400" />
              )}

              {marca.logo ? (
                <img
                  src={marca.logo}
                  alt={marca.nombre}
                  className={[
                    "h-6 w-auto max-w-16 object-contain transition-all duration-200",
                    on
                      ? "opacity-100 grayscale-0"
                      : "opacity-45 grayscale group-hover:opacity-75 group-hover:grayscale-0",
                  ].join(" ")}
                  draggable={false}
                />
              ) : (
                <span className={[
                  "text-[10px] font-black uppercase tracking-[0.12em] transition-colors duration-150",
                  on
                    ? "text-navy"
                    : "text-slate-300 group-hover:text-white",
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
