import { Plus, Trash2 } from "lucide-react";
import { type Talle } from "../../../api/catalogo_api";

export interface StockEdit {
  talle_id: number | null;
  nombre:   string;
  cantidad: string;
}

export function StockSection({
  rows,
  tallesCatalogo,
  onSet,
  onAdd,
  onRemove,
}: {
  rows:           StockEdit[];
  tallesCatalogo: Talle[];
  onSet:          (i: number, field: "talle_id" | "cantidad", v: string) => void;
  onAdd:          () => void;
  onRemove:       (i: number) => void;
}) {
  const usedTalleIds = rows.map((r) => r.talle_id).filter(Boolean);
  const available    = tallesCatalogo.filter((t) => !usedTalleIds.includes(t.id));
  const totalStock   = rows.reduce((s, r) => s + (Number(r.cantidad) || 0), 0);

  return (
    <div>
      {rows.length === 0 ? (
        <p className="mb-3 text-xs text-muted">
          Sin talles — el producto tendrá stock general (sin desglose por talle).
        </p>
      ) : (
        <div className="mb-3 space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={row.talle_id ?? ""}
                onChange={(e) => onSet(i, "talle_id", e.target.value)}
                className="input-form flex-1"
              >
                <option value="">Sin talle</option>
                {tallesCatalogo.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                    disabled={usedTalleIds.includes(t.id) && row.talle_id !== t.id}
                  >
                    {t.nombre}
                  </option>
                ))}
              </select>

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
          ))}
        </div>
      )}

      {available.length > 0 && (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-xs font-semibold text-muted hover:border-navy/40 hover:text-navy"
        >
          <Plus size={12} /> Agregar talle
        </button>
      )}

      {totalStock > 0 && (
        <p className="mt-3 text-xs text-emerald-600">
          Stock total: <strong>{totalStock}</strong> unidades
        </p>
      )}
    </div>
  );
}
