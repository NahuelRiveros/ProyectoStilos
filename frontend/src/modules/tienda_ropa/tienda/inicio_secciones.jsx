import { Link } from "react-router-dom";
import { ArrowRight, Instagram, MessageCircle, Store, Truck } from "lucide-react";
import { imagenCloudinary } from "../../../core/utils/imagen_cloudinary.js";
import { brandConfig } from "../../../proyecto/config/brand_config.js";
import { LOGOS_MARCAS } from "../../../proyecto/config/marcas_config.js";
import { logoDeMarca } from "../utils/logo_marca.js";
import PrendaCard from "./prenda_card.jsx";

// Secciones del inicio de la tienda (ROP-69 a ROP-73). Las arma inicio_tienda.jsx.

const BOTON_CLARO = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold uppercase tracking-wide transition";

/** Título de sección: etiqueta chica arriba, título en mayúsculas y "ver todo" a la derecha. */
export function TituloSeccion({ id, etiqueta, titulo, link, textoLink, claro = false }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {etiqueta && <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${claro ? "text-white/70" : "text-(--kt-ink-soft)"}`}>{etiqueta}</p>}
        <h2 id={id} className={`kt-display mt-1 text-3xl font-extrabold uppercase tracking-tight sm:text-4xl ${claro ? "text-white" : ""}`}>{titulo}</h2>
      </div>
      {link && (
        <Link to={link} className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline ${claro ? "text-white" : "text-(--kt-petrol)"}`}>
          {textoLink} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** ROP-69: portada propia cuando no hay banners del panel. */
export function PortadaTienda({ textos, fotos, marcas, hayOfertas }) {
  return (
    <section aria-labelledby="portada" className="relative overflow-hidden bg-(--kt-night) text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--kt-accent-on-dark)">{textos.portadaEtiqueta} · {brandConfig.nombre}</p>
          <h1 id="portada" className="kt-display mt-4 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">{textos.portadaTitulo}</h1>
          {marcas.length > 0 && <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">{marcas.slice(0, 6).map((m) => m.nombre).join(" · ")}</p>}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/catalogo" className={`${BOTON_CLARO} bg-(--kt-accent-comercial) text-white hover:bg-(--kt-accent-comercial-hover)`}>{textos.portadaBoton} <ArrowRight size={18} aria-hidden="true" /></Link>
            {hayOfertas && <Link to="/catalogo?ofertas=1" className={`${BOTON_CLARO} border border-white/40 text-white hover:bg-white/10`}>{textos.portadaOfertas}</Link>}
          </div>
        </div>
        {fotos.length > 0 && (
          <div className="grid grid-cols-3 gap-3" aria-hidden="true">
            {fotos.slice(0, 3).map((p, i) => (
              <div key={p.id} className={`overflow-hidden rounded-2xl bg-white/10 ${i === 1 ? "translate-y-6" : ""}`}>
                <img src={imagenCloudinary(p.foto, 360)} alt="" className="aspect-3/4 h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const ICONOS = { envio: Truck, whatsapp: MessageCircle, retiro: Store };

/** ROP-70: franja de beneficios. */
export function Beneficios({ items }) {
  return (
    <section aria-label="Beneficios" className="border-b border-(--kt-border) bg-(--kt-bg-soft)">
      <ul className="mx-auto grid max-w-6xl gap-px sm:grid-cols-3">
        {items.map((b) => {
          const Icono = ICONOS[b.id] ?? Store;
          return (
            <li key={b.id} className="flex items-center gap-3 px-4 py-4 sm:justify-center sm:px-6">
              <Icono size={22} className="shrink-0 text-(--kt-accent-comercial)" aria-hidden="true" />
              <p className="text-sm leading-tight"><strong className="block font-bold uppercase tracking-wide">{b.titulo}</strong><span className="text-(--kt-ink-soft)">{b.texto}</span></p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** ROP-72: tarjetas de las categorías principales con su foto. */
export function CategoriasConFoto({ categorias, textos }) {
  return (
    <section aria-labelledby="categorias" className="px-4 pt-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <TituloSeccion id="categorias" etiqueta={textos.categoriasEtiqueta} titulo={textos.categoriasTitulo} />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categorias.map((c) => (
            <li key={c.id}>
              <Link to={`/catalogo?categoria=${c.id}`} className="group relative block aspect-3/4 overflow-hidden rounded-2xl bg-(--kt-petrol)">
                {c.foto && <img src={imagenCloudinary(c.foto, 400)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" />}
                <span className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />
                <span className="kt-display absolute inset-x-3 bottom-3 flex items-center justify-between text-lg font-extrabold uppercase tracking-tight text-white">
                  {c.nombre} <ArrowRight size={18} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** ROP-71: una marca con su logo y sus últimas prendas. */
export function MarcaDestacada({ marca, prendas }) {
  const logo = logoDeMarca(marca, LOGOS_MARCAS);
  return (
    <section aria-labelledby="marca-destacada" className="px-4 pt-14 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 overflow-hidden rounded-3xl bg-(--kt-night) p-5 sm:p-8 lg:grid-cols-[18rem_1fr]">
        <div className="flex flex-col justify-between gap-6 text-white">
          <div>
            <div className="flex h-24 items-center justify-center rounded-2xl bg-white p-4" style={logo?.fondo ? { backgroundColor: logo.fondo } : undefined}>
              {logo ? <img src={imagenCloudinary(logo.url, 320)} alt={marca.nombre} className="max-h-full max-w-full object-contain" />
                : <span className="kt-display text-2xl font-black uppercase text-(--kt-ink)">{marca.nombre}</span>}
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Marca destacada</p>
            <h2 id="marca-destacada" className="kt-display mt-1 text-3xl font-black uppercase leading-none tracking-tight">Lo nuevo de {marca.nombre}</h2>
          </div>
          <Link to={`/catalogo?marca=${marca.id}`} className={`${BOTON_CLARO} bg-white text-(--kt-ink) hover:bg-(--kt-bg-soft)`}>Ver todo {marca.nombre} <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {prendas.slice(0, 4).map((p) => <PrendaCard key={p.id} prenda={p} />)}
        </div>
      </div>
    </section>
  );
}

/** ROP-73: ofertas en una fila que se desliza. */
export function FilaOfertas({ items, textos }) {
  return (
    <section aria-labelledby="ofertas" className="px-4 pt-14 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <TituloSeccion id="ofertas" etiqueta="Precios especiales" titulo={textos.ofertasTitulo} link="/catalogo?ofertas=1" textoLink="Ver todas" />
        <ul className="relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0">
          {items.map((p) => <li key={p.id} className="w-44 shrink-0 snap-start sm:w-56"><PrendaCard prenda={p} /></li>)}
        </ul>
      </div>
    </section>
  );
}

/** ROP-73: cierre con Instagram (solo si está configurado). */
export function SeguinosInstagram({ instagram, textos }) {
  return (
    <section aria-labelledby="instagram" className="px-4 pb-14 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 rounded-3xl border border-(--kt-border) bg-(--kt-bg-soft) px-6 py-10 text-center">
        <Instagram size={32} className="text-(--kt-accent-comercial)" aria-hidden="true" />
        <h2 id="instagram" className="kt-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">{textos.instagramTitulo}</h2>
        <a href={instagram.href} target="_blank" rel="noopener noreferrer" className={`${BOTON_CLARO} bg-(--kt-petrol) text-(--kt-accent-on-dark) hover:opacity-90`}>@{instagram.usuario}</a>
      </div>
    </section>
  );
}
