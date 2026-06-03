import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authForgotPassword } from "../api/auth_api";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { setError("El email es obligatorio"); return; }
    setError(""); setLoading(true);
    try {
      await authForgotPassword({ email: email.trim().toLowerCase() });
      setEnviado(true);
    } catch (err) {
      setError(err?.response?.data?.mensaje ?? "No se pudo enviar el correo. Intentá más tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {enviado ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h2 className="mb-2 text-xl font-black text-emerald-900">Revisá tu correo</h2>
            <p className="mb-6 text-sm text-emerald-700">
              Si el email <strong>{email}</strong> tiene una cuenta asociada, recibirás las instrucciones para restablecer tu contraseña.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
              <ArrowLeft size={14} /> Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
              <Mail size={22} className="text-amber-500" />
            </div>
            <h1 className="mb-1 text-xl font-black text-slate-900">Recuperar contraseña</h1>
            <p className="mb-6 text-sm text-slate-500">
              Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
              </div>

              {error && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-amber-400 py-2.5 text-sm font-bold text-slate-950 transition-all hover:bg-amber-300 active:scale-95 disabled:opacity-60"
              >
                {loading ? "Enviando…" : "Enviar enlace de recuperación"}
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
                <ArrowLeft size={13} /> Volver al inicio de sesión
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
