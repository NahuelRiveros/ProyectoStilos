import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { KeyRound, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { http } from "../api/http";
import { authResetPassword } from "../api/auth_api";

export default function ResetPasswordPage() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get("token") ?? "";

  const [estado, setEstado]   = useState("verificando"); // verificando | valido | invalido | exito
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [pass, setPass]       = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (!token) { setEstado("invalido"); return; }
    http.get(`/auth/verify-reset-token/${token}`)
      .then((r) => setEstado(r.data?.ok ? "valido" : "invalido"))
      .catch(() => setEstado("invalido"));
  }, [token]);

  async function onSubmit(e) {
    e.preventDefault();
    if (pass.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    if (pass !== confirm) { setError("Las contraseñas no coinciden"); return; }
    setError(""); setLoading(true);
    try {
      const r = await authResetPassword({ token, password_nuevo: pass });
      if (r?.ok) { setEstado("exito"); setTimeout(() => navigate("/login", { replace: true }), 3000); }
      else setError(r?.mensaje ?? "No se pudo restablecer la contraseña");
    } catch (err) {
      setError(err?.response?.data?.mensaje ?? "No se pudo restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  }

  if (estado === "verificando") {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  if (estado === "invalido") {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
          <XCircle size={40} className="mx-auto mb-4 text-rose-500" />
          <h2 className="mb-2 text-xl font-black text-rose-900">Enlace inválido o expirado</h2>
          <p className="mb-6 text-sm text-rose-700">
            Este enlace ya fue usado o expiró. Solicitá uno nuevo.
          </p>
          <Link to="/forgot-password" className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  if (estado === "exito") {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
          <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-500" />
          <h2 className="mb-2 text-xl font-black text-emerald-900">Contraseña restablecida</h2>
          <p className="text-sm text-emerald-700">Serás redirigido al inicio de sesión en unos segundos…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
          <KeyRound size={22} className="text-amber-500" />
        </div>
        <h1 className="mb-1 text-xl font-black text-slate-900">Nueva contraseña</h1>
        <p className="mb-6 text-sm text-slate-500">Ingresá y confirmá tu nueva contraseña.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          {[
            { label: "Nueva contraseña",      val: pass,    set: setPass },
            { label: "Confirmar contraseña",   val: confirm, set: setConfirm },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
              <input
                type="password"
                value={val}
                onChange={(e) => set(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
          ))}

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
            {loading ? "Guardando…" : "Establecer nueva contraseña"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft size={13} /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
