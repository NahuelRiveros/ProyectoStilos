import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Save, Check, MessageCircle, Phone, AlignLeft } from "lucide-react";
import {
  getWhatsappConfig,
  saveWhatsappConfig,
  DEFAULT_WHATSAPP_CONFIG,
} from "../../api/whatsapp_config_api";
import { buildWhatsAppMessage } from "../../config/whatsapp_config";
import { AdminSpinner } from "../../components/admin";

const PREVIEW_ITEMS = [
  { nombre: "Remera Básica", talle: "M",  precio: 8500,  cantidad: 1 },
  { nombre: "Pantalón Cargo", talle: "40", precio: 24000, cantidad: 2 },
];

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-line bg-surface p-4 hover:border-accent/40 transition-colors">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={[
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-emerald-500" : "bg-line",
        ].join(" ")}
      >
        <span className={[
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0.5",
        ].join(" ")} />
      </div>
    </label>
  );
}

export default function AdminWhatsappConfigPage() {
  const queryClient = useQueryClient();
  const [config,  setConfig]  = useState(DEFAULT_WHATSAPP_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    getWhatsappConfig()
      .then(setConfig)
      .catch(() => setConfig(DEFAULT_WHATSAPP_CONFIG))
      .finally(() => setLoading(false));
  }, []);

  function set(key, value) {
    setConfig(c => ({ ...c, [key]: value }));
  }

  async function handleSave() {
    setSaving(true); setSaved(false); setError("");
    try {
      await saveWhatsappConfig(config);
      queryClient.invalidateQueries({ queryKey: ["whatsapp-config"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("No se pudo guardar. Verificá tu conexión.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminSpinner fullPage />;

  const previewMessage = buildWhatsAppMessage(PREVIEW_ITEMS, config);

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-8 w-1 shrink-0 rounded-full bg-emerald-400" />
          <div>
            <h1 className="font-display text-xl font-black text-ink">Configuración de WhatsApp</h1>
            <p className="text-sm text-muted">Número de contacto y texto del mensaje que reciben tus clientes.</p>
          </div>
        </div>
        <button
          type="button" onClick={handleSave} disabled={saving}
          className={[
            "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black uppercase tracking-widest shadow transition-all active:scale-[0.98] disabled:opacity-60",
            saved
              ? "bg-emerald-500 text-white shadow-emerald-200 ring-2 ring-emerald-300/40"
              : "bg-navy text-white hover:bg-navy/90 hover:shadow-md",
          ].join(" ")}>
          {saved ? <Check size={15} /> : <Save size={15} />}
          {saving ? "Guardando…" : saved ? "Guardado" : "Guardar"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Formulario ─────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Número */}
          <div className="rounded-2xl border border-line bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-emerald-500" />
              <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">Número de WhatsApp</h2>
            </div>
            <div>
              <input
                type="text"
                value={config.phone ?? ""}
                onChange={e => set("phone", e.target.value)}
                placeholder="5493704784641"
                className="input-field w-full font-mono text-sm"
              />
              <p className="mt-1.5 text-[11px] text-muted">
                Sin "+" y con código de país. Argentina: 54 + 9 + código de área sin 0 + número sin 15.
                Ej: +54 9 370 478-4641 → <span className="font-mono">5493704784641</span>
              </p>
            </div>
          </div>

          {/* Textos del mensaje */}
          <div className="rounded-2xl border border-line bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <AlignLeft size={14} className="text-emerald-500" />
              <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">Texto del mensaje</h2>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">Saludo inicial</label>
              <textarea
                rows={2}
                value={config.greeting ?? ""}
                onChange={e => set("greeting", e.target.value)}
                className="input-field w-full resize-none text-sm"
              />
              <p className="mt-1 text-[11px] text-muted">Aparece al comienzo del mensaje, antes de la lista de productos.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">Cierre</label>
              <textarea
                rows={2}
                value={config.closing ?? ""}
                onChange={e => set("closing", e.target.value)}
                className="input-field w-full resize-none text-sm"
              />
              <p className="mt-1 text-[11px] text-muted">Aparece al final del mensaje, después de la lista y el total.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">Nota de entrega</label>
              <textarea
                rows={2}
                value={config.deliveryNote ?? ""}
                onChange={e => set("deliveryNote", e.target.value)}
                placeholder="Los pedidos se coordinan por WhatsApp · Envío o retiro en tienda"
                className="input-field w-full resize-none text-sm"
              />
              <p className="mt-1 text-[11px] text-muted">
                Texto pequeño debajo del botón de WhatsApp en la ficha de cada producto. Dejar vacío para ocultarlo.
              </p>
            </div>
          </div>

          {/* Toggles */}
          <div className="rounded-2xl border border-line bg-card p-5 space-y-3">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">Contenido del mensaje</h2>
            <Toggle
              checked={config.includePrice ?? true}
              onChange={v => set("includePrice", v)}
              label="Incluir precio por producto"
              description="Agrega el precio de cada item junto a su nombre."
            />
            <Toggle
              checked={config.includeTotal ?? true}
              onChange={v => set("includeTotal", v)}
              label="Incluir total estimado"
              description="Suma todos los productos y lo muestra al final del mensaje."
            />
          </div>

        </div>

        {/* ── Preview ────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle size={14} className="text-emerald-500" />
            <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">Vista previa del mensaje</h2>
          </div>

          {/* Burbuja de chat */}
          <div className="rounded-2xl bg-[#e5ddd5] p-4">
            <div className="max-w-xs rounded-2xl rounded-tl-none bg-white px-4 py-3 shadow-sm">
              <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-gray-800">
                {previewMessage}
              </p>
              <p className="mt-1 text-right text-[10px] text-gray-400">12:00</p>
            </div>
          </div>

          <p className="text-[11px] text-muted">
            Preview con productos de ejemplo. El mensaje real incluirá los productos que elija el cliente.
          </p>
        </div>

      </div>
    </div>
  );
}
