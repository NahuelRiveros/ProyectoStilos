import { listarPedidos, obtenerPedido, cambiarEstadoPedido, contarNuevos, marcarPagado } from "../services/pedidos_service.js";
import { aceptarComprobante, rechazarComprobante, enlaceComprobante } from "../services/comprobantes_service.js";
import { ETIQUETA_ESTADO } from "../reglas.js";

// Pedidos en el panel (ROP-54 a ROP-57). Entrada validada en req.datos.

const ok = (res, data, mensaje) => res.json({ ok: true, mensaje, data });
const id = (req) => req.datos.params.id;

export const listarPedidosController = async (req, res) => ok(res, await listarPedidos(req.datos.query));
export const obtenerPedidoController = async (req, res) => ok(res, await obtenerPedido(id(req)));
export const resumenPedidosController = async (_req, res) => ok(res, { nuevos: await contarNuevos() });

export async function estadoPedidoController(req, res) {
  const data = await cambiarEstadoPedido(id(req), req.datos.body, req.user.usuario_id);
  return ok(res, data, `Pedido ${data.numero}: ${ETIQUETA_ESTADO[data.estado]}.`);
}

export const pagadoController = async (req, res) => ok(res, await marcarPagado(id(req), req.user.usuario_id), "Pago registrado.");

export async function aceptarComprobanteController(req, res) {
  const { id: pedido, comprobanteId } = req.datos.params;
  const confirmo = await aceptarComprobante(pedido, comprobanteId, req.user.usuario_id);
  return ok(res, await obtenerPedido(pedido), confirmo ? "Pago aceptado: el pedido quedó Confirmado." : "Pago aceptado.");
}

export async function rechazarComprobanteController(req, res) {
  const { id: pedido, comprobanteId } = req.datos.params;
  await rechazarComprobante(pedido, comprobanteId, req.user.usuario_id, req.datos.body.motivo);
  return ok(res, await obtenerPedido(pedido), "Comprobante rechazado. Le avisamos al cliente.");
}

export const enlaceComprobanteController = async (req, res) =>
  ok(res, await enlaceComprobante(req.user, req.datos.params.id, req.datos.params.comprobanteId));
