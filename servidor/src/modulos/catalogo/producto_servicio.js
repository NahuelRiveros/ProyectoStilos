import { Op, QueryTypes } from "sequelize";
import { proyecto } from "compartido/proyecto.js";
import { sequelize, DB_SCHEMA } from "../../nucleo/db/sequelize.js";
import { Conflicto, DatosInvalidos, NoEncontrado } from "../../nucleo/errores.js";
import { normalizarPaginacion, armarPaginacion } from "../../nucleo/paginacion.js";
import { patronContiene, pick } from "../../nucleo/consultas.js";
import { Categoria, Color, GrupoTalle, Marca, Producto, ProductoImagen, Talle, Variante } from "./modelos.js";
import { idsConDescendientes } from "./categoria_servicio.js";
import { generarSlugUnico } from "./slugs.js";
import { resolverTalleColor } from "./variantes_talle_color.js";
import { Stock } from "../stock/modelos.js";
import { registrarMovimientos } from "../stock/movimientos.js";

const CON_STOCK = proyecto.modulos.stock;

const ATRIBUTOS_PRODUCTO = ["id", "categoria_id", "nombre", "slug", "marca_id", "grupo_talle_id", "descripcion", "activo", "publicado", "creado_en", "actualizado_en"];
const ATRIBUTOS_VARIANTE = [
  "id", "producto_id", "nombre", "atributos", "color_id", "talle_id", "sku", "precio", "precio_anterior", "iva_porcentaje", "controla_stock", "activo", "orden",
];
const CAMPOS_PRODUCTO = ["categoria_id", "nombre", "marca_id", "grupo_talle_id", "descripcion", "activo", "publicado"];
const CAMPOS_VARIANTE = ["nombre", "sku", "atributos", "color_id", "talle_id", "precio", "precio_anterior", "iva_porcentaje", "controla_stock", "activo"];

// Lista blanca: el cliente elige una clave, nunca una columna.
const ORDENES = {
  nombre: [["nombre", "ASC"], ["id", "ASC"]],
  "-nombre": [["nombre", "DESC"], ["id", "DESC"]],
  reciente: [["creado_en", "DESC"], ["id", "DESC"]],
};

// Sin datos del usuario adentro: seguros como literal.
const conPresentacionActiva = sequelize.literal(
  `EXISTS (SELECT 1 FROM ${DB_SCHEMA}.variante v WHERE v.producto_id = "producto"."id" AND v.activo AND v.eliminado_en IS NULL)`,
);
// Con ocultar_sin_stock: además, al menos una presentación sin control de stock o con disponible > 0.
const conPresentacionConStock = sequelize.literal(
  `EXISTS (SELECT 1 FROM ${DB_SCHEMA}.variante v LEFT JOIN ${DB_SCHEMA}.stock s ON s.variante_id = v.id
    WHERE v.producto_id = "producto"."id" AND v.activo AND v.eliminado_en IS NULL
      AND (NOT v.controla_stock OR COALESCE(s.cantidad - s.reservado, 0) > 0))`,
);

/** "disponible" | "ultimas" (en el mínimo o debajo) | "sin_stock". Sin control de stock: siempre disponible. */
function disponibilidad(variante, stock) {
  if (!CON_STOCK || !variante.controla_stock) return { disponibilidad: "disponible", cantidad_disponible: null };
  const disponible = (stock?.cantidad ?? 0) - (stock?.reservado ?? 0);
  const estado = disponible <= 0 ? "sin_stock" : disponible <= (stock?.minimo ?? 0) ? "ultimas" : "disponible";
  return { disponibilidad: estado, cantidad_disponible: Math.max(disponible, 0) };
}

// El público no ve cantidades internas salvo que la tienda esté configurada para mostrarlas.
function presentar(producto, { publico }) {
  const mostrarCantidad = !publico || proyecto.stock.mostrar_cantidad_en_tienda;
  return {
    ...producto,
    variantes: producto.variantes.map(({ stock, ...variante }) => {
      const { disponibilidad: estado, cantidad_disponible } = disponibilidad(variante, stock);
      return { ...variante, disponibilidad: estado, ...(mostrarCantidad ? { cantidad_disponible } : {}) };
    }),
  };
}

