import { randomUUID } from "node:crypto";
import { sequelize } from "../../../core/database/sequelize.js";
import { ErrorApp, noExiste } from "../../../core/services/common/errores.js";
import { subirArchivoPrivado, eliminarArchivoPrivado, enlaceArchivoPrivado } from "../../../core/services/common/upload_service.js";
import { tienePermiso } from "../../../../../core/permisos_config.js";
import { deploymentConfig } from "../../../../../proyecto/deployment_config.js";
import { PedidoWhatsapp, PedidoRopaComprobante } from "../models/index.js";
import { MAX_BYTES_COMPROBANTE, formatoComprobante, problemaComprobante } from "../reglas.js";
import { aplicarCambio } from "./pedidos_service.js";
import { avisarCambioEstado, avisarComprobanteNuevo, avisarComprobanteRechazado } from "./avisos_service.js";

// Comprobantes de transferencia (ROP-48 a ROP-50), tomado de DistribuCG. El archivo vive privado en
// Cloudinary: acá se guarda su id y se entrega un enlace que vence a los 5 minutos.

const SEGUNDOS_ENLACE = 300;
const carpeta = () => `${deploymentConfig.carpetaCloudinary}/comprobantes`;

/** El pedido del cliente, si admite otro comprobante (ROP-48). Con `transaction`, lo bloquea. */
async function pedidoQueAdmite(usuario_id, pedido_id, transaction) {
  const pedido = await PedidoWhatsapp.findOne({ where: { id: pedido_id, usuario_id }, ...(transaction && { transaction, lock: transaction.LOCK.UPDATE }) });
  if (!pedido) throw noExiste("No encontramos ese pedido.");
  const previos = await PedidoRopaComprobante.count({ where: { pedido_id }, ...(transaction && { transaction }) });
  const problema = problemaComprobante(pedido, previos);
  if (problema) throw new ErrorApp("COMPROBANTE_NO_ADMITIDO", problema, 409);
  return pedido;
}

/**
 * Se valida antes de subir (para no subir de balde) y otra vez con el pedido bloqueado; si el
 * registro falla, el archivo subido se borra. `nube` se reemplaza en los tests (sin Cloudinary).
 */
export async function subirComprobante(usuario_id, pedido_id, archivo, nube = { subir: subirArchivoPrivado, borrar: eliminarArchivoPrivado }) {
  if (!archivo?.buffer?.length) throw new ErrorApp("SIN_ARCHIVO", "Adjuntá la foto o el PDF del comprobante.", 400);
  if (archivo.buffer.length > MAX_BYTES_COMPROBANTE) throw new ErrorApp("ARCHIVO_GRANDE", "El archivo supera los 5 MB.", 413);
  const formato = formatoComprobante(archivo.buffer);
  if (!formato) throw new ErrorApp("ARCHIVO_INVALIDO", "El comprobante tiene que ser una imagen (JPG, PNG o WEBP) o un PDF.", 400);
  await pedidoQueAdmite(usuario_id, pedido_id);

  const subido = await nube.subir(archivo.buffer, { folder: carpeta(), public_id: `pedido-${pedido_id}-${randomUUID()}` });
  try {
    await sequelize.transaction(async (transaction) => {
      const pedido = await pedidoQueAdmite(usuario_id, pedido_id, transaction);
      await PedidoRopaComprobante.create({ pedido_id, public_id: subido.public_id, formato }, { transaction });
      await pedido.update({ estado_pago: "en_revision", version: pedido.version + 1, actualizado_en: new Date() }, { transaction });
    });
  } catch (error) {
    await nube.borrar(subido.public_id).catch((e) => console.error("No se pudo borrar el comprobante huérfano:", e.message));
    throw error;
  }
  avisarComprobanteNuevo(pedido_id);
}

/** ROP-49: el enlace es solo para el dueño del pedido o para quien puede ver pedidos. */
export async function enlaceComprobante(usuario, pedido_id, comprobante_id, firmar = enlaceArchivoPrivado) {
  const esEquipo = tienePermiso(usuario, "pedidos.ver");
  const comprobante = await PedidoRopaComprobante.findOne({
    where: { id: comprobante_id, pedido_id },
    include: [{ model: PedidoWhatsapp, as: "pedido", attributes: ["id"], ...(esEquipo ? {} : { where: { usuario_id: usuario.usuario_id } }) }],
  });
  if (!comprobante) throw noExiste("No encontramos ese comprobante.");
  return { url: firmar(comprobante.public_id, comprobante.formato, SEGUNDOS_ENLACE), vence_en_segundos: SEGUNDOS_ENLACE };
}

/** El comprobante "en revisión" leído con el pedido bloqueado: así no se acepta dos veces. */
async function paraRevisar(pedido_id, comprobante_id, transaction) {
  const pedido = await PedidoWhatsapp.findByPk(pedido_id, { transaction, lock: transaction.LOCK.UPDATE });
  const comprobante = pedido && await PedidoRopaComprobante.findOne({ where: { id: comprobante_id, pedido_id }, transaction, lock: transaction.LOCK.UPDATE });
  if (!comprobante) throw noExiste("No encontramos ese comprobante.");
  if (comprobante.estado !== "en_revision") throw new ErrorApp("COMPROBANTE_REVISADO", "Este comprobante ya fue revisado. Actualizá la lista.", 409);
  return { pedido, comprobante };
}

/** ROP-50: aceptar marca el pedido Pagado y, si estaba Recibido, lo confirma en el mismo paso. */
export async function aceptarComprobante(pedido_id, comprobante_id, usuario_id) {
  const confirmo = await sequelize.transaction(async (transaction) => {
    const { pedido, comprobante } = await paraRevisar(pedido_id, comprobante_id, transaction);
    await comprobante.update({ estado: "aceptado", revisado_por: usuario_id, revisado_en: new Date(), motivo_rechazo: null }, { transaction });
    await pedido.update({ estado_pago: "pagado" }, { transaction });
    if (pedido.estado !== "recibido") {
      await pedido.update({ version: pedido.version + 1, actualizado_en: new Date() }, { transaction });
      return false;
    }
    await aplicarCambio(pedido, "confirmado", { motivo: "Pago aceptado", usuario_id }, transaction);
    return true;
  });
  // Un solo correo, después de confirmar.
  if (confirmo) avisarCambioEstado(pedido_id, "confirmado", null);
  return confirmo;
}

/** El rechazo lleva motivo (lo lee el cliente). Si no queda otro en revisión, el pago vuelve a Pendiente. */
export async function rechazarComprobante(pedido_id, comprobante_id, usuario_id, motivo) {
  await sequelize.transaction(async (transaction) => {
    const { pedido, comprobante } = await paraRevisar(pedido_id, comprobante_id, transaction);
    await comprobante.update({ estado: "rechazado", revisado_por: usuario_id, revisado_en: new Date(), motivo_rechazo: motivo }, { transaction });
    const otros = await PedidoRopaComprobante.count({ where: { pedido_id, estado: "en_revision" }, transaction });
    await pedido.update({ estado_pago: otros ? "en_revision" : "pendiente", version: pedido.version + 1, actualizado_en: new Date() }, { transaction });
  });
  avisarComprobanteRechazado(pedido_id, motivo);
}
