import jwt from "jsonwebtoken";
import { env } from "../configuracion_servidor/env.js";

// ==========================================================
// VALIDAR JWT
// Adjunta req.user con todo lo necesario para los guards:
//   - usuario_id, email, nombre
//   - roles_abr: ["ADM"]           → para requireRole / requireAccess
//   - nivel: 100                   → para requireNivel / requireAccess
// ==========================================================

export function requireAuth(req, res, next) {
  try {
    const auth  = req.headers.authorization ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        ok: false,
        codigo: "TOKEN_REQUERIDO",
        mensaje: "Debés iniciar sesión",
      });
    }

    const payload = jwt.verify(token, env.JWT_SECRET);

    req.user = {
      usuario_id: payload.usuario_id,
      roles_abr:  payload.roles_abr ?? [],
      nivel:      payload.nivel     ?? 0,
      email:      payload.email,
      nombre:     payload.nombre,
    };

    return next();
  } catch {
    return res.status(401).json({
      ok: false,
      codigo: "TOKEN_INVALIDO",
      mensaje: "Sesión inválida o expirada",
    });
  }
}

// ==========================================================
// requireRole(...abreviaturas)
//
// Uso: requireRole("ADM", "CAJ")
// Pasa si el usuario tiene AL MENOS UNA de las abreviaturas exactas.
// Útil para permisos específicos de negocio (solo caja, solo recepción).
// ==========================================================

export function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    const userAbr    = (req.user?.roles_abr ?? []).map((r) => String(r).toUpperCase());
    const permitidos = rolesPermitidos.map((r) => String(r).toUpperCase());

    if (userAbr.some((r) => permitidos.includes(r))) return next();

    return res.status(403).json({
      ok: false,
      codigo: "SIN_PERMISOS",
      mensaje: "No autorizado",
    });
  };
}

// ==========================================================
// requireNivel(minNivel)
//
// Uso: requireNivel(50)
// Pasa si req.user.nivel >= minNivel.
// Funciona para CUALQUIER rol con ese nivel, sin listarlo.
// Ideal para grupos genéricos: "cualquier staff", "cualquier admin".
//
// Convención de niveles:
//   100 → Administrador (ADM)
//    50 → Staff (cualquier rol intermedio del proyecto)
//    10 → Usuario básico (USR)
//     0 → Sin rol asignado (bloqueado)
// ==========================================================

export function requireNivel(minNivel) {
  return (req, res, next) => {
    if ((req.user?.nivel ?? 0) >= minNivel) return next();

    return res.status(403).json({
      ok: false,
      codigo: "SIN_PERMISOS",
      mensaje: "No autorizado",
    });
  };
}

// ==========================================================
// requireAccess(config)
//
// Middleware unificado que acepta configuración del ACCESS matrix.
// config puede tener:
//   { nivel: 50 }               → requireNivel interno
//   { roles: ["ADM", "CAJ"] }   → requireRole interno
//   { nivel: 50, roles: [...] } → pasa si cumple CUALQUIERA de los dos
//
// Uso en rutas:
//   router.get("/ruta", requireAuth, requireAccess(ACCESS.ENTIDAD_GET), handler)
// ==========================================================

export function requireAccess(config) {
  return (req, res, next) => {
    if (!config) {
      return res.status(500).json({ ok: false, mensaje: "Configuración de acceso inválida" });
    }

    // Check por nivel
    if (config.nivel !== undefined) {
      if ((req.user?.nivel ?? 0) >= config.nivel) return next();
    }

    // Check por roles exactos
    if (Array.isArray(config.roles) && config.roles.length > 0) {
      const userAbr    = (req.user?.roles_abr ?? []).map((r) => String(r).toUpperCase());
      const permitidos = config.roles.map((r) => String(r).toUpperCase());
      if (userAbr.some((r) => permitidos.includes(r))) return next();
    }

    return res.status(403).json({
      ok: false,
      codigo: "SIN_PERMISOS",
      mensaje: "No autorizado",
    });
  };
}
