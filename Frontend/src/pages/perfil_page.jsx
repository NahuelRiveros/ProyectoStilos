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
      <div className="mb-6 rounded-2xl border border-line bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-champagne-dark text-xl font-black text-card shadow-md shadow-accent/20">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-black text-ink">
              {nombre} {apellido}
            </h1>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {roles.map((r) => (
                <span key={r.ID_AUTH01 ?? r} className="inline-flex items-center gap-1 rounded-full bg-warning-surface px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-warning-text ring-1 ring-warning-border/60">
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
            <div key={label} className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3">
              <Icon size={15} className="shrink-0 text-muted" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</p>
                <p className="truncate text-sm font-semibold text-ink">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-black text-ink">
          <KeyRound size={15} className="text-accent" />
          Cambiar contraseña
        </h2>

        <form onSubmit={handleSubmit(onCambiarPassword)} className="space-y-3">
          {[
            { name: "actual",    label: "Contraseña actual",    rules: { required: "Obligatorio" } },
            { name: "nueva",     label: "Nueva contraseña",     rules: { required: "Obligatorio", minLength: { value: 6, message: "Mínimo 6 caracteres" } } },
            { name: "confirmar", label: "Confirmar contraseña", rules: { required: "Obligatorio" } },
          ].map(({ name, label, rules }) => (
            <div key={name}>
              <label className="label-form">{label}</label>
              <input
                type="password"
                {...register(name, rules)}
                className="input-form"
              />
              {errors[name] && <p className="mt-1 text-xs text-rose-500">{errors[name].message}</p>}
            </div>
          ))}

          <Alert type={passType} msg={passMsg} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-champagne-light transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            <Save size={14} />
            {isSubmitting ? "Guardando…" : "Actualizar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
