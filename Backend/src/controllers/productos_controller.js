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
// ?genero=damas  &categoria=remeras  &precio_max=5000
// &solo_ofertas=true  &solo_stock=true
// &orden=novedad|precio_asc|precio_desc|nombre_asc
// &pagina=1  &por_pagina=12
// =============================================================

export async function listarProductos(req, res) {
  try {
    const {
      genero, categoria, marca, precio_max,
      solo_ofertas, solo_stock,
      home_seccion,
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
      include: [{ model: Prod04Talle, as: "talle", attributes: ["ID_PROD04", "PROD04_NOMBRE", "PROD04_ORDEN"] }],
      order:   [[{ model: Prod04Talle, as: "talle" }, "PROD04_ORDEN", "ASC"]],
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
        const { talle_id = null, cantidad } = entrada;

        if (typeof cantidad !== "number" || cantidad < 0) continue;

        const [registro] = await Prod05Stock.findOrCreate({
          where:    { RELA_PROD03: id, RELA_PROD04: talle_id },
          defaults: { RELA_PROD03: id, RELA_PROD04: talle_id, PROD05_STOCK: cantidad, PROD05_FECHAALTA: hoy },
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
      include: [{ model: Prod04Talle, as: "talle", attributes: ["ID_PROD04", "PROD04_NOMBRE"] }],
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
