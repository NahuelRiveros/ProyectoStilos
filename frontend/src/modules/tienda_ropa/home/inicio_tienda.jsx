import { clientConfig } from "../../../../../proyecto/client_config.js";
import { HOME_CONTACTOS } from "../../../proyecto/config/home_config.js";
import { MARCAS_DESTACADAS } from "../../../proyecto/config/marcas_config.js";
import { useCatalogo, useCategoriasTienda, useMarcasTienda } from "../hooks/use_ropa.js";
import { beneficiosTienda, instagramDe, marcaDestacada } from "../utils/home_tienda.js";
import CintaMarcas from "../tienda/cinta_marcas.jsx";
import PrendaCard from "../tienda/prenda_card.jsx";
import { ErrorReintentar, GrillaCargando, Vacio } from "../tienda/estados.jsx";
import { Beneficios, CategoriasConFoto, FilaOfertas, HeroTienda, MarcaDestacada, SeguinosInstagram, TituloSeccion } from "./secciones.jsx";
import "./home.css";

const PRIMERA_PAGINA = { pagina: 1 };
const OFERTAS = { pagina: 1, ofertas: "1" };
const MAX_OFERTAS = 12;
const BENEFICIOS = beneficiosTienda({ envioGratisDesde: clientConfig.entrega?.envioGratisDesde, whatsapp: clientConfig.whatsapp });
const INSTAGRAM = instagramDe(HOME_CONTACTOS);

/** Home de indumentaria: portada editorial, categorías, promociones y prendas del catálogo. */
export default function InicioTienda({ textos }) {
  const categorias = useCategoriasTienda();
  const novedades = useCatalogo(PRIMERA_PAGINA);
  const ofertas = useCatalogo(OFERTAS);
  const marcas = useMarcasTienda();
  const destacada = marcaDestacada(marcas.data, MARCAS_DESTACADAS);
  const deLaMarca = useCatalogo(destacada ? { pagina: 1, marca: destacada.id } : PRIMERA_PAGINA);
  const listaNovedades = novedades.data?.items ?? [];
  const listaOfertas = (ofertas.data?.items ?? []).slice(0, MAX_OFERTAS);
  const fotosHero = listaNovedades.filter((prenda) => prenda.foto).slice(0, 3);

  return (
    <div className="stilos-home overflow-hidden">
      <HeroTienda textos={textos} fotos={fotosHero} hayOfertas={listaOfertas.length > 0} />
      <Beneficios items={BENEFICIOS} />

      {(marcas.data?.length ?? 0) > 0 && (
        <section aria-labelledby="marcas" className="px-4 pt-11 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div><p className="home-kicker">Selección multimarca</p><h2 id="marcas" className="kt-display mt-1 text-xl font-extrabold uppercase tracking-tight sm:text-2xl">{textos.marcasTitulo}</h2></div>
              <span className="hidden text-xs font-semibold text-(--kt-ink-soft) sm:block">Estilo para todos los días</span>
            </div>
            <CintaMarcas marcas={marcas.data} />
          </div>
        </section>
      )}
      {marcas.isError && <div className="px-4 pt-8 sm:px-6"><div className="mx-auto max-w-7xl"><ErrorReintentar consulta={marcas} mensaje="No pudimos cargar las marcas." /></div></div>}

      {(categorias.data?.length ?? 0) > 0 && <CategoriasConFoto categorias={categorias.data} textos={textos} />}

      {ofertas.isError && <div className="px-4 pt-8 sm:px-6"><div className="mx-auto max-w-7xl"><ErrorReintentar consulta={ofertas} mensaje="No pudimos cargar las ofertas." /></div></div>}
      {listaOfertas.length > 0 && <FilaOfertas items={listaOfertas} textos={textos} />}

      {destacada && (deLaMarca.data?.items.length ?? 0) > 0 && <MarcaDestacada marca={destacada} prendas={deLaMarca.data.items} />}

      <section aria-labelledby="novedades" className="px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <TituloSeccion id="novedades" etiqueta={textos.novedadesEtiqueta} titulo={textos.novedadesTitulo} link="/catalogo" textoLink={textos.verTodo} />
          {novedades.isPending ? <GrillaCargando />
            : novedades.isError ? <ErrorReintentar consulta={novedades} mensaje="No pudimos cargar las prendas." />
            : listaNovedades.length === 0 ? <Vacio titulo="Muy pronto">Estamos cargando la colección.</Vacio>
            : <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">{listaNovedades.slice(0, 8).map((p, i) => <div key={p.id} className="home-reveal" style={{ "--home-delay": `${Math.min(i, 7) * 55}ms` }}><PrendaCard prenda={p} /></div>)}</div>}
        </div>
      </section>

      {INSTAGRAM && <SeguinosInstagram instagram={INSTAGRAM} textos={textos} />}
    </div>
  );
}
