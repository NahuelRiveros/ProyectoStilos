import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, RefreshCw, Trash2, Package, X, SlidersHorizontal, Search } from "lucide-react";
import { getProductos } from "../../api/producto_api";
import { getMarcas, getCategorias, getGeneros } from "../../api/catalogo_api";
import { http } from "../../api/http";
import DataGrid from "../../components/data/data_grid";
import { AdminPageHeader } from "../../components/admin";
import { useAuth } from "../../auth/auth_context";

const fmt = (n) =>
  `$ ${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

const BADGE_COLORS = {
  nuevo:   "bg-navy/10 text-navy",
  vuelve:  "bg-champagne/20 text-ink",
  agotado: "bg-line text-muted",
};

const HOME_SECCION_COLORS = {
  carousel:  "bg-violet-100 text-violet-700",
  novedades: "bg-emerald-100 text-emerald-700",
};

const HOME_SECCION_LABELS = {
  carousel:  "Carrusel",
  novedades: "Novedades",
};

function toRow(p) {
  const img = p.imagenes?.[0];
  const imgSrc = typeof img === "string" ? img : img?.src ?? null;
  return {
    _id:           p.id,
    _imagen:       imgSrc,
    _badge:        p.badge ?? null,
    _home_seccion: p.home_seccion ?? null,
    nombre:        p.nombre,
    codigo_ref:    p.codigo_ref ?? "",
    categoria:     p.categoria,
    genero:        p.genero ?? "",
    marca:         p.marca ?? "",
    precio:        p.precio,
    stock:         p.stock,
    estado:        p.badge ?? "",
  };
}

const COLUMNS = [
  {
    key:      "nombre",
    label:    "Producto",
    sortable: true,
    render:   (row) => (
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
          <div className="mt-0.5 flex flex-wrap items-center gap-1">
            {row.codigo_ref && (
              <span className="inline-block rounded bg-surface border border-line px-1.5 py-px font-mono text-[9px] font-semibold text-muted">
                {row.codigo_ref}
              </span>
            )}
            {row._home_seccion && (
              <span className={[
                "inline-block rounded-full px-1.5 py-px text-[9px] font-bold uppercase tracking-wide",
                HOME_SECCION_COLORS[row._home_seccion] ?? "bg-line text-muted",
              ].join(" ")}>
                {HOME_SECCION_LABELS[row._home_seccion] ?? row._home_seccion}
              </span>
            )}
          </div>
        </div>
      </div>
    ),
  },
  { key: "categoria", label: "Categoría", sortable: true },
  {
    key:      "genero",
    label:    "Género",
    sortable: true,
    render:   (_row, value) => value ? <span>{value}</span> : <span className="text-muted/40">—</span>,
  },
  {
    key:      "marca",
    label:    "Marca",
    sortable: true,
    render:   (_row, value) => value ? <span>{value}</span> : <span className="text-muted/40">—</span>,
  },
  {
    key:             "precio",
    label:           "Precio",
    sortable:        true,
    headerClassName: "text-right",
    className:       "text-right font-bold text-ink",
    render:          (_row, value) => fmt(Number(value)),
  },
  {
    key:             "stock",
    label:           "Stock",
    sortable:        true,
    headerClassName: "text-center",
    className:       "text-center",
    render:          (_row, value) => (
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
    render:          (_row, value) =>
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
];

const FILTROS_VACIOS = { q: "", marca: "", categoria: "", genero: "", badge: "", homeSec: "" };

function countFiltros(f) {
  return Object.values(f).filter(Boolean).length;
}

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const esAdmin = (usuario?.nivel ?? 0) >= 100;

  const [productos,   setProductos]   = useState([]);
  const [marcas,      setMarcas]      = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [generos,     setGeneros]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filtros,     setFiltros]     = useState(FILTROS_VACIOS);
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

  async function handleBaja(row) {
    if (!confirm(`¿Dar de baja "${row.nombre}"?`)) return;
    await http.delete(`/productos/${row._id}`);
    load();
  }

  async function handleReactivar(row) {
    await http.put(`/productos/${row._id}/reactivar`);
    load();
  }

  function setFiltro(k, v) {
    setFiltros(prev => ({ ...prev, [k]: v }));
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_VACIOS);
  }

  const rows = productos
    .filter(p => {
      if (filtros.q) {
        const q = filtros.q.toLowerCase();
        const match = p.nombre.toLowerCase().includes(q)
          || (p.codigo_ref ?? "").toLowerCase().includes(q)
          || p.categoria.toLowerCase().includes(q)
          || (p.marca ?? "").toLowerCase().includes(q);
        if (!match) return false;
      }
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
  const categoriasRaiz = categorias.filter(c => c.padre_id === null);

  const actions = [
    {
      key:      "edit",
      label:    "Editar",
      icon:     Edit2,
      variant:  "ghost",
      iconOnly: true,
      hidden:   () => !esAdmin,
      onClick:  (row) => navigate(`/admin/productos/${row._id}/editar`),
    },
    {
      key:      "reactivar",
      label:    "Reactivar",
      icon:     RefreshCw,
      variant:  "ghost",
      iconOnly: true,
      hidden:   (row) => !esAdmin || row._badge !== "agotado",
      onClick:  handleReactivar,
    },
    {
      key:      "baja",
      label:    "Dar de baja",
      icon:     Trash2,
      variant:  "danger",
      iconOnly: true,
      hidden:   (row) => !esAdmin || row._badge === "agotado",
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
          esAdmin && (
            <button
              onClick={() => navigate("/admin/productos/nuevo")}
              className="inline-flex items-center gap-2 rounded-xl bg-champagne px-4 py-2.5 text-sm font-black text-navy shadow-sm shadow-champagne/20 ring-1 ring-champagne/40 transition hover:bg-champagne-light active:scale-[0.98]"
            >
              <Plus size={16} /> Nuevo producto
            </button>
          )
        }
      />

      <div className="mb-4 space-y-3">

        {/* Barra de búsqueda por nombre */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={filtros.q}
            onChange={e => setFiltro("q", e.target.value)}
            placeholder="Buscar por nombre, código o marca…"
            className="w-full rounded-xl border border-line bg-card py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted/50 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/20"
          />
          {filtros.q && (
            <button
              onClick={() => setFiltro("q", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:text-ink"
            >
              <X size={13} />
            </button>
          )}
        </div>

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

          {filtros.q && <FiltroChip label={`"${filtros.q}"`} onRemove={() => setFiltro("q", "")} />}
          {filtros.marca && <FiltroChip label={`Marca: ${filtros.marca}`} onRemove={() => setFiltro("marca", "")} />}
          {filtros.categoria && <FiltroChip label={`Categoría: ${filtros.categoria}`} onRemove={() => setFiltro("categoria", "")} />}
          {filtros.genero && <FiltroChip label={`Género: ${filtros.genero}`} onRemove={() => setFiltro("genero", "")} />}
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
            <button onClick={limpiarFiltros} className="text-xs text-muted underline underline-offset-2 hover:text-navy">
              Limpiar todos
            </button>
          )}
        </div>

        {showFiltros && (
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-card p-4 sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Categoría</label>
              <select value={filtros.categoria} onChange={e => setFiltro("categoria", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-ink focus:border-navy focus:outline-none">
                <option value="">Todas</option>
                {categoriasRaiz.sort((a, b) => a.nombre.localeCompare(b.nombre))
                  .map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Género</label>
              <select value={filtros.genero} onChange={e => setFiltro("genero", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-ink focus:border-navy focus:outline-none">
                <option value="">Todos</option>
                {generos.map(g => <option key={g.id} value={g.nombre}>{g.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Marca</label>
              <select value={filtros.marca} onChange={e => setFiltro("marca", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-ink focus:border-navy focus:outline-none">
                <option value="">Todas</option>
                {marcas.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Estado</label>
              <select value={filtros.badge} onChange={e => setFiltro("badge", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-ink focus:border-navy focus:outline-none">
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="nuevo">Nuevo</option>
                <option value="vuelve">Vuelve</option>
                <option value="agotado">Agotado</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">Sección home</label>
              <select value={filtros.homeSec} onChange={e => setFiltro("homeSec", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-ink focus:border-navy focus:outline-none">
                <option value="">Todas</option>
                <option value="carousel">Carrusel</option>
                <option value="novedades">Novedades</option>
                <option value="ninguna">Sin sección</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <DataGrid
        rows={rows}
        columns={COLUMNS}
        keyField="_id"
        loading={loading}
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

function FiltroChip({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-navy/20 bg-navy/8 px-2.5 py-1 text-xs font-semibold text-navy">
      {label}
      <button onClick={onRemove} className="ml-0.5 rounded-full p-0.5 hover:bg-navy/20">
        <X size={10} />
      </button>
    </span>
  );
}
