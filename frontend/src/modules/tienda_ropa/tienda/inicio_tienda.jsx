import { useBannersVigentes } from "../../../core/hooks/use_banners.js";
import { clientConfig } from "../../../../../proyecto/client_config.js";
import { HOME_CONTACTOS } from "../../../proyecto/config/home_config.js";
import { MARCAS_DESTACADAS } from "../../../proyecto/config/marcas_config.js";
import { useCatalogo, useCategoriasTienda, useMarcasTienda } from "../hooks/use_ropa.js";
import { beneficiosTienda, instagramDe, marcaDestacada } from "../utils/home_tienda.js";
import CintaMarcas from "./cinta_marcas.jsx";
import PrendaCard from "./prenda_card.jsx";
import { ErrorReintentar, GrillaCargando, Vacio } from "./estados.jsx";
import { Beneficios, CategoriasConFoto, FilaOfertas, MarcaDestacada, PortadaTienda, SeguinosInstagram, TituloSeccion } from "./inicio_secciones.jsx";

const PRIMERA_PAGINA = { pagina: 1 };
const OFERTAS = { pagina: 1, ofertas: "1" };
const MAX_OFERTAS = 12; // ROP-26
const BENEFICIOS = beneficiosTienda({ envioGratisDesde: clientConfig.entrega?.envioGratisDesde, whatsapp: clientConfig.whatsapp });
const INSTAGRAM = instagramDe(HOME_CONTACTOS);

/**
 * Inicio de la tienda (ROP-10, ROP-26, ROP-69 a ROP-73), debajo del carrusel del core: portada (si no hay
 * banners), beneficios, marcas, categorías con foto, ofertas, marca destacada, novedades e Instagram.
 * Cada sección sin datos no se muestra; si una falla, las demás siguen.
 */
export default function InicioTienda({ textos }) {
  const { banners, isPending: cargandoBanners } = useBannersVigentes();
  const categorias = useCategoriasTienda();
  const novedades = useCatalogo(PRIMERA_PAGINA);
  const ofertas = useCatalogo(OFERTAS);
  const marcas = useMarcasTienda();
  const destacada = marcaDestacada(marcas.data, MARCAS_DESTACADAS);
  // Sin marca destacada pide lo mismo que novedades: TanStack lo resuelve con la misma consulta.
  const deLaMarca = useCatalogo(destacada ? { pagina: 1, marca: destacada.id } : PRIMERA_PAGINA);

  const listaNovedades = novedades.data?.items ?? [];
  const listaOfertas = (ofertas.data?.items ?? []).slice(0, MAX_OFERTAS);

  return (
    <>
      {!cargandoBanners && banners.carrusel.length === 0 && (
        <PortadaTienda textos={textos} fotos={listaNovedades.filter((p) => p.foto)} marcas={marcas.data ?? []} hayOfertas={listaOfertas.length > 0} />
      )}
      <Beneficios items={BENEFICIOS} />

      {(marcas.data?.length ?? 0) > 0 && (
        <section aria-labelledby="marcas" className="px-4 pt-10 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 id="marcas" className="kt-display mb-6 text-center text-sm font-extrabold uppercase tracking-[0.3em] text-(--kt-ink-soft)">{textos.marcasTitulo}</h2>
            <CintaMarcas marcas={marcas.data} />
          </div>
        </section>
      )}
      {marcas.isError && <div className="px-4 pt-8 sm:px-6"><div className="mx-auto max-w-6xl"><ErrorReintentar consulta={marcas} mensaje="No pudimos cargar las marcas." /></div></div>}

      {(categorias.data?.length ?? 0) > 0 && <CategoriasConFoto categorias={categorias.data} textos={textos} />}

      {ofertas.isError && <div className="px-4 pt-8 sm:px-6"><div className="mx-auto max-w-6xl"><ErrorReintentar consulta={ofertas} mensaje="No pudimos cargar las ofertas." /></div></div>}
      {listaOfertas.length > 0 && <FilaOfertas items={listaOfertas} textos={textos} />}

      {destacada && (deLaMarca.data?.items.length ?? 0) > 0 && <MarcaDestacada marca={destacada} prendas={deLaMarca.data.items} />}

      <section aria-labelledby="novedades" className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <TituloSeccion id="novedades" etiqueta={textos.novedadesEtiqueta} titulo={textos.novedadesTitulo} link="/catalogo" textoLink={textos.verTodo} />
          {novedades.isPending ? <GrillaCargando />
            : novedades.isError ? <ErrorReintentar consulta={novedades} mensaje="No pudimos cargar las prendas." />
            : listaNovedades.length === 0 ? <Vacio titulo="Muy pronto">Estamos cargando la colección.</Vacio>
            : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {listaNovedades.slice(0, 8).map((p) => <PrendaCard key={p.id} prenda={p} />)}
              </div>
            )}
        </div>
      </section>

      {INSTAGRAM && <SeguinosInstagram instagram={INSTAGRAM} textos={textos} />}
    </>
  );
}
