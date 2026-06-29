import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Save, Check, CreditCard, Plus, X, CheckCircle2, Landmark, Smartphone, BadgePercent } from "lucide-react";
import { getMediosPago, saveMediosPago, DEFAULT_MEDIOS_PAGO } from "../../api/medios_pago_api";
import { AdminSpinner } from "../../components/admin";

const CUOTAS_PRESET = [1, 3, 6, 12, 24];
const SIN_CUOTAS    = ["transferencia", "efectivo", "tarjeta_debito"];

// ── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={["cursor-pointer relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-emerald-500" : "bg-line"].join(" ")}
    >
      <span className={["absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
        checked ? "translate-x-4" : "translate-x-0.5"].join(" ")} />
    </div>
  );
} 

// ── Cuotas — botones preset ──────────────────────────────────────────────────

function CuotaGrid({ cuotas, onChange }) {
  const activeMap = Object.fromEntries((cuotas ?? []).map(c => [c.cantidad, c]));

  function toggle(n) {
    if (activeMap[n]) {
      onChange((cuotas ?? []).filter(c => c.cantidad !== n));
    } else {
      onChange([...(cuotas ?? []), { cantidad: n, sinInteres: false }]
        .sort((a, b) => a.cantidad - b.cantidad));
    }
  }

  function toggleSinInteres(n) {
    onChange((cuotas ?? []).map(c =>
      c.cantidad === n ? { ...c, sinInteres: !c.sinInteres } : c
    ));
  }

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">Cuotas</p>
      <div className="flex flex-wrap gap-2">
        {CUOTAS_PRESET.map(n => {
          const on = !!activeMap[n];
          const si = activeMap[n]?.sinInteres;
          return (
            <div key={n} className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => toggle(n)}
                style={{
                  width: "3rem", height: "3rem",
                  borderRadius: 0,
                  background: on ? "var(--color-navy)" : "transparent",
                  color:      on ? "var(--color-surface)" : "var(--color-muted)",
                  border:     on ? "1.5px solid var(--color-navy)" : "1px solid var(--color-line)",
                  fontSize: "13px", fontWeight: 900, letterSpacing: "0.04em",
                  transition: "all 0.15s ease",
                }}
              >
                {n}x
              </button>

              {on && (
                <button
                  type="button"
                  onClick={() => toggleSinInteres(n)}
                  className="text-[9px] font-black uppercase tracking-wider px-1.5 py-px border transition-colors whitespace-nowrap"
                  style={si
                    ? { background: "#ecfdf5", color: "#065f46", borderColor: "#6ee7b7" }
                    : { background: "transparent", color: "var(--color-muted)", borderColor: "var(--color-line)" }
                  }
                >
                  {si ? "✓ sin interés" : "en cuotas"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Grupo de tarjetas (para tarjeta_credito) ─────────────────────────────────

function GrupoTarjeta({ grupo, tarjetasConfig, onChange, onRemove, showRemove }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 space-y-4">
      {/* Selector de tarjetas + botón eliminar */}
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">Tarjetas</p>
          <div className="flex flex-wrap gap-2">
            {(tarjetasConfig ?? []).map(t => {
              const activa = (grupo.tarjetas ?? []).includes(t.nombre);
              return (
                <button
                  key={t.nombre}
                  type="button"
                  onClick={() => onChange({
                    ...grupo,
                    tarjetas: activa
                      ? grupo.tarjetas.filter(n => n !== t.nombre)
                      : [...(grupo.tarjetas ?? []), t.nombre],
                  })}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold transition-all border"
                  style={{
                    borderRadius: 0,
                    background:   activa ? "var(--color-navy)" : "transparent",
                    color:        activa ? "var(--color-surface)" : "var(--color-muted)",
                    borderColor:  activa ? "var(--color-navy)" : "var(--color-line)",
                  }}
                >
                  {t.logo && (
                    <img src={t.logo} alt="" style={{ height: 14, width: "auto", objectFit: "contain" }}
                      onError={e => { e.target.style.display = "none"; }} />
                  )}
                  {t.nombre}
                </button>
              );
            })}
          </div>
        </div>

        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="mt-6 flex h-7 w-7 shrink-0 items-center justify-center border border-line text-muted transition-colors hover:border-rose-300 hover:text-rose-500"
            style={{ borderRadius: 0 }}
            title="Eliminar grupo"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Descripción del grupo */}
      <input
        type="text"
        value={grupo.descripcion ?? ""}
        onChange={e => onChange({ ...grupo, descripcion: e.target.value })}
        placeholder="Descripción del grupo (opcional, ej: Banco Nación — plan cuotas 2025)…"
        className="input-form text-xs"
      />

      {/* Cuotas del grupo */}
      <CuotaGrid
        cuotas={grupo.cuotas}
        onChange={cuotas => onChange({ ...grupo, cuotas })}
      />
    </div>
  );
}

// ── Vista previa de un grupo ─────────────────────────────────────────────────

function listarCuotas(cuotas) {
  const ns = cuotas.map(c => c.cantidad);
  if (ns.length === 1) return `${ns[0]}`;
  return `${ns.slice(0, -1).join(", ")} y ${ns[ns.length - 1]}`;
}

// ── Tarjeta de método ────────────────────────────────────────────────────────

function MetodoCard({ metodo, tarjetasConfig, onChange }) {
  const esTarjetaCredito = metodo.id === "tarjeta_credito";

  function addGrupo() {
    onChange({
      ...metodo,
      grupos: [...(metodo.grupos ?? []), { tarjetas: [], descripcion: "", cuotas: [] }],
    });
  }

  function removeGrupo(idx) {
    onChange({
      ...metodo,
      grupos: (metodo.grupos ?? []).filter((_, i) => i !== idx),
    });
  }

  function updateGrupo(idx, nuevoGrupo) {
    onChange({
      ...metodo,
      grupos: (metodo.grupos ?? []).map((g, i) => i === idx ? nuevoGrupo : g),
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className={["w-2 h-2 rounded-full shrink-0",
          metodo.habilitado ? "bg-emerald-400" : "bg-line"].join(" ")} />

        {metodo.logo && (
          <div className="h-6 w-12 shrink-0 flex items-center justify-center overflow-hidden">
            <img src={metodo.logo} alt="" className="h-5 w-full object-contain"
              onError={e => { e.target.style.display = "none"; }} />
          </div>
        )}

        <span className="flex-1 text-sm font-bold text-ink">{metodo.nombre}</span>
        <Toggle checked={metodo.habilitado} onChange={v => onChange({ ...metodo, habilitado: v })} />
      </div>

      {/* Cuerpo */}
      {metodo.habilitado && (
        <div className="px-5 pb-5 space-y-4 border-t border-line pt-4">
          <input
            type="text"
            value={metodo.descripcion ?? ""}
            onChange={e => onChange({ ...metodo, descripcion: e.target.value })}
            placeholder="Descripción breve (opcional)…"
            className="input-form text-sm"
          />

          {/* ── Tarjeta de crédito: grupos por marca ── */}
          {esTarjetaCredito && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                  Grupos por tarjeta
                </p>
                <button
                  type="button"
                  onClick={addGrupo}
                  className="flex items-center gap-1.5 border border-line px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted transition-colors hover:border-navy/40 hover:text-navy"
                  style={{ borderRadius: 0 }}
                >
                  <Plus size={10} /> Agregar grupo
                </button>
              </div>

              {(metodo.grupos ?? []).map((g, i) => (
                <GrupoTarjeta
                  key={i}
                  grupo={g}
                  tarjetasConfig={tarjetasConfig}
                  onChange={ng => updateGrupo(i, ng)}
                  onRemove={() => removeGrupo(i)}
                  showRemove={(metodo.grupos ?? []).length > 1}
                />
              ))}
            </div>
          )}

          {/* ── Otros métodos con cuotas ── */}
          {!esTarjetaCredito && !SIN_CUOTAS.includes(metodo.id) && (
            <CuotaGrid
              cuotas={metodo.cuotas}
              onChange={cuotas => onChange({ ...metodo, cuotas })}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Preview fiel al widget del producto ─────────────────────────────────────

const ICONOS_METODO = {
  mercadopago:   Smartphone,
  go_cuotas:     BadgePercent,
  transferencia: Landmark,
  efectivo:      Landmark,
};

function PreviewWidget({ config, logoMap, activos }) {
  const metodoTarjeta = activos.find(m => m.id === "tarjeta_credito");
  const gruposActivos = (metodoTarjeta?.grupos ?? []).filter(
    g => g.tarjetas?.length > 0 && g.cuotas?.length > 0
  );
  const gruposSI  = gruposActivos.filter(g => g.cuotas.some(c => c.sinInteres));
  const todasSI   = [...new Map(
    gruposActivos.flatMap(g => g.cuotas.filter(c => c.sinInteres)).map(c => [c.cantidad, c])
  ).values()].sort((a, b) => a.cantidad - b.cantidad);
  const otrosActivos = activos.filter(m => m.id !== "tarjeta_credito");

  return (
    <div className="overflow-hidden border border-line max-w-sm">
      {/* Encabezado */}
      <div className="px-4 py-2.5 border-b border-line bg-surface">
        <span className="text-[8.5px] font-black uppercase tracking-[0.25em] text-muted">
          Medios de pago
        </span>
      </div>

      {/* Callout sin interés */}
      {todasSI.length > 0 && (
        <div className="px-4 py-3.5 border-b border-line"
          style={{ borderLeft: "3px solid #059669", background: "color-mix(in srgb, #ecfdf5 55%, var(--color-card))" }}>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={14} className="shrink-0 mt-px" style={{ color: "#059669" }} />
            <div className="space-y-2 min-w-0">
              <p className="text-[11px] font-black leading-tight" style={{ color: "#065f46" }}>
                {listarCuotas(todasSI)} cuotas sin interés
              </p>
              <div className="space-y-1.5">
                {gruposSI.map((g, i) => {
                  const si = g.cuotas.filter(c => c.sinInteres).sort((a, b) => a.cantidad - b.cantidad);
                  return (
                    <div key={i} className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {g.tarjetas.map((nombre, j) =>
                          logoMap[nombre] ? (
                            <img key={j} src={logoMap[nombre]} alt={nombre}
                              className="object-contain shrink-0"
                              style={{ height: 20, width: "auto", maxWidth: 42 }}
                              onError={e => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <span key={j} className="text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 border"
                              style={{ borderColor: "#6ee7b7", color: "#065f46" }}>{nombre}</span>
                          )
                        )}
                      </div>
                      {gruposSI.length > 1 && (
                        <span className="text-[9px] font-semibold" style={{ color: "#059669" }}>
                          {listarCuotas(si)}x
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sin grupos sin interés pero hay tarjeta habilitada */}
      {todasSI.length === 0 && metodoTarjeta && gruposActivos.length > 0 && (
        <div className="px-4 py-3 border-b border-line bg-card">
          <div className="flex items-center gap-3">
            {gruposActivos.flatMap(g => g.tarjetas).slice(0, 4).map((nombre, j) =>
              logoMap[nombre] ? (
                <img key={j} src={logoMap[nombre]} alt={nombre}
                  className="object-contain shrink-0"
                  style={{ height: 20, width: "auto", maxWidth: 42 }}
                  onError={e => { e.target.style.display = "none"; }}
                />
              ) : null
            )}
            <span className="text-[10px] font-semibold text-muted">pago en cuotas</span>
          </div>
        </div>
      )}

      {/* Otros métodos */}
      {otrosActivos.length > 0 && (
        <div className="px-4 py-3 flex flex-wrap gap-x-4 gap-y-2 bg-surface">
          {otrosActivos.map(m => {
            const Icono = ICONOS_METODO[m.id] ?? CreditCard;
            return (
              <div key={m.id} className="flex items-center gap-1.5">
                {m.logo
                  ? <img src={m.logo} alt="" style={{ height: 13, width: "auto", objectFit: "contain" }}
                      onError={e => { e.target.style.display = "none"; }} />
                  : <Icono size={13} className="text-navy shrink-0" />
                }
                <span className="text-[10px] font-semibold" style={{ color: "var(--color-ink)", opacity: 0.75 }}>
                  {m.nombre}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {config.nota && (
        <div className="px-4 py-2 border-t border-line bg-surface">
          <p className="text-[9px] text-muted">{config.nota}</p>
        </div>
      )}
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function AdminMediosPagoPage() {
  const queryClient = useQueryClient();
  const [config,  setConfig]  = useState(DEFAULT_MEDIOS_PAGO);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    getMediosPago()
      .then(setConfig)
      .catch(() => setConfig(DEFAULT_MEDIOS_PAGO))
      .finally(() => setLoading(false));
  }, []);

  function updateMetodo(idx, updated) {
    setConfig(c => {
      const metodos = [...c.metodos];
      metodos[idx] = updated;
      return { ...c, metodos };
    });
  }

  async function handleSave() {
    setSaving(true); setSaved(false); setError("");
    try {
      await saveMediosPago(config);
      // Invalida el cache para que product_detail y cualquier consumer vea datos frescos
      queryClient.invalidateQueries({ queryKey: ["medios-pago"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("No se pudo guardar. Verificá tu conexión.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminSpinner fullPage />;

  const activos   = config.metodos?.filter(m => m.habilitado) ?? [];
  const logoMap   = Object.fromEntries(
    (config.tarjetasConfig ?? []).map(t => [t.nombre, t.logo]).filter(([, v]) => v)
  );

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-8 w-1 shrink-0 rounded-full" style={{ background: "var(--color-accent)" }} />
          <div>
            <h1 className="font-display text-xl font-black text-ink">Medios de pago</h1>
            <p className="text-sm text-muted">Habilitá métodos y configurá las cuotas por tarjeta.</p>
          </div>
        </div>
        <button
          type="button" onClick={handleSave} disabled={saving}
          className={["flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black uppercase tracking-widest shadow transition-all active:scale-[0.98] disabled:opacity-60",
            saved ? "bg-emerald-500 text-white" : "bg-navy text-white hover:bg-navy/90",
          ].join(" ")}>
          {saved ? <Check size={15} /> : <Save size={15} />}
          {saving ? "Guardando…" : saved ? "Guardado" : "Guardar"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      )}

      {/* Métodos */}
      <div className="space-y-3 mb-6">
        {config.metodos?.map((m, i) => (
          <MetodoCard
            key={m.id}
            metodo={m}
            tarjetasConfig={config.tarjetasConfig}
            onChange={updated => updateMetodo(i, updated)}
          />
        ))}
      </div>

      {/* Nota general */}
      <div className="rounded-2xl border border-line bg-card p-5 mb-6">
        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted">
          Nota al pie (opcional)
        </label>
        <input
          type="text"
          value={config.nota ?? ""}
          onChange={e => setConfig(c => ({ ...c, nota: e.target.value }))}
          placeholder="Ej: Consultar vigencia de promociones en tienda"
          className="input-form text-sm"
        />
      </div>

      {/* Vista previa — idéntica al widget del producto */}
      {activos.length > 0 && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-4">
            Vista previa (tal como ve el cliente en el producto)
          </p>
          <PreviewWidget config={config} logoMap={logoMap} activos={activos} />
        </div>
      )}
    </div>
  );
}
