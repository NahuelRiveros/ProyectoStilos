import { NavLink, Outlet, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, Users, CreditCard, ChevronRight,
  AlertTriangle, Package, Tags, Boxes, Home, ShieldCheck, MessageCircle,
} from "lucide-react";

import { getSuscripcion } from "../../api/admin_api";
import { adminConfig, brandConfig } from "../../config/app_config";
import { useAuth } from "../../auth/auth_context";

const NAV_ITEMS = [
  { module: "dashboard",    to: "/admin",               label: "Dashboard",   icon: LayoutDashboard, end: true },
  { module: "products",     to: "/admin/productos",      label: "Productos",   icon: Package },
  { module: "catalogs",     to: "/admin/catalogos",      label: "Catalogos",   icon: Tags },
  { module: "stockAlerts",  to: "/admin/stock-alertas",  label: "Stock",       icon: Boxes },
  { module: "home",         to: "/admin/home",           label: "Home",        icon: Home },
  { module: "whatsapp",    to: "/admin/whatsapp",        label: "WhatsApp",    icon: MessageCircle },
  { module: "users",        to: "/admin/usuarios",       label: "Usuarios",    icon: Users },
  { module: "subscription", to: "/admin/suscripcion",    label: "Suscripcion", icon: CreditCard, soloSADM: true },
];
const ESTADOS_BLOQUEADOS = ["VENCIDO", "SIN_SUSCRIPCION"];

function useNavItems() {
  const { usuario } = useAuth();
  const esSADM = usuario?.roles_abr?.includes("SADM") ?? false;
  return NAV_ITEMS.filter(
    (item) => adminConfig.modules[item.module] && (!item.soloSADM || esSADM)
  );
}

function SuscripcionBanner({ estado, esSADM }) {
  if (!ESTADOS_BLOQUEADOS.includes(estado)) return null;

  const msg = estado === "SIN_SUSCRIPCION"
    ? "El sistema no tiene suscripcion activa. Las operaciones de escritura estan bloqueadas."
    : "La suscripcion ha vencido. Las operaciones de escritura estan bloqueadas.";

  return (
    <div className="admin-banner admin-banner-warning">
      <div className="flex items-center gap-2">
        <AlertTriangle size={15} className="shrink-0" />
        <span className="text-sm font-medium">{msg}</span>
      </div>
      {adminConfig.modules.subscription && esSADM && (
        <Link to="/admin/suscripcion" className="btn btn-accent btn-sm shrink-0">
          Activar suscripcion
        </Link>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const NAV = useNavItems();
  const { usuario } = useAuth();
  const { data: sus } = useQuery({
    queryKey: ["admin-suscripcion"],
    queryFn: async () => {
      const r = await getSuscripcion();
      return r.data?.data ?? null;
    },
    staleTime: 60_000,
  });

  return (
    <div className="flex min-h-[calc(100vh-60px)]">

      {/* ── Sidebar desktop ── */}
      <aside className="admin-sidebar">

        <div className="px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/20">
              <ShieldCheck size={13} className="text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/80">
                Panel Admin
              </p>
              <p className="text-[9px] leading-tight text-admin-text-dim">
                {brandConfig.adminName}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-sidebar-divider mb-3" />

        <nav className="flex-1 space-y-0.5 px-3 pb-2">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-nav-item${isActive ? " admin-nav-item-active" : ""}`
              }
            >
              <Icon size={15} className="shrink-0 opacity-80" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={11} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-30" />
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-divider" />
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-admin-text-dim">{adminConfig.restrictedLabel}</p>
            <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-accent/70">
              ADM
            </span>
          </div>
        </div>
      </aside>

      {/* ── Barra móvil ── */}
      <div className="admin-mobile-bar lg:hidden">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `admin-mobile-item${isActive ? " admin-mobile-item-active" : ""}`
            }
          >
            <Icon size={13} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* ── Contenido principal ── */}
      <div className="admin-content">
        <div className="h-10 lg:hidden" />
        <SuscripcionBanner estado={sus?.estado ?? null} esSADM={usuario?.roles_abr?.includes("SADM") ?? false} />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>

    </div>
  );
}
