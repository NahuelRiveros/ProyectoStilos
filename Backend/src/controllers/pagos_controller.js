// =============================================================
// controllers/pagos_controller.js
//
// Maneja las notificaciones de MercadoPago y la verificación
// del estado de pago desde el frontend.
//
// Flujo:
//   1. Usuario paga en MP
//   2. MP redirige al frontend (back_url con ?payment_id=xxx)
//   3. MP notifica al backend (POST /pagos/webhook)
//   4. Frontend llama GET /pagos/verificar?payment_id=xxx
//      para confirmar y mostrar la pantalla de éxito
// =============================================================

import {
  Ord03Orden,
  Ord01Estado,
  Carr01Carrito,
  Carr02Item,
} from "../models/index.js";

import { obtenerPago } from "../services/mercadopago_service.js";

import {
  okResponse,
  errorResponse,
  badRequestResponse,
} from "../utils/api_response.js";

// =============================================================
// Helper: actualiza el estado de una orden tras confirmar el pago
// =============================================================

async function procesarPagoAprobado(ordenId, paymentId) {
  const estadoPagado = await Ord01Estado.findOne({ where: { ORD01_CODIGO: "pagado" } });
  if (!estadoPagado) throw new Error('Estado "pagado" no encontrado. Ejecutar seeds.');

  const orden = await Ord03Orden.findByPk(ordenId);
  if (!orden) throw new Error(`Orden ${ordenId} no encontrada`);

  // Actualizar orden
  await orden.update({
    RELA_ORD01:        estadoPagado.ID_ORD01,
    ORD03_MP_PAYMENT_ID: String(paymentId),
    ORD03_FECHAMOD:    new Date(),
  });

  // Vaciar el carrito del usuario (el pago fue confirmado)
  const carrito = await Carr01Carrito.findOne({ where: { RELA_AUTH02: orden.RELA_AUTH02 } });
  if (carrito) {
    await Carr02Item.destroy({ where: { RELA_CARR01: carrito.ID_CARR01 } });
  }
}

async function procesarPagoRechazado(ordenId) {
  // Volvemos a "pendiente" para que el usuario pueda reintentar el pago
  const estadoPendiente = await Ord01Estado.findOne({ where: { ORD01_CODIGO: "pendiente" } });
  if (!estadoPendiente) return;

  await Ord03Orden.update(
    { RELA_ORD01: estadoPendiente.ID_ORD01, ORD03_FECHAMOD: new Date() },
    { where: { ID_ORD03: ordenId } }
  );
}

// =============================================================
// POST /pagos/webhook   [PÚBLICO — llamado por MercadoPago]
//
// MP puede enviar dos formatos:
//   A) Query params: ?id=payment_id&type=payment
//   B) Body JSON:    { type: "payment", data: { id: "payment_id" } }
//
// Siempre respondemos 200 rápidamente aunque falle algo interno
// (MP reintentará si recibe otro status code).
// =============================================================

export async function webhookMP(req, res) {
  // Responder 200 de inmediato para que MP no reintente
  res.sendStatus(200);

  try {
    const type      = req.query.type   ?? req.body?.type;
    const paymentId = req.query.id     ?? req.body?.data?.id;

    if (type !== "payment" || !paymentId) return;

    const pago = await obtenerPago(paymentId);

    if (!pago.external_reference) {
      console.warn("[Webhook MP] Pago sin external_reference:", paymentId);
      return;
    }

    const ordenId = parseInt(pago.external_reference, 10);

    if (pago.estado === "approved") {
      await procesarPagoAprobado(ordenId, paymentId);
      console.log(`✅ [MP] Pago aprobado — orden #${ordenId}, payment_id: ${paymentId}`);
    } else if (pago.estado === "rejected") {
      await procesarPagoRechazado(ordenId);
      console.log(`❌ [MP] Pago rechazado — orden #${ordenId}`);
    } else {
      console.log(`⏳ [MP] Pago en estado "${pago.estado}" — orden #${ordenId}`);
    }
  } catch (error) {
    // Nunca relanzamos el error (la respuesta 200 ya fue enviada)
    console.error("[Webhook MP] Error procesando notificación:", error.message);
  }
}

// =============================================================
// GET /pagos/verificar?payment_id=xxx   [Auth]
//
// El frontend llama esto al volver del checkout de MP.
// Consulta el estado del pago y devuelve info al usuario.
// =============================================================

export async function verificarPago(req, res) {
  try {
    const { payment_id } = req.query;

    if (!payment_id) {
      return badRequestResponse(res, { mensaje: "El parámetro payment_id es requerido" });
    }

    const pago = await obtenerPago(payment_id);

    // Buscar la orden correspondiente para devolver datos completos
    let ordenId = null;
    if (pago.external_reference) {
      ordenId = parseInt(pago.external_reference, 10);
    }

    return okResponse(res, {
      data: {
        payment_id:  pago.id,
        estado:      pago.estado,
        aprobado:    pago.estado === "approved",
        orden_id:    ordenId,
        monto:       pago.monto,
        metodo_pago: pago.metodo_pago,
      },
      mensaje: pago.estado === "approved"
        ? "Pago aprobado"
        : `Pago en estado: ${pago.estado}`,
    });
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo verificar el estado del pago", error });
  }
}
