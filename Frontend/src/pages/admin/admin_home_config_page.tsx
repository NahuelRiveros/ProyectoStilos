import { useState, useEffect } from "react";
import {
  Save, Check,
  Layers, LayoutGrid, Newspaper, Megaphone, Star, PanelTop,
} from "lucide-react";
import {
  getHomeConfig, saveHomeConfig,
  type HomeConfig, type SlideConfig,
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

type Tab = "carousel" | "categories" | "novedades" | "secciones" | "announcement" | "perks";

const TABS: { id: Tab; label: string; icon: typeof Layers }[] = [
  { id: "carousel",     label: "Carrusel",    icon: Layers      },
  { id: "categories",   label: "Categorías",  icon: LayoutGrid  },
  { id: "novedades",    label: "Novedades",   icon: Newspaper   },
  { id: "secciones",    label: "Secciones",   icon: PanelTop    },
  { id: "announcement", label: "Anuncios",    icon: Megaphone   },
  { id: "perks",        label: "Beneficios",  icon: Star        },
];

export default function AdminHomeConfigPage() {
  const [config,  setConfig]  = useState<HomeConfig>(DEFAULT_HOME_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");
  const [tab,     setTab]     = useState<Tab>("carousel");

  useEffect(() => {
    getHomeConfig()
      .then(setConfig)
      .catch(() => setConfig(DEFAULT_HOME_CONFIG))
      .finally(() => setLoading(false));
  }, []);

  function updateSlide(i: number, updated: SlideConfig) {
    setConfig(c => ({ ...c, carousel: c.carousel.map((s, idx) => idx === i ? updated : s) }));
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

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-black text-ink">Configuración del home</h1>
          <p className="text-sm text-muted">Textos, imágenes y productos que se muestran en la página de inicio.</p>
        </div>
        <button
          type="button" onClick={handleSave} disabled={saving}
          className={["flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-60",
            saved ? "bg-emerald-500 text-white" : "bg-navy text-white hover:bg-navy/90"].join(" ")}>
          {saved ? <Check size={15} /> : <Save size={15} />}
          {saving ? "Guardando…" : saved ? "Guardado" : "Guardar"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-0.5 rounded-xl border border-line bg-surface p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className={["flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all",
              tab === id ? "bg-white shadow-sm text-navy" : "text-muted hover:text-ink"].join(" ")}>
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === "carousel" && (
        <div className="space-y-3">
          <p className="mb-4 text-xs text-muted">
            Hasta 3 slides. Si la imagen está vacía, se usa automáticamente la foto del producto
            marcado como <strong>Carrusel</strong> en el formulario de producto.
          </p>
          {config.carousel.map((slide, i) => (
            <SlideEditor key={i} slide={slide} index={i} onChange={u => updateSlide(i, u)} />
          ))}
        </div>
      )}

      {tab === "categories" && (
        <div className="rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 text-[11px] font-black uppercase tracking-widest text-muted">
            Imágenes de categorías
          </h2>
          <CategoriesEditor
            categories={config.categories}
            onChange={cats => setConfig(c => ({ ...c, categories: cats }))}
          />
        </div>
      )}

      {tab === "novedades" && (
        <div className="rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-1 text-[11px] font-black uppercase tracking-widest text-muted">
            Sección "Lo más nuevo"
          </h2>
          <NovedadesEditor
            selectedIds={config.novedades_ids}
            onChange={ids => setConfig(c => ({ ...c, novedades_ids: ids }))}
          />
        </div>
      )}

      {tab === "secciones" && (
        <SectionesEditor
          config={config}
          onChange={patch => setConfig(c => ({ ...c, ...patch }))}
        />
      )}

      {tab === "announcement" && (
        <div className="rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 text-[11px] font-black uppercase tracking-widest text-muted">
            Ticker de anuncios
          </h2>
          <AnnouncementEditor
            items={config.announcement}
            onChange={items => setConfig(c => ({ ...c, announcement: items }))}
          />
        </div>
      )}

      {tab === "perks" && (
        <div className="rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 text-[11px] font-black uppercase tracking-widest text-muted">
            Barra de beneficios
          </h2>
          <PerksEditor
            perks={config.perks}
            onChange={perks => setConfig(c => ({ ...c, perks }))}
          />
        </div>
      )}

    </div>
  );
}
