import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  getTalles, createTalle, updateTalle, deleteTalle,
} from "../../../api/catalogo_api";
import { useConfirmDelete, CatalogForm, AddButton, TabLoader } from "./catalog_shared";

export default function TallesTab() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [editId,  setEditId]  = useState(null);
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

  function startAdd()  { setAdding(true); setNombre(""); setOrden(String(items.length * 10)); setEditId(null); }
  function startEdit(t) { setEditId(t.id); setNombre(t.nombre); setOrden(String(t.orden)); setAdding(false); }
  function cancelForm() { setAdding(false); setEditId(null); }

  async function handleSave() {
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateTalle(editId, nombre.trim(), Number(orden));
        setItems((p) => p.map((i) => (i.id === editId ? updated : i)));
      } else {
        const created = await createTalle(nombre.trim(), Number(orden));
        setItems((p) => [...p, created].sort((a, b) => a.orden - b.orden));
      }
      cancelForm();
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  if (loading) return <TabLoader />;
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {items.map((t) =>
          editId === t.id ? null : (
            <div
              key={t.id}
              className="group relative flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 transition-all hover:border-navy/40 hover:shadow-sm"
            >
              <span className="text-sm font-black text-ink">{t.nombre}</span>

              {del.pendingId === t.id ? (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => del.confirm(t.id)}
                    className="rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
                  >
                    ✓
                  </button>
                  <button
                    onClick={del.cancel}
                    className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => startEdit(t)}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted hover:text-navy transition-colors"
                  >
                    <Pencil size={10} />
                  </button>
                  <button
                    onClick={() => del.request(t.id)}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {editId !== null && (
        <CatalogForm onSave={handleSave} onCancel={cancelForm} saving={saving}>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="input-form w-28"
            placeholder="Ej: XL"
            autoFocus
          />
          <input
            type="number"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="input-form w-20"
            placeholder="Orden"
            min="0"
          />
        </CatalogForm>
      )}

      {adding ? (
        <CatalogForm onSave={handleSave} onCancel={cancelForm} saving={saving}>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="input-form w-28"
            placeholder="Ej: XL"
            autoFocus
          />
          <input
            type="number"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="input-form w-20"
            placeholder="Orden"
            min="0"
          />
        </CatalogForm>
      ) : (
        <AddButton onClick={startAdd} label="Agregar talle" />
      )}
    </div>
  );
}
