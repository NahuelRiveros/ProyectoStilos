import { useState, useEffect, useCallback } from "react";
import { Tag, ChevronDown } from "lucide-react";
import { useToast } from "../../../context/toast_context";
import {
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  getCategoriaGeneros, setCategoriaGeneros,
  getGeneros,
} from "../../../api/catalogo_api";
import { slugify, useConfirmDelete, CatalogRow, AddButton, TabLoader } from "./catalog_shared";

export default function CategoriasTab() {
  const [items,     setItems]     = useState([]);
  const [generos,   setGeneros]   = useState([]);
  const [asignados, setAsignados] = useState({});
  const [loading,   setLoading]   = useState(true);
  const [formOpen,  setFormOpen]  = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [collapsed, setCollapsed] = useState(new Set());
  const toast = useToast();

  const [nombre,     setNombre]     = useState("");
  const [slug,       setSlug]       = useState("");
  const [padreId,    setPadreId]    = useState("");
  const [selGeneros, setSelGeneros] = useState([]);

  const load = useCallback(async () => {
    const [cats, gens] = await Promise.all([getCategorias(), getGeneros()]);
    setItems(cats);
    setGeneros(gens);
    const entries = await Promise.all(
      cats.map(async (c) => [c.id, await getCategoriaGeneros(c.id)])
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
    } catch (err) {
      toast.error(err?.response?.data?.mensaje ?? "No se pudo eliminar");
    }
  });

  function resetForm() { setNombre(""); setSlug(""); setPadreId(""); setSelGeneros([]); }
  function startAdd()  { resetForm(); setFormOpen("add"); }
  function startEdit(c) {
    setNombre(c.nombre); setSlug(c.slug);
    setPadreId(c.padre_id ?? "");
    setSelGeneros(asignados[c.id] ?? []);
    setFormOpen(c.id);
  }
  function cancelForm() { setFormOpen(null); }

  function toggleGenero(gid) {
    setSelGeneros((prev) =>
      prev.includes(gid) ? prev.filter((id) => id !== gid) : [...prev, gid]
    );
  }

  function toggleCollapse(id) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSave() {
    if (!nombre.trim()) return;
    const s = slug || slugify(nombre);
    const padre = padreId === "" ? null : Number(padreId);
    setSaving(true);
    try {
      if (typeof formOpen === "number") {
        const updated = await updateCategoria(formOpen, nombre.trim(), s, padre);
        setItems((p) => p.map((i) => (i.id === formOpen ? updated : i)));
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

  const raices  = items.filter((c) => c.padre_id === null).sort((a, b) => a.nombre.localeCompare(b.nombre));
  const subs    = (parentId) => items.filter((c) => c.padre_id === parentId).sort((a, b) => a.nombre.localeCompare(b.nombre));
  const huerfanas = items.filter((c) => c.padre_id !== null && !items.some((r) => r.id === c.padre_id));

  // Formulario compartido (se renderiza en contexto)
  function CatForm() {
    const disponibles = padreId === ""
      ? generos
      : generos.filter((g) => (asignados[Number(padreId)] ?? []).includes(g.id));

    return (
      <div className="space-y-3 rounded-xl border border-navy/20 bg-card shadow-sm px-4 py-4 animate-in fade-in slide-in-from-bottom-1 duration-150">
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

        <div className="flex flex-wrap items-center gap-2">
          <label className="w-28 shrink-0 text-xs font-semibold text-muted">Subcategoría de</label>
          <select
            value={padreId}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Number(e.target.value);
              setPadreId(val);
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
              .map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)
            }
          </select>
        </div>

        {disponibles.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="w-28 shrink-0 text-xs font-semibold text-muted">Aparece en</label>
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
        ) : padreId !== "" ? (
          <p className="text-[11px] text-muted italic">
            El padre aún no tiene géneros asignados. Asignalos primero.
          </p>
        ) : null}

        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-navy px-3 text-xs font-bold text-surface hover:bg-navy/90 disabled:opacity-60 transition-colors"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <button
            onClick={cancelForm}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:border-navy/30 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <TabLoader />;
  return (
    <div className="space-y-1">
      {raices.map((root) => {
        const subItems = subs(root.id);
        const hasSubs  = subItems.length > 0;
        const isOpen   = !collapsed.has(root.id);

        return (
          <div key={root.id}>
            {formOpen === root.id ? <CatForm /> : (
              <CatalogRow
                onDelete={() => del.request(root.id)}
                onEdit={() => startEdit(root)}
                isConfirmingDelete={del.pendingId === root.id}
                onConfirmDelete={() => del.confirm(root.id)}
                onCancelDelete={del.cancel}
              >
                <div className="flex items-center gap-2">
                  {hasSubs ? (
                    <button
                      onClick={() => toggleCollapse(root.id)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted hover:bg-navy/10 hover:text-navy transition-colors"
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
              </CatalogRow>
            )}

            {/* Subcategorías con línea conectora */}
            {isOpen && hasSubs && (
              <div className="ml-14 pl-3 border-l border-line space-y-0.5 my-0.5">
                {subItems.map((sub) =>
                  formOpen === sub.id ? (
                    <div key={sub.id}><CatForm /></div>
                  ) : (
                    <CatalogRow
                      key={sub.id}
                      onDelete={() => del.request(sub.id)}
                      onEdit={() => startEdit(sub)}
                      isConfirmingDelete={del.pendingId === sub.id}
                      onConfirmDelete={() => del.confirm(sub.id)}
                      onCancelDelete={del.cancel}
                    >
                      <div className="flex items-center gap-2">
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
                    </CatalogRow>
                  )
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Categorías con padre perdido */}
      {huerfanas.map((c) =>
        formOpen === c.id ? <CatForm key={c.id} /> : (
          <CatalogRow
            key={c.id}
            onDelete={() => del.request(c.id)}
            onEdit={() => startEdit(c)}
            isConfirmingDelete={del.pendingId === c.id}
            onConfirmDelete={() => del.confirm(c.id)}
            onCancelDelete={del.cancel}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy/10">
                <Tag size={13} className="text-navy" />
              </div>
              <p className="text-sm font-semibold text-ink">{c.nombre}</p>
            </div>
          </CatalogRow>
        )
      )}

      {formOpen === "add" ? <CatForm /> : <AddButton onClick={startAdd} label="Agregar tipo de prenda" />}
    </div>
  );
}
