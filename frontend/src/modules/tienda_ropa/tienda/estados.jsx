import { RotateCw } from "lucide-react";
import { mensajeError } from "../hooks/use_ropa.js";

// Los tres estados de una pantalla de la tienda: cargando, error con reintentar y vacío.

export function GrillaCargando({ cantidad = 8 }) {
  return (
    <div role="status" aria-label="Cargando prendas" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="aspect-3/4 animate-pulse rounded-2xl bg-(--kt-bg-soft) motion-reduce:animate-none" />
      ))}
    </div>
  );
}

export function ErrorReintentar({ consulta, mensaje }) {
  return (
    <div role="alert" className="rounded-2xl border border-(--kt-border) bg-white p-6 text-center text-sm">
      <p>{mensajeError(consulta.error, mensaje)}</p>
      <button
        type="button"
        onClick={() => consulta.refetch()}
        disabled={consulta.isFetching}
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-(--kt-border) px-4 font-semibold text-(--kt-petrol) hover:bg-(--kt-bg-soft) disabled:opacity-60"
      >
        <RotateCw size={16} aria-hidden="true" /> {consulta.isFetching ? "Cargando…" : "Reintentar"}
      </button>
    </div>
  );
}

export function Vacio({ titulo, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-(--kt-border) p-8 text-center">
      <p className="kt-display text-2xl font-semibold">{titulo}</p>
      {children && <div className="mt-2 text-sm text-(--kt-ink-soft)">{children}</div>}
    </div>
  );
}
