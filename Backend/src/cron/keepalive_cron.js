import cron from "node-cron";
import { env } from "../configuracion_servidor/env.js";

// Render free tier duerme el servidor tras 15 min sin tráfico.
// Este cron hace un GET a /health cada 10 minutos en producción para mantenerlo activo.

export function iniciarCronKeepalive() {
  if (env.NODE_ENV !== "production") return;

  // "*/10 * * * *" → cada 10 minutos
  cron.schedule("*/10 * * * *", async () => {
    const url = `${env.BACKEND_URL}/health`;
    try {
      const res = await fetch(url);
      console.log(`🏓 [KEEPALIVE] ${url} → ${res.status}`);
    } catch (err) {
      console.warn(`⚠️  [KEEPALIVE] Falló ping a ${url}:`, err.message);
    }
  });

  console.log("⏰ Cron keepalive iniciado (ping cada 10 min en producción)");
}
