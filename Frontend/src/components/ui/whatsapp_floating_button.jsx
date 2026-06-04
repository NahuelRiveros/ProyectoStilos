import { X, Trash2, MessageCircle, ShoppingBag } from "lucide-react";
import { useWhatsAppCart } from "../../context/whatsapp_cart_context";
import { abrirWhatsApp, buildWhatsAppMessage } from "../../config/whatsapp_config";
import { isWhatsAppMode } from "../../config/app_config";

const fmt = (n) => `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

function getImgSrc(img) {
  if (!img) return null;
  if (typeof img === "string") return img;
  return img.src ?? null;
}

export default function WhatsAppFloatingButton() {
  const { items, total, panelOpen, setPanelOpen, removeItem, clearCart } = useWhatsAppCart();

  if (!isWhatsAppMode() || items.length === 0) return null;

  function enviar() {
    const mensaje = buildWhatsAppMessage(items);
    abrirWhatsApp(mensaje);
  }

  return (
    <>
      {/* Panel */}
      {panelOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-80 overflow-hidden rounded-2xl border border-line bg-card shadow-2xl shadow-black/15 sm:right-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle size={15} className="text-emerald-500" />
              <p className="text-sm font-bold text-ink">
                Consulta WhatsApp
                <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-700">
                  {items.length}
                </span>
              </p>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-line hover:text-ink transition-colors"
            >
              <X size={13} />
            </button>
          </div>

          {/* Items */}
          <div className="max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-3 border-b border-line/60 px-4 py-2.5 last:border-0">
                <div className="h-11 w-9 shrink-0 overflow-hidden rounded-lg bg-surface">
                  {getImgSrc(item.imagen) ? (
                    <img src={getImgSrc(item.imagen)} alt={item.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag size={14} className="text-muted/30" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">{item.nombre}</p>
                  <p className="text-[10px] text-muted">
                    {[item.talle && `Talle ${item.talle}`, item.color].filter(Boolean).join(" · ") || "Sin especificar"}
                    {item.cantidad > 1 && <span className="ml-1 font-bold text-ink"> ×{item.cantidad}</span>}
                  </p>
                  <p className="text-[11px] font-bold text-ink">{fmt(item.precio)}</p>
                </div>
                <button
                  onClick={() => removeItem(item.key)}
                  className="shrink-0 text-muted transition-colors hover:text-rose-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-line bg-surface px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Total estimado</span>
              <span className="text-sm font-black text-ink">{fmt(total)}</span>
            </div>
            <button
              onClick={enviar}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-black text-white transition-all hover:bg-emerald-600 active:scale-[0.98]"
            >
              <MessageCircle size={15} />
              Enviar consulta
            </button>
            <button
              onClick={clearCart}
              className="w-full text-center text-[11px] text-muted underline underline-offset-2 hover:text-rose-500 transition-colors"
            >
              Vaciar lista
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95 sm:right-6"
        aria-label="Ver consulta WhatsApp"
      >
        <MessageCircle size={24} />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-navy text-[10px] font-black text-white">
          {items.length}
        </span>
      </button>
    </>
  );
}