function incluir({ publico }) {
  return [
    { model: Categoria, as: "categoria", attributes: ["id", "nombre", "slug"] },
    { model: Marca, as: "marca", attributes: ["id", "nombre"] },
    { model: GrupoTalle, as: "grupo_talle", attributes: ["id", "nombre"] },
    {
      model: Variante,
      as: "variantes",
      attributes: ATRIBUTOS_VARIANTE,
      where: { eliminado_en: null, ...(publico ? { activo: true } : {}) },
      required: false,
      separate: true,
      order: [["orden", "ASC"], ["id", "ASC"]],
      include: [
        { model: Color, as: "color", attributes: ["id", "nombre", "hex", "orden"] },
        { model: Talle, as: "talle", attributes: ["id", "nombre", "orden"] },
        ...(CON_STOCK ? [{ model: Stock, as: "stock", attributes: ["cantidad", "reservado", "minimo"] }] : []),
      ],
    },
    { model: ProductoImagen, as: "imagenes", attributes: ["id", "url", "alt", "color_id", "orden"], separate: true, order: [["orden", "ASC"], ["id", "ASC"]] },
  ];
}

// El público solo ve productos activos, publicados y con al menos una presentación a la venta.
function condicionesVisibilidad({ publico, estado }) {
  if (publico) return [{ activo: true, publicado: true }, CON_STOCK && proyecto.stock.ocultar_sin_stock ? conPresentacionConStock : conPresentacionActiva];
  if (estado === "activos") return [{ activo: true }];
  if (estado === "inactivos") return [{ activo: false }];
  if (estado === "sin_publicar") return [{ publicado: false }];
  return [];
}

// Sin datos del usuario adentro: seguro como literal.
const conPresentacionEnOferta = sequelize.literal(
  `EXISTS (SELECT 1 FROM ${DB_SCHEMA}.variante v WHERE v.producto_id = "producto"."id" AND v.activo AND v.eliminado_en IS NULL AND v.precio_anterior > v.precio)`,
);

/**
 * Condiciones de búsqueda del listado. Las usan el listado y los filtros disponibles, así los dos
 * miran exactamente los mismos productos. marca / color / talle: listas de ids (vacías = sin filtrar).
 */
async function condicionesListado({ q, categoria, estado = "todos", oferta = false, marca = [], color = [], talle = [] }, { publico }) {
  const condiciones = [{ eliminado_en: null }, ...condicionesVisibilidad({ publico, estado })];
  if (oferta) condiciones.push(conPresentacionEnOferta);
  if (marca.length) condiciones.push({ marca_id: { [Op.in]: marca } });

  // Color y talle tienen que estar en la MISMA variante a la venta ("Negro · M" existe, no solo "tiene negro" y "tiene M").
  if (color.length || talle.length) {
    const conCombinacion = await Variante.findAll({
      where: { eliminado_en: null, activo: true, ...(color.length ? { color_id: { [Op.in]: color } } : {}), ...(talle.length ? { talle_id: { [Op.in]: talle } } : {}) },
      attributes: ["producto_id"],
      raw: true,
    });
    condiciones.push({ id: { [Op.in]: [...new Set(conCombinacion.map((v) => v.producto_id))] } });
  }

  if (categoria) {
    condiciones.push({ categoria_id: { [Op.in]: await idsConDescendientes(categoria) } });
  }
  if (q) {
    const patron = patronContiene(q);
    const [porCodigo, porMarca] = await Promise.all([
      Variante.findAll({ where: { eliminado_en: null, sku: { [Op.iLike]: patron } }, attributes: ["producto_id"], raw: true, limit: 500 }),
      Marca.findAll({ where: { nombre: { [Op.iLike]: patron } }, attributes: ["id"], raw: true, limit: 100 }),
    ]);
    condiciones.push({
      [Op.or]: [
        { nombre: { [Op.iLike]: patron } },
        { marca_id: { [Op.in]: porMarca.map((m) => m.id) } },
        { id: { [Op.in]: porCodigo.map((v) => v.producto_id) } },
      ],
    });
  }
  return condiciones;
}

