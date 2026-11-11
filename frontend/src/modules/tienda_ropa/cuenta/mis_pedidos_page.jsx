import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { formatearFechaAR } from "../../../core/utils/formatear_fecha.js";
import { useMisPedidos } from "../hooks/use_ropa.js";
import { formatearPrecio } from "../utils/dinero.js";
import { ErrorReintentar, Vacio } from "../tienda/estados.jsx";
import { EtiquetaEstado, EtiquetaPago } from "./comunes.jsx";

/** Mis pedidos (ROP-52): solo los del cliente, del más nuevo al más viejo. */
export default function MisPedidosPage() {
  const consulta = useMisPedidos();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="kt-display text-4xl font-semibold">Mis pedidos</h1>
      <div className="mt-6">
        {consulta.isPending ? <div role="status" aria-label="Cargando tus pedidos" className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-(--kt-bg-soft)" />)}</div>
          : consulta.isError ? <ErrorReintentar consulta={consulta} mensaje="No pudimos cargar tus pedidos." />
          : consulta.data.length === 0 ? (
            <Vacio titulo="Todavía no hiciste pedidos">
              <Link to="/catalogo" className="font-semibold underline">Ver la colección</Link>
            </Vacio>
          )
          : (
            <ul className="space-y-2">
              {consulta.data.map((p) => (
                <li key={p.id}>
                  <Link to={`/mis-pedidos/${p.id}`} className="flex items-center gap-3 rounded-2xl border border-(--kt-border) bg-white p-4 hover:border-(--kt-petrol)">
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2"><span className="font-mono font-bold">{p.numero}</span><EtiquetaEstado estado={p.estado} /></span>
                      <span className="mt-1 block text-xs text-(--kt-ink-soft)">{formatearFechaAR(p.creado_en)} · <EtiquetaPago estado={p.estado_pago} /></span>
                    </span>
                    <span className="font-bold">{formatearPrecio(p.total)}</span>
                    <ChevronRight size={18} className="text-(--kt-ink-soft)" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
  );
}
