import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, ShoppingBag, Sparkles, Store, Shield, Truck, RotateCcw,
  Star, Percent, Zap, Heart, Crown, BadgeCheck, Clock, Package, MapPin, Phone,
} from "lucide-react";

import { getCatalogoNavegacion } from "../../api/catalogo_api";
import { getHomeConfig } from "../../api/home_config_api";
import { getOfertasDestacadas, getProductos } from "../../api/producto_api";
import AnnouncementBar from "./announcement_bar";
import HomeCarousel from "./home_carousel";
import ProductCard from "./product_card";
import PromoProductsSection from "./promo_products_section";

const PERK_ICONS = {
  store:    Store,
  shield:   Shield,
  truck:    Truck,
  rotate:   RotateCcw,
  sparkles: Sparkles,
  star:     Star,
  percent:  Percent,
  zap:      Zap,
  heart:    Heart,
  crown:    Crown,
  badge:    BadgeCheck,
  package:  Package,
  bag:      ShoppingBag,
  pin:      MapPin,
  phone:    Phone,
};

function formatPrice(n) {
  return "$" + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 });
}

function formatDiscount(producto) {
  if (producto.descuento) return producto.descuento;
  if (!producto.precio_anterior) return null;
  return `-${Math.round((1 - producto.precio / producto.precio_anterior) * 100)}%`;
}

function productoToCard(producto) {
  return {
    id: producto.id,
    name: producto.nombre,
    category: producto.categoria,
    price: formatPrice(producto.precio),
    oldPrice: producto.precio_anterior ? formatPrice(producto.precio_anterior) : null,
    discount: formatDiscount(producto),
    images: producto.imagenes?.map((img) => (typeof img === "string" ? { src: img } : img)) ?? [],
    talles: producto.talles_disponibles?.filter((t) => t.stock > 0).map((t) => t.talle) ?? [],
    colores: producto.colores ?? [],
    badge: producto.badge,
    to: `/producto/${producto.id}`,
  };
}

function buildSlides(configSlides, carouselProducts) {
  return configSlides
    .filter((slide) => slide.activo !== false)
    .map((slide, index) => {
      const producto = carouselProducts[index];
      const imagenProducto = producto?.imagenes?.[0];
      const image = slide.image || (typeof imagenProducto === "string" ? imagenProducto : imagenProducto?.src) || "";

      return {
        ...slide,
        image,
        imageAlt: slide.imageAlt || producto?.nombre || slide.title,
      };
    });
}

function buildHomeCategories(configCategories, catalogos) {
  // Mapa de navegación para enriquecer con subcategorías y links
  const productosGroup = catalogos.find((g) => g.slug === "catalogo");
  const navSource = productosGroup?.items?.length
    ? productosGroup.items
    : catalogos.filter((g) => g.slug !== "catalogo");

  const navMap = {};
  navSource.forEach((item) => { navMap[item.slug] = item; });

  // El home config es la fuente primaria: muestra lo que el admin configuró
  if (configCategories?.length) {
    return configCategories.map((cat) => {
      const nav = navMap[cat.slug];
      return {
        slug:    cat.slug,
        name:    cat.name    || nav?.label || cat.slug,
        caption: cat.caption || "Ver productos",
        to:      cat.to      || nav?.to    || "/catalogo",
        image:   cat.image   ?? "",
        items:   nav?.items  ?? nav?.children ?? [],
      };
    });
  }

  // Fallback: si el admin no configuró nada, usa el catálogo de navegación
  return navSource.map((item) => ({
    slug:    item.slug,
    name:    item.label,
    caption: "Ver productos",
    to:      item.to,
    image:   "",
    items:   item.items ?? item.children ?? [],
  }));
}

