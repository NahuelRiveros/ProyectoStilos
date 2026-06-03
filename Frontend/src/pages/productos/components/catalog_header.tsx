import { NavLink } from "react-router-dom";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CatalogHeaderProps {
  genero?:        string;
  generoLabel?:   string;
  categoriaLabel?: string;
  pageTitle:       string;
  total:           number;
  loading:         boolean;
  activeFiltersCount: number;
  onOpenFilters:   () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CatalogHeader({
  genero,
  generoLabel,
  categoriaLabel,
  pageTitle,
  total,
  loading,
  activeFiltersCount,
  onOpenFilters,
}: CatalogHeaderProps) {
  return (
    <div className="border-b border-line bg-card">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-3 flex items-center gap-1.5 text-[11px] text-muted">
          <NavLink to="/" className="transition-colors hover:text-ink">
            Inicio
          </NavLink>

          {generoLabel && genero ? (
            <>
              <ChevronRight size={10} />
              <NavLink
                to={`/${genero}`}
                className="capitalize transition-colors hover:text-ink"
              >
                {generoLabel}
              </NavLink>
            </>
          ) : (
            <>
              <ChevronRight size={10} />
              <span className="font-medium text-ink">Catálogo</span>
            </>
          )}

          {categoriaLabel && (
            <>
              <ChevronRight size={10} />
              <span className="font-medium text-ink">{categoriaLabel}</span>
            </>
          )}
        </nav>

        {/* Título + botón mobile */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              {pageTitle}
            </h1>
            {!loading && (
              <p className="mt-1 text-sm text-muted">
                {total === 0
                  ? "Sin productos"
                  : `${total} producto${total !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>

          {/* Solo visible en mobile */}
          <button
            onClick={onOpenFilters}
            className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2.5 text-xs font-bold text-ink transition-colors hover:border-navy/30 lg:hidden"
          >
            <SlidersHorizontal size={14} />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-navy text-[10px] font-black text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