export async function listarProductos({ orden = "nombre", pagina, limite, ...filtros }, { publico }) {
  const condiciones = await condicionesListado(filtros, { publico });
  const pag = normalizarPaginacion({ pagina, limite, limitePorDefecto: proyecto.catalogo.productos_por_pagina });
  const { rows, count } = await Producto.findAndCountAll({
    where: { [Op.and]: condiciones },
    attributes: ATRIBUTOS_PRODUCTO,
    include: incluir({ publico }),
    order: ORDENES[orden] ?? ORDENES.nombre,
    limit: pag.limite,
    offset: pag.offset,
    distinct: true,
  });

  return { data: rows.map((p) => presentar(p.get({ plain: true }), { publico })), paginacion: armarPaginacion({ ...pag, total: count }) };
}

/**
 * Qué marcas, colores y talles hay (con cuántos productos) en lo que se está viendo: misma categoría,
 * búsqueda y ofertas, sin contar los filtros de marca/color/talle (así se puede sumar otra opción).
 */
export async function filtrosDisponibles(filtros, { publico }) {
  const { marca: _marca, color: _color, talle: _talle, ...base } = filtros;
  const productos = await Producto.findAll({ where: { [Op.and]: await condicionesListado(base, { publico }) }, attributes: ["id", "marca_id"], raw: true });
  if (productos.length === 0) return { marcas: [], colores: [], talles: [] };

  const ids = productos.map((p) => p.id);
  const porMarca = new Map();
  for (const p of productos) if (p.marca_id) porMarca.set(p.marca_id, (porMarca.get(p.marca_id) ?? 0) + 1);

  // Cantidad de productos (no de variantes) por color y por talle, solo de variantes a la venta.
  const consulta = (sql) => sequelize.query(sql, { replacements: { ids }, type: QueryTypes.SELECT });
  const [marcas, colores, talles] = await Promise.all([
    porMarca.size ? Marca.findAll({ where: { id: { [Op.in]: [...porMarca.keys()] } }, attributes: ["id", "nombre"], order: [["nombre", "ASC"]], raw: true }) : [],
    consulta(
      `SELECT c.id, c.nombre, c.hex, COUNT(DISTINCT v.producto_id)::int AS cantidad
       FROM ${DB_SCHEMA}.variante v JOIN ${DB_SCHEMA}.color c ON c.id = v.color_id
       WHERE v.producto_id IN (:ids) AND v.activo AND v.eliminado_en IS NULL
       GROUP BY c.id, c.nombre, c.hex, c.orden ORDER BY c.orden, c.nombre`,
    ),
    // Agrupados por grupo de talles: el "40" de Jeans no es el "40" de Calzado.
    consulta(
      `SELECT t.id, t.nombre, g.id AS grupo_id, g.nombre AS grupo, COUNT(DISTINCT v.producto_id)::int AS cantidad
       FROM ${DB_SCHEMA}.variante v
       JOIN ${DB_SCHEMA}.talle t ON t.id = v.talle_id JOIN ${DB_SCHEMA}.grupo_talle g ON g.id = t.grupo_talle_id
       WHERE v.producto_id IN (:ids) AND v.activo AND v.eliminado_en IS NULL
       GROUP BY t.id, t.nombre, t.orden, g.id, g.nombre, g.orden ORDER BY g.orden, g.nombre, t.orden`,
    ),
  ]);
  return { marcas: marcas.map((m) => ({ ...m, cantidad: porMarca.get(m.id) })), colores, talles };
}

/** Por id (admin) o por slug (URL pública). */
export async function obtenerProducto(clave, { publico }) {
  const porId = /^\d+$/.test(String(clave));
  const producto = await Producto.findOne({
    where: { [Op.and]: [{ eliminado_en: null }, porId ? { id: Number(clave) } : { slug: clave }, ...condicionesVisibilidad({ publico })] },
    attributes: ATRIBUTOS_PRODUCTO,
    include: incluir({ publico }),
  });
  if (!producto) throw new NoEncontrado("El producto no existe o no está disponible.", "PRODUCTO_NO_ENCONTRADO");
  return presentar(producto.get({ plain: true }), { publico });
}