function CategorySection({ config, catalogos }) {
  const categories = buildHomeCategories(config.categories, catalogos);
  const section = config.categorias_section ?? {};
  if (!categories.length) return null;

  return (
    <section className="section-ui">
      <div className="section-inner">
        <div className="section-head">
          <div>
            <p className="eyebrow">
              {section.eyebrow ?? "Categorias"}
            </p>
            <h2 className="section-title">
              {section.title ?? "Explora la tienda"}
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="text-link hidden sm:flex"
          >
            {section.linkText ?? "Ver catalogo"} <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, index) => (
            <div
              key={`${cat.slug}-${index}`}
              className="category-tile group"
            >
              <Link to={cat.to || "/catalogo"} className="absolute inset-0 z-0" aria-label={cat.name || "Categoria"} />
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-navy via-slate-800 to-ink" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-navy via-navy/60 to-navy/5 transition-opacity duration-300 group-hover:opacity-90" />
              {/* Accent line top on hover */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-champagne/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 z-10 p-6">
                <p className="relative mb-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-champagne/70 transition-colors duration-300 group-hover:text-champagne">
                  {cat.caption || "Ver mas"}
                </p>
                <Link to={cat.to || "/catalogo"} className="relative inline-flex items-center gap-2 font-display text-2xl font-black transition-all duration-300 hover:text-champagne sm:text-3xl">
                  {cat.name || "Categoria"}
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                {cat.items?.length > 0 && (
                  <div className="relative mt-4 flex flex-wrap gap-2">
                    {cat.items.slice(0, 5).map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur transition hover:border-champagne/50 hover:text-champagne"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductsSection({ productos, loading, section, fallbackTitle }) {
  return (
    <section className="section-ui">
      <div className="section-inner">
        <div className="section-head">
          <div>
            <p className="eyebrow">
              {section?.eyebrow ?? "Productos"}
            </p>
            <h2 className="section-title">
              {section?.title ?? fallbackTitle}
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="text-link hidden sm:flex"
          >
            {section?.linkText ?? "Ver catalogo"} <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-surface" />
            ))}
          </div>
        ) : productos.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {productos.slice(0, 4).map((producto) => (
              <ProductCard key={producto.id} {...productoToCard(producto)} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ShoppingBag size={32} className="mx-auto mb-3 text-muted/40" />
            <p className="text-sm font-semibold text-muted">Todavia no hay productos para mostrar en esta seccion.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function PerksSection({ perks }) {
  if (!perks?.length) return null;

  return (
    <section className="section-ui py-8 sm:py-10">
      <div className="section-inner grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {perks.slice(0, 4).map((perk, index) => {
          const Icon = PERK_ICONS[perk.icon] ?? Sparkles;
          return (
            <div key={`${perk.title}-${index}`} className="card-ui card-hover group flex items-start gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-champagne-light text-champagne-dark ring-1 ring-champagne/20 transition-all duration-200 group-hover:bg-champagne/20 group-hover:ring-champagne/40">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-ink">{perk.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{perk.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BrandBanner({ config }) {
  const banner = config.brand_banner;
  if (!banner) return null;

  return (
    <section className="relative overflow-hidden bg-navy py-20 text-white sm:py-24">
      {/* Ambient glows */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-champagne/5 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-champagne/4 blur-3xl" />
      {/* Dot grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, #fbbf24 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-champagne/20 bg-champagne/10 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-champagne">{banner.eyebrow}</p>
          </div>
          <h2 className="font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {banner.title}{" "}
            <span className="text-champagne">{banner.titleAccent}</span>
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">{banner.description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:min-w-52">
          {banner.primaryCta && (
            <Link
              to={banner.primaryCta.to}
              className="btn btn-accent btn-lg group"
            >
              {banner.primaryCta.label}
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          )}
          {banner.secondaryCta && (
            <Link
              to={banner.secondaryCta.to}
              className="btn btn-outline btn-lg border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              {banner.secondaryCta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [config, setConfig] = useState(null);
  const [carouselProducts, setCarouselProducts] = useState([]);
  const [novedades, setNovedades] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [catalogos, setCatalogos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadHome() {
      setLoading(true);
      try {
        const [homeConfig, carouselRes, novedadesRes, ofertasRes, catalogosRes] = await Promise.all([
          getHomeConfig(),
          getProductos({ home_seccion: "carousel", limit: 3 }),
          getProductos({ home_seccion: "novedades", limit: 8 }),
          getOfertasDestacadas().catch(() => []),
          getCatalogoNavegacion().catch(() => []),
        ]);

        if (cancelled) return;

        const selectedIds = homeConfig.novedades_ids ?? [];
        // Carga los productos por ID exacto si el admin los seleccionó manualmente
        let selectedNovedades;
        if (selectedIds.length) {
          const { productos: byIds } = await getProductos({ ids: selectedIds.join(","), limit: selectedIds.length });
          // Respeta el orden elegido por el admin
          selectedNovedades = selectedIds
            .map((id) => byIds.find((p) => p.id === id))
            .filter(Boolean);
        } else {
          selectedNovedades = novedadesRes.productos;
        }

        setConfig(homeConfig);
        setCarouselProducts(carouselRes.productos);
        setNovedades(selectedNovedades);
        setOfertas(ofertasRes);
        setCatalogos(catalogosRes);
      } catch {
        if (!cancelled) {
          setConfig(null);
          setCarouselProducts([]);
          setNovedades([]);
          setOfertas([]);
          setCatalogos([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHome();
    return () => {
      cancelled = true;
    };
  }, []);

  const slides = useMemo(
    () => buildSlides(config?.carousel ?? [], carouselProducts),
    [config, carouselProducts],
  );

  if (!config && loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-[520px] animate-pulse rounded-3xl bg-card" />
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-surface px-4 text-center">
        <ShoppingBag size={42} className="mb-3 text-muted/40" />
        <p className="text-lg font-black text-ink">No se pudo cargar el home</p>
        <Link to="/catalogo" className="btn btn-accent mt-4">
          Ir al catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card">
      {config.announcement_activo !== false && (
        <AnnouncementBar items={config.announcement} />
      )}

      {config.carousel_activo !== false && (
        <section className="section-muted">
          <div className="section-inner">
            <HomeCarousel slides={slides} autoPlay intervalMs={6000} />
          </div>
        </section>
      )}

      {config.perks_activo !== false && (
        <PerksSection perks={config.perks} />
      )}

      {config.categorias_section?.activo !== false && (
        <CategorySection config={config} catalogos={catalogos} />
      )}

      {config.novedades_section?.activo !== false && (
        <ProductsSection
          productos={novedades}
          loading={loading}
          section={config.novedades_section}
          fallbackTitle="Lo mas nuevo"
        />
      )}

      {config.ofertas_section?.activo !== false && (
        <PromoProductsSection
          productos={ofertas}
          loading={loading}
          eyebrow={config.ofertas_section?.eyebrow ?? "Ofertas"}
          title={config.ofertas_section?.title ?? "Precios destacados"}
          linkText={config.ofertas_section?.linkText ?? "Ver catalogo"}
        />
      )}

      {config.brand_banner?.activo !== false && (
        <BrandBanner config={config} />
      )}
    </div>
  );
}
