import { http } from "@/api/http.js";

// Categorías
export const listarCategorias = async () => (await http.get("/catalogo/categorias")).data.data;
export const crearCategoria = async (datos) => (await http.post("/catalogo/categorias", datos)).data.data;
export const actualizarCategoria = async ({ id, ...datos }) => (await http.put(`/catalogo/categorias/${id}`, datos)).data.data;
export const eliminarCategoria = async (id) => http.delete(`/catalogo/categorias/${id}`);
export const duplicarCategoria = async ({ id, ...datos }) => (await http.post(`/catalogo/categorias/${id}/duplicar`, datos)).data.data;

// Marcas, colores y grupos de talles
export const listarMarcas = async () => (await http.get("/catalogo/marcas")).data.data;
export const crearMarca = async (datos) => (await http.post("/catalogo/marcas", datos)).data.data;
export const actualizarMarca = async ({ id, ...datos }) => (await http.put(`/catalogo/marcas/${id}`, datos)).data.data;
export const eliminarMarca = async (id) => http.delete(`/catalogo/marcas/${id}`);
export async function subirLogoMarca({ id, archivo }) {
  const formulario = new FormData();
  formulario.append("logo", archivo);
  return (await http.post(`/catalogo/marcas/${id}/logo`, formulario, { timeout: 60_000 })).data.data;
}
export const logoMarcaPorUrl = async ({ id, url }) => (await http.put(`/catalogo/marcas/${id}/logo`, { url })).data.data;
export const quitarLogoMarca = async (id) => (await http.delete(`/catalogo/marcas/${id}/logo`)).data.data;

export const listarColores = async () => (await http.get("/catalogo/colores")).data.data;
export const crearColor = async (datos) => (await http.post("/catalogo/colores", datos)).data.data;
export const actualizarColor = async ({ id, ...datos }) => (await http.put(`/catalogo/colores/${id}`, datos)).data.data;
export const eliminarColor = async (id) => http.delete(`/catalogo/colores/${id}`);
export const cargarColoresSugeridos = async () => (await http.post("/catalogo/colores/sugeridos")).data.data;

export const listarGruposTalle = async () => (await http.get("/catalogo/grupos-talle")).data.data;
export const crearGrupoTalle = async (datos) => (await http.post("/catalogo/grupos-talle", datos)).data.data;
export const actualizarGrupoTalle = async ({ id, ...datos }) => (await http.put(`/catalogo/grupos-talle/${id}`, datos)).data.data;
export const eliminarGrupoTalle = async (id) => http.delete(`/catalogo/grupos-talle/${id}`);
export const cargarGruposSugeridos = async () => (await http.post("/catalogo/grupos-talle/sugeridos")).data.data;

// Productos
export async function listarProductos(filtros) {
  const { data } = await http.get("/catalogo/productos", { params: limpiar(filtros) });
  return { productos: data.data, paginacion: data.paginacion };
}
/** Marcas, colores y talles que hay en lo que se está viendo (para armar los filtros). */
export const listarFiltrosDisponibles = async (filtros) => (await http.get("/catalogo/productos/filtros", { params: limpiar(filtros) })).data.data;
export const obtenerProducto =async (clave) => (await http.get(`/catalogo/productos/${encodeURIComponent(clave)}`)).data.data;
export const crearProducto = async (datos) => (await http.post("/catalogo/productos", datos)).data.data;
export const actualizarProducto = async ({ id, ...datos }) => (await http.put(`/catalogo/productos/${id}`, datos)).data.data;
export const cambiarEstadoProducto = async ({ id, ...estado }) => (await http.patch(`/catalogo/productos/${id}/estado`, estado)).data.data;
export const eliminarProducto = async (id) => http.delete(`/catalogo/productos/${id}`);

// No mandar filtros vacíos (el servidor los rechazaría o los trataría como valor).
function limpiar(filtros = {}) {
  return Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== undefined && v !== null && v !== ""));
}

// Precios
export const ajustarPrecios = async (datos) => (await http.post("/catalogo/precios/ajuste", datos)).data.data;

// Imágenes
// color_id (indumentaria): de qué color es la foto; sin color = foto general.
export async function subirImagen({ productoId, archivo, color_id = null }) {
  const formulario = new FormData();
  formulario.append("imagen", archivo);
  if (color_id) formulario.append("color_id", String(color_id));
  return (await http.post(`/catalogo/productos/${productoId}/imagenes`, formulario, { timeout: 60_000 })).data.data;
}
export const agregarImagenUrl = async ({ productoId, ...datos }) => (await http.post(`/catalogo/productos/${productoId}/imagenes/url`, datos)).data.data;
export const cambiarColorImagen = async ({ productoId, imagenId, color_id }) =>
  (await http.patch(`/catalogo/productos/${productoId}/imagenes/${imagenId}`, { color_id })).data.data;
export const ordenarImagenes = async ({ productoId, ids }) => (await http.put(`/catalogo/productos/${productoId}/imagenes/orden`, { ids })).data.data;
export const eliminarImagen = async ({ productoId, imagenId }) => http.delete(`/catalogo/productos/${productoId}/imagenes/${imagenId}`);
