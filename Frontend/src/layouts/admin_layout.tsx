import { useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  FileText,
  ChevronRight,
  AlertTriangle,
  LayoutPanelTop,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../auth/auth_context";
import { SessionGuard } from "../components/session_guard";

const NAV = [
  { to: "/admin",              label: "Dashboard",    icon: LayoutDashboard, exact: true  },
  { to: "/admin/home",         label: "Home",         icon: LayoutPanelTop,  exact: false },
  { to: "/admin/productos",    label: "Productos",    icon: Package,         exact: false },
  { to: "/admin/ordenes",      label: "Órdenes",      icon: ShoppingCart,    exact: false },
  { to: "/admin/catalogos",    label: "Catálogos",    icon: Tag,             exact: false },
  { to: "/admin/comprobantes", label: "Comprobantes", icon: FileText,        exact: false },
  { to: "/admin/stock",        label: "Stock bajo",   icon: AlertTriangle,   exact: false },
];

function SidebarNav({ onClose }: { onClose?: () => void }) {
  const { usuario } = useAuth();
  return (
    <>
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-xs font-black uppercase tracking-widest text-white/50">Panel admin</p>
        <p className="mt-0.5 text-sm font-bold text-white">Stilo&apos;s</p>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {NAV.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={onClose}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white",
              ].join(" ")
            }
          >
            <Icon size={16} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={13} className="opacity-30" />
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-xs text-white/40">
          {(usuario as { correo?: string; email?: string })?.correo
           ?? (usuario as { correo?: string; email?: string })?.email
           ?? "Admin"}
        </p>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const { usuario, isAuth, cargando } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  if (!isAuth) return <Navigate to="/login" replace />;
  if (usuario?.rol !== "Administrador") return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen bg-surface">

      {/* ── SIDEBAR desktop ─────────────────────────────────────── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-navy lg:flex">
        <SidebarNav />
      </aside>

      {/* ── DRAWER mobile ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-navy shadow-2xl">
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarNav onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header mobile */}
        <header className="flex items-center justify-between border-b border-line bg-navy px-4 py-3 lg:hidden">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Panel admin</p>
            <p className="text-sm font-bold text-white">Stilo&apos;s</p>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="min-w-0 flex-1">
          <SessionGuard />
          <Outlet />
        </main>
      </div>

    </div>
  );
}
