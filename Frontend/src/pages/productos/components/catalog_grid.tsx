import { PackageOpen } from "lucide-react";

import ProductCard from "../../../components/home/product_card";
import type { Producto } from "../../../api/producto_api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number): string {
  return "$" + n.toLocaleString("es-AR");
}

function formatDiscount(p: Producto): string | null {
  if (p.descuento) return p.descuento;
  if (!p.precio_anterior) return null;
  return `-${Math.round((1 - p.precio / p.precio_anterior) * 100)}%`;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-card">
      <div className="aspect-3/4 animate-pulse bg-surface" />
      <div className="space-y-2 px-4 pb-4 pt-3">
        <div className="h-3 w-16 animate-pulse rounded bg-surface" />
        <div className="h-4 w-32 animate-pulse rounded bg-surface" />
        <div className="mt-3 h-3 w-20 animate-pulse rounded bg-surface" />
        <div className="mt-2 h-9 w-full animate-pulse rounded bg-surface" />
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CatalogGridProps {
  productos:          Producto[];
  loading:            boolean;
  activeFiltersCount: number;
  onClearFilters:     () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CatalogGrid({
  productos,
  loading,
  activeFiltersCount,
  onClearFilters,
}: CatalogGridProps) {
  const gridClass = "grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4";

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-champagne/15">
          <PackageOpen size={26} className="text-champagne" />
        </div>
        <p className="font-display text-lg font-bold text-ink">Sin resultados</p>
        <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
          No encontramos productos con los filtros seleccionados. Probá ajustar los criterios.
        </p>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="mt-7 border border-navy px-6 py-2.5 text-xs font-black uppercase tracking-widest text-navy transition-all duration-200 hover:bg-navy hover:text-white"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {productos.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          name={p.nombre}
          category={p.categoria}
          price={formatPrice(p.precio)}
          priceRaw={p.precio}
          oldPrice={p.precio_anterior ? formatPrice(p.precio_anterior) : null}
          discount={formatDiscount(p)}
          images={p.imagenes.map((img) =>
            typeof img === "string" ? { src: img } : img,
          )}
          talles={p.talles_disponibles.filter((t) => t.stock > 0).map((t) => t.talle)}
          colores={p.colores ?? []}
          badge={p.badge}
          to={`/producto/${p.id}`}
        />
      ))}
    </div>
  );
}
