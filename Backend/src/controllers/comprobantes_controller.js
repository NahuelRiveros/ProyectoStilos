// =============================================================
// controllers/comprobantes_controller.js
//
// Emisión y consulta de comprobantes AFIP.
// La numeración es correlativa por punto_venta + tipo, con lock
// de fila para evitar duplicados bajo concurrencia.
// =============================================================

import { sequelize } from "../database/sequelize.js";

import {
  Fact03Comprobante,
  Fact01TipoComp,
  Fact02PuntoVenta,
  Ord03Orden,
  Ord01Estado,
  Ord04Item,
  Auth02Usuario,
} from "../models/index.js";

import {
  okResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  badRequestResponse,
} from "../utils/api_response.js";

import { generarPdfComprobante } from "../services/pdf_service.js";

// =============================================================
// Includes reutilizables
// =============================================================

const INCLUDE_TIPO_PV = [
  {
    model: Fact01TipoComp,
    as: "tipo",
    attributes: ["ID_FACT01", "FACT01_LETRA", "FACT01_NOMBRE"],
  },
  {
    model: Fact02PuntoVenta,
    as: "puntoVenta",
    attributes: ["ID_FACT02", "FACT02_NUMERO", "FACT02_NOMBRE"],
  },
];

// Include de orden sin scope de usuario (para admin y getComprobante)
const INCLUDE_ORDEN = {
  model: Ord03Orden,
  as: "orden",
  attributes: ["ID_ORD03", "ORD03_TOTAL", "RELA_AUTH02", "ORD03_FECHAALTA"],
  include: [
    { model: Ord01Estado, as: "estado", attributes: ["ORD01_ETIQUETA", "ORD01_CODIGO"] },
  ],
};

// Include de orden con usuario (solo admin — todas)
const INCLUDE_ORDEN_CON_USUARIO = {
  ...INCLUDE_ORDEN,
  include: [
    { model: Ord01Estado, as: "estado", attributes: ["ORD01_ETIQUETA", "ORD01_CODIGO"] },
    { model: Auth02Usuario, as: "usuario", attributes: ["AUTH02_EMAIL"] },
  ],
};

// =============================================================
// Mapper
// =============================================================

function mapComprobante(c) {
  return {
    id:                c.ID_FACT03,
    numero:            c.FACT03_NUMERO,
    numero_formateado: c.FACT03_NUMERO_FORMATEADO,
    letra:             c.tipo?.FACT01_LETRA ?? "",
    tipo:              c.tipo?.FACT01_NOMBRE ?? "",
    punto_venta:       c.puntoVenta?.FACT02_NUMERO ?? null,
    cuit_receptor:     c.FACT03_CUIT_RECEPTOR,
    pdf_url:           c.FACT03_PDF_URL,
    fecha:             c.FACT03_FECHA,
    orden_id:          c.RELA_ORD03,
    total:             c.orden?.ORD03_TOTAL ? parseFloat(c.orden.ORD03_TOTAL) : null,
    usuario_email:     c.orden?.usuario?.AUTH02_EMAIL ?? null,
  };
}

// =============================================================
// GET /comprobantes — comprobantes del usuario autenticado
// =============================================================

export async function getMisComprobantes(req, res) {
  try {
    const userId = req.user.id;

    const comprobantes = await Fact03Comprobante.findAll({
      include: [
        ...INCLUDE_TIPO_PV,
        {
          ...INCLUDE_ORDEN,
          where:    { RELA_AUTH02: userId },
          required: true,
        },
      ],
      order: [["FACT03_FECHA", "DESC"]],
    });

    return okResponse(res, { data: comprobantes.map(mapComprobante) });
  } catch (error) {
    return errorResponse(res, { mensaje: "Error al obtener comprobantes", error });
  }
}

// =============================================================
// GET /comprobantes/:id — detalle (scoped a usuario o admin)
// =============================================================

export async function getComprobante(req, res) {
  try {
    const isAdmin = req.user.rol?.AUTH01_ABREVIATURA === "ADM";

    const comp = await Fact03Comprobante.findByPk(req.params.id, {
      include: [...INCLUDE_TIPO_PV, INCLUDE_ORDEN],
    });

    if (!comp) return notFoundResponse(res, { mensaje: "Comprobante no encontrado" });

    if (!isAdmin && comp.orden?.RELA_AUTH02 !== req.user.id) {
      return notFoundResponse(res, { mensaje: "Comprobante no encontrado" });
    }

    return okResponse(res, { data: mapComprobante(comp) });
  } catch (error) {
    return errorResponse(res, { mensaje: "Error al obtener comprobante", error });
  }
}

// =============================================================
// GET /comprobantes/admin/todas — admin: todos con paginación
// =============================================================

export async function getTodasComprobantes(req, res) {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const { count, rows } = await Fact03Comprobante.findAndCountAll({
      include: [...INCLUDE_TIPO_PV, INCLUDE_ORDEN_CON_USUARIO],
      order:  [["FACT03_FECHA", "DESC"]],
      limit,
      offset,
    });

    return okResponse(res, {
      data: rows.map(mapComprobante),
      pagination: { total: count, pagina: page, total_paginas: Math.ceil(count / limit) },
    });
  } catch (error) {
    return errorResponse(res, { mensaje: "Error al obtener comprobantes", error });
  }
}

// =============================================================
// POST /comprobantes — admin: emitir comprobante para una orden
//
// Numeración correlativa por (punto_venta, tipo_comp) con lock
// para evitar duplicados si hay requests simultáneos.
// =============================================================

