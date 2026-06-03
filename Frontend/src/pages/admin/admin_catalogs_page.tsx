import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "../../context/toast_context";
import {
  Plus, Pencil, Trash2, Check, X, RefreshCw,
  Tag, Ruler, Palette, Truck, RotateCcw, Crown, ChevronDown,
} from "lucide-react";
import {
  getCategorias,        createCategoria,      updateCategoria,      deleteCategoria,
  getCategoriaGeneros,  setCategoriaGeneros,
  getGeneros,           createGenero,         updateGenero,         deleteGenero,
  getTalles,            createTalle,          updateTalle,          deleteTalle,
  getColores,           createColor,          updateColor,          deleteColor,
  getMarcas,            createMarca,          updateMarca,          deleteMarca,
  getOpcionesEnvio,     createOpcionEnvio,    updateOpcionEnvio,    deleteOpcionEnvio,
  type Categoria, type Genero, type Talle, type Color, type Marca, type OpcionEnvio,
} from "../../api/catalogo_api";

// ─── Utilidades ───────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const fmt = (n: number) => `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

// ─── Tipos de pestaña ─────────────────────────────────────────────────────────

type TabId = "marcas" | "categorias" | "colores" | "talles" | "generos" | "envio";

const TABS: { id: TabId; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "marcas",     label: "Marcas",           icon: Crown,     desc: "Marcas disponibles en la tienda" },
  { id: "categorias", label: "Tipos de prenda",  icon: Tag,       desc: "Remeras, Jeans, Vestidos…" },
  { id: "colores",    label: "Colores",           icon: Palette,   desc: "Paleta disponible en tus productos" },
  { id: "talles",     label: "Talles",            icon: Ruler,     desc: "XS, S, M, L, 36, 37…" },
  { id: "generos",    label: "Géneros",           icon: RefreshCw, desc: "Damas, Hombre, Calzado…" },
  { id: "envio",      label: "Envío",             icon: Truck,     desc: "Opciones y tarifas de envío" },
];

// ─── Hook genérico de CRUD ────────────────────────────────────────────────────

function useConfirmDelete(onConfirm: (id: number) => void) {
  const [pendingId, setPendingId] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function request(id: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPendingId(id);
    timerRef.current = setTimeout(() => setPendingId(null), 4000);
  }

  function confirm(id: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPendingId(null);
    onConfirm(id);
  }

  function cancel() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPendingId(null);
  }

  return { pendingId, request, confirm, cancel };
}

// ─── Fila editable genérica ───────────────────────────────────────────────────

