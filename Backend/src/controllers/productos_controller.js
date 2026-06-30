// =============================================================
// controllers/productos_controller.js
//
// Lógica de negocio para el módulo de productos.
// Responde al formato que espera el frontend (producto_api.ts).
// =============================================================

import { Op } from "sequelize";
import { sequelize } from "../database/sequelize.js";

import {
  Prod03Producto,
  Prod01Categoria,
  Prod02Genero,
  Prod04Talle,
  Prod05Stock,
  Prod06Color,
  Prod07Marca,
} from "../models/index.js";

import {
  okResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  badRequestResponse,
} from "../utils/api_response.js";

import { sanitizarPaginacion } from "../utils/pagination.js";

// =============================================================
// Helpers internos
// =============================================================

const ORDER_MAP = {
  novedad:     [["ID_PROD03",    "DESC"]],
  precio_asc:  [["PROD03_PRECIO", "ASC"]],
  precio_desc: [["PROD03_PRECIO", "DESC"]],
  nombre_asc:  [["PROD03_NOMBRE", "ASC"]],
};

// include de marca — filtra por slug si se recibe el param
function buildIncludeMarca(slug) {
  return {
    model:      Prod07Marca,
    as:         "marca",
    attributes: ["ID_PROD07", "PROD07_NOMBRE", "PROD07_SLUG"],
    ...(slug ? { where: { PROD07_SLUG: slug }, required: true } : { required: false }),
  };
}

// include base de género — filtra por slug si se recibe el param
function includeGenero(slug) {
  return {
    model:      Prod02Genero,
    as:         "genero",
    attributes: ["ID_PROD02", "PROD02_NOMBRE", "PROD02_SLUG"],
    ...(slug ? { where: { PROD02_SLUG: slug }, required: true } : { required: false }),
  };
}

// include base de categoría — filtra por slug si se recibe el param
function includeCategoria(slug) {
  return {
    model:      Prod01Categoria,
    as:         "categoria",
    attributes: ["ID_PROD01", "PROD01_NOMBRE", "PROD01_SLUG"],
    ...(slug ? { where: { PROD01_SLUG: slug }, required: true } : { required: false }),
  };
}

// include de stock con talle (siempre completo, nunca filtra)
const includeStocks = {
  model:      Prod05Stock,
  as:         "stocks",
  attributes: ["ID_PROD05", "PROD05_STOCK", "RELA_PROD04"],
  required:   false,
  include: [{
    model:      Prod04Talle,
    as:         "talle",
    attributes: ["ID_PROD04", "PROD04_NOMBRE", "PROD04_ORDEN"],
  }],
};

// Transforma un registro Sequelize al shape que espera el frontend
function mapProducto(p) {
  const stocks = p.stocks ?? [];
  return {
    id:              p.ID_PROD03,
    nombre:          p.PROD03_NOMBRE,
    descripcion:     p.PROD03_DESCRIPCION ?? null,
    categoria:       p.categoria?.PROD01_NOMBRE ?? "",
    categoria_id:    p.RELA_PROD01 ?? null,
    categoria_slug:  p.categoria?.PROD01_SLUG ?? "",
    genero:          p.genero?.PROD02_NOMBRE    ?? "",
    genero_id:       p.RELA_PROD02 ?? null,
    genero_slug:     p.genero?.PROD02_SLUG ?? "",
    marca:           p.marca?.PROD07_NOMBRE     ?? null,
    marca_id:        p.RELA_PROD07 ?? null,
    precio:          parseFloat(p.PROD03_PRECIO),
    precio_anterior: p.PROD03_PRECIO_ANTERIOR ? parseFloat(p.PROD03_PRECIO_ANTERIOR) : null,
    descuento:       p.PROD03_DESCUENTO  ?? null,
    imagenes:        p.PROD03_IMAGENES   ?? [],
    codigo_ref:      p.PROD03_COD_REF    ?? null,
    colores:         p.PROD03_COLORES    ?? [],
    badge:           p.PROD03_BADGE      ?? null,
    home_seccion:    p.PROD03_HOME_SECCION ?? null,
    activo:          p.PROD03_ACTIVO     ?? true,
    stock:           stocks.reduce((sum, s) => sum + (s.PROD05_STOCK ?? 0), 0),
    talles_disponibles: stocks
      .filter(s => s.PROD05_STOCK > 0 && s.talle)
      .sort((a, b) => (a.talle?.PROD04_ORDEN ?? 0) - (b.talle?.PROD04_ORDEN ?? 0))
      .map(s => ({ talle: s.talle.PROD04_NOMBRE, talle_id: s.RELA_PROD04, stock: s.PROD05_STOCK })),
  };
}