export async function emitirComprobante(req, res) {
  const t = await sequelize.transaction();
  try {
    const { orden_id, tipo_comp_id, punto_venta_id, cuit_receptor, pdf_url } = req.body;

    if (!orden_id || !tipo_comp_id || !punto_venta_id) {
      await t.rollback();
      return badRequestResponse(res, {
        mensaje: "orden_id, tipo_comp_id y punto_venta_id son requeridos",
      });
    }

    const orden = await Ord03Orden.findByPk(orden_id, { transaction: t });
    if (!orden) {
      await t.rollback();
      return notFoundResponse(res, { mensaje: "Orden no encontrada" });
    }

    const existente = await Fact03Comprobante.findOne({
      where: { RELA_ORD03: orden_id },
      transaction: t,
    });
    if (existente) {
      await t.rollback();
      return badRequestResponse(res, { mensaje: "La orden ya tiene un comprobante emitido" });
    }

    const [tipo, pv] = await Promise.all([
      Fact01TipoComp.findByPk(tipo_comp_id,   { transaction: t }),
      Fact02PuntoVenta.findByPk(punto_venta_id, { transaction: t }),
    ]);
    if (!tipo || !pv) {
      await t.rollback();
      return notFoundResponse(res, { mensaje: "Tipo de comprobante o punto de venta no válido" });
    }

    // Obtener el último número correlativo con lock para evitar concurrencia
    const maxRow = await Fact03Comprobante.findOne({
      where:  { RELA_FACT02: punto_venta_id, RELA_FACT01: tipo_comp_id },
      order:  [["FACT03_NUMERO", "DESC"]],
      lock:   t.LOCK.UPDATE,
      transaction: t,
    });
    const siguiente = maxRow ? maxRow.FACT03_NUMERO + 1 : 1;

    const pvFormatted  = String(pv.FACT02_NUMERO).padStart(4, "0");
    const numFormatted = String(siguiente).padStart(8, "0");
    const numero_formateado = `${pvFormatted}-${numFormatted}`;

    const comp = await Fact03Comprobante.create(
      {
        RELA_ORD03:               orden_id,
        RELA_FACT01:              tipo_comp_id,
        RELA_FACT02:              punto_venta_id,
        FACT03_NUMERO:            siguiente,
        FACT03_NUMERO_FORMATEADO: numero_formateado,
        FACT03_CUIT_RECEPTOR:     cuit_receptor ?? null,
        FACT03_PDF_URL:           pdf_url ?? null,
        FACT03_FECHA:             new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    const completo = await Fact03Comprobante.findByPk(comp.ID_FACT03, {
      include: [...INCLUDE_TIPO_PV, INCLUDE_ORDEN],
    });

    return createdResponse(res, {
      data:    mapComprobante(completo),
      mensaje: `Comprobante ${numero_formateado} emitido`,
    });
  } catch (error) {
    await t.rollback();
    return errorResponse(res, { mensaje: "Error al emitir comprobante", error });
  }
}

// =============================================================
// GET /comprobantes/:id/pdf — genera y devuelve el PDF
// =============================================================

export async function descargarPdf(req, res) {
  try {
    const isAdmin = req.user.rol?.AUTH01_ABREVIATURA === "ADM";

    const comp = await Fact03Comprobante.findByPk(req.params.id, {
      include: [
        ...INCLUDE_TIPO_PV,
        {
          model: Ord03Orden,
          as:    "orden",
          attributes: [
            "ID_ORD03", "ORD03_TOTAL", "ORD03_SUBTOTAL", "ORD03_COSTO_ENVIO",
            "ORD03_DIRECCION", "ORD03_FACTURACION", "RELA_AUTH02",
          ],
          include: [
            {
              model:      Ord04Item,
              as:         "items",
              attributes: ["ORD04_NOMBRE", "ORD04_CATEGORIA", "ORD04_TALLE", "ORD04_PRECIO_UNIDAD", "ORD04_CANTIDAD", "ORD04_SUBTOTAL"],
            },
            {
              model:      Auth02Usuario,
              as:         "usuario",
              attributes: ["AUTH02_EMAIL"],
            },
          ],
        },
      ],
    });

    if (!comp) return notFoundResponse(res, { mensaje: "Comprobante no encontrado" });

    if (!isAdmin && comp.orden?.RELA_AUTH02 !== req.user.id) {
      return notFoundResponse(res, { mensaje: "Comprobante no encontrado" });
    }

    const orden = comp.orden;

    const pdfData = {
      letra:             comp.tipo?.FACT01_LETRA ?? "B",
      tipo:              comp.tipo?.FACT01_NOMBRE ?? "Comprobante",
      numero_formateado: comp.FACT03_NUMERO_FORMATEADO,
      fecha:             comp.FACT03_FECHA,
      cuit_receptor:     comp.FACT03_CUIT_RECEPTOR,
      orden: {
        total:       orden?.ORD03_TOTAL       ?? 0,
        subtotal:    orden?.ORD03_SUBTOTAL    ?? 0,
        costo_envio: orden?.ORD03_COSTO_ENVIO ?? 0,
        direccion:   orden?.ORD03_DIRECCION   ?? {},
        facturacion: orden?.ORD03_FACTURACION ?? {},
        usuario_email: orden?.usuario?.AUTH02_EMAIL ?? null,
        items: (orden?.items ?? []).map((i) => ({
          nombre:       i.ORD04_NOMBRE,
          categoria:    i.ORD04_CATEGORIA,
          talle:        i.ORD04_TALLE,
          precio_unidad: parseFloat(i.ORD04_PRECIO_UNIDAD),
          cantidad:     i.ORD04_CANTIDAD,
          subtotal:     parseFloat(i.ORD04_SUBTOTAL),
        })),
      },
    };

    const pdfBuffer = await generarPdfComprobante(pdfData);

    const filename = `comprobante-${comp.FACT03_NUMERO_FORMATEADO}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    return errorResponse(res, { mensaje: "Error al generar el PDF del comprobante", error });
  }
}
