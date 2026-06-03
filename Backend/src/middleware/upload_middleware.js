import multer from "multer";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const LIMITE_BYTES     = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error("Solo se permiten imágenes JPG, PNG o WEBP"), {
        code: "TIPO_NO_PERMITIDO",
      }),
      false
    );
  }
}

// Para subir una sola imagen (campo "imagen")
export const uploadImagen = multer({
  storage,
  fileFilter,
  limits: { fileSize: LIMITE_BYTES },
}).single("imagen");

// Para subir varias imágenes a la vez (campo "imagenes", máx 10)
export const uploadImagenes = multer({
  storage,
  fileFilter,
  limits: { fileSize: LIMITE_BYTES },
}).array("imagenes", 10);
