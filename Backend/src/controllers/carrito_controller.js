// =============================================================
// controllers/carrito_controller.js
//
// El carrito está vinculado 1-a-1 con AUTH_02_USUARIO.
// Se crea automáticamente al primer acceso.
//
// Flujo de sync (login):
//   Frontend tiene items en localStorage → POST /carrito/sync
//   → Para cada item: si ya existe en servidor → suma cantidades
//                     si no existe           → crea el item
//   → Devuelve el carrito fusionado
// =============================================================

import { sequelize } from "../database/sequelize.js";

import {
  Carr01Carrito,
  Carr02Item,
  Prod03Producto,
  Prod01Categoria,
  Prod04Talle,
} from "../models/index.js";

import {
  okResponse,
  errorResponse,
  notFoundResponse,
  badRequestResponse,
} from "../utils/api_response.js";

// =============================================================
// Helper: obtiene (o crea) el carrito del usuario autenticado
// y devuelve la instancia de Carr01Carrito
// =============================================================

async function obtenerOCrearCarrito(usuarioId, transaction = null) {
  const [carrito] = await Carr01Carrito.findOrCreate({
    where:    { RELA_AUTH02: usuarioId },
    defaults: {
      RELA_AUTH02:     usuarioId,
      CARR01_FECHAALTA: new Date(),
      CARR01_FECHAMOD:  new Date(),
    },
    transaction,
  });
  return carrito;
}

// =============================================================
// Helper: transforma un Carr02Item con includes al shape del frontend
// CarritoItem: { key, producto_id, nombre, categoria, precio, imagen, talle, cantidad }
// =============================================================

function mapItem(item) {
  const prod = item.producto;
  const talle = item.talle?.PROD04_NOMBRE ?? null;
  return {
    item_id:     item.ID_CARR02,
    key:         `${item.RELA_PROD03}-${talle ?? "u"}`,
    producto_id: item.RELA_PROD03,
    nombre:      prod?.PROD03_NOMBRE  ?? "",
    categoria:   prod?.categoria?.PROD01_NOMBRE ?? "",
    precio:      parseFloat(item.CARR02_PRECIO_UNIDAD),
    imagen:      prod?.PROD03_IMAGENES?.[0] ?? null,
    talle,
    cantidad:    item.CARR02_CANTIDAD,
  };
}

// include reutilizable para obtener producto + categoría + talle
const ITEM_INCLUDE = [
  {
    model:      Prod03Producto,
    as:         "producto",
    attributes: ["ID_PROD03", "PROD03_NOMBRE", "PROD03_IMAGENES"],
    include: [{
      model:      Prod01Categoria,
      as:         "categoria",
      attributes: ["PROD01_NOMBRE"],
    }],
  },
  {
    model:      Prod04Talle,
    as:         "talle",
    attributes: ["PROD04_NOMBRE"],
  },
];

// =============================================================
// GET /carrito
// Devuelve los items del carrito del usuario autenticado.
// Crea el carrito si no existe.
// =============================================================

export async function obtenerCarrito(req, res) {
  try {
    const usuarioId = req.user.usuario_id;
    const carrito   = await obtenerOCrearCarrito(usuarioId);

    const items = await Carr02Item.findAll({
      where:   { RELA_CARR01: carrito.ID_CARR01 },
      include: ITEM_INCLUDE,
      order:   [["CARR02_FECHAALTA", "ASC"]],
    });

    return okResponse(res, {
      data:    items.map(mapItem),
      mensaje: "Carrito obtenido correctamente",
    });
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo obtener el carrito", error });
  }
}

// =============================================================
// POST /carrito/sync
// Body: { items: [{ producto_id, talle_id?, cantidad, precio_unidad }] }
//
// Fusión: si el mismo producto+talle ya existe en servidor,
// suma la cantidad. Si no existe, crea el item.
// Devuelve el carrito completo resultante.
// =============================================================

export async function sincronizarCarrito(req, res) {
  try {
    const usuarioId   = req.user.usuario_id;
    const { items }   = req.body;

    if (!Array.isArray(items)) {
      return badRequestResponse(res, { mensaje: 'El body debe tener { items: [...] }' });
    }

    await sequelize.transaction(async (t) => {
      const carrito = await obtenerOCrearCarrito(usuarioId, t);

      for (const item of items) {
        const { producto_id, talle_id = null, cantidad, precio_unidad } = item;

        if (!producto_id || typeof cantidad !== "number" || cantidad <= 0) continue;

        const existente = await Carr02Item.findOne({
          where: { RELA_CARR01: carrito.ID_CARR01, RELA_PROD03: producto_id, RELA_PROD04: talle_id },
          transaction: t,
        });

        if (existente) {
          // fusión: suma cantidades del servidor y del cliente
          await existente.update(
            { CARR02_CANTIDAD: existente.CARR02_CANTIDAD + cantidad },
            { transaction: t }
          );
        } else {
          await Carr02Item.create({
            RELA_CARR01:       carrito.ID_CARR01,
            RELA_PROD03:       producto_id,
            RELA_PROD04:       talle_id,
            CARR02_CANTIDAD:   cantidad,
            CARR02_PRECIO_UNIDAD: precio_unidad ?? 0,
            CARR02_FECHAALTA:  new Date(),
          }, { transaction: t });
        }
      }

      // actualiza timestamp del carrito
      await carrito.update({ CARR01_FECHAMOD: new Date() }, { transaction: t });
    });

    // devuelve el carrito fusionado para que el frontend actualice su estado
    return obtenerCarrito(req, res);
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo sincronizar el carrito", error });
  }
}

