import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Instagram, MessageCircle, Store, Truck } from "lucide-react";
import { imagenCloudinary } from "../../../core/utils/imagen_cloudinary.js";
import { brandConfig } from "../../../proyecto/config/brand_config.js";
import { LOGOS_MARCAS } from "../../../proyecto/config/marcas_config.js";
import { logoDeMarca } from "../utils/logo_marca.js";
import PrendaCard from "../tienda/prenda_card.jsx";

const BOTON_CLARO = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold uppercase tracking-wide transition duration-300";

export function TituloSeccion({ id, etiqueta, titulo, link, textoLink, claro = false }) {
  return <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8"><div>{etiqueta && <p className={`home-kicker ${claro ? "text-white/65" : ""}`}>{etiqueta}</p>}<h2 id={id} className={`kt-display mt-1 text-3xl font-extrabold uppercase tracking-tight sm:text-4xl ${claro ? "text-white" : ""}`}>{titulo}</h2></div>{link && <Link to={link} className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-bold underline-offset-4 transition hover:gap-2.5 hover:underline ${claro ? "text-white" : "text-(--kt-petrol)"}`}>{textoLink}<ArrowRight size={16} aria-hidden="true" /></Link>}</div>;
}

export function HeroTienda({ textos, fotos, hayOfertas }) {
  return <section aria-labelledby="portada" className="home-hero relative isolate overflow-hidden bg-(--kt-night) text-white">
    <div aria-hidden="true" className="home-hero-glow pointer-events-none absolute -right-28 -top-36 h-[32rem] w-[32rem] rounded-full" />
    <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-11 sm:px-6 sm:py-16 lg:min-h-[500px] lg:grid-cols-[.94fr_1.06fr] lg:gap-12 lg:py-20">
      <div className="home-reveal relative z-10">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.26em] text-(--kt-accent-on-dark)"><span className="h-1.5 w-1.5 rounded-full bg-(--kt-accent-on-dark)" />{textos.portadaEtiqueta} <span className="text-white/50">/</span> {brandConfig.nombre}</p>
        <h1 id="portada" className="kt-display mt-5 max-w-xl text-4xl font-black uppercase leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-[4.35rem]">{textos.portadaTitulo}</h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-white/70 sm:text-base">Descubrí prendas para sentirte bien, todos los días. Encontrá tus marcas favoritas en un solo lugar.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/catalogo" className={`${BOTON_CLARO} bg-(--kt-accent-comercial) text-white shadow-lg shadow-black/15 hover:-translate-y-0.5 hover:bg-(--kt-accent-comercial-hover)`}>{textos.portadaBoton}<ArrowRight size={17} aria-hidden="true" /></Link>
          {hayOfertas && <Link to="/catalogo?ofertas=1" className={`${BOTON_CLARO} border border-white/30 bg-white/5 text-white hover:bg-white/12`}>{textos.portadaOfertas}</Link>}
        </div>
        <div className="mt-9 flex items-center gap-3 text-xs font-semibold text-white/55"><span className="h-px w-9 bg-(--kt-accent-on-dark)/60" />Marcas que te gustan. Estilo que es tuyo.</div>
      </div>
      <div className="home-hero-gallery relative mx-auto grid w-full max-w-xl grid-cols-[1.18fr_.82fr] items-center gap-3 sm:gap-4">
        {fotos[0] ? <div className="home-photo-main relative overflow-hidden rounded-[1.6rem] bg-white/10"><img src={imagenCloudinary(fotos[0].foto, 900)} alt={fotos[0].nombre} fetchPriority="high" decoding="async" className="h-full min-h-[275px] w-full object-cover sm:min-h-[410px]" /><span className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" /></div> : <div className="home-photo-main flex min-h-[275px] items-center justify-center rounded-[1.6rem] bg-white/5 sm:min-h-[410px]"><span className="kt-display text-5xl font-black uppercase text-white/15">Stilo's</span></div>}
        <div className="grid gap-3 sm:gap-4">{fotos.slice(1, 3).map((p, i) => <div key={p.id} className={`home-photo-side relative overflow-hidden rounded-[1.35rem] bg-white/10 ${i === 1 ? "translate-x-2" : "-translate-x-1"}`}><img src={imagenCloudinary(p.foto, 560)} alt={p.nombre} loading="lazy" decoding="async" className="aspect-[.78] w-full object-cover" /></div>)}{fotos.length < 2 && <div className="flex aspect-[.78] items-center justify-center rounded-[1.35rem] border border-white/15 bg-white/5 p-4 text-center"><span className="kt-display text-lg font-bold uppercase text-(--kt-accent-on-dark)">Nueva temporada</span></div>}{fotos.length < 3 && <Link to="/catalogo" className="flex aspect-[.78] flex-col items-center justify-center gap-3 rounded-[1.35rem] bg-(--kt-accent-on-dark) p-4 text-center text-(--kt-night) transition hover:-translate-y-1"><span className="kt-display text-lg font-extrabold uppercase">Tu próximo favorito</span><span className="flex items-center gap-1 text-xs font-bold uppercase">Explorar <ArrowRight size={14} /></span></Link>}</div>
        <span className="pointer-events-none absolute -bottom-4 left-[40%] hidden rounded-full border border-white/20 bg-(--kt-night) px-4 py-2 text-[10px] font-bold uppercase tracking-[.22em] text-white/80 shadow-xl sm:block">Moda y estilo</span>
      </div>
    </div>
  </section>;
}

