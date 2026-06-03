import { useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { type SlideConfig } from "../../../api/home_config_api";
import ImageUploader from "../../ui/image_uploader";
import { urlToItem, itemToUrl } from "./home_config_helpers";

const LABELS = ["Slide 1 — Novedades", "Slide 2 — Ofertas", "Slide 3 — Premium"];

export function SlideEditor({
  slide, index, onChange,
}: { slide: SlideConfig; index: number; onChange: (u: SlideConfig) => void }) {
  const [open, setOpen] = useState(index === 0);

  function set<K extends keyof SlideConfig>(k: K, v: SlideConfig[K]) {
    onChange({ ...slide, [k]: v });
  }

  return (
    <div className="rounded-2xl border border-line bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-surface/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={["flex h-7 w-7 items-center justify-center rounded-full text-xs font-black",
            slide.activo ? "bg-navy text-white" : "bg-line text-muted"].join(" ")}>
            {index + 1}
          </div>
          <div>
            <p className="text-sm font-bold text-ink">{LABELS[index]}</p>
            <p className="text-[11px] text-muted truncate max-w-xs">
              {slide.activo ? `"${slide.badge}" · "${slide.title} ${slide.titleAccent}"` : "Desactivado"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={e => { e.stopPropagation(); set("activo", !slide.activo); }}
            className={["flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors",
              slide.activo ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-line text-muted hover:bg-line/80"].join(" ")}>
            {slide.activo ? <Eye size={11} /> : <EyeOff size={11} />}
            {slide.activo ? "Activo" : "Oculto"}
          </button>
          {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-line px-5 pb-6 pt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-form">Badge</label>
              <input value={slide.badge} onChange={e => set("badge", e.target.value)} className="input-form" placeholder="Nueva Colección" />
            </div>
            <div>
              <label className="label-form">Subtítulo</label>
              <input value={slide.subtitle} onChange={e => set("subtitle", e.target.value)} className="input-form" placeholder="Otoño — Invierno 2026" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-form">Título</label>
              <input value={slide.title} onChange={e => set("title", e.target.value)} className="input-form" placeholder="Vestite con" />
            </div>
            <div>
              <label className="label-form">Título resaltado</label>
              <input value={slide.titleAccent} onChange={e => set("titleAccent", e.target.value)} className="input-form" placeholder="tu estilo." />
            </div>
          </div>
          <div>
            <label className="label-form">Descripción</label>
            <textarea value={slide.description} onChange={e => set("description", e.target.value)} rows={2}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/20 transition resize-none" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="label-form">Botón principal</label>
              <input value={slide.primaryCta.label} onChange={e => set("primaryCta", { ...slide.primaryCta, label: e.target.value })} className="input-form" placeholder="Ver colección" />
              <input value={slide.primaryCta.to} onChange={e => set("primaryCta", { ...slide.primaryCta, to: e.target.value })} className="input-form" placeholder="/catalogo" />
            </div>
            <div className="space-y-2">
              <label className="label-form">Botón secundario</label>
              <input value={slide.secondaryCta.label} onChange={e => set("secondaryCta", { ...slide.secondaryCta, label: e.target.value })} className="input-form" placeholder="Explorar categorías" />
              <input value={slide.secondaryCta.to} onChange={e => set("secondaryCta", { ...slide.secondaryCta, to: e.target.value })} className="input-form" placeholder="/categorias" />
            </div>
          </div>
          <div>
            <label className="label-form">Tags <span className="font-normal text-muted/60">(separados por coma)</span></label>
            <input value={slide.tags.join(", ")} onChange={e => set("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))} className="input-form" placeholder="Abrigos, Sweaters, Botas" />
          </div>
          <div>
            <label className="label-form">
              Imagen <span className="font-normal text-muted/60">(vacía = usa imagen del producto marcado)</span>
            </label>
            <ImageUploader
              value={urlToItem(slide.image, slide.imageAlt)}
              onChange={items => {
                const url = itemToUrl(items);
                const alt = items[0]?.alt ?? slide.imageAlt;
                onChange({ ...slide, image: url, imageAlt: alt });
              }}
              max={1}
            />
            {slide.image && (
              <input value={slide.imageAlt} onChange={e => set("imageAlt", e.target.value)}
                className="input-form mt-2" placeholder="Texto alternativo de la imagen" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
