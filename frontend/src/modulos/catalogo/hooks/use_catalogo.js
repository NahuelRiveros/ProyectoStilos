import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/catalogo_api.js";

export const catalogoKeys = {
  todo: ["catalogo"],
  categorias: () => ["catalogo", "categorias"],
  marcas: () => ["catalogo", "marcas"],
  colores: () => ["catalogo", "colores"],
  gruposTalle: () => ["catalogo", "grupos-talle"],
  productos: () => ["catalogo", "productos"],
  listaProductos: (filtros) => ["catalogo", "productos", "lista", filtros],
  filtrosDisponibles: (filtros) => ["catalogo", "productos", "filtros", filtros],
  producto: (clave) => ["catalogo", "productos", "detalle", String(clave)],
};

export function useCategorias() {
  return useQuery({ queryKey: catalogoKeys.categorias(), queryFn: api.listarCategorias, staleTime: 60_000 });
}

export const useMarcas = () => useQuery({ queryKey: catalogoKeys.marcas(), queryFn: api.listarMarcas, staleTime: 60_000 });
export const useColores = () => useQuery({ queryKey: catalogoKeys.colores(), queryFn: api.listarColores, staleTime: 60_000 });
export const useGruposTalle = () => useQuery({ queryKey: catalogoKeys.gruposTalle(), queryFn: api.listarGruposTalle, staleTime: 60_000 });

export function useProductos(filtros) {
  return useQuery({
    queryKey: catalogoKeys.listaProductos(filtros),
    queryFn: () => api.listarProductos(filtros),
    placeholderData: keepPreviousData, // la tabla no parpadea al cambiar de página
  });
}

// Los filtros no parpadean al cambiar de categoría: se ven los anteriores hasta que llegan los nuevos.
export function useFiltrosDisponibles(filtros) {
  return useQuery({
    queryKey: catalogoKeys.filtrosDisponibles(filtros),
    queryFn: () => api.listarFiltrosDisponibles(filtros),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useProducto(clave, { enabled = true } = {}) {
  return useQuery({ queryKey: catalogoKeys.producto(clave), queryFn: () => api.obtenerProducto(clave), enabled: enabled && clave != null });
}

// Cualquier cambio en el catálogo invalida categorías (conteos) y productos.
function useMutacionCatalogo(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogoKeys.todo }),
  });
}

export const useGuardarCategoria = () => useMutacionCatalogo((datos) => (datos.id ? api.actualizarCategoria(datos) : api.crearCategoria(datos)));
export const useEliminarCategoria = () => useMutacionCatalogo(api.eliminarCategoria);
export const useDuplicarCategoria = () => useMutacionCatalogo(api.duplicarCategoria);
export const useGuardarMarca = () => useMutacionCatalogo((datos) => (datos.id ? api.actualizarMarca(datos) : api.crearMarca(datos)));
export const useEliminarMarca = () => useMutacionCatalogo(api.eliminarMarca);
export const useSubirLogoMarca = () => useMutacionCatalogo(api.subirLogoMarca);
export const useLogoMarcaPorUrl = () => useMutacionCatalogo(api.logoMarcaPorUrl);
export const useQuitarLogoMarca = () => useMutacionCatalogo(api.quitarLogoMarca);
export const useCargarColoresSugeridos = () => useMutacionCatalogo(api.cargarColoresSugeridos);
export const useGuardarColor = () => useMutacionCatalogo((datos) => (datos.id ? api.actualizarColor(datos) : api.crearColor(datos)));
export const useEliminarColor = () => useMutacionCatalogo(api.eliminarColor);
export const useGuardarGrupoTalle = () => useMutacionCatalogo((datos) => (datos.id ? api.actualizarGrupoTalle(datos) : api.crearGrupoTalle(datos)));
export const useEliminarGrupoTalle = () => useMutacionCatalogo(api.eliminarGrupoTalle);
export const useCargarGruposSugeridos = () => useMutacionCatalogo(api.cargarGruposSugeridos);
export const useGuardarProducto =() => useMutacionCatalogo((datos) => (datos.id ? api.actualizarProducto(datos) : api.crearProducto(datos)));
export const useCambiarEstadoProducto = () => useMutacionCatalogo(api.cambiarEstadoProducto);
export const useEliminarProducto = () => useMutacionCatalogo(api.eliminarProducto);

// La vista previa (simular) no cambia nada: solo se invalida al aplicar.
export function useAjustarPrecios() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.ajustarPrecios,
    onSuccess: (resultado) => {
      if (resultado.aplicado) queryClient.invalidateQueries({ queryKey: catalogoKeys.todo });
    },
  });
}

export const useSubirImagen = () => useMutacionCatalogo(api.subirImagen);
export const useAgregarImagenUrl = () => useMutacionCatalogo(api.agregarImagenUrl);
export const useOrdenarImagenes = () => useMutacionCatalogo(api.ordenarImagenes);
export const useEliminarImagen = () => useMutacionCatalogo(api.eliminarImagen);
export const useCambiarColorImagen = () => useMutacionCatalogo(api.cambiarColorImagen);