async function validarCategoria(categoria_id, transaction) {
  const existe = await Categoria.findOne({ where: { id: categoria_id, eliminado_en: null }, attributes: ["id"], transaction });
  if (!existe) throw new DatosInvalidos("Revisá los datos ingresados.", [{ campo: "categoria_id", mensaje: "La categoría no existe" }]);
}

async function validarNombreLibre({ nombre, categoria_id, idPropio = null, transaction }) {
  const where = {
    eliminado_en: null,
    categoria_id,
    [Op.and]: sequelize.where(sequelize.fn("lower", sequelize.col("nombre")), nombre.toLowerCase()),
  };
  if (idPropio) where.id = { [Op.ne]: idPropio };
  if (await Producto.findOne({ where, attributes: ["id"], transaction })) {
    throw new Conflicto(`Ya existe el producto "${nombre}" en esa categoría.`, "PRODUCTO_DUPLICADO");
  }
}

// Una marca dada de baja no se puede elegir, pero el producto que ya la tenía la conserva al editarlo.
async function validarMarca({ marca_id, actual = null, transaction }) {
  if (marca_id == null || marca_id === actual) return;
  const existe = await Marca.findOne({ where: { id: marca_id, eliminado_en: null }, attributes: ["id"], transaction });
  if (!existe) throw new DatosInvalidos("Revisá los datos ingresados.", [{ campo: "marca_id", mensaje: "La marca no existe" }]);
}

// Un código (SKU) no puede repetirse entre productos distintos.
async function validarCodigosLibres({ variantes, idPropio = null, transaction }) {
  const codigos = variantes.map((v) => v.sku?.toLowerCase()).filter(Boolean);
  if (codigos.length === 0) return;
  const usados = await Variante.findAll({
    where: {
      eliminado_en: null,
      [Op.and]: sequelize.where(sequelize.fn("lower", sequelize.col("sku")), { [Op.in]: codigos }),
      ...(idPropio ? { producto_id: { [Op.ne]: idPropio } } : {}),
    },
    attributes: ["sku"],
    raw: true,
    transaction,
  });
  if (usados.length > 0) {
    throw new Conflicto(`El código "${usados[0].sku}" ya lo usa otro producto.`, "SKU_DUPLICADO");
  }
}

// nombre: el armado con color y talle ("Negro · M"); null = queda el nombre libre (presentación).
function datosVariante({ variante, producto_id, orden, nombre }) {
  const datos = { ...pick(variante, CAMPOS_VARIANTE), producto_id, orden };
  if (nombre) datos.nombre = nombre;
  // Con stock inicial, la variante nueva ya controla stock (la cantidad entra como movimiento).
  if (CON_STOCK && variante.stock_inicial != null) datos.controla_stock = true;
  return datos;
}

// El stock inicial de las variantes nuevas entra como ingreso, igual que cualquier otro (queda en el historial).
async function registrarStockInicial({ creadas, usuario_id, transaction }) {
  if (!CON_STOCK) return;
  const movimientos = creadas
    .filter(({ variante }) => variante.stock_inicial > 0)
    .map(({ id, variante }) => ({ variante_id: id, tipo: "ingreso", cantidad: variante.stock_inicial, motivo: "Stock inicial", referencia_tipo: "producto", usuario_id }));
  await registrarMovimientos(movimientos, { transaction });
}

export async function crearProducto(datos, { usuario_id = null } = {}) {
  const id = await sequelize.transaction(async (transaction) => {
    await validarCategoria(datos.categoria_id, transaction);
    await validarMarca({ marca_id: datos.marca_id, transaction });
    await validarNombreLibre({ ...datos, transaction });
    await validarCodigosLibres({ variantes: datos.variantes, transaction });
    const nombres = await resolverTalleColor({ datos, transaction });

    const slug = await generarSlugUnico(Producto, datos.nombre, { largo: 170, transaction });
    const producto = await Producto.create({ ...pick(datos, CAMPOS_PRODUCTO), slug }, { transaction });
    const filas = await Variante.bulkCreate(
      datos.variantes.map((variante, i) => datosVariante({ variante, producto_id: producto.id, orden: i, nombre: nombres[i] })),
      { transaction, returning: true },
    );
    await registrarStockInicial({ creadas: filas.map((f, i) => ({ id: f.id, variante: datos.variantes[i] })), usuario_id, transaction });
    return producto.id;
  });
  return obtenerProducto(id, { publico: false });
}

