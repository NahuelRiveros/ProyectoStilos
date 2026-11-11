import test, { after, before } from "node:test";
import assert from "node:assert/strict";

// Sin base: cubre lo que se resuelve antes de consultarla (validación, sesión y permisos).
process.env.NODE_ENV = "test";
process.env.DB_HOST = "127.0.0.1";
process.env.DB_PORT = "1";
process.env.JWT_SECRET = "clave-solo-para-tests";

const { createApp } = await import("../src/core/app.js");
const { permisosConfig } = await import("../../core/permisos_config.js");

let servidor;
let base;
before(async () => {
  servidor = createApp().listen(0);
  await new Promise((listo) => servidor.once("listening", listo));
  base = `http://127.0.0.1:${servidor.address().port}/api/ropa`;
});
after(() => servidor.close());

const pedir = async (metodo, ruta, body) => {
  const r = await fetch(base + ruta, { method: metodo, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
  return { estado: r.status, json: await r.json() };
};

test("ROP-20: el panel del catálogo y los pedidos piden ingresar", async () => {
  for (const [metodo, ruta] of [["GET", "/panel/prendas"], ["POST", "/panel/colores/sugeridos"], ["GET", "/pedidos"], ["PATCH", "/pedidos/1/estado"]]) {
    const { estado } = await pedir(metodo, ruta, metodo === "GET" ? undefined : {});
    assert.equal(estado, 401, `${metodo} ${ruta}`);
  }
});

test("ROP-14 y ROP-16: un pedido inválido se rechaza con el error en español, antes de tocar la base", async () => {
  const { estado, json } = await pedir("POST", "/catalogo/pedidos", { nombre: "Ana", celular: "12", items: [{ variante_id: 1, cantidad: 1 }] });
  assert.equal(estado, 400);
  assert.equal(json.codigo, "DATOS_INVALIDOS");
  assert.match(json.mensaje, /celular/);
});

test("ROP-12: una dirección de prenda rara no llega a la base", async () => {
  const { estado } = await pedir("GET", "/catalogo/prendas/NO%20VALIDA");
  assert.equal(estado, 400);
});

test("ROP-20: los permisos del rubro están en la lista, con sus roles de entrada", () => {
  const por = Object.fromEntries(permisosConfig.permisos.map((p) => [p.codigo, p]));
  assert.deepEqual(por["productos.editar"].porDefecto, ["supervisor"]);
  assert.deepEqual(por["pedidos.ver"].porDefecto, ["supervisor", "vendedor"]);
  assert.deepEqual(por["pedidos.gestionar"].requiere, ["pedidos.ver"]);
});
