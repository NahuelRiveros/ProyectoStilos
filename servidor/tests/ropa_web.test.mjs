import test from "node:test";
import assert from "node:assert/strict";
import {
  agregarLinea, cambiarCantidad, CLAVE_PEDIDO, guardarPedido, leerPedido, quitarLinea, totalEstimado, unidades,
} from "../../frontend/src/modules/tienda_ropa/pedido/pedido_local.js";
import { linkWhatsapp, mensajePedido } from "../../frontend/src/modules/tienda_ropa/pedido/mensaje_whatsapp.js";
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
  const pedido = { numero: "#00012", nombre: "Ana", total: "31000.00", items: [{ cantidad: 2, nombre_prenda: "Remera lisa", color: "Negro", talle: "M", subtotal: "31000.00" }] };
  const texto = mensajePedido(pedido, "Stilos");
  assert.equal(texto, "¡Hola Stilos! Te envío mi pedido #00012:\n• 2 × Remera lisa (Negro, talle M): $ 31.000\nTotal: $ 31.000\nA nombre de: Ana\n¿Me confirmás si hay disponibilidad? Gracias.");
  assert.equal(linkWhatsapp("5493704784641", "Hola & chau"), "https://wa.me/5493704784641?text=Hola%20%26%20chau");
  assert.equal(formatearPrecio(1500.5), "$ 1.500,5");
});
