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
    <section className="bg-card py-14 sm:py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-champagne">
              {section.eyebrow ?? "Categorias"}
            </p>
            <h2 className="font-display text-3xl font-black text-ink sm:text-4xl">
              {section.title ?? "Explora la tienda"}
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="hidden items-center gap-1.5 text-xs font-black uppercase tracking-widest text-navy underline-offset-2 hover:underline sm:flex"
          >
            {section.linkText ?? "Ver catalogo"} <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, index) => (
            <div
              key={`${cat.slug}-${index}`}
              className="group relative min-h-64 overflow-hidden rounded-xl bg-navy text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Link to={cat.to || "/catalogo"} className="absolute inset-0 z-0" aria-label={cat.name || "Categoria"} />
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-navy via-slate-800 to-ink" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-navy/95 via-navy/55 to-navy/10" />
              <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                <Link to={cat.to || "/catalogo"} className="relative inline-flex items-center gap-1.5 font-display text-2xl font-black hover:text-champagne">
                  {cat.name || "Categoria"} <ArrowRight size={16} />
                </Link>
                <p className="relative mt-1 text-xs font-bold uppercase tracking-widest text-champagne">
                  {cat.caption || "Ver mas"}
                </p>
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
    <section className="bg-card py-14 sm:py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-champagne">
              {section?.eyebrow ?? "Productos"}
            </p>
            <h2 className="font-display text-3xl font-black text-ink sm:text-4xl">
              {section?.title ?? fallbackTitle}
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="hidden items-center gap-1.5 text-xs font-black uppercase tracking-widest text-navy underline-offset-2 hover:underline sm:flex"
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
          <div className="rounded-2xl border border-line bg-surface px-5 py-10 text-center">
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
    <section className="border-y border-line bg-surface py-6">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {perks.slice(0, 4).map((perk, index) => {
          const Icon = PERK_ICONS[perk.icon] ?? Sparkles;
          return (
            <div key={`${perk.title}-${index}`} className="flex items-start gap-3 rounded-xl bg-card px-4 py-4 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-champagne-light text-champagne-dark">
                <Icon size={17} />
              </div>
              <div>
                <p className="text-sm font-black text-ink">{perk.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted">{perk.text}</p>
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
    <section className="bg-navy py-16 text-white sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-champagne">{banner.eyebrow}</p>
          <h2 className="font-display text-3xl font-black sm:text-5xl">
            {banner.title} <span className="text-champagne">{banner.titleAccent}</span>
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">{banner.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {banner.primaryCta && (
            <Link to={banner.primaryCta.to} className="rounded-xl bg-champagne px-5 py-3 text-sm font-black text-navy transition hover:bg-champagne-light">
              {banner.primaryCta.label}
            </Link>
          )}
          {banner.secondaryCta && (
            <Link to={banner.secondaryCta.to} className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
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
        const [homeConfig, carouselRes, novedadesRes, ofertasRes, allRes, catalogosRes] = await Promise.all([
          getHomeConfig(),
          getProductos({ home_seccion: "carousel", limit: 3 }),
          getProductos({ home_seccion: "novedades", limit: 8 }),
          getOfertasDestacadas().catch(() => []),
          getProductos({ limit: 12 }),
          getCatalogoNavegacion().catch(() => []),
        ]);

        if (cancelled) return;

        const selectedIds = homeConfig.novedades_ids ?? [];
        const selectedNovedades = selectedIds.length
          ? selectedIds
              .map((id) => allRes.productos.find((producto) => producto.id === id))
              .filter(Boolean)
          : novedadesRes.productos;

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
        <Link to="/catalogo" className="mt-4 rounded-xl bg-champagne px-5 py-2.5 text-sm font-black text-navy">
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
        <section className="bg-surface py-6 sm:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
