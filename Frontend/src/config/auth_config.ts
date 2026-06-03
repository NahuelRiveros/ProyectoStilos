interface AuthConfig {
  storageKey: string;
  endpoints: {
    login: string;
    register: string;
    logout: string;
    me: string;
    forgotPassword: string;
    resetPassword: string;
  };
  loginCampos: {
    emailLabel: string;
    passwordLabel: string;
    botonLabel: string;
  };
}

export const authConfig: AuthConfig = {
  storageKey: "token",

  endpoints: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    me: "/auth/me",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },

  loginCampos: {
    emailLabel: "Email",
    passwordLabel: "Contraseña",
    botonLabel: "Ingresar",
  },
};
