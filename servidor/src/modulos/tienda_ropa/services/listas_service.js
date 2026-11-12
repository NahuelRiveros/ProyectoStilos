import { Op, UniqueConstraintError, col, fn, where as condicionSql } from "sequelize";
import { sequelize } from "../../../core/database/sequelize.js";
import { ErrorApp, noExiste } from "../../../core/services/common/errores.js";
import { CategoriaRopa, MarcaRopa, ColorRopa, GrupoTalle, Talle, GrupoCaracteristica, Caracteristica, GrupoCaracteristicaCategoria, Prenda, PrendaCaracteristica, PrendaVariante } from "../models/index.js";
import { armarArbol, creaCiclo, slug } from "../reglas.js";
import { CARACTERISTICAS_SUGERIDAS, CATEGORIAS_SUGERIDAS, COLORES_SUGERIDOS, GRUPOS_TALLE_SUGERIDOS, MARCAS_SUGERIDAS } from "../sugeridos.js";

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

/**
 * ROP-27 y ROP-36: el árbol sugerido de una tienda de ropa, sin duplicar (mismo nombre bajo la misma
 * categoría, sin importar mayúsculas). Antes carga los grupos de talles, para dejarlos sugeridos; a una
 * categoría que ya existía solo le completa los talles si no tenía. Devuelve cuántas categorías creó.
 */
export async function cargarCategoriasSugeridas() {
  await cargarGruposSugeridos();
  const grupos = new Map((await GrupoTalle.findAll({ attributes: ["id", "nombre"], raw: true })).map((g) => [g.nombre.toLowerCase(), g.id]));
  let creadas = 0;
  async function cargar(nodos, padre) {
    for (const [orden, nodo] of nodos.entries()) {
      const grupo_talle_id = nodo.grupo ? grupos.get(nodo.grupo.toLowerCase()) ?? null : null;
      let categoria = await CategoriaRopa.findOne({
        where: { [Op.and]: [condicionSql(fn("lower", col("nombre")), nodo.nombre.toLowerCase()), { padre_id: padre?.id ?? null }] },
      });
      if (!categoria) {
        categoria = await crearCategoria({ nombre: nodo.nombre, padre_id: padre?.id ?? null, grupo_talle_id, orden, activo: true });
        creadas++;
      } else if (grupo_talle_id && !categoria.grupo_talle_id) {
        await categoria.update({ grupo_talle_id, actualizado_en: new Date() });
      }
      if (nodo.hijas) await cargar(nodo.hijas, categoria);
    }
  }
  await cargar(CATEGORIAS_SUGERIDAS, null);
  return creadas;
}

/** ROP-36: el grupo de talles sugerido tiene que existir. */
async function verificarGrupo(grupoTalleId) {
  if (grupoTalleId && !await GrupoTalle.findByPk(grupoTalleId)) throw new ErrorApp("DATOS_INVALIDOS", "El grupo de talles elegido no existe.", 400);
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
  await verificarGrupo(datos.grupo_talle_id);
  return CategoriaRopa.create({ ...datos, slug: await slugLibre(CategoriaRopa, datos.nombre) });
}

