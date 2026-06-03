import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  ShieldCheck, AlertTriangle, XCircle, CreditCard,
  CalendarDays, Clock, Zap, CheckCircle2, AlertCircle,
} from "lucide-react";
import { getSuscripcion, activarSuscripcion, updateGracia } from "../../api/admin_api";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function Alert({ ok, msg }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
      {ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
      {msg}
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20";

// ── Estado badge ─────────────────────────────────────────────────────────────

const ESTADO_CFG = {
  ACTIVO:          { icon: ShieldCheck,   bg: "bg-emerald-50",  ring: "ring-emerald-200", text: "text-emerald-700",  label: "Activa",                dot: "bg-emerald-500" },
  GRACIA:          { icon: AlertTriangle, bg: "bg-amber-50",    ring: "ring-amber-200",   text: "text-amber-700",    label: "Período de gracia",      dot: "bg-amber-400"   },
  VENCIDO:         { icon: XCircle,       bg: "bg-rose-50",     ring: "ring-rose-200",    text: "text-rose-700",     label: "Vencida",                dot: "bg-rose-500"    },
  SIN_SUSCRIPCION: { icon: CreditCard,    bg: "bg-slate-100",   ring: "ring-slate-200",   text: "text-slate-600",    label: "Sin suscripción",        dot: "bg-slate-400"   },
};

// ── Página ───────────────────────────────────────────────────────────────────

export default function AdminSuscripcionPage() {
  const qc = useQueryClient();

  const { data: sus, isLoading } = useQuery({
    queryKey: ["admin-suscripcion"],
    queryFn: async () => {
      const r = await getSuscripcion();
      return r.data?.data ?? null;
    },
  });

  // Formulario: renovar suscripción
  const {
    register: regRenovar,
    handleSubmit: hsRenovar,
    reset: resetRenovar,
    formState: { errors: errRenovar, isSubmitting: submittingRenovar },
  } = useForm({ defaultValues: { dias: 30, notas: "" } });

  const [alertRenovar, setAlertRenovar] = useState(null);

  async function onRenovar(data) {
    setAlertRenovar(null);
    try {
      const r = await activarSuscripcion({ dias: Number(data.dias), notas: data.notas || undefined });
      if (r.data?.ok) {
        setAlertRenovar({ ok: true, msg: r.data.mensaje });
        qc.invalidateQueries({ queryKey: ["admin-suscripcion"] });
        resetRenovar();
      } else {
        setAlertRenovar({ ok: false, msg: r.data?.mensaje ?? "Error al renovar" });
      }
    } catch (e) {
      setAlertRenovar({ ok: false, msg: e?.response?.data?.mensaje ?? "Error al renovar" });
    }
  }

  // Formulario: período de gracia
  const {
    register: regGracia,
    handleSubmit: hsGracia,
    formState: { errors: errGracia, isSubmitting: submittingGracia },
  } = useForm({ defaultValues: { dias_gracia: sus?.dias_gracia ?? 10 } });

  const [alertGracia, setAlertGracia] = useState(null);

  async function onGracia(data) {
    setAlertGracia(null);
    try {
      const r = await updateGracia({ dias_gracia: Number(data.dias_gracia) });
      if (r.data?.ok) {
        setAlertGracia({ ok: true, msg: r.data.mensaje });
        qc.invalidateQueries({ queryKey: ["admin-suscripcion"] });
      } else {
        setAlertGracia({ ok: false, msg: r.data?.mensaje ?? "Error" });
      }
    } catch (e) {
      setAlertGracia({ ok: false, msg: e?.response?.data?.mensaje ?? "Error al actualizar" });
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  const estado  = sus?.estado ?? "SIN_SUSCRIPCION";
  const cfg     = ESTADO_CFG[estado] ?? ESTADO_CFG.SIN_SUSCRIPCION;
  const Icon    = cfg.icon;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">

      <div className="mb-6">
        <h1 className="text-lg font-black text-slate-900">Suscripción del sistema</h1>
        <p className="text-xs text-slate-500">Estado actual y herramientas de renovación.</p>
      </div>

      {/* Status card */}
      <div className={`mb-6 rounded-2xl border p-5 ${cfg.bg} ring-1 ${cfg.ring}`}>
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${cfg.bg} ring-1 ${cfg.ring}`}>
            <Icon size={22} className={cfg.text} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
              <p className={`text-base font-black ${cfg.text}`}>{cfg.label}</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { icon: CalendarDays, label: "Inicio",     value: fmt(sus?.fecha_inicio) },
                { icon: CalendarDays, label: "Vencimiento",value: fmt(sus?.fecha_fin) },
                { icon: Clock,        label: "Días rest.", value: sus?.dias_restantes != null ? `${sus.dias_restantes} días` : "—" },
                { icon: Clock,        label: "Gracia",     value: sus?.dias_gracia != null ? `${sus.dias_gracia} días` : "—" },
              ].map(({ icon: I, label, value }) => (
                <div key={label} className="rounded-xl bg-white/60 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                  <p className={`mt-0.5 text-sm font-bold ${cfg.text}`}>{value}</p>
                </div>
              ))}
            </div>

            {sus?.notas && (
              <p className="mt-3 rounded-xl bg-white/60 px-3 py-2 text-xs text-slate-500">
                📋 {sus.notas}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Renovar */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
          <Zap size={15} className="text-amber-500" />
          Renovar suscripción
        </h2>
        <form onSubmit={hsRenovar(onRenovar)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Días a agregar *</label>
              <input
                type="number"
                min={1}
                max={3650}
                className={inputClass}
                {...regRenovar("dias", { required: "Obligatorio", min: { value: 1, message: "Mín. 1" } })}
              />
              {errRenovar.dias && <p className="mt-0.5 text-xs text-rose-500">{errRenovar.dias.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Notas (opcional)</label>
              <input
                className={inputClass}
                placeholder="Ej: Renovación mensual…"
                {...regRenovar("notas")}
              />
            </div>
          </div>
          <Alert msg={alertRenovar?.msg} ok={alertRenovar?.ok} />
          <button
            type="submit"
            disabled={submittingRenovar}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 active:scale-95 disabled:opacity-60"
          >
            <Zap size={14} />
            {submittingRenovar ? "Renovando…" : "Renovar suscripción"}
          </button>
        </form>
      </div>

      {/* Días de gracia */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
          <Clock size={15} className="text-slate-500" />
          Período de gracia
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          Días extras después del vencimiento en los que el sistema sigue aceptando operaciones de escritura.
        </p>
        <form onSubmit={hsGracia(onGracia)} className="space-y-3">
          <div className="max-w-xs">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Días de gracia</label>
            <input
              type="number"
              min={0}
              max={365}
              className={inputClass}
              {...regGracia("dias_gracia", { required: "Obligatorio", min: { value: 0, message: "Mín. 0" } })}
            />
            {errGracia.dias_gracia && <p className="mt-0.5 text-xs text-rose-500">{errGracia.dias_gracia.message}</p>}
          </div>
          <Alert msg={alertGracia?.msg} ok={alertGracia?.ok} />
          <button
            type="submit"
            disabled={submittingGracia}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 active:scale-95 disabled:opacity-60"
          >
            {submittingGracia ? "Guardando…" : "Actualizar días de gracia"}
          </button>
        </form>
      </div>
    </div>
  );
}
