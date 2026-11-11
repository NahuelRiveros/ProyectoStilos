import { Op } from "sequelize";
import { noExiste } from "../../../core/services/common/errores.js";
import { normalizarPaginacion, armarPaginacion } from "../../../core/services/common/pagination.js";
import { CategoriaRopa, MarcaRopa, DisenoRopa, ColorRopa, GrupoTalle, Talle, Prenda, PrendaVariante, PrendaImagen } from "../models/index.js";
import { armarArbol, conDescendientes } from "../reglas.js";
import { otrosColores, wherePrendas } from "./prendas_service.js";

// Tienda pública (ROP-10 a ROP-12): solo prendas activas de categorías visibles.

const POR_PAGINA = 24;
const aNumero = (v) => (v === null || v === undefined ? null : Number(v));

/** Una categoría se ve si está activa y todas las de arriba también. */
async function categoriasVisibles() {
  const todas = await CategoriaRopa.findAll({ order: [["orden", "ASC"], ["nombre", "ASC"]], raw: true });
  const porId = new Map(todas.map((c) => [c.id, c]));
  const visible = (c) => c.activo && (!c.padre_id || (porId.has(c.padre_id) && visible(porId.get(c.padre_id))));
  return todas.filter(visible);
}

export async function arbolCategorias() {
  return armarArbol((await categoriasVisibles()).map(({ id, nombre, slug, padre_id }) => ({ id, nombre, slug, padre_id })));
}

/**
 * Marcas, colores, talles y diseños que de verdad se pueden comprar hoy: el filtro nunca da vacío por
 * un valor sin prendas. ROP-28: con `categoria`, solo lo de esa categoría (en Calzado, solo números de
 * calzado); los talles vienen agrupados por su grupo (Ropa, Jeans, Calzado, Niños).
 */
export async function opcionesDeFiltro({ categoria } = {}) {
  const visibles = await categoriasVisibles();
  const dentro = categoria ? new Set(conDescendientes(visibles, categoria)) : null;
  const categorias = visibles.map((c) => c.id).filter((id) => !dentro || dentro.has(id));
  const variantes = await PrendaVariante.findAll({
    where: { disponible: true },
    include: [{ model: Prenda, as: "prenda", attributes: ["marca_id", "diseno_id"], where: { activo: true, categoria_id: categorias } }],
    attributes: ["color_id", "talle_id"],
  });
  const ids = (campo) => [...new Set(variantes.map((v) => v[campo]))];
  const dePrenda = (campo) => [...new Set(variantes.map((v) => v.prenda[campo]).filter(Boolean))];
  const [marcas, colores, grupos, disenos] = await Promise.all([
    MarcaRopa.findAll({ where: { id: dePrenda("marca_id"), activo: true }, attributes: ["id", "nombre"], order: [["nombre", "ASC"]] }),
    ColorRopa.findAll({ where: { id: ids("color_id") }, attributes: ["id", "nombre", "hex"], order: [["orden", "ASC"], ["nombre", "ASC"]] }),
    GrupoTalle.findAll({
      attributes: ["id", "nombre"],
      include: [{ model: Talle, as: "talles", attributes: ["id", "nombre", "orden"], where: { id: ids("talle_id") } }],
      order: [["orden", "ASC"], ["nombre", "ASC"], [{ model: Talle, as: "talles" }, "orden", "ASC"]],
    }),
    DisenoRopa.findAll({ where: { id: dePrenda("diseno_id") }, attributes: ["id", "nombre"], order: [["orden", "ASC"], ["nombre", "ASC"]] }),
  ]);
  return { marcas, colores, grupos_talle: grupos, disenos };
}

/** ROP-26: marcas para el inicio, solo las activas que tienen alguna prenda a la vista. */
export async function marcasTienda() {
  const visibles = (await categoriasVisibles()).map((c) => c.id);
  const usadas = await Prenda.findAll({ where: { activo: true, categoria_id: visibles }, attributes: ["marca_id"], group: ["marca_id"], raw: true });
  return MarcaRopa.findAll({
    where: { id: usadas.map((p) => p.marca_id).filter(Boolean), activo: true },
    attributes: ["id", "nombre", "logo_url"], order: [["nombre", "ASC"]],
  });
}

// El id al final desempata: sin él, dos prendas al mismo precio pueden repetirse entre páginas.
const ORDEN = {
  novedades: [["creado_en", "DESC"], ["id", "DESC"]],
  menor_precio: [["precio", "ASC"], ["id", "DESC"]],
  mayor_precio: [["precio", "DESC"], ["id", "DESC"]],
};

export async function listarCatalogo({ pagina, orden = "novedades", ofertas = false, ...filtros }) {
  const { page, limit, offset } = normalizarPaginacion({ page: pagina, limit: POR_PAGINA });
  const visibles = (await categoriasVisibles()).map((c) => c.id);
  const condiciones = [await wherePrendas(filtros), { activo: true, categoria_id: visibles }];
  // ROP-17: el esquema de la prenda asegura que precio_anterior, si está, es mayor que el precio.
  if (ofertas) condiciones.push({ precio_anterior: { [Op.ne]: null } });
  const { rows, count } = await Prenda.findAndCountAll({
    where: { [Op.and]: condiciones }, attributes: ATRIBUTOS_TARJETA, order: ORDEN[orden], limit, offset,
  });
  return { items: await tarjetas(rows), paginacion: armarPaginacion({ page, limit, total: count }) };
}

