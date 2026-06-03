import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, ShoppingBag, Truck, RotateCcw, Shield, Store } from "lucide-react";
import AnnouncementBar, { type AnnouncementItem } from "../components/home/announcement_bar";
import HomeCarousel, { type CarouselSlide } from "../components/home/home_carousel";
import ProductCard, { type ProductCardProps } from "../components/home/product_card";
import PromoProductsSection from "../components/home/promo_products_section";
import { getOfertasDestacadas, getProductos, getProducto, type Producto } from "../api/producto_api";
import {
  getHomeConfig,
  type HomeConfig, type PerkIcon,
  DEFAULT_HOME_CONFIG,
} from "../api/home_config_api";

// ─── Colores de fallback por categoría (cuando no hay imagen config) ──────────

const CAT_BG: Record<string, string> = {
  mujer:      "bg-champagne-light",
  hombre:     "bg-navy/8",
  accesorios: "bg-[#F0EDE8]",
  ofertas:    "bg-rose-50",
};

const CAT_BG_FALLBACKS = [
  "bg-champagne-light", "bg-navy/8", "bg-[#F0EDE8]", "bg-rose-50", "bg-slate-100",
];

const PERK_ICON_MAP: Record<PerkIcon, typeof Truck> = {
  truck:  Truck,
  rotate: RotateCcw,
  shield: Shield,
  store:  Store,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number): string {
  return "$" + n.toLocaleString("es-AR");
}

function getProductImage(producto?: Producto): string | undefined {
  const image = producto?.imagenes?.[0];
  if (!image) return undefined;
  return typeof image === "string" ? image : image.src;
}

function formatDiscount(producto?: Producto): string | null {
  if (!producto) return null;
  const raw = producto.descuento?.trim();
  if (raw) {
    if (/^\d+(\.\d+)?$/.test(raw))  return `-${raw}%`;
    if (/^\d+(\.\d+)?%$/.test(raw)) return `-${raw}`;
    return raw;
  }
  if (!producto.precio_anterior) return null;
  return `-${Math.round((1 - producto.precio / producto.precio_anterior) * 100)}%`;
}

function productoToCard(producto: Producto): ProductCardProps {
  return {
    id:       producto.id,
    name:     producto.nombre,
    category: producto.categoria,
    price:    formatPrice(producto.precio),
    priceRaw: producto.precio,
    oldPrice: producto.precio_anterior ? formatPrice(producto.precio_anterior) : null,
    discount: formatDiscount(producto),
    images:   producto.imagenes.map((img) =>
      typeof img === "string" ? { src: img, alt: producto.nombre } : img,
    ),
    talles:  producto.talles_disponibles.filter((t) => t.stock > 0).map((t) => t.talle),
    colores: producto.colores ?? [],
    badge:   producto.badge,
    to:      `/producto/${producto.id}`,
  };
}

