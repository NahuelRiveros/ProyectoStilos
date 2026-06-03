import { createApp } from "./app.js";
import { env } from "./configuracion_servidor/env.js";
import { conectarDB } from "./database/sequelize.js";
import { bootstrap_database } from "./database/bootstrap.js";
import { probarSMTP } from "./services/mail_service.js";
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

    const app = createApp();

    app.listen(env.PORT, "0.0.0.0", () => {
      console.log("====================================");
      console.log(`✅ ${env.APP_FULL_NAME}`);
      console.log(`✅ API local: http://localhost:${env.PORT}`);
      console.log(`✅ HEALTH:    http://localhost:${env.PORT}/health`);
      console.log(`✅ API base:  http://localhost:${env.PORT}/api`);
      console.log("====================================");
    });
  } catch (error) {
    console.error("❌ Error crítico al iniciar el servidor:", error);
    process.exit(1);
  }
}

main();