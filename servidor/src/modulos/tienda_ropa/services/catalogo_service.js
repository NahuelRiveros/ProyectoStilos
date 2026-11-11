import { Op } from "sequelize";
import { noExiste } from "../../../core/services/common/errores.js";
import { normalizarPaginacion, armarPaginacion } from "../../../core/services/common/pagination.js";
import { CategoriaRopa, MarcaRopa, ColorRopa, GrupoTalle, Talle, Prenda, PrendaVariante, PrendaImagen } from "../models/index.js";
import { armarArbol } from "../reglas.js";
import { wherePrendas } from "./prendas_service.js";

// Tienda pública (ROP-10 a ROP-12): solo prendas activas de categorías visibles.

const POR_PAGINA = 24;

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

/** Marcas, colores y talles que de verdad se pueden comprar hoy: el filtro nunca da vacío por un valor sin prendas. */
export async function opcionesDeFiltro() {
  const visibles = (await categoriasVisibles()).map((c) => c.id);
  const variantes = await PrendaVariante.findAll({
    where: { disponible: true },
    include: [{ model: Prenda, as: "prenda", attributes: ["marca_id"], where: { activo: true, categoria_id: visibles } }],
    attributes: ["color_id", "talle_id"],
  });
  const ids = (campo) => [...new Set(variantes.map((v) => v[campo]))];
  const marcas = [...new Set(variantes.map((v) => v.prenda.marca_id).filter(Boolean))];
  const [listaMarcas, colores, talles] = await Promise.all([
    MarcaRopa.findAll({ where: { id: marcas, activo: true }, attributes: ["id", "nombre"], order: [["nombre", "ASC"]] }),
    ColorRopa.findAll({ where: { id: ids("color_id") }, attributes: ["id", "nombre", "hex"], order: [["orden", "ASC"], ["nombre", "ASC"]] }),
    Talle.findAll({ where: { id: ids("talle_id") }, attributes: ["id", "nombre", "orden"], order: [["grupo_talle_id", "ASC"], ["orden", "ASC"]] }),
  ]);
  return { marcas: listaMarcas, colores, talles };
}

export async function listarCatalogo({ pagina, ...filtros }) {
  const { page, limit, offset } = normalizarPaginacion({ page: pagina, limit: POR_PAGINA });
  const visibles = (await categoriasVisibles()).map((c) => c.id);
  const where = { [Op.and]: [await wherePrendas(filtros), { activo: true, categoria_id: visibles }] };
  const { rows, count } = await Prenda.findAndCountAll({
    where, attributes: ["id", "slug", "nombre", "precio", "marca_id"],
    order: [["creado_en", "DESC"], ["id", "DESC"]], limit, offset,
  });
  const ids = rows.map((p) => p.id);
  const [fotos, variantes] = await Promise.all([
    PrendaImagen.findAll({ where: { prenda_id: ids }, order: [["orden", "ASC"]], raw: true }),
    PrendaVariante.findAll({
      where: { prenda_id: ids, disponible: true },
      include: [{ model: ColorRopa, as: "color", attributes: ["id", "nombre", "hex"] }],
      attributes: ["prenda_id", "color_id"],
    }),
  ]);
  const items = rows.map((p) => {
    const colores = new Map(variantes.filter((v) => v.prenda_id === p.id).map((v) => [v.color.id, v.color.toJSON()]));
    const suyas = fotos.filter((f) => f.prenda_id === p.id);
    return {
      id: p.id, slug: p.slug, nombre: p.nombre, precio: Number(p.precio),
      // Primero una foto general; si no hay, la primera de algún color.
      foto: (suyas.find((f) => f.color_id === null) ?? suyas[0])?.url ?? null,
      colores: [...colores.values()],
      agotada: colores.size === 0,
    };
  });
  return { items, paginacion: armarPaginacion({ page, limit, total: count }) };
}

/** Ficha (ROP-12): fotos por color, talles del grupo en orden y qué combinación hay. */
export async function detallePrenda(slug) {
  const visibles = await categoriasVisibles();
  const prenda = await Prenda.findOne({
    where: { slug, activo: true, categoria_id: visibles.map((c) => c.id) },
    include: [
      { model: MarcaRopa, as: "marca", attributes: ["id", "nombre"] },
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
  const colores = new Map(datos.variantes.map((v) => [v.color.id, v.color]));
  const tallesUsados = new Set(datos.variantes.map((v) => v.talle_id));
  return {
    id: datos.id, slug: datos.slug, nombre: datos.nombre, descripcion: datos.descripcion,
    precio: Number(datos.precio), marca: datos.marca, migas,
    colores: [...colores.values()].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre)),
    talles: (datos.grupo_talle?.talles ?? []).filter((t) => tallesUsados.has(t.id)),
    variantes: datos.variantes.map(({ id, color_id, talle_id, disponible }) => ({ id, color_id, talle_id, disponible })),
    imagenes: datos.imagenes.map(({ id, color_id, url }) => ({ id, color_id, url })),
  };
}
