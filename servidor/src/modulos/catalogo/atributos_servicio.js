import { Op } from "sequelize";
import { proyecto } from "compartido/proyecto.js";
import { sequelize } from "../../nucleo/db/sequelize.js";
import { Conflicto, DatosInvalidos, NoEncontrado } from "../../nucleo/errores.js";
import { Color, GrupoTalle, Marca, Talle } from "./modelos.js";

// Listas del catálogo que se cargan en el panel: marcas, colores y grupos de talles.
// Nada se borra físicamente (eliminado_en): los productos viejos siguen mostrando su marca o color.

const mismoNombre = (nombre) => sequelize.where(sequelize.fn("lower", sequelize.col("nombre")), nombre.toLowerCase());

async function exigirNombreLibre({ Modelo, nombre, idPropio = null, mensaje, codigo, transaction }) {
  const where = { eliminado_en: null, [Op.and]: mismoNombre(nombre) };
  if (idPropio) where.id = { [Op.ne]: idPropio };
  if (await Modelo.findOne({ where, attributes: ["id"], transaction })) throw new Conflicto(mensaje, codigo);
}

async function buscarActivo({ Modelo, id, mensaje, codigo, transaction }) {
  const fila = await Modelo.findOne({ where: { id, eliminado_en: null }, transaction });
  if (!fila) throw new NoEncontrado(mensaje, codigo);
  return fila;
}

// ── Marcas ──────────────────────────────────────────────────────────────────

const MARCA = { Modelo: Marca, mensaje: "La marca no existe.", codigo: "MARCA_NO_ENCONTRADA" };
const marcaDuplicada = (nombre) => ({ mensaje: `Ya existe la marca "${nombre}".`, codigo: "MARCA_DUPLICADA" });

export async function listarMarcas() {
  return Marca.findAll({ where: { eliminado_en: null }, attributes: ["id", "nombre"], order: [["nombre", "ASC"]], raw: true });
}

export async function crearMarca({ nombre }) {
  return sequelize.transaction(async (transaction) => {
    await exigirNombreLibre({ Modelo: Marca, nombre, ...marcaDuplicada(nombre), transaction });
    const marca = await Marca.create({ nombre }, { transaction });
    return { id: marca.id, nombre: marca.nombre };
  });
}

export async function actualizarMarca(id, { nombre }) {
  return sequelize.transaction(async (transaction) => {
    const marca = await buscarActivo({ ...MARCA, id, transaction });
    await exigirNombreLibre({ Modelo: Marca, nombre, idPropio: marca.id, ...marcaDuplicada(nombre), transaction });
    await marca.update({ nombre }, { transaction });
    return { id: marca.id, nombre: marca.nombre };
  });
}

export async function eliminarMarca(id) {
  return sequelize.transaction(async (transaction) => {
    const marca = await buscarActivo({ ...MARCA, id, transaction });
    await marca.update({ eliminado_en: new Date() }, { transaction });
  });
}

/**
 * Para la importación: id de cada marca por nombre (sin distinguir mayúsculas), creando las que
 * faltan. Devuelve Map(nombre en minúsculas → id). Va dentro de la transacción de la importación.
 */
export async function idsDeMarcas(nombres, { transaction }) {
  const pedidos = new Map();
  for (const nombre of nombres) if (nombre) pedidos.set(nombre.toLowerCase(), nombre);
  const ids = new Map();
  if (pedidos.size === 0) return ids;

  const existentes = await Marca.findAll({
    where: { eliminado_en: null, [Op.and]: sequelize.where(sequelize.fn("lower", sequelize.col("nombre")), { [Op.in]: [...pedidos.keys()] }) },
    attributes: ["id", "nombre"],
    transaction,
  });
  for (const m of existentes) ids.set(m.nombre.toLowerCase(), m.id);
  for (const [clave, nombre] of pedidos) {
    if (!ids.has(clave)) ids.set(clave, (await Marca.create({ nombre }, { transaction })).id);
  }
  return ids;
}

// ── Colores ─────────────────────────────────────────────────────────────────

const COLOR = { Modelo: Color, mensaje: "El color no existe.", codigo: "COLOR_NO_ENCONTRADO" };
const colorDuplicado = (nombre) => ({ mensaje: `Ya existe el color "${nombre}".`, codigo: "COLOR_DUPLICADO" });
const datosColor = (c) => ({ id: c.id, nombre: c.nombre, hex: c.hex, orden: c.orden });

export async function listarColores() {
  return Color.findAll({ where: { eliminado_en: null }, attributes: ["id", "nombre", "hex", "orden"], order: [["orden", "ASC"], ["nombre", "ASC"]], raw: true });
}

export async function crearColor({ nombre, hex, orden }) {
  return sequelize.transaction(async (transaction) => {
    await exigirNombreLibre({ Modelo: Color, nombre, ...colorDuplicado(nombre), transaction });
    return datosColor(await Color.create({ nombre, hex, orden }, { transaction }));
  });
}

export async function actualizarColor(id, { nombre, hex, orden }) {
  return sequelize.transaction(async (transaction) => {
    const color = await buscarActivo({ ...COLOR, id, transaction });
    await exigirNombreLibre({ Modelo: Color, nombre, idPropio: color.id, ...colorDuplicado(nombre), transaction });
    await color.update({ nombre, hex, orden }, { transaction });
    return datosColor(color);
  });
}

