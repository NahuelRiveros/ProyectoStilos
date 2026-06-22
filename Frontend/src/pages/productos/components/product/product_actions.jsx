import { ShoppingBag, MessageCircle, Check } from "lucide-react";

function SoldOutCard() {
  return (
    <div className="rounded-2xl border border-line bg-surface px-5 py-4 text-center">
      <ShoppingBag size={22} className="mx-auto mb-2 text-muted/30" />
      <p className="text-sm font-bold text-ink">Producto agotado</p>
      <p className="mt-0.5 text-xs text-muted">Por el momento no tenemos stock disponible.</p>
    </div>
  );
}

export default function ProductActions({
  isWhatsApp,
  isEcommerce,
  isSoldOut,
  agregado,
  hasTalles,
  talle,
  ctaType,
  deliveryNote,
  onConsultarAhora,
  onAgregarConsulta,
  onAgregarCarrito,
}) {
  if (isEcommerce && ctaType === "cart") {
    if (isSoldOut) return <SoldOutCard />;
    return (
      <div className="space-y-3 pt-1">
        <button
          onClick={onAgregarCarrito}
          disabled={hasTalles && !talle}
          className={[
            "btn btn-lg w-full",
            agregado ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "btn-primary",
            hasTalles && !talle ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        >
          {agregado
            ? <><Check size={18} /> ¡Agregado al carrito!</>
            : <><ShoppingBag size={18} /> Agregar al carrito</>}
        </button>
        {hasTalles && !talle && (
          <p className="text-center text-[11px] text-muted">Seleccioná un talle para continuar</p>
        )}
      </div>
    );
  }

  if (isWhatsApp) {
    if (isSoldOut) return <SoldOutCard />;
    return (
      <div className="space-y-3 pt-1">
        <button
          onClick={onConsultarAhora}
          className="btn btn-whatsapp btn-lg group relative w-full overflow-hidden"
        >
          <MessageCircle size={18} className="shrink-0" />
          Consultar por WhatsApp
          <span aria-hidden="true" className="absolute right-5 opacity-10 transition-all duration-300 group-hover:opacity-20 group-hover:translate-x-1">
            <MessageCircle size={32} />
          </span>
        </button>

        <button
          onClick={onAgregarConsulta}
          className={[
            "btn w-full",
            agregado
              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
              : "btn-secondary hover:border-emerald-400/60 hover:bg-emerald-50/60 hover:text-emerald-700",
          ].join(" ")}
        >
          {agregado
            ? <Check size={15} className="text-emerald-600" />
            : <MessageCircle size={15} className="text-muted" />}
          {agregado ? "¡Listo! Producto en la lista" : "Agregar a lista de consulta"}
        </button>

        {deliveryNote && (
          <p className="text-center text-[10px] text-muted">{deliveryNote}</p>
        )}
      </div>
    );
  }

  return null;
}
