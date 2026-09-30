import { disponibles, iniciarPago, pagosDelPedido, procesarAviso } from "./pagos_servicio.js";

export const verDisponibles = (req, res) => res.json({ ok: true, data: disponibles() });

export async function iniciar(req, res) {
  const data = await iniciarPago({ pedido_id: req.datos.params.id, usuario: req.usuario, proveedor: req.datos.body.proveedor });
  res.status(201).json({ ok: true, data });
}

export async function delPedido(req, res) {
  res.json({ ok: true, data: await pagosDelPedido(req.datos.params.id) });
}

// El proveedor solo necesita un 200 rápido; si no lo recibe, reintenta más tarde.
export async function aviso(req, res) {
  const data = await procesarAviso({ proveedor: req.datos.params.proveedor, headers: req.headers, query: req.datos.query, body: req.datos.body });
  res.json({ ok: true, data });
}
