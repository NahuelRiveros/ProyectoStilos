import { getSuscripcionEstado, activarSuscripcion, calcularEstado } from "../services/suscripcion_service.js";
import { invalidarCacheSuscripcion } from "../middleware/suscripcion_middleware.js";

// GET /api/admin/suscripcion
export async function estadoSuscripcionController(_req, res) {
  try {
    const { estado, suscripcion, diasRestantesGracia } = await getSuscripcionEstado();

    return res.json({
      ok: true,
      data: {
        estado,
        diasRestantesGracia,
        fecha_inicio:  suscripcion?.AUTH06_FECHA_INICIO  ?? null,
        fecha_fin:     suscripcion?.AUTH06_FECHA_FIN      ?? null,
        renovaciones:  suscripcion?.AUTH06_RENOVACIONES   ?? 0,
        dias_gracia:   suscripcion?.AUTH06_DIAS_GRACIA    ?? 10,
        notas:         suscripcion?.AUTH06_NOTAS          ?? null,
      },
    });
  } catch (error) {
    console.error("estadoSuscripcionController:", error);
    return res.status(500).json({ ok: false, mensaje: "Error al obtener estado de suscripción" });
  }
}

// POST /api/admin/suscripcion/activar
// Body: { dias: 30, notas?: "Pagó el 5 vía transferencia" }
export async function activarSuscripcionController(req, res) {
  try {
    const { dias, notas } = req.body ?? {};
    const result = await activarSuscripcion({ dias, notas });

    if (!result.ok) return res.status(400).json(result);

    // Invalidar cache para que el cambio sea inmediato
    invalidarCacheSuscripcion();

    return res.json(result);
  } catch (error) {
    console.error("activarSuscripcionController:", error);
    return res.status(500).json({ ok: false, mensaje: "Error al activar la suscripción" });
  }
}

// PUT /api/admin/suscripcion/gracia
// Cambia el número de días del período de gracia
// Body: { dias_gracia: 10 }
export async function actualizarGraciaController(req, res) {
  try {
    const diasGracia = Number(req.body?.dias_gracia);

    if (!Number.isInteger(diasGracia) || diasGracia < 1 || diasGracia > 28) {
      return res.status(400).json({
        ok: false,
        mensaje: "dias_gracia debe ser un entero entre 1 y 28",
      });
    }

    const { getSuscripcion } = await import("../services/suscripcion_service.js");
    const suscripcion = await getSuscripcion();

    if (!suscripcion) {
      return res.status(404).json({ ok: false, mensaje: "No existe suscripción. Activá primero." });
    }

    await suscripcion.update({ AUTH06_DIAS_GRACIA: diasGracia });
    invalidarCacheSuscripcion();

    return res.json({
      ok: true,
      mensaje: `Período de gracia actualizado a ${diasGracia} día(s) por mes`,
    });
  } catch (error) {
    console.error("actualizarGraciaController:", error);
    return res.status(500).json({ ok: false, mensaje: "Error al actualizar período de gracia" });
  }
}
