import {
  type SectionConfig,
  type BrandBannerConfig,
  type HomeConfig,
} from "../../../api/home_config_api";

function SectionRow({
  label, hint, value, onChange,
}: {
  label:    string;
  hint:     string;
  value:    SectionConfig;
  onChange: (v: SectionConfig) => void;
}) {
  function set<K extends keyof SectionConfig>(k: K, v: SectionConfig[K]) {
    onChange({ ...value, [k]: v });
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="border-b border-line px-5 py-3">
        <p className="text-sm font-bold text-ink">{label}</p>
        <p className="text-[11px] text-muted">{hint}</p>
      </div>
      <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
        <div>
          <label className="label-form">Eyebrow (texto pequeño encima)</label>
          <input value={value.eyebrow} onChange={e => set("eyebrow", e.target.value)} className="input-form" placeholder="Novedades" />
        </div>
        <div>
          <label className="label-form">Título principal</label>
          <input value={value.title} onChange={e => set("title", e.target.value)} className="input-form" placeholder="Lo más nuevo" />
        </div>
        <div>
          <label className="label-form">Texto del enlace</label>
          <input value={value.linkText} onChange={e => set("linkText", e.target.value)} className="input-form" placeholder="Ver catálogo" />
        </div>
      </div>
    </div>
  );
}

function BrandBannerRow({
  value, onChange,
}: {
  value:    BrandBannerConfig;
  onChange: (v: BrandBannerConfig) => void;
}) {
  function set<K extends keyof BrandBannerConfig>(k: K, v: BrandBannerConfig[K]) {
    onChange({ ...value, [k]: v });
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="border-b border-line px-5 py-3">
        <p className="text-sm font-bold text-ink">Banner de marca</p>
        <p className="text-[11px] text-muted">El panel oscuro al pie del home ("La moda que te define").</p>
      </div>
      <div className="space-y-4 px-5 py-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label-form">Eyebrow</label>
            <input value={value.eyebrow} onChange={e => set("eyebrow", e.target.value)} className="input-form" placeholder="Stilo's" />
          </div>
          <div>
            <label className="label-form">Título</label>
            <input value={value.title} onChange={e => set("title", e.target.value)} className="input-form" placeholder="La moda que" />
          </div>
          <div>
            <label className="label-form">Título resaltado <span className="font-normal text-muted/60">(en champagne)</span></label>
            <input value={value.titleAccent} onChange={e => set("titleAccent", e.target.value)} className="input-form" placeholder="te define." />
          </div>
        </div>
        <div>
          <label className="label-form">Descripción</label>
          <textarea value={value.description} onChange={e => set("description", e.target.value)} rows={2}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/20 transition resize-none" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="label-form">Botón principal</label>
            <input value={value.primaryCta.label} onChange={e => set("primaryCta", { ...value.primaryCta, label: e.target.value })} className="input-form" placeholder="Ver colección" />
            <input value={value.primaryCta.to}    onChange={e => set("primaryCta", { ...value.primaryCta, to:    e.target.value })} className="input-form" placeholder="/catalogo" />
          </div>
          <div className="space-y-2">
            <label className="label-form">Botón secundario</label>
            <input value={value.secondaryCta.label} onChange={e => set("secondaryCta", { ...value.secondaryCta, label: e.target.value })} className="input-form" placeholder="Conocer membresías" />
            <input value={value.secondaryCta.to}    onChange={e => set("secondaryCta", { ...value.secondaryCta, to:    e.target.value })} className="input-form" placeholder="/premium" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionesEditor({
  config, onChange,
}: {
  config:   HomeConfig;
  onChange: (patch: Partial<HomeConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Personalizá los textos de encabezado de cada sección visible en el home.
      </p>
      <SectionRow
        label="Sección Categorías"
        hint='El bloque "Explorá la tienda" con las cards de categorías.'
        value={config.categorias_section}
        onChange={v => onChange({ categorias_section: v })}
      />
      <SectionRow
        label="Sección Novedades"
        hint='El bloque "Lo más nuevo" con los 4 productos seleccionados.'
        value={config.novedades_section}
        onChange={v => onChange({ novedades_section: v })}
      />
      <SectionRow
        label="Sección Ofertas"
        hint='El bloque de ofertas con descuento (productos marcados como oferta).'
        value={config.ofertas_section}
        onChange={v => onChange({ ofertas_section: v })}
      />
      <BrandBannerRow
        value={config.brand_banner}
        onChange={v => onChange({ brand_banner: v })}
      />
    </div>
  );
}
