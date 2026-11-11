import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCatalogo, useCategoriasTienda, useMarcasTienda } from "../hooks/use_ropa.js";
import CintaMarcas from "./cinta_marcas.jsx";
import { brandConfig } from "../../../proyecto/config/brand_config.js";
import PrendaCard from "./prenda_card.jsx";
import { ErrorReintentar, GrillaCargando, Vacio } from "./estados.jsx";

const PRIMERA_PAGINA = { pagina: 1 };
const OFERTAS = { pagina: 1, ofertas: "1" };
const MAX_OFERTAS = 8; // ROP-26

/** Inicio de la tienda (ROP-10, ROP-26), debajo del carrusel del core: nombre, categorías, ofertas, novedades y marcas. */
export default function InicioTienda({ textos }) {
  const categorias = useCategoriasTienda();
  const novedades = useCatalogo(PRIMERA_PAGINA);
  const ofertas = useCatalogo(OFERTAS);
  const marcas = useMarcasTienda();

  return (
    <>
      <section className="border-b border-(--kt-border) bg-(--kt-bg-soft) px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--kt-ink-soft)">{brandConfig.rubro}</p>
          <h1 className="kt-display mt-3 text-5xl font-semibold leading-none text-(--kt-petrol) sm:text-6xl">{brandConfig.nombre}</h1>
          <p className="kt-display mt-3 text-xl italic text-(--kt-accent-comercial) sm:text-2xl">{brandConfig.tagline}</p>
          {(categorias.data?.length ?? 0) > 0 && (
            <nav aria-label={textos.categoriasTitulo} className="mt-8 flex flex-wrap justify-center gap-2">
              {categorias.data.map((c) => (
                <Link key={c.id} to={`/catalogo?categoria=${c.id}`} className="inline-flex min-h-11 items-center rounded-full border border-(--kt-petrol)/25 bg-white px-5 text-sm font-semibold text-(--kt-petrol) transition hover:border-(--kt-petrol) hover:bg-(--kt-petrol) hover:text-(--kt-accent-on-dark)">
                  {c.nombre}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>

      {/* Sin ofertas no se muestra la sección; si falla, lo importante (novedades) sigue abajo. */}
      {ofertas.isError && <div className="px-4 pt-8 sm:px-6"><div className="mx-auto max-w-6xl"><ErrorReintentar consulta={ofertas} mensaje="No pudimos cargar las ofertas." /></div></div>}
      {(ofertas.data?.items.length ?? 0) > 0 && (
        <section aria-labelledby="ofertas" className="px-4 pt-12 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 id="ofertas" className="kt-display text-3xl font-semibold sm:text-4xl">Ofertas</h2>
              <Link to="/catalogo?ofertas=1" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-(--kt-petrol) underline-offset-4 hover:underline">
                Ver todas <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {ofertas.data.items.slice(0, MAX_OFERTAS).map((p) => <PrendaCard key={p.id} prenda={p} />)}
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="novedades" className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-(--kt-ink-soft)">{textos.novedadesEtiqueta}</p>
              <h2 id="novedades" className="kt-display mt-1 text-3xl font-semibold sm:text-4xl">{textos.novedadesTitulo}</h2>
            </div>
            <Link to="/catalogo" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-(--kt-petrol) underline-offset-4 hover:underline">
              {textos.verTodo} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          {novedades.isPending ? <GrillaCargando />
            : novedades.isError ? <ErrorReintentar consulta={novedades} mensaje="No pudimos cargar las prendas." />
            : novedades.data.items.length === 0 ? <Vacio titulo="Muy pronto">Estamos cargando la colección.</Vacio>
            : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {novedades.data.items.slice(0, 8).map((p) => <PrendaCard key={p.id} prenda={p} />)}
              </div>
            )}
        </div>
      </section>

      {marcas.isError && <div className="px-4 pb-12 sm:px-6"><div className="mx-auto max-w-6xl"><ErrorReintentar consulta={marcas} mensaje="No pudimos cargar las marcas." /></div></div>}
      {(marcas.data?.length ?? 0) > 0 && (
        <section aria-labelledby="marcas" className="border-t border-(--kt-border) bg-(--kt-bg-soft) px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 id="marcas" className="kt-display text-center text-3xl font-semibold sm:text-4xl">Nuestras marcas</h2>
            <div className="mt-8"><CintaMarcas marcas={marcas.data} /></div>
          </div>
        </section>
      )}
    </>
  );
}
