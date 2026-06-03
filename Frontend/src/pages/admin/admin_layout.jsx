import { NavLink, Outlet, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Users, CreditCard, ChevronRight, AlertTriangle } from "lucide-react";
import { getSuscripcion } from "../../api/admin_api";

const NAV = [
  { to: "/admin",            label: "Dashboard",   icon: LayoutDashboard, end: true },
  { to: "/admin/usuarios",   label: "Usuarios",    icon: Users },
  { to: "/admin/suscripcion",label: "Suscripción", icon: CreditCard },
];

const ESTADOS_BLOQUEADOS = ["VENCIDO", "SIN_SUSCRIPCION"];

function SuscripcionBanner({ estado }) {
  if (!ESTADOS_BLOQUEADOS.includes(estado)) return null;

  const msg = estado === "SIN_SUSCRIPCION"
    ? "El sistema no tiene suscripción activa. Las operaciones de escritura están bloqueadas."
    : "La suscripción ha vencido. Las operaciones de escritura están bloqueadas.";

  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2 text-amber-800">
        <AlertTriangle size={15} className="shrink-0 text-amber-500" />
        <span className="font-medium">{msg}</span>
      </div>
      <Link
        to="/admin/suscripcion"
        className="shrink-0 rounded-lg bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950 transition hover:bg-amber-300"
      >
        Activar suscripción →
      </Link>
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

      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/6 bg-[#060d1f] lg:flex">
        <div className="px-4 py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-400/60">
            Panel de administración
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 px-2">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-amber-400/10 text-amber-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                ].join(" ")
              }
            >
              <Icon size={15} className="shrink-0 opacity-75" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={11} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-40" />
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/6 px-4 py-4">
          <p className="text-[10px] text-slate-600">Área restringida · Solo ADM</p>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="fixed inset-x-0 top-[60px] z-30 flex gap-1 border-b border-white/6 bg-[#060d1f] px-4 py-2 lg:hidden">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                isActive ? "bg-amber-400/10 text-amber-400" : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
              ].join(" ")
            }
          >
            <Icon size={13} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
        <div className="h-10 lg:hidden" />
        <SuscripcionBanner estado={estadoSus} />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
