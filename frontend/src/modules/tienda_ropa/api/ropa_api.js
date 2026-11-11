import { http } from "../../../core/api/http.js";

// API del rubro tienda_ropa (servidor/src/modulos/tienda_ropa). Cada función devuelve `data`.
const datos = (promesa) => promesa.then((r) => r.data.data);
const respuesta = (promesa) => promesa.then((r) => r.data);
const publico = { publicAccess: true };

// ── Tienda (sin ingresar) ───────────────────────────────────────────────────────
export const getCategoriasTienda = () => datos(http.get("/ropa/catalogo/categorias", publico));
export const getFiltrosTienda = (categoria) => datos(http.get("/ropa/catalogo/filtros", { ...publico, params: categoria ? { categoria } : {} }));
export const getMarcasTienda = () => datos(http.get("/ropa/catalogo/marcas", publico));
export const getCatalogo = (filtros, signal) => datos(http.get("/ropa/catalogo/prendas", { ...publico, params: filtros, signal }));
export const getPrendaTienda = (slug) => datos(http.get(`/ropa/catalogo/prendas/${slug}`, publico));
export const enviarPedido = (pedido) => datos(http.post("/ropa/catalogo/pedidos", pedido, publico));

// ── Panel: listas (categorías, marcas, colores, talles) ─────────────────────────
export const getLista = (lista) => datos(http.get(`/ropa/panel/${lista}`));
export const guardarEnLista = (lista, { id, ...item }) => respuesta(id ? http.put(`/ropa/panel/${lista}/${id}`, item) : http.post(`/ropa/panel/${lista}`, item));
export const eliminarDeLista = (lista, id) => respuesta(http.delete(`/ropa/panel/${lista}/${id}`));
export const cargarSugeridos = (lista) => respuesta(http.post(`/ropa/panel/${lista}/sugeridos`));

// ── Panel: prendas ──────────────────────────────────────────────────────────────
export const getPrendasPanel = (filtros) => datos(http.get("/ropa/panel/prendas", { params: filtros }));
export const getPrendaPanel = (id) => datos(http.get(`/ropa/panel/prendas/${id}`));
export const guardarPrenda = ({ id, ...prenda }) => respuesta(id ? http.put(`/ropa/panel/prendas/${id}`, prenda) : http.post("/ropa/panel/prendas", prenda));
export const cambiarEstadoPrenda = (id, activo) => respuesta(http.patch(`/ropa/panel/prendas/${id}/estado`, { activo }));
export const eliminarPrenda = (id) => respuesta(http.delete(`/ropa/panel/prendas/${id}`));

// ── Panel: pedidos ──────────────────────────────────────────────────────────────
export const getPedidos = (filtros) => datos(http.get("/ropa/pedidos", { params: filtros }));
export const getPedido = (id) => datos(http.get(`/ropa/pedidos/${id}`));
export const getResumenPedidos = () => datos(http.get("/ropa/pedidos/resumen"));
export const cambiarEstadoPedido = (id, cambio) => respuesta(http.patch(`/ropa/pedidos/${id}/estado`, cambio));
export const marcarPagado = (id) => respuesta(http.post(`/ropa/pedidos/${id}/pagado`));
export const aceptarComprobante = (id, comprobanteId) => respuesta(http.post(`/ropa/pedidos/${id}/comprobantes/${comprobanteId}/aceptar`));
export const rechazarComprobante = (id, comprobanteId, motivo) => respuesta(http.post(`/ropa/pedidos/${id}/comprobantes/${comprobanteId}/rechazar`, { motivo }));
export const enlaceComprobantePanel = (id, comprobanteId) => datos(http.get(`/ropa/pedidos/${id}/comprobantes/${comprobanteId}/enlace`));

// ── Cuenta del cliente (ROP-40 a ROP-53) ────────────────────────────────────────
export const getMisDatos = () => datos(http.get("/ropa/mi-cuenta/datos"));
export const guardarMisDatos = (valores) => respuesta(http.put("/ropa/mi-cuenta/datos", valores));
export const getMisPedidos = () => datos(http.get("/ropa/mi-cuenta/pedidos"));
export const getMiPedido = (id) => datos(http.get(`/ropa/mi-cuenta/pedidos/${id}`));
export const enviarPedidoCuenta = (pedido) => respuesta(http.post("/ropa/mi-cuenta/pedidos", pedido));
export const cancelarMiPedido = (id, motivo) => respuesta(http.post(`/ropa/mi-cuenta/pedidos/${id}/cancelar`, { motivo }));
export function subirComprobante(id, archivo) {
  const formulario = new FormData();
  formulario.append("archivo", archivo);
  return respuesta(http.post(`/ropa/mi-cuenta/pedidos/${id}/comprobantes`, formulario));
}
export const enlaceMiComprobante = (id, comprobanteId) => datos(http.get(`/ropa/mi-cuenta/pedidos/${id}/comprobantes/${comprobanteId}/enlace`));
