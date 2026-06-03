import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";

import CatalogHeader  from "./components/catalog_header";
import CatalogFilters, {
  FILTROS_DEFAULT,
  countActiveFiltros,
  type Filtros,
} from "./components/catalog_filters";
import CatalogGrid  from "./components/catalog_grid";
import BrandStrip   from "./components/brand_strip";

import { getProductos, type Producto, type ProductoFiltros } from "../../api/producto_api";
import { getCategorias, getMarcas, type Categoria, type Marca } from "../../api/catalogo_api";

// ─── Mapas slug → etiqueta ────────────────────────────────────────────────────

const GENERO_LABELS: Record<string, string> = {
  damas:   "Damas",
  hombre:  "Hombre",
  calzado: "Calzado",
};

const CATEGORIA_LABELS: Record<string, string> = {
  vestidos:            "Vestidos",
  "ropa-de-noche":     "Ropa de Noche",
  remeras:             "Remeras",
  jeans:               "Jeans",
  busos:               "Busos",
  camperas:            "Camperas",
  sweaters:            "Sweaters",
  camisas:             "Camisas",
  chombas:             "Chombas",
  gorros:              "Gorros",
  cintos:              "Cintos",
  "zapatillas-dama":   "Zapatillas Dama",
  "zapatillas-hombre": "Zapatillas Hombre",
  "zapatos-dama":      "Zapatos Dama",
  "zapatos-hombre":    "Zapatos Hombre",
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CatalogPage() {
  const location = useLocation();

  // Extrae segmentos de la URL: /damas/remeras → ["damas", "remeras"]
  const [, seg0 = "", seg1 = ""] = location.pathname.split("/");
  const genero    = GENERO_LABELS[seg0]    ? seg0 : undefined;
  const categoria = CATEGORIA_LABELS[seg1] ? seg1 : undefined;

  const generoLabel    = genero    ? GENERO_LABELS[genero]       : undefined;
  const categoriaLabel = categoria ? CATEGORIA_LABELS[categoria] : undefined;
  const pageTitle      = categoriaLabel ?? generoLabel ?? "Catálogo";

  // ── Estado ─────────────────────────────────────────────────────────────────
  const [productos,  setProductos]  = useState<Producto[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [filtros,    setFiltros]    = useState<Filtros>(FILTROS_DEFAULT);
  const [showDrawer, setShowDrawer] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas,     setMarcas]     = useState<Marca[]>([]);

  useEffect(() => { getCategorias().then(setCategorias); }, []);
  useEffect(() => { getMarcas().then(setMarcas); }, []);

  const activeFiltersCount = countActiveFiltros(filtros);

  // Resetea filtros al cambiar de sección
  useEffect(() => {
    setFiltros(FILTROS_DEFAULT);
  }, [genero, categoria]);

  // Fetch al cambiar ruta o filtros
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params: ProductoFiltros = {
      genero,
      categoria: filtros.categoriaSlug ?? categoria,
      ...(filtros.marcaSlug             && { marca: filtros.marcaSlug }),
      orden: filtros.orden,
      ...(filtros.precio_max !== null && { precio_max: filtros.precio_max }),
      ...(filtros.solo_ofertas         && { solo_ofertas: true }),
      ...(filtros.solo_stock           && { solo_stock: true }),
    };

    getProductos(params)
      .then((res) => {
        if (cancelled) return;
        setProductos(res.productos);
        setTotal(res.pagination.total);
      })
      .catch(() => {
        if (cancelled) return;
        setProductos([]);
        setTotal(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [genero, categoria, filtros.categoriaSlug, filtros.marcaSlug, filtros.orden, filtros.precio_max, filtros.solo_ofertas, filtros.solo_stock]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface">

      {/* Breadcrumb + título */}
      <CatalogHeader
        genero={genero}
        generoLabel={generoLabel}
        categoriaLabel={categoriaLabel}
        pageTitle={pageTitle}
        total={total}
        loading={loading}
        activeFiltersCount={activeFiltersCount}
        onOpenFilters={() => setShowDrawer(true)}
      />

      {/* Cinta de marcas */}
      <BrandStrip
        marcas={marcas}
        selected={filtros.marcaSlug}
        onSelect={(slug) => setFiltros((f) => ({ ...f, marcaSlug: slug }))}
      />

      {/* Layout: sidebar + grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">

          {/* Sidebar filtros — solo desktop */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-line bg-card p-5">
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-champagne">
                Filtros
              </p>
              <CatalogFilters
                filtros={filtros}
                onChange={setFiltros}
                categorias={categorias}
                urlCategoria={categoria}
              />
            </div>
          </aside>

          {/* Grid de productos */}
          <main className="min-w-0 flex-1">
            <CatalogGrid
              productos={productos}
              loading={loading}
              activeFiltersCount={activeFiltersCount}
              onClearFilters={() => setFiltros(FILTROS_DEFAULT)}
            />
          </main>

        </div>
      </div>

      {/* Drawer filtros — solo mobile */}
      {showDrawer && (
        <>
          <div
            className="fixed inset-0 z-40 bg-navy/20 backdrop-blur-[2px]"
            onClick={() => setShowDrawer(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[82vh] overflow-y-auto rounded-t-2xl border-t border-line bg-card px-6 pb-8 pt-6">
            <div className="mb-5 flex items-center justify-between">
              <p className="font-bold text-ink">Filtros</p>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-muted transition-colors hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <CatalogFilters
              filtros={filtros}
              onChange={setFiltros}
              categorias={categorias}
              urlCategoria={categoria}
            />

            <button
              onClick={() => setShowDrawer(false)}
              className="mt-7 w-full bg-navy py-3.5 text-xs font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-navy/90"
            >
              {loading ? "Buscando…" : `Ver ${total} resultado${total !== 1 ? "s" : ""}`}
            </button>
          </div>
        </>
      )}

    </div>
  );
}
