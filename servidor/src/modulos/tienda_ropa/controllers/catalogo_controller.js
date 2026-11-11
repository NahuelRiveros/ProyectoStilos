import { arbolCategorias, opcionesDeFiltro, listarCatalogo, detallePrenda, marcasTienda } from "../services/catalogo_service.js";
import { crearPedido } from "../services/pedidos_service.js";

// Tienda pública. Entrada validada en req.datos; los errores los responde app.js.

export const categoriasController = async (_req, res) => res.json({ ok: true, data: await arbolCategorias() });
export const filtrosController = async (req, res) => res.json({ ok: true, data: await opcionesDeFiltro(req.datos.query) });
export const marcasController = async (_req, res) => res.json({ ok: true, data: await marcasTienda() });
export const listarController = async (req, res) => res.json({ ok: true, data: await listarCatalogo(req.datos.query) });
export const detalleController = async (req, res) => res.json({ ok: true, data: await detallePrenda(req.datos.params.slug) });

export async function enviarPedidoController(req, res) {
  const data = await crearPedido(req.datos.body);
  return res.status(201).json({ ok: true, codigo: "PEDIDO_ENVIADO", mensaje: `Pedido ${data.numero} registrado.`, data });
}
