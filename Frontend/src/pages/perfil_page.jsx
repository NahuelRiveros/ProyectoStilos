import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, AtSign, Shield, KeyRound, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { getPerfil } from "../api/usuarios_api";
import { http } from "../api/http";
import { useAuth } from "../auth/auth_context";

function Alert({ type, msg }) {
  if (!msg) return null;
  const s = type === "ok"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-rose-200 bg-rose-50 text-rose-700";
  const Icon = type === "ok" ? CheckCircle2 : AlertCircle;
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium ${s}`}>
      <Icon size={15} className="shrink-0" />
      {msg}
    </div>
  );
}

export default function PerfilPage() {
  const { usuario } = useAuth();
  const qc = useQueryClient();

  const { data: perfil, isLoading } = useQuery({
    queryKey: ["perfil"],
    queryFn: async () => {
      const r = await getPerfil();
      return r.data?.data ?? r.data;
    },
  });

  // ── Cambiar contraseña ────────────────────────────────────────
  const [passMsg, setPassMsg]   = useState(null);
  const [passType, setPassType] = useState("ok");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  async function onCambiarPassword(data) {
    setPassMsg(null);
    if (data.nueva !== data.confirmar) {
      setPassType("error"); setPassMsg("Las contraseñas no coinciden"); return;
    }
    try {
      const r = await http.put("/auth/cambiar-password", {
        password_actual: data.actual,
        password_nuevo:  data.nueva,
      });
      if (r.data?.ok) { setPassType("ok"); setPassMsg("Contraseña actualizada correctamente"); reset(); }
      else { setPassType("error"); setPassMsg(r.data?.mensaje ?? "Error al cambiar la contraseña"); }
    } catch (e) {
      setPassType("error");
      setPassMsg(e?.response?.data?.mensaje ?? "Error al cambiar la contraseña");
    }
  }

  const u = perfil ?? usuario;
  const nombre   = u?.AUTH02_NOMBRE   ?? u?.nombre   ?? "—";
  const apellido = u?.AUTH02_APELLIDO ?? u?.apellido  ?? "—";
  const email    = u?.AUTH02_EMAIL    ?? u?.email     ?? "—";
  const username = u?.AUTH02_USERNAME ?? u?.username  ?? "—";
  const roles    = u?.roles ?? [];

  const initials = [nombre[0], apellido[0]].filter(Boolean).join("").toUpperCase() || "U";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

      {/* Avatar + datos */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-xl font-black text-slate-950 shadow-md shadow-amber-400/20">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {nombre} {apellido}
            </h1>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {roles.map((r) => (
                <span key={r.ID_AUTH01 ?? r} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200/60">
                  <Shield size={9} />
                  {r.AUTH01_NOMBRE ?? r}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { icon: Mail,   label: "Email",    value: email },
            { icon: AtSign, label: "Username", value: username },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <Icon size={15} className="shrink-0 text-slate-400" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                <p className="truncate text-sm font-semibold text-slate-700">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
          <KeyRound size={15} className="text-amber-500" />
          Cambiar contraseña
        </h2>

        <form onSubmit={handleSubmit(onCambiarPassword)} className="space-y-3">
          {[
            { name: "actual",   label: "Contraseña actual",    rules: { required: "Obligatorio" } },
            { name: "nueva",    label: "Nueva contraseña",     rules: { required: "Obligatorio", minLength: { value: 6, message: "Mínimo 6 caracteres" } } },
            { name: "confirmar",label: "Confirmar contraseña", rules: { required: "Obligatorio" } },
          ].map(({ name, label, rules }) => (
            <div key={name}>
              <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
              <input
                type="password"
                {...register(name, rules)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
              {errors[name] && <p className="mt-1 text-xs text-rose-500">{errors[name].message}</p>}
            </div>
          ))}

          <Alert type={passType} msg={passMsg} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition-all hover:bg-amber-300 active:scale-95 disabled:opacity-60"
          >
            <Save size={14} />
            {isSubmitting ? "Guardando…" : "Actualizar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
