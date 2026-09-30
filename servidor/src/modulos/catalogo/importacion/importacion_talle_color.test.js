import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { sugerirMapeo } from "compartido/importacion_catalogo.js";
import { proyecto } from "compartido/proyecto.js";
import { crearApp } from "../../../app.js";
import { sequelize } from "../../../nucleo/db/sequelize.js";
import { autorizacion, crearRoles, crearUsuario, vaciarTablas } from "../../../../tests/ayudantes.js";
import { resolverTalleColor } from "./plan_talle_color.js";

// ── Resolución de Color y Talle contra las listas del panel (sin base: vale para cualquier rubro) ──

const CATALOGO = {
  categorias: [
    { id: 1, nombre: "Hombres", padre_id: null },
    { id: 2, nombre: "Remeras", padre_id: 1 },
  ],
  productos: [{ id: 9, categoria_id: 2, nombre: "Remera vieja", grupo_talle_id: 6 }],
  colores: [
    { id: 1, nombre: "Negro" },
    { id: 2, nombre: "Azul marino" },
  ],
  grupos: [
    { id: 5, nombre: "Ropa", talles: [{ id: 51, nombre: "S" }, { id: 52, nombre: "M" }, { id: 53, nombre: "40" }] },
    { id: 6, nombre: "Jeans", talles: [{ id: 61, nombre: "40" }] },
  ],
};
const fila = (numero, valor) => ({ fila: numero, valor: { categoria: "Hombres > Remeras", producto: "Remera lisa", presentacion: null, ...valor } });
const resolver = (...filas) => resolverTalleColor(filas, CATALOGO);

describe("importación · color y talle contra las listas del panel", () => {
  it("resuelve sin distinguir mayúsculas ni acentos y nombra la variante igual que el panel", () => {
    const [f] = resolver(fila(2, { color: "azul MARINO", talle: "m" }));
    expect(f.valor).toMatchObject({ presentacion: "Azul marino · M", color_id: 2, talle_id: 52, grupo_talle_id: 5 });
    expect(f.accion).toBeUndefined();
  });

  it("un color o un talle que no existe deja la fila con error (no se crean solos)", () => {
    const [color, talle, grupo] = resolver(
      fila(2, { color: "Verde oliva", talle: "S" }),
      fila(3, { color: "Negro", talle: "XS" }),
      fila(4, { color: "Negro", talle: "S", grupo_talle: "Bebés" }),
    );
    expect(color).toMatchObject({ accion: "error", mensaje: 'El color "Verde oliva" no existe. Cargalo en Catálogo → Colores.' });
    expect(talle).toMatchObject({ accion: "error", mensaje: 'El talle "XS" no existe. Cargalo en Catálogo → Talles.' });
    expect(grupo).toMatchObject({ accion: "error", mensaje: 'El grupo de talles "Bebés" no existe. Cargalo en Catálogo → Talles.' });
  });

  it("un talle que está en dos grupos necesita la columna Grupo de talles", () => {
    const [ambiguo, conGrupo] = resolver(fila(2, { color: "Negro", talle: "40" }), fila(3, { producto: "Jean", color: "Negro", talle: "40", grupo_talle: "jeans" }));
    expect(ambiguo.mensaje).toBe('El talle "40" está en varios grupos (Ropa, Jeans): agregá la columna Grupo de talles.');
    expect(conGrupo.valor).toMatchObject({ presentacion: "Negro · 40", talle_id: 61, grupo_talle_id: 6 });
  });

  it("una prenda existente usa su grupo de talles y no acepta talles de otro", () => {
    const [propio, ajeno] = resolver(fila(2, { producto: "Remera vieja", talle: "40" }), fila(3, { producto: "Remera vieja", talle: "40", grupo_talle: "Ropa" }));
    expect(propio.valor).toMatchObject({ presentacion: "40", talle_id: 61 });
    expect(ajeno).toMatchObject({ accion: "error", mensaje: "La prenda ya existe con otro grupo de talles." });
  });

  it("no mezcla grupos en una prenda nueva, ni Presentación con Color/Talle; las filas sin color ni talle quedan igual", () => {
    const [ropa, jeans, mezcla, comun] = resolver(
      fila(2, { color: "Negro", talle: "S" }),
      fila(3, { color: "Negro", talle: "40", grupo_talle: "Jeans" }),
      fila(4, { producto: "Otra", color: "Negro", presentacion: "Pack x2" }),
      fila(5, { producto: "Gorra", presentacion: "Única" }),
    );
    expect(ropa.mensaje).toBe("La misma prenda tiene talles de grupos distintos. Usá un solo grupo por prenda.");
    expect(jeans.accion).toBe("error");
    expect(mezcla.mensaje).toBe("Usá la columna Presentación o las de Color y Talle, no las dos.");
    expect(comun).toEqual(fila(5, { producto: "Gorra", presentacion: "Única" }));
  });

  it("solo color (accesorio sin talles)", () => {
    const [f] = resolver(fila(2, { producto: "Gorra", color: "negro" }));
    expect(f.valor).toMatchObject({ presentacion: "Negro", color_id: 1, talle_id: null, grupo_talle_id: null });
  });
});

