import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/auth_context";

/**
 * Wraps a route requiring authentication and optionally a minimum level or specific roles.
 * - roles: ["ADM"] → at least one of those abbreviations must be in usuario.roles_abr
 * - nivel: 50      → usuario.nivel must be >= 50
 */
export default function ProtectedRoute({ children, roles = [], nivel = null }) {
  const { isAuth, usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  if (!isAuth) return <Navigate to="/login" replace />;

  if (roles.length > 0 && !roles.some((r) => usuario?.roles_abr?.includes(r))) {
    return <Navigate to="/" replace />;
  }

  if (nivel !== null && (usuario?.nivel ?? 0) < nivel) {
    return <Navigate to="/" replace />;
  }

  return children;
}
