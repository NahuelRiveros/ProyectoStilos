import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../auth/auth_context";
import GlobalModal from "../components/ui/global_modal";

export default function LoginPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const [errorGeneral, setErrorGeneral] = useState("");
  const [loading,      setLoading]      = useState(false);
  const [showWelcome,  setShowWelcome]  = useState(false);
  const [userWelcome,  setUserWelcome]  = useState(null);
  const [showPass,     setShowPass]     = useState(false);

  async function onSubmit(data) {
    setErrorGeneral("");
    setLoading(true);
    try {
      const res = await login({ email: data.email, password: data.password });
      setUserWelcome(res?.usuario ?? null);
      setShowWelcome(true);
    } catch (err) {
      setErrorGeneral(
        err?.response?.data?.mensaje ||
        err?.response?.data?.message ||
        "No se pudo iniciar sesión. Verificá tus credenciales."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex min-h-[calc(100vh-60px)] items-center justify-center bg-surface p-4">
        <div
          className="flex w-full max-w-215 overflow-hidden rounded-3xl"
          style={{ boxShadow: "var(--shadow-auth)" }}
        >
          {/* ── PANEL IZQUIERDO — marca ─────────────────────────── */}
          <div className="relative hidden select-none flex-col justify-between overflow-hidden bg-navy p-12 md:flex md:w-[42%]">
            {/* Watermark S */}
            <div
              className="pointer-events-none absolute -right-10 top-1/2 translate-y-[-55%] font-display italic font-light leading-none text-champagne-light/5"
              style={{ fontSize: "30rem", lineHeight: 1 }}
            >
              S
            </div>

            {/* Círculo decorativo inferior */}
            <div
              className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full"
              style={{ background: "color-mix(in srgb, var(--color-champagne-light) 4%, transparent)" }}
            />

            {/* Contenido superior */}
            <div className="relative z-10">
              <div className="mb-10 flex items-center gap-2">
                <div className="h-px w-6 bg-champagne-light/25" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-champagne-light/45">
                  Bienvenido
                </span>
              </div>

              <h1 className="mb-5 font-display italic font-light leading-[0.88] text-champagne-light" style={{ fontSize: "5rem" }}>
                Stilo's
              </h1>

              <p className="text-sm leading-relaxed text-champagne-light/45">
                Tu espacio de moda y estilo.<br />
                Iniciá sesión para continuar.
              </p>
            </div>

            {/* Pie */}
            <div className="relative z-10">
              <div className="mb-5 h-px bg-champagne-light/10" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-champagne-light/25">
                Moda · Estilo · Tendencias
              </p>
            </div>
          </div>

          {/* ── PANEL DERECHO — formulario ─────────────────────── */}
          <div className="flex flex-1 flex-col justify-center bg-card px-8 py-10 md:px-12">
            {/* Logo mobile */}
            <div className="mb-8 text-center md:hidden">
              <span className="font-display italic font-light text-navy" style={{ fontSize: "3.5rem" }}>
                Stilo's
              </span>
            </div>

            <div className="mx-auto w-full max-w-85">
              <div className="mb-8">
                <h2 className="mb-1 text-[1.625rem] font-black tracking-tight text-ink">
                  Iniciá sesión
                </h2>
                <p className="text-sm text-muted">
                  Ingresá tus credenciales para acceder
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="label-form">Email</label>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    className="input-form"
                    {...register("email", { required: "El email es obligatorio" })}
                  />
                  {errors.email && <p className="error-form">{errors.email.message}</p>}
                </div>

                {/* Contraseña */}
                <div>
                  <label className="label-form">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Tu contraseña"
                      className="input-form"
                      style={{ paddingRight: "2.75rem" }}
                      {...register("password", { required: "La contraseña es obligatoria" })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="error-form">{errors.password.message}</p>}
                </div>

                {/* Error general */}
                {errorGeneral && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {errorGeneral}
                  </div>
                )}

                {/* Olvidé contraseña */}
                <div className="-mt-1 flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-muted transition hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Botón */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full rounded-xl bg-navy py-3 text-sm font-bold tracking-wide text-champagne-light transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-55"
                >
                  {loading ? "Ingresando…" : "Iniciar sesión"}
                </button>

                {/* Registro */}
                <p className="pt-1 text-center text-sm text-muted">
                  ¿No tenés cuenta?{" "}
                  <Link to="/register" className="font-bold text-navy transition hover:underline">
                    Registrate
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showWelcome && (
        <GlobalModal
          type="success"
          title="Acceso autorizado"
          message="Sesión iniciada correctamente."
          user={userWelcome ?? undefined}
          confirmLabel="Continuar"
          onFinish={() => {
            setShowWelcome(false);
            const roles = userWelcome?.roles_abr ?? [];
            const dest  = (roles.includes("ADM") || roles.includes("SADM")) ? "/admin" : "/";
            navigate(dest, { replace: true });
          }}
          delayMs={4000}
        />
      )}
    </>
  );
}
