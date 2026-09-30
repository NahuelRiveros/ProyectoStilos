import { createHmac } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { proyecto } from "compartido/proyecto.js";
import { crearApp } from "../../app.js";
import { sequelize } from "../../nucleo/db/sequelize.js";
import { autorizacion, crearRoles, crearUsuario, vaciarTablas } from "../../../tests/ayudantes.js";
import { Pedido, PedidoCobro, PedidoEstadoLog } from "../tienda/modelos.js";
import { PagoOnline } from "./modelos.js";
import { crearMercadoPago } from "./proveedores/mercado_pago.js";
import { disponibles, iniciarPago, procesarAviso } from "./pagos_servicio.js";

// Mercado Pago simulado: el conector real con un fetch falso (nunca se llama a la API de verdad).
const CLAVE = "clave-de-avisos-de-prueba";
let pagosSimulados;
let pedidosDePreferencia;

function fetchFalso(url, opciones) {
  const responder = (datos, status = 200) => Promise.resolve({ ok: status < 400, status, json: async () => datos });
  if (url.endsWith("/checkout/preferences")) {
    const cuerpo = JSON.parse(opciones.body);
    pedidosDePreferencia.push({ cuerpo, idempotencia: opciones.headers["X-Idempotency-Key"] });
    return responder({ id: `pref-${pedidosDePreferencia.length}`, init_point: `https://mp.test/pagar/${pedidosDePreferencia.length}` });
  }
  const id = url.split("/v1/payments/")[1];
  return pagosSimulados.has(id) ? responder(pagosSimulados.get(id)) : responder({ message: "not found" }, 404);
}

const mercadoPago = crearMercadoPago({ accessToken: "TEST-token", claveWebhook: CLAVE, fetch: fetchFalso });
const proveedores = { mercado_pago: mercadoPago };

/** Aviso de pago firmado como lo firma Mercado Pago. */
function aviso(idPago, { requestId = `req-${idPago}-${Math.random()}`, clave = CLAVE } = {}) {
  const ts = "1704908010";
  const v1 = createHmac("sha256", clave).update(`id:${idPago};request-id:${requestId};ts:${ts};`).digest("hex");
  return {
    proveedor: "mercado_pago",
    headers: { "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": requestId },
    query: { "data.id": idPago, type: "payment" },
    body: { action: "payment.updated", data: { id: idPago }, type: "payment" },
  };
}

const app = crearApp();
let cliente, otroCliente;

