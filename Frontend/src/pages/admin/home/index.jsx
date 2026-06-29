import { useState, useEffect } from "react";
import {
  Save, Check,
  Layers, LayoutGrid, Newspaper, Megaphone, Star, PanelTop,
} from "lucide-react";
import {
  getHomeConfig, saveHomeConfig, DEFAULT_HOME_CONFIG,
} from "../../../api/home_config_api";
import { AdminSpinner } from "../../../components/admin";

import CarruselTab   from "./CarruselTab";
import CategoriasTab from "./CategoriasTab";
import NovedadesTab  from "./NovedadesTab";
import SeccionesTab  from "./SeccionesTab";
import AnunciosTab   from "./AnunciosTab";
import BeneficiosTab from "./BeneficiosTab";

const TABS = [
  { id: "carousel",     label: "Carrusel",   icon: Layers      },
  { id: "categories",   label: "Categorías", icon: LayoutGrid  },
  { id: "novedades",    label: "Novedades",  icon: Newspaper   },
  { id: "secciones",    label: "Secciones",  icon: PanelTop    },
  { id: "announcement", label: "Anuncios",   icon: Megaphone   },
  { id: "perks",        label: "Beneficios", icon: Star        },
];

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
    setConfig((c) => ({
      ...c,
      carousel: c.carousel.map((s, idx) => (idx === i ? updated : s)),
    }));
  }

  function setFlag(key, value) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  function setSectionFlag(sectionKey, value) {
    setConfig((c) => ({ ...c, [sectionKey]: { ...c[sectionKey], activo: value } }));
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
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">

      {/* Encabezado */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-8 w-1 shrink-0 rounded-full" style={{ background: "var(--color-accent)" }} />
          <div>
            <h1 className="font-display text-2xl font-black text-ink">Configuración del home</h1>
            <p className="mt-0.5 text-sm text-muted">
              Textos, imágenes y secciones visibles en la página de inicio.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={[
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black uppercase tracking-widest shadow transition-all active:scale-[0.98] disabled:opacity-60",
            saved
              ? "bg-emerald-500 text-white shadow-emerald-200 ring-2 ring-emerald-300/40"
              : "bg-navy text-white hover:bg-navy/90 hover:shadow-md",
          ].join(" ")}
        >
          {saved ? <Check size={15} /> : <Save size={15} />}
          {saving ? "Guardando…" : saved ? "Guardado" : "Guardar"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* Navegación pill */}
      <div className="mb-6 overflow-x-auto">
        <div className="inline-flex gap-1 rounded-xl border border-line bg-surface p-1 min-w-max">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={[
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all whitespace-nowrap",
                tab === id
                  ? "bg-navy text-surface shadow-sm"
                  : "text-muted hover:text-ink hover:bg-card/70",
              ].join(" ")}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido del tab activo */}
      {tab === "carousel"     && (
        <CarruselTab config={config} setFlag={setFlag} updateSlide={updateSlide} />
      )}
      {tab === "categories"   && (
        <CategoriasTab config={config} setSectionFlag={setSectionFlag} setConfig={setConfig} />
      )}
      {tab === "novedades"    && (
        <NovedadesTab config={config} setSectionFlag={setSectionFlag} setConfig={setConfig} />
      )}
      {tab === "secciones"    && (
        <SeccionesTab
          config={config}
          onChange={(patch) => setConfig((c) => ({ ...c, ...patch }))}
          onSectionFlag={setSectionFlag}
        />
      )}
      {tab === "announcement" && (
        <AnunciosTab config={config} setFlag={setFlag} setConfig={setConfig} />
      )}
      {tab === "perks"        && (
        <BeneficiosTab config={config} setFlag={setFlag} setConfig={setConfig} />
      )}

    </div>
  );
}
