import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import {
  Users, UserCheck, UserX, CreditCard,
  ArrowRight, ShieldCheck, AlertTriangle, XCircle,
} from "lucide-react";
import { getUsuarios } from "../../api/usuarios_api";
import { getSuscripcion } from "../../api/admin_api";
import { useAuth } from "../../auth/auth_context";

// Colores de estado — semánticos, no de marca, se mantienen fijos
const STATUS_COLORS = {
  amber:   "bg-amber-50   text-amber-600   ring-1 ring-amber-200/40",
  emerald: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/40",
  rose:    "bg-rose-50    text-rose-600    ring-1 ring-rose-200/40",
  neutral: "bg-surface    text-muted       ring-1 ring-line",
};

function StatCard({ label, value, icon: Icon, color = "neutral" }) {
  return (
    <div className="admin-card">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${STATUS_COLORS[color]}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-black text-ink">{value ?? "—"}</p>
      <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
    </div>
  );
}

function SuscripcionCard({ data }) {
  if (!data) return null;

  const estado = data.estado ?? "SIN_DATOS";
  const config = {
    ACTIVO:          { icon: ShieldCheck,   cls: "admin-banner admin-banner-ok",      label: "Activa" },
    GRACIA:          { icon: AlertTriangle, cls: "admin-banner admin-banner-warning",  label: "En período de gracia" },
    VENCIDO:         { icon: XCircle,       cls: "admin-banner admin-banner-danger",   label: "Vencida" },
    SIN_SUSCRIPCION: { icon: XCircle,       cls: "admin-banner admin-banner-neutral",  label: "Sin suscripción" },
  }[estado] ?? { icon: AlertTriangle, cls: "admin-banner admin-banner-neutral", label: estado };

  const Icon = config.icon;

  return (
    <div className={config.cls}>
      <div className="flex items-center gap-3">
        <Icon size={18} className="shrink-0" />
        <div>
          <p className="text-sm font-bold">Suscripción: {config.label}</p>
          {data.fecha_fin && (
            <p className="mt-0.5 text-xs opacity-70">
              Vence: {new Date(data.fecha_fin).toLocaleDateString("es-AR")}
              {data.dias_restantes != null && ` · ${data.dias_restantes} días restantes`}
            </p>
          )}
        </div>
      </div>
      <NavLink to="/admin/suscripcion" className="btn btn-sm btn-outline shrink-0">
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
    <div className="admin-page">

      <div className="admin-page-header">
        <h1 className="admin-page-title">Panel de administración</h1>
        <p className="admin-page-desc">Gestión de usuarios, roles y estado del sistema.</p>
      </div>

      <div className="mb-6">
        <SuscripcionCard data={suscripcion} />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total usuarios" value={usuarios.length} icon={Users}      color="neutral" />
        <StatCard label="Activos"        value={activos}         icon={UserCheck}   color="emerald" />
        <StatCard label="Inactivos"      value={inactivos}       icon={UserX}       color="rose"    />
        <StatCard label="Tu nivel"       value={usuario?.nivel}  icon={ShieldCheck} color="amber"   />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { to: "/admin/usuarios",    label: "Gestionar usuarios",    desc: "Crear, editar, asignar roles y desactivar cuentas",  icon: Users,      color: "text-amber-500"   },
          { to: "/admin/suscripcion", label: "Gestionar suscripción", desc: "Ver estado, renovar y ajustar período de gracia",    icon: CreditCard, color: "text-emerald-500" },
        ].map(({ to, label, desc, icon: Icon, color }) => (
          <NavLink key={to} to={to} className="admin-link-card group">
            <Icon size={22} className={`shrink-0 ${color}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">{label}</p>
              <p className="text-xs text-muted">{desc}</p>
            </div>
            <ArrowRight size={14} className="shrink-0 text-muted/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-muted" />
          </NavLink>
        ))}
      </div>

    </div>
  );
}
