import { useState, useEffect, useRef } from "react";

const EMOJIS = [
  // Promos / destacados
  "✨","🔥","⚡","💯","🌟","💎","👑","🏆",
  "🎉","🎁","💝","🆕","🆓","🎀","💸","🪄",
  // Compras / logística
  "🛍","🛒","🚚","📦","💳","🔄","🏷","🏪",
  // Moda / estilo
  "👗","👠","👟","👜","💄","💅","🧥","🧣",
];

export function EmojiPicker({ onPick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Insertar emoji"
        className={[
          "flex h-6 w-6 items-center justify-center rounded-md text-sm transition-colors",
          open ? "bg-navy/10 text-navy" : "text-muted/60 hover:bg-surface hover:text-ink",
        ].join(" ")}
      >
        🙂
      </button>

      {open && (
        <div className="absolute bottom-full right-0 z-50 mb-1.5 w-60 rounded-xl border border-line bg-card p-2 shadow-xl">
          <p className="mb-1.5 px-1 text-[9px] font-black uppercase tracking-widest text-muted/60">
            Emojis
          </p>
          <div className="grid grid-cols-8 gap-0.5">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { onPick(emoji); setOpen(false); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-base hover:bg-surface transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
