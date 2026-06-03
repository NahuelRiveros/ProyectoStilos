export const authConfig = {
  storageKey: "token",

  endpoints: {
    login:         "/auth/login",
    register:      "/auth/register",
    logout:        "/auth/logout",
    me:            "/auth/me",
    forgotPassword:"/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },

  loginCampos: {
    emailLabel:    "Email",
    passwordLabel: "Contraseña",
    botonLabel:    "Ingresar",
  },
};
