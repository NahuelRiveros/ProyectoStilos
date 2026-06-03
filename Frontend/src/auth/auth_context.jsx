import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  authLogin,
  authLogout,
  authMe,
  authRegister,
} from "../api/auth_api";

import { authConfig } from "../config/auth_config";

// ==========================================================
// CONTEXT
// ==========================================================

const AuthContext = createContext(null);

// ==========================================================
// NORMALIZAR USUARIO
// ==========================================================

function normalizarUsuario(data) {
  if (!data) return null;
  return data.usuario ?? data.user ?? data ?? null;
}

// ==========================================================
// PROVIDER
// ==========================================================

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // TOKEN

  const guardarToken = useCallback((token) => {
    localStorage.setItem(authConfig.storageKey, token);
  }, []);

  const obtenerToken = useCallback(() => {
    return localStorage.getItem(authConfig.storageKey);
  }, []);

  const limpiarSesion = useCallback(() => {
    localStorage.removeItem(authConfig.storageKey);
    setUsuario(null);
  }, []);

  // CARGAR SESIÓN

  const cargarMe = useCallback(async () => {
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

  const login = useCallback(async (payload) => {
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
  }, [guardarToken, cargarMe, limpiarSesion]);

  // REGISTER

  const register = useCallback(
    (payload) => authRegister(payload),
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

  const actualizarUsuario = useCallback((nuevoUsuario) => {
    setUsuario((prev) => ({ ...(prev ?? {}), ...nuevoUsuario }));
  }, []);

  // VALUE

  const value = useMemo(
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
