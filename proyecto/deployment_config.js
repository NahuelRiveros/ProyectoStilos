// Direcciones públicas de esta instalación. No incluir secretos.
export const deploymentConfig = {
  nombre: "Stilos",
  // [COMPLETAR] las dos URLs (tienen que ser válidas: el build las usa si falta VITE_API_URL).
  backendUrl: "https://completar.onrender.com",
  frontendUrl: "https://stilos.vercel.app",
  // Carpeta de este proyecto en Cloudinary (una cuenta puede tener varios proyectos).
  carpetaCloudinary: "stilos",
  // Backends de proyectos anteriores: el build falla si VITE_API_URL todavía apunta a uno.
  backendsAnteriores: [],
};
