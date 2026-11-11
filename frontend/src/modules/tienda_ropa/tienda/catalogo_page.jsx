import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import SearchField from "../../../core/controls/ui/search_field.jsx";
import Pagination from "../../../core/controls/ui/pagination.jsx";
import { useCatalogo, useCategoriasTienda, useFiltrosTienda } from "../hooks/use_ropa.js";
import { cn } from "../../../core/utils/cn.js";
import PrendaCard from "./prenda_card.jsx";
import { ErrorReintentar, GrillaCargando, Vacio } from "./estados.jsx";

const CAMPOS = ["q", "categoria", "marca", "color", "talle", "ofertas", "orden", "pagina"];
const ORDENES = [["novedades", "Novedades"], ["menor_precio", "Menor precio"], ["mayor_precio", "Mayor precio"]];

/** Camino de la raíz a la categoría `id` dentro del árbol, o []. */
function caminoA(arbol, id) {
  for (const nodo of arbol) {
    if (nodo.id === id) return [nodo];
    const debajo = caminoA(nodo.hijas, id);
    if (debajo.length) return [nodo, ...debajo];
  }
  return [];
}

/** Catálogo (ROP-11): búsqueda, categorías por niveles con migas, marca, color, talle, ofertas y orden. Todo en la URL. */
export default function CatalogoPage() {
  const [params, setParams] = useSearchParams();
  const filtros = useMemo(() => Object.fromEntries(CAMPOS.map((c) => [c, params.get(c) ?? ""]).filter(([, v]) => v)), [params]);
  const numero = (campo) => (filtros[campo] ? Number(filtros[campo]) : null);

  const prendas = useCatalogo({ ...filtros, pagina: filtros.pagina ?? 1 });
  const categorias = useCategoriasTienda();
  const opciones = useFiltrosTienda();

  const [verFiltros, setVerFiltros] = useState(false);

  // poner: fija un valor (vacío lo saca). Cualquier cambio que no sea de página vuelve a la página 1.
  const poner = useCallback((campo, valor) => {
    setParams((actual) => {
      const nuevo = new URLSearchParams(actual);
      if (valor === "" || valor == null) nuevo.delete(campo); else nuevo.set(campo, valor);
      if (campo !== "pagina") nuevo.delete("pagina");
      return nuevo;
    });
  }, [setParams]);
  // alternar: tocar el color o talle ya elegido lo saca.
  const alternar = (campo, valor) => poner(campo, numero(campo) === valor ? "" : valor);
  // El orden no es un filtro: se mantiene al quitar filtros.
  const limpiar = () => setParams({ ...(actual && { categoria: String(actual.id) }), ...(filtros.orden && { orden: filtros.orden }) });

  const arbol = categorias.data ?? [];
  const camino = caminoA(arbol, numero("categoria"));
  const actual = camino.at(-1);
  const hijas = actual ? actual.hijas : arbol;
  const hayFiltros = ["marca", "color", "talle", "q", "ofertas"].some((c) => filtros[c]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Ubicación" className="flex flex-wrap items-center gap-1 text-sm text-(--kt-ink-soft)">
        <button type="button" onClick={() => poner("categoria", "")} className="min-h-11 hover:text-(--kt-ink)">Todo</button>
        {camino.map((c) => (
          <span key={c.id} className="flex items-center gap-1">
            <ChevronRight size={14} aria-hidden="true" />
            <button type="button" onClick={() => poner("categoria", c.id)} aria-current={c.id === actual.id ? "page" : undefined} className={cn("min-h-11", c.id === actual.id && "font-semibold text-(--kt-ink)")}>{c.nombre}</button>
          </span>
        ))}
      </nav>
      <h1 className="kt-display text-4xl font-semibold sm:text-5xl">{actual?.nombre ?? "Colección"}</h1>

      {hijas.length > 0 && (
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {hijas.map((c) => (
            <button key={c.id} type="button" onClick={() => poner("categoria", c.id)} className="min-h-11 shrink-0 rounded-full border border-(--kt-border) bg-white px-4 text-sm font-semibold hover:border-(--kt-petrol)">
              {c.nombre}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[15rem_1fr]">
        <aside aria-label="Filtros" className="h-fit rounded-2xl border border-(--kt-border) bg-white p-4">
          <button type="button" aria-expanded={verFiltros} aria-controls="filtros-catalogo" onClick={() => setVerFiltros((v) => !v)}
            className="flex min-h-11 w-full items-center gap-2 font-semibold lg:hidden">
            <SlidersHorizontal size={17} aria-hidden="true" /> {verFiltros ? "Ocultar filtros" : "Filtrar"}
          </button>
          <p className="hidden min-h-11 items-center gap-2 font-semibold lg:flex"><SlidersHorizontal size={17} aria-hidden="true" /> Filtrar</p>
          <div id="filtros-catalogo" className={cn("mt-3 space-y-5 lg:block", !verFiltros && "hidden")}>
            <SearchField value={filtros.q ?? ""} onSearch={(q) => poner("q", q)} label="Buscar prendas" placeholder="Buscar…" />
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={filtros.ofertas === "1"} onChange={(e) => poner("ofertas", e.target.checked ? "1" : "")} className="h-5 w-5 accent-(--kt-accent-comercial)" />
              Solo ofertas
            </label>
            {(opciones.data?.colores.length ?? 0) > 0 && (
              <fieldset>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-(--kt-ink-soft)">Color</legend>
                <div className="flex flex-wrap gap-2">
                  {opciones.data.colores.map((c) => (
                    <button key={c.id} type="button" title={c.nombre} aria-label={c.nombre} aria-pressed={numero("color") === c.id} onClick={() => alternar("color", c.id)}
                      className={cn("h-11 w-11 rounded-full border-2 p-1 transition", numero("color") === c.id ? "border-(--kt-petrol)" : "border-transparent hover:border-(--kt-border)")}>
                      <span className="block h-full w-full rounded-full border border-black/15" style={{ backgroundColor: c.hex }} />
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            {(opciones.data?.talles.length ?? 0) > 0 && (
              <fieldset>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-(--kt-ink-soft)">Talle</legend>
                <div className="flex flex-wrap gap-2">
                  {opciones.data.talles.map((t) => (
                    <button key={t.id} type="button" aria-pressed={numero("talle") === t.id} onClick={() => alternar("talle", t.id)}
                      className={cn("min-h-11 min-w-11 rounded-xl border px-3 text-sm font-semibold", numero("talle") === t.id ? "border-(--kt-petrol) bg-(--kt-petrol) text-(--kt-accent-on-dark)" : "border-(--kt-border) hover:border-(--kt-petrol)")}>
                      {t.nombre}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            {(opciones.data?.marcas.length ?? 0) > 0 && (
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-(--kt-ink-soft)">Marca</span>
                <select value={filtros.marca ?? ""} onChange={(e) => poner("marca", e.target.value)} className="min-h-11 w-full rounded-xl border border-(--kt-border) bg-white px-3 text-sm">
                  <option value="">Todas</option>
                  {opciones.data.marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </label>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            {hayFiltros ? (
              <button type="button" onClick={limpiar} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-(--kt-accent-comercial)">
                <X size={15} aria-hidden="true" /> Quitar filtros
              </button>
            ) : <span />}
            <label className="flex items-center gap-2 text-sm">
              <span className="text-(--kt-ink-soft)">Ordenar</span>
              <select value={filtros.orden ?? "novedades"} onChange={(e) => poner("orden", e.target.value === "novedades" ? "" : e.target.value)} className="min-h-11 rounded-xl border border-(--kt-border) bg-white px-3 font-semibold">
                {ORDENES.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
              </select>
            </label>
          </div>
          {prendas.isPending ? <GrillaCargando cantidad={12} />
            : prendas.isError ? <ErrorReintentar consulta={prendas} mensaje="No pudimos cargar las prendas." />
            : prendas.data.items.length === 0 ? (
              <Vacio titulo="No encontramos prendas">
                {hayFiltros ? "Probá con otros filtros." : <>Todavía no hay prendas en esta categoría. <Link to="/catalogo" className="font-semibold underline">Ver toda la colección</Link></>}
              </Vacio>
            )
            : (
              <>
                <div className={cn("grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3", prendas.isPlaceholderData && "opacity-60")}>
                  {prendas.data.items.map((p) => <PrendaCard key={p.id} prenda={p} />)}
                </div>
                <Pagination
                  page={prendas.data.paginacion.page}
                  pages={prendas.data.paginacion.totalPages}
                  total={prendas.data.paginacion.total}
                  disabled={prendas.isFetching}
                  onChange={(pagina) => { poner("pagina", pagina); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                />
              </>
            )}
        </div>
      </div>
    </div>
  );
}
