import { Op, UniqueConstraintError } from "sequelize";
import { sequelize } from "../../../core/database/sequelize.js";
import { ErrorApp, noExiste } from "../../../core/services/common/errores.js";
import { CategoriaRopa, MarcaRopa, DisenoRopa, ColorRopa, GrupoTalle, Talle, Prenda, PrendaVariante } from "../models/index.js";
import { armarArbol, creaCiclo, slug } from "../reglas.js";
import { CATEGORIAS_SUGERIDAS, COLORES_SUGERIDOS, DISENOS_SUGERIDOS, GRUPOS_TALLE_SUGERIDOS, MARCAS_SUGERIDAS } from "../sugeridos.js";

// Listas del panel (ROP-01 a ROP-04). Reciben datos validados por reglas.js y lanzan ErrorApp.

const enUso = (cuantas, que, consejo = "") =>
  new ErrorApp("EN_USO", `No se puede borrar: lo usan ${cuantas} ${que}.${consejo ? ` ${consejo}` : ""}`, 409);

/** Traduce el "nombre repetido" de la base a un mensaje claro. */
async function nombreUnico(accion, mensaje) {
  try { return await accion(); } catch (error) {
    if (error instanceof UniqueConstraintError) throw new ErrorApp("NOMBRE_DUPLICADO", mensaje, 409);
    throw error;
  }
}

async function buscar(Modelo, id, mensaje) {
  const fila = await Modelo.findByPk(id);
  if (!fila) throw noExiste(mensaje);
  return fila;
}

/** El slug de la URL no se puede repetir: "remeras", "remeras-2"… */
export async function slugLibre(Modelo, texto, excluirId = null) {
  const base = slug(texto);
  const usados = new Set((await Modelo.findAll({
    where: { slug: { [Op.like]: `${base}%` }, ...(excluirId ? { id: { [Op.ne]: excluirId } } : {}) },
    attributes: ["slug"],
  })).map((f) => f.slug));
  let candidato = base;
  for (let n = 2; usados.has(candidato); n++) candidato = `${base}-${n}`;
  return candidato;
}

/** ROP-27: Mujer, Hombre, Niños y Calzado como categorías principales, sin duplicar. */
export async function cargarCategoriasSugeridas() {
  const nuevas = await faltantes(CategoriaRopa, CATEGORIAS_SUGERIDAS, { padre_id: null });
  for (const nombre of nuevas) await crearCategoria({ nombre, padre_id: null, orden: CATEGORIAS_SUGERIDAS.indexOf(nombre), activo: true });
  return nuevas.length;
}

// ── Categorías (ROP-01) ─────────────────────────────────────────────────────────
export async function listarCategorias() {
  const filas = await CategoriaRopa.findAll({ order: [["orden", "ASC"], ["nombre", "ASC"]], raw: true });
  const conteos = await Prenda.count({ group: ["categoria_id"] });
  const prendasPor = new Map(conteos.map((c) => [c.categoria_id, Number(c.count)]));
  return armarArbol(filas.map((c) => ({ ...c, prendas: prendasPor.get(c.id) ?? 0 })));
}

async function verificarPadre(id, padre_id) {
  if (padre_id == null) return;
  await buscar(CategoriaRopa, padre_id, "La categoría de arriba no existe.");
  if (id && creaCiclo(await CategoriaRopa.findAll({ attributes: ["id", "padre_id"], raw: true }), id, padre_id)) {
    throw new ErrorApp("CATEGORIA_CICLO", "Una categoría no puede ir adentro de sí misma ni de sus subcategorías.", 400);
  }
}

export async function crearCategoria(datos) {
  await verificarPadre(null, datos.padre_id);
  return CategoriaRopa.create({ ...datos, slug: await slugLibre(CategoriaRopa, datos.nombre) });
}

export async function actualizarCategoria(id, datos) {
  const categoria = await buscar(CategoriaRopa, id, "La categoría no existe.");
  await verificarPadre(categoria.id, datos.padre_id);
  const cambioNombre = datos.nombre !== categoria.nombre;
  return categoria.update({
    ...datos,
    ...(cambioNombre ? { slug: await slugLibre(CategoriaRopa, datos.nombre, categoria.id) } : {}),
    actualizado_en: new Date(),
  });
}

