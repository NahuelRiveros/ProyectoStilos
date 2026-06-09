// AUTENTICACIÓN
// Configuración del sistema de login y sesión.
// Raramente necesita cambios entre proyectos — solo si se renombran los endpoints del backend.

export const authConfig = {
  // Clave en localStorage donde se guarda el token de sesión del usuario
  storageKey: "token",

  // Rutas del backend de autenticación
  endpoints: {
    login:          "/auth/login",
    register:       "/auth/register",
    logout:         "/auth/logout",
    me:             "/auth/me",
    forgotPassword: "/auth/forgot-password",
    resetPassword:  "/auth/reset-password",
  },

  // Textos del formulario de inicio de sesión
  loginCampos: {
    emailLabel:    "Email",
    passwordLabel: "Contraseña",
    botonLabel:    "Ingresar",
  },
};
