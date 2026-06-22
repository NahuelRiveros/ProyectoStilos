import { useState } from "react";
import { X, ChevronRight } from "lucide-react";

// ─── Constantes exportadas ────────────────────────────────────────────────────

export const FILTROS_DEFAULT = {
  categoriaSlug: null,
  marcaSlug:     null,
  precio_max:    null,
  solo_ofertas:  false,
  solo_stock:    false,
  orden:         "novedad",
};

export function countActiveFiltros(f) {
  return [
    f.categoriaSlug !== null,
    f.marcaSlug     !== null,
    f.precio_max    !== null,
    f.solo_ofertas,
    f.solo_stock,
  ].filter(Boolean).length;
}

const ORDEN_OPTS = [
  { value: "novedad",     label: "Novedades"             },
  { value: "precio_asc",  label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
  { value: "nombre_asc",  label: "Nombre A–Z"            },
];

const PRECIO_PRESETS = [
  { label: "Todos los precios", value: null   },
  { label: "Hasta $15.000",     value: 15000  },
  { label: "$15.001 – $30.000", value: 30000  },
  { label: "$30.001 – $60.000", value: 60000  },
  { label: "Más de $60.000",    value: 999999 },
];

// ─── Helper radio ─────────────────────────────────────────────────────────────

function RadioBtn({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
        active ? "bg-navy font-semibold text-white" : "text-ink hover:bg-navy/6",
      ].join(" ")}
    >
      <span className={[
        "h-2 w-2 shrink-0 rounded-full border-2 transition-colors",
        active ? "border-white bg-white" : "border-muted",
      ].join(" ")} />
      {label}
    </button>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CatalogFilters({
  filtros,
  onChange,
  categorias,
  urlCategoria,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const activeCount = countActiveFiltros(filtros);

  function set(key, value) {
    onChange({ ...filtros, [key]: value });
  }

  function selectCategoria(slug) {
    set("categoriaSlug", filtros.categoriaSlug === slug ? null : slug);
  }

  const urlCatObj  = urlCategoria ? (categorias.find((c) => c.slug === urlCategoria) ?? null) : null;
  const childrenOf = (id) => categorias.filter((c) => c.padre_id === id);
  const roots      = urlCatObj
    ? childrenOf(urlCatObj.id)
    : categorias.filter((c) => c.padre_id === null);

  return (
    <div className="space-y-6">

      {/* ── Categorías ─────────────────────────────────────────────────────── */}
      {roots.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
            {urlCatObj ? "Subcategoría" : "Categoría"}
          </p>
          <div className="flex flex-col gap-0.5">
            {roots.map((cat) => {
              const children   = urlCatObj ? [] : childrenOf(cat.id);
              const hasKids    = children.length > 0;
              const isSelected = filtros.categoriaSlug === cat.slug;
              const isOpen     = expandedId === cat.id || isSelected;

              return (
                <div key={cat.id}>
                  <button
                    onClick={() => {
                      selectCategoria(cat.slug);
                      if (hasKids) setExpandedId(isOpen ? null : cat.id);
                    }}
                    className={[
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      isSelected ? "bg-navy font-semibold text-white" : "text-ink hover:bg-navy/6",
                    ].join(" ")}
                  >
                    <span className={[
                      "h-2 w-2 shrink-0 rounded-full border-2 transition-colors",
                      isSelected ? "border-white bg-white" : "border-muted",
                    ].join(" ")} />
                    <span className="flex-1 truncate">{cat.nombre}</span>
                    {hasKids && (
                      <ChevronRight
                        size={13}
                        className={[
                          "shrink-0 transition-transform duration-150",
                          isOpen     ? "rotate-90"    : "",
                          isSelected ? "text-white/70" : "text-muted",
                        ].join(" ")}
                      />
                    )}
                  </button>

                  {hasKids && isOpen && (
                    <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l-2 border-line pl-2">
                      {children.map((child) => {
                        const on = filtros.categoriaSlug === child.slug;
                        return (
                          <button
                            key={child.id}
                            onClick={() => selectCategoria(child.slug)}
                            className={[
                              "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                              on ? "bg-navy font-semibold text-white" : "text-muted hover:bg-navy/6 hover:text-ink",
                            ].join(" ")}
                          >
                            <span className={[
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              on ? "bg-white" : "bg-muted/40",
                            ].join(" ")} />
                            {child.nombre}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {roots.length > 0 && <hr className="border-line" />}

      {/* ── Ordenar por ────────────────────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
          Ordenar por
        </p>
        <div className="flex flex-col gap-0.5">
          {ORDEN_OPTS.map(({ value, label }) => (
            <RadioBtn key={value} active={filtros.orden === value} label={label} onClick={() => set("orden", value)} />
          ))}
        </div>
      </div>

      <hr className="border-line" />

      {/* ── Precio máximo ──────────────────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
          Precio máximo
        </p>
        <div className="flex flex-col gap-0.5">
          {PRECIO_PRESETS.map(({ label, value }) => (
            <RadioBtn key={label} active={filtros.precio_max === value} label={label} onClick={() => set("precio_max", value)} />
          ))}
        </div>
      </div>

      <hr className="border-line" />

      {/* ── Disponibilidad ─────────────────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
          Disponibilidad
        </p>
        <div className="space-y-2.5">
          {[
            ["solo_ofertas", "Solo en oferta"],
            ["solo_stock",   "Solo con stock"],
          ].map(([key, label]) => (
            <button key={key} onClick={() => set(key, !filtros[key])} className="flex w-full items-center gap-3 text-left">
              <span className={[
                "relative flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                filtros[key] ? "border-navy bg-navy" : "border-line bg-card",
              ].join(" ")}>
                {filtros[key] && (
                  <svg className="h-3 w-3 text-white" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-ink">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Limpiar ────────────────────────────────────────────────────────── */}
      {activeCount > 0 && (
        <>
          <hr className="border-line" />
          <button
            onClick={() => onChange(FILTROS_DEFAULT)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-xs font-bold text-muted transition-colors hover:border-navy/30 hover:text-navy"
          >
            <X size={12} /> Limpiar filtros
          </button>
        </>
      )}

    </div>
  );
}