async function obtenerCategoriaYDescendientes(id) {
  const ids = [id];
  let pendientes = [id];

  while (pendientes.length > 0) {
    const hijos = await Prod01Categoria.findAll({
      where: { RELA_PARENT: { [Op.in]: pendientes }, PROD01_FECHABAJA: null },
      attributes: ["ID_PROD01"],
    });

    pendientes = hijos.map((cat) => cat.ID_PROD01);
    ids.push(...pendientes);
  }

  return ids;
}

// =============================================================
// GET /productos
// ?genero=damas  &categoria=remeras  &marca=nike  &precio_max=5000
// &solo_ofertas=true  &solo_stock=true  &q=remera
// &home_seccion=carousel
// &orden=novedad|precio_asc|precio_desc|nombre_asc
// &pagina=1  &por_pagina=12
// =============================================================

export async function listarProductos(req, res) {
  try {
    const {
      genero, categoria, marca, precio_max,
      solo_ofertas, solo_stock,
      home_seccion, q, ids,
      orden, pagina, por_pagina,
    } = req.query;

    // ── Filtros base ────────────────────────────────────────
    const where = {
      PROD03_ACTIVO:   true,
      PROD03_FECHABAJA: null,
    };

    if (precio_max) {
      const max = parseFloat(precio_max);
      if (!isNaN(max)) where.PROD03_PRECIO = { [Op.lte]: max };
    }

    if (solo_ofertas === "true") {
      where.PROD03_PRECIO_ANTERIOR = { [Op.not]: null };
    }

    if (home_seccion) {
      where.PROD03_HOME_SECCION = home_seccion;
    }

    if (q && q.trim()) {
      where.PROD03_NOMBRE = { [Op.iLike]: `%${q.trim()}%` };
    }

    // ?ids=1,2,3 → retorna solo esos productos (usado por home para novedades seleccionadas)
    if (ids) {
      const parsed = String(ids).split(",").map(Number).filter(n => Number.isInteger(n) && n > 0);
      if (parsed.length) where.ID_PROD03 = { [Op.in]: parsed };
    }

    // "solo con stock" → excluye los marcados como agotados
    if (solo_stock === "true") {
      where[Op.or] = [
        { PROD03_BADGE: null },
        { PROD03_BADGE: { [Op.ne]: "agotado" } },
      ];
    }

    // ── Filtro de categoría (incluye subcategorías) ─────────
    if (categoria) {
      const catPadre = await Prod01Categoria.findOne({
        where:      { PROD01_SLUG: categoria, PROD01_FECHABAJA: null },
        attributes: ["ID_PROD01"],
      });
      if (catPadre) {
        const catIds = await obtenerCategoriaYDescendientes(catPadre.ID_PROD01);
        where.RELA_PROD01 = { [Op.in]: catIds };
      }
    }

    // ── Paginación ──────────────────────────────────────────
    const { page, limit, offset } = sanitizarPaginacion(pagina, por_pagina);

    // ── Query ───────────────────────────────────────────────
    const { rows, count } = await Prod03Producto.findAndCountAll({
      where,
      include:  [includeGenero(genero), includeCategoria(), buildIncludeMarca(marca), includeStocks],
      order:    ORDER_MAP[orden] ?? ORDER_MAP.novedad,
      limit,
      offset,
      distinct: true,
    });

    return res.json({
      ok:           true,
      data:         rows.map(mapProducto),
      total:        count,
      pagina:       page,
      total_paginas: Math.ceil(count / limit),
    });
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo obtener el listado de productos", error });
  }
}

// =============================================================
// GET /productos/:id
// =============================================================

