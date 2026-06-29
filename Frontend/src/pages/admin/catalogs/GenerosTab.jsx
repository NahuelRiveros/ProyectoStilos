import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import {
  getGeneros, createGenero, updateGenero, deleteGenero,
} from "../../../api/catalogo_api";
import { slugify, useConfirmDelete, CatalogRow, CatalogForm, AddButton, TabLoader } from "./catalog_shared";

export default function GenerosTab() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [editId,  setEditId]  = useState(null);
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

  function startAdd()  { setAdding(true); setNombre(""); setSlug(""); setEditId(null); }
  function startEdit(g) { setEditId(g.id); setNombre(g.nombre); setSlug(g.slug); setAdding(false); }
  function cancelForm() { setAdding(false); setEditId(null); }

  async function handleSave() {
    if (!nombre.trim()) return;
    const s = slug || slugify(nombre);
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateGenero(editId, nombre.trim(), s);
        setItems((p) => p.map((i) => (i.id === editId ? updated : i)));
      } else {
        const created = await createGenero(nombre.trim(), s);
        setItems((p) => [...p, created]);
      }
      cancelForm();
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  const formFields = (
    <>
      <input
        value={nombre}
        onChange={(e) => { setNombre(e.target.value); setSlug(slugify(e.target.value)); }}
        className="input-form max-w-xs flex-1"
        placeholder="Ej: Niños"
        autoFocus
      />
      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="input-form w-36 font-mono text-xs"
        placeholder="slug"
      />
    </>
  );

  if (loading) return <TabLoader />;
  return (
    <div className="space-y-1">
      {items.map((g) =>
        editId === g.id ? (
          <CatalogForm key={g.id} onSave={handleSave} onCancel={cancelForm} saving={saving}>
            {formFields}
          </CatalogForm>
        ) : (
          <CatalogRow
            key={g.id}
            onDelete={() => del.request(g.id)}
            onEdit={() => startEdit(g)}
            isConfirmingDelete={del.pendingId === g.id}
            onConfirmDelete={() => del.confirm(g.id)}
            onCancelDelete={del.cancel}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-champagne/20">
                <Users size={13} className="text-champagne-dark" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{g.nombre}</p>
                <p className="font-mono text-[10px] text-muted">{g.slug}</p>
              </div>
            </div>
          </CatalogRow>
        )
      )}

      {adding ? (
        <CatalogForm onSave={handleSave} onCancel={cancelForm} saving={saving}>
          {formFields}
        </CatalogForm>
      ) : (
        <AddButton onClick={startAdd} label="Agregar género" />
      )}
    </div>
  );
}