function TableRow({
  children,
  onDelete,
  onEdit,
  isConfirmingDelete,
  onConfirmDelete,
  onCancelDelete,
  saving,
}: {
  children:           React.ReactNode;
  onDelete:           () => void;
  onEdit:             () => void;
  isConfirmingDelete: boolean;
  onConfirmDelete:    () => void;
  onCancelDelete:     () => void;
  saving?:            boolean;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-surface/60">
      <div className="flex-1 min-w-0">{children}</div>

      {isConfirmingDelete ? (
        <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
          <span className="text-[11px] font-semibold text-rose-600">¿Eliminar?</span>
          <button onClick={onConfirmDelete}
            className="flex h-7 items-center gap-1 rounded-lg bg-rose-500 px-2.5 text-[11px] font-bold text-white hover:bg-rose-600">
            <Check size={11} /> Sí
          </button>
          <button onClick={onCancelDelete}
            className="flex h-7 items-center gap-1 rounded-lg border border-line px-2.5 text-[11px] font-semibold text-muted hover:border-navy/30">
            <X size={11} /> No
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={onEdit} disabled={saving}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-navy/10 hover:text-navy disabled:opacity-40">
            <Pencil size={13} />
          </button>
          <button onClick={onDelete} disabled={saving}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40">
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Formulario inline de nueva entrada ───────────────────────────────────────

function InlineForm({
  onSave,
  onCancel,
  children,
  saving,
}: {
  onSave:   () => void;
  onCancel: () => void;
  children: React.ReactNode;
  saving:   boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-navy/20 bg-navy/5 px-4 py-3 animate-in fade-in slide-in-from-bottom-1 duration-150">
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={onSave} disabled={saving}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-navy px-3 text-xs font-bold text-white hover:bg-navy/90 disabled:opacity-60">
          <Check size={12} /> {saving ? "Guardando…" : "Guardar"}
        </button>
        <button onClick={onCancel} disabled={saving}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:border-navy/30">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── TAB: Marcas ─────────────────────────────────────────────────────────────

function MarcasTab() {
  const [items,   setItems]   = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [editId,  setEditId]  = useState<number | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [nombre,  setNombre]  = useState("");
  const [slug,    setSlug]    = useState("");
  const [logo,    setLogo]    = useState("");
  const toast = useToast();

  const load = useCallback(() => {
    getMarcas().then(setItems).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const del = useConfirmDelete(async (id) => {
    try {
      await deleteMarca(id);
      setItems((p) => p.filter((i) => i.id !== id));
      toast.success("Marca eliminada");
    } catch {
      toast.error("No se pudo eliminar la marca");
    }
  });

  function resetForm() { setNombre(""); setSlug(""); setLogo(""); }
  function startAdd() { setAdding(true); resetForm(); setEditId(null); }
  function startEdit(m: Marca) {
    setEditId(m.id); setNombre(m.nombre); setSlug(m.slug);
    setLogo(m.logo ?? ""); setAdding(false);
  }
  function cancelForm() { setAdding(false); setEditId(null); }

  async function handleSave() {
    if (!nombre.trim()) return;
    const s = slug || slugify(nombre);
    setSaving(true);
    try {
      const orden = editId
        ? (items.find((i) => i.id === editId)?.orden ?? 0)
        : items.length * 10;
      const data = { nombre: nombre.trim(), slug: s, logo: logo || null, descripcion: null, orden };
      if (editId) {
        const updated = await updateMarca(editId, data);
        setItems((p) => p.map((i) => i.id === editId ? updated : i));
        toast.success("Marca actualizada");
      } else {
        const created = await createMarca(data);
        setItems((p) => [...p, created].sort((a, b) => a.orden - b.orden));
        toast.success("Marca creada correctamente");
      }
      cancelForm();
    } catch {
      toast.error("Error al guardar la marca. Revisá que el nombre no esté repetido.");
    } finally { setSaving(false); }
  }

  const formFields = (
    <>
      <input
        value={nombre}
        onChange={(e) => { setNombre(e.target.value); setSlug(slugify(e.target.value)); }}
        className="input-form max-w-48 flex-1"
        placeholder="Nombre de la marca"
        autoFocus
      />
      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="input-form w-36 font-mono text-xs"
        placeholder="slug"
      />
      <input
        value={logo}
        onChange={(e) => setLogo(e.target.value)}
        className="input-form min-w-48 flex-1"
        placeholder="URL del logo (opcional)"
      />
    </>
  );

  if (loading) return <TabLoader />;
  return (
    <div>
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((m) =>
          editId === m.id ? null : (
            <div
              key={m.id}
              className="group relative flex items-center gap-3 rounded-xl border border-line bg-card p-3.5 transition hover:border-navy/30 hover:shadow-sm"
            >
              {m.logo ? (
                <img
                  src={m.logo}
                  alt={m.nombre}
                  className="h-10 w-10 shrink-0 rounded-lg border border-line object-contain p-0.5"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/10">
                  <span className="text-sm font-black text-navy">{m.nombre[0].toUpperCase()}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{m.nombre}</p>
                <p className="font-mono text-[10px] text-muted">{m.slug}</p>
              </div>
              <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => startEdit(m)}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-sm hover:text-navy"
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={() => del.request(m.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-sm hover:text-rose-500"
                >
                  <Trash2 size={11} />
                </button>
              </div>
              {del.pendingId === m.id && (
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-xl bg-white/90 backdrop-blur-sm">
                  <span className="text-[11px] font-semibold text-rose-600">¿Eliminar?</span>
                  <button onClick={() => del.confirm(m.id)} className="rounded-lg bg-rose-500 px-2 py-1 text-[11px] font-bold text-white">Sí</button>
                  <button onClick={del.cancel} className="rounded-lg border border-line px-2 py-1 text-[11px] text-muted">No</button>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {editId !== null && (
        <InlineForm onSave={handleSave} onCancel={cancelForm} saving={saving}>
          {formFields}
        </InlineForm>
      )}

      {adding ? (
        <InlineForm onSave={handleSave} onCancel={cancelForm} saving={saving}>
          {formFields}
        </InlineForm>
      ) : (
        <AddButton onClick={startAdd} label="Agregar marca" />
      )}
    </div>
  );
}

// ─── TAB: Categorías ─────────────────────────────────────────────────────────

function CategoriasTab() {
  const [items,    setItems]    = useState<Categoria[]>([]);
  const [generos,  setGeneros]  = useState<Genero[]>([]);
  // mapa categoriaId → generoIds asignados
  const [asignados, setAsignados] = useState<Record<number, number[]>>({});
  const [loading,  setLoading]  = useState(true);
  const [formOpen, setFormOpen] = useState<"add" | number | null>(null);
  const [saving,   setSaving]   = useState(false);
  const toast = useToast();

  // ── form state ─────────────────────────────────────────────
  const [nombre,      setNombre]      = useState("");
  const [slug,        setSlug]        = useState("");
  const [padreId,     setPadreId]     = useState<number | "">("");
  const [selGeneros,  setSelGeneros]  = useState<number[]>([]);

  const load = useCallback(async () => {
    const [cats, gens] = await Promise.all([getCategorias(), getGeneros()]);
    setItems(cats);
    setGeneros(gens);
    // carga géneros de TODAS las categorías (padres y subcategorías) en paralelo
    const entries = await Promise.all(
      cats.map(async (c) => [c.id, await getCategoriaGeneros(c.id)] as [number, number[]])
    );
    setAsignados(Object.fromEntries(entries));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const del = useConfirmDelete(async (id) => {
    try {
      await deleteCategoria(id);
      setItems((p) => p.filter((i) => i.id !== id));
      setAsignados((p) => { const n = { ...p }; delete n[id]; return n; });
      toast.success("Categoría eliminada");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;
      toast.error(msg ?? "No se pudo eliminar la categoría");
    }
  });

  function resetForm() { setNombre(""); setSlug(""); setPadreId(""); setSelGeneros([]); }

  function startAdd() {
    resetForm();
    setFormOpen("add");
  }

  function startEdit(c: Categoria) {
    setNombre(c.nombre);
    setSlug(c.slug);
    setPadreId(c.padre_id ?? "");
    setSelGeneros(asignados[c.id] ?? []);
    setFormOpen(c.id);
  }

  function cancelForm() { setFormOpen(null); }

  function toggleGenero(gid: number) {
    setSelGeneros((prev) =>
      prev.includes(gid) ? prev.filter((id) => id !== gid) : [...prev, gid]
    );
  }

  async function handleSave() {
    if (!nombre.trim()) return;
    const s = slug || slugify(nombre);
    const padre = padreId === "" ? null : Number(padreId);
    setSaving(true);
    try {
      if (typeof formOpen === "number") {
        const updated = await updateCategoria(formOpen, nombre.trim(), s, padre);
        setItems((p) => p.map((i) => i.id === formOpen ? updated : i));
        await setCategoriaGeneros(formOpen, selGeneros);
        setAsignados((p) => ({ ...p, [formOpen]: selGeneros }));
        toast.success("Categoría actualizada");
      } else {
        const created = await createCategoria(nombre.trim(), s, padre);
        setItems((p) => [...p, created].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        if (selGeneros.length > 0) {
          await setCategoriaGeneros(created.id, selGeneros);
          setAsignados((p) => ({ ...p, [created.id]: selGeneros }));
        }
        toast.success("Categoría creada");
      }
      cancelForm();
    } catch {
      toast.error("Error al guardar la categoría");
    } finally { setSaving(false); }
  }

  // ── árbol: raíces con sus subcategorías ────────────────────
  const raices = items.filter((c) => c.padre_id === null).sort((a, b) => a.nombre.localeCompare(b.nombre));
  const subs   = (parentId: number) => items.filter((c) => c.padre_id === parentId).sort((a, b) => a.nombre.localeCompare(b.nombre));

  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  function toggleCollapse(id: number) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const esEditando = (id: number) => formOpen === id;

  const CatForm = (
    <div className="space-y-3 rounded-xl border border-navy/20 bg-navy/5 px-4 py-4 animate-in fade-in slide-in-from-bottom-1 duration-150">
      {/* fila 1: nombre + slug */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={nombre}
          onChange={(e) => { setNombre(e.target.value); setSlug(slugify(e.target.value)); }}
          className="input-form max-w-xs flex-1"
          placeholder="Nombre (ej: Pantalones)"
          autoFocus
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="input-form w-36 font-mono text-xs"
          placeholder="slug"
        />
      </div>

      {/* fila 2: padre (opcional) */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold text-muted w-28 shrink-0">Subcategoría de</label>
        <select
          value={padreId}
          onChange={(e) => {
            const val = e.target.value === "" ? "" : Number(e.target.value);
            setPadreId(val);
            // al cambiar el padre, limpiar géneros que no pertenezcan al nuevo padre
            if (val !== "") {
              const generosDelPadre = asignados[Number(val)] ?? [];
              setSelGeneros((prev) => prev.filter((g) => generosDelPadre.includes(g)));
            }
          }}
          className="input-form w-52"
        >
          <option value="">— categoría raíz —</option>
          {raices
            .filter((r) => r.id !== (typeof formOpen === "number" ? formOpen : -1))
            .map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))
          }
        </select>
      </div>

      {/* fila 3: géneros — todos si es raíz, solo los del padre si es subcategoría */}
      {(() => {
        const disponibles = padreId === ""
          ? generos
          : generos.filter((g) => (asignados[Number(padreId)] ?? []).includes(g.id));

        if (disponibles.length === 0) return (
          padreId !== "" ? (
            <p className="text-[11px] text-muted italic">
              El padre aún no tiene géneros asignados. Asignalos primero.
            </p>
          ) : null
        );

        return (
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold text-muted w-28 shrink-0">Aparece en</label>
            <div className="flex flex-wrap gap-2">
              {disponibles.map((g) => (
                <label key={g.id} className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={selGeneros.includes(g.id)}
                    onChange={() => toggleGenero(g.id)}
                    className="h-3.5 w-3.5 rounded border-line accent-navy"
                  />
                  <span className="text-sm font-medium text-ink">{g.nombre}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })()}

      {/* acciones */}
      <div className="flex items-center gap-1.5">
        <button onClick={handleSave} disabled={saving}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-navy px-3 text-xs font-bold text-white hover:bg-navy/90 disabled:opacity-60">
          <Check size={12} /> {saving ? "Guardando…" : "Guardar"}
        </button>
        <button onClick={cancelForm} disabled={saving}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:border-navy/30">
          <X size={14} />
        </button>
      </div>
    </div>
  );

  if (loading) return <TabLoader />;
  return (
    <div className="space-y-1">
      {raices.map((root) => {
        const subItems   = subs(root.id);
        const hasSubs    = subItems.length > 0;
        const isOpen     = !collapsed.has(root.id);

        return (
          <div key={root.id}>
            {/* ── Categoría raíz ─────────────────────────────── */}
            {esEditando(root.id) ? CatForm : (
              <TableRow
                onDelete={() => del.request(root.id)} onEdit={() => startEdit(root)}
                isConfirmingDelete={del.pendingId === root.id}
                onConfirmDelete={() => del.confirm(root.id)} onCancelDelete={del.cancel}>
                <div className="flex items-center gap-2">
                  {/* toggle colapso */}
                  {hasSubs ? (
                    <button
                      onClick={() => toggleCollapse(root.id)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted hover:bg-navy/10 hover:text-navy transition-colors"
                      title={isOpen ? "Colapsar" : "Expandir"}
                    >
                      <ChevronDown
                        size={13}
                        className={["transition-transform duration-200", isOpen ? "" : "-rotate-90"].join(" ")}
                      />
                    </button>
                  ) : (
                    <div className="w-6 shrink-0" />
                  )}

                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy/10">
                    <Tag size={13} className="text-navy" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-bold text-ink">{root.nombre}</p>
                      {(asignados[root.id] ?? []).map((gid) => {
                        const g = generos.find((x) => x.id === gid);
                        return g ? (
                          <span key={gid} className="rounded-full bg-champagne/30 px-2 py-0.5 text-[10px] font-bold text-navy">
                            {g.nombre}
                          </span>
                        ) : null;
                      })}
                      {hasSubs && !isOpen && (
                        <span className="rounded-full bg-line px-2 py-0.5 text-[10px] text-muted">
                          {subItems.length} {subItems.length === 1 ? "tipo" : "tipos"}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-muted">{root.slug}</p>
                  </div>
                </div>
              </TableRow>
            )}

            {/* ── Subcategorías (colapsables) ─────────────────── */}
            {isOpen && subItems.map((sub) => (
              esEditando(sub.id) ? (
                <div key={sub.id} className="ml-8 mt-1">
                  {CatForm}
                </div>
              ) : (
                <TableRow key={sub.id}
                  onDelete={() => del.request(sub.id)} onEdit={() => startEdit(sub)}
                  isConfirmingDelete={del.pendingId === sub.id}
                  onConfirmDelete={() => del.confirm(sub.id)} onCancelDelete={del.cancel}>
                  <div className="ml-8 flex items-center gap-2">
                    <div className="h-px w-4 shrink-0 bg-line" />
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-navy/5">
                      <Tag size={11} className="text-navy/50" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-medium text-ink">{sub.nombre}</p>
                        {(asignados[sub.id] ?? []).map((gid) => {
                          const g = generos.find((x) => x.id === gid);
                          return g ? (
                            <span key={gid} className="rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-semibold text-navy">
                              {g.nombre}
                            </span>
                          ) : null;
                        })}
                      </div>
                      <p className="font-mono text-[10px] text-muted">{sub.slug}</p>
                    </div>
                  </div>
                </TableRow>
              )
            ))}
          </div>
        );
      })}

      {/* categorías sin padre conocido (edge case) */}
      {items
        .filter((c) => c.padre_id !== null && !items.some((r) => r.id === c.padre_id))
        .map((c) => (
          esEditando(c.id) ? CatForm : (
            <TableRow key={c.id}
              onDelete={() => del.request(c.id)} onEdit={() => startEdit(c)}
              isConfirmingDelete={del.pendingId === c.id}
              onConfirmDelete={() => del.confirm(c.id)} onCancelDelete={del.cancel}>
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy/10">
                  <Tag size={13} className="text-navy" />
                </div>
                <p className="text-sm font-semibold text-ink">{c.nombre}</p>
              </div>
            </TableRow>
          )
        ))
      }

      {formOpen === "add" ? CatForm : <AddButton onClick={startAdd} label="Agregar tipo de prenda" />}
    </div>
  );
}

// ─── TAB: Colores ─────────────────────────────────────────────────────────────

function ColoresTab() {
  const [items,  setItems]  = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [editId,  setEditId]  = useState<number | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [nombre,  setNombre]  = useState("");
  const [hex,     setHex]     = useState("#000000");
  const [orden,   setOrden]   = useState("0");

  const load = useCallback(() => {
    getColores().then(setItems).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const del = useConfirmDelete(async (id) => {
    await deleteColor(id).catch(() => {});
    setItems((p) => p.filter((i) => i.id !== id));
  });

  function startAdd() { setAdding(true); setNombre(""); setHex("#000000"); setOrden("0"); setEditId(null); }
  function startEdit(c: Color) { setEditId(c.id); setNombre(c.nombre); setHex(c.hex ?? "#000000"); setOrden(String(c.orden)); setAdding(false); }
  function cancelForm() { setAdding(false); setEditId(null); }

  async function handleSave() {
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateColor(editId, nombre.trim(), hex || null, Number(orden));
        setItems((p) => p.map((i) => i.id === editId ? updated : i));
      } else {
        const created = await createColor(nombre.trim(), hex || null, Number(orden));
        setItems((p) => [...p, created]);
      }
      cancelForm();
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  if (loading) return <TabLoader />;
  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((c) => (
          editId === c.id ? null : (
            <div key={c.id} className="group relative flex items-center gap-2.5 rounded-xl border border-line bg-card p-3 transition hover:border-navy/30 hover:shadow-sm">
              <div
                className="h-9 w-9 shrink-0 rounded-lg border border-line/60 shadow-inner"
                style={{ backgroundColor: c.hex ?? "#e5e7eb" }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{c.nombre}</p>
                <p className="font-mono text-[10px] text-muted">{c.hex ?? "—"}</p>
              </div>
              <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => startEdit(c)}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-sm hover:text-navy">
                  <Pencil size={11} />
                </button>
                <button onClick={() => del.request(c.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-sm hover:text-rose-500">
                  <Trash2 size={11} />
                </button>
              </div>
              {del.pendingId === c.id && (
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-xl bg-white/90 backdrop-blur-sm">
                  <span className="text-[11px] font-semibold text-rose-600">¿Eliminar?</span>
                  <button onClick={() => del.confirm(c.id)}
                    className="rounded-lg bg-rose-500 px-2 py-1 text-[11px] font-bold text-white">Sí</button>
                  <button onClick={del.cancel}
                    className="rounded-lg border border-line px-2 py-1 text-[11px] text-muted">No</button>
                </div>
              )}
            </div>
          )
        ))}
      </div>

      {editId !== null && (
        <InlineForm onSave={handleSave} onCancel={cancelForm} saving={saving}>
          <ColorFormFields nombre={nombre} setNombre={setNombre} hex={hex} setHex={setHex} orden={orden} setOrden={setOrden} />
        </InlineForm>
      )}

      {adding ? (
        <InlineForm onSave={handleSave} onCancel={cancelForm} saving={saving}>
          <ColorFormFields nombre={nombre} setNombre={setNombre} hex={hex} setHex={setHex} orden={orden} setOrden={setOrden} />
        </InlineForm>
      ) : (
        <AddButton onClick={startAdd} label="Agregar color" />
      )}
    </div>
  );
}

function ColorFormFields({ nombre, setNombre, hex, setHex, orden, setOrden }: {
  nombre: string; setNombre: (v: string) => void;
  hex: string;    setHex:    (v: string) => void;
  orden: string;  setOrden:  (v: string) => void;
}) {
  return (
    <>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)}
        className="input-form max-w-48 flex-1" placeholder="Nombre del color" autoFocus />
      <div className="flex items-center gap-2">
        <input type="color" value={hex} onChange={(e) => setHex(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-line bg-surface p-0.5" />
        <input value={hex} onChange={(e) => setHex(e.target.value)}
          className="input-form w-28 font-mono text-xs" placeholder="#000000" />
      </div>
      <input type="number" value={orden} onChange={(e) => setOrden(e.target.value)}
        className="input-form w-20" placeholder="Orden" min="0" />
    </>
  );
}

// ─── TAB: Talles ─────────────────────────────────────────────────────────────

function TallesTab() {
  const [items,  setItems]  = useState<Talle[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [editId,  setEditId]  = useState<number | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [nombre,  setNombre]  = useState("");
  const [orden,   setOrden]   = useState("0");

  const load = useCallback(() => {
    getTalles().then(setItems).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const del = useConfirmDelete(async (id) => {
    await deleteTalle(id).catch(() => {});
    setItems((p) => p.filter((i) => i.id !== id));
  });

  function startAdd() { setAdding(true); setNombre(""); setOrden(String(items.length * 10)); setEditId(null); }
  function startEdit(t: Talle) { setEditId(t.id); setNombre(t.nombre); setOrden(String(t.orden)); setAdding(false); }
  function cancelForm() { setAdding(false); setEditId(null); }

  async function handleSave() {
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateTalle(editId, nombre.trim(), Number(orden));
        setItems((p) => p.map((i) => i.id === editId ? updated : i));
      } else {
        const created = await createTalle(nombre.trim(), Number(orden));
        setItems((p) => [...p, created].sort((a, b) => a.orden - b.orden));
      }
      cancelForm();
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  if (loading) return <TabLoader />;
  return (
    <div className="space-y-1.5">
      <div className="mb-4 flex flex-wrap gap-2">
        {items.map((t) => (
          editId === t.id ? null : (
            <div key={t.id} className="group relative flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 transition hover:border-navy/30">
              <span className="text-sm font-bold text-ink">{t.nombre}</span>
              <span className="text-[10px] text-muted">#{t.orden}</span>
              {del.pendingId === t.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => del.confirm(t.id)}
                    className="rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">✓</button>
                  <button onClick={del.cancel}
                    className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">✕</button>
                </div>
              ) : (
                <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => startEdit(t)}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted hover:text-navy"><Pencil size={10} /></button>
                  <button onClick={() => del.request(t.id)}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted hover:text-rose-500"><Trash2 size={10} /></button>
                </div>
              )}
            </div>
          )
        ))}
      </div>

      {editId !== null && (
        <InlineForm onSave={handleSave} onCancel={cancelForm} saving={saving}>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)}
            className="input-form w-28" placeholder="Ej: XL" autoFocus />
          <input type="number" value={orden} onChange={(e) => setOrden(e.target.value)}
            className="input-form w-20" placeholder="Orden" min="0" />
        </InlineForm>
      )}

      {adding ? (
        <InlineForm onSave={handleSave} onCancel={cancelForm} saving={saving}>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)}
            className="input-form w-28" placeholder="Ej: XL" autoFocus />
          <input type="number" value={orden} onChange={(e) => setOrden(e.target.value)}
            className="input-form w-20" placeholder="Orden" min="0" />
        </InlineForm>
      ) : (
        <AddButton onClick={startAdd} label="Agregar talle" />
      )}
    </div>
  );
}

// ─── TAB: Géneros ────────────────────────────────────────────────────────────

function GenerosTab() {
  const [items,  setItems]  = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [editId,  setEditId]  = useState<number | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [nombre,  setNombre]  = useState("");
  const [slug,    setSlug]    = useState("");

  useEffect(() => {
    getGeneros().then(setItems).finally(() => setLoading(false));
  }, []);

  const del = useConfirmDelete(async (id) => {
    await deleteGenero(id).catch(() => {});
    setItems((p) => p.filter((i) => i.id !== id));
  });

  function startAdd() { setAdding(true); setNombre(""); setSlug(""); setEditId(null); }
  function startEdit(g: Genero) { setEditId(g.id); setNombre(g.nombre); setSlug(g.slug); setAdding(false); }
  function cancelForm() { setAdding(false); setEditId(null); }

  async function handleSave() {
    if (!nombre.trim()) return;
    const s = slug || slugify(nombre);
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateGenero(editId, nombre.trim(), s);
        setItems((p) => p.map((i) => i.id === editId ? updated : i));
      } else {
        const created = await createGenero(nombre.trim(), s);
        setItems((p) => [...p, created]);
      }
      cancelForm();
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  if (loading) return <TabLoader />;
  return (
    <div className="space-y-1.5">
      {items.map((g) => (
        editId === g.id ? (
          <InlineForm key={g.id} onSave={handleSave} onCancel={cancelForm} saving={saving}>
            <input value={nombre} onChange={(e) => { setNombre(e.target.value); setSlug(slugify(e.target.value)); }}
              className="input-form max-w-xs flex-1" placeholder="Nombre" autoFocus />
            <input value={slug} onChange={(e) => setSlug(e.target.value)}
              className="input-form w-36 font-mono text-xs" placeholder="slug" />
          </InlineForm>
        ) : (
          <TableRow key={g.id}
            onDelete={() => del.request(g.id)} onEdit={() => startEdit(g)}
            isConfirmingDelete={del.pendingId === g.id}
            onConfirmDelete={() => del.confirm(g.id)} onCancelDelete={del.cancel}>
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-champagne/20">
                <RotateCcw size={13} className="text-champagne-dark" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{g.nombre}</p>
                <p className="font-mono text-[10px] text-muted">{g.slug}</p>
              </div>
            </div>
          </TableRow>
        )
      ))}

      {adding ? (
        <InlineForm onSave={handleSave} onCancel={cancelForm} saving={saving}>
          <input value={nombre} onChange={(e) => { setNombre(e.target.value); setSlug(slugify(e.target.value)); }}
            className="input-form max-w-xs flex-1" placeholder="Ej: Niños" autoFocus />
          <input value={slug} onChange={(e) => setSlug(e.target.value)}
            className="input-form w-36 font-mono text-xs" placeholder="slug" />
        </InlineForm>
      ) : (
        <AddButton onClick={startAdd} label="Agregar género" />
      )}
    </div>
  );
}

// ─── TAB: Opciones de Envío ───────────────────────────────────────────────────

function EnvioTab() {
  const [items,  setItems]  = useState<OpcionEnvio[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode,    setMode]    = useState<"idle" | "add" | number>("idle");
  const [saving,  setSaving]  = useState(false);

  const EMPTY = { nombre: "", descripcion: "", precio: "", tiempo_estimado: "", gratis_desde: "" };
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    getOpcionesEnvio().then(setItems).finally(() => setLoading(false));
  }, []);

  const del = useConfirmDelete(async (id) => {
    await deleteOpcionEnvio(id).catch(() => {});
    setItems((p) => p.filter((i) => i.id !== id));
  });

  function startEdit(e: OpcionEnvio) {
    setMode(e.id);
    setForm({
      nombre: e.nombre, descripcion: e.descripcion,
      precio: String(e.precio), tiempo_estimado: e.tiempo_estimado,
      gratis_desde: e.gratis_desde != null ? String(e.gratis_desde) : "",
    });
  }

  function startAdd() {
    setMode("add");
    setForm(EMPTY);
  }

  function cancelForm() { setMode("idle"); }

  async function handleSave() {
    if (!form.nombre.trim() || !form.precio) return;
    const data = {
      nombre:          form.nombre.trim(),
      descripcion:     form.descripcion.trim(),
      precio:          Number(form.precio),
      tiempo_estimado: form.tiempo_estimado.trim(),
      gratis_desde:    form.gratis_desde ? Number(form.gratis_desde) : null,
    };
    setSaving(true);
    try {
      if (typeof mode === "number") {
        const updated = await updateOpcionEnvio(mode, data);
        setItems((p) => p.map((i) => i.id === mode ? updated : i));
      } else {
        const created = await createOpcionEnvio(data);
        setItems((p) => [...p, created]);
      }
      cancelForm();
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  function f(field: keyof typeof EMPTY) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  const formFields = (
    <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
      <input value={form.nombre} onChange={f("nombre")} className="input-form col-span-2 sm:col-span-1" placeholder="Nombre" autoFocus />
      <input value={form.descripcion} onChange={f("descripcion")} className="input-form col-span-2 sm:col-span-1" placeholder="Descripción" />
      <input value={form.tiempo_estimado} onChange={f("tiempo_estimado")} className="input-form" placeholder="Tiempo estimado" />
      <input type="number" value={form.precio} onChange={f("precio")} className="input-form" placeholder="Precio $" min="0" />
      <input type="number" value={form.gratis_desde} onChange={f("gratis_desde")} className="input-form" placeholder="Gratis desde $" min="0" />
    </div>
  );

  if (loading) return <TabLoader />;
  return (
    <div className="space-y-2">
      {items.map((e) => (
        typeof mode === "number" && mode === e.id ? (
          <InlineForm key={e.id} onSave={handleSave} onCancel={cancelForm} saving={saving}>
            {formFields}
          </InlineForm>
        ) : (
          <TableRow key={e.id}
            onDelete={() => del.request(e.id)} onEdit={() => startEdit(e)}
            isConfirmingDelete={del.pendingId === e.id}
            onConfirmDelete={() => del.confirm(e.id)} onCancelDelete={del.cancel}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex items-center gap-2">
                <Truck size={14} className="shrink-0 text-navy/50" />
                <span className="font-semibold text-ink">{e.nombre}</span>
              </div>
              <span className="font-bold text-navy">{fmt(e.precio)}</span>
              {e.gratis_desde != null && (
                <span className="text-xs text-emerald-600">Gratis desde {fmt(e.gratis_desde)}</span>
              )}
              {e.tiempo_estimado && (
                <span className="text-xs text-muted">{e.tiempo_estimado}</span>
              )}
            </div>
          </TableRow>
        )
      ))}

      {mode === "add" ? (
        <InlineForm onSave={handleSave} onCancel={cancelForm} saving={saving}>
          {formFields}
        </InlineForm>
      ) : (
        <AddButton onClick={startAdd} label="Agregar opción de envío" />
      )}
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function TabLoader() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-navy border-t-transparent" />
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-xl border border-dashed border-line px-4 py-3 text-sm font-semibold text-muted transition hover:border-navy/40 hover:text-navy"
    >
      <Plus size={15} /> {label}
    </button>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminCatalogsPage() {
  const [tab, setTab] = useState<TabId>("categorias");

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-black text-ink">Catálogos</h1>
        <p className="mt-1 text-sm text-muted">
          Configurá los tipos de prenda, colores, talles y opciones de envío que usa tu tienda.
        </p>
      </div>

      {/* Tab strip */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-line">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={[
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition -mb-px",
              tab === id
                ? "border-navy text-navy"
                : "border-transparent text-muted hover:text-ink",
            ].join(" ")}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Descripción de pestaña activa */}
      <p className="mb-4 text-xs text-muted">
        {TABS.find((t) => t.id === tab)?.desc}
      </p>

      {/* Contenido */}
      <div className="rounded-2xl bg-card p-5 shadow-sm">
        {tab === "marcas"     && <MarcasTab />}
        {tab === "categorias" && <CategoriasTab />}
        {tab === "colores"    && <ColoresTab />}
        {tab === "talles"     && <TallesTab />}
        {tab === "generos"    && <GenerosTab />}
        {tab === "envio"      && <EnvioTab />}
      </div>
    </div>
  );
}