function buildSlide(
  cfg: HomeConfig["carousel"][number],
  fallback: Producto | undefined,
): CarouselSlide {
  return {
    badge:        cfg.badge,
    title:        cfg.title,
    titleAccent:  cfg.titleAccent,
    subtitle:     cfg.subtitle || fallback?.nombre || "",
    description:  cfg.description,
    image:        cfg.image || getProductImage(fallback) || "",
    imageAlt:     cfg.imageAlt || fallback?.nombre || "",
    primaryCta:   cfg.primaryCta,
    secondaryCta: cfg.secondaryCta,
    tags:         cfg.tags,
  };
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [homeConfig,        setHomeConfig]        = useState<HomeConfig>(DEFAULT_HOME_CONFIG);
  const [ofertasDestacadas, setOfertasDestacadas] = useState<Producto[]>([]);
  const [loadingOfertas,    setLoadingOfertas]    = useState(true);
  const [novedades,         setNovedades]         = useState<Producto[]>([]);
  const [loadingNovedades,  setLoadingNovedades]  = useState(true);
  const [carouselProds,     setCarouselProds]     = useState<Producto[]>([]);

  // Config del home (textos, slides, categorías, novedades_ids, perks, anuncios)
  useEffect(() => {
    getHomeConfig()
      .then(cfg => {
        setHomeConfig(cfg);

        // Si hay IDs de novedades explícitos, los fetcheamos por ID
        if (cfg.novedades_ids.length > 0) {
          setLoadingNovedades(true);
          Promise.all(cfg.novedades_ids.map(id => getProducto(id)))
            .then(prods => setNovedades(prods))
            .catch(() => setNovedades([]))
            .finally(() => setLoadingNovedades(false));
        }
      })
      .catch(() => setHomeConfig(DEFAULT_HOME_CONFIG));
  }, []);

  // Ofertas destacadas
  useEffect(() => {
    getOfertasDestacadas()
      .then(setOfertasDestacadas)
      .catch(() => setOfertasDestacadas([]))
      .finally(() => setLoadingOfertas(false));
  }, []);

  // Novedades: si novedades_ids tiene datos ya se cargan en el useEffect de config.
  // Este useEffect solo corre como fallback cuando novedades_ids está vacío.
  useEffect(() => {
    Promise.all([
      getProductos({ home_seccion: "carousel", limit: 3 }).then(r => r.productos),
      getProductos({ home_seccion: "novedades", limit: 4 }).then(r => r.productos),
      getProductos({ orden: "novedad", solo_stock: true, limit: 4 }).then(r => r.productos),
    ])
      .then(([carousel, nov, fallback]) => {
        setCarouselProds(carousel);
        // Solo pisamos novedades si no hay IDs config (esos ya se cargaron arriba)
        setNovedades(prev => {
          if (prev.length > 0) return prev;
          return nov.length > 0 ? nov : fallback;
        });
      })
      .catch(() => {})
      .finally(() => setLoadingNovedades(false));
  }, []);

  // Slides del carousel: texto del config + imagen del producto si slide.image está vacío
  const carouselSlides: CarouselSlide[] = homeConfig.carousel
    .filter(s => s.activo)
    .map((slideCfg, i) => {
      const fallback =
        i === 0 ? (carouselProds[0] ?? novedades[0])
        : i === 1 ? (carouselProds[1] ?? ofertasDestacadas[0])
        : carouselProds[2];
      return buildSlide(slideCfg, fallback);
    });

  // Cards de novedades
  const featuredProducts = novedades.slice(0, 4).map(productoToCard);

  // Announcement desde config
  const announcementItems: AnnouncementItem[] = homeConfig.announcement.map(a => ({
    icon:   a.icon || undefined,
    text:   a.text,
    accent: a.accent || undefined,
  }));

  return (
    <div className="bg-surface">

      {/* ══ Announcement bar ══════════════════════════════════════════════════ */}
      <AnnouncementBar items={announcementItems.length > 0 ? announcementItems : undefined} />

      {/* ══ Hero carousel ═════════════════════════════════════════════════════ */}
      <HomeCarousel slides={carouselSlides} autoPlay intervalMs={6000} />

      {/* ══ Perks strip ═══════════════════════════════════════════════════════ */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
            {homeConfig.perks.map(({ icon, label, text }) => {
              const Icon = PERK_ICON_MAP[icon] ?? Truck;
              return (
                <div key={label} className="flex items-center gap-3 px-5 py-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-navy/6 text-navy">
                    <Icon size={17} strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink">{label}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ Categorías ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-champagne">{homeConfig.categorias_section.eyebrow}</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{homeConfig.categorias_section.title}</h2>
            </div>
            <NavLink to="/catalogo"
              className="hidden items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-navy underline-offset-2 transition-colors hover:underline sm:flex">
              {homeConfig.categorias_section.linkText} <ArrowRight size={13} />
            </NavLink>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {homeConfig.categories.map((cat, i) => {
              const bg     = CAT_BG[cat.slug] ?? CAT_BG_FALLBACKS[i % CAT_BG_FALLBACKS.length];
              const hasImg = !!cat.image;
              return (
                <NavLink
                  key={cat.slug + i}
                  to={cat.to}
                  className={["group relative flex aspect-2/3 flex-col justify-end overflow-hidden p-5 transition-shadow duration-300 hover:shadow-lg hover:shadow-navy/10", bg].join(" ")}
                >
                  {hasImg && (
                    <img src={cat.image} alt={cat.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                  <div className={["absolute inset-0 bg-linear-to-t from-navy/70 via-navy/10 to-transparent transition-opacity duration-300",
                    hasImg ? "opacity-60 group-hover:opacity-90" : "opacity-0 group-hover:opacity-100"].join(" ")} />
                  <div className="relative">
                    <p className={["font-display text-xl font-bold sm:text-2xl", hasImg ? "text-white" : "text-ink"].join(" ")}>
                      {cat.name}
                    </p>
                    <p className={["mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-200",
                      hasImg
                        ? "text-white/70 opacity-0 group-hover:opacity-100 group-hover:text-white"
                        : "text-navy/60 opacity-0 group-hover:opacity-100 group-hover:text-navy"].join(" ")}>
                      {cat.caption} <ArrowRight size={11} />
                    </p>
                  </div>
                </NavLink>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══ Lo más nuevo ══════════════════════════════════════════════════════ */}
      <section className="border-t border-line bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-champagne">{homeConfig.novedades_section.eyebrow}</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{homeConfig.novedades_section.title}</h2>
            </div>
            <NavLink to="/catalogo"
              className="hidden items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-navy underline-offset-2 transition-colors hover:underline sm:flex">
              {homeConfig.novedades_section.linkText} <ArrowRight size={13} />
            </NavLink>
          </div>

          {loadingNovedades && novedades.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl bg-card">
                  <div className="aspect-[3/4] animate-pulse bg-surface" />
                  <div className="space-y-2 px-4 pb-4 pt-3">
                    <div className="h-3 w-16 animate-pulse rounded bg-surface" />
                    <div className="h-4 w-32 animate-pulse rounded bg-surface" />
                    <div className="mt-3 h-3 w-20 animate-pulse rounded bg-surface" />
                    <div className="mt-2 h-9 w-full animate-pulse rounded bg-surface" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}

        </div>
      </section>

      <PromoProductsSection
        productos={ofertasDestacadas}
        loading={loadingOfertas}
        eyebrow={homeConfig.ofertas_section.eyebrow}
        title={homeConfig.ofertas_section.title}
        linkText={homeConfig.ofertas_section.linkText}
      />

      {/* ══ Banner de marca ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-navy py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(199,169,139,0.07)_1px,transparent_1px)] bg-[size:22px_22px]" />
        <div className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-champagne/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-champagne/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-champagne/70">{homeConfig.brand_banner.eyebrow}</p>
          <h2 className="font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            {homeConfig.brand_banner.title}{" "}
            <span className="font-bold italic text-champagne">{homeConfig.brand_banner.titleAccent}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-white/60">
            {homeConfig.brand_banner.description}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <NavLink to={homeConfig.brand_banner.primaryCta.to}
              className="inline-flex items-center gap-2.5 bg-champagne px-7 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-navy shadow-lg shadow-champagne/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-champagne-light">
              <ShoppingBag size={14} /> {homeConfig.brand_banner.primaryCta.label}
            </NavLink>
            <NavLink to={homeConfig.brand_banner.secondaryCta.to}
              className="inline-flex items-center gap-2 border border-white/15 bg-white/8 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/14 hover:text-white">
              {homeConfig.brand_banner.secondaryCta.label} <ArrowRight size={13} />
            </NavLink>
          </div>
        </div>
      </section>

    </div>
  );
}
