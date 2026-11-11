import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/ropa_api.js";

// Datos del rubro con TanStack Query: ningún componente hace fetch directo.
const MIN = 60 * 1000;

// ── Tienda ──────────────────────────────────────────────────────────────────────
export const useCategoriasTienda = () => useQuery({ queryKey: ["ropa", "tienda", "categorias"], queryFn: api.getCategoriasTienda, staleTime: 5 * MIN });
export const useFiltrosTienda = () => useQuery({ queryKey: ["ropa", "tienda", "filtros"], queryFn: api.getFiltrosTienda, staleTime: 5 * MIN });
export const useCatalogo = (filtros) => useQuery({
  queryKey: ["ropa", "tienda", "prendas", filtros],
  queryFn: ({ signal }) => api.getCatalogo(filtros, signal),
  staleTime: MIN, placeholderData: keepPreviousData,
});
export const usePrendaTienda = (slug) => useQuery({ queryKey: ["ropa", "tienda", "prenda", slug], queryFn: () => api.getPrendaTienda(slug), staleTime: MIN });
export const useEnviarPedido = () => useMutation({ mutationFn: api.enviarPedido });

// ── Panel ───────────────────────────────────────────────────────────────────────
/** Lo que cambia en el panel también cambia lo que ve la tienda: se refrescan los dos. */
function useRefrescar() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["ropa"] });
}

export const useLista = (lista) => useQuery({ queryKey: ["ropa", "panel", lista], queryFn: () => api.getLista(lista) });

export function useGestionLista(lista) {
  const onSuccess = useRefrescar();
  return {
    guardar: useMutation({ mutationFn: (item) => api.guardarEnLista(lista, item), onSuccess }),
    eliminar: useMutation({ mutationFn: (id) => api.eliminarDeLista(lista, id), onSuccess }),
    sugeridos: useMutation({ mutationFn: () => api.cargarSugeridos(lista), onSuccess }),
  };
}

export const usePrendasPanel = (filtros) => useQuery({ queryKey: ["ropa", "panel", "prendas", filtros], queryFn: () => api.getPrendasPanel(filtros), placeholderData: keepPreviousData });
export const usePrendaPanel = (id) => useQuery({ queryKey: ["ropa", "panel", "prenda", id], queryFn: () => api.getPrendaPanel(id), enabled: Boolean(id) });

export function useGestionPrendas() {
  const onSuccess = useRefrescar();
  return {
    guardar: useMutation({ mutationFn: api.guardarPrenda, onSuccess }),
    cambiarEstado: useMutation({ mutationFn: ({ id, activo }) => api.cambiarEstadoPrenda(id, activo), onSuccess }),
    eliminar: useMutation({ mutationFn: api.eliminarPrenda, onSuccess }),
  };
}

export const usePedidos = (filtros) => useQuery({ queryKey: ["ropa", "pedidos", filtros], queryFn: () => api.getPedidos(filtros), placeholderData: keepPreviousData });
export const usePedido = (id) => useQuery({ queryKey: ["ropa", "pedido", id], queryFn: () => api.getPedido(id), enabled: Boolean(id) });
export const useResumenPedidos = () => useQuery({ queryKey: ["ropa", "pedidos", "resumen"], queryFn: api.getResumenPedidos, staleTime: MIN });
export function useEstadoPedido() {
  const onSuccess = useRefrescar();
  return useMutation({ mutationFn: ({ id, estado }) => api.cambiarEstadoPedido(id, estado), onSuccess });
}

/** El mensaje en español que manda el servidor, o uno genérico. */
export const mensajeError = (error, porDefecto) => error?.response?.data?.mensaje ?? porDefecto;
