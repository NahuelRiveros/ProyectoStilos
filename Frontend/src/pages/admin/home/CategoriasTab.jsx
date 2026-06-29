import { CategoriesEditor } from "../../../components/admin/home_config";
import { SectionToggle } from "./home_shared";

export default function CategoriasTab({ config, setSectionFlag, setConfig }) {
  const activo = config.categorias_section?.activo !== false;

  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">
          Imágenes de categorías
        </h2>
        <SectionToggle activo={activo} onChange={(v) => setSectionFlag("categorias_section", v)} />
      </div>

      <div className={activo ? "" : "pointer-events-none opacity-40"}>
        <CategoriesEditor
          categories={config.categories}
          onChange={(cats) => setConfig((c) => ({ ...c, categories: cats }))}
        />
      </div>
    </div>
  );
}
