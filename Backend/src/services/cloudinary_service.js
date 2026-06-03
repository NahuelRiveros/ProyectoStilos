import { v2 as cloudinary } from "cloudinary";
import { env } from "../configuracion_servidor/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key:    env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure:     true,
});

/**
 * Sube un buffer de imagen a Cloudinary en la carpeta "ecommerce".
 * @param {Buffer} buffer - Buffer del archivo recibido por multer.
 * @param {object} opciones - Opciones adicionales para Cloudinary (opcional).
 * @returns {Promise<import("cloudinary").UploadApiResponse>}
 */
export function subirImagen(buffer, opciones = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:        "ecommerce",
        resource_type: "image",
        // Optimización automática: convierte a WebP y ajusta calidad
        transformation: [{ quality: "auto", fetch_format: "auto" }],
        ...opciones,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Elimina una imagen de Cloudinary por su public_id.
 * @param {string} publicId - El public_id devuelto al subir la imagen.
 */
export function eliminarImagen(publicId) {
  return cloudinary.uploader.destroy(publicId);
}
