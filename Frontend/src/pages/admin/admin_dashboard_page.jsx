import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import {
  Users, UserCheck, UserX, CreditCard,
  ArrowRight, ShieldCheck, AlertTriangle, XCircle,
} from "lucide-react";
import { getUsuarios } from "../../api/usuarios_api";
import { getSuscripcion } from "../../api/admin_api";
import { useAuth } from "../../auth/auth_context";

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    amber:   "bg-amber-50 text-amber-600 ring-amber-200/40",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-200/40",
    rose:    "bg-rose-50 text-rose-600 ring-rose-200/40",
    slate:   "bg-slate-100 text-slate-600 ring-slate-200/40",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${colors[color] ?? colors.slate}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-black text-slate-900">{value ?? "—"}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

function SuscripcionBanner({ data }) {
  if (!data) return null;

  const estado = data.estado ?? "SIN_DATOS";
  const config = {
    ACTIVO:          { icon: ShieldCheck,   bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", label: "Activa" },
    GRACIA:          { icon: AlertTriangle, bg: "bg-amber-50 border-amber-200",     text: "text-amber-700",   label: "En período de gracia" },
    VENCIDO:         { icon: XCircle,       bg: "bg-rose-50 border-rose-200",       text: "text-rose-700",    label: "Vencida" },
    SIN_SUSCRIPCION: { icon: XCircle,       bg: "bg-slate-50 border-slate-200",     text: "text-slate-700",   label: "Sin suscripción" },
  }[estado] ?? { icon: AlertTriangle, bg: "bg-slate-50 border-slate-200", text: "text-slate-700", label: estado };

  const Icon = config.icon;

  return (
    <div className={`flex items-center justify-between rounded-2xl border p-4 ${config.bg}`}>
      <div className="flex items-center gap-3">
        <Icon size={18} className={config.text} />
        <div>
          <p className={`text-sm font-bold ${config.text}`}>Suscripción: {config.label}</p>
          {data.fecha_fin && (
            <p className="text-xs text-slate-500">
              Vence: {new Date(data.fecha_fin).toLocaleDateString("es-AR")}
              {data.dias_restantes != null && ` · ${data.dias_restantes} días restantes`}
            </p>
          )}
        </div>
      </div>
      <NavLink
        to="/admin/suscripcion"
        className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
      >
        Gestionar <ArrowRight size={11} />
      </NavLink>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { usuario } = useAuth();

  const { data: usuarios = [] } = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: async () => {
      const r = await getUsuarios();
      return r.data?.data ?? [];
    },
  });

  const { data: suscripcion } = useQuery({
    queryKey: ["admin-suscripcion"],
    queryFn: async () => {
      const r = await getSuscripcion();
      return r.data?.data ?? null;
    },
  });

  const activos   = usuarios.filter((u) => !u.AUTH02_FECHABAJA).length;
  const inactivos = usuarios.filter((u) =>  u.AUTH02_FECHABAJA).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

      <div className="mb-6">
        <h1 className="text-xl font-black text-slate-900">Panel de administración</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Gestión de usuarios, roles y estado del sistema.
        </p>
      </div>

      {/* Suscripcion banner */}
      <div className="mb-6">
        <SuscripcionBanner data={suscripcion} />
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total usuarios"   value={usuarios.length} icon={Users}     color="slate"   />
        <StatCard label="Activos"          value={activos}         icon={UserCheck}  color="emerald" />
        <StatCard label="Inactivos"        value={inactivos}       icon={UserX}      color="rose"    />
        <StatCard label="Tu nivel"         value={usuario?.nivel}  icon={ShieldCheck}color="amber"   />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { to: "/admin/usuarios",   label: "Gestionar usuarios",   desc: "Crear, editar, asignar roles y desactivar cuentas", icon: Users,      color: "text-amber-500" },
          { to: "/admin/suscripcion",label: "Gestionar suscripción",desc: "Ver estado, renovar y ajustar período de gracia",   icon: CreditCard, color: "text-emerald-500" },
        ].map(({ to, label, desc, icon: Icon, color }) => (
          <NavLink
            key={to}
            to={to}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <Icon size={22} className={`shrink-0 ${color}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <ArrowRight size={14} className="shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500" />
          </NavLink>
        ))}
      </div>
    </div>
  );
}
