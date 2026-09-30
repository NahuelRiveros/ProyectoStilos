import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { proyecto } from "compartido/proyecto.js";
import { crearApp } from "../../app.js";
import { QueryTypes } from "sequelize";
import { DB_SCHEMA, sequelize } from "../../nucleo/db/sequelize.js";
import { autorizacion, crearRoles, crearUsuario, vaciarTablas } from "../../../tests/ayudantes.js";

const app = crearApp();
let staff;

beforeAll(async () => {
  await vaciarTablas("usuario_rol", "usuario", "rol");
  await crearRoles();
  staff = await crearUsuario({ email: "staff@prendas.com", roles: ["staff"] });
});
beforeEach(() => vaciarTablas("movimiento_stock", "stock", "producto_imagen", "variante", "producto", "categoria", "talle", "grupo_talle", "color", "marca"));
afterAll(() => sequelize.close());

const post = (url, body) => request(app).post(url).set(...autorizacion(staff)).send(body);
const put = (url, body) => request(app).put(url).set(...autorizacion(staff)).send(body);
const get = (url) => request(app).get(url).set(...autorizacion(staff));

// Remera Taverniti lisa: 2 colores × 2 talles del grupo "Ropa".
async function preparar() {
  const categoria = (await post("/api/catalogo/categorias", { nombre: "Remeras" })).body.data;
  const negro = (await post("/api/catalogo/colores", { nombre: "Negro", hex: "#111111" })).body.data;
  const blanco = (await post("/api/catalogo/colores", { nombre: "Blanco", hex: "#FFFFFF" })).body.data;
  const ropa = (await post("/api/catalogo/grupos-talle", { nombre: "Ropa", talles: [{ nombre: "S" }, { nombre: "M" }] })).body.data;
  const jeans = (await post("/api/catalogo/grupos-talle", { nombre: "Jeans", talles: [{ nombre: "40" }] })).body.data;
  const [s, m] = ropa.talles;
  return { categoria, negro, blanco, ropa, jeans, s, m };
}

const variante = (color, talle, extra = {}) => ({ color_id: color?.id ?? null, talle_id: talle?.id ?? null, precio: 15000, ...extra });

