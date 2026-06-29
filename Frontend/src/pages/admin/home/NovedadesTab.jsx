import { NovedadesEditor } from "../../../components/admin/home_config";
import { SectionToggle } from "./home_shared";

export default function NovedadesTab({ config, setSectionFlag, setConfig }) {
  const activo = config.novedades_section?.activo !== false;

  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">
          Sección "Lo más nuevo"
        </h2>
        <SectionToggle activo={activo} onChange={(v) => setSectionFlag("novedades_section", v)} />
      </div>

      <div className={activo ? "" : "pointer-events-none opacity-40"}>
        <NovedadesEditor
          selectedIds={config.novedades_ids}
          onChange={(ids) => setConfig((c) => ({ ...c, novedades_ids: ids }))}
        />
      </div>
    </div>
  );
}
