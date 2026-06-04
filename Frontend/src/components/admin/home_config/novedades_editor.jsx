import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { getProductos } from "../../../api/producto_api";
function NovedadesEditor({
  selectedIds,
  onChange
}) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  useEffect(() => {
    getProductos({ orden: "novedad", limit: 60 }).then(({ productos: productos2 }) => setProductos(productos2)).catch(() => setProductos([])).finally(() => setLoading(false));
  }, []);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q)
    );
  }, [productos, search]);
  const selectedProducts = useMemo(
    () => selectedIds.map((id) => productos.find((p) => p.id === id)).filter(Boolean),
    [selectedIds, productos]
  );
  function toggle(producto) {
    if (selectedIds.includes(producto.id)) {
      onChange(selectedIds.filter((id) => id !== producto.id));
    } else if (selectedIds.length < 4) {
      onChange([...selectedIds, producto.id]);
    }
  }
  function getImage(p) {
    const img = p.imagenes[0];
    return typeof img === "string" ? img : img?.src ?? "";
  }
  return <div className="space-y-5">
      <p className="text-xs text-muted">
        Elegí hasta <strong>4 productos</strong> que aparecerán en la sección "Lo más nuevo".
        Si no seleccionás ninguno, se muestran automáticamente los últimos agregados al sistema.
      </p>

      {selectedProducts.length > 0 && <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">
            Seleccionados ({selectedProducts.length}/4)
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {selectedProducts.map((p, i) => <div key={p.id} className="relative overflow-hidden rounded-xl border-2 border-navy bg-card">
                <div className="relative aspect-[3/4]">
                  {getImage(p) ? <img src={getImage(p)} alt={p.nombre} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-surface" />}
                  <div className="absolute inset-0 bg-linear-to-t from-navy/80 to-transparent" />
                  <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-navy text-[10px] font-black text-white">{i + 1}</span>
                </div>
                <div className="px-2 pb-2 pt-1.5">
                  <p className="line-clamp-1 text-[11px] font-bold text-ink">{p.nombre}</p>
                  <p className="text-[10px] text-muted">{p.categoria}</p>
                </div>
                <button
    type="button"
    onClick={() => toggle(p)}
    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow hover:bg-rose-600 transition-colors"
  >
                  <X size={11} />
                </button>
              </div>)}
          </div>
        </div>}

      {selectedIds.length < 4 && <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">
            Agregar producto
          </p>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Buscar por nombre o categoría…"
    className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted/60 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/20"
  />
          </div>

          {loading ? <p className="py-4 text-center text-xs text-muted">Cargando productos…</p> : <div className="max-h-72 overflow-y-auto rounded-xl border border-line divide-y divide-line">
              {filtered.filter((p) => !selectedIds.includes(p.id)).slice(0, 30).map((p) => <button
    key={p.id}
    type="button"
    onClick={() => toggle(p)}
    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface/60 transition-colors"
  >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface border border-line">
                    {getImage(p) ? <img src={getImage(p)} alt={p.nombre} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{p.nombre}</p>
                    <p className="text-[11px] text-muted">{p.categoria} · #{p.id}</p>
                  </div>
                  <div className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-[11px] font-bold text-navy hover:bg-navy hover:text-white transition-colors">
                    + Agregar
                  </div>
                </button>)}
              {filtered.filter((p) => !selectedIds.includes(p.id)).length === 0 && <p className="py-4 text-center text-xs text-muted">Sin resultados</p>}
            </div>}
        </div>}

      {selectedIds.length >= 4 && <p className="rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-2.5 text-xs font-semibold text-ink">
          Máximo de 4 productos alcanzado. Quitá uno para agregar otro.
        </p>}

      {selectedIds.length > 0 && <button
    type="button"
    onClick={() => onChange([])}
    className="text-xs text-muted underline underline-offset-2 hover:text-ink transition-colors"
  >
          Limpiar selección (volver a automático)
        </button>}
    </div>;
}
export {
  NovedadesEditor
};
