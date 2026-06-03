import { Router } from "express";
import { sequelize } from "../database/sequelize.js";

import { authRouter }      from "./auth_routes.js";
import { usuariosRouter }  from "./usuarios_routes.js";
import { catalogosRouter } from "./catalogos_routes.js";
import { adminRouter }     from "./admin_routes.js";

import { verificarSuscripcion } from "../middleware/suscripcion_middleware.js";

// ── Routers de dominio (descomentar cuando el dominio esté listo) ──
// import { personasRouter } from "./personas_routes.js";

const router = Router();

// ==========================================================
// HEALTH CHECK + DB (siempre accesible)
// ==========================================================

router.get("/health", async (_req, res) => {
  try {
    await sequelize.query("SELECT 1");
    return res.json({ ok: true, mensaje: "Servidor y base de datos funcionando", timestamp: new Date() });
  } catch {
    return res.status(500).json({ ok: false, mensaje: "Servidor activo pero la base de datos no responde" });
  }
});

// ==========================================================
// AUTH — siempre accesible (login debe funcionar aunque esté vencida)
// ==========================================================

router.use("/auth", authRouter);

// ==========================================================
// ADMIN — siempre accesible (el admin debe poder renovar aunque vencida)
// ==========================================================

router.use("/admin", adminRouter);

// ==========================================================
// MIDDLEWARE DE SUSCRIPCIÓN
// Se aplica a todo lo que venga después (usuarios, catalogos, dominio).
// /auth y /admin están exentos por estar montados antes.
// ==========================================================

router.use(verificarSuscripcion);

// ==========================================================
// RUTAS PROTEGIDAS POR SUSCRIPCIÓN
// ==========================================================

router.use("/usuarios",  usuariosRouter);
router.use("/catalogos", catalogosRouter);

// ==========================================================
// ROUTERS DE DOMINIO DEL PROYECTO
// Agregar acá los módulos específicos de cada proyecto.
// Todos heredan automáticamente el middleware de suscripción.
// Patrón: router.use("/entidad", requireAuth, entidadRouter);
// ==========================================================

// router.use("/personas", personasRouter);

export default router;