export async function obtenerProducto(req, res) {
  try {
    const { id } = req.params;

    const producto = await Prod03Producto.findByPk(id, {
      include: [includeGenero(), includeCategoria(), buildIncludeMarca(), includeStocks],
    });

    if (!producto || !producto.PROD03_ACTIVO || producto.PROD03_FECHABAJA) {
      return notFoundResponse(res, { mensaje: `Producto con id ${id} no encontrado` });
    }

    return okResponse(res, {
      data:    mapProducto(producto),
      mensaje: "Producto obtenido correctamente",
    });
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo obtener el producto", error });
  }
}

// =============================================================
// POST /productos  [Admin]
// Body: { RELA_PROD01, RELA_PROD02, PROD03_NOMBRE, PROD03_PRECIO,
//         PROD03_PRECIO_ANTERIOR?, PROD03_DESCUENTO?, PROD03_BADGE?,
//         PROD03_IMAGENES?, PROD03_DESCRIPCION?, PROD03_FECHAALTA }
// =============================================================

export async function crearProducto(req, res) {
  try {
    const CAMPOS = [
      "RELA_PROD01", "RELA_PROD02", "RELA_PROD07",
      "PROD03_NOMBRE", "PROD03_DESCRIPCION", "PROD03_COD_REF",
      "PROD03_PRECIO", "PROD03_PRECIO_ANTERIOR", "PROD03_DESCUENTO",
      "PROD03_BADGE", "PROD03_HOME_SECCION", "PROD03_IMAGENES", "PROD03_COLORES", "PROD03_ACTIVO", "PROD03_FECHAALTA",
    ];

    const datos = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => CAMPOS.includes(k))
    );

    if (!datos.PROD03_NOMBRE || !datos.PROD03_PRECIO || !datos.RELA_PROD01 || !datos.RELA_PROD02) {
      return badRequestResponse(res, { mensaje: "Faltan campos obligatorios: RELA_PROD01, RELA_PROD02, PROD03_NOMBRE, PROD03_PRECIO" });
    }

    if (!datos.PROD03_FECHAALTA) datos.PROD03_FECHAALTA = new Date().toISOString().split("T")[0];

    const producto = await Prod03Producto.create(datos);

    return createdResponse(res, {
      data:    { id: producto.ID_PROD03, ...datos },
      mensaje: "Producto creado correctamente",
    });
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo crear el producto", error });
  }
}

// =============================================================
// PUT /productos/:id  [Admin]
// =============================================================

export async function actualizarProducto(req, res) {
  try {
    const { id } = req.params;

    const CAMPOS = [
      "RELA_PROD01", "RELA_PROD02", "RELA_PROD07",
      "PROD03_NOMBRE", "PROD03_DESCRIPCION", "PROD03_COD_REF",
      "PROD03_PRECIO", "PROD03_PRECIO_ANTERIOR", "PROD03_DESCUENTO",
      "PROD03_BADGE", "PROD03_HOME_SECCION", "PROD03_IMAGENES", "PROD03_COLORES", "PROD03_ACTIVO",
    ];

    const datos = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => CAMPOS.includes(k))
    );

    if (Object.keys(datos).length === 0) {
      return badRequestResponse(res, { mensaje: "Ningún campo enviado es permitido para actualizar" });
    }

    const producto = await Prod03Producto.findByPk(id);
    if (!producto) return notFoundResponse(res, { mensaje: `Producto con id ${id} no encontrado` });

    await producto.update(datos);

    return okResponse(res, { data: producto, mensaje: "Producto actualizado correctamente" });
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo actualizar el producto", error });
  }
}

// =============================================================
// DELETE /productos/:id  [Admin] — baja lógica
// =============================================================

export async function darDeBajaProducto(req, res) {
  try {
    const { id } = req.params;
    const producto = await Prod03Producto.findByPk(id);

    if (!producto) return notFoundResponse(res, { mensaje: `Producto con id ${id} no encontrado` });

    await producto.update({
      PROD03_ACTIVO:   false,
      PROD03_FECHABAJA: new Date().toISOString().split("T")[0],
    });

    return okResponse(res, { data: null, mensaje: "Producto dado de baja correctamente" });
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo dar de baja el producto", error });
  }
}

