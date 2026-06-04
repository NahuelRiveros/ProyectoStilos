import { NavLink, Outlet, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ChevronRight,
  AlertTriangle,
  Package,
  Tags,
  Boxes,
  Home,
  ShieldCheck,
} from "lucide-react";

import { getSuscripcion } from "../../api/admin_api";
import { adminConfig, brandConfig } from "../../config/app_config";

const NAV_ITEMS = [
  { module: "dashboard", to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { module: "products", to: "/admin/productos", label: "Productos", icon: Package },
  { module: "catalogs", to: "/admin/catalogos", label: "Catalogos", icon: Tags },
  { module: "stockAlerts", to: "/admin/stock-alertas", label: "Stock", icon: Boxes },
  { module: "home", to: "/admin/home", label: "Home", icon: Home },
  { module: "users", to: "/admin/usuarios", label: "Usuarios", icon: Users },
  { module: "subscription", to: "/admin/suscripcion", label: "Suscripcion", icon: CreditCard },
];

const NAV = NAV_ITEMS.filter((item) => adminConfig.modules[item.module]);
const ESTADOS_BLOQUEADOS = ["VENCIDO", "SIN_SUSCRIPCION"];

function SuscripcionBanner({ estado }) {
  if (!ESTADOS_BLOQUEADOS.includes(estado)) return null;

  const msg = estado === "SIN_SUSCRIPCION"
    ? "El sistema no tiene suscripcion activa. Las operaciones de escritura estan bloqueadas."
    : "La suscripcion ha vencido. Las operaciones de escritura estan bloqueadas.";

  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2 text-amber-800">
        <AlertTriangle size={15} className="shrink-0 text-amber-500" />
        <span className="font-medium">{msg}</span>
      </div>
      {adminConfig.modules.subscription && (
        <Link
          to="/admin/suscripcion"
          className="shrink-0 rounded-lg bg-accent px-3 py-1 text-xs font-bold text-accent-on transition hover:opacity-90"
        >
          Activar suscripcion
        </Link>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const { data: sus } = useQuery({
    queryKey: ["admin-suscripcion"],
    queryFn: async () => {
      const r = await getSuscripcion();
      return r.data?.data ?? null;
    },
    staleTime: 60_000,
  });

  const estadoSus = sus?.estado ?? null;

  return (
    <div className="flex min-h-[calc(100vh-60px)]">
      <aside
        className="hidden w-60 shrink-0 flex-col border-r border-admin-text/5 lg:flex"
        style={{ background: "linear-gradient(175deg, var(--color-admin-raised) 0%, var(--color-admin) 55%, var(--color-admin) 100%)" }}
      >
        <div className="px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/20">
              <ShieldCheck size={13} className="text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/80">
                Panel Admin
              </p>
              <p className="text-[9px] leading-tight text-admin-text-dim">{brandConfig.adminName}</p>
            </div>
          </div>
        </div>

        <div className="mx-4 mb-3 h-px bg-linear-to-r from-transparent via-admin-text/8 to-transparent" />

        <nav className="flex-1 space-y-0.5 px-3 pb-2">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "group relative flex items-center gap-3 rounded-xl border-l-2 px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-transparent text-admin-text-dim hover:bg-admin-text/5 hover:text-admin-text",
                ].join(" ")
              }
            >
              <Icon size={15} className="shrink-0 opacity-80" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={11} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-30" />
            </NavLink>
          ))}
        </nav>

        <div className="mx-4 h-px bg-linear-to-r from-transparent via-admin-text/5 to-transparent" />
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-admin-text-dim">{adminConfig.restrictedLabel}</p>
            <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-accent/70">
              ADM
            </span>
          </div>
        </div>
      </aside>

      <div className="fixed inset-x-0 top-[60px] z-30 flex gap-1 overflow-x-auto border-b border-admin-text/8 bg-admin px-3 py-2 lg:hidden">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-admin-text-dim hover:bg-admin-text/5 hover:text-admin-text",
              ].join(" ")
            }
          >
            <Icon size={13} />
            {label}
          </NavLink>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col bg-surface">
        <div className="h-10 lg:hidden" />
        <SuscripcionBanner estado={estadoSus} />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
