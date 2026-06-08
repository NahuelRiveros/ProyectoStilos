import { Plus, Trash2 } from "lucide-react";

function ColorDot({ hex }) {
  if (!hex) return null;
  return (
    <span
      className="inline-block h-3 w-3 shrink-0 rounded-full border border-black/10"
      style={{ backgroundColor: hex }}
    />
  );
}

function StockSection({ rows, tallesCatalogo, coloresCatalogo = [], onSet, onAdd, onRemove }) {
  const totalStock = rows.reduce((s, r) => s + (Number(r.cantidad) || 0), 0);
  const tieneColores = coloresCatalogo.length > 0;

  return (
    <div>
      {rows.length === 0 ? (
        <p className="mb-3 text-xs text-muted">
          Sin variantes — el producto tendrá stock general (sin desglose por talle ni color).
        </p>
      ) : (
        <div className="mb-3 space-y-2">
          {rows.map((row, i) => {
            const colorActual = coloresCatalogo.find((c) => c.id === row.color_id);
            return (
              <div key={i} className="flex items-center gap-2">

                {/* Talle */}
                <select
                  value={row.talle_id ?? ""}
                  onChange={(e) => onSet(i, "talle_id", e.target.value)}
                  className="input-form flex-1"
                >
                  <option value="">Sin talle</option>
                  {tallesCatalogo.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>

                {/* Color (solo si hay catálogo de colores) */}
                {tieneColores && (
                  <div className="flex flex-1 items-center gap-1.5">
                    {colorActual?.hex && <ColorDot hex={colorActual.hex} />}
                    <select
                      value={row.color_id ?? ""}
                      onChange={(e) => onSet(i, "color_id", e.target.value)}
                      className="input-form min-w-0 flex-1"
                    >
                      <option value="">Sin color</option>
                      {coloresCatalogo.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Cantidad */}
                <div className="flex w-28 overflow-hidden rounded-xl border border-line bg-surface transition focus-within:border-navy focus-within:ring-1 focus-within:ring-navy/20">
                  <input
                    type="number"
                    min="0"
                    value={row.cantidad}
                    onChange={(e) => onSet(i, "cantidad", e.target.value)}
                    className={[
                      "min-w-0 flex-1 bg-transparent py-2 pl-3 text-sm font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden",
                      Number(row.cantidad) === 0 ? "text-rose-500" : "text-emerald-600",
                    ].join(" ")}
                  />
                  <span className="flex shrink-0 items-center pr-2.5 text-[10px] font-semibold text-muted select-none">uds</span>
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-xs font-semibold text-muted hover:border-navy/40 hover:text-navy"
      >
        <Plus size={12} /> Agregar variante
      </button>

      {totalStock > 0 && (
        <p className="mt-3 text-xs text-emerald-600">
          Stock total: <strong>{totalStock}</strong> unidades
        </p>
      )}
    </div>
  );
}

export { StockSection };
