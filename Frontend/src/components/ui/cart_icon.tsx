import { ShoppingBag } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useCart } from "../../context/cart_context";

export default function CartIcon() {
  const { cantidadItems } = useCart();

  return (
    <NavLink
      to="/carrito"
      aria-label="Ver carrito"
      className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-navy/10"
    >
      <ShoppingBag size={20} />
      {cantidadItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-0.5 text-[9px] font-black text-white">
          {cantidadItems > 99 ? "99+" : cantidadItems}
        </span>
      )}
    </NavLink>
  );
}
