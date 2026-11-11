import { RotateCw } from "lucide-react";
import AdminSpinner from "../../../core/controls/ui/admin_spinner.jsx";
import AdminEmptyState from "../../../core/controls/ui/admin_empty_state.jsx";
import ErrorBanner from "../../../core/controls/ui/error_banner.jsx";
import { mensajeError } from "../hooks/use_ropa.js";

// Piezas compartidas por las pantallas del panel del rubro.

export function Encabezado({ titulo, descripcion, children }) {
  return (
    <header className="flex flex-col gap-3 rounded-2xl border border-(--kt-turquoise-border) bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">{titulo}</h1>
        {descripcion && <p className="mt-0.5 text-sm text-slate-500">{descripcion}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}

export function Pantalla({ children }) {
  return <div className="min-h-screen bg-slate-50 px-4 py-6 sm:p-8"><div className="mx-auto max-w-5xl space-y-4">{children}</div></div>;
}

/** Cargando, error con reintentar o vacío; si hay datos, muestra `children`. */
export function SegunConsulta({ consulta, vacia, icono, tituloVacio, descripcionVacio, accionVacio, children }) {
  if (consulta.isPending) return <AdminSpinner />;
  if (consulta.isError) {
    return (
      <div className="space-y-3">
        <ErrorBanner message={mensajeError(consulta.error, "No se pudo cargar. Revisá la conexión.")} />
        <button type="button" onClick={() => consulta.refetch()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <RotateCw size={16} aria-hidden="true" /> Reintentar
        </button>
      </div>
    );
  }
  if (vacia) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white">
        <AdminEmptyState icon={icono} title={tituloVacio} description={descripcionVacio} action={accionVacio} />
      </div>
    );
  }
  return children;
}

export const BOTON_PRIMARIO = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-(--kt-teal-700) px-4 text-sm font-bold text-white hover:bg-(--kt-teal-900) disabled:opacity-60";
export const BOTON_SECUNDARIO = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60";
export const BOTON_PELIGRO = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100";
