import {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  reactivarUsuario,
  cambiarRolUsuario,
} from "../services/usuarios_service.js";

export async function crearUsuarioController(req, res) {
  try {
    const result = await crearUsuario(req.body);

    if (!result.ok) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("crearUsuarioController:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al crear usuario",
    });
  }
}

export async function listarUsuariosController(req, res) {
  try {
    const result = await listarUsuarios(req.user);
    return res.json({ ok: true, data: result });
  } catch (error) {
    console.error("listarUsuariosController:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al listar usuarios",
    });
  }
}

export async function obtenerUsuarioController(req, res) {
  try {
    const { id } = req.params;

    const usuario = await obtenerUsuario(id, req.user);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        mensaje: "Usuario no encontrado",
      });
    }

    return res.json({
      ok: true,
      data: usuario,
    });
  } catch (error) {
    console.error("obtenerUsuarioController:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener usuario",
    });
  }
}

export async function actualizarUsuarioController(req, res) {
  try {
    const { id } = req.params;

    const result = await actualizarUsuario(id, req.body, req.user);

    if (!result.ok) {
      return res.status(403).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("actualizarUsuarioController:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al actualizar usuario",
    });
  }
}

export async function eliminarUsuarioController(req, res) {
  try {
    const { id } = req.params;

    const result = await eliminarUsuario(id, req.user);

    if (!result.ok) {
      return res.status(403).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("eliminarUsuarioController:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al desactivar usuario",
    });
  }
}

export async function reactivarUsuarioController(req, res) {
  try {
    const { id } = req.params;

    const result = await reactivarUsuario(id);

    if (!result.ok) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("reactivarUsuarioController:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al reactivar usuario",
    });
  }
}

export async function cambiarRolController(req, res) {
  try {
    const { id } = req.params;
    const { rol_id } = req.body ?? {};

    if (!rol_id) {
      return res.status(400).json({
        ok: false,
        mensaje: "El campo rol_id es requerido",
      });
    }

    const result = await cambiarRolUsuario(id, rol_id);

    if (!result.ok) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("cambiarRolController:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al cambiar el rol del usuario",
    });
  }
}