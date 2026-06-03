// =============================================================
// utils/pagination.js
// Helpers para calcular y formatear paginación.
// =============================================================

// Valores por defecto y límites de seguridad
const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT     = 100;

/**
 * Sanitiza y devuelve valores seguros de page y limit.
 * Evita NaN, negativos y límites abusivos.
 *
 * @param {any} rawPage  - Valor crudo del query param "page"
 * @param {any} rawLimit - Valor crudo del query param "limit"
 * @returns {{ page: number, limit: number, offset: number }}
 */
export function sanitizarPaginacion(rawPage, rawLimit) {
  let page  = parseInt(rawPage,  10);
  let limit = parseInt(rawLimit, 10);

  if (isNaN(page)  || page  < 1) page  = DEFAULT_PAGE;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT)         limit = MAX_LIMIT;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Construye el objeto de paginación para incluir en la respuesta.
 *
 * @param {object} params
 * @param {number} params.total   - Total de registros (count)
 * @param {number} params.page    - Página actual
 * @param {number} params.limit   - Registros por página
 * @returns {object} Objeto pagination listo para la respuesta
 */
export function construirPaginacion({ total, page, limit }) {
  const totalPaginas = Math.ceil(total / limit);

  return {
    total,
    totalPaginas,
    paginaActual: page,
    porPagina: limit,
    tieneSiguiente: page < totalPaginas,
    tieneAnterior: page > 1,
  };
}