// =============================================================
// PUT /productos/:id/reactivar  [Admin]
// =============================================================

export async function reactivarProducto(req, res) {
  try {
    const { id } = req.params;
    const producto = await Prod03Producto.findByPk(id);

    if (!producto) return notFoundResponse(res, { mensaje: `Producto con id ${id} no encontrado` });

    await producto.update({ PROD03_ACTIVO: true, PROD03_FECHABAJA: null });

    return okResponse(res, { data: null, mensaje: "Producto reactivado correctamente" });
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo reactivar el producto", error });
  }
}

// =============================================================
// GET /productos/:id/stock  [Admin]
// Devuelve los registros de stock con talle para un producto
// =============================================================

export async function obtenerStock(req, res) {
  try {
    const { id } = req.params;

    const stocks = await Prod05Stock.findAll({
      where:   { RELA_PROD03: id },
      include: [
        { model: Prod04Talle, as: "talle",  attributes: ["ID_PROD04", "PROD04_NOMBRE", "PROD04_ORDEN"] },
        { model: Prod06Color, as: "color",  attributes: ["ID_PROD06", "PROD06_NOMBRE", "PROD06_HEX"],   required: false },
      ],
      order: [[{ model: Prod04Talle, as: "talle" }, "PROD04_ORDEN", "ASC"]],
    });

    return okResponse(res, { data: stocks, mensaje: "Stock obtenido correctamente" });
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo obtener el stock", error });
  }
}

// =============================================================
// PUT /productos/:id/stock  [Admin]
// Body: [{ talle_id: number|null, cantidad: number }]
// Hace upsert de cada entrada de stock (crea si no existe, actualiza si existe).
// Para productos sin talle enviar talle_id: null.
// =============================================================

export async function actualizarStock(req, res) {
  try {
    const { id } = req.params;
    const entradas = req.body;

    if (!Array.isArray(entradas) || entradas.length === 0) {
      return badRequestResponse(res, { mensaje: "El body debe ser un array de { talle_id, cantidad }" });
    }

    const producto = await Prod03Producto.findByPk(id);
    if (!producto) return notFoundResponse(res, { mensaje: `Producto con id ${id} no encontrado` });

    const hoy = new Date().toISOString().split("T")[0];

    await sequelize.transaction(async (t) => {
      for (const entrada of entradas) {
        const { talle_id = null, color_id = null, cantidad } = entrada;

        if (typeof cantidad !== "number" || cantidad < 0) continue;

        const [registro] = await Prod05Stock.findOrCreate({
          where:    { RELA_PROD03: id, RELA_PROD04: talle_id, RELA_PROD06: color_id },
          defaults: { RELA_PROD03: id, RELA_PROD04: talle_id, RELA_PROD06: color_id, PROD05_STOCK: cantidad, PROD05_FECHAALTA: hoy },
          transaction: t,
        });

        if (registro.PROD05_STOCK !== cantidad) {
          await registro.update({ PROD05_STOCK: cantidad }, { transaction: t });
        }
      }
    });

    // devuelve el stock actualizado
    const stockActualizado = await Prod05Stock.findAll({
      where:   { RELA_PROD03: id },
      include: [
        { model: Prod04Talle, as: "talle",  attributes: ["ID_PROD04", "PROD04_NOMBRE", "PROD04_ORDEN"] },
        { model: Prod06Color, as: "color",  attributes: ["ID_PROD06", "PROD06_NOMBRE", "PROD06_HEX"],   required: false },
      ],
    });

    return okResponse(res, { data: stockActualizado, mensaje: "Stock actualizado correctamente" });
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo actualizar el stock", error });
  }
}

// =============================================================
// GET /productos/stock-bajo  [Admin]
// ?umbral=1  → devuelve variantes con stock <= umbral
// =============================================================

