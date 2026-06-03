import { login, forgotPasswordService, resetPasswordService } from "../services/auth_service.js";
import { crearUsuario } from "../services/usuarios_service.js";

// ==========================================================
// LOGIN
// ==========================================================

export async function loginController(req, res) {
  try {
    const { email, password } = req.body ?? {};

    const result = await login({ email, password, ip: req.ip });

    if (!result.ok) {
      return res.status(401).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("❌ loginController:", error);

    return res.status(500).json({
      ok: false,
      codigo: "ERROR_LOGIN",
      mensaje: "No se pudo iniciar sesión",
    });
  }
}

// ==========================================================
// SESIÓN ACTUAL
// ==========================================================

export async function meController(req, res) {
  return res.json({
    ok: true,
    user: req.user,
  });
}

// ==========================================================
// LOGOUT
// ==========================================================

export async function logoutController(_req, res) {
  return res.json({
    ok: true,
    mensaje: "Logout OK",
  });
}

// ==========================================================
// REGISTER
// ==========================================================

export async function registerController(req, res) {
  try {
    console.log("Llego: ",req.body)
    const result = await crearUsuario(req.body);

    if (!result.ok) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("❌ registerController:", error);

    return res.status(500).json({
      ok: false,
      codigo: "ERROR_REGISTER",
      mensaje: "Error al crear usuario",
    });
  }
}

// ==========================================================
// RECUPERAR CONTRASEÑA
// ==========================================================

export async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body ?? {};

    await forgotPasswordService({ email });

    return res.json({
      ok: true,
      mensaje: "Si el correo existe, se enviará un enlace de recuperación.",
    });
  } catch (error) {
    console.error("❌ forgotPasswordController:", error);

    return res.status(500).json({
      ok: false,
      codigo: "ERROR_FORGOT_PASSWORD",
      mensaje: "No se pudo procesar la solicitud",
    });
  }
}

// ==========================================================
// RESET PASSWORD
// ==========================================================

export async function resetPasswordController(req, res) {
  try {
    const { token, password } = req.body ?? {};

    const result = await resetPasswordService({ token, password });

    if (!result.ok) {
      return res.status(400).json(result);
    }

    return res.json({
      ok: true,
      mensaje: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("❌ resetPasswordController:", error);

    return res.status(500).json({
      ok: false,
      codigo: "ERROR_RESET_PASSWORD",
      mensaje: "No se pudo restablecer la contraseña",
    });
  }
}