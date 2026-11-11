import { NavLink } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { usePedido } from "./pedido_context.js";

/** Bolsa del navbar con la cantidad de prendas del pedido. */
export default function PedidoIcono() {
  const { unidades } = usePedido();
  return (
    <NavLink
      to="/pedido"
      aria-label={`Ver mi pedido, ${unidades} ${unidades === 1 ? "prenda" : "prendas"}`}
      className="relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors hover:bg-(--kt-turquoise-soft)"
    >
      <ShoppingBag size={22} aria-hidden="true" />
      {unidades > 0 && (
        <span key={unidades} className="kt-item-in absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--kt-accent-comercial) px-1 text-[11px] font-bold text-white">
          {unidades > 99 ? "99+" : unidades}
        </span>
      )}
    </NavLink>
  );
}