// Solo si el proyecto usa pagos online (sus reglas salen de proyecto.config.js → pagos_online).
describe.skipIf(!proyecto.modulos.pagos_online || !proyecto.pagos_online)("Pagos online (Mercado Pago)", () => {
  beforeAll(async () => {
    await vaciarTablas("usuario_rol", "usuario", "rol");
    await crearRoles();
    cliente = await crearUsuario({ email: "cliente@pagos.com", roles: ["cliente"] });
    otroCliente = await crearUsuario({ email: "otro@pagos.com", roles: ["cliente"] });
  });
  beforeEach(async () => {
    await vaciarTablas("aviso_pago", "pedido_cobro", "pago_online", "pedido_estado_log", "pedido_item", "pedido");
    pagosSimulados = new Map();
    pedidosDePreferencia = [];
  });
  afterAll(() => sequelize.close());

  const nuevoPedido = (extra = {}) =>
    Pedido.create({
      usuario_id: cliente.id,
      estado: "pendiente",
      modalidad_entrega: "retiro",
      entrega: { email: "cliente@pagos.com" },
      subtotal_neto: 10000,
      total_iva: 2100,
      total: 12100,
      medio_pago: "mercado_pago",
      ...extra,
    });
  const pagoAprobado = (id, pedido, pago_online_id, monto = 12100) =>
    pagosSimulados.set(id, { id: Number(id), status: "approved", status_detail: "accredited", transaction_amount: monto, currency_id: "ARS", external_reference: `${pedido.id}:${pago_online_id}` });

  it("sin credenciales el pago no está disponible (y la tienda no muestra el botón)", async () => {
    expect(disponibles()).toEqual({ mercado_pago: false });
    expect(disponibles(proveedores)).toEqual({ mercado_pago: true });
    const pedido = await nuevoPedido();
    const res = await request(app).post(`/api/pagos/pedidos/${pedido.id}`).set(...autorizacion(cliente)).send({});
    expect(res.status).toBe(503);
    expect(res.body.codigo).toBe("PAGOS_NO_DISPONIBLES");
    expect((await request(app).get("/api/pagos/disponibles")).body.data).toEqual({ mercado_pago: false });
  });

  it("arma el link por el saldo del pedido (de la base) y lo reutiliza si se pide de nuevo", async () => {
    const pedido = await nuevoPedido({ monto_cobrado: 2100, estado_cobro: "parcial" });
    const primero = await iniciarPago({ pedido_id: pedido.id, usuario: cliente }, { proveedores });
    expect(primero.url).toBe("https://mp.test/pagar/1");

    const [{ cuerpo, idempotencia }] = pedidosDePreferencia;
    expect(cuerpo.items).toEqual([{ id: `pedido-${pedido.id}`, title: `Pedido #${String(pedido.id).padStart(6, "0")}`, quantity: 1, currency_id: "ARS", unit_price: 10000 }]);
    expect(cuerpo.external_reference).toBe(`${pedido.id}:${primero.pago_online_id}`);
    expect(cuerpo.back_urls.success).toMatch(new RegExp(`/mis-pedidos/${pedido.id}$`));
    expect(idempotencia).toBe(`pago-online-${primero.pago_online_id}`);

    const segundo = await iniciarPago({ pedido_id: pedido.id, usuario: cliente }, { proveedores });
    expect(segundo).toEqual(primero);
    expect(pedidosDePreferencia).toHaveLength(1);
  });

  it("no deja pagar un pedido ajeno, cancelado, ya pagado o con un medio que no es online", async () => {
    const intentar = (pedido, usuario = cliente) => iniciarPago({ pedido_id: pedido.id, usuario }, { proveedores });
    await expect(intentar(await nuevoPedido(), otroCliente)).rejects.toMatchObject({ status: 404 });
    await expect(intentar(await nuevoPedido({ estado: "cancelado" }))).rejects.toMatchObject({ codigo: "PEDIDO_CANCELADO" });
    await expect(intentar(await nuevoPedido({ monto_cobrado: 12100, estado_cobro: "cobrado" }))).rejects.toMatchObject({ codigo: "PEDIDO_PAGADO" });
    await expect(intentar(await nuevoPedido({ medio_pago: "transferencia" }))).rejects.toMatchObject({ codigo: "MEDIO_SIN_PAGO_ONLINE" });
  });

  it("pago aprobado: entra el cobro solo, sin usuario, y el pedido pasa a 'Pago recibido'", async () => {
    const pedido = await nuevoPedido();
    const { pago_online_id } = await iniciarPago({ pedido_id: pedido.id, usuario: cliente }, { proveedores });
    pagoAprobado("9001", pedido, pago_online_id);

    expect(await procesarAviso(aviso("9001"), { proveedores })).toEqual({ procesado: true, estado: "aprobado" });

    const actualizado = await Pedido.findByPk(pedido.id);
    expect(actualizado).toMatchObject({ estado: proyecto.pagos_online.estado_al_aprobar ?? "pendiente", estado_cobro: "cobrado" });
    const cobros = await PedidoCobro.findAll({ where: { pedido_id: pedido.id }, raw: true });
    expect(cobros).toMatchObject([{ monto: "12100.00", metodo: "mercado_pago", origen: "online", registrado_por: null, pago_online_id }]);
    const historial = await PedidoEstadoLog.findAll({ where: { pedido_id: pedido.id }, raw: true });
    expect(historial.at(-1)).toMatchObject({ estado_anterior: "pendiente", usuario_id: null, motivo: "Pago aprobado por Mercado Pago" });
    expect(await PagoOnline.findByPk(pago_online_id, { raw: true })).toMatchObject({ estado: "aprobado", pago_externo_id: "9001" });
  });

  it("el mismo aviso repetido, u otro aviso del mismo pago, no cobra dos veces", async () => {
    const pedido = await nuevoPedido();
    const { pago_online_id } = await iniciarPago({ pedido_id: pedido.id, usuario: cliente }, { proveedores });
    pagoAprobado("9002", pedido, pago_online_id);

    const mismo = aviso("9002", { requestId: "req-fijo" });
    await procesarAviso(mismo, { proveedores });
    expect(await procesarAviso(mismo, { proveedores })).toEqual({ procesado: false, repetido: true });
    await procesarAviso(aviso("9002"), { proveedores }); // otro aviso (otro request-id) del mismo pago
    expect(await PedidoCobro.count({ where: { pedido_id: pedido.id } })).toBe(1);
  });

  it("rechaza un aviso con firma inválida y no toca nada", async () => {
    const pedido = await nuevoPedido();
    const { pago_online_id } = await iniciarPago({ pedido_id: pedido.id, usuario: cliente }, { proveedores });
    pagoAprobado("9003", pedido, pago_online_id);

    await expect(procesarAviso(aviso("9003", { clave: "otra-clave" }), { proveedores })).rejects.toMatchObject({ status: 401, codigo: "FIRMA_INVALIDA" });
    expect(await PedidoCobro.count()).toBe(0);
  });

  it("aprobado por otro monto: no cobra, el pedido no avanza y el pago queda para revisar", async () => {
    const pedido = await nuevoPedido();
    const { pago_online_id } = await iniciarPago({ pedido_id: pedido.id, usuario: cliente }, { proveedores });
    pagoAprobado("9004", pedido, pago_online_id, 100);

    expect(await procesarAviso(aviso("9004"), { proveedores })).toEqual({ procesado: true, estado: "revisar" });
    expect(await PedidoCobro.count()).toBe(0);
    expect((await Pedido.findByPk(pedido.id)).estado).toBe("pendiente");
  });

  it("pago rechazado: queda registrado y el cliente puede volver a intentar", async () => {
    const pedido = await nuevoPedido();
    const { pago_online_id } = await iniciarPago({ pedido_id: pedido.id, usuario: cliente }, { proveedores });
    pagosSimulados.set("9005", { id: 9005, status: "rejected", status_detail: "cc_rejected_insufficient_amount", transaction_amount: 12100, currency_id: "ARS", external_reference: `${pedido.id}:${pago_online_id}` });

    expect(await procesarAviso(aviso("9005"), { proveedores })).toEqual({ procesado: true, estado: "rechazado" });
    expect(await PedidoCobro.count()).toBe(0);
    // Con el intento anterior rechazado, se arma un link nuevo.
    const nuevo = await iniciarPago({ pedido_id: pedido.id, usuario: cliente }, { proveedores });
    expect(nuevo.pago_online_id).not.toBe(pago_online_id);
  });

  it("si Mercado Pago no responde, avisa con un mensaje claro y el intento queda como error", async () => {
    const caido = { mercado_pago: crearMercadoPago({ accessToken: "TEST", fetch: vi.fn().mockRejectedValue(new Error("timeout")) }) };
    const pedido = await nuevoPedido();
    const intento = iniciarPago({ pedido_id: pedido.id, usuario: cliente }, { proveedores: caido });
    await expect(intento).rejects.toThrow("No pudimos conectar con Mercado Pago. Probá de nuevo en unos minutos.");
    await expect(intento).rejects.toMatchObject({ status: 502, codigo: "PROVEEDOR_NO_RESPONDE" });
    expect(await PagoOnline.findOne({ where: { pedido_id: pedido.id }, raw: true })).toMatchObject({ estado: "error" });
  });

  it("el aviso por HTTP de un proveedor sin credenciales responde 404", async () => {
    const res = await request(app).post("/api/pagos/aviso/mercado_pago?data.id=1&type=payment").send({ type: "payment" });
    expect(res.status).toBe(404);
  });
});
