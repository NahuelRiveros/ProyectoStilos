export const authConfig = {
  // [AUTH] Nombre de la clave en localStorage donde se persiste el token de sesion
  storageKey: "token",

  // [AUTH / API] Endpoints del backend de autenticacion
  endpoints: {
    login:          "/auth/login",
    register:       "/auth/register",
    logout:         "/auth/logout",
    me:             "/auth/me",              // Valida el token y devuelve el usuario actual
    forgotPassword: "/auth/forgot-password",
    resetPassword:  "/auth/reset-password",
  },

  // [LOGIN PAGE] Labels del formulario de inicio de sesion
  loginCampos: {
    emailLabel:    "Email",
    passwordLabel: "Contraseña",
    botonLabel:    "Ingresar",
  },
};
