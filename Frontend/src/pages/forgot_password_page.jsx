import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { authForgotPassword } from "../api/auth_api";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { setError("El email es obligatorio"); return; }
    setError("");
    setLoading(true);
    try {
      await authForgotPassword({ email: email.trim().toLowerCase() });
      setEnviado(true);
    } catch (err) {
      setError(
        err?.response?.data?.mensaje ??
        "No se pudo enviar el correo. Intentá más tarde."
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
        className="w-full max-w-190 flex rounded-3xl overflow-hidden"
        style={{ boxShadow: "0 32px 80px rgba(28,36,56,0.16), 0 4px 16px rgba(28,36,56,0.08)" }}
      >
        {/* ── PANEL IZQUIERDO — marca ─────────────────────────── */}
        <div
          className="hidden md:flex md:w-[42%] relative flex-col justify-between p-12 overflow-hidden select-none"
          style={{ background: "#283149" }}
        >
          {/* Watermark S */}
          <div
            className="absolute -right-10 top-1/2 -translate-y-1/2 font-display italic font-light leading-none pointer-events-none"
            style={{ fontSize: "26rem", color: "rgba(243,230,217,0.045)", lineHeight: 1 }}
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
                Recuperar acceso
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
              Te enviaremos un enlace seguro para restablecer tu contraseña.
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

        {/* ── PANEL DERECHO ────────────────────────────────────── */}
        <div
          className="flex-1 flex flex-col justify-center px-8 py-10 md:px-12"
          style={{ background: "#ffffff" }}
        >
          {/* Logo mobile */}
          <div className="md:hidden mb-8 text-center">
            <span
              className="font-display italic font-light"
              style={{ fontSize: "3rem", color: "#283149" }}
            >
              Stilo's
            </span>
          </div>

          <div className="max-w-xs mx-auto w-full">

            {enviado ? (
              /* ── Estado: email enviado ─────────────────────── */
              <div className="text-center">
                <div
                  className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "rgba(40,49,73,0.08)" }}
                >
                  <CheckCircle2 size={26} style={{ color: "#283149" }} />
                </div>

                <h2
                  className="text-xl font-black mb-2"
                  style={{ color: "#1C2438" }}
                >
                  Revisá tu correo
                </h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "#8A95A8" }}>
                  Si <span className="font-semibold" style={{ color: "#1C2438" }}>{email}</span> tiene
                  una cuenta, recibirás las instrucciones en breve.
                </p>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:underline"
                  style={{ color: "#283149" }}
                >
                  <ArrowLeft size={14} />
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              /* ── Formulario ────────────────────────────────── */
              <>
                <div className="mb-8">
                  <h2
                    className="text-[1.5rem] font-black tracking-tight mb-1"
                    style={{ color: "#1C2438" }}
                  >
                    Recuperar contraseña
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: "#8A95A8" }}>
                    Ingresá tu email y te enviamos un enlace para restablecerla.
                  </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="label-form">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="input-form"
                      autoComplete="email"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-55"
                    style={{ background: "#283149", color: "#F3E6D9" }}
                  >
                    {loading ? "Enviando…" : "Enviar enlace de recuperación"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:underline"
                    style={{ color: "#8A95A8" }}
                  >
                    <ArrowLeft size={13} />
                    Volver al inicio de sesión
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
