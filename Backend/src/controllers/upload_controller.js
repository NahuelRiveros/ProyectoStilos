import { subirImagen, eliminarImagen } from "../services/cloudinary_service.js";
import {
  createdResponse,
  okResponse,
  errorResponse,
  badRequestResponse,
} from "../utils/api_response.js";

// POST /api/upload/imagen
// Body: multipart/form-data con campo "imagen"
export async function subir(req, res) {
  try {
    if (!req.file) {
      return badRequestResponse(res, { mensaje: "No se recibió ninguna imagen" });
    }

    const result = await subirImagen(req.file.buffer);

    return createdResponse(res, {
      mensaje: "Imagen subida correctamente",
      data: {
        url:       result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error.message);
    return errorResponse(res, { mensaje: "Error al subir la imagen a Cloudinary" });
  }
}

// DELETE /api/upload/imagen
// Body: { public_id: "ecommerce/abc123" }
export async function eliminar(req, res) {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return badRequestResponse(res, { mensaje: "El campo public_id es requerido" });
    }

    await eliminarImagen(public_id);

    return okResponse(res, { mensaje: "Imagen eliminada correctamente" });
  } catch (error) {
    console.error("❌ Cloudinary delete error:", error.message);
    return errorResponse(res, { mensaje: "Error al eliminar la imagen de Cloudinary" });
  }
}