export async function actualizarCategoria(id, datos) {
  const categoria = await buscar(CategoriaRopa, id, "La categoría no existe.");
  await verificarPadre(categoria.id, datos.padre_id);
  await verificarGrupo(datos.grupo_talle_id);
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

// ── Características (ROP-37) ────────────────────────────────────────────────────
export async function listarCaracteristicas() {
  const grupos = await GrupoCaracteristica.findAll({
    include: [
      { model: Caracteristica, as: "caracteristicas", attributes: ["id", "nombre", "orden"] },
      { model: GrupoCaracteristicaCategoria, as: "en_categorias", attributes: ["categoria_id"] },
    ],
    order: [["orden", "ASC"], ["nombre", "ASC"], [{ model: Caracteristica, as: "caracteristicas" }, "orden", "ASC"]],
  });
  return grupos.map((g) => {
    const { en_categorias, ...datos } = g.toJSON();
    return { ...datos, categorias: en_categorias.map((c) => c.categoria_id).sort((a, b) => a - b) };
  });
}

/** ROP-59: reemplaza las categorías del grupo (todas tienen que existir). */
async function guardarCategoriasDelGrupo(grupoId, categorias, transaction) {
  if (await CategoriaRopa.count({ where: { id: categorias }, transaction }) !== categorias.length) {
    throw new ErrorApp("DATOS_INVALIDOS", "Hay categorías que no existen.", 400);
  }
  await GrupoCaracteristicaCategoria.destroy({ where: { grupo_caracteristica_id: grupoId }, transaction });
  if (categorias.length) await GrupoCaracteristicaCategoria.bulkCreate(categorias.map((categoria_id) => ({ grupo_caracteristica_id: grupoId, categoria_id })), { transaction });
}

const grupoRepetido = (nombre) => `Ya existe el grupo "${nombre}".`;

export async function crearGrupoCaracteristica({ valores, categorias = [], ...grupo }) {
  return nombreUnico(() => sequelize.transaction(async (transaction) => {
    const creado = await GrupoCaracteristica.create(grupo, { transaction });
    await Caracteristica.bulkCreate(valores.map((nombre, orden) => ({ grupo_caracteristica_id: creado.id, nombre, orden })), { transaction });
    await guardarCategoriasDelGrupo(creado.id, categorias, transaction);
    return creado;
  }), grupoRepetido(grupo.nombre));
}

/** Como los talles: los valores que siguen conservan su id; los que se sacan, solo si ninguna prenda los usa. */
export async function actualizarGrupoCaracteristica(id, { valores, categorias = [], ...grupo }) {
  const actual = await buscar(GrupoCaracteristica, id, "El grupo de características no existe.");
  return nombreUnico(() => sequelize.transaction(async (transaction) => {
    await actual.update({ ...grupo, actualizado_en: new Date() }, { transaction });
    const existentes = await Caracteristica.findAll({ where: { grupo_caracteristica_id: id }, transaction });
    const quitar = existentes.filter((c) => !valores.includes(c.nombre));
    if (quitar.length) {
      const usados = await PrendaCaracteristica.count({ where: { caracteristica_id: quitar.map((c) => c.id) }, transaction });
      if (usados) throw new ErrorApp("EN_USO", `No se pueden sacar ${quitar.map((c) => c.nombre).join(", ")}: hay prendas cargadas con eso.`, 409);
      await Caracteristica.destroy({ where: { id: quitar.map((c) => c.id) }, transaction });
    }
    const porNombre = new Map(existentes.map((c) => [c.nombre, c]));
    for (const [orden, nombre] of valores.entries()) {
      const valor = porNombre.get(nombre);
      if (valor) await valor.update({ orden }, { transaction });
      else await Caracteristica.create({ grupo_caracteristica_id: id, nombre, orden }, { transaction });
    }
    await guardarCategoriasDelGrupo(id, categorias, transaction);
    return actual;
  }), grupoRepetido(grupo.nombre));
}

export async function eliminarGrupoCaracteristica(id) {
  const grupo = await buscar(GrupoCaracteristica, id, "El grupo de características no existe.");
  const prendas = await PrendaCaracteristica.count({
    include: [{ model: Caracteristica, as: "caracteristica", attributes: [], where: { grupo_caracteristica_id: id } }],
    distinct: true, col: "prenda_id",
  });
  if (prendas) throw enUso(prendas, "prendas", "Sacáselo a esas prendas primero.");
  await grupo.destroy();
}

/**
 * Suma los grupos y los valores que faltan, sin duplicar (sin importar mayúsculas). Devuelve cuántos valores agregó.
 * ROP-61: a los grupos sin categorías les pone las sugeridas que existan en el panel (no toca lo ya elegido).
 */
export async function cargarCaracteristicasSugeridas() {
  const categorias = await CategoriaRopa.findAll({ attributes: ["id", "nombre"], raw: true });
  const idsLlamadas = (nombres = []) => {
    const buscados = new Set(nombres.map((n) => n.toLowerCase()));
    return categorias.filter((c) => buscados.has(c.nombre.toLowerCase())).map((c) => c.id);
  };
  let agregados = 0;
  for (const [orden, sugerido] of CARACTERISTICAS_SUGERIDAS.entries()) {
    const grupo = await GrupoCaracteristica.findOne({ where: condicionSql(fn("lower", col("nombre")), sugerido.nombre.toLowerCase()) });
    if (!grupo) {
      await crearGrupoCaracteristica({ nombre: sugerido.nombre, orden, valores: sugerido.valores, categorias: idsLlamadas(sugerido.categorias) });
      agregados += sugerido.valores.length;
      continue;
    }
    const sinCategorias = !await GrupoCaracteristicaCategoria.count({ where: { grupo_caracteristica_id: grupo.id } });
    const sugeridas = idsLlamadas(sugerido.categorias);
    if (sinCategorias && sugeridas.length) {
      await GrupoCaracteristicaCategoria.bulkCreate(sugeridas.map((categoria_id) => ({ grupo_caracteristica_id: grupo.id, categoria_id })));
    }
    const nuevos = await faltantes(Caracteristica, sugerido.valores, { grupo_caracteristica_id: grupo.id });
    // Los nuevos van al final: no se desordena lo que el negocio ya acomodó.
    const desde = await Caracteristica.count({ where: { grupo_caracteristica_id: grupo.id } });
    if (nuevos.length) await Caracteristica.bulkCreate(nuevos.map((nombre, i) => ({ grupo_caracteristica_id: grupo.id, nombre, orden: desde + i })));
    agregados += nuevos.length;
  }
  return agregados;
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
