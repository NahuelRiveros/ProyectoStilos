import { PerksEditor } from "../../../components/admin/home_config";
import { SectionToggle } from "./home_shared";

export default function BeneficiosTab({ config, setFlag, setConfig }) {
  const activo = config.perks_activo !== false;

  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-muted">
          Barra de beneficios
        </h2>
        <SectionToggle activo={activo} onChange={(v) => setFlag("perks_activo", v)} />
      </div>

      <div className={activo ? "" : "pointer-events-none opacity-40"}>
        <PerksEditor
          perks={config.perks}
          onChange={(perks) => setConfig((c) => ({ ...c, perks }))}
        />
      </div>
    </div>
  );
}
