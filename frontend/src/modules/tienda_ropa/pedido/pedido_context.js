import { createContext, useContext } from "react";

// Separado del proveedor (pedido_provider.jsx) para que el recargado en caliente de Vite siga andando.
export const PedidoContext = createContext(null);

export function usePedido() {
  const pedido = useContext(PedidoContext);
  if (!pedido) throw new Error("Falta PedidoProvider (lo monta pantallas del rubro tienda_ropa)");
  return pedido;
}
