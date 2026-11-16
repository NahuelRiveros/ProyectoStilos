import { cn } from "../../../core/utils/cn.js";
import { enOferta, formatearPrecio } from "../utils/dinero.js";
import { porcentajeDescuento } from "../utils/home_tienda.js";

/** Precio de la prenda; si está en oferta, el anterior tachado al lado. */
export default function Precio({ prenda, grande = false, className }) {
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-bold text-(--kt-accent-comercial)", grande ? "text-2xl" : "text-sm")}>{formatearPrecio(prenda.precio)}</span>
      {enOferta(prenda) && (
        <s className={cn("text-(--kt-ink-soft)", grande ? "text-base" : "text-xs")}>
          <span className="sr-only">Antes: </span>{formatearPrecio(prenda.precio_anterior)}
        </s>
      )}
    </p>
  );
}

/** ROP-73: con la prenda, muestra el descuento ("-35%"); sin ella, "Oferta". */
export function EtiquetaOferta({ prenda, className }) {
  const pct = prenda ? porcentajeDescuento(prenda) : null;
  return <span className={cn("rounded-full bg-(--kt-accent-comercial) px-3 py-1 text-xs font-bold text-white", className)}>{pct ? `-${pct}%` : "Oferta"}</span>;
}
