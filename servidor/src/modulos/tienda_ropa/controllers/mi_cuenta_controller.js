import { misDatos, guardarMisDatos } from "../services/cuenta_service.js";
import { crearPedidoCuenta, misPedidos, miPedido, cancelarMiPedido } from "../services/pedidos_service.js";
import { subirComprobante, enlaceComprobante } from "../services/comprobantes_service.js";

// Cuenta del cliente (ROP-41 a ROP-53). Entrada validada en req.datos; el dueño lo controla el servicio.

const ok = (res, data, mensaje, estado = 200) => res.status(estado).json({ ok: true, mensaje, data });
const id = (req) => req.datos.params.id;

export const misDatosController = async (req, res) => ok(res, await misDatos(req.user));
export const guardarMisDatosController = async (req, res) => ok(res, await guardarMisDatos(req.user, req.datos.body), "Guardamos tus datos.");
export const misPedidosController = async (req, res) => ok(res, await misPedidos(req.user.usuario_id));
export const miPedidoController = async (req, res) => ok(res, await miPedido(req.user.usuario_id, id(req)));

export async function crearPedidoCuentaController(req, res) {
  const data = await crearPedidoCuenta(req.user, req.datos.body);
  return ok(res, data, `Pedido ${data.numero} recibido.`, 201);
}

export const cancelarMiPedidoController = async (req, res) =>
  ok(res, await cancelarMiPedido(req.user.usuario_id, id(req), req.datos.body.motivo), "Cancelaste el pedido.");

export async function subirComprobanteController(req, res) {
  await subirComprobante(req.user.usuario_id, id(req), req.file);
  return ok(res, await miPedido(req.user.usuario_id, id(req)), "Recibimos tu comprobante. Lo revisamos y te avisamos.", 201);
}

export const enlaceComprobanteController = async (req, res) =>
  ok(res, await enlaceComprobante(req.user, req.datos.params.id, req.datos.params.comprobanteId));
