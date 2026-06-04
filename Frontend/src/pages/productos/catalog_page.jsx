import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";

import CatalogHeader  from "./components/catalog_header";
import CatalogFilters, {
  FILTROS_DEFAULT,
  countActiveFiltros,
} from "./components/catalog_filters";
import CatalogGrid  from "./components/catalog_grid";
import BrandStrip   from "./components/brand_strip";

import { getProductos }          from "../../api/producto_api";
import { getCatalogoNavegacion, getCategorias, getGeneros, getMarcas } from "../../api/catalogo_api";

function labelFromSlug(slug) {
  if (!slug) return undefined;
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function flattenNavCategorias(items, parentId = null) {
  return items.flatMap((item) => [
    {
      id: item.id,
      nombre: item.label,
      slug: item.slug,
      padre_id: parentId,
    },
    ...flattenNavCategorias(item.children ?? [], item.id),
  ]);
}

export default function CatalogPage() {
  const location = useLocation();

  const [, seg0 = "", seg1 = ""] = location.pathname.split("/");
  const isCatalogo = seg0 === "catalogo";
  const genero    = seg0 && !isCatalogo ? seg0 : undefined;
  const categoria = seg1 || undefined;

  const [productos,  setProductos]  = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [filtros,    setFiltros]    = useState(FILTROS_DEFAULT);
  const [showDrawer, setShowDrawer] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [generos,    setGeneros]    = useState([]);
  const [catalogosNav, setCatalogosNav] = useState([]);
  const [marcas,     setMarcas]     = useState([]);

  const generoLabel = genero
    ? (generos.find((item) => item.slug === genero)?.nombre ?? labelFromSlug(genero))
    : undefined;
  const categoriaLabel = categoria
    ? (categorias.find((item) => item.slug === categoria)?.nombre ?? labelFromSlug(categoria))
    : undefined;
  const pageTitle = categoriaLabel ?? generoLabel ?? "Catálogo";
  const navGenero = genero ? catalogosNav.find((item) => item.slug === genero) : null;
  const categoriasFiltradas = navGenero
    ? flattenNavCategorias(navGenero.items ?? [])
    : categorias;

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, []);
  useEffect(() => {
    getGeneros().then(setGeneros).catch(() => setGeneros([]));
  }, []);
  useEffect(() => {
    getCatalogoNavegacion().then(setCatalogosNav).catch(() => setCatalogosNav([]));
  }, []);
  useEffect(() => {
    getMarcas().then(setMarcas).catch(() => setMarcas([]));
  }, []);

  const activeFiltersCount = countActiveFiltros(filtros);

  useEffect(() => {
    setFiltros(FILTROS_DEFAULT);
  }, [genero, categoria]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = {
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

  return (
    <div className="min-h-screen bg-surface">

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

      <BrandStrip
        marcas={marcas}
        selected={filtros.marcaSlug}
        onSelect={(slug) => setFiltros((f) => ({ ...f, marcaSlug: slug }))}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">

          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-line bg-card p-5">
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] ">
                Filtros
              </p>
              <CatalogFilters
                filtros={filtros}
                onChange={setFiltros}
                categorias={categoriasFiltradas}
                urlCategoria={categoria}
              />
            </div>
          </aside>

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
              categorias={categoriasFiltradas}
              urlCategoria={categoria}
            />

            <button
              onClick={() => setShowDrawer(false)}
              className="mt-7 w-full bg-accent py-3.5 text-xs font-black uppercase tracking-[0.12em] text-accent-on transition-all hover:opacity-90 active:scale-[0.99]"
            >
              {loading ? "Buscando…" : `Ver ${total} resultado${total !== 1 ? "s" : ""}`}
            </button>
          </div>
        </>
      )}

    </div>
  );
}