const ATRIBUTOS_TARJETA = ["id", "slug", "nombre", "precio", "precio_anterior", "marca_id"];
const MAX_RELACIONADAS = 4; // ROP-19

/** Lo que muestra la tarjeta de la grilla: foto, colores disponibles y si está agotada. */
async function tarjetas(rows) {
  const ids = rows.map((p) => p.id);
  if (!ids.length) return [];
  const [fotos, variantes] = await Promise.all([
    PrendaImagen.findAll({ where: { prenda_id: ids }, order: [["orden", "ASC"]], raw: true }),
    PrendaVariante.findAll({
      where: { prenda_id: ids, disponible: true },
      include: [{ model: ColorRopa, as: "color", attributes: ["id", "nombre", "hex"] }],
      attributes: ["prenda_id", "color_id"],
    }),
  ]);
  return rows.map((p) => {
    const colores = new Map(variantes.filter((v) => v.prenda_id === p.id).map((v) => [v.color.id, v.color.toJSON()]));
    const suyas = fotos.filter((f) => f.prenda_id === p.id);
    return {
      id: p.id, slug: p.slug, nombre: p.nombre, precio: Number(p.precio), precio_anterior: aNumero(p.precio_anterior),
      // Primero una foto general; si no hay, la primera de algún color.
      foto: (suyas.find((f) => f.color_id === null) ?? suyas[0])?.url ?? null,
      colores: [...colores.values()],
      agotada: colores.size === 0,
    };
  });
}

/** ROP-19: otras prendas visibles de la misma categoría, las más nuevas primero. `excluir`: los otros colores (ya salen en "También en:"). */
async function relacionadas(prenda, visibles, excluir) {
  const rows = await Prenda.findAll({
    where: { categoria_id: prenda.categoria_id, activo: true, id: { [Op.notIn]: [prenda.id, ...excluir] } },
    attributes: ATRIBUTOS_TARJETA, order: ORDEN.novedades, limit: MAX_RELACIONADAS,
  });
  return visibles.has(prenda.categoria_id) ? tarjetas(rows) : [];
}

/** Ficha (ROP-12): fotos por color, talles del grupo en orden y qué combinación hay. */
export async function detallePrenda(slug) {
  const visibles = await categoriasVisibles();
  const prenda = await Prenda.findOne({
    where: { slug, activo: true, categoria_id: visibles.map((c) => c.id) },
    include: [
      { model: MarcaRopa, as: "marca", attributes: ["id", "nombre"] },
      { model: DisenoRopa, as: "diseno", attributes: ["id", "nombre"] },
      { model: GrupoTalle, as: "grupo_talle", attributes: ["id", "nombre"], include: [{ model: Talle, as: "talles", attributes: ["id", "nombre", "orden"] }] },
      { model: PrendaVariante, as: "variantes", attributes: ["id", "color_id", "talle_id", "disponible"], include: [{ model: ColorRopa, as: "color", attributes: ["id", "nombre", "hex", "orden"] }] },
      { model: PrendaImagen, as: "imagenes", attributes: ["id", "color_id", "url", "orden"] },
    ],
    order: [
      [{ model: GrupoTalle, as: "grupo_talle" }, { model: Talle, as: "talles" }, "orden", "ASC"],
      [{ model: PrendaImagen, as: "imagenes" }, "orden", "ASC"],
    ],
  });
  if (!prenda) throw noExiste("Esta prenda no está disponible.");

  const porId = new Map(visibles.map((c) => [c.id, c]));
  const migas = [];
  for (let c = porId.get(prenda.categoria_id); c; c = porId.get(c.padre_id)) migas.unshift({ id: c.id, nombre: c.nombre });

  const datos = prenda.toJSON();
  // ROP-30: solo los que el visitante puede abrir.
  const otros = await otrosColores(datos, { activo: true, categoria_id: [...porId.keys()] });
  const colores = new Map(datos.variantes.map((v) => [v.color.id, v.color]));
  const tallesUsados = new Set(datos.variantes.map((v) => v.talle_id));
  return {
    id: datos.id, slug: datos.slug, nombre: datos.nombre, descripcion: datos.descripcion,
    precio: Number(datos.precio), precio_anterior: aNumero(datos.precio_anterior), marca: datos.marca, diseno: datos.diseno, migas,
    colores: [...colores.values()].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre)),
    talles: (datos.grupo_talle?.talles ?? []).filter((t) => tallesUsados.has(t.id)),
    variantes: datos.variantes.map(({ id, color_id, talle_id, disponible }) => ({ id, color_id, talle_id, disponible })),
    imagenes: datos.imagenes.map(({ id, color_id, url }) => ({ id, color_id, url })),
    otros_colores: otros.map(({ slug: s, color }) => ({ slug: s, color })),
    relacionadas: await relacionadas(datos, porId, otros.map((o) => o.id)),
  };
}
