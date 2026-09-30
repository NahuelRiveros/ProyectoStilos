import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { proyecto } from "compartido/proyecto.js";
import { crearApp } from "../../app.js";
import { sequelize } from "../../nucleo/db/sequelize.js";
import { autorizacion, crearRoles, crearUsuario, vaciarTablas } from "../../../tests/ayudantes.js";

const app = crearApp();
let staff, cliente;

beforeAll(async () => {
  await vaciarTablas("usuario_rol", "usuario", "rol");
  await crearRoles();
  staff = await crearUsuario({ email: "staff@atributos.com", roles: ["staff"] });
  cliente = await crearUsuario({ email: "cliente@atributos.com", roles: ["cliente"] });
});
beforeEach(() => vaciarTablas("talle", "grupo_talle", "color", "marca"));
afterAll(() => sequelize.close());

const api = {
  get: (url) => request(app).get(url),
  post: (url, body, usuario = staff) => request(app).post(url).set(...autorizacion(usuario)).send(body),
  put: (url, body, usuario = staff) => request(app).put(url).set(...autorizacion(usuario)).send(body),
  delete: (url, usuario = staff) => request(app).delete(url).set(...autorizacion(usuario)),
};

describe("Marcas", () => {
  it("crea, lista en orden alfabético, renombra y da de baja", async () => {
    const taverniti = (await api.post("/api/catalogo/marcas", { nombre: "Taverniti" })).body.data;
    await api.post("/api/catalogo/marcas", { nombre: "Adidas" });

    expect((await api.get("/api/catalogo/marcas")).body.data.map((m) => m.nombre)).toEqual(["Adidas", "Taverniti"]);

    const renombrada = await api.put(`/api/catalogo/marcas/${taverniti.id}`, { nombre: "Taverniti Jeans" });
    expect(renombrada.body.data.nombre).toBe("Taverniti Jeans");

    expect((await api.delete(`/api/catalogo/marcas/${taverniti.id}`)).status).toBe(204);
    expect((await api.get("/api/catalogo/marcas")).body.data.map((m) => m.nombre)).toEqual(["Adidas"]);
    // Dada de baja, el nombre queda libre para una marca nueva.
    expect((await api.post("/api/catalogo/marcas", { nombre: "taverniti jeans" })).status).toBe(201);
  });

  it("no acepta dos marcas con el mismo nombre (sin importar mayúsculas)", async () => {
    await api.post("/api/catalogo/marcas", { nombre: "Taverniti" });
    const repetida = await api.post("/api/catalogo/marcas", { nombre: "TAVERNITI" });
    expect(repetida.status).toBe(409);
    expect(repetida.body).toMatchObject({ codigo: "MARCA_DUPLICADA", mensaje: 'Ya existe la marca "TAVERNITI".' });
  });

  it("solo el personal del catálogo las gestiona; un cliente no", async () => {
    expect((await api.post("/api/catalogo/marcas", { nombre: "X" }, cliente)).status).toBe(403);
    expect((await request(app).post("/api/catalogo/marcas").send({ nombre: "X" })).status).toBe(401);
    expect((await api.delete("/api/catalogo/marcas/999")).status).toBe(404);
  });
});

describe("Colores", () => {
  it("guarda el hex en mayúsculas y ordena por 'orden'", async () => {
    await api.post("/api/catalogo/colores", { nombre: "Negro", hex: "#1a1a1a", orden: 2 });
    const blanco = (await api.post("/api/catalogo/colores", { nombre: "Blanco", hex: "#ffffff", orden: 1 })).body.data;
    expect(blanco.hex).toBe("#FFFFFF");
    expect((await api.get("/api/catalogo/colores")).body.data.map((c) => c.nombre)).toEqual(["Blanco", "Negro"]);
  });

  it("rechaza un hex inválido y un nombre repetido", async () => {
    const malo = await api.post("/api/catalogo/colores", { nombre: "Rojo", hex: "rojo" });
    expect(malo.status).toBe(400);
    expect(malo.body.detalles[0]).toMatchObject({ campo: "hex", mensaje: "El color tiene que tener el formato #RRGGBB" });

    await api.post("/api/catalogo/colores", { nombre: "Rojo", hex: "#FF0000" });
    expect((await api.post("/api/catalogo/colores", { nombre: "rojo", hex: "#EE0000" })).status).toBe(409);
  });
});

