import { getSuscripcionEstado, ESTADO_SUSCRIPCION } from "../services/suscripcion_service.js";

// ==========================================================
// CACHE EN MEMORIA
// Evita golpear la DB en cada request. TTL: 5 minutos.
// Se invalida automáticamente al activar/renovar la suscripción.
// ==========================================================

const CACHE_TTL_MS = 5 * 60 * 1000;
let _cache = { data: null, expira: 0 };

export function invalidarCacheSuscripcion() {
  _cache = { data: null, expira: 0 };
}

async function getCacheado() {
  if (_cache.data && Date.now() < _cache.expira) return _cache.data;
  const data  = await getSuscripcionEstado();
  _cache      = { data, expira: Date.now() + CACHE_TTL_MS };
  return data;
}

// ==========================================================
// MÉTODOS HTTP QUE ESCRIBEN (se bloquean cuando VENCIDO)
// ==========================================================

const METODOS_ESCRITURA = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// ==========================================================
// verificarSuscripcion
//
// Comportamiento por estado:
//   ACTIVO          → pasa sin cambios
//   GRACIA          → pasa, agrega header X-Suscripcion-Aviso y campo en JSON
//   VENCIDO         → bloquea escrituras (POST/PUT/PATCH/DELETE) con 402
//   SIN_SUSCRIPCION → bloquea escrituras con 402
//
// Rutas siempre exentas (se declaran en routes/index.js):
//   /api/auth/* y /api/admin/suscripcion/* — siempre accesibles
// ==========================================================

export async function verificarSuscripcion(req, res, next) {
  try {
    const { estado, diasRestantesGracia } = await getCacheado();

    if (estado === ESTADO_SUSCRIPCION.ACTIVO) return next();

    if (estado === ESTADO_SUSCRIPCION.GRACIA) {
      // Permite todo pero avisa que quedan N días de gracia
      res.setHeader(
        "X-Suscripcion-Aviso",
        `Período de gracia: ${diasRestantesGracia} día(s) restante(s) para renovar`
      );
      req.suscripcionEnGracia = true;
      req.diasRestantesGracia = diasRestantesGracia;
      return next();
    }

    // VENCIDO o SIN_SUSCRIPCION — bloquear escrituras
    if (METODOS_ESCRITURA.has(req.method)) {
      return res.status(402).json({
        ok:     false,
        codigo: "SUSCRIPCION_VENCIDA",
        mensaje:
          estado === ESTADO_SUSCRIPCION.SIN_SUSCRIPCION
            ? "El sistema no tiene suscripción activa. Contactá al administrador."
            : "La suscripción ha vencido. Contactá al administrador para renovar.",
      });
    }

    // GET pasa siempre (el usuario puede ver sus datos aunque esté vencido)
    return next();
  } catch (error) {
    // Si falla el check de suscripción, no bloqueamos el sistema (fail-open)
    console.error("⚠️  Error al verificar suscripción:", error.message);
    return next();
  }
}
