import { NavLink } from "react-router-dom";
import {
  Users, FileText, BarChart3, Shield,
  Settings, ArrowRight, HelpCircle,
} from "lucide-react";
import { useAuth } from "../auth/auth_context";

const MODULOS_USR = [
  { icon: Users,    label: "Visitantes",  desc: "Registro y seguimiento",          to: "/visitantes",         color: "indigo" },
  { icon: FileText, label: "Notas",       desc: "Gestión documental",               to: "/notas",              color: "violet" },
  { icon: BarChart3,label: "Reportes",    desc: "Informes y estadísticas",          to: "/visitantes/reporte", color: "blue"   },
  { icon: HelpCircle,label: "Guías",      desc: "Documentación y ayuda",            to: "/guias",              color: "slate"  },
];

const MODULOS_ADM = [
  { icon: Shield,   label: "Usuarios",    desc: "Gestión de cuentas y roles",       to: "/admin/usuarios",     color: "amber"  },
  { icon: Settings, label: "Suscripción", desc: "Estado y renovación del sistema",  to: "/admin/suscripcion",  color: "emerald"},
];

const COLOR_MAP = {
  indigo:  { icon: "bg-indigo-50 text-indigo-600",  ring: "hover:ring-indigo-200/60" },
  violet:  { icon: "bg-violet-50 text-violet-600",  ring: "hover:ring-violet-200/60" },
  blue:    { icon: "bg-blue-50 text-blue-600",      ring: "hover:ring-blue-200/60"   },
  slate:   { icon: "bg-slate-100 text-slate-600",   ring: "hover:ring-slate-200/60"  },
  amber:   { icon: "bg-amber-50 text-amber-600",    ring: "hover:ring-amber-200/60"  },
  emerald: { icon: "bg-emerald-50 text-emerald-600",ring: "hover:ring-emerald-200/60"},
};

function ModuloCard({ icon: Icon, label, desc, to, color }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.slate;
  return (
    <NavLink
      to={to}
      className={[
        "group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 ring-1 ring-transparent",
        "hover:-translate-y-0.5 hover:shadow-md",
        c.ring,
      ].join(" ")}
    >
      <div className={["flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", c.icon].join(" ")}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <ArrowRight size={14} className="shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500" />
    </NavLink>
  );
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.roles_abr?.includes("ADM");

  const nombre = usuario?.nombre ?? usuario?.username ?? "Usuario";
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">{saludo},</p>
        <h1 className="mt-0.5 text-2xl font-black tracking-tight text-slate-900">
          {nombre}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {usuario?.roles?.map((r) => (
            <span key={r} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Módulos principales */}
      <section className="mb-8">
        <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
          Módulos del sistema
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODULOS_USR.map((m) => <ModuloCard key={m.to} {...m} />)}
        </div>
      </section>

      {/* Panel admin */}
      {isAdmin && (
        <section>
          <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-amber-500">
            Administración
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MODULOS_ADM.map((m) => <ModuloCard key={m.to} {...m} />)}
          </div>
        </section>
      )}
    </div>
  );
}
