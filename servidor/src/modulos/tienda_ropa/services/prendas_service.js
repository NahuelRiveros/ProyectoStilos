import { Op } from "sequelize";
import { sequelize } from "../../../core/database/sequelize.js";
import { ErrorApp, noExiste } from "../../../core/services/common/errores.js";
import { normalizarPaginacion, armarPaginacion } from "../../../core/services/common/pagination.js";
import { CategoriaRopa, MarcaRopa, ColorRopa, GrupoTalle, Talle, Prenda, PrendaVariante, PrendaImagen } from "../models/index.js";
import { conDescendientes } from "../reglas.js";
import { slugLibre } from "./listas_service.js";

// Prendas del panel (ROP-05 a ROP-09). Datos validados por esquemaPrenda; errores como ErrorApp.

const POR_PAGINA = 20;
const ORDEN_FOTOS = [["orden", "ASC"], ["id", "ASC"]];

/** Filtro de texto, categoría (con subcategorías), marca, color y talle: compartido con la tienda. */
export async function wherePrendas({ q, categoria, marca, color, talle }) {
  const condiciones = [];
  if (q) condiciones.push({ nombre: { [Op.iLike]: `%${q}%` } });
  if (categoria) {
    const todas = await CategoriaRopa.findAll({ attributes: ["id", "padre_id"], raw: true });
    condiciones.push({ categoria_id: conDescendientes(todas, categoria) });
  }
  if (marca) condiciones.push({ marca_id: marca });
  if (color || talle) {
    // Color y talle se cumplen en la MISMA variante y disponible: "remera roja talle M que haya".
    const variantes = await PrendaVariante.findAll({
      where: { disponible: true, ...(color ? { color_id: color } : {}), ...(talle ? { talle_id: talle } : {}) },
      attributes: ["prenda_id"], raw: true,
    });
    condiciones.push({ id: [...new Set(variantes.map((v) => v.prenda_id))] });
  }
  return condiciones.length ? { [Op.and]: condiciones } : {};
}

export async function listarPrendas({ estado, pagina, ...filtros }) {
  const { page, limit, offset } = normalizarPaginacion({ page: pagina, limit: POR_PAGINA });
  const where = await wherePrendas(filtros);
  if (estado !== "todas") where.activo = estado === "activas";
  const { rows, count } = await Prenda.findAndCountAll({
    where,
    include: [
      { model: CategoriaRopa, as: "categoria", attributes: ["id", "nombre"] },
      { model: MarcaRopa, as: "marca", attributes: ["id", "nombre"] },
    ],
    order: [["actualizado_en", "DESC"]],
    limit, offset, distinct: true,
  });
  const ids = rows.map((p) => p.id);
  const [fotos, variantes] = await Promise.all([
    PrendaImagen.findAll({ where: { prenda_id: ids }, order: ORDEN_FOTOS, raw: true }),
    PrendaVariante.findAll({ where: { prenda_id: ids }, attributes: ["prenda_id", "disponible"], raw: true }),
  ]);
  const items = rows.map((p) => {
    const suyas = variantes.filter((v) => v.prenda_id === p.id);
    return {
      ...p.toJSON(),
      foto: fotos.find((f) => f.prenda_id === p.id)?.url ?? null,
      variantes_total: suyas.length,
      variantes_agotadas: suyas.filter((v) => !v.disponible).length,
    };
  });
  return { items, paginacion: armarPaginacion({ page, limit, total: count }) };
}

export async function obtenerPrenda(id) {
  const prenda = await Prenda.findByPk(id, {
    include: [
      { model: PrendaVariante, as: "variantes", attributes: ["id", "color_id", "talle_id", "disponible"] },
      { model: PrendaImagen, as: "imagenes", attributes: ["id", "color_id", "url", "orden"] },
    ],
    order: [[{ model: PrendaImagen, as: "imagenes" }, "orden", "ASC"]],
  });
  if (!prenda) throw noExiste("La prenda no existe.");
  return prenda;
}

