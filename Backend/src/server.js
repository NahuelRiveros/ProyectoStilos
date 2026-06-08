import { createApp } from "./app.js";
import { env } from "./configuracion_servidor/env.js";
import { conectarDB } from "./database/sequelize.js";
import { bootstrap_database } from "./database/bootstrap.js";
import { probarSMTP } from "./services/mail_service.js";
import { iniciarCronSuscripcion } from "./cron/suscripcion_cron.js";
import { iniciarCronKeepalive } from "./cron/keepalive_cron.js";
import "./models/index.js";

async function main() {
  try {
    console.log("🛠️ Iniciando servidor...");

    await conectarDB();
    console.log("✅ Conexión a PostgreSQL exitosa");

    await bootstrap_database();
    console.log("✅ Base de datos sincronizada");

    try {
      await probarSMTP();
      console.log("✅ SMTP OK");
    } catch (smtpError) {
      console.warn("⚠️ SMTP no disponible:", smtpError.message);
    }

    iniciarCronSuscripcion();
    iniciarCronKeepalive();

    const app = createApp();

    const PORT = process.env.PORT || 3000;

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("====================================");
      console.log(`✅ ${env.APP_FULL_NAME}`);
      console.log(`✅ Servidor escuchando en puerto ${PORT}`);
      console.log(`✅ HEALTH:    http://localhost:${PORT}/health`);
      console.log(`✅ API base:  http://localhost:${PORT}/api`);
      console.log("====================================");
    });

    // Graceful shutdown — Render envía SIGTERM antes de detener el contenedor.
    // Cerramos el servidor limpiamente para no cortar requests en curso.
    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM recibido — cerrando servidor...");
      server.close(() => {
        console.log("✅ Servidor cerrado correctamente");
        process.exit(0);
      });
    });

    process.on("unhandledRejection", (reason) => {
      console.error("❌ Promesa rechazada no manejada:", reason);
    });
  } catch (error) {
    console.error("❌ Error crítico al iniciar el servidor:", error);
    process.exit(1);
  }
}

main();