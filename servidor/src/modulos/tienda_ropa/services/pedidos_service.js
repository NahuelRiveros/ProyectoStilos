import { randomBytes } from "node:crypto";
import { Op, UniqueConstraintError } from "sequelize";
import { sequelize } from "../../../core/database/sequelize.js";
import { ErrorApp, noExiste } from "../../../core/services/common/errores.js";
import { normalizarPaginacion, armarPaginacion } from "../../../core/services/common/pagination.js";
import { Persona } from "../../../core/models/index.js";
import {
  ColorRopa, Talle, Prenda, PrendaVariante, PedidoWhatsapp, PedidoWhatsappItem, PedidoRopaHistorial, PedidoRopaComprobante,
} from "../models/index.js";
import { avisaAlCliente, esEnvioGratis, pideMotivo, problemaTransicion, proximoPaso, transferenciaDisponible } from "../reglas.js";
import { clientConfig } from "../../../../../proyecto/client_config.js";
import { avisarCambioEstado, avisarCancelacionCliente, avisarPedidoNuevo } from "./avisos_service.js";

// Pedidos (ROP-14 a ROP-18 y spec 2026-11-cuentas-y-transferencias.md). El navegador manda solo
// variante y cantidad: nombres y precios salen de la base, así nadie puede pedir a otro precio.

const POR_PAGINA = 20;
export const numeroPedido = (id) => `#${String(id).padStart(5, "0")}`;
// Plata en centavos enteros: sumar decimales en coma flotante redondea mal.
const centavos = (monto) => Math.round(Number(monto) * 100);
const pesos = (cent) => (cent / 100).toFixed(2);

/** Lo que se muestra de un pedido: sin el id privado de los comprobantes y con el próximo paso. */
function vista(pedido) {
  const datos = pedido.toJSON ? pedido.toJSON() : pedido;
  const { comprobantes, ...resto } = datos;
  return {
    ...resto,
    numero: numeroPedido(datos.id),
    proximo: proximoPaso(datos),
    ...(comprobantes && { comprobantes: comprobantes.map(({ public_id: _privado, ...c }) => c) }),
  };
}

/** Líneas con nombre, color, talle y precio de la base; rechaza lo agotado (ROP-08) o fuera de venta. */
async function armarLineas(items, transaction) {
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
  return items.map(({ variante_id, cantidad }) => {
    const v = porId.get(variante_id);
    if (!v || !v.prenda.activo) throw new ErrorApp("NO_DISPONIBLE", "Una de las prendas de tu pedido ya no está a la venta. Sacala y volvé a enviar.", 409);
    if (!v.disponible) throw new ErrorApp("NO_DISPONIBLE", `${v.prenda.nombre} (${v.color.nombre}, talle ${v.talle.nombre}) se agotó. Sacala del pedido y volvé a enviar.`, 409);
    const precio = centavos(v.prenda.precio);
    return {
      prenda_id: v.prenda.id, nombre_prenda: v.prenda.nombre, color: v.color.nombre, talle: v.talle.nombre,
      cantidad, precio_unitario: pesos(precio), subtotal: pesos(precio * cantidad), _centavos: precio * cantidad,
    };
  });
}

/** Crea el pedido con sus líneas y el primer paso del historial (Recibido). */
async function guardarPedido(datos, items, usuario_id, transaction) {
  const lineas = await armarLineas(items, transaction);
  const total = lineas.reduce((suma, l) => suma + l._centavos, 0);
  const envio_gratis = esEnvioGratis(datos.entrega, total, clientConfig.entrega.envioGratisDesde);
  const clave_seguimiento = randomBytes(16).toString("base64url");
  const pedido = await PedidoWhatsapp.create({ ...datos, total: pesos(total), envio_gratis, usuario_id, clave_seguimiento }, { transaction });
  await PedidoWhatsappItem.bulkCreate(lineas.map(({ _centavos, ...l }) => ({ ...l, pedido_id: pedido.id })), { transaction });
  await PedidoRopaHistorial.create({ pedido_id: pedido.id, estado_anterior: null, estado_nuevo: "recibido", usuario_id }, { transaction });
  return { pedido, lineas, total };
}