const ICONOS = { envio: Truck, whatsapp: MessageCircle, retiro: Store };
export function Beneficios({ items }) {
  if (!items.length) return null;
  return <section aria-label="Beneficios de compra" className="border-b border-(--kt-border) bg-(--kt-bg-soft)"><ul className="mx-auto grid max-w-7xl gap-px sm:grid-cols-3">{items.map((b) => { const Icono = ICONOS[b.id] ?? Store; return <li key={b.id} className="flex items-center gap-3 px-4 py-4 sm:justify-center sm:px-6 sm:py-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-(--kt-accent-comercial) shadow-sm"><Icono size={19} aria-hidden="true" /></span><p className="text-sm leading-tight"><strong className="block font-bold uppercase tracking-wide">{b.titulo}</strong><span className="mt-1 block text-(--kt-ink-soft)">{b.texto}</span></p></li>; })}</ul></section>;
}

export function CategoriasConFoto({ categorias, textos }) {
  return <section aria-labelledby="categorias" className="px-4 pt-14 sm:px-6 sm:pt-16"><div className="mx-auto max-w-7xl"><TituloSeccion id="categorias" etiqueta={textos.categoriasEtiqueta} titulo={textos.categoriasTitulo} /><ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">{categorias.map((c, i) => <li key={c.id} className="home-reveal" style={{ "--home-delay": `${i * 60}ms` }}><Link to={`/catalogo?categoria=${c.id}`} className="home-category group relative block aspect-[.82] overflow-hidden rounded-2xl bg-(--kt-petrol) sm:rounded-3xl">{c.foto && <img src={imagenCloudinary(c.foto, 600)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105 motion-reduce:transform-none" />}<span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/0 transition group-hover:from-black/85" aria-hidden="true" /><span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2 text-white sm:inset-x-5 sm:bottom-5"><span className="kt-display text-lg font-extrabold uppercase leading-tight tracking-tight sm:text-xl">{c.nombre}</span><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 bg-black/10 transition group-hover:translate-x-1 group-hover:bg-white group-hover:text-(--kt-petrol)"><ArrowRight size={17} aria-hidden="true" /></span></span></Link></li>)}</ul></div></section>;
}

export function MarcaDestacada({ marca, prendas }) {
  const logo = logoDeMarca(marca, LOGOS_MARCAS);
  return <section aria-labelledby="marca-destacada" className="px-4 pt-14 sm:px-6"><div className="mx-auto grid max-w-7xl gap-6 overflow-hidden rounded-[1.75rem] bg-(--kt-night) p-5 sm:p-8 lg:grid-cols-[17rem_1fr] lg:items-stretch"><div className="flex flex-col justify-between gap-6 text-white"><div><div className="flex h-20 items-center justify-center rounded-2xl bg-white p-4" style={logo?.fondo ? { backgroundColor: logo.fondo } : undefined}>{logo ? <img src={imagenCloudinary(logo.url, 320)} alt={marca.nombre} className="max-h-full max-w-full object-contain" /> : <span className="kt-display text-2xl font-black uppercase text-(--kt-ink)">{marca.nombre}</span>}</div><p className="home-kicker mt-6 text-white/60">En el radar</p><h2 id="marca-destacada" className="kt-display mt-2 text-3xl font-black uppercase leading-[1.02]">Lo nuevo de {marca.nombre}</h2><p className="mt-3 text-sm leading-6 text-white/65">Una selección especial para renovar tu estilo.</p></div><Link to={`/catalogo?marca=${marca.id}`} className={`${BOTON_CLARO} self-start bg-white text-(--kt-ink) hover:-translate-y-0.5 hover:bg-(--kt-bg-soft)`}>Ver colección<ArrowRight size={17} /></Link></div><div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 sm:grid-cols-4 sm:gap-4">{prendas.slice(0, 4).map((p) => <PrendaCard key={p.id} prenda={p} />)}</div></div></section>;
}

export function FilaOfertas({ items, textos }) {
  const pista = useRef(null);
  const mover = (direccion) => pista.current?.scrollBy({ left: direccion * Math.max(pista.current.clientWidth * .78, 240), behavior: "smooth" });
  return <section aria-labelledby="ofertas" className="home-offers mt-14 px-4 py-11 sm:px-6 sm:py-14"><div className="mx-auto max-w-7xl"><div className="flex items-end justify-between gap-4"><TituloSeccion id="ofertas" etiqueta="Precios especiales" titulo={textos.ofertasTitulo} link="/catalogo?ofertas=1" textoLink="Ver todas" /><div className="mb-6 hidden gap-2 sm:flex"><button type="button" onClick={() => mover(-1)} aria-label="Desplazar ofertas a la izquierda" className="home-scroll-button"><ChevronLeft size={19} /></button><button type="button" onClick={() => mover(1)} aria-label="Desplazar ofertas a la derecha" className="home-scroll-button"><ChevronRight size={19} /></button></div></div><ul ref={pista} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:gap-5 sm:px-0">{items.map((p) => <li key={p.id} className="w-[42vw] max-w-64 shrink-0 snap-start sm:w-56"><PrendaCard prenda={p} /></li>)}</ul></div></section>;
}

export function SeguinosInstagram({ instagram, textos }) {
  return <section aria-labelledby="instagram" className="px-4 pb-14 sm:px-6"><div className="home-instagram mx-auto flex max-w-7xl flex-col items-center gap-4 rounded-[1.75rem] border border-(--kt-border) px-6 py-10 text-center sm:py-12"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-(--kt-accent-comercial) shadow-sm"><Instagram size={22} /></span><p className="home-kicker">Un poco de inspiración</p><h2 id="instagram" className="kt-display -mt-3 text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">{textos.instagramTitulo}</h2><a href={instagram.href} target="_blank" rel="noopener noreferrer" className={`${BOTON_CLARO} mt-1 bg-(--kt-petrol) text-(--kt-accent-on-dark) hover:-translate-y-0.5 hover:opacity-90`}>@{instagram.usuario}<ArrowRight size={16} /></a></div></section>;
}
