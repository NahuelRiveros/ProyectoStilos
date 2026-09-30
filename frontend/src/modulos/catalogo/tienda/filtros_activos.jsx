import { X } from "lucide-react";

/** Chips con los filtros elegidos ("Negro ×", "Talle M ×") y "Limpiar filtros". */
export default function FiltrosActivos({ activos, onQuitar, onLimpiar }) {
  if (activos.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Filtros aplicados" role="group">
      {activos.map((f) => (
        <button
          key={`${f.clave}-${f.id}`}
          type="button"
          onClick={() => onQuitar(f.clave, f.id)}
          aria-label={`Quitar filtro ${f.nombre}`}
          className="flex items-center gap-1.5 rounded-full border border-borde bg-superficie px-3 py-1 text-sm hover:border-primario"
        >
          {f.hex && <span className="h-3.5 w-3.5 rounded-full border border-borde" style={{ backgroundColor: f.hex }} aria-hidden="true" />}
          {f.nombre}
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ))}
      <button type="button" onClick={onLimpiar} className="text-sm font-semibold text-primario hover:underline">
        Limpiar filtros
      </button>
    </div>
  );
}
