import { PERK_ICONS } from "./home_config_helpers";
function PerksEditor({
  perks,
  onChange
}) {
  function setPerk(i, upd) {
    onChange(perks.map((p, idx) => idx === i ? { ...p, ...upd } : p));
  }
  return <div className="space-y-3">
      <p className="text-xs text-muted">La barra de beneficios debajo del carousel. Exactamente 4 ítems.</p>
      {perks.map((perk, i) => <div key={i} className="grid gap-3 rounded-xl border border-line bg-surface px-4 py-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Ícono</label>
            <select
    value={perk.icon}
    onChange={(e) => setPerk(i, { icon: e.target.value })}
    className="h-8 w-full rounded-lg border border-line bg-card px-2 text-xs text-ink focus:border-navy focus:outline-none"
  >
              {PERK_ICONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Título</label>
            <input value={perk.title ?? ""} onChange={(e) => setPerk(i, { title: e.target.value })} className="input-form h-8 py-1.5 text-xs" placeholder="Envío gratis" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Descripción</label>
            <input value={perk.text} onChange={(e) => setPerk(i, { text: e.target.value })} className="input-form h-8 py-1.5 text-xs" placeholder="En compras +$50.000" />
          </div>
        </div>)}
    </div>;
}
export {
  PerksEditor
};
