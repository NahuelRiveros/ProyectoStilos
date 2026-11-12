import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/ropa_api.js";

// Datos del rubro con TanStack Query: ningún componente hace fetch directo.
const MIN = 60 * 1000;

// ── Tienda ──────────────────────────────────────────────────────────────────────
export const useCategoriasTienda = () => useQuery({ queryKey: ["ropa", "tienda", "categorias"], queryFn: api.getCategoriasTienda, staleTime: 5 * MIN });
// ROP-28: las opciones dependen de la categoría; cambian poco, así que se cachean 5 minutos.
export const useFiltrosTienda = (categoria) => useQuery({ queryKey: ["ropa", "tienda", "filtros", categoria ?? null], queryFn: () => api.getFiltrosTienda(categoria), staleTime: 5 * MIN, placeholderData: keepPreviousData });
export const useMarcasTienda = () => useQuery({ queryKey: ["ropa", "tienda", "marcas"], queryFn: api.getMarcasTienda, staleTime: 5 * MIN });
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
/** Acciones del panel sobre un pedido (ROP-54 a ROP-57). Cada una refresca listas y detalle. */
export function useAccionesPedido() {
  const onSuccess = useRefrescar();
  return {
    estado: useMutation({ mutationFn: ({ id, ...cambio }) => api.cambiarEstadoPedido(id, cambio), onSuccess }),
    pagado: useMutation({ mutationFn: api.marcarPagado, onSuccess }),
    aceptar: useMutation({ mutationFn: ({ id, comprobanteId }) => api.aceptarComprobante(id, comprobanteId), onSuccess }),
    rechazar: useMutation({ mutationFn: ({ id, comprobanteId, motivo }) => api.rechazarComprobante(id, comprobanteId, motivo), onSuccess }),
    enlace: useMutation({ mutationFn: ({ id, comprobanteId }) => api.enlaceComprobantePanel(id, comprobanteId) }),
  };
}

// ── Cuenta del cliente ──────────────────────────────────────────────────────────
export const useMisDatos = (activo = true) => useQuery({ queryKey: ["ropa", "cuenta", "datos"], queryFn: api.getMisDatos, enabled: activo, staleTime: 5 * MIN });
export const useMisPedidos = () => useQuery({ queryKey: ["ropa", "cuenta", "pedidos"], queryFn: api.getMisPedidos });
// ROP-66: el estado se actualiza al volver a la pestaña; sin consultas periódicas (la base cobra despierta).
export const useMiPedido = (id) => useQuery({ queryKey: ["ropa", "cuenta", "pedido", id], queryFn: () => api.getMiPedido(id), enabled: Boolean(id), staleTime: 30 * 1000, refetchOnWindowFocus: true });
export const useSeguimiento = (clave) => useQuery({ queryKey: ["ropa", "seguimiento", clave], queryFn: () => api.getSeguimiento(clave), enabled: Boolean(clave), staleTime: 30 * 1000, refetchOnWindowFocus: true, retry: false });

export function useAccionesCuenta() {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: ["ropa", "cuenta"] });
  return {
    guardarDatos: useMutation({ mutationFn: api.guardarMisDatos, onSuccess }),
    enviar: useMutation({ mutationFn: api.enviarPedidoCuenta, onSuccess }),
    cancelar: useMutation({ mutationFn: ({ id, motivo }) => api.cancelarMiPedido(id, motivo), onSuccess }),
    subir: useMutation({ mutationFn: ({ id, archivo }) => api.subirComprobante(id, archivo), onSuccess }),
    enlace: useMutation({ mutationFn: ({ id, comprobanteId }) => api.enlaceMiComprobante(id, comprobanteId) }),
  };
}

/** El mensaje en español que manda el servidor, o uno genérico. */
export const mensajeError = (error, porDefecto) => error?.response?.data?.mensaje ?? porDefecto;
