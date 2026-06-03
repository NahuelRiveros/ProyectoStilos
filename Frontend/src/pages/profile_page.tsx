import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Star, Check, X } from "lucide-react";
import { useAuth } from "../auth/auth_context";
import {
  getPerfil,
  updatePerfil,
  crearDireccion,
  updateDireccion,
  deleteDireccion,
  setDireccionDefault,
  type PerfilCliente,
  type Direccion,
  type CrearDireccionPayload,
} from "../api/cliente_api";
import { getCondicionesIva, type CondicionIva } from "../api/catalogo_api";

// ── Tipos locales ──────────────────────────────────────────────────────────────

interface DireccionForm {
  alias:         string;
  calle:         string;
  numero:        string;
  piso:          string;
  depto:         string;
  codigo_postal: string;
  localidad:     string;
  provincia:     string;
}

const DIR_EMPTY: DireccionForm = {
  alias: "", calle: "", numero: "", piso: "", depto: "",
  codigo_postal: "", localidad: "", provincia: "",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function DireccionModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<DireccionForm>;
  onSave: (data: CrearDireccionPayload) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<DireccionForm>({ ...DIR_EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function set(field: keyof DireccionForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.calle || !form.numero || !form.codigo_postal || !form.localidad || !form.provincia) {
      setErr("Completá los campos obligatorios.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        alias:         form.alias || undefined,
        calle:         form.calle,
        numero:        form.numero,
        piso:          form.piso || undefined,
        depto:         form.depto || undefined,
        codigo_postal: form.codigo_postal,
        localidad:     form.localidad,
        provincia:     form.provincia,
      });
      onClose();
    } catch {
      setErr("No se pudo guardar la dirección.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-bold text-ink">
            {initial ? "Editar dirección" : "Nueva dirección"}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label-form">Alias (opcional)</label>
            <input value={form.alias} onChange={set("alias")} className="input-form" placeholder="Casa, Trabajo…" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="label-form">Calle *</label>
              <input value={form.calle} onChange={set("calle")} className="input-form" required />
            </div>
            <div>
              <label className="label-form">Número *</label>
              <input value={form.numero} onChange={set("numero")} className="input-form" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-form">Piso</label>
              <input value={form.piso} onChange={set("piso")} className="input-form" />
            </div>
            <div>
              <label className="label-form">Dpto.</label>
              <input value={form.depto} onChange={set("depto")} className="input-form" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-form">CP *</label>
              <input value={form.codigo_postal} onChange={set("codigo_postal")} className="input-form" required />
            </div>
            <div>
              <label className="label-form">Localidad *</label>
              <input value={form.localidad} onChange={set("localidad")} className="input-form" required />
            </div>
          </div>
          <div>
            <label className="label-form">Provincia *</label>
            <input value={form.provincia} onChange={set("provincia")} className="input-form" required />
          </div>

          {err && <p className="error-form">{err}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-muted hover:border-navy/30">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-xl bg-navy py-2.5 text-sm font-bold text-white hover:bg-navy/90 disabled:opacity-60">
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { isAuth, cargando, usuario } = useAuth();

  const [perfil,    setPerfil]    = useState<PerfilCliente | null>(null);
  const [condiciones, setCondiciones] = useState<CondicionIva[]>([]);
  const [loading,   setLoading]   = useState(true);

  // Perfil edit
  const [editPerfil, setEditPerfil] = useState(false);
  const [telefono,   setTelefono]   = useState("");
  const [dni,        setDni]        = useState("");
  const [cuit,       setCuit]       = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [condIvaId,  setCondIvaId]  = useState<number | "">("");
  const [savingPerfil, setSavingPerfil] = useState(false);

  // Direcciones
  const [modalDir,   setModalDir]   = useState<{ open: boolean; editing?: Direccion }>({ open: false });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuth) return;
    Promise.all([getPerfil(), getCondicionesIva()])
      .then(([p, c]) => {
        setPerfil(p);
        setCondiciones(c);
        setTelefono(p.telefono ?? "");
        setDni(p.dni ?? "");
        setCuit(p.cuit ?? "");
        setRazonSocial(p.razon_social ?? "");
        setCondIvaId(p.condicion_iva?.id ?? "");
      })
      .finally(() => setLoading(false));
  }, [isAuth]);

  if (cargando || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  if (!isAuth) return <Navigate to="/login" replace />;

  async function handleSavePerfil() {
    setSavingPerfil(true);
    try {
      const updated = await updatePerfil({
        telefono:        telefono || undefined,
        dni:             dni      || undefined,
        cuit:            cuit     || undefined,
        razon_social:    razonSocial || undefined,
        condicion_iva_id: condIvaId !== "" ? Number(condIvaId) : null,
      });
      setPerfil(updated);
      setEditPerfil(false);
    } catch {
      alert("No se pudo actualizar el perfil.");
    } finally {
      setSavingPerfil(false);
    }
  }

  async function handleCrearDireccion(data: CrearDireccionPayload) {
    const nueva = await crearDireccion(data);
    setPerfil((p) => p ? { ...p, direcciones: [...p.direcciones, nueva] } : p);
  }

  async function handleEditarDireccion(data: CrearDireccionPayload) {
    if (!modalDir.editing) return;
    const updated = await updateDireccion(modalDir.editing.id, data);
    setPerfil((p) => p ? {
      ...p,
      direcciones: p.direcciones.map((d) => d.id === updated.id ? updated : d),
    } : p);
  }

  async function handleDeleteDir(id: number) {
    if (!confirm("¿Eliminar esta dirección?")) return;
    setDeletingId(id);
    try {
      await deleteDireccion(id);
      setPerfil((p) => p ? { ...p, direcciones: p.direcciones.filter((d) => d.id !== id) } : p);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(id: number) {
    const updated = await setDireccionDefault(id);
    setPerfil((p) => p ? {
      ...p,
      direcciones: p.direcciones.map((d) => ({ ...d, es_default: d.id === updated.id })),
    } : p);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-2xl font-bold text-ink">Mi cuenta</h1>

      {/* ── DATOS DE USUARIO ───────────────────────────────────────────── */}
      <section className="mb-8 rounded-2xl bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-ink">Datos personales</h2>
          {!editPerfil && (
            <button onClick={() => setEditPerfil(true)}
              className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:border-navy/30 hover:text-navy">
              <Edit2 size={13} /> Editar
            </button>
          )}
        </div>

        {/* Nombre y email — desde auth context (solo lectura) */}
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="label-form">Nombre</p>
            <p className="text-sm text-ink">
              {[usuario?.nombre, usuario?.apellido].filter(Boolean).join(" ") || "—"}
            </p>
          </div>
          <div>
            <p className="label-form">Correo</p>
            <p className="text-sm text-ink">{usuario?.correo ?? usuario?.email ?? "—"}</p>
          </div>
        </div>

        {editPerfil ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label-form">Teléfono</label>
                <input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="input-form" />
              </div>
              <div>
                <label className="label-form">DNI</label>
                <input value={dni} onChange={(e) => setDni(e.target.value)} className="input-form" />
              </div>
              <div>
                <label className="label-form">CUIT</label>
                <input value={cuit} onChange={(e) => setCuit(e.target.value)} className="input-form" />
              </div>
              <div>
                <label className="label-form">Razón Social</label>
                <input value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} className="input-form" />
              </div>
            </div>
            <div>
              <label className="label-form">Condición IVA</label>
              <select value={condIvaId} onChange={(e) => setCondIvaId(e.target.value ? Number(e.target.value) : "")}
                className="input-form">
                <option value="">Sin especificar</option>
                {condiciones.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre} ({c.codigo})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditPerfil(false)}
                className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-muted hover:border-navy/30">
                Cancelar
              </button>
              <button onClick={handleSavePerfil} disabled={savingPerfil}
                className="rounded-xl bg-navy px-4 py-2 text-sm font-bold text-white hover:bg-navy/90 disabled:opacity-60">
                {savingPerfil ? "Guardando…" : <><Check size={14} className="inline mr-1" />Guardar</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="label-form">Teléfono</p>
              <p className="text-sm text-ink">{perfil?.telefono ?? "—"}</p>
            </div>
            <div>
              <p className="label-form">DNI</p>
              <p className="text-sm text-ink">{perfil?.dni ?? "—"}</p>
            </div>
            <div>
              <p className="label-form">CUIT</p>
              <p className="text-sm text-ink">{perfil?.cuit ?? "—"}</p>
            </div>
            <div>
              <p className="label-form">Condición IVA</p>
              <p className="text-sm text-ink">{perfil?.condicion_iva?.nombre ?? "—"}</p>
            </div>
          </div>
        )}
      </section>

      {/* ── DIRECCIONES ────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-ink">Mis direcciones</h2>
          <button
            onClick={() => setModalDir({ open: true })}
            className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-navy/90"
          >
            <Plus size={13} /> Nueva
          </button>
        </div>

        {perfil?.direcciones.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            No tenés direcciones guardadas.
          </p>
        ) : (
          <div className="space-y-3">
            {perfil?.direcciones.map((dir) => (
              <div key={dir.id} className={[
                "rounded-xl border p-4 transition",
                dir.es_default ? "border-navy/30 bg-navy/5" : "border-line",
              ].join(" ")}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {dir.alias && (
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted">{dir.alias}</p>
                    )}
                    <p className="text-sm font-semibold text-ink">
                      {dir.calle} {dir.numero}
                      {dir.piso && `, Piso ${dir.piso}`}
                      {dir.depto && ` Dpto. ${dir.depto}`}
                    </p>
                    <p className="text-xs text-muted">
                      {dir.localidad}, {dir.provincia} ({dir.codigo_postal})
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {!dir.es_default && (
                      <button
                        onClick={() => handleSetDefault(dir.id)}
                        title="Usar como predeterminada"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-navy/10 hover:text-navy"
                      >
                        <Star size={13} />
                      </button>
                    )}
                    {dir.es_default && (
                      <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-bold text-navy">
                        Predeterminada
                      </span>
                    )}
                    <button
                      onClick={() => setModalDir({ open: true, editing: dir })}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-navy/10 hover:text-navy"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteDir(dir.id)}
                      disabled={deletingId === dir.id}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal dirección */}
      {modalDir.open && (
        <DireccionModal
          initial={modalDir.editing ? {
            alias:         modalDir.editing.alias,
            calle:         modalDir.editing.calle,
            numero:        modalDir.editing.numero,
            piso:          modalDir.editing.piso ?? "",
            depto:         modalDir.editing.depto ?? "",
            codigo_postal: modalDir.editing.codigo_postal,
            localidad:     modalDir.editing.localidad,
            provincia:     modalDir.editing.provincia,
          } : undefined}
          onSave={modalDir.editing ? handleEditarDireccion : handleCrearDireccion}
          onClose={() => setModalDir({ open: false })}
        />
      )}
    </div>
  );
}
