import { AnnouncementEditor } from "../../../components/admin/home_config";
import { SectionToggle } from "./home_shared";

export default function AnunciosTab({ config, setFlag, setConfig }) {
  const activo = config.announcement_activo !== false;

  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">
          Ticker de anuncios
        </h2>
        <SectionToggle activo={activo} onChange={(v) => setFlag("announcement_activo", v)} />
      </div>

      <div className={activo ? "" : "pointer-events-none opacity-40"}>
        <AnnouncementEditor
          items={config.announcement}
          onChange={(items) => setConfig((c) => ({ ...c, announcement: items }))}
        />
      </div>
    </div>
  );
}
