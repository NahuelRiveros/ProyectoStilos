import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Clock } from "lucide-react";
import { getTodasOrdenes, actualizarEstadoOrden, type Orden } from "../../api/orden_api";
import {
  AdminSpinner, AdminPageHeader, AdminPagination, AdminEmptyState, StatusBadge,
} from "../../components/admin";

const fmt = (n: number) =>
  `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

const ESTADOS = [
  { value: "",               label: "Todos"         },
  { value: "pendiente",      label: "Pendiente"     },
  { value: "pagado",         label: "Pagado"        },
  { value: "en_preparacion", label: "En preparación"},
  { value: "enviado",        label: "Enviado"       },
  { value: "entregado",      label: "Entregado"     },
  { value: "cancelado",      label: "Cancelado"     },
];

const SIGUIENTES: Record<string, string[]> = {
  pendiente:      ["pagado", "cancelado"],
  pagado:         ["en_preparacion", "cancelado"],
  en_preparacion: ["enviado"],
  enviado:        ["entregado"],
  entregado:      [],
  cancelado:      [],
};

export default function AdminOrdersPage() {
  const [ordenes,   setOrdenes]   = useState<Orden[]>([]);
  const [pagina,    setPagina]    = useState(1);
  const [totalPags, setTotalPags] = useState(1);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [filtro,    setFiltro]    = useState("");
  const [updating,  setUpdating]  = useState<number | null>(null);

  const load = useCallback((page = 1, estado = filtro) => {
    setLoading(true);
    getTodasOrdenes(page, 20, estado || undefined)
      .then(({ ordenes, pagination }) => {
        setOrdenes(ordenes);
        setTotal(pagination.total);
        setTotalPags(pagination.total_paginas);
        setPagina(pagination.pagina);
      })
      .finally(() => setLoading(false));
  }, [filtro]);

  useEffect(() => { load(1); }, [load]);

  async function handleEstado(orden: Orden, nuevoEstado: string) {
    setUpdating(orden.id);
    try {
      await actualizarEstadoOrden(orden.id, nuevoEstado);
      load(pagina);
    } catch {
      alert("No se pudo actualizar el estado");
    } finally {
      setUpdating(null);
    }
  }

  const filtrosBotones = (
    <div className="flex flex-wrap gap-1.5">
      {ESTADOS.map((e) => (
        <button
          key={e.value}
          onClick={() => { setFiltro(e.value); load(1, e.value); }}
          className={[
            "rounded-full px-3 py-1.5 text-xs font-bold transition",
            filtro === e.value
              ? "bg-navy text-white"
              : "border border-line bg-card text-muted hover:border-navy/40",
          ].join(" ")}
        >
          {e.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-6 lg:p-8">

      <AdminPageHeader
        title="Órdenes"
        subtitle={`${total} orden${total !== 1 ? "es" : ""}`}
        action={filtrosBotones}
      />

      {loading ? (
        <AdminSpinner />
      ) : ordenes.length === 0 ? (
        <AdminEmptyState
          icon={ShoppingCart}
          title={filtro ? `No hay órdenes con estado "${filtro}"` : "No hay órdenes"}
        />
      ) : (
        <>
          <div className="space-y-3">
            {ordenes.map((orden) => {
              const sigEstados = SIGUIENTES[orden.estado] ?? [];
              return (
                <div key={orden.id} className="rounded-2xl bg-card p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/ordenes/${orden.id}`} className="text-sm font-black text-navy hover:underline">
                          Orden #{orden.id}
                        </Link>
                        <StatusBadge status={orden.estado} label={orden.estado_label ?? orden.estado} />
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                        <Clock size={11} />
                        {new Date(orden.fecha).toLocaleDateString("es-AR", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {orden.items.length} producto{orden.items.length !== 1 ? "s" : ""}
                        {orden.direccion && ` · ${orden.direccion.localidad}, ${orden.direccion.provincia}`}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm font-black text-ink">{fmt(orden.total)}</p>
                      {sigEstados.length > 0 && (
                        <div className="flex gap-1.5">
                          {sigEstados.map((s) => (
                            <button
                              key={s}
                              disabled={updating === orden.id}
                              onClick={() => handleEstado(orden, s)}
                              className="rounded-lg border border-navy/30 px-2.5 py-1 text-[11px] font-bold text-navy hover:bg-navy hover:text-white disabled:opacity-50"
                            >
                              → {ESTADOS.find(e => e.value === s)?.label ?? s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPags > 1 && (
            <AdminPagination
              pagina={pagina}
              totalPags={totalPags}
              onPrev={() => load(pagina - 1)}
              onNext={() => load(pagina + 1)}
            />
          )}
        </>
      )}

    </div>
  );
}
