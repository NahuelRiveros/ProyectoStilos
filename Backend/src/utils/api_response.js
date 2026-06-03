// =============================================================
// utils/api_response.js
// Helpers centralizados para respuestas HTTP consistentes.
// Siempre responden con: { ok, data, mensaje, pagination? }
// =============================================================

/**
 * Respuesta exitosa (200)
 * @param {import('express').Response} res
 * @param {object} opciones
 * @param {any}    opciones.data       - Datos a devolver
 * @param {string} opciones.mensaje    - Mensaje descriptivo
 * @param {object} [opciones.pagination] - Objeto de paginación (opcional)
 * @param {number} [opciones.status]   - Código HTTP (por defecto 200)
 */
export function okResponse(res, { data = null, mensaje = "OK", pagination = null, status = 200 } = {}) {
  const body = { ok: true, mensaje, data };
  if (pagination) body.pagination = pagination;
  return res.status(status).json(body);
}

/**
 * Respuesta de recurso creado (201)
 */
export function createdResponse(res, { data = null, mensaje = "Registro creado correctamente" } = {}) {
  return res.status(201).json({ ok: true, mensaje, data });
}

/**
 * Respuesta de error del servidor (500 por defecto)
 * @param {import('express').Response} res
 * @param {object} opciones
 * @param {string} opciones.mensaje   - Mensaje de error legible
 * @param {Error}  [opciones.error]   - Error original (se loguea, no se expone en prod)
 * @param {number} [opciones.status]  - Código HTTP (por defecto 500)
 */
export function errorResponse(res, { mensaje = "Error interno del servidor", error = null, status = 500 } = {}) {
  // Logueamos el error real en consola pero NO lo enviamos al cliente
  if (error) {
    console.error(`[ERROR] ${mensaje}:`, error?.message || error);
  }

  return res.status(status).json({ ok: false, mensaje, data: null });
}

/**
 * Respuesta de recurso no encontrado (404)
 */
export function notFoundResponse(res, { mensaje = "Recurso no encontrado" } = {}) {
  return res.status(404).json({ ok: false, mensaje, data: null });
}

/**
 * Respuesta de petición inválida (400)
 */
export function badRequestResponse(res, { mensaje = "Petición inválida" } = {}) {
  return res.status(400).json({ ok: false, mensaje, data: null });
}