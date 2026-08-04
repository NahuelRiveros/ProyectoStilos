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
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center bg-surface p-4">
      <div
        className="flex w-full max-w-190 overflow-hidden rounded-3xl"
        style={{ boxShadow: "var(--shadow-auth)" }}
      >
        {/* ── PANEL IZQUIERDO — marca ─────────────────────────── */}
        <div className="relative hidden select-none flex-col justify-between overflow-hidden bg-navy p-12 md:flex md:w-[42%]">
          {/* Watermark S */}
          <div
            className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 font-display italic font-light leading-none text-champagne-light/5"
            style={{ fontSize: "26rem", lineHeight: 1 }}
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
                Recuperar acceso
              </span>
            </div>

            <h1
              className="mb-5 font-display italic font-light leading-[0.88] text-champagne-light"
              style={{ fontSize: "4.5rem" }}
            >
              Stilo's
            </h1>

            <p className="text-sm leading-relaxed text-champagne-light/45">
              Te enviaremos un enlace seguro para restablecer tu contraseña.
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

        {/* ── PANEL DERECHO ────────────────────────────────────── */}
        <div className="flex flex-1 flex-col justify-center bg-card px-8 py-10 md:px-12">
          {/* Logo mobile */}
          <div className="mb-8 text-center md:hidden">
            <span
              className="font-display italic font-light text-navy"
              style={{ fontSize: "3rem" }}
            >
              Stilo's
            </span>
          </div>

          <div className="mx-auto w-full max-w-xs">

            {enviado ? (
              /* ── Estado: email enviado ─────────────────────── */
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy/8">
                  <CheckCircle2 size={26} className="text-navy" />
                </div>

                <h2 className="mb-2 text-xl font-black text-ink">
                  Revisá tu correo
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-muted">
                  Si <span className="font-semibold text-ink">{email}</span> tiene
                  una cuenta, recibirás las instrucciones en breve.
                </p>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy transition hover:underline"
                >
                  <ArrowLeft size={14} />
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              /* ── Formulario ────────────────────────────────── */
              <>
                <div className="mb-8">
                  <h2 className="mb-1 text-[1.5rem] font-black tracking-tight text-ink">
                    Recuperar contraseña
                  </h2>
                  <p className="text-sm leading-relaxed text-muted">
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
                    className="w-full rounded-xl bg-navy py-3 text-sm font-bold tracking-wide text-champagne-light transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-55"
                  >
                    {loading ? "Enviando…" : "Enviar enlace de recuperación"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:underline"
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