describe("Grupos de talles", () => {
  const nombres = (grupo) => grupo.talles.map((t) => t.nombre);

  it("crea el grupo con sus talles en el orden en que se cargaron", async () => {
    const res = await api.post("/api/catalogo/grupos-talle", { nombre: "Ropa", talles: [{ nombre: "S" }, { nombre: "M" }, { nombre: "L" }] });
    expect(res.status).toBe(201);
    expect(nombres(res.body.data)).toEqual(["S", "M", "L"]);
  });

  it("al editar: reordena, renombra (incluso intercambiando nombres), agrega y quita talles", async () => {
    const grupo = (await api.post("/api/catalogo/grupos-talle", { nombre: "Ropa", talles: [{ nombre: "S" }, { nombre: "M" }, { nombre: "L" }] })).body.data;
    const [s, m, l] = grupo.talles;

    const res = await api.put(`/api/catalogo/grupos-talle/${grupo.id}`, {
      nombre: "Ropa",
      talles: [{ id: l.id, nombre: "M" }, { id: m.id, nombre: "L" }, { nombre: "XL" }],
    });
    expect(res.status).toBe(200);
    expect(nombres(res.body.data)).toEqual(["M", "L", "XL"]);
    expect(res.body.data.talles[0].id).toBe(l.id);
    expect(res.body.data.talles.some((t) => t.id === s.id)).toBe(false);
  });

  it("rechaza talles repetidos, un grupo vacío y talles de otro grupo", async () => {
    const repetidos = await api.post("/api/catalogo/grupos-talle", { nombre: "Ropa", talles: [{ nombre: "M" }, { nombre: "m" }] });
    expect(repetidos.status).toBe(400);
    expect(repetidos.body.detalles[0]).toMatchObject({ campo: "talles.1.nombre", mensaje: 'El talle "m" está repetido' });

    expect((await api.post("/api/catalogo/grupos-talle", { nombre: "Vacío", talles: [] })).status).toBe(400);

    const ropa = (await api.post("/api/catalogo/grupos-talle", { nombre: "Ropa", talles: [{ nombre: "S" }] })).body.data;
    const jeans = (await api.post("/api/catalogo/grupos-talle", { nombre: "Jeans", talles: [{ nombre: "40" }] })).body.data;
    const ajeno = await api.put(`/api/catalogo/grupos-talle/${jeans.id}`, { nombre: "Jeans", talles: [{ id: ropa.talles[0].id, nombre: "S" }] });
    expect(ajeno.status).toBe(400);
  });

  it("carga los grupos sugeridos de la configuración sin duplicar los que ya existen", async () => {
    const sugeridos = proyecto.catalogo.grupos_talle_sugeridos ?? [];
    const primera = await api.post("/api/catalogo/grupos-talle/sugeridos", {});
    expect(primera.body.data.creados).toEqual(sugeridos.map((g) => g.nombre));

    const segunda = await api.post("/api/catalogo/grupos-talle/sugeridos", {});
    expect(segunda.body.data.creados).toEqual([]);

    const grupos = (await api.get("/api/catalogo/grupos-talle")).body.data;
    expect(grupos.map((g) => ({ nombre: g.nombre, talles: nombres(g) }))).toEqual(sugeridos);
  });

  it("al eliminar un grupo desaparece de la lista junto con sus talles", async () => {
    const grupo = (await api.post("/api/catalogo/grupos-talle", { nombre: "Calzado", talles: [{ nombre: "38" }] })).body.data;
    expect((await api.delete(`/api/catalogo/grupos-talle/${grupo.id}`)).status).toBe(204);
    expect((await api.get("/api/catalogo/grupos-talle")).body.data).toEqual([]);
  });
});
