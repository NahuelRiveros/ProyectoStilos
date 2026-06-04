import { useEffect, useState, useCallback } from "react";
import { FileText, Search, X } from "lucide-react";
import { getTodasComprobantes, emitirComprobante } from "../../api/comprobante_api";
import { getTiposComprobante } from "../../api/catalogo_api";
import {
  AdminSpinner, AdminPageHeader, AdminPagination, AdminEmptyState,
} from "../../components/admin";

const fmt = (n) =>
  n != null ? `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}` : "—";

const LETRA_COLOR = {
  A: "bg-blue-100 text-blue-700",
  B: "bg-emerald-100 text-emerald-700",
  C: "bg-amber-100 text-amber-700",
};

function EmitirModal({ tipos, onSave, onClose }) {
  const [ordenId, setOrdenId] = useState("");
  const [tipoId,  setTipoId]  = useState("");
  const [pvId,    setPvId]    = useState("1");
  const [cuit,    setCuit]    = useState("");
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!ordenId || !tipoId) { setErr("Completá todos los campos."); return; }
    setSaving(true);
    try {
      await onSave(Number(ordenId), Number(tipoId), Number(pvId), cuit || undefined);
      onClose();
    } catch {
      setErr("No se pudo emitir el comprobante.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-ink">Emitir comprobante</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label-form">N° de orden</label>
            <input type="number" min="1" value={ordenId}
              onChange={(e) => setOrdenId(e.target.value)} className="input-form" required />
          </div>
          <div>
            <label className="label-form">Tipo de comprobante</label>
            <select value={tipoId} onChange={(e) => setTipoId(e.target.value)} className="input-form" required>
              <option value="">Seleccionar…</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre} ({t.letra})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-form">Punto de venta</label>
            <input type="number" min="1" value={pvId}
              onChange={(e) => setPvId(e.target.value)} className="input-form" />
          </div>
          <div>
            <label className="label-form">CUIT receptor (opcional)</label>
            <input value={cuit} onChange={(e) => setCuit(e.target.value)}
              className="input-form" placeholder="20-12345678-9" />
          </div>
          {err && <p className="error-form">{err}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-muted hover:border-navy/30">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-xl bg-navy py-2.5 text-sm font-bold text-white hover:bg-navy/90 disabled:opacity-60">
              {saving ? "Emitiendo…" : "Emitir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminComprobantesPage() {
  const [comprobantes, setComprobantes] = useState([]);
  const [tipos,        setTipos]        = useState([]);
  const [pagina,       setPagina]       = useState(1);
  const [totalPags,    setTotalPags]    = useState(1);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [emitirOpen,   setEmitirOpen]   = useState(false);

  const load = useCallback((page = 1) => {
    setLoading(true);
    getTodasComprobantes(page, 20)
      .then(({ comprobantes, pagination }) => {
        setComprobantes(comprobantes);
        setTotal(pagination.total);
        setTotalPags(pagination.total_paginas);
        setPagina(pagination.pagina);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(1);
    getTiposComprobante().then(setTipos).catch(() => {});
  }, [load]);

  async function handleEmitir(ordenId, tipoId, pvId, cuit) {
    await emitirComprobante({ orden_id: ordenId, tipo_comp_id: tipoId, punto_venta_id: pvId, cuit_receptor: cuit });
    load(pagina);
  }

  return (
    <div className="p-6 lg:p-8">

      <AdminPageHeader
        title="Comprobantes"
        subtitle={`${total} comprobante${total !== 1 ? "s" : ""}`}
        action={
          <button
            onClick={() => setEmitirOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white hover:bg-navy/90"
          >
            <FileText size={16} /> Emitir comprobante
          </button>
        }
      />

      {loading ? (
        <AdminSpinner />
      ) : comprobantes.length === 0 ? (
        <AdminEmptyState icon={Search} title="No hay comprobantes registrados" />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-line bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted">Número</th>
                  <th className="hidden px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted sm:table-cell">Orden</th>
                  <th className="hidden px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted md:table-cell">Receptor</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Total</th>
                  <th className="hidden px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted lg:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {comprobantes.map((c) => (
                  <tr key={c.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={["inline-block rounded px-1.5 py-0.5 text-[10px] font-black",
                          LETRA_COLOR[c.letra] ?? "bg-surface text-muted"].join(" ")}>
                          {c.letra}
                        </span>
                        <span className="font-mono text-sm font-bold text-ink">{c.numero_formateado}</span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted">{c.tipo}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-muted sm:table-cell">#{c.orden_id}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <p className="text-xs text-muted">{c.usuario_email ?? "—"}</p>
                      {c.cuit_receptor && <p className="font-mono text-[10px] text-muted">{c.cuit_receptor}</p>}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-ink">{fmt(c.total)}</td>
                    <td className="hidden px-4 py-3 text-xs text-muted lg:table-cell">
                      {new Date(c.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {emitirOpen && (
        <EmitirModal tipos={tipos} onSave={handleEmitir} onClose={() => setEmitirOpen(false)} />
      )}

    </div>
  );
}
