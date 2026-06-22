import { useState, useEffect } from "react";
import { Save, Check, CreditCard, Plus, Trash2, ChevronDown, ChevronUp, Image } from "lucide-react";
import { getMediosPago, saveMediosPago, DEFAULT_MEDIOS_PAGO } from "../../api/medios_pago_api";
import { AdminSpinner } from "../../components/admin";

const TARJETAS_SUGERIDAS = ["Visa", "Mastercard", /* "AE", */ "Naranja X", "Cabal", "Banco Nación", "MODO"];

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-line bg-surface p-4 hover:border-accent/40 transition-colors">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={["relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-emerald-500" : "bg-line"].join(" ")}
      >
        <span className={["absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0.5"].join(" ")} />
      </div>
    </label>
  );
}

function CuotaRow({ cuota, onChange, onRemove, tarjetasConfig = [] }) {
  const [inputTarjeta, setInputTarjeta] = useState("");
  const logoMap = Object.fromEntries(
    tarjetasConfig.map(t => [t.nombre, t.logo]).filter(([, v]) => v)
  );

  function addTarjeta(t) {
    const nombre = t.trim();
    if (!nombre || cuota.tarjetas.includes(nombre)) return;
    onChange({ ...cuota, tarjetas: [...cuota.tarjetas, nombre] });
    setInputTarjeta("");
  }

  function removeTarjeta(t) {
    onChange({ ...cuota, tarjetas: cuota.tarjetas.filter(x => x !== t) });
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-ink whitespace-nowrap">Cuotas:</label>
          <input
            type="number" min={1} max={60}
            value={cuota.cantidad}
            onChange={e => onChange({ ...cuota, cantidad: Number(e.target.value) })}
            className="input-form w-20 text-center text-sm"
          />
        </div>
        <Toggle
          checked={cuota.sinInteres}
          onChange={v => onChange({ ...cuota, sinInteres: v })}
          label="Sin interés"
        />
        <button type="button" onClick={onRemove}
          className="ml-auto p-1.5 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-50 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Tarjetas seleccionadas */}
      <div>
        <p className="text-xs font-semibold text-muted mb-2">Tarjetas con esta promoción:</p>

        {/* Chips seleccionados */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {cuota.tarjetas.map(t => (
            <span key={t}
              className="flex items-center gap-1.5 rounded-full bg-navy/10 pl-1.5 pr-2 py-0.5 text-xs font-semibold text-navy">
              {logoMap[t] ? (
                <img src={logoMap[t]} alt={t} title={t}
                  className="object-contain rounded-sm shrink-0"
                  style={{ height: 16, width: "auto", maxWidth: 32 }}
                  onError={e => { e.target.style.display = "none"; }} />
              ) : (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-navy/20 text-[8px] font-black text-navy">
                  {t.charAt(0)}
                </span>
              )}
              {t}
              <button type="button" onClick={() => removeTarjeta(t)}
                className="ml-0.5 leading-none hover:text-rose-500 transition-colors">×</button>
            </span>
          ))}
          {cuota.tarjetas.length === 0 && (
            <span className="text-xs text-muted italic">Sin tarjetas asignadas (aplica a todas)</span>
          )}
        </div>

        {/* Sugeridas disponibles — chips para agregar con un click */}
        {TARJETAS_SUGERIDAS.filter(t => !cuota.tarjetas.includes(t)).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {TARJETAS_SUGERIDAS.filter(t => !cuota.tarjetas.includes(t)).map(t => (
              <button key={t} type="button" onClick={() => addTarjeta(t)}
                className="flex items-center gap-1.5 rounded-full border border-dashed border-line bg-card pl-1.5 pr-2.5 py-0.5 text-xs text-muted hover:border-navy hover:text-navy transition-colors">
                {logoMap[t] ? (
                  <img src={logoMap[t]} alt={t}
                    className="object-contain rounded-sm shrink-0"
                    style={{ height: 14, width: "auto", maxWidth: 28 }}
                    onError={e => { e.target.style.display = "none"; }} />
                ) : (
                  <Plus size={10} />
                )}
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Input para tarjeta personalizada */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputTarjeta}
            onChange={e => setInputTarjeta(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTarjeta(inputTarjeta))}
            placeholder="Otra tarjeta…"
            className="input-form flex-1 text-sm"
          />
          <button type="button" onClick={() => addTarjeta(inputTarjeta)}
            className="btn btn-outline btn-sm shrink-0">
            <Plus size={13} /> Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

function MetodoCard({ metodo, onChange, tarjetasConfig = [] }) {
  const [open, setOpen] = useState(false);

  function updateCuota(idx, updated) {
    const cuotas = [...metodo.cuotas];
    cuotas[idx] = updated;
    onChange({ ...metodo, cuotas });
  }

  function removeCuota(idx) {
    onChange({ ...metodo, cuotas: metodo.cuotas.filter((_, i) => i !== idx) });
  }

  function addCuota() {
    onChange({ ...metodo, cuotas: [...metodo.cuotas, { cantidad: 3, sinInteres: false, tarjetas: [] }] });
  }

  return (
    <div className="rounded-2xl border border-line bg-card overflow-hidden">
      {/* Header del método */}
      <div className="flex items-center gap-3 p-4">
        <div className={["w-2 h-2 rounded-full shrink-0", metodo.habilitado ? "bg-emerald-400" : "bg-line"].join(" ")} />
        <span className="flex-1 text-sm font-bold text-ink">{metodo.nombre}</span>
        <Toggle
          checked={metodo.habilitado}
          onChange={v => onChange({ ...metodo, habilitado: v })}
          label=""
        />
        {(metodo.cuotas.length > 0 || metodo.id === "tarjeta_credito") && (
          <button type="button" onClick={() => setOpen(v => !v)}
            className="p-1.5 rounded-lg text-muted hover:bg-surface transition-colors">
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        )}
      </div>

      {/* Logo del método */}
      <div className="px-4 pb-2 flex items-center gap-2">
        {metodo.logo ? (
          <div className="h-8 w-16 shrink-0 flex items-center justify-center overflow-hidden rounded border border-line bg-surface">
            <img src={metodo.logo} alt="" className="h-6 w-full object-contain" onError={e => { e.target.style.display = "none"; }} />
          </div>
        ) : (
          <div className="h-8 w-16 shrink-0 flex items-center justify-center rounded border border-dashed border-line bg-surface">
            <Image size={12} className="text-muted/40" />
          </div>
        )}
        <input
          type="url"
          value={metodo.logo ?? ""}
          onChange={e => onChange({ ...metodo, logo: e.target.value })}
          placeholder="URL del logo del método (imagen)…"
          className="input-form text-sm flex-1"
        />
      </div>

      {/* Descripción */}
      <div className="px-4 pb-3">
        <input
          type="text"
          value={metodo.descripcion}
          onChange={e => onChange({ ...metodo, descripcion: e.target.value })}
          placeholder="Descripción breve (opcional)…"
          className="input-form text-sm"
        />
      </div>

      {/* Cuotas expandible */}
      {open && (
        <div className="border-t border-line bg-surface/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted">
              Promociones de cuotas
            </p>
            <button type="button" onClick={addCuota}
              className="flex items-center gap-1.5 text-xs font-semibold text-navy hover:underline">
              <Plus size={12} /> Agregar cuota
            </button>
          </div>
          {metodo.cuotas.map((c, i) => (
            <CuotaRow
              key={i}
              cuota={c}
              onChange={updated => updateCuota(i, updated)}
              onRemove={() => removeCuota(i)}
              tarjetasConfig={tarjetasConfig}
            />
          ))}
          {metodo.cuotas.length === 0 && (
            <p className="text-xs text-muted italic">Sin promociones de cuotas configuradas.</p>
          )}
        </div>
      )}
    </div>
  );
}

function TarjetasConfigSection({ tarjetasConfig = [], onChange }) {
  function update(idx, field, value) {
    const arr = [...tarjetasConfig];
    arr[idx] = { ...arr[idx], [field]: value };
    onChange(arr);
  }

  function add() {
    onChange([...tarjetasConfig, { nombre: "", logo: "" }]);
  }

  function remove(idx) {
    onChange(tarjetasConfig.filter((_, i) => i !== idx));
  }

  return (
    <div className="rounded-2xl border border-line bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div className="flex items-center gap-2">
          <CreditCard size={13} className="text-muted" />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-muted">Logos de tarjetas bancarias</h3>
        </div>
        <button type="button" onClick={add}
          className="flex items-center gap-1.5 text-xs font-semibold text-navy hover:underline">
          <Plus size={12} /> Agregar tarjeta
        </button>
      </div>

      <p className="px-4 pt-3 pb-1 text-[11px] text-muted">
        Estos logos se muestran en los chips de cuotas de cada método de pago.
      </p>

      <div className="divide-y divide-line">
        {tarjetasConfig.map((t, i) => (
          <div key={i} className="flex items-center gap-2.5 px-4 py-2.5">
            {/* Preview logo */}
            <div className="h-8 w-14 shrink-0 flex items-center justify-center rounded border border-line bg-surface overflow-hidden">
              {t.logo ? (
                <img
                  src={t.logo}
                  alt=""
                  className="h-6 w-full object-contain"
                  onError={e => { e.target.style.display = "none"; }}
                />
              ) : (
                <Image size={12} className="text-muted/40" />
              )}
            </div>
            {/* Nombre */}
            <input
              type="text"
              value={t.nombre}
              onChange={e => update(i, "nombre", e.target.value)}
              placeholder="Nombre (ej: Visa)"
              className="input-form text-sm"
              style={{ width: "8rem", minWidth: "8rem" }}
            />
            {/* URL logo */}
            <input
              type="url"
              value={t.logo}
              onChange={e => update(i, "logo", e.target.value)}
              placeholder="URL del logo…"
              className="input-form text-sm flex-1"
            />
            {/* Eliminar */}
            <button type="button" onClick={() => remove(i)}
              className="p-1.5 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {tarjetasConfig.length === 0 && (
          <p className="px-4 py-3 text-xs text-muted italic">Sin tarjetas configuradas.</p>
        )}
      </div>
    </div>
  );
}

export default function AdminMediosPagoPage() {
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

  function updateTarjetasConfig(arr) {
    setConfig(c => ({ ...c, tarjetasConfig: arr }));
  }

  async function handleSave() {
    setSaving(true); setSaved(false); setError("");
    try {
      await saveMediosPago(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("No se pudo guardar. Verificá tu conexión.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminSpinner fullPage />;

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-8 w-1 shrink-0 rounded-full" style={{ background: "var(--color-accent)" }} />
          <div>
            <h1 className="font-display text-xl font-black text-ink">Medios de pago</h1>
            <p className="text-sm text-muted">
              Configurá qué métodos aceptan y las promociones de cuotas disponibles.
            </p>
          </div>
        </div>
        <button
          type="button" onClick={handleSave} disabled={saving}
          className={["flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black uppercase tracking-widest shadow transition-all active:scale-[0.98] disabled:opacity-60",
            saved
              ? "bg-emerald-500 text-white"
              : "bg-navy text-white hover:bg-navy/90 hover:shadow-md",
          ].join(" ")}>
          {saved ? <Check size={15} /> : <Save size={15} />}
          {saving ? "Guardando…" : saved ? "Guardado" : "Guardar"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* ── Métodos ──────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={14} className="text-muted" />
            <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">Métodos disponibles</h2>
          </div>

          {config.metodos?.map((m, i) => (
            <MetodoCard
              key={m.id}
              metodo={m}
              onChange={updated => updateMetodo(i, updated)}
              tarjetasConfig={config.tarjetasConfig ?? []}
            />
          ))}

          {/* Logos de tarjetas */}
          <TarjetasConfigSection
            tarjetasConfig={config.tarjetasConfig ?? []}
            onChange={updateTarjetasConfig}
          />

          {/* Nota general */}
          <div className="rounded-2xl border border-line bg-card p-5">
            <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-muted">
              Nota general (opcional)
            </label>
            <input
              type="text"
              value={config.nota ?? ""}
              onChange={e => setConfig(c => ({ ...c, nota: e.target.value }))}
              placeholder="Ej: Consultar vigencia de promociones en tienda"
              className="input-form text-sm"
            />
            <p className="mt-1.5 text-[11px] text-muted">
              Se muestra al pie del bloque de medios de pago en la tienda.
            </p>
          </div>
        </div>

        {/* ── Preview ──────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">Vista previa</h2>
          <div className="rounded-2xl border border-line bg-card p-5 space-y-3">
            {config.metodos?.filter(m => m.habilitado).map(m => (
              <div key={m.id} className="flex gap-3 pb-3 border-b border-line last:border-0 last:pb-0">
                {/* Logo o placeholder */}
                <div className="h-8 w-12 shrink-0 flex items-center justify-center rounded border border-line bg-surface overflow-hidden">
                  {m.logo
                    ? <img src={m.logo} alt="" className="h-5 w-full object-contain" onError={e => { e.target.style.display = "none"; }} />
                    : <CreditCard size={13} className="text-muted/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink mb-0.5">{m.nombre}</p>
                  {m.descripcion && <p className="text-xs text-muted">{m.descripcion}</p>}
                  {m.cuotas?.filter(c => c.sinInteres).map((c, i) => (
                    <div key={i} className="mt-1 flex flex-wrap gap-1">
                      <span className="text-xs font-semibold text-emerald-600">✓ {c.cantidad}x sin interés</span>
                      {c.tarjetas.map(nombre => {
                        const tc = config.tarjetasConfig?.find(t => t.nombre === nombre);
                        return tc?.logo
                          ? <img key={nombre} src={tc.logo} alt={nombre} title={nombre} className="h-4 w-auto object-contain" onError={e => { e.target.style.display = "none"; }} />
                          : <span key={nombre} className="text-[10px] text-muted border border-line px-1 py-px">{nombre}</span>;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {config.nota && (
              <p className="text-[11px] text-muted border-t border-line pt-3">{config.nota}</p>
            )}
          </div>
          <p className="text-[11px] text-muted">
            Así verán los clientes los métodos en la ficha de cada producto.
          </p>
        </div>

      </div>
    </div>
  );
}
