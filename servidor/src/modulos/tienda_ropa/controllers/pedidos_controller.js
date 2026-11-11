import { listarPedidos, obtenerPedido, cambiarEstadoPedido, contarNuevos } from "../services/pedidos_service.js";

// Pedidos recibidos (ROP-15). Entrada validada en req.datos.

export const listarPedidosController = async (req, res) => res.json({ ok: true, data: await listarPedidos(req.datos.query) });
export const obtenerPedidoController = async (req, res) => res.json({ ok: true, data: await obtenerPedido(req.datos.params.id) });
export const resumenPedidosController = async (_req, res) => res.json({ ok: true, data: { nuevos: await contarNuevos() } });

export async function estadoPedidoController(req, res) {
  const data = await cambiarEstadoPedido(req.datos.params.id, req.datos.body.estado);
  return res.json({ ok: true, mensaje: `Pedido ${data.numero} marcado como ${data.estado}.`, data });
}