/** ROP-14 a ROP-18, ROP-46: pedido sin cuenta, que el cliente termina de mandar por WhatsApp. */
export async function crearPedido({ nombre, celular, items, entrega, direccion = null, localidad = null }) {
  const { pedido, lineas, total } = await sequelize.transaction((transaction) =>
    guardarPedido({ nombre, celular, entrega, direccion, localidad, origen: "whatsapp" }, items, null, transaction));
  avisarPedidoNuevo(pedido.id);
  return {
    id: pedido.id, numero: numeroPedido(pedido.id), clave_seguimiento: pedido.clave_seguimiento, nombre, celular, total: pesos(total), entrega, direccion, localidad,
    envio_gratis: pedido.envio_gratis, items: lineas.map(({ _centavos, prenda_id, ...l }) => l),
  };
}

/**
 * ROP-43 a ROP-45: pedido de un cliente con cuenta. `clave_envio` la genera el navegador: un reintento
 * o un doble clic con la misma clave devuelve el pedido ya creado en vez de crear otro.
 */
export async function crearPedidoCuenta(usuario, { clave_envio, forma_pago, ...datos }) {
  const previo = await PedidoWhatsapp.findOne({ where: { clave_envio }, attributes: ["id", "usuario_id"] });
  if (previo) return pedidoRepetido(previo, usuario);
  const persona = await Persona.findByPk(usuario.persona_id, { attributes: ["nombre", "apellido", "celular"] });
  // ROP-41: sin nombre, apellido y celular el negocio no puede contactar al cliente.
  if (!persona?.nombre || !persona?.apellido || !persona?.celular) {
    throw new ErrorApp("FALTAN_DATOS", "Completá tu nombre, apellido y celular en \"Mis datos\" antes de confirmar el pedido.", 409);
  }
  if (forma_pago === "transferencia" && !transferenciaDisponible(clientConfig.datosBancarios)) {
    throw new ErrorApp("SIN_TRANSFERENCIA", "Por ahora no tomamos transferencias desde la web. Elegí otra forma de pago.", 409);
  }
  try {
    const { pedido } = await sequelize.transaction((transaction) => guardarPedido({
      ...datos, forma_pago, clave_envio, origen: "cuenta",
      nombre: `${persona.nombre} ${persona.apellido}`.slice(0, 80), celular: persona.celular.slice(0, 20),
    }, datos.items, usuario.usuario_id, transaction));
    avisarPedidoNuevo(pedido.id);
    return miPedido(usuario.usuario_id, pedido.id);
  } catch (error) {
    // Dos envíos simultáneos con la misma clave: el segundo choca con el índice único y devuelve el primero.
    if (error instanceof UniqueConstraintError) return pedidoRepetido(await PedidoWhatsapp.findOne({ where: { clave_envio } }), usuario);
    throw error;
  }
}

function pedidoRepetido(previo, usuario) {
  if (previo.usuario_id !== usuario.usuario_id) throw new ErrorApp("CLAVE_USADA", "No pudimos registrar el pedido. Recargá la página y probá de nuevo.", 409);
  return miPedido(usuario.usuario_id, previo.id);
}

/**
 * Cambia el estado dentro de una transacción ya abierta y con el pedido bloqueado: controla que el
 * paso sea válido, pide motivo cuando corresponde y lo deja en el historial (ROP-54).
 */