export async function eliminarColor(id) {
  return sequelize.transaction(async (transaction) => {
    const color = await buscarActivo({ ...COLOR, id, transaction });
    await color.update({ eliminado_en: new Date() }, { transaction });
  });
}

// ── Grupos de talles ────────────────────────────────────────────────────────

const GRUPO = { Modelo: GrupoTalle, mensaje: "El grupo de talles no existe.", codigo: "GRUPO_TALLE_NO_ENCONTRADO" };
const grupoDuplicado = (nombre) => ({ mensaje: `Ya existe el grupo de talles "${nombre}".`, codigo: "GRUPO_TALLE_DUPLICADO" });

async function obtenerGrupo(id, transaction) {
  const grupo = await GrupoTalle.findOne({
    where: { id, eliminado_en: null },
    attributes: ["id", "nombre", "orden"],
    include: [{ model: Talle, as: "talles", attributes: ["id", "nombre", "orden"], where: { eliminado_en: null }, required: false }],
    order: [[{ model: Talle, as: "talles" }, "orden", "ASC"]],
    transaction,
  });
  return grupo.get({ plain: true });
}

export async function listarGruposTalle() {
  const grupos = await GrupoTalle.findAll({
    where: { eliminado_en: null },
    attributes: ["id", "nombre", "orden"],
    include: [{ model: Talle, as: "talles", attributes: ["id", "nombre", "orden"], where: { eliminado_en: null }, required: false }],
    order: [["orden", "ASC"], ["nombre", "ASC"], [{ model: Talle, as: "talles" }, "orden", "ASC"]],
  });
  return grupos.map((g) => g.get({ plain: true }));
}

/**
 * Deja los talles del grupo exactamente como vienen, en ese orden: edita los que traen id,
 * crea los nuevos y da de baja los que ya no están.
 */
async function sincronizarTalles({ grupo_talle_id, talles, transaction }) {
  const actuales = await Talle.findAll({ where: { grupo_talle_id, eliminado_en: null }, transaction });
  const porId = new Map(actuales.map((t) => [t.id, t]));
  const ajeno = talles.find((t) => t.id && !porId.has(t.id));
  if (ajeno) throw new DatosInvalidos("Revisá los datos ingresados.", [{ campo: "talles", mensaje: `El talle ${ajeno.id} no pertenece a este grupo` }]);

  const quedan = new Set(talles.filter((t) => t.id).map((t) => t.id));
  for (const t of actuales) if (!quedan.has(t.id)) await t.update({ eliminado_en: new Date() }, { transaction });
  // Nombre provisorio primero: así se pueden intercambiar nombres (M ↔ L) sin chocar con el índice único.
  for (const t of talles) if (t.id) await porId.get(t.id).update({ nombre: `~${t.id}` }, { transaction });
  for (const [orden, t] of talles.entries()) {
    if (t.id) await porId.get(t.id).update({ nombre: t.nombre, orden }, { transaction });
    else await Talle.create({ grupo_talle_id, nombre: t.nombre, orden }, { transaction });
  }
}

export async function crearGrupoTalle({ nombre, orden, talles }) {
  return sequelize.transaction(async (transaction) => {
    await exigirNombreLibre({ Modelo: GrupoTalle, nombre, ...grupoDuplicado(nombre), transaction });
    const grupo = await GrupoTalle.create({ nombre, orden }, { transaction });
    await sincronizarTalles({ grupo_talle_id: grupo.id, talles: talles.map(({ nombre }) => ({ nombre })), transaction });
    return obtenerGrupo(grupo.id, transaction);
  });
}

export async function actualizarGrupoTalle(id, { nombre, orden, talles }) {
  return sequelize.transaction(async (transaction) => {
    const grupo = await buscarActivo({ ...GRUPO, id, transaction });
    await exigirNombreLibre({ Modelo: GrupoTalle, nombre, idPropio: grupo.id, ...grupoDuplicado(nombre), transaction });
    await grupo.update({ nombre, orden }, { transaction });
    await sincronizarTalles({ grupo_talle_id: grupo.id, talles, transaction });
    return obtenerGrupo(grupo.id, transaction);
  });
}

export async function eliminarGrupoTalle(id) {
  return sequelize.transaction(async (transaction) => {
    const grupo = await buscarActivo({ ...GRUPO, id, transaction });
    const ahora = new Date();
    await Talle.update({ eliminado_en: ahora }, { where: { grupo_talle_id: grupo.id, eliminado_en: null }, transaction });
    await grupo.update({ eliminado_en: ahora }, { transaction });
  });
}

/** Crea los grupos de proyecto.config.js → catalogo.grupos_talle_sugeridos que todavía no existen. */
export async function cargarGruposSugeridos() {
  const sugeridos = proyecto.catalogo.grupos_talle_sugeridos ?? [];
  return sequelize.transaction(async (transaction) => {
    const creados = [];
    for (const [orden, sugerido] of sugeridos.entries()) {
      const existe = await GrupoTalle.findOne({ where: { eliminado_en: null, [Op.and]: mismoNombre(sugerido.nombre) }, attributes: ["id"], transaction });
      if (existe) continue;
      const grupo = await GrupoTalle.create({ nombre: sugerido.nombre, orden }, { transaction });
      await sincronizarTalles({ grupo_talle_id: grupo.id, talles: sugerido.talles.map((nombre) => ({ nombre })), transaction });
      creados.push(sugerido.nombre);
    }
    return { creados };
  });
}
