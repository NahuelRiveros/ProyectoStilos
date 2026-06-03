import bcrypt from "bcryptjs";
import { Auth01Rol, Auth02Usuario } from "../models/index.js";

// ==========================================================
// HELPERS
// ==========================================================

function normalizarTexto(t)  { return String(t || "").trim(); }
function normalizarEmail(e)  { return String(e || "").trim().toLowerCase(); }
function derivarUsername(email) { return email.split("@")[0].replace(/[^a-z0-9._-]/gi, ""); }

// ==========================================================
// CREAR USUARIO
// ==========================================================

export async function crearUsuario(data) {
  const nombre   = normalizarTexto(data?.nombre);
  const apellido = normalizarTexto(data?.apellido);
  const email    = normalizarEmail(data?.email);
  const password = String(data?.password || "");
  const username = normalizarTexto(data?.username) || derivarUsername(email);

  if (!nombre || !apellido || !email || !password) {
    return { ok: false, mensaje: "Faltan datos obligatorios: nombre, apellido, email, password" };
  }

  if (password.length < 6) {
    return { ok: false, mensaje: "La contraseña debe tener al menos 6 caracteres" };
  }

  const emailOcupado = await Auth02Usuario.findOne({ where: { AUTH02_EMAIL: email } });
  if (emailOcupado) {
    return { ok: false, mensaje: "Ya existe un usuario con ese correo" };
  }

  const usernameOcupado = await Auth02Usuario.findOne({ where: { AUTH02_USERNAME: username } });
  if (usernameOcupado) {
    return { ok: false, mensaje: "El nombre de usuario ya está en uso" };
  }

  // Rol por defecto: USR (Usuario)
  const rol = await Auth01Rol.findOne({
    where: { AUTH01_ABREVIATURA: data?.rol_abreviatura || "USR" },
  });

  if (!rol) {
    return { ok: false, mensaje: "No existe el rol indicado" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const usuario = await Auth02Usuario.create({
    RELA_AUTH01:      rol.ID_AUTH01,
    AUTH02_NOMBRE:    nombre,
    AUTH02_APELLIDO:  apellido,
    AUTH02_EMAIL:     email,
    AUTH02_CONTRASENA: passwordHash,
    AUTH02_USERNAME:  username,
    AUTH02_AVATAR:    null,
    AUTH02_FECHAALTA: new Date(),
    AUTH02_FECHABAJA: null,
  });

  return {
    ok: true,
    mensaje: "Usuario creado correctamente",
    data: {
      usuario_id: usuario.ID_AUTH02,
      email:      usuario.AUTH02_EMAIL,
      username:   usuario.AUTH02_USERNAME,
      rol:        rol.AUTH01_NOMBRE,
    },
  };
}

// ==========================================================
// LISTAR USUARIOS
// ==========================================================

export async function listarUsuarios() {
  return await Auth02Usuario.findAll({
    include: [{ model: Auth01Rol, as: "rol" }],
    order: [["ID_AUTH02", "DESC"]],
  });
}

// ==========================================================
// OBTENER USUARIO
// ==========================================================

export async function obtenerUsuario(id) {
  return await Auth02Usuario.findByPk(id, {
    include: [{ model: Auth01Rol, as: "rol" }],
  });
}

// ==========================================================
// ACTUALIZAR USUARIO
// ==========================================================

export async function actualizarUsuario(id, data) {
  const usuario = await Auth02Usuario.findByPk(id);

  if (!usuario) {
    return { ok: false, mensaje: "Usuario no encontrado" };
  }

  const campos = {};

  if (data?.nombre)   campos.AUTH02_NOMBRE   = normalizarTexto(data.nombre);
  if (data?.apellido) campos.AUTH02_APELLIDO  = normalizarTexto(data.apellido);
  if (data?.avatar)   campos.AUTH02_AVATAR    = normalizarTexto(data.avatar);

  if (data?.email) {
    const emailNvo = normalizarEmail(data.email);
    const ocupado  = await Auth02Usuario.findOne({ where: { AUTH02_EMAIL: emailNvo } });
    if (ocupado && ocupado.ID_AUTH02 !== Number(id)) {
      return { ok: false, mensaje: "Ya existe un usuario con ese correo" };
    }
    campos.AUTH02_EMAIL = emailNvo;
  }

  if (data?.username) {
    const usernameNvo = normalizarTexto(data.username);
    const ocupado     = await Auth02Usuario.findOne({ where: { AUTH02_USERNAME: usernameNvo } });
    if (ocupado && ocupado.ID_AUTH02 !== Number(id)) {
      return { ok: false, mensaje: "El nombre de usuario ya está en uso" };
    }
    campos.AUTH02_USERNAME = usernameNvo;
  }

  if (data?.password) {
    campos.AUTH02_CONTRASENA = await bcrypt.hash(String(data.password), 10);
  }

  await usuario.update(campos);

  return { ok: true, mensaje: "Usuario actualizado correctamente" };
}

// ==========================================================
// BAJA LÓGICA
// ==========================================================

export async function eliminarUsuario(id) {
  const usuario = await Auth02Usuario.findByPk(id);

  if (!usuario) return { ok: false, mensaje: "Usuario no encontrado" };

  await usuario.update({ AUTH02_FECHABAJA: new Date() });

  return { ok: true, mensaje: "Usuario desactivado correctamente" };
}

// ==========================================================
// REACTIVAR
// ==========================================================

export async function reactivarUsuario(id) {
  const usuario = await Auth02Usuario.findByPk(id);

  if (!usuario) return { ok: false, mensaje: "Usuario no encontrado" };

  await usuario.update({ AUTH02_FECHABAJA: null });

  return { ok: true, mensaje: "Usuario reactivado correctamente" };
}

// ==========================================================
// CAMBIAR ROL
// ==========================================================

export async function cambiarRolUsuario(id, rolId) {
  const usuario = await Auth02Usuario.findByPk(id);
  if (!usuario) return { ok: false, mensaje: "Usuario no encontrado" };

  const rol = await Auth01Rol.findByPk(rolId);
  if (!rol)              return { ok: false, mensaje: "Rol no encontrado" };
  if (rol.AUTH01_FECHABAJA) return { ok: false, mensaje: "El rol indicado está inactivo" };

  await usuario.update({ RELA_AUTH01: rol.ID_AUTH01 });

  return {
    ok: true,
    mensaje: `Rol actualizado a "${rol.AUTH01_NOMBRE}" correctamente`,
    data: { usuario_id: usuario.ID_AUTH02, rol_id: rol.ID_AUTH01, rol: rol.AUTH01_NOMBRE },
  };
}