// ── Recorrido completo por la API (solo si el proyecto está en modo indumentaria) ──

const app = crearApp();
let staff;
const BASE = "/api/catalogo/importacion";
const post = (url, body) => request(app).post(url).set(...autorizacion(staff)).send(body);

function subir(ruta, csv, campos = {}) {
  let pedido = request(app).post(`${BASE}${ruta}`).set(...autorizacion(staff)).attach("archivo", Buffer.from(csv), "prendas.csv");
  for (const [clave, valor] of Object.entries(campos)) pedido = pedido.field(clave, typeof valor === "string" ? valor : JSON.stringify(valor));
  return pedido;
}

async function importar(csv) {
  const vista = await subir("/previsualizar", csv, { opciones: {} });
  const id = randomUUID();
  const validada = await subir("/validar", csv, { opciones: {}, mapeo: sugerirMapeo(vista.body.data.columnas), id });
  expect(validada.status).toBe(200);
  const ejecutada = await post(`${BASE}/${id}/lote`, { indice: 0, confirmar: true, omitir_errores: true });
  expect(ejecutada.status).toBe(200);
  return validada.body.data;
}

describe.skipIf(proyecto.catalogo.variantes !== "talle_color")("importación de prendas por la API", () => {
  beforeAll(async () => {
    await vaciarTablas("importacion_catalogo_lote", "importacion_catalogo", "usuario_rol", "usuario", "rol");
    await crearRoles();
    staff = await crearUsuario({ email: "staff@prendas-import.com", roles: ["staff"] });
  });
  beforeEach(async () => {
    await vaciarTablas("movimiento_stock", "stock", "producto_imagen", "variante", "producto", "categoria", "talle", "grupo_talle", "color", "marca");
    await post("/api/catalogo/colores", { nombre: "Negro", hex: "#111111" });
    await post("/api/catalogo/colores", { nombre: "Blanco", hex: "#FFFFFF" });
    await post("/api/catalogo/grupos-talle", { nombre: "Ropa", talles: [{ nombre: "S" }, { nombre: "M" }] });
  });
  afterAll(() => sequelize.close());

  const CSV = [
    "SKU;Producto;Categoría;Color;Talle;Precio;Stock;Marca",
    "R-N-S;Remera lisa;Hombres > Remeras;Negro;S;10.000;4;Taverniti",
    "R-N-M;Remera lisa;Hombres > Remeras;negro;M;10.000;0;Taverniti",
    "R-B-S;Remera lisa;Hombres > Remeras;Blanco;S;10.000;2;Taverniti",
    "R-V-S;Remera lisa;Hombres > Remeras;Verde oliva;S;10.000;1;Taverniti",
    "R-N-XS;Remera lisa;Hombres > Remeras;Negro;XS;10.000;1;Taverniti",
  ].join("\n");

  it("crea una prenda con una variante por fila, su grupo, color, talle y stock; lo que no existe queda con error", async () => {
    const importacion = await importar(CSV);
    expect(importacion.resumen).toMatchObject({ crear: 3, error: 2 });
    expect(importacion.muestra.filter((f) => f.accion === "error").map((f) => f.mensaje)).toEqual([
      'El color "Verde oliva" no existe. Cargalo en Catálogo → Colores.',
      'El talle "XS" no existe. Cargalo en Catálogo → Talles.',
    ]);

    const lista = (await request(app).get("/api/catalogo/productos?q=Remera%20lisa").set(...autorizacion(staff))).body.data;
    const [remera] = lista;
    expect(lista).toHaveLength(1);
    expect(remera).toMatchObject({ marca: { nombre: "Taverniti" }, grupo_talle: { nombre: "Ropa" } });
    expect(remera.variantes.map((v) => [v.nombre, v.sku, v.color?.nombre, v.talle?.nombre, v.precio])).toEqual([
      ["Negro · S", "R-N-S", "Negro", "S", "10000.00"],
      ["Negro · M", "R-N-M", "Negro", "M", "10000.00"],
      ["Blanco · S", "R-B-S", "Blanco", "S", "10000.00"],
    ]);
    if (proyecto.modulos.stock) expect(remera.variantes.map((v) => v.cantidad_disponible)).toEqual([4, 0, 2]);
  });

  it("volver a importar el mismo archivo no duplica: reconoce las variantes por su código", async () => {
    await importar(CSV);
    const segunda = await importar(CSV);
    expect(segunda.resumen).toMatchObject({ crear: 0, sin_cambios: 3, error: 2 });
  });
});
