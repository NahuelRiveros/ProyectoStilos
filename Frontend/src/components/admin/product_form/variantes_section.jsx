import { Check } from "lucide-react";

export function VariantesSection({
  coloresCatalogo,
  tallesCatalogo,
  coloresSeleccionados,
  stock,
  onColoresChange,
  onStockChange,
}) {
  const activeTalleIds = new Set(stock.map(r => r.talle_id).filter(Boolean));
  const sinColores = coloresSeleccionados.length === 0;
  const activeTalles = tallesCatalogo.filter(t => activeTalleIds.has(t.id));
  const totalStock = stock.reduce((s, r) => s + (Number(r.cantidad) || 0), 0);

  function toggleColor(color) {
    const yaEsta = coloresSeleccionados.some(c => c.id === color.id);
    if (yaEsta) {
      onColoresChange(coloresSeleccionados.filter(c => c.id !== color.id));
      onStockChange(stock.filter(r => r.color_id !== color.id));
    } else {
      onColoresChange([...coloresSeleccionados, { id: color.id, nombre: color.nombre, hex: color.hex }]);
      const nuevas = [...stock];
      for (const talleId of activeTalleIds) {
        const existe = stock.some(r => r.talle_id === talleId && r.color_id === color.id);
        if (!existe) {
          const talle = tallesCatalogo.find(t => t.id === talleId);
          nuevas.push({ talle_id: talleId, nombre: talle?.nombre ?? "", color_id: color.id, color_nombre: color.nombre, color_hex: color.hex, cantidad: "0" });
        }
      }
      onStockChange(nuevas);
    }
  }

  function toggleTalle(talle) {
    if (activeTalleIds.has(talle.id)) {
      onStockChange(stock.filter(r => r.talle_id !== talle.id));
    } else {
      const nuevas = [...stock];
      if (coloresSeleccionados.length > 0) {
        for (const color of coloresSeleccionados) {
          nuevas.push({ talle_id: talle.id, nombre: talle.nombre, color_id: color.id, color_nombre: color.nombre, color_hex: color.hex, cantidad: "0" });
        }
      } else {
        nuevas.push({ talle_id: talle.id, nombre: talle.nombre, color_id: null, color_nombre: null, color_hex: null, cantidad: "0" });
      }
      onStockChange(nuevas);
    }
  }

  function setCantidad(talle_id, color_id, qty) {
    onStockChange(stock.map(r =>
      r.talle_id === talle_id && r.color_id === color_id ? { ...r, cantidad: qty } : r
    ));
  }

  function getCantidad(talle_id, color_id) {
    return stock.find(r => r.talle_id === talle_id && r.color_id === color_id)?.cantidad ?? "0";
  }

  return (
    <div className="space-y-7">

      {/* Paso 1 — Colores */}
      <div>
        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">
          1 · Colores disponibles
        </p>
        <p className="mb-3 text-xs text-muted">Si el artículo no varía por color, dejá todos sin seleccionar.</p>

        {coloresCatalogo.length === 0 ? (
          <p className="text-xs text-muted">
            No hay colores configurados.{" "}
            <a href="/admin/catalogos" target="_blank" className="text-navy underline underline-offset-2">
              Agregalos en Catálogos →
            </a>
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {coloresCatalogo.map(c => {
              const isOn = coloresSeleccionados.some(s => s.id === c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleColor(c)}
                  title={c.nombre}
                  className={[
                    "group relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    isOn ? "border-navy shadow-md scale-110" : "border-transparent hover:border-navy/30 hover:scale-105",
                  ].join(" ")}
                >
                  <div className="h-8 w-8 rounded-full shadow-inner" style={{ backgroundColor: c.hex ?? "#e5e7eb" }} />
                  {isOn && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-navy/20">
                      <Check size={13} className="text-white drop-shadow" />
                    </span>
                  )}
                  <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[9px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {c.nombre}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Paso 2 — Talles */}
      <div>
        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">
          2 · Talles disponibles
        </p>
        <p className="mb-3 text-xs text-muted">Seleccioná los talles en que está disponible este artículo.</p>

        {tallesCatalogo.length === 0 ? (
          <p className="text-xs text-muted">No hay talles configurados.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tallesCatalogo.map(t => {
              const isOn = activeTalleIds.has(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTalle(t)}
                  className={[
                    "rounded-xl border px-4 py-2 text-sm font-bold transition-all",
                    isOn
                      ? "border-navy bg-navy text-white shadow-sm"
                      : "border-line bg-surface text-muted hover:border-navy/40 hover:text-ink",
                  ].join(" ")}
                >
                  {t.nombre}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Paso 3 — Grilla de stock */}
      {activeTalleIds.size > 0 && (
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">
            3 · Stock
          </p>
          <p className="mb-3 text-xs text-muted">
            {sinColores
              ? "Cantidad disponible por talle."
              : "Cantidad disponible por talle y color. Dejá en 0 si esa combinación no está disponible."}
          </p>

          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted w-24">
                    Talle
                  </th>
                  {sinColores ? (
                    <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted">
                      Cantidad
                    </th>
                  ) : (
                    coloresSeleccionados.map(c => (
                      <th key={c.id} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span
                            className="h-5 w-5 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: c.hex ?? "#e5e7eb" }}
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted whitespace-nowrap">
                            {c.nombre}
                          </span>
                        </div>
                      </th>
                    ))
                  )}
                </tr>
              </thead>

              <tbody>
                {activeTalles.map((t, i) => (
                  <tr key={t.id} className={["border-b border-line last:border-0", i % 2 === 0 ? "bg-card" : "bg-surface"].join(" ")}>
                    <td className="px-4 py-3 font-black text-ink">{t.nombre}</td>

                    {sinColores ? (
                      <td className="px-4 py-3 text-center">
                        <CantidadInput
                          value={getCantidad(t.id, null)}
                          onChange={v => setCantidad(t.id, null, v)}
                        />
                      </td>
                    ) : (
                      coloresSeleccionados.map(c => (
                        <td key={c.id} className="px-4 py-3 text-center">
                          <CantidadInput
                            value={getCantidad(t.id, c.id)}
                            onChange={v => setCantidad(t.id, c.id, v)}
                          />
                        </td>
                      ))
                    )}
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t-2 border-line bg-surface">
                  <td className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted">Total</td>
                  {sinColores ? (
                    <td className="px-4 py-2.5 text-center text-sm font-black text-ink">
                      {totalStock} <span className="text-[10px] font-semibold text-muted">uds</span>
                    </td>
                  ) : (
                    coloresSeleccionados.map(c => (
                      <td key={c.id} className="px-4 py-2.5 text-center text-sm font-black text-ink">
                        {stock.filter(r => r.color_id === c.id).reduce((s, r) => s + (Number(r.cantidad) || 0), 0)}{" "}
                        <span className="text-[10px] font-semibold text-muted">uds</span>
                      </td>
                    ))
                  )}
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="mt-2 text-xs font-semibold text-emerald-600">
            Stock total: {totalStock} unidades
          </p>
        </div>
      )}

      {activeTalleIds.size === 0 && (
        <div className="rounded-xl border border-dashed border-line bg-surface/50 py-8 text-center">
          <p className="text-sm text-muted">Seleccioná al menos un talle para cargar el stock</p>
        </div>
      )}
    </div>
  );
}

function CantidadInput({ value, onChange }) {
  return (
    <input
      type="number"
      min="0"
      value={value}
      onChange={e => onChange(e.target.value)}
      className={[
        "w-20 rounded-lg border border-line bg-white px-2 py-1.5 text-center text-sm font-bold focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/20",
        "[appearance:textfield] [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden",
        Number(value) === 0 ? "text-rose-400" : "text-emerald-600",
      ].join(" ")}
    />
  );
}
