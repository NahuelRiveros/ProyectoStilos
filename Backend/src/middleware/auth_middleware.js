import jwt from "jsonwebtoken";
import { env } from "../configuracion_servidor/env.js";

// ==========================================================
// VALIDAR JWT
// ==========================================================

export function requireAuth(req, res, next) {
  try {
    const auth  = req.headers.authorization || "";
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
      rol_id:     payload.rol_id,
      rol:        payload.rol,      // usado por requireRole
      username:   payload.username,
      email:      payload.email,
      nombre:     payload.nombre,
    };

    return next();
  } catch (error) {
    console.error("❌ JWT ERROR:", error.name, error.message);

    return res.status(401).json({
      ok: false,
      codigo: "TOKEN_INVALIDO",
      mensaje: "Sesión inválida",
    });
  }
}

// ==========================================================
// VALIDAR ROLES
// Uso: requireRole(...ACCESS.USUARIOS_GET)
// ==========================================================

export function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    const rolUsuario = String(req.user?.rol || "").trim().toLowerCase();
    const permitidos = rolesPermitidos.map((r) => String(r).trim().toLowerCase());

    if (!permitidos.includes(rolUsuario)) {
      return res.status(403).json({
        ok: false,
        codigo: "SIN_PERMISOS",
        mensaje: "No autorizado",
      });
    }

    return next();
  };
}