export async function eliminarCategoria(id) {
  const categoria = await buscar(CategoriaRopa, id, "La categoría no existe.");
  const hijas = await CategoriaRopa.count({ where: { padre_id: id } });
  if (hijas) throw enUso(hijas, "subcategorías", "Movelas o borralas primero.");
  const prendas = await Prenda.count({ where: { categoria_id: id } });
  if (prendas) throw enUso(prendas, "prendas", "Pasalas a otra categoría primero.");
  await categoria.destroy();
}

// ── Marcas (ROP-02) ─────────────────────────────────────────────────────────────
export const listarMarcas = () => MarcaRopa.findAll({ order: [["nombre", "ASC"]] });

export const crearMarca = (datos) => nombreUnico(() => MarcaRopa.create(datos), `Ya existe la marca "${datos.nombre}".`);

export async function actualizarMarca(id, datos) {
  const marca = await buscar(MarcaRopa, id, "La marca no existe.");
  return nombreUnico(() => marca.update({ ...datos, actualizado_en: new Date() }), `Ya existe la marca "${datos.nombre}".`);
}

export async function eliminarMarca(id) {
  const marca = await buscar(MarcaRopa, id, "La marca no existe.");
  const prendas = await Prenda.count({ where: { marca_id: id } });
  if (prendas) throw enUso(prendas, "prendas", "Si ya no la usás, desactivala.");
  await marca.destroy();
}

/** Nombres sugeridos que todavía no están (sin distinguir mayúsculas). */
async function faltantes(Modelo, nombres, where = {}) {
  const existentes = new Set((await Modelo.findAll({ where, attributes: ["nombre"], raw: true })).map((f) => f.nombre.toLowerCase()));
  return nombres.filter((n) => !existentes.has(n.toLowerCase()));
}

/** ROP-24: suma las marcas que vende Stilos sin duplicar. Devuelve cuántas agregó. */
export async function cargarMarcasSugeridas() {
  const nuevas = await faltantes(MarcaRopa, MARCAS_SUGERIDAS);
  if (nuevas.length) await MarcaRopa.bulkCreate(nuevas.map((nombre) => ({ nombre })));
  return nuevas.length;
}

// ── Diseños (ROP-23) ────────────────────────────────────────────────────────────
export const listarDisenos = () => DisenoRopa.findAll({ order: [["orden", "ASC"], ["nombre", "ASC"]] });

export const crearDiseno = (datos) => nombreUnico(() => DisenoRopa.create(datos), `Ya existe el diseño "${datos.nombre}".`);

export async function actualizarDiseno(id, datos) {
  const diseno = await buscar(DisenoRopa, id, "El diseño no existe.");
  return nombreUnico(() => diseno.update({ ...datos, actualizado_en: new Date() }), `Ya existe el diseño "${datos.nombre}".`);
}

export async function eliminarDiseno(id) {
  const diseno = await buscar(DisenoRopa, id, "El diseño no existe.");
  const prendas = await Prenda.count({ where: { diseno_id: id } });
  if (prendas) throw enUso(prendas, "prendas");
  await diseno.destroy();
}

export async function cargarDisenosSugeridos() {
  const nuevos = await faltantes(DisenoRopa, DISENOS_SUGERIDOS);
  if (nuevos.length) await DisenoRopa.bulkCreate(nuevos.map((nombre) => ({ nombre, orden: DISENOS_SUGERIDOS.indexOf(nombre) })));
  return nuevos.length;
}

// ── Colores (ROP-03) ────────────────────────────────────────────────────────────
export const listarColores = () => ColorRopa.findAll({ order: [["orden", "ASC"], ["nombre", "ASC"]] });

export const crearColor = (datos) => nombreUnico(() => ColorRopa.create(datos), `Ya existe el color "${datos.nombre}".`);

export async function actualizarColor(id, datos) {
  const color = await buscar(ColorRopa, id, "El color no existe.");
  return nombreUnico(() => color.update({ ...datos, actualizado_en: new Date() }), `Ya existe el color "${datos.nombre}".`);
}

