import { Plus, Trash2 } from "lucide-react";
import { ANNOUNCEMENT_ICONS } from "./home_config_helpers";
import { EmojiPicker } from "./emoji_picker";

function AnnouncementEditor({ items, onChange }) {
  function setItem(i, upd) {
    onChange(items.map((item, idx) => (idx === i ? { ...item, ...upd } : item)));
  }
  function remove(i) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...items, { icon: "sparkles", text: "", accent: "" }]);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        El ticker superior del sitio muestra estos mensajes en loop.
      </p>

      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5">
          {/* Ícono */}
          <select
            value={item.icon}
            onChange={(e) => setItem(i, { icon: e.target.value })}
            className="h-8 shrink-0 rounded-lg border border-line bg-card px-2 text-xs text-ink focus:border-navy focus:outline-none"
          >
            {ANNOUNCEMENT_ICONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Texto principal + emoji */}
          <div className="relative min-w-0 flex-1">
            <input
              value={item.text}
              onChange={(e) => setItem(i, { text: e.target.value })}
              className="w-full bg-transparent pr-7 text-sm text-ink placeholder:text-muted/50 focus:outline-none"
              placeholder="Texto del anuncio…"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <EmojiPicker onPick={(e) => setItem(i, { text: item.text + e })} />
            </div>
          </div>

          {/* Divisor */}
          <span className="h-4 w-px shrink-0 bg-line" />

          {/* Texto acento + emoji */}
          <div className="relative w-28 shrink-0">
            <input
              value={item.accent ?? ""}
              onChange={(e) => setItem(i, { accent: e.target.value })}
              className="w-full bg-transparent pr-7 text-sm font-semibold text-champagne placeholder:text-muted/40 focus:outline-none"
              placeholder="Acento"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <EmojiPicker onPick={(e) => setItem(i, { accent: (item.accent ?? "") + e })} />
            </div>
          </div>

          {/* Eliminar */}
          <button
            type="button"
            onClick={() => remove(i)}
            className="shrink-0 text-muted transition-colors hover:text-rose-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 rounded-xl border border-dashed border-line px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-navy/40 hover:text-navy"
      >
        <Plus size={12} /> Agregar mensaje
      </button>
    </div>
  );
}

export { AnnouncementEditor };
