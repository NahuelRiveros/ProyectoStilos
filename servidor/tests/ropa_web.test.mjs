import test from "node:test";
import assert from "node:assert/strict";
import {
  agregarLinea, cambiarCantidad, CLAVE_PEDIDO, guardarPedido, leerPedido, quitarLinea, totalEstimado, unidades,
} from "../../frontend/src/modules/tienda_ropa/pedido/pedido_local.js";
import { linkWhatsapp, mensajePedido } from "../../frontend/src/modules/tienda_ropa/pedido/mensaje_whatsapp.js";
import { avisoEnvioGratis } from "../../frontend/src/modules/tienda_ropa/pedido/entrega.js";
import { compartir } from "../../frontend/src/modules/tienda_ropa/tienda/compartir.js";
import { cambiosPosibles, formasDePago, pasosDelPedido, pideMotivo as pideMotivoWeb, puedeSubirComprobante } from "../../frontend/src/modules/tienda_ropa/pedido/pago.js";
import { ESTADOS_PEDIDO, pideMotivo, problemaTransicion } from "../src/modulos/tienda_ropa/reglas.js";
import { formatearPrecio } from "../../frontend/src/modules/tienda_ropa/utils/dinero.js";

const memoria = () => { const datos = new Map(); return { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v), removeItem: (k) => datos.delete(k) }; };
const linea = (variante_id, cantidad = 1) => ({ variante_id, cantidad, nombre: "Remera", color: "Negro", talle: "M", precio: 15000.5 });
const LIMITES = { maxLineas: 2, maxCantidad: 5 };

test("ROP-13: el pedido se guarda en el navegador y vence a los 15 días", () => {
  const storage = memoria();
  guardarPedido(storage, [linea(1, 2)], 0);
  assert.deepEqual(leerPedido(storage, { dias: 15, ahora: 14 * 86400000 }).map((l) => l.cantidad), [2]);
  assert.deepEqual(leerPedido(storage, { dias: 15, ahora: 16 * 86400000 }), []);
  storage.setItem(CLAVE_PEDIDO, "{roto");
  assert.deepEqual(leerPedido(storage, { dias: 15 }), []);
  guardarPedido(storage, [], 0);
  assert.equal(storage.getItem(CLAVE_PEDIDO), null, "vacío no deja nada guardado");
});

test("ROP-13: sumar la misma variante suma cantidad, con límites claros", () => {
  let items = agregarLinea([], linea(1, 2), LIMITES);
  items = agregarLinea(items, linea(1, 3), LIMITES);
  assert.deepEqual(items.map((l) => [l.variante_id, l.cantidad]), [[1, 5]]);
  assert.throws(() => agregarLinea(items, linea(1), LIMITES), /hasta 5 unidades/);
  items = agregarLinea(items, linea(2), LIMITES);
  assert.throws(() => agregarLinea(items, linea(3), LIMITES), /hasta 2 prendas distintas/);
  assert.deepEqual(cambiarCantidad(items, 2, 99, 5).find((l) => l.variante_id === 2).cantidad, 5);
  assert.deepEqual(cambiarCantidad(items, 2, 0, 5).find((l) => l.variante_id === 2).cantidad, 1);
  assert.deepEqual(quitarLinea(items, 1).map((l) => l.variante_id), [2]);
  assert.equal(unidades(items), 6);
  assert.equal(totalEstimado(items), 90003, "en centavos, sin errores de coma flotante");
});

test("ROP-14: el mensaje de WhatsApp lleva número, talle, color, subtotales y total", () => {
  const pedido = { numero: "#00012", nombre: "Ana", total: "31000.00", entrega: "retiro", items: [{ cantidad: 2, nombre_prenda: "Remera lisa", color: "Negro", talle: "M", subtotal: "31000.00" }] };
  const texto = mensajePedido(pedido, "Stilos");
  assert.equal(texto, "¡Hola Stilos! Te envío mi pedido #00012:\n• 2 × Remera lisa (Negro, talle M): $ 31.000\nTotal: $ 31.000\nEntrega: Retiro en el local\nA nombre de: Ana\n¿Me confirmás si hay disponibilidad? Gracias.");
  assert.equal(linkWhatsapp("5493704784641", "Hola & chau"), "https://wa.me/5493704784641?text=Hola%20%26%20chau");
  assert.equal(formatearPrecio(1500.5), "$ 1.500,5");
});

