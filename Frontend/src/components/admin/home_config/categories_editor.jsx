import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, ArrowUp, ArrowDown, X } from "lucide-react";
import ImageUploader from "../../ui/image_uploader";
import { SLUG_BG_OPTIONS, slugify, urlToItem, itemToUrl } from "./home_config_helpers";
function CategoriesEditor({
  categories,
  onChange
}) {
  const [expandedIdx, setExpandedIdx] = useState(0);
  function update(i, patch) {
    onChange(categories.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  }
  function remove(i) {
    const next = categories.filter((_, idx) => idx !== i);
    onChange(next);
    setExpandedIdx(null);
  }
  function move(i, dir) {
    const next = [...categories];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setExpandedIdx(j);
  }
  function addCategory() {
    if (categories.length >= 5) return;
    const newCat = {
      slug: slugify(`categoria-${categories.length + 1}`),
      name: "",
      caption: "Ver m\xE1s",
      to: "/catalogo",
      image: ""
    };
    onChange([...categories, newCat]);
    setExpandedIdx(categories.length);
  }
  return <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          Podés tener entre 1 y 5 categorías. Imagen recomendada: vertical (3:4), mínimo 600×800 px.
        </p>
        <span className="text-[11px] font-bold text-muted">{categories.length}/5</span>
      </div>

      {categories.map((cat, i) => {
    const isOpen = expandedIdx === i;
    return <div key={cat.slug + i} className="overflow-hidden rounded-2xl border border-line bg-card">
            <div className="flex items-center gap-2 px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <button
      type="button"
      onClick={() => move(i, -1)}
      disabled={i === 0}
      className="flex h-5 w-5 items-center justify-center rounded text-muted hover:text-ink disabled:opacity-20 transition-colors"
    >
                  <ArrowUp size={11} />
                </button>
                <button
      type="button"
      onClick={() => move(i, 1)}
      disabled={i === categories.length - 1}
      className="flex h-5 w-5 items-center justify-center rounded text-muted hover:text-ink disabled:opacity-20 transition-colors"
    >
                  <ArrowDown size={11} />
                </button>
              </div>

              <div className={[
      "relative h-10 w-8 shrink-0 overflow-hidden rounded-lg",
      SLUG_BG_OPTIONS[i] ?? SLUG_BG_OPTIONS[0]
    ].join(" ")}>
                {cat.image && <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />}
              </div>

              <button
      type="button"
      onClick={() => setExpandedIdx(isOpen ? null : i)}
      className="flex flex-1 items-center gap-2 text-left"
    >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">
                    {cat.name || <span className="text-muted/60 italic">Sin nombre</span>}
                  </p>
                  <p className="text-[11px] text-muted">{cat.to || "\u2014"}</p>
                </div>
                {isOpen ? <ChevronUp size={15} className="shrink-0 text-muted" /> : <ChevronDown size={15} className="shrink-0 text-muted" />}
              </button>

              <button
      type="button"
      onClick={() => remove(i)}
      title="Eliminar categoría"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-500 transition-colors"
    >
                <Trash2 size={13} />
              </button>
            </div>

            {isOpen && <div className="border-t border-line px-4 pb-5 pt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label-form">Nombre de la categoría *</label>
                    <input
      value={cat.name}
      onChange={(e) => update(i, { name: e.target.value, slug: slugify(e.target.value) || cat.slug })}
      className="input-form"
      placeholder="Ej: Mujer"
    />
                  </div>
                  <div>
                    <label className="label-form">Texto del hover</label>
                    <input
      value={cat.caption}
      onChange={(e) => update(i, { caption: e.target.value })}
      className="input-form"
      placeholder="Ver colección"
    />
                  </div>
                </div>

                <div>
                  <label className="label-form">URL de destino *</label>
                  <input
      value={cat.to}
      onChange={(e) => update(i, { to: e.target.value })}
      className="input-form"
      placeholder="/damas"
    />
                  <p className="mt-1 text-[11px] text-muted">Ruta interna (ej: /damas) o URL completa</p>
                </div>

                <div>
                  <label className="label-form">
                    Imagen de fondo{" "}
                    <span className="font-normal text-muted/60">(vacía = color de fondo)</span>
                  </label>
                  {cat.image ? <div className="relative mb-2 overflow-hidden rounded-xl" style={{ aspectRatio: "3/5", maxHeight: 160 }}>
                      <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-linear-to-t from-navy/60 to-transparent" />
                      <span className="absolute bottom-2 left-3 font-display text-base font-bold text-white">{cat.name}</span>
                      <button
      type="button"
      onClick={() => update(i, { image: "" })}
      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors"
    >
                        <X size={11} />
                      </button>
                    </div> : null}
                  <ImageUploader
      value={urlToItem(cat.image, cat.name)}
      onChange={(items) => update(i, { image: itemToUrl(items) })}
      max={1}
    />
                </div>
              </div>}
          </div>;
  })}

      {categories.length < 5 ? <button
    type="button"
    onClick={addCategory}
    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-3.5 text-sm font-semibold text-muted hover:border-navy/40 hover:text-navy transition-colors"
  >
          <Plus size={14} /> Agregar categoría ({categories.length}/5)
        </button> : <p className="rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-2.5 text-xs font-semibold text-ink text-center">
          Máximo de 5 categorías alcanzado.
        </p>}
    </div>;
}
export {
  CategoriesEditor
};