export async function aplicarCambio(pedido, estado, { motivo = null, usuario_id = null }, transaction) {
  const problema = problemaTransicion(pedido.estado, estado, pedido.entrega);
  if (problema) throw new ErrorApp("CAMBIO_NO_VALIDO", problema, 409);
  if (pideMotivo(pedido.estado, estado) && !motivo) throw new ErrorApp("FALTA_MOTIVO", "Escribí el motivo del cambio.", 400);
  const anterior = pedido.estado;
  await pedido.update({ estado, version: pedido.version + 1, actualizado_en: new Date() }, { transaction });
  await PedidoRopaHistorial.create({ pedido_id: pedido.id, estado_anterior: anterior, estado_nuevo: estado, motivo, usuario_id }, { transaction });
}

/** ROP-54: si otra persona cambió el pedido después de que lo abriste, se avisa en vez de pisarlo. */
export async function cambiarEstadoPedido(id, { estado, motivo, version }, usuario_id) {
  const anterior = await sequelize.transaction(async (transaction) => {
    const pedido = await PedidoWhatsapp.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!pedido) throw noExiste("El pedido no existe.");
    if (pedido.version !== version) throw new ErrorApp("CAMBIO_SIMULTANEO", "Otra persona cambió este pedido recién. Actualizá para ver cómo quedó.", 409);
    const desde = pedido.estado;
    await aplicarCambio(pedido, estado, { motivo, usuario_id }, transaction);
    return desde;
  });
  if (avisaAlCliente(anterior, estado)) avisarCambioEstado(id, estado, motivo);
  return obtenerPedido(id);
}

/** ROP-51: efectivo o "a coordinar": el equipo registra el pago a mano. */
export async function marcarPagado(id, usuario_id) {
  await sequelize.transaction(async (transaction) => {
    const pedido = await PedidoWhatsapp.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!pedido) throw noExiste("El pedido no existe.");
    if (pedido.estado === "cancelado") throw new ErrorApp("PEDIDO_CANCELADO", "El pedido está cancelado.", 409);
    if (pedido.estado_pago === "pagado") throw new ErrorApp("YA_PAGADO", "El pedido ya figura como pagado.", 409);
    await pedido.update({ estado_pago: "pagado", version: pedido.version + 1, actualizado_en: new Date() }, { transaction });
    await PedidoRopaHistorial.create({ pedido_id: id, estado_anterior: pedido.estado, estado_nuevo: pedido.estado, motivo: "Pago registrado", usuario_id }, { transaction });
  });
  return obtenerPedido(id);
}

// ── Panel ───────────────────────────────────────────────────────────────────────
/** ROP-56: por estado, por pago ("Comprobante para revisar") y por número, nombre o celular. */
export async function listarPedidos({ estado, pago, q, pagina }) {
  const { page, limit, offset } = normalizarPaginacion({ page: pagina, limit: POR_PAGINA });
  const condiciones = [];
  if (estado !== "todos") condiciones.push({ estado });
  if (pago !== "todos") condiciones.push({ estado_pago: pago });
  if (q) {
    const numero = Number(q.replace("#", ""));
    condiciones.push({ [Op.or]: [
      ...(Number.isInteger(numero) && numero > 0 ? [{ id: numero }] : []),
      { nombre: { [Op.iLike]: `%${q}%` } },
      { celular: { [Op.like]: `%${q.replace(/\D/g, "") || q}%` } },
    ] });
  }
  const { rows, count } = await PedidoWhatsapp.findAndCountAll({
    where: { [Op.and]: condiciones },
    include: [{ model: PedidoWhatsappItem, as: "items", attributes: ["cantidad"] }],
    order: [["creado_en", "DESC"], ["id", "DESC"]],
    limit, offset, distinct: true,
  });
  const items = rows.map((p) => {
    const { items: lineas, ...datos } = vista(p);
    return { ...datos, unidades: lineas.reduce((suma, l) => suma + l.cantidad, 0) };
  });
  return { items, paginacion: armarPaginacion({ page, limit, total: count }) };
}