test("ROP-18: el mensaje lleva la entrega y si el envío es gratis", () => {
  const envio = { numero: "#00013", nombre: "Ana", total: "160000.00", entrega: "envio", direccion: "San Martín 123", localidad: "Formosa", items: [] };
  assert.match(mensajePedido({ ...envio, envio_gratis: true }, "Stilos"), /Entrega: Envío a San Martín 123, Formosa\nEnvío gratis\./);
  assert.match(mensajePedido({ ...envio, envio_gratis: false }, "Stilos"), /Formosa\n¿Cuánto sale el envío\?/);
});

test("ROP-18: aviso de cuánto falta para el envío gratis", () => {
  assert.deepEqual(avisoEnvioGratis(100000, 150000), { gratis: false, falta: 50000 });
  assert.deepEqual(avisoEnvioGratis(150000, 150000), { gratis: true, falta: 0 });
  assert.deepEqual(avisoEnvioGratis(149999.99, 150000), { gratis: false, falta: 0.01 }, "sin errores de coma flotante");
  assert.equal(avisoEnvioGratis(100000, null), null);
});

test("ROP-22: compartir usa el menú del teléfono y, si no hay, copia el link", async () => {
  const prenda = { titulo: "Remera", texto: "Remera en Stilos", url: "https://stilos.test/catalogo/remera" };
  let copiado = null;
  const portapapeles = { writeText: async (t) => { copiado = t; } };
  assert.equal(await compartir(prenda, { share: async () => {}, clipboard: portapapeles }), "compartido");
  const cancelar = async () => { throw Object.assign(new Error("x"), { name: "AbortError" }); };
  assert.equal(await compartir(prenda, { share: cancelar, clipboard: portapapeles }), "cancelado");
  assert.equal(copiado, null, "cancelar no copia");
  assert.equal(await compartir(prenda, { clipboard: portapapeles }), "copiado");
  assert.equal(copiado, prenda.url);
  const falla = async () => { throw new Error("no"); };
  assert.equal(await compartir(prenda, { share: falla, clipboard: { writeText: falla } }), "error");
});

test("ROP-44 a ROP-48: formas de pago, comprobante y estados en la web, iguales al servidor", () => {
  const banco = { titular: "EJEMPLO", banco: "EJEMPLO", cbu: "0000000000000000000000", alias: "EJEMPLO", cuit: "20-00000000-0" };
  assert.deepEqual(formasDePago({ entrega: "retiro", datosBancarios: banco }), ["transferencia", "efectivo", "coordinar"]);
  assert.deepEqual(formasDePago({ entrega: "envio", datosBancarios: banco }), ["transferencia", "coordinar"], "efectivo solo al retirar");
  assert.deepEqual(formasDePago({ entrega: "retiro", datosBancarios: { ...banco, cbu: null } }), ["efectivo", "coordinar"], "sin datos bancarios no hay transferencia");
  const pedido = { forma_pago: "transferencia", estado: "recibido", estado_pago: "pendiente", comprobantes: [] };
  assert.equal(puedeSubirComprobante(pedido), true);
  assert.equal(puedeSubirComprobante({ ...pedido, comprobantes: [{}, {}, {}] }), false);
  assert.equal(puedeSubirComprobante({ ...pedido, estado_pago: "pagado" }), false);
  assert.deepEqual(pasosDelPedido("envio"), ["recibido", "confirmado", "enviado", "entregado"]);
  for (const entrega of ["retiro", "envio"]) {
    for (const desde of ESTADOS_PEDIDO) {
      const validos = ESTADOS_PEDIDO.filter((hacia) => problemaTransicion(desde, hacia, entrega) === null);
      assert.deepEqual(cambiosPosibles({ estado: desde, entrega }).sort(), validos.sort(), `${desde} (${entrega})`);
      for (const hacia of validos) assert.equal(pideMotivoWeb(desde, hacia), pideMotivo(desde, hacia), `${desde} → ${hacia}`);
    }
  }
});
