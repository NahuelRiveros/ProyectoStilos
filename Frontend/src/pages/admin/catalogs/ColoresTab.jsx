import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  getColores, createColor, updateColor, deleteColor,
} from "../../../api/catalogo_api";
import { useConfirmDelete, CatalogForm, AddButton, TabLoader } from "./catalog_shared";

// Swatch circular — el elemento visual distintivo de esta sección
function ColorSwatch({ color, onEdit, onDelete, isPending, onConfirm, onCancel }) {
  return (
    <div className="group relative flex flex-col items-center gap-2 p-3 rounded-xl border border-line bg-card transition-all hover:border-navy/30 hover:shadow-md hover:-translate-y-0.5">
      {/* Círculo de color */}
      <div
        className="h-14 w-14 rounded-full border-2 border-white shadow-md ring-1 ring-line/60"
        style={{ backgroundColor: color.hex ?? "#e5e7eb" }}
      />

      {/* Nombre y código hex */}
      <div className="text-center w-full min-w-0">
        <p className="text-xs font-semibold text-ink truncate">{color.nombre}</p>
        <p className="font-mono text-[9px] text-muted uppercase tracking-wider">
          {color.hex ?? "—"}
        </p>
      </div>

      {/* Acciones */}
      <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-card shadow-sm text-muted hover:text-navy transition-colors"
        >
          <Pencil size={10} />
        </button>
        <button
          onClick={onDelete}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-card shadow-sm text-muted hover:text-rose-500 transition-colors"
        >
          <Trash2 size={10} />
        </button>
      </div>

      {/* Overlay de confirmación */}
      {isPending && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-card/90 backdrop-blur-sm rounded-xl">
          <span className="text-[10px] font-bold text-rose-600">¿Eliminar?</span>
          <div className="flex gap-1">
            <button onClick={onConfirm} className="rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
              Sí
            </button>
            <button onClick={onCancel} className="rounded-md border border-line px-2 py-0.5 text-[10px] text-muted">
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ColoresTab() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [editId,  setEditId]  = useState(null);
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

  function startAdd()  { setAdding(true); setNombre(""); setHex("#000000"); setOrden("0"); setEditId(null); }
  function startEdit(c) { setEditId(c.id); setNombre(c.nombre); setHex(c.hex ?? "#000000"); setOrden(String(c.orden)); setAdding(false); }
  function cancelForm() { setAdding(false); setEditId(null); }

  async function handleSave() {
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateColor(editId, nombre.trim(), hex || null, Number(orden));
        setItems((p) => p.map((i) => (i.id === editId ? updated : i)));
      } else {
        const created = await createColor(nombre.trim(), hex || null, Number(orden));
        setItems((p) => [...p, created]);
      }
      cancelForm();
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  const formFields = (
    <>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="input-form max-w-40 flex-1"
        placeholder="Nombre del color"
        autoFocus
      />
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="h-9 w-11 cursor-pointer rounded-lg border border-line bg-surface p-0.5"
          title="Elegir color"
        />
        <input
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="input-form w-28 font-mono text-xs uppercase"
          placeholder="#000000"
        />
      </div>
      <input
        type="number"
        value={orden}
        onChange={(e) => setOrden(e.target.value)}
        className="input-form w-20"
        placeholder="Orden"
        min="0"
      />
    </>
  );

  if (loading) return <TabLoader />;
  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {items.map((c) =>
          editId === c.id ? null : (
            <ColorSwatch
              key={c.id}
              color={c}
              onEdit={() => startEdit(c)}
              onDelete={() => del.request(c.id)}
              isPending={del.pendingId === c.id}
              onConfirm={() => del.confirm(c.id)}
              onCancel={del.cancel}
            />
          )
        )}
      </div>

      {editId !== null && (
        <CatalogForm onSave={handleSave} onCancel={cancelForm} saving={saving}>
          {formFields}
        </CatalogForm>
      )}

      {adding ? (
        <CatalogForm onSave={handleSave} onCancel={cancelForm} saving={saving}>
          {formFields}
        </CatalogForm>
      ) : (
        <AddButton onClick={startAdd} label="Agregar color" />
      )}
    </div>
  );
}
