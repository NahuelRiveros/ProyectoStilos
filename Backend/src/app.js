import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";
import { env } from "./configuracion_servidor/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================================
// RUTA FRONTEND
// ==========================================================

const rutaFrontend = path.resolve(__dirname, "../../frontend/dist");

export function createApp() {
  const app = express();

  // ==========================================================
  // SEGURIDAD
  // ==========================================================

  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  // ==========================================================
  // LOGS HTTP
  // ==========================================================

  app.use(
    morgan(env.NODE_ENV === "production" ? "combined" : "dev")
  );

  // ==========================================================
  // BODY PARSER
  // ==========================================================

  app.use(express.json({ limit: "2mb" }));

  app.use(express.urlencoded({ extended: true }));

  // ==========================================================
  // COOKIES
  // ==========================================================

  app.use(cookieParser());

  // ==========================================================
  // CORS
  // ==========================================================

  app.use(
    cors({
      origin: env.CORS_ORIGIN || true,
      credentials: true,
    })
  );

  // ==========================================================
  // HEALTH GENERAL
  // ==========================================================

  app.get("/health", (_req, res) => {
    return res.json({
      ok: true,
      app: env.APP_NAME,
      nombre: env.APP_FULL_NAME,
      mensaje: "Servidor activo",
      entorno: env.NODE_ENV,
      timestamp: new Date(),
    });
  });

  // ==========================================================
  // RUTAS API
  // ==========================================================

  app.use("/api", routes);

  // ==========================================================
  // FRONTEND REACT
  // ==========================================================

  if (fs.existsSync(rutaFrontend)) {
    app.use(express.static(rutaFrontend));

    // ========================================================
    // REACT ROUTER FALLBACK
    // ========================================================

    app.use((_req, res) => {
      return res.sendFile(
        path.join(rutaFrontend, "index.html")
      );
    });
  }

  // ==========================================================
  // MANEJO GLOBAL DE ERRORES
  // ==========================================================

  app.use((err, _req, res, _next) => {
    if (err?.type === "entity.parse.failed") {
      return res.status(400).json({
        ok: false,
        codigo: "JSON_INVALIDO",
        mensaje: "Body JSON inválido",
      });
    }

    console.error("❌ ERROR NO CONTROLADO:", err);

    return res.status(500).json({
      ok: false,
      codigo: "ERROR_INTERNO",
      mensaje: "Error interno del servidor",
    });
  });

  return app;
}