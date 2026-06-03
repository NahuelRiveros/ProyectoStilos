import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { env } from "../configuracion_servidor/env.js";
import {
  Auth01Rol,
  Auth02Usuario,
  Auth03ResetToken,
  Auth04LogSesion,
} from "../models/index.js";
import { enviarMailRecuperacionPassword } from "./mail_service.js";

// ==========================================================
// LOGIN
// ==========================================================

export async function login({ email, password, ip }) {
  const emailInput = String(email || "").trim().toLowerCase();
  const passwordInput = String(password || "");

  if (!emailInput || !passwordInput) {
    return {
      ok: false,
      codigo: "LOGIN_DATOS_REQUERIDOS",
      mensaje: "Email y contraseña son obligatorios",
    };
  }

  const usuario = await Auth02Usuario.findOne({
    where: { AUTH02_EMAIL: emailInput },
    include: [{ model: Auth01Rol, as: "rol" }],
  });

  if (!usuario) {
    await _log({ usuario_id: null, email: emailInput, ip, resultado: "FAIL_NOT_FOUND" });
    return { ok: false, codigo: "LOGIN_INVALIDO", mensaje: "Credenciales inválidas" };
  }

  if (usuario.AUTH02_FECHABAJA) {
    await _log({ usuario_id: usuario.ID_AUTH02, email: emailInput, ip, resultado: "FAIL_INACTIVO" });
    return { ok: false, codigo: "USUARIO_INACTIVO", mensaje: "El usuario se encuentra inactivo" };
  }

  const passwordOk = await bcrypt.compare(passwordInput, usuario.AUTH02_CONTRASENA);
  if (!passwordOk) {
    await _log({ usuario_id: usuario.ID_AUTH02, email: emailInput, ip, resultado: "FAIL_PASS" });
    return { ok: false, codigo: "LOGIN_INVALIDO", mensaje: "Credenciales inválidas" };
  }

  await _log({ usuario_id: usuario.ID_AUTH02, email: emailInput, ip, resultado: "OK" });

  const payload = _buildPayload(usuario);
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

  return { ok: true, token, user: payload };
}

// ==========================================================
// FORGOT PASSWORD
// ==========================================================

export async function forgotPasswordService({ email }) {
  const emailInput = String(email || "").trim().toLowerCase();

  // Respuesta genérica siempre (no revelar si el email existe)
  const respuestaGenerica = {
    ok: true,
    mensaje: "Si el correo existe, se enviará un enlace de recuperación.",
  };

  if (!emailInput) return respuestaGenerica;

  const usuario = await Auth02Usuario.findOne({
    where: { AUTH02_EMAIL: emailInput },
  });

  if (!usuario || usuario.AUTH02_FECHABAJA) return respuestaGenerica;

  // Invalidar tokens anteriores
  await Auth03ResetToken.update(
    { AUTH03_USADO: true },
    { where: { RELA_AUTH02: usuario.ID_AUTH02, AUTH03_USADO: false } }
  );

  const tokenPlano = crypto.randomBytes(32).toString("hex");
  const tokenHash  = crypto.createHash("sha256").update(tokenPlano).digest("hex");
  const minutos    = env.RESET_TOKEN_EXPIRES_MINUTES || 30;
  const expira     = new Date(Date.now() + 1000 * 60 * minutos);

  await Auth03ResetToken.create({
    RELA_AUTH02:      usuario.ID_AUTH02,
    AUTH03_TOKEN:     tokenHash,
    AUTH03_EXPIRA:    expira,
    AUTH03_USADO:     false,
    AUTH03_FECHAALTA: new Date(),
  });

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${tokenPlano}`;
  const nombre   = `${usuario.AUTH02_NOMBRE} ${usuario.AUTH02_APELLIDO}`.trim();

  await enviarMailRecuperacionPassword({ to: emailInput, nombre, resetUrl });

  return respuestaGenerica;
}

// ==========================================================
// RESET PASSWORD
// ==========================================================

export async function resetPasswordService({ token, password }) {
  if (!token || !password) {
    return {
      ok: false,
      codigo: "RESET_PASSWORD_DATOS_INCOMPLETOS",
      mensaje: "Token y contraseña son obligatorios",
    };
  }

  if (String(password).length < 6) {
    return {
      ok: false,
      codigo: "RESET_PASSWORD_INVALIDA",
      mensaje: "La contraseña debe tener al menos 6 caracteres",
    };
  }

  const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");

  const resetRow = await Auth03ResetToken.findOne({
    where: { AUTH03_TOKEN: tokenHash, AUTH03_USADO: false },
  });

  if (!resetRow) {
    return { ok: false, codigo: "RESET_PASSWORD_TOKEN_INVALIDO", mensaje: "El enlace no es válido" };
  }

  if (new Date(resetRow.AUTH03_EXPIRA).getTime() < Date.now()) {
    return { ok: false, codigo: "RESET_PASSWORD_TOKEN_EXPIRADO", mensaje: "El enlace ha expirado" };
  }

  const usuario = await Auth02Usuario.findByPk(resetRow.RELA_AUTH02);

  if (!usuario || usuario.AUTH02_FECHABAJA) {
    return { ok: false, codigo: "RESET_PASSWORD_USUARIO_INVALIDO", mensaje: "No se pudo actualizar la contraseña" };
  }

  const passwordHash = await bcrypt.hash(String(password), 10);

  await usuario.update({ AUTH02_CONTRASENA: passwordHash });
  await resetRow.update({ AUTH03_USADO: true });

  return { ok: true, mensaje: "Contraseña actualizada correctamente" };
}

// ==========================================================
// HELPERS PRIVADOS
// ==========================================================

function _buildPayload(usuario) {
  return {
    usuario_id: usuario.ID_AUTH02,
    rol_id:     usuario.RELA_AUTH01,
    rol:        usuario.rol?.AUTH01_NOMBRE  || null,
    username:   usuario.AUTH02_USERNAME,
    email:      usuario.AUTH02_EMAIL,
    nombre:     `${usuario.AUTH02_NOMBRE} ${usuario.AUTH02_APELLIDO}`.trim(),
  };
}

async function _log({ usuario_id, email, ip, resultado }) {
  try {
    await Auth04LogSesion.create({
      RELA_AUTH02:     usuario_id,
      AUTH04_EMAIL:    email,
      AUTH04_IP:       ip || null,
      AUTH04_RESULTADO: resultado,
    });
  } catch (_) {
    // El log nunca debe interrumpir el flujo de login
  }
}
