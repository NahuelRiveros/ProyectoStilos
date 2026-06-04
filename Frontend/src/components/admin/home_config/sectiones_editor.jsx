import { Eye, EyeOff } from "lucide-react";

function SectionToggle({ activo, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!activo)}
      className={[
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all",
        activo
          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "bg-line text-muted hover:bg-line/70",
      ].join(" ")}
    >
      {activo ? <Eye size={11} /> : <EyeOff size={11} />}
      {activo ? "Visible" : "Oculto"}
    </button>
  );
}

function SectionRow({ label, hint, value, onChange, onToggle }) {
  const activo = value?.activo !== false;
  function set(k, v) {
    onChange({ ...value, [k]: v });
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div>
          <p className="text-sm font-bold text-ink">{label}</p>
          <p className="text-[11px] text-muted">{hint}</p>
        </div>
        <SectionToggle activo={activo} onChange={(v) => onToggle?.(v) ?? onChange({ ...value, activo: v })} />
      </div>
      <div className={["grid gap-4 px-5 py-4 sm:grid-cols-3", !activo ? "pointer-events-none opacity-40" : ""].join(" ")}>
        <div>
          <label className="label-form">Eyebrow (texto pequeño encima)</label>
          <input value={value.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} className="input-form" placeholder="Novedades" />
        </div>
        <div>
          <label className="label-form">Título principal</label>
          <input value={value.title} onChange={(e) => set("title", e.target.value)} className="input-form" placeholder="Lo más nuevo" />
        </div>
        <div>
          <label className="label-form">Texto del enlace</label>
          <input value={value.linkText} onChange={(e) => set("linkText", e.target.value)} className="input-form" placeholder="Ver catálogo" />
        </div>
      </div>
    </div>
  );
}

function BrandBannerRow({ value, onChange }) {
  const activo = value?.activo !== false;
  function set(k, v) {
    onChange({ ...value, [k]: v });
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div>
          <p className="text-sm font-bold text-ink">Banner de marca</p>
          <p className="text-[11px] text-muted">El panel oscuro al pie del home.</p>
        </div>
        <SectionToggle activo={activo} onChange={(v) => onChange({ ...value, activo: v })} />
      </div>
      <div className={["space-y-4 px-5 py-4", !activo ? "pointer-events-none opacity-40" : ""].join(" ")}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label-form">Eyebrow</label>
            <input value={value.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} className="input-form" placeholder="Stilo's" />
          </div>
          <div>
            <label className="label-form">Título</label>
            <input value={value.title} onChange={(e) => set("title", e.target.value)} className="input-form" placeholder="La moda que" />
          </div>
          <div>
            <label className="label-form">Título resaltado <span className="font-normal text-muted/60">(en champagne)</span></label>
            <input value={value.titleAccent} onChange={(e) => set("titleAccent", e.target.value)} className="input-form" placeholder="te define." />
          </div>
        </div>
        <div>
          <label className="label-form">Descripción</label>
          <textarea
            value={value.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/20 transition"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="label-form">Botón principal</label>
            <input value={value.primaryCta.label} onChange={(e) => set("primaryCta", { ...value.primaryCta, label: e.target.value })} className="input-form" placeholder="Ver colección" />
            <input value={value.primaryCta.to} onChange={(e) => set("primaryCta", { ...value.primaryCta, to: e.target.value })} className="input-form" placeholder="/catalogo" />
          </div>
          <div className="space-y-2">
            <label className="label-form">Botón secundario</label>
            <input value={value.secondaryCta.label} onChange={(e) => set("secondaryCta", { ...value.secondaryCta, label: e.target.value })} className="input-form" placeholder="Conocer más" />
            <input value={value.secondaryCta.to} onChange={(e) => set("secondaryCta", { ...value.secondaryCta, to: e.target.value })} className="input-form" placeholder="/premium" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionesEditor({ config, onChange, onSectionFlag }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Activá o desactivá cada sección y personalizá sus textos de encabezado.
      </p>
      <SectionRow
        label="Sección Categorías"
        hint='El bloque "Explorá la tienda" con las cards de categorías.'
        value={config.categorias_section}
        onChange={(v) => onChange({ categorias_section: v })}
        onToggle={(v) => onSectionFlag?.("categorias_section", v)}
      />
      <SectionRow
        label="Sección Novedades"
        hint='El bloque "Lo más nuevo" con los 4 productos seleccionados.'
        value={config.novedades_section}
        onChange={(v) => onChange({ novedades_section: v })}
        onToggle={(v) => onSectionFlag?.("novedades_section", v)}
      />
      <SectionRow
        label="Sección Ofertas"
        hint='El bloque de productos con descuento.'
        value={config.ofertas_section}
        onChange={(v) => onChange({ ofertas_section: v })}
        onToggle={(v) => onSectionFlag?.("ofertas_section", v)}
      />
      <BrandBannerRow
        value={config.brand_banner}
        onChange={(v) => onChange({ brand_banner: v })}
      />
    </div>
  );
}

export { SectionesEditor };