const DETALLE = {
  include: [
    { model: PedidoWhatsappItem, as: "items" },
    { model: PedidoRopaHistorial, as: "historial", attributes: ["id", "estado_anterior", "estado_nuevo", "motivo", "creado_en"] },
    { model: PedidoRopaComprobante, as: "comprobantes", attributes: ["id", "public_id", "formato", "estado", "motivo_rechazo", "creado_en", "revisado_en"] },
  ],
  order: [
    [{ model: PedidoWhatsappItem, as: "items" }, "id", "ASC"],
    [{ model: PedidoRopaHistorial, as: "historial" }, "id", "ASC"],
    [{ model: PedidoRopaComprobante, as: "comprobantes" }, "id", "ASC"],
  ],
};

export async function obtenerPedido(id) {
  const pedido = await PedidoWhatsapp.findByPk(id, DETALLE);
  if (!pedido) throw noExiste("El pedido no existe.");
  return vista(pedido);
}

/** Para el inicio del panel: cuántos esperan respuesta. */
export const contarNuevos = () => PedidoWhatsapp.count({ where: { estado: "recibido" } });

// ── Cliente ─────────────────────────────────────────────────────────────────────
/** ROP-52: el cliente ve solo los suyos. */
export async function misPedidos(usuario_id) {
  const pedidos = await PedidoWhatsapp.findAll({
    where: { usuario_id },
    attributes: ["id", "total", "estado", "estado_pago", "forma_pago", "entrega", "creado_en"],
    order: [["creado_en", "DESC"], ["id", "DESC"]],
    limit: 100,
  });
  return pedidos.map(vista);
}

export async function miPedido(usuario_id, id) {
  const pedido = await PedidoWhatsapp.findOne({ where: { id, usuario_id }, ...DETALLE });
  // Un pedido ajeno responde igual que uno que no existe: nadie averigua números de otros.
  if (!pedido) throw noExiste("No encontramos ese pedido.");
  return vista(pedido);
}

/**
 * ROP-62: lo que ve quien tiene el link de seguimiento. Sin nombre, celular ni dirección (el link se
 * reenvía); de los motivos, solo el de la cancelación. Una clave que no existe responde igual que un
 * pedido ajeno.
 */
export async function seguimientoPedido(clave) {
  const pedido = await PedidoWhatsapp.findOne({ where: { clave_seguimiento: clave }, ...DETALLE });
  if (!pedido) throw noExiste("No encontramos ese pedido.");
  const datos = pedido.toJSON();
  return {
    numero: numeroPedido(datos.id), estado: datos.estado, entrega: datos.entrega, envio_gratis: datos.envio_gratis,
    forma_pago: datos.forma_pago, estado_pago: datos.estado_pago, total: datos.total, creado_en: datos.creado_en,
    items: datos.items.map(({ id, nombre_prenda, color, talle, cantidad, precio_unitario, subtotal }) => ({ id, nombre_prenda, color, talle, cantidad, precio_unitario, subtotal })),
    historial: datos.historial.map(({ id, estado_anterior, estado_nuevo, motivo, creado_en }) => ({
      id, estado_anterior, estado_nuevo, creado_en, motivo: estado_nuevo === "cancelado" ? motivo : null,
    })),
  };
}

/** ROP-53: el cliente cancela solo mientras está Recibido, con un motivo. */
export async function cancelarMiPedido(usuario_id, id, motivo) {
  await sequelize.transaction(async (transaction) => {
    const pedido = await PedidoWhatsapp.findOne({ where: { id, usuario_id }, transaction, lock: transaction.LOCK.UPDATE });
    if (!pedido) throw noExiste("No encontramos ese pedido.");
    if (pedido.estado !== "recibido") throw new ErrorApp("NO_CANCELABLE", "Ya empezamos a preparar este pedido: para cambiarlo, escribinos por WhatsApp.", 409);
    await aplicarCambio(pedido, "cancelado", { motivo: `Cancelado por el cliente: ${motivo}`, usuario_id }, transaction);
  });
  avisarCancelacionCliente(id, motivo);
  return miPedido(usuario_id, id);
}