// =============================================================
// POST /carrito/items
// Body: { producto_id, talle_id?, cantidad, precio_unidad }
// Si el item ya existe → suma cantidad.
// =============================================================

export async function agregarItem(req, res) {
  try {
    const usuarioId = req.user.usuario_id;
    const { producto_id, talle_id = null, cantidad = 1, precio_unidad } = req.body;

    if (!producto_id || !precio_unidad) {
      return badRequestResponse(res, { mensaje: "producto_id y precio_unidad son requeridos" });
    }

    await sequelize.transaction(async (t) => {
      const carrito = await obtenerOCrearCarrito(usuarioId, t);

      const existente = await Carr02Item.findOne({
        where: { RELA_CARR01: carrito.ID_CARR01, RELA_PROD03: producto_id, RELA_PROD04: talle_id },
        transaction: t,
      });

      if (existente) {
        await existente.update(
          { CARR02_CANTIDAD: existente.CARR02_CANTIDAD + cantidad },
          { transaction: t }
        );
      } else {
        await Carr02Item.create({
          RELA_CARR01:         carrito.ID_CARR01,
          RELA_PROD03:         producto_id,
          RELA_PROD04:         talle_id,
          CARR02_CANTIDAD:     cantidad,
          CARR02_PRECIO_UNIDAD: precio_unidad,
          CARR02_FECHAALTA:    new Date(),
        }, { transaction: t });
      }

      await carrito.update({ CARR01_FECHAMOD: new Date() }, { transaction: t });
    });

    return obtenerCarrito(req, res);
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo agregar el item al carrito", error });
  }
}

// =============================================================
// PUT /carrito/items/:itemId
// Body: { cantidad: number }
// cantidad = 0 → elimina el item
// =============================================================

export async function actualizarItem(req, res) {
  try {
    const usuarioId   = req.user.usuario_id;
    const { itemId }  = req.params;
    const { cantidad } = req.body;

    if (typeof cantidad !== "number" || cantidad < 0) {
      return badRequestResponse(res, { mensaje: "cantidad debe ser un número >= 0" });
    }

    const carrito = await obtenerOCrearCarrito(usuarioId);

    const item = await Carr02Item.findOne({
      where: { ID_CARR02: itemId, RELA_CARR01: carrito.ID_CARR01 },
    });

    if (!item) return notFoundResponse(res, { mensaje: "Item no encontrado en el carrito" });

    if (cantidad === 0) {
      await item.destroy();
    } else {
      await item.update({ CARR02_CANTIDAD: cantidad });
    }

    await carrito.update({ CARR01_FECHAMOD: new Date() });

    return obtenerCarrito(req, res);
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo actualizar el item", error });
  }
}

// =============================================================
// DELETE /carrito/items/:itemId
// Elimina un item específico del carrito
// =============================================================

export async function eliminarItem(req, res) {
  try {
    const usuarioId  = req.user.usuario_id;
    const { itemId } = req.params;

    const carrito = await obtenerOCrearCarrito(usuarioId);

    const item = await Carr02Item.findOne({
      where: { ID_CARR02: itemId, RELA_CARR01: carrito.ID_CARR01 },
    });

    if (!item) return notFoundResponse(res, { mensaje: "Item no encontrado en el carrito" });

    await item.destroy();
    await carrito.update({ CARR01_FECHAMOD: new Date() });

    return obtenerCarrito(req, res);
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo eliminar el item", error });
  }
}

// =============================================================
// DELETE /carrito
// Vacía completamente el carrito del usuario
// =============================================================

export async function vaciarCarrito(req, res) {
  try {
    const usuarioId = req.user.usuario_id;
    const carrito   = await obtenerOCrearCarrito(usuarioId);

    await Carr02Item.destroy({ where: { RELA_CARR01: carrito.ID_CARR01 } });
    await carrito.update({ CARR01_FECHAMOD: new Date() });

    return okResponse(res, { data: [], mensaje: "Carrito vaciado correctamente" });
  } catch (error) {
    return errorResponse(res, { mensaje: "No se pudo vaciar el carrito", error });
  }
}