export async function stockBajo(req, res) {
  try {
    const umbral = parseInt(req.query.umbral ?? "1", 10);
    if (isNaN(umbral) || umbral < 0) {
      return badRequestResponse(res, { mensaje: "umbral debe ser un número >= 0" });
    }

    const stocks = await Prod05Stock.findAll({
      where: {
        PROD05_STOCK:    { [Op.lte]: umbral },
        PROD05_FECHABAJA: null,
      },
      include: [
        {
          model:    Prod03Producto,
          as:       "producto",
          where:    { PROD03_ACTIVO: true, PROD03_FECHABAJA: null },
          attributes: ["ID_PROD03", "PROD03_NOMBRE"],
          required: true,
          include: [{
            model:      Prod07Marca,
            as:         "marca",
            attributes: ["PROD07_NOMBRE"],
            required:   false,
          }],
        },
        {
          model:      Prod04Talle,
          as:         "talle",
          attributes: ["PROD04_NOMBRE"],
          required:   false,
        },
        {
          model:      Prod06Color,
          as:         "color",
          attributes: ["PROD06_NOMBRE", "PROD06_HEX"],
          required:   false,
        },
      ],
      order: [
        ["PROD05_STOCK", "ASC"],
        [{ model: Prod03Producto, as: "producto" }, "PROD03_NOMBRE", "ASC"],
      ],
    });

    const data = stocks.map((s) => ({
      producto_id:     s.producto.ID_PROD03,
      producto_nombre: s.producto.PROD03_NOMBRE,
      marca:           s.producto.marca?.PROD07_NOMBRE ?? null,
      talle:           s.talle?.PROD04_NOMBRE ?? null,
      color:           s.color?.PROD06_NOMBRE ?? null,
      color_hex:       s.color?.PROD06_HEX    ?? null,
      stock:           s.PROD05_STOCK,
    }));

    return okResponse(res, { data, mensaje: "Stock bajo obtenido correctamente" });
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo obtener el stock bajo", error });
  }
}

// =============================================================
// POST /productos/importar-csv  [Admin]
// Importación masiva desde archivo CSV (multipart/form-data, campo "csv").
//
// Formato CSV — una fila por variante, misma cod_ref agrupa variantes:
//   nombre, cod_ref, descripcion, precio, precio_anterior, descuento_etiqueta,
//   categoria_slug, genero_slug, marca_nombre, badge, home_seccion,
//   talle, color, cantidad
//
// Respuesta: { importados: N, fallidos: [{ clave, motivo }] }
// =============================================================

