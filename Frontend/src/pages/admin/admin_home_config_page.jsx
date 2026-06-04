import { useState, useEffect } from "react";
import {
  Save, Check, Eye, EyeOff,
  Layers, LayoutGrid, Newspaper, Megaphone, Star, PanelTop,
} from "lucide-react";
import {
  getHomeConfig, saveHomeConfig,
  DEFAULT_HOME_CONFIG,
} from "../../api/home_config_api";
import { AdminSpinner } from "../../components/admin";
import {
  SlideEditor,
  CategoriesEditor,
  NovedadesEditor,
  AnnouncementEditor,
  PerksEditor,
  SectionesEditor,
} from "../../components/admin/home_config";

const TABS = [
  { id: "carousel",     label: "Carrusel",   icon: Layers      },
  { id: "categories",   label: "Categorías", icon: LayoutGrid  },
  { id: "novedades",    label: "Novedades",  icon: Newspaper   },
  { id: "secciones",    label: "Secciones",  icon: PanelTop    },
  { id: "announcement", label: "Anuncios",   icon: Megaphone   },
  { id: "perks",        label: "Beneficios", icon: Star        },
];

function SectionToggle({ activo, onChange, label }) {
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
      {label ?? (activo ? "Visible" : "Oculto")}
    </button>
  );
}

export default function AdminHomeConfigPage() {
  const [config,  setConfig]  = useState(DEFAULT_HOME_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");
  const [tab,     setTab]     = useState("carousel");

  useEffect(() => {
    getHomeConfig()
      .then(setConfig)
      .catch(() => setConfig(DEFAULT_HOME_CONFIG))
      .finally(() => setLoading(false));
  }, []);

  function updateSlide(i, updated) {
    setConfig(c => ({ ...c, carousel: c.carousel.map((s, idx) => idx === i ? updated : s) }));
  }

  function setFlag(key, value) {
    setConfig(c => ({ ...c, [key]: value }));
  }

  function setSectionFlag(sectionKey, value) {
    setConfig(c => ({ ...c, [sectionKey]: { ...c[sectionKey], activo: value } }));
  }

  async function handleSave() {
    setSaving(true); setSaved(false); setError("");
    try {
      await saveHomeConfig(config);
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

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-8 w-1 shrink-0 rounded-full bg-amber-400" />
          <div>
            <h1 className="font-display text-xl font-black text-ink">Configuración del home</h1>
            <p className="text-sm text-muted">Textos, imágenes y productos que se muestran en la página de inicio.</p>
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

      <div className="mb-6 flex gap-0.5 rounded-2xl border border-line bg-surface p-1.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all",
              tab === id ? "bg-white shadow text-navy font-black" : "text-muted hover:bg-white/60 hover:text-ink",
            ].join(" ")}>
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Carrusel ──────────────────────────────────────────────── */}
      {tab === "carousel" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">
              Hasta 3 slides. Si la imagen está vacía, se usa la foto del producto marcado como <strong>Carrusel</strong>.
            </p>
            <SectionToggle
              activo={config.carousel_activo !== false}
              onChange={(v) => setFlag("carousel_activo", v)}
            />
          </div>
          <div className={config.carousel_activo === false ? "pointer-events-none opacity-40" : ""}>
            {config.carousel.map((slide, i) => (
              <div key={i} className="mb-3">
                <SlideEditor slide={slide} index={i} onChange={u => updateSlide(i, u)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Categorías ──────────────────────────────────────────────── */}
      {tab === "categories" && (
        <div className="rounded-2xl border border-line bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">Imágenes de categorías</h2>
            <SectionToggle
              activo={config.categorias_section?.activo !== false}
              onChange={(v) => setSectionFlag("categorias_section", v)}
            />
          </div>
          <div className={config.categorias_section?.activo === false ? "pointer-events-none opacity-40" : ""}>
            <CategoriesEditor
              categories={config.categories}
              onChange={cats => setConfig(c => ({ ...c, categories: cats }))}
            />
          </div>
        </div>
      )}

      {/* ── Novedades ──────────────────────────────────────────────── */}
      {tab === "novedades" && (
        <div className="rounded-2xl border border-line bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">Sección "Lo más nuevo"</h2>
            </div>
            <SectionToggle
              activo={config.novedades_section?.activo !== false}
              onChange={(v) => setSectionFlag("novedades_section", v)}
            />
          </div>
          <div className={config.novedades_section?.activo === false ? "pointer-events-none opacity-40" : ""}>
            <NovedadesEditor
              selectedIds={config.novedades_ids}
              onChange={ids => setConfig(c => ({ ...c, novedades_ids: ids }))}
            />
          </div>
        </div>
      )}

      {/* ── Secciones ──────────────────────────────────────────────── */}
      {tab === "secciones" && (
        <SectionesEditor
          config={config}
          onChange={patch => setConfig(c => ({ ...c, ...patch }))}
          onSectionFlag={setSectionFlag}
        />
      )}

      {/* ── Anuncios ──────────────────────────────────────────────── */}
      {tab === "announcement" && (
        <div className="rounded-2xl border border-line bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">Ticker de anuncios</h2>
            <SectionToggle
              activo={config.announcement_activo !== false}
              onChange={(v) => setFlag("announcement_activo", v)}
            />
          </div>
          <div className={config.announcement_activo === false ? "pointer-events-none opacity-40" : ""}>
            <AnnouncementEditor
              items={config.announcement}
              onChange={items => setConfig(c => ({ ...c, announcement: items }))}
            />
          </div>
        </div>
      )}

      {/* ── Beneficios ──────────────────────────────────────────────── */}
      {tab === "perks" && (
        <div className="rounded-2xl border border-line bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">Barra de beneficios</h2>
            <SectionToggle
              activo={config.perks_activo !== false}
              onChange={(v) => setFlag("perks_activo", v)}
            />
          </div>
          <div className={config.perks_activo === false ? "pointer-events-none opacity-40" : ""}>
            <PerksEditor
              perks={config.perks}
              onChange={perks => setConfig(c => ({ ...c, perks }))}
            />
          </div>
        </div>
      )}

    </div>
  );
}
