import cron from "node-cron";
import { getSuscripcionEstado, ESTADO_SUSCRIPCION } from "../services/suscripcion_service.js";
import { invalidarCacheSuscripcion } from "../middleware/suscripcion_middleware.js";

// ==========================================================
// CRON — Verificación diaria de suscripción
//
// Ejecuta todos los días a las 08:00.
// Invalida el cache y loguea el estado actual.
// Ideal para agregar notificaciones (email al admin, webhook, etc.)
// cuando el sistema entra en GRACIA o VENCIDO.
// ==========================================================

export function iniciarCronSuscripcion() {
  // "0 8 * * *" → todos los días a las 08:00
  cron.schedule("0 8 * * *", async () => {
    try {
      invalidarCacheSuscripcion();

      const { estado, suscripcion, diasRestantesGracia } = await getSuscripcionEstado();

      if (estado === ESTADO_SUSCRIPCION.ACTIVO) {
        const dias = suscripcion
          ? Math.ceil(
              (new Date(suscripcion.AUTH06_FECHA_FIN) - new Date()) / (1000 * 60 * 60 * 24)
            )
          : 0;
        console.log(`✅ [CRON] Suscripción ACTIVA — vence en ${dias} día(s)`);

        // Aviso preventivo si quedan menos de 7 días
        if (dias <= 7) {
          console.warn(`⚠️  [CRON] La suscripción vence en ${dias} día(s). Renovar pronto.`);
          // TODO: enviar email de aviso al admin → enviarMailAviso()
        }
      }

      if (estado === ESTADO_SUSCRIPCION.GRACIA) {
        console.warn(
          `⚠️  [CRON] Suscripción en GRACIA — ${diasRestantesGracia} día(s) para que se bloqueen escrituras`
        );
        // TODO: enviar email de urgencia al admin → enviarMailGracia()
      }

      if (estado === ESTADO_SUSCRIPCION.VENCIDO) {
        console.error("❌ [CRON] Suscripción VENCIDA — escrituras bloqueadas");
        // TODO: enviar email de bloqueo al admin → enviarMailVencida()
      }

      if (estado === ESTADO_SUSCRIPCION.SIN_SUSCRIPCION) {
        console.error("❌ [CRON] Sin suscripción activa — activar vía POST /api/admin/suscripcion/activar");
      }
    } catch (error) {
      console.error("❌ [CRON] Error en verificación de suscripción:", error.message);
    }
  });

  console.log("⏰ Cron de suscripción iniciado (verificación diaria a las 08:00)");
}