/** Que la categoría, la marca, los colores y los talles existan, y los talles sean del grupo elegido. */
async function verificarReferencias(datos, transaction) {
  const falta = (mensaje) => new ErrorApp("DATOS_INVALIDOS", mensaje, 400);
  if (!await CategoriaRopa.findByPk(datos.categoria_id, { transaction })) throw falta("La categoría elegida no existe.");
  if (datos.marca_id && !await MarcaRopa.findByPk(datos.marca_id, { transaction })) throw falta("La marca elegida no existe.");
  if (!await GrupoTalle.findByPk(datos.grupo_talle_id, { transaction })) throw falta("El grupo de talles no existe.");
  const tallesDelGrupo = new Set((await Talle.findAll({ where: { grupo_talle_id: datos.grupo_talle_id }, attributes: ["id"], raw: true, transaction })).map((t) => t.id));
  if (datos.variantes.some((v) => !tallesDelGrupo.has(v.talle_id))) throw falta("Hay talles que no son del grupo elegido.");
  const colores = [...new Set(datos.variantes.map((v) => v.color_id))];
  if (await ColorRopa.count({ where: { id: colores }, transaction }) !== colores.length) throw falta("Hay colores que no existen.");
}

/** Variantes: las que siguen conservan su id (el pedido guardado en el navegador las usa). */
async function guardarVariantes(prendaId, variantes, transaction) {
  const actuales = await PrendaVariante.findAll({ where: { prenda_id: prendaId }, transaction });
  const clave = (v) => `${v.color_id}-${v.talle_id}`;
  const nuevas = new Map(variantes.map((v) => [clave(v), v]));
  const sobran = actuales.filter((v) => !nuevas.has(clave(v))).map((v) => v.id);
  if (sobran.length) await PrendaVariante.destroy({ where: { id: sobran }, transaction });
  for (const actual of actuales) {
    const nueva = nuevas.get(clave(actual));
    if (nueva && nueva.disponible !== actual.disponible) await actual.update({ disponible: nueva.disponible }, { transaction });
    nuevas.delete(clave(actual));
  }
  if (nuevas.size) await PrendaVariante.bulkCreate([...nuevas.values()].map((v) => ({ ...v, prenda_id: prendaId })), { transaction });
}

async function guardarImagenes(prendaId, imagenes, transaction) {
  await PrendaImagen.destroy({ where: { prenda_id: prendaId }, transaction });
  if (imagenes.length) await PrendaImagen.bulkCreate(imagenes.map((img, orden) => ({ ...img, prenda_id: prendaId, orden })), { transaction });
}

export async function crearPrenda({ variantes, imagenes, ...datos }) {
  const id = await sequelize.transaction(async (transaction) => {
    await verificarReferencias({ ...datos, variantes }, transaction);
    const prenda = await Prenda.create({ ...datos, slug: await slugLibre(Prenda, datos.nombre) }, { transaction });
    await guardarVariantes(prenda.id, variantes, transaction);
    await guardarImagenes(prenda.id, imagenes, transaction);
    return prenda.id;
  });
  return obtenerPrenda(id);
}

export async function actualizarPrenda(id, { variantes, imagenes, ...datos }) {
  const prenda = await Prenda.findByPk(id);
  if (!prenda) throw noExiste("La prenda no existe.");
  await sequelize.transaction(async (transaction) => {
    await verificarReferencias({ ...datos, variantes }, transaction);
    const slugNuevo = datos.nombre !== prenda.nombre ? await slugLibre(Prenda, datos.nombre, prenda.id) : prenda.slug;
    await prenda.update({ ...datos, slug: slugNuevo, actualizado_en: new Date() }, { transaction });
    await guardarVariantes(prenda.id, variantes, transaction);
    await guardarImagenes(prenda.id, imagenes, transaction);
  });
  return obtenerPrenda(id);
}

export async function cambiarEstadoPrenda(id, activo) {
  const prenda = await Prenda.findByPk(id);
  if (!prenda) throw noExiste("La prenda no existe.");
  return prenda.update({ activo, actualizado_en: new Date() });
}

/** Los pedidos guardan una copia de la prenda: borrarla no los afecta. */
export async function eliminarPrenda(id) {
  const prenda = await Prenda.findByPk(id);
  if (!prenda) throw noExiste("La prenda no existe.");
  await prenda.destroy();
}
