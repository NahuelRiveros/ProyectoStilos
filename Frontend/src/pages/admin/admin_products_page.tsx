import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, RefreshCw, Trash2, Package, X, SlidersHorizontal } from "lucide-react";
import { getProductos, type Producto } from "../../api/producto_api";
import { getMarcas, getCategorias, getGeneros, type Marca, type Categoria, type Genero } from "../../api/catalogo_api";
import { http } from "../../api/http";
import DataGrid from "../../components/data/data_grid";
import { AdminPageHeader } from "../../components/admin";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `$ ${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

const BADGE_COLORS: Record<string, string> = {
  nuevo:   "bg-navy/10 text-navy",
  vuelve:  "bg-champagne/20 text-ink",
  agotado: "bg-line text-muted",
};

const HOME_SECCION_COLORS: Record<string, string> = {
  carousel:  "bg-violet-100 text-violet-700",
  novedades: "bg-emerald-100 text-emerald-700",
};

const HOME_SECCION_LABELS: Record<string, string> = {
  carousel:  "Carrusel",
  novedades: "Novedades",
};

// ─── Tipo de fila para DataGrid ───────────────────────────────────────────────

type ProductoRow = Record<string, unknown> & {
  _id:           number;
  _imagen:       string | null;
  _badge:        string | null;
  _home_seccion: string | null;
  nombre:        string;
  categoria:     string;
  genero:        string;
  marca:         string;
  precio:        number;
  stock:         number;
  estado:        string;
};

function toRow(p: Producto): ProductoRow {
  const img = p.imagenes?.[0];
  const imgSrc = typeof img === "string" ? img : (img as { src: string } | undefined)?.src ?? null;
  return {
    _id:           p.id,
    _imagen:       imgSrc,
    _badge:        p.badge ?? null,
    _home_seccion: p.home_seccion ?? null,
    nombre:        p.nombre,
    categoria:     p.categoria,
    genero:        p.genero ?? "",
    marca:         p.marca ?? "",
    precio:        p.precio,
    stock:         p.stock,
    estado:        p.badge ?? "",
  };
}

// ─── Columnas ─────────────────────────────────────────────────────────────────

const COLUMNS = [
  {
    key:      "nombre",
    label:    "Producto",
    sortable: true,
    render:   (row: ProductoRow) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-8 shrink-0 overflow-hidden rounded-lg bg-surface">
          {row._imagen ? (
            <img src={row._imagen} alt={row.nombre} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package size={14} className="text-muted/30" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <span className="block font-semibold text-ink line-clamp-1">{row.nombre}</span>
          {row._home_seccion && (
            <span className={[
              "mt-0.5 inline-block rounded-full px-1.5 py-px text-[9px] font-bold uppercase tracking-wide",
              HOME_SECCION_COLORS[row._home_seccion] ?? "bg-line text-muted",
            ].join(" ")}>
              {HOME_SECCION_LABELS[row._home_seccion] ?? row._home_seccion}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    key:      "categoria",
    label:    "Categoría",
    sortable: true,
  },
  {
    key:      "genero",
    label:    "Género",
    sortable: true,
    render:   (_row: ProductoRow, value: string) =>
      value ? <span>{value}</span> : <span className="text-muted/40">—</span>,
  },
  {
    key:      "marca",
    label:    "Marca",
    sortable: true,
    render:   (_row: ProductoRow, value: string) =>
      value ? <span>{value}</span> : <span className="text-muted/40">—</span>,
  },
  {
    key:             "precio",
    label:           "Precio",
    sortable:        true,
    headerClassName: "text-right",
    className:       "text-right font-bold text-ink",
    render:          (_row: ProductoRow, value: string) => fmt(Number(value)),
  },
  {
    key:             "stock",
    label:           "Stock",
    sortable:        true,
    headerClassName: "text-center",
    className:       "text-center",
    render:          (_row: ProductoRow, value: string) => (
      <span className={Number(value) === 0 ? "font-bold text-rose-500" : "text-ink"}>
        {value}
      </span>
    ),
  },
  {
    key:             "estado",
    label:           "Estado",
    sortable:        false,
    searchable:      false,
    headerClassName: "text-center",
    className:       "text-center",
    render:          (_row: ProductoRow, value: string) =>
      value ? (
        <span className={[
          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
          BADGE_COLORS[value] ?? "bg-line text-muted",
        ].join(" ")}>
          {value}
        </span>
      ) : (
        <span className="text-xs font-semibold text-emerald-600">Activo</span>
      ),
  },
] as const;

// ─── Filtros activos (para el chip de "N filtros") ────────────────────────────

interface Filtros {
  marca:        string;
  categoria:    string;
  genero:       string;
  badge:        string;
  homeSec:      string;
}

const FILTROS_VACIOS: Filtros = { marca: "", categoria: "", genero: "", badge: "", homeSec: "" };

function countFiltros(f: Filtros) {
  return Object.values(f).filter(Boolean).length;
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [productos,   setProductos]   = useState<Producto[]>([]);
  const [marcas,      setMarcas]      = useState<Marca[]>([]);
  const [categorias,  setCategorias]  = useState<Categoria[]>([]);
  const [generos,     setGeneros]     = useState<Genero[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filtros,     setFiltros]     = useState<Filtros>(FILTROS_VACIOS);
  const [showFiltros, setShowFiltros] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ productos: prods }, marcasList, catsList, genList] = await Promise.all([
        getProductos({ limit: 1000 }),
        getMarcas(),
        getCategorias(),
        getGeneros(),
      ]);
      setProductos(prods);
      setMarcas(marcasList);
      setCategorias(catsList);
      setGeneros(genList);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleBaja(row: Record<string, unknown>) {
    const r = row as ProductoRow;
    if (!confirm(`¿Dar de baja "${r.nombre}"?`)) return;
    await http.delete(`/productos/${r._id}`);
    load();
  }

  async function handleReactivar(row: Record<string, unknown>) {
    const r = row as ProductoRow;
    await http.put(`/productos/${r._id}/reactivar`);
    load();
  }

  function setFiltro<K extends keyof Filtros>(k: K, v: string) {
    setFiltros(prev => ({ ...prev, [k]: v }));
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_VACIOS);
  }

  // Filtrado client-side
  const rows: ProductoRow[] = productos
    .filter(p => {
      if (filtros.marca     && (p.marca   ?? "") !== filtros.marca)     return false;
      if (filtros.categoria && p.categoria        !== filtros.categoria) return false;
      if (filtros.genero    && (p.genero  ?? "") !== filtros.genero)    return false;
      if (filtros.badge) {
        if (filtros.badge === "activo" && p.badge !== null)              return false;
        if (filtros.badge !== "activo" && p.badge !== filtros.badge)     return false;
      }
      if (filtros.homeSec) {
        if (filtros.homeSec === "ninguna" && p.home_seccion !== null)    return false;
        if (filtros.homeSec !== "ninguna" && p.home_seccion !== filtros.homeSec) return false;
      }
      return true;
    })
    .map(toRow);

  const totalFiltros = countFiltros(filtros);

  // Solo categorías raíz para el select (sin subcategorías para simplificar)
  const categoriasRaiz = categorias.filter(c => c.padre_id === null);

  const actions = [
    {
      key:      "edit",
      label:    "Editar",
      icon:     Edit2,
      variant:  "ghost" as const,
      iconOnly: true,
      onClick:  (row: Record<string, unknown>) =>
        navigate(`/admin/productos/${(row as ProductoRow)._id}/editar`),
    },
    {
      key:      "reactivar",
      label:    "Reactivar",
      icon:     RefreshCw,
      variant:  "ghost" as const,
      iconOnly: true,
      hidden:   (row: Record<string, unknown>) => (row as ProductoRow)._badge !== "agotado",
      onClick:  handleReactivar,
    },
    {
      key:      "baja",
      label:    "Dar de baja",
      icon:     Trash2,
      variant:  "danger" as const,
      iconOnly: true,
      hidden:   (row: Record<string, unknown>) => (row as ProductoRow)._badge === "agotado",
      onClick:  handleBaja,
    },
  ];

  return (
    <div className="p-6 lg:p-8">

      <AdminPageHeader
        title="Productos"
        subtitle={
          rows.length !== productos.length
            ? `${rows.length} de ${productos.length} producto${productos.length !== 1 ? "s" : ""}`
            : `${productos.length} producto${productos.length !== 1 ? "s" : ""} en total`
        }
        action={
          <button
            onClick={() => navigate("/admin/productos/nuevo")}
            className="flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white hover:bg-navy/90"
          >
            <Plus size={16} /> Nuevo producto
          </button>
        }
      />

      {/* ── Barra de filtros ───────────────────────────────────────────────── */}
      <div className="mb-4 space-y-3">

        {/* Fila principal: toggle + chips de activos */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFiltros(v => !v)}
            className={[
              "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
              showFiltros || totalFiltros > 0
                ? "border-navy/30 bg-navy/8 text-navy"
                : "border-line bg-card text-muted hover:border-navy/30 hover:text-ink",
            ].join(" ")}
          >
            <SlidersHorizontal size={14} />
            Filtros
            {totalFiltros > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy text-[10px] font-black text-white">
                {totalFiltros}
              </span>
            )}
          </button>

          {/* Chips de filtros activos */}
          {filtros.marca && (
            <FiltroChip label={`Marca: ${filtros.marca}`} onRemove={() => setFiltro("marca", "")} />
          )}
          {filtros.categoria && (
            <FiltroChip label={`Categoría: ${filtros.categoria}`} onRemove={() => setFiltro("categoria", "")} />
          )}
          {filtros.genero && (
            <FiltroChip label={`Género: ${filtros.genero}`} onRemove={() => setFiltro("genero", "")} />
          )}
          {filtros.badge && (
            <FiltroChip
              label={`Estado: ${{ activo: "Activo", nuevo: "Nuevo", vuelve: "Vuelve", agotado: "Agotado" }[filtros.badge] ?? filtros.badge}`}
              onRemove={() => setFiltro("badge", "")}
            />
          )}
          {filtros.homeSec && (
            <FiltroChip
              label={`Home: ${{ carousel: "Carrusel", novedades: "Novedades", ninguna: "Sin sección" }[filtros.homeSec] ?? filtros.homeSec}`}
              onRemove={() => setFiltro("homeSec", "")}
            />
          )}
          {totalFiltros > 1 && (
            <button
              onClick={limpiarFiltros}
              className="text-xs text-muted underline underline-offset-2 hover:text-navy"
            >
              Limpiar todos
            </button>
          )}
        </div>

        {/* Panel de filtros expandible */}
        {showFiltros && (
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-card p-4 sm:grid-cols-3 lg:grid-cols-5">

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Categoría</label>
              <select
                value={filtros.categoria}
                onChange={e => setFiltro("categoria", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-ink focus:border-navy focus:outline-none"
              >
                <option value="">Todas</option>
                {categoriasRaiz
                  .sort((a, b) => a.nombre.localeCompare(b.nombre))
                  .map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Género</label>
              <select
                value={filtros.genero}
                onChange={e => setFiltro("genero", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-ink focus:border-navy focus:outline-none"
              >
                <option value="">Todos</option>
                {generos.map(g => <option key={g.id} value={g.nombre}>{g.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Marca</label>
              <select
                value={filtros.marca}
                onChange={e => setFiltro("marca", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-ink focus:border-navy focus:outline-none"
              >
                <option value="">Todas</option>
                {marcas.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Estado</label>
              <select
                value={filtros.badge}
                onChange={e => setFiltro("badge", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-ink focus:border-navy focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="nuevo">Nuevo</option>
                <option value="vuelve">Vuelve</option>
                <option value="agotado">Agotado</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Sección home</label>
              <select
                value={filtros.homeSec}
                onChange={e => setFiltro("homeSec", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-ink focus:border-navy focus:outline-none"
              >
                <option value="">Todas</option>
                <option value="carousel">Carrusel</option>
                <option value="novedades">Novedades</option>
                <option value="ninguna">Sin sección</option>
              </select>
            </div>

          </div>
        )}
      </div>

      {/* ── Tabla ──────────────────────────────────────────────────────────── */}
      <DataGrid
        rows={rows as unknown as Record<string, unknown>[]}
        columns={COLUMNS as unknown as Parameters<typeof DataGrid>[0]["columns"]}
        keyField="_id"
        loading={loading}
        searchable
        searchPlaceholder="Buscar por nombre, categoría o marca..."
        searchColumns={["nombre", "categoria", "marca"]}
        actions={actions}
        emptyMessage={
          totalFiltros > 0
            ? "Ningún producto coincide con los filtros aplicados"
            : "No se encontraron productos"
        }
      />
    </div>
  );
}

// ─── Chip de filtro activo ────────────────────────────────────────────────────

function FiltroChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-navy/20 bg-navy/8 px-2.5 py-1 text-xs font-semibold text-navy">
      {label}
      <button onClick={onRemove} className="ml-0.5 rounded-full p-0.5 hover:bg-navy/20">
        <X size={10} />
      </button>
    </span>
  );
}