describe("Productos con talle y color", () => {
  it("arma el nombre de cada combinación y registra el stock inicial como ingreso", async () => {
    const { categoria, negro, blanco, ropa, s, m } = await preparar();
    const res = await post("/api/catalogo/productos", {
      categoria_id: categoria.id,
      nombre: "Remera Taverniti lisa",
      grupo_talle_id: ropa.id,
      variantes: [variante(negro, s, { stock_inicial: 4, sku: "TAV-N-S" }), variante(negro, m, { stock_inicial: 0 }), variante(blanco, s), variante(blanco, m)],
    });
    expect(res.status).toBe(201);
    const producto = res.body.data;
    expect(producto.grupo_talle).toEqual({ id: ropa.id, nombre: "Ropa" });
    expect(producto.variantes.map((v) => v.nombre)).toEqual(["Negro · S", "Negro · M", "Blanco · S", "Blanco · M"]);
    expect(producto.variantes[0].color).toMatchObject({ nombre: "Negro", hex: "#111111" });
    expect(producto.variantes[0].talle).toMatchObject({ nombre: "S" });

    if (proyecto.modulos.stock) {
      // Con stock inicial (aunque sea 0) la variante controla stock; sin él, no.
      expect(producto.variantes.map((v) => v.controla_stock)).toEqual([true, true, false, false]);
      expect(producto.variantes[0].cantidad_disponible).toBe(4);
      const movimientos = await sequelize.query(`SELECT tipo, cantidad, motivo FROM ${DB_SCHEMA}.movimiento_stock`, { type: QueryTypes.SELECT });
      expect(movimientos).toEqual([{ tipo: "ingreso", cantidad: 4, motivo: "Stock inicial" }]);
    }
  });

  it("rechaza combinaciones repetidas, talles de otro grupo y talles sin grupo elegido", async () => {
    const { categoria, negro, ropa, jeans, s } = await preparar();
    const base = { categoria_id: categoria.id, nombre: "Remera", grupo_talle_id: ropa.id };

    const repetida = await post("/api/catalogo/productos", { ...base, variantes: [variante(negro, s), variante(negro, s)] });
    expect(repetida.status).toBe(400);
    expect(repetida.body.detalles[0]).toEqual({ campo: "variantes.1", mensaje: "Esa combinación de color y talle está repetida" });

    const otroGrupo = await post("/api/catalogo/productos", { ...base, variantes: [variante(negro, jeans.talles[0])] });
    expect(otroGrupo.status).toBe(400);
    expect(otroGrupo.body.detalles[0]).toEqual({ campo: "variantes.0.talle_id", mensaje: "El talle no es del grupo elegido" });

    const sinGrupo = await post("/api/catalogo/productos", { ...base, grupo_talle_id: null, variantes: [variante(negro, s)] });
    expect(sinGrupo.status).toBe(400);
    expect(sinGrupo.body.detalles[0]).toEqual({ campo: "grupo_talle_id", mensaje: "Elegí el grupo de talles" });

    const colorInexistente = await post("/api/catalogo/productos", { ...base, variantes: [variante({ id: 9999 }, s)] });
    expect(colorInexistente.status).toBe(400);
    expect(colorInexistente.body.detalles[0].campo).toBe("variantes.0.color_id");
  });

  it("un accesorio puede variar solo por color (sin grupo de talles)", async () => {
    const { categoria, negro, blanco } = await preparar();
    const res = await post("/api/catalogo/productos", { categoria_id: categoria.id, nombre: "Gorra", variantes: [variante(negro, null), variante(blanco, null)] });
    expect(res.status).toBe(201);
    expect(res.body.data.variantes.map((v) => v.nombre)).toEqual(["Negro", "Blanco"]);
  });

  it("al editar: suma un color nuevo con su stock, conserva un color dado de baja y no deja elegirlo en otra prenda", async () => {
    const { categoria, negro, blanco, ropa, s } = await preparar();
    const producto = (await post("/api/catalogo/productos", { categoria_id: categoria.id, nombre: "Remera", grupo_talle_id: ropa.id, variantes: [variante(negro, s)] })).body.data;

    await request(app).delete(`/api/catalogo/colores/${negro.id}`).set(...autorizacion(staff));
    const [actual] = producto.variantes;
    const editado = await put(`/api/catalogo/productos/${producto.id}`, {
      categoria_id: categoria.id,
      nombre: "Remera",
      grupo_talle_id: ropa.id,
      variantes: [
        { id: actual.id, color_id: negro.id, talle_id: s.id, precio: 16000, controla_stock: actual.controla_stock },
        variante(blanco, s, { precio: 16000, stock_inicial: 2 }),
      ],
    });
    expect(editado.status).toBe(200);
    expect(editado.body.data.variantes.map((v) => [v.nombre, v.precio])).toEqual([
      ["Negro · S", "16000.00"],
      ["Blanco · S", "16000.00"],
    ]);
    if (proyecto.modulos.stock) expect(editado.body.data.variantes[1].cantidad_disponible).toBe(2);

    const otra = await post("/api/catalogo/productos", { categoria_id: categoria.id, nombre: "Otra remera", grupo_talle_id: ropa.id, variantes: [variante(negro, s)] });
    expect(otra.status).toBe(400);
    expect(otra.body.detalles[0]).toEqual({ campo: "variantes.0.color_id", mensaje: "El color no existe" });
  });

  it("cada foto puede ser de un color de la prenda, y se le puede cambiar el color después", async () => {
    const { categoria, negro, blanco, ropa, s } = await preparar();
    const rojo = (await post("/api/catalogo/colores", { nombre: "Rojo", hex: "#FF0000" })).body.data;
    const producto = (await post("/api/catalogo/productos", { categoria_id: categoria.id, nombre: "Remera", grupo_talle_id: ropa.id, variantes: [variante(negro, s), variante(blanco, s)] })).body.data;
    const foto = (url, color_id) => post(`/api/catalogo/productos/${producto.id}/imagenes/url`, { url, color_id });

    const deNegro = await foto("https://fotos.com/negro.jpg", negro.id);
    expect(deNegro.status).toBe(201);
    expect(deNegro.body.data.color_id).toBe(negro.id);
    const general = (await foto("https://fotos.com/general.jpg")).body.data;
    expect(general.color_id).toBeNull();

    // Un color que la prenda no tiene no se puede asignar.
    const ajeno = await foto("https://fotos.com/rojo.jpg", rojo.id);
    expect(ajeno.status).toBe(400);
    expect(ajeno.body.detalles[0]).toEqual({ campo: "color_id", mensaje: "Ese color no está entre los de la prenda" });

    const cambio = await request(app).patch(`/api/catalogo/productos/${producto.id}/imagenes/${general.id}`).set(...autorizacion(staff)).send({ color_id: blanco.id });
    expect(cambio.status).toBe(200);
    expect(cambio.body.data.color_id).toBe(blanco.id);

    const publico = (await request(app).get(`/api/catalogo/productos/${producto.slug}`)).body.data;
    expect(publico.imagenes.map((i) => i.color_id)).toEqual([negro.id, blanco.id]);
  });

  it("filtra el catálogo por marca, color y talle (color y talle en la misma variante) y ofrece los filtros disponibles", async () => {
    const { categoria, negro, blanco, ropa, s, m } = await preparar();
    const taverniti = (await post("/api/catalogo/marcas", { nombre: "Taverniti" })).body.data;
    const levis = (await post("/api/catalogo/marcas", { nombre: "Levis" })).body.data;
    const prenda = (nombre, marca, variantes) => post("/api/catalogo/productos", { categoria_id: categoria.id, nombre, marca_id: marca.id, grupo_talle_id: ropa.id, variantes });
    await prenda("Remera negra S", taverniti, [variante(negro, s)]);
    await prenda("Remera blanca M", taverniti, [variante(blanco, m)]);
    await prenda("Remera Levis", levis, [variante(negro, m), variante(blanco, s, { activo: false })]);

    const nombres = async (query) => (await request(app).get(`/api/catalogo/productos?${query}`)).body.data.map((p) => p.nombre).sort();
    expect(await nombres(`color=${negro.id}`)).toEqual(["Remera Levis", "Remera negra S"]);
    // Negro y M en la MISMA variante: solo la Levis (la "negra S" es negra pero no M; la "blanca M" es M pero no negra).
    expect(await nombres(`color=${negro.id}&talle=${m.id}`)).toEqual(["Remera Levis"]);
    expect(await nombres(`marca=${taverniti.id}`)).toEqual(["Remera blanca M", "Remera negra S"]);
    expect(await nombres(`marca=${taverniti.id},${levis.id}&talle=${m.id}`)).toEqual(["Remera Levis", "Remera blanca M"]);
    // Una variante que no está a la venta no cuenta (Levis blanca S está desactivada).
    expect(await nombres(`color=${blanco.id}&talle=${s.id}`)).toEqual([]);

    const filtros = (await request(app).get(`/api/catalogo/productos/filtros?categoria=${categoria.id}`)).body.data;
    expect(filtros.marcas).toEqual([
      { id: levis.id, nombre: "Levis", cantidad: 1 },
      { id: taverniti.id, nombre: "Taverniti", cantidad: 2 },
    ]);
    // Mismo "orden" en el panel: desempata el nombre. La Levis blanca no cuenta (no está a la venta).
    expect(filtros.colores).toEqual([
      { id: blanco.id, nombre: "Blanco", hex: "#FFFFFF", cantidad: 1 },
      { id: negro.id, nombre: "Negro", hex: "#111111", cantidad: 2 },
    ]);
    expect(filtros.talles.map((t) => [t.grupo, t.nombre, t.cantidad])).toEqual([
      ["Ropa", "S", 1],
      ["Ropa", "M", 2],
    ]);

    const invalido = await request(app).get("/api/catalogo/productos?color=rojo");
    expect(invalido.status).toBe(400);
    const vacio = (await request(app).get("/api/catalogo/productos/filtros?q=nada-que-coincida")).body.data;
    expect(vacio).toEqual({ marcas: [], colores: [], talles: [] });
  });

  it("el detalle público trae color y talle de cada variante", async () => {
    const { categoria, negro, ropa, s } = await preparar();
    const producto = (await post("/api/catalogo/productos", { categoria_id: categoria.id, nombre: "Remera pública", grupo_talle_id: ropa.id, variantes: [variante(negro, s)] })).body.data;
    const publico = await request(app).get(`/api/catalogo/productos/${producto.slug}`);
    expect(publico.status).toBe(200);
    expect(publico.body.data.variantes[0]).toMatchObject({ nombre: "Negro · S", color: { hex: "#111111" }, talle: { nombre: "S" } });
    expect((await get(`/api/catalogo/productos/${producto.id}`)).body.data.grupo_talle_id).toBe(ropa.id);
  });
});