export async function eliminarColor(id) {
  const color = await buscar(ColorRopa, id, "El color no existe.");
  const prendas = await PrendaVariante.count({ where: { color_id: id }, distinct: true, col: "prenda_id" });
  if (prendas) throw enUso(prendas, "prendas");
  await color.destroy();
}

/** Suma los que faltan, sin duplicar (no distingue mayúsculas). Devuelve cuántos agregó. */
export async function cargarColoresSugeridos() {
  const existentes = new Set((await ColorRopa.findAll({ attributes: ["nombre"], raw: true })).map((c) => c.nombre.toLowerCase()));
  const nuevos = COLORES_SUGERIDOS.filter((c) => !existentes.has(c.nombre.toLowerCase()));
  if (nuevos.length) await ColorRopa.bulkCreate(nuevos);
  return nuevos.length;
}

// ── Grupos de talles (ROP-04) ───────────────────────────────────────────────────
export const listarGruposTalle = () => GrupoTalle.findAll({
  include: [{ model: Talle, as: "talles", attributes: ["id", "nombre", "orden"] }],
  order: [["orden", "ASC"], ["nombre", "ASC"], [{ model: Talle, as: "talles" }, "orden", "ASC"]],
});

export async function crearGrupoTalle({ talles, ...grupo }) {
  return nombreUnico(() => sequelize.transaction(async (transaction) => {
    const creado = await GrupoTalle.create(grupo, { transaction });
    await Talle.bulkCreate(talles.map((nombre, orden) => ({ grupo_talle_id: creado.id, nombre, orden })), { transaction });
    return creado;
  }), `Ya existe el grupo "${grupo.nombre}".`);
}

/** Los talles que se sacan solo se borran si ninguna prenda los usa. */
export async function actualizarGrupoTalle(id, { talles, ...grupo }) {
  const actual = await buscar(GrupoTalle, id, "El grupo de talles no existe.");
  return nombreUnico(() => sequelize.transaction(async (transaction) => {
    await actual.update({ ...grupo, actualizado_en: new Date() }, { transaction });
    const existentes = await Talle.findAll({ where: { grupo_talle_id: id }, transaction });
    const quitar = existentes.filter((t) => !talles.includes(t.nombre));
    if (quitar.length) {
      const usados = await PrendaVariante.count({ where: { talle_id: quitar.map((t) => t.id) }, transaction });
      if (usados) throw new ErrorApp("EN_USO", `No se pueden sacar ${quitar.map((t) => t.nombre).join(", ")}: hay prendas cargadas con esos talles.`, 409);
      await Talle.destroy({ where: { id: quitar.map((t) => t.id) }, transaction });
    }
    const porNombre = new Map(existentes.map((t) => [t.nombre, t]));
    for (const [orden, nombre] of talles.entries()) {
      const talle = porNombre.get(nombre);
      if (talle) await talle.update({ orden }, { transaction });
      else await Talle.create({ grupo_talle_id: id, nombre, orden }, { transaction });
    }
    return actual;
  }), `Ya existe el grupo "${grupo.nombre}".`);
}

export async function eliminarGrupoTalle(id) {
  const grupo = await buscar(GrupoTalle, id, "El grupo de talles no existe.");
  const prendas = await Prenda.count({ where: { grupo_talle_id: id } });
  if (prendas) throw enUso(prendas, "prendas");
  await grupo.destroy();
}

export async function cargarGruposSugeridos() {
  const existentes = new Set((await GrupoTalle.findAll({ attributes: ["nombre"], raw: true })).map((g) => g.nombre.toLowerCase()));
  const nuevos = GRUPOS_TALLE_SUGERIDOS.filter((g) => !existentes.has(g.nombre.toLowerCase()));
  // El orden es el de la lista sugerida: un grupo que se suma después (Niños) no queda primero.
  for (const grupo of nuevos) await crearGrupoTalle({ ...grupo, orden: GRUPOS_TALLE_SUGERIDOS.indexOf(grupo) });
  return nuevos.length;
}
