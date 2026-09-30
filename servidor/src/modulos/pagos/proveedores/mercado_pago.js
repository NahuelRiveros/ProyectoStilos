import { createHmac, timingSafeEqual } from "node:crypto";

// Conector de Mercado Pago (Checkout Pro). Es el ÚNICO archivo que conoce su API: el resto del
// sistema usa estas 3 funciones, iguales para cualquier proveedor (Stripe, etc.):
//   crearCobro     → arma el link de pago de un pedido
//   verificarAviso → confirma que el aviso (webhook) lo mandó Mercado Pago (firma)
//   consultarPago  → pregunta el estado REAL de un pago (nunca se confía en el aviso)
// Documentación: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro

const API = "https://api.mercadopago.com";
const ESPERA_MS = 10_000;

// Estados de Mercado Pago → estados de pago_online.
const ESTADOS = {
  approved: "aprobado",
  pending: "pendiente",
  in_process: "pendiente",
  authorized: "pendiente",
  in_mediation: "pendiente",
  rejected: "rechazado",
  cancelled: "rechazado",
  refunded: "reembolsado",
  charged_back: "reembolsado",
};

/** "ts=1704908010,v1=618c85…" → { ts, v1 } */
function leerFirma(encabezado = "") {
  return Object.fromEntries(
    String(encabezado)
      .split(",")
      .map((parte) => parte.split("=").map((s) => s.trim()))
      .filter(([clave, valor]) => clave && valor),
  );
}

function igualesSeguro(a, b) {
  const [x, y] = [Buffer.from(String(a)), Buffer.from(String(b))];
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * accessToken:  credencial de la aplicación (de prueba o de producción).
 * claveWebhook: "clave secreta" de los avisos (sin ella no se verifica la firma: solo en desarrollo;
 *               igual el estado se consulta siempre a la API).
 * fetch:        se puede reemplazar en los tests (así nunca se llama a Mercado Pago de verdad).
 */
export function crearMercadoPago({ accessToken = "", claveWebhook = "", fetch = globalThis.fetch } = {}) {
  async function llamar(ruta, { method = "GET", body, idempotencia } = {}) {
    const respuesta = await fetch(`${API}${ruta}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(idempotencia ? { "X-Idempotency-Key": idempotencia } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(ESPERA_MS),
    });
    const datos = await respuesta.json().catch(() => ({}));
    // Nunca se incluye el token ni la respuesta completa en el error (puede ir a los logs).
    if (!respuesta.ok) throw new Error(`Mercado Pago respondió ${respuesta.status} en ${ruta}`);
    return datos;
  }

  return {
    nombre: "Mercado Pago",
    metodo: "mercado_pago", // medio con el que queda registrado el cobro (proyecto.config.js → pagos.medios)
    configurado: Boolean(accessToken),

    /** Link de pago por el SALDO del pedido (el monto sale de la base, nunca del navegador). */
    async crearCobro({ pago_online_id, pedido_id, monto, titulo, email, urlRetorno, urlAviso }) {
      const https = urlRetorno.startsWith("https://");
      const preferencia = await llamar("/checkout/preferences", {
        method: "POST",
        idempotencia: `pago-online-${pago_online_id}`,
        body: {
          items: [{ id: `pedido-${pedido_id}`, title: titulo, quantity: 1, currency_id: "ARS", unit_price: Number(monto) }],
          // Con esto el aviso dice a qué pedido e intento de pago corresponde.
          external_reference: `${pedido_id}:${pago_online_id}`,
          ...(email ? { payer: { email } } : {}),
          back_urls: { success: urlRetorno, pending: urlRetorno, failure: urlRetorno },
          // Mercado Pago solo vuelve solo a la tienda si la dirección es https (en local, el cliente vuelve con el botón).
          ...(https ? { auto_return: "approved" } : {}),
          ...(urlAviso ? { notification_url: urlAviso } : {}),
        },
      });
      return { referencia_externa: preferencia.id, url: preferencia.init_point };
    },

    /**
     * Firma de los avisos: x-signature = "ts=…,v1=…", HMAC-SHA256 con la clave secreta sobre
     * "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" (data.id en minúsculas; sin x-request-id
     * esa parte se omite). ⚠️ Verificar con un aviso real de prueba al cargar las credenciales.
     */
    verificarAviso({ headers = {}, query = {}, body = {} }) {
      const tipo = query.type ?? query.topic ?? body?.type ?? "";
      const idPago = String(query["data.id"] ?? body?.data?.id ?? "").toLowerCase();
      const requestId = headers["x-request-id"] ?? "";
      const aviso = { esPago: tipo === "payment", idPago, idEvento: requestId || `${tipo}:${idPago}:${body?.action ?? ""}` };
      if (!claveWebhook) return { ...aviso, valido: true };

      const { ts, v1 } = leerFirma(headers["x-signature"]);
      if (!ts || !v1) return { ...aviso, valido: false };
      const manifiesto = `id:${idPago};${requestId ? `request-id:${requestId};` : ""}ts:${ts};`;
      const esperado = createHmac("sha256", claveWebhook).update(manifiesto).digest("hex");
      return { ...aviso, valido: igualesSeguro(esperado, v1) };
    },

    async consultarPago(idPago) {
      const pago = await llamar(`/v1/payments/${encodeURIComponent(idPago)}`);
      return {
        id: String(pago.id),
        estado: ESTADOS[pago.status] ?? "pendiente",
        monto: Number(pago.transaction_amount),
        moneda: pago.currency_id,
        referencia: pago.external_reference ?? "",
        // Lo que se guarda para consulta: nunca datos de tarjeta.
        detalle: { estado: pago.status, motivo: pago.status_detail, tipo: pago.payment_type_id, aprobado_en: pago.date_approved ?? null },
      };
    },
  };
}
