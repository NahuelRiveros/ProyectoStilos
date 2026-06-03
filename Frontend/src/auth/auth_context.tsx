import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  authLogin,
  authLogout,
  authMe,
  authRegister,
  type LoginPayload,
  type RegisterPayload,
  type AuthApiResponse,
} from "../api/auth_api";

import { authConfig } from "../config/auth_config";

// ==========================================================
// TYPES
// ==========================================================

export interface Usuario {
  nombre?: string;
  apellido?: string;
  correo?: string;
  email?: string;
  usuario_nombre?: string;
  rol?: string;
  rol_nombre?: string;
  perfil?: string;
  [key: string]: unknown;
}

type LoginResult = Omit<AuthApiResponse, "usuario"> & { usuario: Usuario | null };

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  isAuth: boolean;
  token: string | null;
  login: (payload: LoginPayload) => Promise<LoginResult>;
  logout: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<AuthApiResponse>;
  recargarUsuario: () => Promise<Usuario | null>;
  setUsuarioSesion: Dispatch<SetStateAction<Usuario | null>>;
  actualizarUsuario: (nuevoUsuario: Partial<Usuario>) => void;
  limpiarSesion: () => void;
}

// ==========================================================
// CONTEXT
// ==========================================================

const AuthContext = createContext<AuthContextValue | null>(null);

// ==========================================================
// NORMALIZAR USUARIO
// ==========================================================

function normalizarUsuario(data: AuthApiResponse | null): Usuario | null {
  if (!data) return null;
  return (data.usuario as Usuario) ?? (data.user as Usuario) ?? (data as Usuario) ?? null;
}

// ==========================================================
// PROVIDER
// ==========================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // TOKEN

  const guardarToken = useCallback((token: string) => {
    localStorage.setItem(authConfig.storageKey, token);
  }, []);

  const obtenerToken = useCallback((): string | null => {
    return localStorage.getItem(authConfig.storageKey);
  }, []);

  const limpiarSesion = useCallback(() => {
    localStorage.removeItem(authConfig.storageKey);
    setUsuario(null);
  }, []);

  // CARGAR SESIÓN

  const cargarMe = useCallback(async (): Promise<Usuario | null> => {
    try {
      const data = await authMe();
      const usuarioNormalizado = normalizarUsuario(data);
      setUsuario(usuarioNormalizado);
      return usuarioNormalizado;
    } catch {
      limpiarSesion();
      return null;
    } finally {
      setCargando(false);
    }
  }, [limpiarSesion]);

  // INIT

  useEffect(() => {
    const token = obtenerToken();
    if (token) {
      cargarMe();
    } else {
      setCargando(false);
    }
  }, [obtenerToken, cargarMe]);

  // LOGIN

  const login = useCallback(
    async (payload: LoginPayload): Promise<LoginResult> => {
      setCargando(true);
      try {
        const data = await authLogin(payload);
        const token = data.token;
        const usuarioLogin = normalizarUsuario(data);

        if (token) guardarToken(token);

        if (usuarioLogin) {
          setUsuario(usuarioLogin);
          return { ...data, usuario: usuarioLogin };
        }

        const usuarioActual = await cargarMe();
        return { ...data, usuario: usuarioActual };
      } catch (error) {
        limpiarSesion();
        throw error;
      } finally {
        setCargando(false);
      }
    },
    [guardarToken, cargarMe, limpiarSesion],
  );

  // REGISTER

  const register = useCallback(
    (payload: RegisterPayload): Promise<AuthApiResponse> => authRegister(payload),
    [],
  );

  // LOGOUT

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } catch {
      // aunque falle el backend, limpiamos la sesión local
    } finally {
      limpiarSesion();
    }
  }, [limpiarSesion]);

  // UPDATE USER

  const actualizarUsuario = useCallback((nuevoUsuario: Partial<Usuario>) => {
    setUsuario((prev) => ({ ...(prev ?? {}), ...nuevoUsuario }));
  }, []);

  // VALUE

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      cargando,
      isAuth: !!usuario,
      token: obtenerToken(),
      login,
      logout,
      register,
      recargarUsuario: cargarMe,
      setUsuarioSesion: setUsuario,
      actualizarUsuario,
      limpiarSesion,
    }),
    [usuario, cargando, obtenerToken, login, logout, register, cargarMe, actualizarUsuario, limpiarSesion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ==========================================================
// HOOK
// ==========================================================

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
