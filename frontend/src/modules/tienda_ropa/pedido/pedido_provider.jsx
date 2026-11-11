import { useCallback, useEffect, useMemo, useState } from "react";
import { clientConfig } from "../../../../../proyecto/client_config.js";
import { PedidoContext } from "./pedido_context.js";
import { agregarLinea, cambiarCantidad, guardarPedido, leerPedido, quitarLinea, totalEstimado, unidades } from "./pedido_local.js";

const LIMITES = { maxLineas: clientConfig.tienda.maxCartLines, maxCantidad: clientConfig.tienda.maxQuantity };

/** Pedido del visitante (ROP-13), disponible en toda la tienda y guardado en el navegador. */
export default function PedidoProvider({ children }) {
  const [items, setItems] = useState(() => leerPedido(localStorage, { dias: clientConfig.tienda.cartTtlDays }));

  useEffect(() => { guardarPedido(localStorage, items); }, [items]);

  // Valida antes de guardar: si se pasa de un máximo lanza Error y quien la llama muestra el motivo.
  const agregar = useCallback((linea) => setItems(agregarLinea(items, linea, LIMITES)), [items]);
  const cambiar = useCallback((varianteId, cantidad) => setItems((actuales) => cambiarCantidad(actuales, varianteId, cantidad, LIMITES.maxCantidad)), []);
  const quitar = useCallback((varianteId) => setItems((actuales) => quitarLinea(actuales, varianteId)), []);
  const vaciar = useCallback(() => setItems([]), []);

  const valor = useMemo(() => ({
    items, agregar, cambiar, quitar, vaciar,
    unidades: unidades(items), total: totalEstimado(items), maxCantidad: LIMITES.maxCantidad,
  }), [items, agregar, cambiar, quitar, vaciar]);

  return <PedidoContext.Provider value={valor}>{children}</PedidoContext.Provider>;
}
