import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Package, ChevronRight, Clock } from "lucide-react";
import { useAuth } from "../auth/auth_context";
import { getMisOrdenes, type Orden } from "../api/orden_api";

const fmt = (n: number) =>
  `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

const ESTADO_COLORS: Record<string, string> = {
  pendiente:      "bg-amber-100 text-amber-700",
  pagado:         "bg-blue-100 text-blue-700",
  en_preparacion: "bg-indigo-100 text-indigo-700",
  enviado:        "bg-sky-100 text-sky-700",
  entregado:      "bg-emerald-100 text-emerald-700",
  cancelado:      "bg-line text-muted",
};

export default function OrdersPage() {
  const { isAuth } = useAuth();
  const [ordenes, setOrdenes]   = useState<Orden[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  useEffect(() => {
    if (!isAuth) return;
    getMisOrdenes()
      .then(({ ordenes }) => setOrdenes(ordenes))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [isAuth]);

  if (!isAuth) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted">
        No se pudieron cargar tus órdenes.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-black text-ink">Mis órdenes</h1>

      {ordenes.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Package size={48} className="text-muted/30" />
          <p className="text-lg font-bold text-ink">Todavía no hiciste ningún pedido</p>
          <Link to="/catalogo" className="text-sm text-navy underline">Ir al catálogo</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ordenes.map((orden) => (
            <Link
              key={orden.id}
              to={`/mis-ordenes/${orden.id}`}
              className="flex items-center gap-4 rounded-2xl bg-card p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/10">
                <Package size={20} className="text-navy" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-ink">Orden #{orden.id}</p>
                  <span className={[
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    ESTADO_COLORS[orden.estado] ?? "bg-surface text-muted",
                  ].join(" ")}>
                    {orden.estado_label ?? orden.estado}
                  </span>
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <Clock size={11} />
                  {new Date(orden.fecha).toLocaleDateString("es-AR", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {orden.items.length} {orden.items.length === 1 ? "producto" : "productos"}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-ink">{fmt(orden.total)}</p>
                <ChevronRight size={16} className="ml-auto mt-1 text-muted" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
