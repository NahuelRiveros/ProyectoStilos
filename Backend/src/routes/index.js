import { Router } from "express";
import { sequelize } from "../database/sequelize.js";

import { authRouter }          from "./auth_routes.js";
import { usuariosRouter }      from "./usuarios_routes.js";
import { catalogosRouter }     from "./catalogos_routes.js";
import { navRouter }           from "./nav_routes.js";
import { productosRouter }     from "./productos_routes.js";
import { carritoRouter }       from "./carrito_routes.js";
import { ordenesRouter }       from "./ordenes_routes.js";
import { pagosRouter }         from "./pagos_routes.js";
import { comprobantesRouter }  from "./comprobantes_routes.js";
import { clientesRouter }      from "./clientes_routes.js";
import { uploadRouter }        from "./upload_routes.js";
import { homeConfigRouter }    from "./home_config_routes.js";

// ── Routers de dominio (descomentar cuando el dominio esté listo) ──
// import { personasRouter } from "./personas_routes.js";

const router = Router();

// ==========================================================
// HEALTH CHECK + DB
// ==========================================================

router.get("/health", async (_req, res) => {
  try {
    await sequelize.query("SELECT 1");
    return res.json({
      ok:        true,
      mensaje:   "Servidor y base de datos funcionando",
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("❌ Health Error:", error);
    return res.status(500).json({
      ok:      false,
      mensaje: "Servidor activo pero la base de datos no responde",
    });
  }
});

// ==========================================================
// MÓDULO AUTH (autónomo, reutilizable)
// ==========================================================

router.use("/auth",          authRouter);
router.use("/usuarios",      usuariosRouter);
router.use("/catalogos",     catalogosRouter);
router.use("/nav",           navRouter);
router.use("/productos",     productosRouter);
router.use("/carrito",       carritoRouter);
router.use("/ordenes",       ordenesRouter);
router.use("/pagos",         pagosRouter);
router.use("/comprobantes",  comprobantesRouter);
router.use("/clientes",      clientesRouter);
router.use("/upload",        uploadRouter);
router.use("/home-config",   homeConfigRouter);

// ==========================================================
// ROUTERS DE DOMINIO
// Cada proyecto agrega sus propios routers acá.
// Patrón: router.use("/entidad", requireAuth, entidadRouter);
// ==========================================================

// router.use("/personas", personasRouter);

export default router;
