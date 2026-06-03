import { NavLink } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  LogIn,
  Users,
  FileText,
  BarChart3,
  Shield,
  Lock,
  Globe2,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../auth/auth_context";

// ─── Configuración del proyecto ───────────────────────────────────────────────
// Editá este objeto para adaptar la landing a cualquier proyecto sin tocar el JSX

const PAGE = {
  badge: "Base Proyecto",
  titulo: "Base para",
  acento: "Proyectos Futuros",
  descripcion:
    "Arquitectura modular y escalable lista para adaptar a cualquier dominio. Autenticación, control de roles, navegación y componentes de UI listos para usar.",

  stats: [
    { valor: "100%",  label: "JavaScript puro" },
    { valor: "React", label: "19 + Vite" },
    { valor: "JWT",   label: "Auth segura" },
    { valor: "∞",     label: "Escalabilidad" },
  ],

  modulos: [
    { icon: Users,    titulo: "Módulo A",        descripcion: "Plantilla de listado con filtros, paginación y formularios de alta/baja/modificación.",  to: "/visitantes",         color: "indigo" },
    { icon: FileText, titulo: "Módulo B",        descripcion: "Plantilla de gestión documental con flujo de estados y seguimiento de registros.",        to: "/notas",              color: "violet" },
    { icon: BarChart3,titulo: "Reportes",        descripcion: "Panel de reportes reutilizable con datos dinámicos y exportación.",                        to: "/visitantes/reporte", color: "blue"   },
    { icon: Shield,   titulo: "Administración",  descripcion: "Control de usuarios, roles y configuración del sistema base.",                             to: "/test",               color: "slate"  },
  ],

  caracteristicas: [
    { icon: Lock,        titulo: "Control de accesos",    texto: "Roles y permisos configurables por ruta y componente." },
    { icon: Globe2,      titulo: "Arquitectura limpia",   texto: "Separación clara entre UI, lógica de negocio y capa de datos." },
    { icon: Zap,         titulo: "Alto rendimiento",      texto: "Vite + React 19 para tiempos de carga mínimos y DX óptima." },
    { icon: CheckCircle2,titulo: "Extensible por diseño", texto: "Agrega módulos, rutas y entidades sin romper lo existente." },
  ],
};

const COLORES = {
  indigo: { icono: "bg-indigo-100 text-indigo-600", borde: "hover:border-indigo-200", sombra: "hover:shadow-indigo-500/10", flecha: "text-indigo-500", glow: "bg-indigo-500/8" },
  violet: { icono: "bg-violet-100 text-violet-600", borde: "hover:border-violet-200", sombra: "hover:shadow-violet-500/10", flecha: "text-violet-500", glow: "bg-violet-500/8" },
  blue:   { icono: "bg-blue-100 text-blue-600",     borde: "hover:border-blue-200",   sombra: "hover:shadow-blue-500/10",   flecha: "text-blue-500",   glow: "bg-blue-500/8"   },
  slate:  { icono: "bg-slate-100 text-slate-600",   borde: "hover:border-slate-300",  sombra: "hover:shadow-slate-500/8",   flecha: "text-slate-500",  glow: "bg-slate-500/5"  },
};

export default function HomePage() {
  const { usuario } = useAuth();

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(99,102,241,0.055)_1px,transparent_1px)] bg-size-[28px_28px]" />
          <div className="absolute -right-32 -top-32 h-112 w-md rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="absolute -left-48 top-1/2 h-80 w-80 rounded-full bg-violet-400/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-600 shadow-sm">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
              </span>
              {PAGE.badge}
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {PAGE.titulo}{" "}
              <span className="block bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {PAGE.acento}
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
              {PAGE.descripcion}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {usuario ? (
                <NavLink to="/visitantes" className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700">
                  Ir al sistema <ArrowRight size={16} />
                </NavLink>
              ) : (
                <NavLink to="/login" className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700">
                  <LogIn size={16} /> Iniciar sesión
                </NavLink>
              )}

              <a href="#modulos" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                Ver módulos <ChevronRight size={16} className="text-slate-400" />
              </a>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 lg:mt-0">
            {PAGE.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1.5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
                <span className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{stat.valor}</span>
                <span className="text-sm font-medium leading-5 text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="modulos" className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-indigo-600">Acceso rápido</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Módulos del sistema</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">Accedé directamente a las secciones principales desde aquí.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PAGE.modulos.map((mod) => {
              const Icon = mod.icon;
              const c = COLORES[mod.color] ?? COLORES.slate;
              return (
                <NavLink key={mod.to} to={mod.to} className={["group flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg", c.borde, c.sombra].join(" ")}>
                  <div className="relative w-fit">
                    <div className={["absolute inset-0 rounded-2xl blur-xl", c.glow].join(" ")} />
                    <div className={["relative flex h-12 w-12 items-center justify-center rounded-2xl", c.icono].join(" ")}><Icon size={22} /></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-black text-slate-900">{mod.titulo}</h3>
                    <p className="mt-1.5 text-sm leading-5 text-slate-500">{mod.descripcion}</p>
                  </div>
                  <div className={["flex items-center gap-1.5 text-xs font-bold", c.flecha].join(" ")}>
                    Ir al módulo <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-indigo-600">Por qué usarlo</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Diseñado para escalar</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">Fundamentos sólidos que aceleran el desarrollo de cualquier proyecto web.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PAGE.caracteristicas.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.titulo} className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-6 transition-shadow duration-200 hover:shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600"><Icon size={20} /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{feat.titulo}</h3>
                    <p className="mt-2 text-sm leading-5 text-slate-500">{feat.texto}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {!usuario && (
        <section className="relative overflow-hidden py-16 sm:py-20">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-600 to-violet-700" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[24px_24px]" />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">¿Listo para comenzar?</h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-indigo-100">Ingresá con tus credenciales y accedé a todas las funcionalidades del sistema.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <NavLink to="/login" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-indigo-700 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
                <LogIn size={16} /> Iniciar sesión
              </NavLink>
              <a href="#modulos" className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20">
                Explorar módulos <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
