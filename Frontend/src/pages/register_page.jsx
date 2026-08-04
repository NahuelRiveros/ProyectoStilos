import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../auth/auth_context";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registrarUsuario } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [errorGeneral, setErrorGeneral] = useState("");
  const [okMensaje,    setOkMensaje]    = useState("");
  const [loading,      setLoading]      = useState(false);
  const [showPass,     setShowPass]     = useState(false);
  const [showPassConf, setShowPassConf] = useState(false);

  async function onSubmit(data) {
    setErrorGeneral("");
    setOkMensaje("");
    setLoading(true);

    const payload = {
      nombre:    data.nombre?.trim(),
      apellido:  data.apellido?.trim(),
      documento: data.documento?.trim(),
      email:     data.email?.trim().toLowerCase(),
      password:  data.password,
    };

    try {
      const res = await registrarUsuario(payload);
      if (!res?.ok) {
        setErrorGeneral(res?.mensaje || "No se pudo completar el registro.");
        return;
      }
      setOkMensaje(res?.mensaje || "¡Registro exitoso! Redirigiendo…");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setErrorGeneral(
        err?.response?.data?.mensaje ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo completar el registro."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center bg-surface p-4">
      <div
        className="flex w-full max-w-240 overflow-hidden rounded-3xl"
        style={{ boxShadow: "var(--shadow-auth)" }}
      >
        {/* ── PANEL IZQUIERDO — marca ─────────────────────────── */}
        <div className="relative hidden select-none flex-col justify-between overflow-hidden bg-navy p-12 lg:flex lg:w-[36%]">
          {/* Watermark S */}
          <div
            className="pointer-events-none absolute -right-16 top-1/2 translate-y-[-52%] font-display italic font-light leading-none text-champagne-light/5"
            style={{ fontSize: "28rem", lineHeight: 1 }}
          >
            S
          </div>

          {/* Círculo decorativo */}
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full"
            style={{ background: "color-mix(in srgb, var(--color-champagne-light) 4%, transparent)" }}
          />

          {/* Contenido */}
          <div className="relative z-10">
            <div className="mb-10 flex items-center gap-2">
              <div className="h-px w-6 bg-champagne-light/25" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-champagne-light/45">
                Nueva cuenta
              </span>
            </div>

            <h1
              className="mb-5 font-display italic font-light leading-[0.88] text-champagne-light"
              style={{ fontSize: "4.5rem" }}
            >
              Stilo's
            </h1>

            <p className="text-sm leading-relaxed text-champagne-light/45">
              Creá tu cuenta y accedé a todo el catálogo de moda.
            </p>
          </div>

          {/* Pasos decorativos */}
          <div className="relative z-10 space-y-3">
            {["Completá tus datos", "Confirmá tu cuenta", "Explorá el catálogo"].map((paso, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-champagne-light/12 text-[10px] font-bold text-champagne-light/60">
                  {i + 1}
                </div>
                <span className="text-xs text-champagne-light/40">{paso}</span>
              </div>
            ))}
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
          <div className="mb-6 text-center lg:hidden">
            <span
              className="font-display italic font-light text-navy"
              style={{ fontSize: "3rem" }}
            >
              Stilo's
            </span>
          </div>

          <div className="mx-auto w-full max-w-140">
            <div className="mb-7">
              <h2 className="mb-1 text-[1.5rem] font-black tracking-tight text-ink">
                Crear cuenta
              </h2>
              <p className="text-sm text-muted">
                Completá la información para registrarte
              </p>
            </div>

            {errorGeneral && (
              <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {errorGeneral}
              </div>
            )}
            {okMensaje && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {okMensaje}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Nombre */}
                <div>
                  <label className="label-form">Nombre</label>
                  <input
                    type="text"
                    placeholder="Juan"
                    className="input-form"
                    {...register("nombre", {
                      required: "El nombre es obligatorio",
                      minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    })}
                  />
                  {errors.nombre && <p className="error-form">{errors.nombre.message}</p>}
                </div>

                {/* Apellido */}
                <div>
                  <label className="label-form">Apellido</label>
                  <input
                    type="text"
                    placeholder="Pérez"
                    className="input-form"
                    {...register("apellido", {
                      required: "El apellido es obligatorio",
                      minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    })}
                  />
                  {errors.apellido && <p className="error-form">{errors.apellido.message}</p>}
                </div>

                {/* Documento */}
                <div className="sm:col-span-2">
                  <label className="label-form">DNI</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="12345678"
                    className="input-form"
                    {...register("documento", {
                      required: "El documento es obligatorio",
                      minLength: { value: 6, message: "Mínimo 6 dígitos" },
                      maxLength: { value: 12, message: "Máximo 12 dígitos" },
                      pattern:   { value: /^[0-9]+$/, message: "Solo números" },
                    })}
                  />
                  {errors.documento && <p className="error-form">{errors.documento.message}</p>}
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
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
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                      className="input-form"
                      style={{ paddingRight: "2.75rem" }}
                      {...register("password", {
                        required:  "La contraseña es obligatoria",
                        minLength: { value: 6, message: "Mínimo 6 caracteres" },
                      })}
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

                {/* Confirmar contraseña */}
                <div>
                  <label className="label-form">Confirmar contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassConf ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repetí la contraseña"
                      className="input-form"
                      style={{ paddingRight: "2.75rem" }}
                      {...register("confirmar_password", {
                        required: "Confirmá tu contraseña",
                        validate: v =>
                          v === watch("password") || "Las contraseñas no coinciden",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassConf(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors"
                      tabIndex={-1}
                    >
                      {showPassConf ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmar_password && (
                    <p className="error-form">{errors.confirmar_password.message}</p>
                  )}
                </div>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-navy py-3 text-sm font-bold tracking-wide text-champagne-light transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-55"
              >
                {loading ? "Registrando…" : "Crear cuenta"}
              </button>

              {/* Link login */}
              <p className="mt-5 text-center text-sm text-muted">
                ¿Ya tenés cuenta?{" "}
                <Link to="/login" className="font-bold text-navy transition hover:underline">
                  Iniciá sesión
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
