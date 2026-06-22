import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../auth/auth_context";
import { getEstadosCiviles } from "../api/estado_civil_api.js";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registrarUsuario } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [errorGeneral,  setErrorGeneral]  = useState("");
  const [okMensaje,     setOkMensaje]     = useState("");
  const [loading,       setLoading]       = useState(false);
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [showPass,      setShowPass]      = useState(false);
  const [showPassConf,  setShowPassConf]  = useState(false);

  useEffect(() => {
    getEstadosCiviles()
      .then(res => setEstadosCiviles(res.data || []))
      .catch(() => {});
  }, []);

  async function onSubmit(data) {
    setErrorGeneral("");
    setOkMensaje("");
    setLoading(true);

    const payload = {
      nombre:          data.nombre?.trim(),
      apellido:        data.apellido?.trim(),
      documento:       data.documento?.trim(),
      estado_civil_id: data.estado_civil_id,
      email:           data.email?.trim().toLowerCase(),
      password:        data.password,
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
    <div
      className="flex min-h-[calc(100vh-60px)] items-center justify-center p-4"
      style={{ background: "var(--color-surface)" }}
    >
      <div
        className="w-full max-w-240 flex rounded-3xl overflow-hidden"
        style={{ boxShadow: "0 32px 80px rgba(28,36,56,0.16), 0 4px 16px rgba(28,36,56,0.08)" }}
      >
        {/* ── PANEL IZQUIERDO — marca ─────────────────────────── */}
        <div
          className="hidden lg:flex lg:w-[36%] relative flex-col justify-between p-12 overflow-hidden select-none"
          style={{ background: "#283149" }}
        >
          {/* Watermark S */}
          <div
            className="absolute -right-16 top-1/2 translate-y-[-52%] font-display italic font-light leading-none pointer-events-none"
            style={{ fontSize: "28rem", color: "rgba(243,230,217,0.045)", lineHeight: 1 }}
          >
            S
          </div>

          <div
            className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none"

            style={{ background: "rgba(243,230,217,0.04)" }}
          />

          {/* Contenido */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-10">
              <div className="h-px w-6" style={{ background: "rgba(243,230,217,0.25)" }} />
              <span
                className="text-[10px] tracking-[0.28em] uppercase"
                style={{ color: "rgba(243,230,217,0.45)" }}
              >
                Nueva cuenta
              </span>
            </div>

            <h1
              className="font-display italic font-light leading-[0.88] mb-5"
              style={{ fontSize: "4.5rem", color: "#F3E6D9" }}
            >
              Stilo's
            </h1>

            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(243,230,217,0.45)" }}
            >
              Creá tu cuenta y accedé a todo el catálogo de moda.
            </p>
          </div>

          {/* Pasos decorativos */}
          <div className="relative z-10 space-y-3">
            {["Completá tus datos", "Confirmá tu cuenta", "Explorá el catálogo"].map((paso, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "rgba(243,230,217,0.12)", color: "rgba(243,230,217,0.6)" }}
                >
                  {i + 1}
                </div>
                <span className="text-xs" style={{ color: "rgba(243,230,217,0.4)" }}>
                  {paso}
                </span>
              </div>
            ))}
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
          <div className="lg:hidden mb-6 text-center">
            <span
              className="font-display italic font-light"
              style={{ fontSize: "3rem", color: "#283149" }}
            >
              Stilo's
            </span>
          </div>

          <div className="max-w-140 mx-auto w-full">
            <div className="mb-7">
              <h2
                className="text-[1.5rem] font-black tracking-tight mb-1"
                style={{ color: "#1C2438" }}
              >
                Crear cuenta
              </h2>
              <p className="text-sm" style={{ color: "#8A95A8" }}>
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
              {/* Grid 2 columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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
                <div>
                  <label className="label-form">Documento</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="12345678"
                    className="input-form"
                    {...register("documento", {
                      required: "El documento es obligatorio",
                      minLength: { value: 6, message: "Mínimo 6 dígitos" },
                      maxLength: { value: 12, message: "Máximo 12 dígitos" },
                      pattern:  { value: /^[0-9]+$/, message: "Solo números" },
                    })}
                  />
                  {errors.documento && <p className="error-form">{errors.documento.message}</p>}
                </div>

                {/* Estado civil */}
                <div>
                  <label className="label-form">Estado civil</label>
                  <select
                    className="input-form"
                    {...register("estado_civil_id", { required: "Seleccioná un estado civil" })}
                  >
                    <option value="">Seleccioná…</option>
                    {estadosCiviles.map(ec => (
                      <option key={ec.ID_USEPERS03} value={ec.ID_USEPERS03}>
                        {ec.USEPERS03_DESCRI}
                      </option>
                    ))}
                  </select>
                  {errors.estado_civil_id && (
                    <p className="error-form">{errors.estado_civil_id.message}</p>
                  )}
                </div>

                {/* Email — span 2 */}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "var(--color-muted)" }}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "var(--color-muted)" }}
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
                className="mt-6 w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-55"
                style={{ background: "#283149", color: "#F3E6D9" }}
              >
                {loading ? "Registrando…" : "Crear cuenta"}
              </button>

              {/* Link login */}
              <p className="mt-5 text-center text-sm" style={{ color: "#8A95A8" }}>
                ¿Ya tenés cuenta?{" "}
                <Link
                  to="/login"
                  className="font-bold transition hover:underline"
                  style={{ color: "#283149" }}
                >
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