/**
 * Reemplaza los datos del producto y sincroniza sus presentaciones:
 * con id → se actualiza · sin id → se crea · las que no vienen → baja lógica.
 */
export async function actualizarProducto(id, datos, { usuario_id = null } = {}) {
  await sequelize.transaction(async (transaction) => {
    const producto = await Producto.findOne({ where: { id, eliminado_en: null }, transaction, lock: transaction.LOCK.UPDATE });
    if (!producto) throw new NoEncontrado("El producto no existe.", "PRODUCTO_NO_ENCONTRADO");

    await validarCategoria(datos.categoria_id, transaction);
    await validarMarca({ marca_id: datos.marca_id, actual: producto.marca_id, transaction });
    await validarNombreLibre({ ...datos, idPropio: producto.id, transaction });
    await validarCodigosLibres({ variantes: datos.variantes, idPropio: producto.id, transaction });

    const actuales = await Variante.findAll({ where: { producto_id: producto.id, eliminado_en: null }, transaction });
    const actualesPorId = new Map(actuales.map((v) => [v.id, v]));
    const ajena = datos.variantes.find((v) => v.id && !actualesPorId.has(v.id));
    if (ajena) {
      throw new DatosInvalidos("Revisá los datos ingresados.", [
        { campo: "variantes", mensaje: `${proyecto.catalogo.etiqueta_variante} ${ajena.id} no pertenece a este producto` },
      ]);
    }
    const nombres = await resolverTalleColor({ datos, actuales: { grupo_talle_id: producto.grupo_talle_id, variantes: actuales }, transaction });

    const slug = datos.nombre === producto.nombre
      ? producto.slug
      : await generarSlugUnico(Producto, datos.nombre, { excluirId: producto.id, largo: 170, transaction });
    await producto.update({ ...pick(datos, CAMPOS_PRODUCTO), slug }, { transaction });

    // Primero las bajas, así un código o nombre liberado se puede reutilizar en el mismo envío.
    const quedan = new Set(datos.variantes.map((v) => v.id).filter(Boolean));
    const bajas = actuales.filter((v) => !quedan.has(v.id)).map((v) => v.id);
    if (bajas.length > 0) {
      await Variante.update({ eliminado_en: new Date() }, { where: { id: { [Op.in]: bajas } }, transaction });
    }
    const creadas = [];
    for (const [i, variante] of datos.variantes.entries()) {
      const fila = datosVariante({ variante, producto_id: producto.id, orden: i, nombre: nombres[i] });
      if (variante.id) {
        // El stock de una variante que ya existe se cambia desde Stock (ajuste con motivo), no acá.
        await actualesPorId.get(variante.id).update({ ...fila, controla_stock: variante.controla_stock }, { transaction });
      } else {
        creadas.push({ id: (await Variante.create(fila, { transaction })).id, variante });
      }
    }
    await registrarStockInicial({ creadas, usuario_id, transaction });
  });
  return obtenerProducto(id, { publico: false });
}

export async function cambiarEstadoProducto(id, datos) {
  const producto = await Producto.findOne({ where: { id, eliminado_en: null } });
  if (!producto) throw new NoEncontrado("El producto no existe.", "PRODUCTO_NO_ENCONTRADO");
  await producto.update(pick(datos, ["activo", "publicado"]));
  return obtenerProducto(id, { publico: false });
}

export async function eliminarProducto(id) {
  await sequelize.transaction(async (transaction) => {
    const producto = await Producto.findOne({ where: { id, eliminado_en: null }, transaction, lock: transaction.LOCK.UPDATE });
    if (!producto) throw new NoEncontrado("El producto no existe.", "PRODUCTO_NO_ENCONTRADO");
    const ahora = new Date();
    await Variante.update({ eliminado_en: ahora }, { where: { producto_id: id, eliminado_en: null }, transaction });
    await producto.update({ eliminado_en: ahora }, { transaction });
  });
}