export async function importarProductosCSV(req, res) {
  try {
    if (!req.file) return badRequestResponse(res, { mensaje: "Se requiere un archivo CSV (campo 'csv')." });

    // 1. Parsear CSV
    let filas;
    try {
      const { parse } = await import("csv-parse/sync");
      filas = parse(req.file.buffer, {
        columns:          true,
        skip_empty_lines: true,
        trim:             true,
        bom:              true,
      });
    } catch {
      return badRequestResponse(res, { mensaje: "El archivo CSV no es válido o tiene formato incorrecto." });
    }

    if (!filas.length) return badRequestResponse(res, { mensaje: "El CSV está vacío." });

    // 2. Cargar catálogos en memoria (una query por tabla, solo registros activos)
    const [categorias, generos, marcas, talles, colores] = await Promise.all([
      Prod01Categoria.findAll({ where: { PROD01_FECHABAJA: null }, attributes: ["ID_PROD01", "PROD01_SLUG"] }),
      Prod02Genero.findAll({    where: { PROD02_FECHABAJA: null }, attributes: ["ID_PROD02", "PROD02_SLUG"] }),
      Prod07Marca.findAll({     where: { PROD07_FECHABAJA: null }, attributes: ["ID_PROD07", "PROD07_NOMBRE"] }),
      Prod04Talle.findAll({     where: { PROD04_FECHABAJA: null }, attributes: ["ID_PROD04", "PROD04_NOMBRE"] }),
      Prod06Color.findAll({     where: { PROD06_FECHABAJA: null }, attributes: ["ID_PROD06", "PROD06_NOMBRE"] }),
    ]);

    const mapCat   = Object.fromEntries(categorias.map(c => [c.PROD01_SLUG?.toLowerCase(), c.ID_PROD01]));
    const mapGen   = Object.fromEntries(generos.map(g    => [g.PROD02_SLUG?.toLowerCase(), g.ID_PROD02]));
    const mapMarca = Object.fromEntries(marcas.map(m     => [m.PROD07_NOMBRE?.toLowerCase(), m.ID_PROD07]));
    const mapTalle = Object.fromEntries(talles.map(t     => [t.PROD04_NOMBRE?.toLowerCase(), t.ID_PROD04]));
    const mapColor = Object.fromEntries(colores.map(c    => [c.PROD06_NOMBRE?.toLowerCase(), c.ID_PROD06]));

    // 3. Agrupar filas por cod_ref (o nombre si no hay cod_ref)
    const grupos = new Map();
    for (const fila of filas) {
      const clave = fila.cod_ref?.trim() || fila.nombre?.trim();
      if (!clave) continue;
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave).push(fila);
    }

    // 4. Procesar cada grupo → 1 producto + N variantes de stock
    const importados = [];
    const fallidos   = [];

    for (const [clave, grupo] of grupos) {
      const base = grupo[0]; // Primera fila tiene los datos del producto

      // Validar obligatorios
      if (!base.nombre?.trim())         { fallidos.push({ clave, motivo: "Falta el nombre" });          continue; }
      if (!base.precio?.trim())         { fallidos.push({ clave, motivo: "Falta el precio" });          continue; }
      if (!base.categoria_slug?.trim()) { fallidos.push({ clave, motivo: "Falta categoria_slug" });     continue; }
      if (!base.genero_slug?.trim())    { fallidos.push({ clave, motivo: "Falta genero_slug" });        continue; }

      // Resolver IDs de catálogos
      const catId   = mapCat[base.categoria_slug.trim().toLowerCase()];
      const genId   = mapGen[base.genero_slug.trim().toLowerCase()];
      const marcaId = base.marca_nombre?.trim()
        ? mapMarca[base.marca_nombre.trim().toLowerCase()] ?? null
        : null;

      if (!catId) { fallidos.push({ clave, motivo: `Categoría '${base.categoria_slug}' no encontrada` });   continue; }
      if (!genId) { fallidos.push({ clave, motivo: `Género '${base.genero_slug}' no encontrado` });         continue; }
      if (base.marca_nombre?.trim() && !marcaId) {
        fallidos.push({ clave, motivo: `Marca '${base.marca_nombre}' no encontrada` }); continue;
      }

      const precio = parseFloat(base.precio);
      if (isNaN(precio) || precio <= 0) { fallidos.push({ clave, motivo: "Precio inválido" }); continue; }

      // Construir variantes de stock
      const stockRows   = [];
      const colorIdsSet = new Set();
      const erroresStock = [];

      for (const fila of grupo) {
        const talleNombre = fila.talle?.trim();
        const colorNombre = fila.color?.trim();
        const cantidad    = parseInt(fila.cantidad ?? "0", 10);

        const talleId = talleNombre ? mapTalle[talleNombre.toLowerCase()] ?? null : null;
        const colorId = colorNombre ? mapColor[colorNombre.toLowerCase()] ?? null : null;

        if (talleNombre && !talleId) { erroresStock.push(`Talle '${talleNombre}' no encontrado`); continue; }
        if (colorNombre && !colorId) { erroresStock.push(`Color '${colorNombre}' no encontrado`); continue; }

        stockRows.push({ talle_id: talleId, color_id: colorId, cantidad: isNaN(cantidad) ? 0 : cantidad });
        if (colorId) colorIdsSet.add(colorId);
      }

      if (erroresStock.length) {
        fallidos.push({ clave, motivo: erroresStock.join("; ") });
        continue;
      }

      // Crear producto + stock en una transacción
      try {
        await sequelize.transaction(async (t) => {
          const hoy = new Date().toISOString().split("T")[0];

          const producto = await Prod03Producto.create({
            PROD03_NOMBRE:          base.nombre.trim(),
            PROD03_DESCRIPCION:     base.descripcion?.trim()          || null,
            PROD03_COD_REF:         base.cod_ref?.trim()              || null,
            PROD03_PRECIO:          precio,
            PROD03_PRECIO_ANTERIOR: base.precio_anterior?.trim()
              ? parseFloat(base.precio_anterior) : null,
            PROD03_DESCUENTO:       base.descuento_etiqueta?.trim()   || null,
            PROD03_BADGE:           base.badge?.trim()                || null,
            PROD03_HOME_SECCION:    base.home_seccion?.trim()         || null,
            PROD03_IMAGENES:        [],
            PROD03_COLORES:         [...colorIdsSet],
            RELA_PROD01:            catId,
            RELA_PROD02:            genId,
            RELA_PROD07:            marcaId,
            PROD03_FECHAALTA:       hoy,
          }, { transaction: t });

          if (stockRows.length) {
            await Prod05Stock.bulkCreate(
              stockRows.map(({ talle_id, color_id, cantidad }) => ({
                RELA_PROD03:     producto.ID_PROD03,
                RELA_PROD04:     talle_id,
                RELA_PROD06:     color_id,
                PROD05_STOCK:    cantidad,
                PROD05_FECHAALTA: hoy,
              })),
              { transaction: t }
            );
          }
        });

        importados.push({ clave, nombre: base.nombre.trim() });
      } catch (err) {
        fallidos.push({ clave, motivo: `Error al guardar: ${err.message}` });
      }
    }

    return okResponse(res, {
      data:    { importados: importados.length, fallidos },
      mensaje: `${importados.length} producto(s) importado(s). ${fallidos.length} con error(es).`,
    });

  } catch (error) {
    return errorResponse(res, { mensaje: "Error en la importación CSV", error });
  }
}

