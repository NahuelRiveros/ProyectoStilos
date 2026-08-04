import { createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout    from "../layouts/app_layout";
import AdminLayout  from "../pages/admin/admin_layout";
import ProtectedRoute from "./protected_route";
import { adminConfig } from "../config/app_config";
import { PUBLIC_ROUTES, AUTH_ROUTES, ADMIN_ROUTES } from "./routes_config";

// Nivel base que exige AdminLayout — no repetir ProtectedRoute para rutas iguales o menores
const ADMIN_NIVEL_BASE = 50;

function buildRoute({ index, path, element, nivelMin, soloSADM }) {
  let el = element;
  if (soloSADM) {
    el = <ProtectedRoute roles={["SADM"]}>{element}</ProtectedRoute>;
  } else if (nivelMin && nivelMin > ADMIN_NIVEL_BASE) {
    el = <ProtectedRoute nivel={nivelMin}>{element}</ProtectedRoute>;
  }
  return index ? { index: true, element: el } : { path, element: el };
}

function buildAdminChildren() {
  return ADMIN_ROUTES.flatMap((r) => {
    if (!adminConfig.modules[r.module]) return [];
    const routes = [buildRoute(r)];
    if (r.extra) routes.push(...r.extra.map(buildRoute));
    return routes;
  });
}

function buildAuthChildren() {
  return AUTH_ROUTES.map(({ path, element, enabled, fallback }) => ({
    path,
    element: (enabled?.() ?? true)
      ? <ProtectedRoute>{element}</ProtectedRoute>
      : <Navigate to={fallback ?? "/"} replace />,
  }));
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      ...PUBLIC_ROUTES,
      ...buildAuthChildren(),
      ...(adminConfig.enabled ? [{
        path:     "admin",
        element:  <ProtectedRoute nivel={ADMIN_NIVEL_BASE}><AdminLayout /></ProtectedRoute>,
        children: buildAdminChildren(),
      }] : []),
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
