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
      <div
        className="flex min-h-[calc(100vh-60px)] items-center justify-center p-4"
        style={{ background: "var(--color-surface)" }}
      >
        <div
          className="w-full max-w-[860px] flex rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 32px 80px rgba(28,36,56,0.16), 0 4px 16px rgba(28,36,56,0.08)" }}
        >
          {/* ── PANEL IZQUIERDO — marca ─────────────────────────── */}
          <div
            className="hidden md:flex md:w-[42%] relative flex-col justify-between p-12 overflow-hidden select-none"
            style={{ background: "#283149" }}
          >
            {/* Watermark S */}
            <div
              className="absolute -right-10 top-1/2 -translate-y-[55%] font-display italic font-light leading-none pointer-events-none"
              style={{ fontSize: "30rem", color: "rgba(243,230,217,0.045)", lineHeight: 1 }}
            >
              S
            </div>

            {/* Círculo decorativo inferior */}
            <div
              className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: "rgba(243,230,217,0.04)" }}
            />

            {/* Contenido superior */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-10">
                <div className="h-px w-6" style={{ background: "rgba(243,230,217,0.25)" }} />
                <span
                  className="text-[10px] tracking-[0.28em] uppercase"
                  style={{ color: "rgba(243,230,217,0.45)" }}
                >
                  Bienvenido
                </span>
              </div>

              <h1
                className="font-display italic font-light leading-[0.88] mb-5"
                style={{ fontSize: "5rem", color: "#F3E6D9" }}
              >
                Stilo's
              </h1>

              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(243,230,217,0.45)" }}
              >
                Tu espacio de moda y estilo.<br />
                Iniciá sesión para continuar.
              </p>
            </div>

            {/* Pie */}
            <div className="relative z-10">
              <div className="h-px mb-5" style={{ background: "rgba(243,230,217,0.1)" }} />
              <p
                className="text-[10px] tracking-[0.2em] uppercase"
                style={{ color: "rgba(243,230,217,0.25)" }}
              >
                Moda · Estilo · Tendencias
              </p>
            </div>
          </div>

          {/* ── PANEL DERECHO — formulario ─────────────────────── */}
          <div
            className="flex-1 flex flex-col justify-center px-8 py-10 md:px-12"
            style={{ background: "#ffffff" }}
          >
            {/* Logo mobile */}
            <div className="md:hidden mb-8 text-center">
              <span
                className="font-display italic font-light"
                style={{ fontSize: "3.5rem", color: "#283149" }}
              >
                Stilo's
              </span>
            </div>

            <div className="max-w-[340px] mx-auto w-full">
              <div className="mb-8">
                <h2
                  className="text-[1.625rem] font-black tracking-tight mb-1"
                  style={{ color: "#1C2438" }}
                >
                  Iniciá sesión
                </h2>
                <p className="text-sm" style={{ color: "#8A95A8" }}>
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
                  {errors.email && (
                    <p className="error-form">{errors.email.message}</p>
                  )}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "var(--color-muted)" }}
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="error-form">{errors.password.message}</p>
                  )}
                </div>

                {/* Error general */}
                {errorGeneral && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {errorGeneral}
                  </div>
                )}

                {/* Olvidé contraseña */}
                <div className="flex justify-end -mt-1">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold transition hover:underline"
                    style={{ color: "#8A95A8" }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Botón */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-55 mt-1"
                  style={{ background: "#283149", color: "#F3E6D9" }}
                >
                  {loading ? "Ingresando…" : "Iniciar sesión"}
                </button>

                {/* Registro */}
                <p className="text-center text-sm pt-1" style={{ color: "#8A95A8" }}>
                  ¿No tenés cuenta?{" "}
                  <Link
                    to="/register"
                    className="font-bold transition hover:underline"
                    style={{ color: "#283149" }}
                  >
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