// =============================================================
// GET /productos/catalogo-csv  [Admin]
// Devuelve valores activos del catálogo para armar el CSV de importación:
// slugs de categorías y géneros, nombres de marcas, talles y colores.
// =============================================================

export async function catalogoCSVReferencia(req, res) {
  try {
    const [categorias, generos, marcas, talles, colores] = await Promise.all([
      Prod01Categoria.findAll({ where: { PROD01_FECHABAJA: null }, attributes: ["PROD01_SLUG", "PROD01_NOMBRE"], order: [["PROD01_NOMBRE", "ASC"]] }),
      Prod02Genero.findAll({    where: { PROD02_FECHABAJA: null }, attributes: ["PROD02_SLUG", "PROD02_NOMBRE"] }),
      Prod07Marca.findAll({     where: { PROD07_FECHABAJA: null }, attributes: ["PROD07_NOMBRE"], order: [["PROD07_NOMBRE", "ASC"]] }),
      Prod04Talle.findAll({     where: { PROD04_FECHABAJA: null }, attributes: ["PROD04_NOMBRE"], order: [["PROD04_ORDEN", "ASC"]] }),
      Prod06Color.findAll({     where: { PROD06_FECHABAJA: null }, attributes: ["PROD06_NOMBRE", "PROD06_HEX"], order: [["PROD06_ORDEN", "ASC"]] }),
    ]);

    return okResponse(res, {
      data: {
        categorias: categorias.map((c) => ({ slug: c.PROD01_SLUG, nombre: c.PROD01_NOMBRE })),
        generos:    generos.map((g)    => ({ slug: g.PROD02_SLUG, nombre: g.PROD02_NOMBRE })),
        marcas:     marcas.map((m)     => m.PROD07_NOMBRE),
        talles:     talles.map((t)     => t.PROD04_NOMBRE),
        colores:    colores.map((c)    => ({ nombre: c.PROD06_NOMBRE, hex: c.PROD06_HEX })),
      },
    });
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo obtener el catálogo de referencia", error });
  }
}

// =============================================================
// GET /productos/ofertas/destacadas
// Retorna 3 productos al azar que tengan descuento (precio_anterior no null)
// =============================================================

export async function obtenerOfertasDestacadas(req, res) {
  try {
    const productos = await Prod03Producto.findAll({
      where: {
        PROD03_ACTIVO:           true,
        PROD03_FECHABAJA:        null,
        PROD03_PRECIO_ANTERIOR:  { [Op.not]: null },
      },
      include: [includeGenero(), includeCategoria(), buildIncludeMarca(), includeStocks],
      order: sequelize.random(),
      limit: 3,
    });

    return okResponse(res, {
      data:    productos.map(mapProducto),
      mensaje: "Ofertas destacadas obtenidas correctamente",
    });
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo obtener las ofertas destacadas", error });
  }
}
