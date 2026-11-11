import { sequelize } from "../../../core/database/sequelize.js";
import { ErrorApp, noExiste } from "../../../core/services/common/errores.js";
import { normalizarPaginacion, armarPaginacion } from "../../../core/services/common/pagination.js";
import { ColorRopa, Talle, Prenda, PrendaVariante, PedidoWhatsapp, PedidoWhatsappItem } from "../models/index.js";

// Pedidos por WhatsApp (ROP-14 a ROP-16). El navegador manda solo variante y cantidad: nombres y
// precios salen de la base, así nadie puede pedir a otro precio.

const POR_PAGINA = 20;
export const numeroPedido = (id) => `#${String(id).padStart(5, "0")}`;
// Plata en centavos enteros: sumar decimales en coma flotante redondea mal.
const centavos = (monto) => Math.round(Number(monto) * 100);
const pesos = (cent) => (cent / 100).toFixed(2);

const conNumero = (pedido) => {
  const datos = pedido.toJSON ? pedido.toJSON() : pedido;
  return { ...datos, numero: numeroPedido(datos.id) };
};

export async function crearPedido({ nombre, celular, items }) {
  return sequelize.transaction(async (transaction) => {
    const variantes = await PrendaVariante.findAll({
      where: { id: items.map((i) => i.variante_id) },
      include: [
        { model: Prenda, as: "prenda", attributes: ["id", "nombre", "precio", "activo"] },
        { model: ColorRopa, as: "color", attributes: ["nombre"] },
        { model: Talle, as: "talle", attributes: ["nombre"] },
      ],
      transaction,
    });
    const porId = new Map(variantes.map((v) => [v.id, v]));

    const lineas = items.map(({ variante_id, cantidad }) => {
      const v = porId.get(variante_id);
      if (!v || !v.prenda.activo) throw new ErrorApp("NO_DISPONIBLE", "Una de las prendas de tu pedido ya no está a la venta. Sacala y volvé a enviar.", 409);
      // ROP-08: lo agotado no se puede pedir.
      if (!v.disponible) throw new ErrorApp("NO_DISPONIBLE", `${v.prenda.nombre} (${v.color.nombre}, talle ${v.talle.nombre}) se agotó. Sacala del pedido y volvé a enviar.`, 409);
      const precio = centavos(v.prenda.precio);
      return {
        prenda_id: v.prenda.id, nombre_prenda: v.prenda.nombre, color: v.color.nombre, talle: v.talle.nombre,
        cantidad, precio_unitario: pesos(precio), subtotal: pesos(precio * cantidad), _centavos: precio * cantidad,
      };
    });

    const total = lineas.reduce((suma, l) => suma + l._centavos, 0);
    const pedido = await PedidoWhatsapp.create({ nombre, celular, total: pesos(total) }, { transaction });
    await PedidoWhatsappItem.bulkCreate(lineas.map(({ _centavos, ...l }) => ({ ...l, pedido_id: pedido.id })), { transaction });
    return {
      id: pedido.id, numero: numeroPedido(pedido.id), nombre, celular, total: pesos(total),
      items: lineas.map(({ _centavos, prenda_id, ...l }) => l),
    };
  });
}

export async function listarPedidos({ estado, pagina }) {
  const { page, limit, offset } = normalizarPaginacion({ page: pagina, limit: POR_PAGINA });
  const { rows, count } = await PedidoWhatsapp.findAndCountAll({
    where: estado === "todos" ? {} : { estado },
    include: [{ model: PedidoWhatsappItem, as: "items", attributes: ["cantidad"] }],
    order: [["creado_en", "DESC"], ["id", "DESC"]],
    limit, offset, distinct: true,
  });
  const items = rows.map((p) => {
    const { items: lineas, ...datos } = conNumero(p);
    return { ...datos, unidades: lineas.reduce((suma, l) => suma + l.cantidad, 0) };
  });
  return { items, paginacion: armarPaginacion({ page, limit, total: count }) };
}

export async function obtenerPedido(id) {
  const pedido = await PedidoWhatsapp.findByPk(id, {
    include: [{ model: PedidoWhatsappItem, as: "items" }],
    order: [[{ model: PedidoWhatsappItem, as: "items" }, "id", "ASC"]],
  });
  if (!pedido) throw noExiste("El pedido no existe.");
  return conNumero(pedido);
}

export async function cambiarEstadoPedido(id, estado) {
  const pedido = await PedidoWhatsapp.findByPk(id);
  if (!pedido) throw noExiste("El pedido no existe.");
  await pedido.update({ estado, actualizado_en: new Date() });
  return conNumero(pedido);
}

/** Para el inicio del panel: cuántos esperan respuesta. */
export const contarNuevos = () => PedidoWhatsapp.count({ where: { estado: "nuevo" } });
