import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  UserPlus, UserX, KeyRound, Shield, X,
  CheckCircle2, AlertCircle, RefreshCw, Pencil, AlertTriangle,
} from "lucide-react";
import {
  getUsuarios, createUsuario, updateUsuario,
  deleteUsuario, reactivarUsuario, asignarRoles,
  resetPasswordAdmin,
} from "../../api/usuarios_api";
import { getRoles } from "../../api/roles_api";
import { useAuth } from "../../auth/auth_context";
import DataGrid from "../../components/data/data_grid";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getUserName(u) {
  const nombre = [u.AUTH02_NOMBRE, u.AUTH02_APELLIDO].filter(Boolean).join(" ");
  return nombre || u.AUTH02_USERNAME || u.AUTH02_EMAIL || "—";
}
function isActive(u) { return !u.AUTH02_FECHABAJA; }
function initials(u) {
  const n = u.AUTH02_NOMBRE?.[0] ?? "";
  const a = u.AUTH02_APELLIDO?.[0] ?? "";
  return (n + a).toUpperCase() || u.AUTH02_USERNAME?.[0]?.toUpperCase() || "U";
}

// ── Shared UI ────────────────────────────────────────────────────────────────

function Alert({ ok, msg }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
      {ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
      {msg}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-black text-slate-900">{title}</h3>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X size={15} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      {children}
      {error && <p className="mt-0.5 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20";

// ── Modales ──────────────────────────────────────────────────────────────────

function ModalCrear({ onClose, onDone, roles }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { rol_abreviatura: "USR" } });
  const [alert, setAlert] = useState(null);

  async function onSubmit(data) {
    setAlert(null);
    try {
      const r = await createUsuario(data);
      if (r.data?.ok) { setAlert({ ok: true, msg: r.data.mensaje }); setTimeout(onDone, 800); }
      else setAlert({ ok: false, msg: r.data?.mensaje ?? "Error al crear usuario" });
    } catch (e) {
      setAlert({ ok: false, msg: e?.response?.data?.mensaje ?? "Error al crear usuario" });
    }
  }

  return (
    <Modal title="Nuevo usuario" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre *" error={errors.nombre?.message}>
            <input className={inputClass} {...register("nombre", { required: "Obligatorio" })} />
          </Field>
          <Field label="Apellido *" error={errors.apellido?.message}>
            <input className={inputClass} {...register("apellido", { required: "Obligatorio" })} />
          </Field>
        </div>
        <Field label="Email *" error={errors.email?.message}>
          <input type="email" autoComplete="off" className={inputClass} {...register("email", { required: "Obligatorio" })} />
        </Field>
        <Field label="Username (opcional)">
          <input className={inputClass} placeholder="Se deriva del email si se omite" {...register("username")} />
        </Field>
        <Field label="Contraseña *" error={errors.password?.message}>
          <input type="password" className={inputClass} {...register("password", { required: "Obligatorio", minLength: { value: 6, message: "Mín. 6 caracteres" } })} />
        </Field>
        <Field label="Rol inicial">
          <select className={inputClass} {...register("rol_abreviatura")}>
            {roles.map((r) => (
              <option key={r.ID_AUTH01} value={r.AUTH01_ABREVIATURA}>
                {r.AUTH01_NOMBRE} ({r.AUTH01_ABREVIATURA})
              </option>
            ))}
          </select>
        </Field>
        <Alert msg={alert?.msg} ok={alert?.ok} />
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60">
            <UserPlus size={14} /> {isSubmitting ? "Creando…" : "Crear usuario"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ModalEditar({ usuario, onClose, onDone }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      nombre:   usuario.AUTH02_NOMBRE   ?? "",
      apellido: usuario.AUTH02_APELLIDO ?? "",
      email:    usuario.AUTH02_EMAIL    ?? "",
      username: usuario.AUTH02_USERNAME ?? "",
    },
  });
  const [alert, setAlert] = useState(null);

  async function onSubmit(data) {
    setAlert(null);
    try {
      const r = await updateUsuario(usuario.ID_AUTH02, data);
      if (r.data?.ok) { setAlert({ ok: true, msg: r.data.mensaje }); setTimeout(onDone, 800); }
      else setAlert({ ok: false, msg: r.data?.mensaje ?? "Error al actualizar" });
    } catch (e) {
      setAlert({ ok: false, msg: e?.response?.data?.mensaje ?? "Error al actualizar" });
    }
  }

  return (
    <Modal title={`Editar — ${getUserName(usuario)}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" error={errors.nombre?.message}>
            <input className={inputClass} {...register("nombre")} />
          </Field>
          <Field label="Apellido">
            <input className={inputClass} {...register("apellido")} />
          </Field>
        </div>
        <Field label="Email">
          <input type="email" autoComplete="off" className={inputClass} {...register("email")} />
        </Field>
        <Field label="Username">
          <input className={inputClass} {...register("username")} />
        </Field>
        <Alert msg={alert?.msg} ok={alert?.ok} />
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60">
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ModalRoles({ usuario, roles, onClose, onDone }) {
  const actuales = usuario.roles?.map((r) => r.AUTH01_ABREVIATURA) ?? [];
  const [selected, setSelected] = useState(new Set(actuales));
  const [alert, setAlert]       = useState(null);
  const [saving, setSaving]     = useState(false);

  function toggle(abr) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(abr) ? next.delete(abr) : next.add(abr);
      return next;
    });
  }

  async function guardar() {
    if (selected.size === 0) { setAlert({ ok: false, msg: "Asigná al menos un rol" }); return; }
    setSaving(true); setAlert(null);
    try {
      const r = await asignarRoles(usuario.ID_AUTH02, [...selected]);
      if (r.data?.ok) { setAlert({ ok: true, msg: r.data.mensaje }); setTimeout(onDone, 700); }
      else setAlert({ ok: false, msg: r.data?.mensaje ?? "Error al asignar roles" });
    } catch (e) {
      const d = e?.response?.data;
      setAlert({ ok: false, msg: d?.detalle ?? d?.mensaje ?? "Error al asignar roles" });
    } finally { setSaving(false); }
  }

  return (
    <Modal title={`Roles — ${getUserName(usuario)}`} onClose={onClose}>
      <div className="space-y-2">
        {roles.map((r) => (
          <label key={r.ID_AUTH01} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={selected.has(r.AUTH01_ABREVIATURA)}
              onChange={() => toggle(r.AUTH01_ABREVIATURA)}
              className="h-4 w-4 rounded accent-amber-400"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">{r.AUTH01_NOMBRE}</p>
              <p className="text-[11px] text-slate-400">{r.AUTH01_ABREVIATURA} · Nivel {r.AUTH01_NIVEL}</p>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        <Alert msg={alert?.msg} ok={alert?.ok} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button onClick={guardar} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60">
            <Shield size={13} /> {saving ? "Guardando…" : "Aplicar roles"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ModalResetPassword({ usuario, onClose, onDone }) {
  const [pass, setPass]     = useState("");
  const [alert, setAlert]   = useState(null);
  const [saving, setSaving] = useState(false);

  async function guardar() {
    if (pass.length < 6) { setAlert({ ok: false, msg: "Mínimo 6 caracteres" }); return; }
    setSaving(true); setAlert(null);
    try {
      const r = await resetPasswordAdmin(usuario.ID_AUTH02, pass);
      if (r.data?.ok) { setAlert({ ok: true, msg: r.data.mensaje }); setTimeout(onDone, 700); }
      else setAlert({ ok: false, msg: r.data?.mensaje ?? "Error" });
    } catch (e) {
      setAlert({ ok: false, msg: e?.response?.data?.mensaje ?? "Error al cambiar contraseña" });
    } finally { setSaving(false); }
  }

  return (
    <Modal title={`Resetear contraseña — ${getUserName(usuario)}`} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-slate-500">
          Establecé una nueva contraseña para <strong className="text-slate-800">{usuario.AUTH02_EMAIL}</strong>.
        </p>
        <Field label="Nueva contraseña">
          <input type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} className={inputClass} placeholder="Mínimo 6 caracteres" />
        </Field>
        <Alert msg={alert?.msg} ok={alert?.ok} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button onClick={guardar} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60">
            <KeyRound size={13} /> {saving ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ModalConfirmarToggle({ usuario, onClose, onConfirm }) {
  const desactivar = isActive(usuario);
  const [loading, setLoading] = useState(false);

  async function confirmar() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  return (
    <Modal
      title={desactivar ? "Desactivar usuario" : "Reactivar usuario"}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-800">
            {desactivar
              ? <>¿Confirmás desactivar a <strong>{getUserName(usuario)}</strong>? El usuario no podrá iniciar sesión hasta ser reactivado.</>
              : <>¿Confirmás reactivar a <strong>{getUserName(usuario)}</strong>? El usuario podrá volver a iniciar sesión.</>
            }
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={loading}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition disabled:opacity-60",
              desactivar
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-emerald-600 text-white hover:bg-emerald-700",
            ].join(" ")}
          >
            {desactivar
              ? <><UserX size={14} /> {loading ? "Desactivando…" : "Desactivar"}</>
              : <><RefreshCw size={14} /> {loading ? "Reactivando…" : "Reactivar"}</>
            }
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Columnas DataGrid ─────────────────────────────────────────────────────────

function buildColumns() {
  return [
    {
      key: "AUTH02_NOMBRE",
      label: "Usuario",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${isActive(row) ? "bg-linear-to-br from-amber-400 to-orange-500 text-slate-950" : "bg-slate-200 text-slate-500"}`}>
            {initials(row)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{getUserName(row)}</p>
            <p className="truncate text-xs text-slate-400">{row.AUTH02_EMAIL}</p>
          </div>
        </div>
      ),
    },
    {
      key: "roles",
      label: "Roles",
      searchable: false,
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.roles ?? []).map((r) => (
            <span key={r.ID_AUTH01} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
              {r.AUTH01_ABREVIATURA}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "AUTH02_FECHABAJA",
      label: "Estado",
      sortable: true,
      searchable: false,
      render: (row) => {
        const active = isActive(row);
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${active ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60" : "bg-rose-50 text-rose-600 ring-1 ring-rose-200/60"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-rose-400"}`} />
            {active ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
  ];
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AdminUsuariosPage() {
  const { usuario: self } = useAuth();
  const qc = useQueryClient();

  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [modal, setModal] = useState(null);

  const { data: todosUsuarios = [], isLoading } = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: async () => {
      const r = await getUsuarios();
      return r.data?.data ?? [];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const r = await getRoles();
      return r.data?.data ?? [];
    },
  });

  function invalidar() {
    qc.invalidateQueries({ queryKey: ["admin-usuarios"] });
    setModal(null);
  }

  async function toggleUsuario(u) {
    try {
      if (isActive(u)) await deleteUsuario(u.ID_AUTH02);
      else await reactivarUsuario(u.ID_AUTH02);
      invalidar();
    } catch (e) { console.error(e); }
  }

  const rows = mostrarInactivos
    ? todosUsuarios
    : todosUsuarios.filter(isActive);

  const activos   = todosUsuarios.filter(isActive).length;
  const inactivos = todosUsuarios.filter((u) => !isActive(u)).length;

  const columns = buildColumns();

  const actions = [
    {
      key: "editar",
      label: "Editar datos",
      icon: Pencil,
      variant: "warning",
      iconOnly: true,
      onClick: (row) => setModal({ tipo: "editar", usuario: row }),
    },
    {
      key: "roles",
      label: "Gestionar roles",
      icon: Shield,
      variant: "info",
      iconOnly: true,
      onClick: (row) => setModal({ tipo: "roles", usuario: row }),
    },
    {
      key: "reset",
      label: "Resetear contraseña",
      icon: KeyRound,
      variant: "ghost",
      iconOnly: true,
      onClick: (row) => setModal({ tipo: "reset", usuario: row }),
    },
    {
      key: "desactivar",
      label: "Desactivar",
      icon: UserX,
      variant: "danger",
      iconOnly: true,
      onClick: (row) => setModal({ tipo: "confirmar_toggle", usuario: row }),
      hidden: (row) => !isActive(row) || row.ID_AUTH02 === self?.usuario_id,
    },
    {
      key: "reactivar",
      label: "Reactivar",
      icon: RefreshCw,
      variant: "success",
      iconOnly: true,
      onClick: (row) => setModal({ tipo: "confirmar_toggle", usuario: row }),
      hidden: (row) => isActive(row),
    },
  ];

  const headerExtra = (
    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
      <input
        type="checkbox"
        checked={mostrarInactivos}
        onChange={(e) => setMostrarInactivos(e.target.checked)}
        className="h-3.5 w-3.5 rounded accent-amber-400"
      />
      Mostrar inactivos
    </label>
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">

      {/* Cabecera de página */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900">Usuarios del sistema</h1>
          <p className="text-xs text-slate-500">
            {activos} activos · {inactivos} inactivos
          </p>
        </div>
        <button
          onClick={() => setModal({ tipo: "crear" })}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-amber-300 active:scale-95"
        >
          <UserPlus size={15} />
          Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      <DataGrid
        rows={rows}
        columns={columns}
        keyField="ID_AUTH02"
        loading={isLoading}
        searchable
        searchPlaceholder="Buscar usuarios…"
        searchColumns={["AUTH02_NOMBRE", "AUTH02_APELLIDO", "AUTH02_EMAIL", "AUTH02_USERNAME"]}
        emptyMessage={mostrarInactivos ? "No hay usuarios registrados" : "No hay usuarios activos"}
        actions={actions}
        headerExtra={headerExtra}
      />

      {/* Modales */}
      {modal?.tipo === "crear"  && <ModalCrear   roles={roles} onClose={() => setModal(null)} onDone={invalidar} />}
      {modal?.tipo === "editar" && <ModalEditar  usuario={modal.usuario} onClose={() => setModal(null)} onDone={invalidar} />}
      {modal?.tipo === "roles"  && <ModalRoles   usuario={modal.usuario} roles={roles} onClose={() => setModal(null)} onDone={invalidar} />}
      {modal?.tipo === "reset"  && <ModalResetPassword usuario={modal.usuario} onClose={() => setModal(null)} onDone={invalidar} />}
      {modal?.tipo === "confirmar_toggle" && (
        <ModalConfirmarToggle
          usuario={modal.usuario}
          onClose={() => setModal(null)}
          onConfirm={() => toggleUsuario(modal.usuario)}
        />
      )}
    </div>
  );
}
