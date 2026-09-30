import { useMutation, useQuery } from "@tanstack/react-query";
import * as api from "../api/pagos_api.js";

export const pagosKeys = {
  disponibles: () => ["pagos_online", "disponibles"],
  delPedido: (id) => ["pagos_online", "pedido", String(id)],
};

// Las credenciales no cambian mientras se navega: se pregunta una vez.
export const useDisponiblesPagos = () => useQuery({ queryKey: pagosKeys.disponibles(), queryFn: api.verDisponibles, staleTime: Infinity });

export const usePagosDelPedido = (id) => useQuery({ queryKey: pagosKeys.delPedido(id), queryFn: () => api.verPagosDelPedido(id) });

// Al tener el link se sale de la tienda hacia el proveedor: no hay nada que invalidar.
export const useIniciarPago = () => useMutation({ mutationFn: api.iniciarPago });
