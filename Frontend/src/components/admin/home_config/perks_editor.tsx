import { type PerkConfig, type PerkIcon } from "../../../api/home_config_api";
import { PERK_ICONS } from "./home_config_helpers";

export function PerksEditor({
  perks, onChange,
}: { perks: PerkConfig[]; onChange: (p: PerkConfig[]) => void }) {
  function setPerk(i: number, upd: Partial<PerkConfig>) {
    onChange(perks.map((p, idx) => idx === i ? { ...p, ...upd } : p));
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">La barra de beneficios debajo del carousel. Exactamente 4 ítems.</p>
      {perks.map((perk, i) => (
        <div key={i} className="grid gap-3 rounded-xl border border-line bg-surface px-4 py-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Ícono</label>
            <select value={perk.icon} onChange={e => setPerk(i, { icon: e.target.value as PerkIcon })}
              className="h-8 w-full rounded-lg border border-line bg-card px-2 text-xs text-ink focus:border-navy focus:outline-none">
              {PERK_ICONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Título</label>
            <input value={perk.label} onChange={e => setPerk(i, { label: e.target.value })} className="input-form h-8 py-1.5 text-xs" placeholder="Envío gratis" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Descripción</label>
            <input value={perk.text} onChange={e => setPerk(i, { text: e.target.value })} className="input-form h-8 py-1.5 text-xs" placeholder="En compras +$50.000" />
          </div>
        </div>
      ))}
    </div>
  );
}
