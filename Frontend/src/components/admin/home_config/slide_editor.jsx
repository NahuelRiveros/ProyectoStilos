import { useState } from "react";
import {
  ArrowRight, ChevronDown, ChevronUp,
  Eye, EyeOff, ImageIcon, Plus, ShoppingBag, X,
} from "lucide-react";
import ImageUploader from "../../ui/image_uploader";
import { urlToItem, itemToUrl } from "./home_config_helpers";

// Secciones de la tienda disponibles para los botones
const DESTINOS = [
  { label: "Catálogo completo", to: "/catalogo" },
  { label: "Damas",             to: "/damas"    },
  { label: "Hombre",            to: "/hombre"   },
  { label: "Calzado",           to: "/calzado"  },
];

// Chips sugeridos para el slide
const TAG_PRESETS = [
  "Novedades", "Ofertas", "Temporada", "Premium",
  "Destacados", "Descuentos", "Stock", "Exclusivo",
];

// ── Vista previa escalada del slide ───────────────────────────
// Replica el layout real del HomeCarousel al 42% de tamaño.
// pointer-events-none → no interfiere con el formulario.
const PREVIEW_SCALE = 0.42;
const SLIDE_REAL_H  = 560; // min-height del slide real en px

function SlidePreview({ slide }) {
  const outerH    = Math.round(SLIDE_REAL_H * PREVIEW_SCALE); // 235px
  const innerW    = `${Math.round(100 / PREVIEW_SCALE)}%`;    // 238%

  return (
    <div className="mb-6">
      {/* Encabezado del bloque */}
      <div className="mb-2 flex items-center gap-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted">
          Así se ve en el sitio
        </p>
        <div className="h-px flex-1 bg-line" />
        <span className="text-[9px] text-muted/40">Vista desktop · se actualiza en tiempo real</span>
      </div>

      {/* Contenedor escalado */}
      <div
        className="relative overflow-hidden rounded-xl border border-line bg-card shadow-sm"
        style={{ height: `${outerH}px` }}
      >
        <div
          className="pointer-events-none select-none"
          style={{
            transform:       `scale(${PREVIEW_SCALE})`,
            transformOrigin: "top left",
            width:           innerW,
          }}
        >
          {/* Layout fiel al HomeCarousel (desktop 2 columnas) */}
          <div
            className="grid items-center gap-20 bg-card px-8 py-14"
            style={{
              height:              `${SLIDE_REAL_H}px`,
              gridTemplateColumns: "1fr 0.85fr",
            }}
          >
            {/* ── Columna texto ── */}
            <div className="flex flex-col">
              {slide.badge && (
                <span
                  className="mb-5 w-fit border-b pb-1.5 text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{
                    color:       "var(--color-champagne)",
                    borderColor: "color-mix(in srgb, var(--color-champagne) 50%, transparent)",
                  }}
                >
                  {slide.badge}
                </span>
              )}

              <h2 className="font-display text-7xl font-bold leading-[1.04] tracking-tight text-ink">
                {slide.title || (
                  <span className="text-ink/20">Título del slide</span>
                )}
                {slide.titleAccent && (
                  <span
                    className="block font-bold italic"
                    style={{ color: "var(--color-champagne)" }}
                  >
                    {slide.titleAccent}
                  </span>
                )}
              </h2>

              {slide.subtitle && (
                <p className="mt-3 font-display text-xl font-medium italic text-muted">
                  {slide.subtitle}
                </p>
              )}

              {slide.description && (
                <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
                  {slide.description}
                </p>
              )}

              {slide.tags?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {slide.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-line px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-9 flex flex-wrap items-center gap-5">
                {slide.primaryCta?.label && (
                  <span className="inline-flex items-center gap-2.5 bg-navy px-7 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-white">
                    <ShoppingBag size={14} />
                    {slide.primaryCta.label}
                  </span>
                )}
                {slide.secondaryCta?.label && (
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink">
                    {slide.secondaryCta.label}
                    <ArrowRight size={13} style={{ color: "var(--color-champagne)" }} />
                  </span>
                )}
              </div>
            </div>

            {/* ── Columna imagen ── */}
            <div className="relative">
              {/* Marco decorativo offset */}
              <div
                className="absolute -bottom-3 -right-3 aspect-[3/4] w-full border"
                style={{ borderColor: "color-mix(in srgb, var(--color-champagne) 35%, transparent)" }}
              />
              <div
                className="relative mx-auto aspect-[3/4] w-full overflow-hidden"
                style={{ maxHeight: "500px", backgroundColor: "var(--color-champagne-light)" }}
              >
                {slide.image ? (
                  <img
                    src={slide.image}
                    alt={slide.imageAlt || ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ color: "color-mix(in srgb, var(--color-champagne) 20%, transparent)" }}
                  >
                    <ShoppingBag size={72} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Selector de destino de botones ────────────────────────────
function DestinoSelect({ cta, onChange }) {
  const isCustom = !DESTINOS.find((d) => d.to === cta.to);
  return (
    <div className="flex gap-2">
      <select
        value={isCustom ? "__custom__" : cta.to}
        onChange={(e) => {
          if (e.target.value !== "__custom__") onChange({ ...cta, to: e.target.value });
        }}
        className="input-form min-w-0 flex-1"
      >
        {DESTINOS.map((d) => (
          <option key={d.to} value={d.to}>{d.label}</option>
        ))}
        {isCustom && <option value="__custom__">Personalizado</option>}
      </select>
      <input
        value={cta.label}
        onChange={(e) => onChange({ ...cta, label: e.target.value })}
        className="input-form w-36 shrink-0"
        placeholder="Texto del botón"
      />
    </div>
  );
}

// ── Chips interactivos de tags ────────────────────────────────
function TagsEditor({ tags, onChange }) {
  const [custom, setCustom] = useState("");

  function toggle(tag) {
    onChange(tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]);
  }

  function addCustom() {
    const t = custom.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setCustom("");
  }

  const extra = tags.filter((t) => !TAG_PRESETS.includes(t));

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {TAG_PRESETS.map((tag) => {
          const on = tags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={[
                "rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-all",
                on
                  ? "bg-navy text-surface"
                  : "border border-line bg-surface text-muted hover:border-navy/30 hover:text-ink",
              ].join(" ")}
            >
              {on && "✓ "}{tag}
            </button>
          );
        })}
      </div>

      {extra.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {extra.map((tag) => (
            <span key={tag} className="flex items-center gap-1 rounded-full bg-navy/10 px-2 py-0.5 text-[11px] font-semibold text-navy">
              {tag}
              <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))}>
                <X size={9} className="text-navy/50 hover:text-rose-500" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          className="input-form flex-1"
          placeholder="Agregar chip personalizado…"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!custom.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line text-muted hover:border-navy/30 hover:text-navy disabled:opacity-40 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted">{children}</p>
  );
}

// ── SlideEditor ───────────────────────────────────────────────
function SlideEditor({ slide, index, onChange }) {
  const [open, setOpen] = useState(index === 0);

  function set(k, v) {
    onChange({ ...slide, [k]: v });
  }

  const badge = slide.badge?.trim();

  return (
    <div className={[
      "overflow-hidden rounded-2xl bg-card transition-all",
      slide.activo ? "border border-navy/20" : "border border-line",
    ].join(" ")}>

      {/* Línea de estado: visible cuando el slide está activo */}
      <div
        className="h-0.75 transition-all duration-300"
        style={{ background: slide.activo ? "var(--color-accent)" : "transparent" }}
      />

      {/* Cabecera del acordeón */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-surface/40 transition-colors"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className={[
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black",
            slide.activo ? "bg-navy text-surface" : "bg-line text-muted",
          ].join(" ")}>
            {index + 1}
          </div>

          <div className="min-w-0">
            {slide.activo && (badge || slide.title || slide.titleAccent) ? (
              <div className="flex flex-wrap items-baseline gap-2">
                {badge && (
                  <span
                    className="shrink-0 rounded-full px-2 py-px text-[9px] font-black uppercase tracking-widest text-white"
                    style={{ background: "var(--color-accent)" }}
                  >
                    {badge}
                  </span>
                )}
                <span className="font-display text-sm font-bold text-ink leading-tight truncate max-w-55">
                  {slide.title && <span>{slide.title} </span>}
                  <span style={{ color: "var(--color-accent)" }}>{slide.titleAccent}</span>
                </span>
              </div>
            ) : (
              <p className="text-sm font-semibold text-muted">
                {slide.activo ? "Slide sin contenido — completá los textos" : "Desactivado"}
              </p>
            )}
          </div>
        </div>

        <div className="ml-3 flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); set("activo", !slide.activo); }}
            className={[
              "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors",
              slide.activo
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-line text-muted hover:bg-line/80",
            ].join(" ")}
          >
            {slide.activo ? <Eye size={11} /> : <EyeOff size={11} />}
            {slide.activo ? "Activo" : "Oculto"}
          </button>
          {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
        </div>
      </button>

      {/* Cuerpo expandible */}
      {open && (
        <div className="space-y-6 border-t border-line px-5 pb-6 pt-5">

          {/* ── Vista previa ── */}
          <SlidePreview slide={slide} />

          {/* ── Imagen ── */}
          <div>
            <SectionLabel>Imagen</SectionLabel>
            <ImageUploader
              value={urlToItem(slide.image, slide.imageAlt)}
              onChange={(items) => {
                const url = itemToUrl(items);
                const alt = items[0]?.alt ?? slide.imageAlt;
                onChange({ ...slide, image: url, imageAlt: alt });
              }}
              max={1}
            />
            {slide.image ? (
              <input
                value={slide.imageAlt}
                onChange={(e) => set("imageAlt", e.target.value)}
                className="input-form mt-2"
                placeholder="Descripción de la imagen (accesibilidad)"
              />
            ) : (
              <div className="mt-2 flex items-start gap-2 rounded-xl border border-line bg-surface px-3 py-2.5">
                <ImageIcon size={13} className="mt-0.5 shrink-0 text-muted" />
                <p className="text-[11px] leading-relaxed text-muted">
                  Sin imagen. Se usará automáticamente la foto del producto marcado como{" "}
                  <strong className="font-bold text-ink">Carrusel</strong> en el catálogo.
                </p>
              </div>
            )}
          </div>

          {/* ── Textos ── */}
          <div>
            <SectionLabel>Textos</SectionLabel>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-muted">
                    Etiqueta{" "}
                    <span className="font-normal">(chip pequeño, ej: "Nueva Colección")</span>
                  </label>
                  <input
                    value={slide.badge}
                    onChange={(e) => set("badge", e.target.value)}
                    className="input-form"
                    placeholder="Nueva Colección"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-muted">
                    Temporada o fecha{" "}
                    <span className="font-normal">(ej: "Otoño — Invierno 2026")</span>
                  </label>
                  <input
                    value={slide.subtitle}
                    onChange={(e) => set("subtitle", e.target.value)}
                    className="input-form"
                    placeholder="Otoño — Invierno 2026"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-muted">Título</label>
                  <input
                    value={slide.title}
                    onChange={(e) => set("title", e.target.value)}
                    className="input-form"
                    placeholder="Vestite con"
                  />
                </div>
                <div>
                  <label
                    className="mb-1 block text-[10px] font-semibold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Palabra destacada{" "}
                    <span className="font-normal text-muted">(se muestra en dorado)</span>
                  </label>
                  <input
                    value={slide.titleAccent}
                    onChange={(e) => set("titleAccent", e.target.value)}
                    className="input-form transition-colors"
                    placeholder="tu estilo."
                    style={slide.titleAccent ? { borderColor: "var(--color-accent)" } : {}}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold text-muted">
                  Texto de apoyo
                </label>
                <textarea
                  value={slide.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 transition focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/20"
                  placeholder="Una frase corta que acompañe el slide…"
                />
              </div>
            </div>
          </div>

          {/* ── Botones de acción ── */}
          <div>
            <SectionLabel>Botones de acción</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold text-muted">
                  Botón principal — ¿a dónde lleva?
                </label>
                <DestinoSelect
                  cta={slide.primaryCta}
                  onChange={(v) => set("primaryCta", v)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold text-muted">
                  Botón secundario — ¿a dónde lleva?
                </label>
                <DestinoSelect
                  cta={slide.secondaryCta}
                  onChange={(v) => set("secondaryCta", v)}
                />
              </div>
            </div>
          </div>

          {/* ── Chips decorativos ── */}
          <div>
            <SectionLabel>
              Chips decorativos{" "}
              <span className="normal-case font-normal tracking-normal">
                — pequeñas etiquetas que se muestran en el slide
              </span>
            </SectionLabel>
            <TagsEditor
              tags={slide.tags}
              onChange={(tags) => set("tags", tags)}
            />
          </div>

        </div>
      )}
    </div>
  );
}

export { SlideEditor };
