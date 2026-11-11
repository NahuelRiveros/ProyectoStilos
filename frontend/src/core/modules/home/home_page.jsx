import { Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useBannersVigentes } from "../../hooks/use_banners.js";
import { brandConfig } from "../../../proyecto/config/brand_config.js";
import { HOME_TIENDA } from "../../../proyecto/config/home_config.js";
import { tiendaActiva } from "../../../proyecto/modulos_activos.js";
import { pantallasActivas } from "../../../proyecto/pantallas_modulos.jsx";
import BannerCarrusel from "./banner_carrusel.jsx";

/**
 * Home de tienda (SIS-30): promociones vigentes, el nombre de la tienda y los productos que
 * aporta el rubro (`InicioTienda` en pantallas_modulos.jsx). Sin promociones, el nombre pasa a
 * ser la portada. Si los banners no cargan, la tienda se sigue viendo: no se muestra un error.
 */
export default function HomePage() {
  const { banners, isLoading } = useBannersVigentes();
  const conCarrusel = banners.carrusel.length > 0;

  return (
    <div className="kt-body min-h-screen bg-white text-(--kt-ink)">
      {isLoading
        ? <div aria-hidden="true" className="aspect-video w-full animate-pulse bg-(--kt-bg-soft) sm:aspect-3/1" />
        : <BannerCarrusel banners={banners.carrusel} />}

      <section className={`px-4 sm:px-6 ${conCarrusel || isLoading ? "py-8" : "bg-linear-to-b from-(--kt-bg-soft) to-white py-16 sm:py-20"}`}>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className={`kt-display font-bold leading-tight ${conCarrusel ? "text-2xl sm:text-3xl" : "text-3xl sm:text-5xl"}`}>
              {brandConfig.nombre}
            </h1>
            {brandConfig.tagline && <p className="mt-2 max-w-xl text-base text-(--kt-ink-soft) sm:text-lg">{brandConfig.tagline}</p>}
          </div>
          {tiendaActiva && (
            <Link
              to={tiendaActiva.catalogo}
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-(--kt-accent-comercial) px-6 py-3 text-sm font-bold text-white transition hover:bg-(--kt-accent-comercial-hover) sm:self-auto"
            >
              Ver catálogo <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )}
        </div>
      </section>

      {pantallasActivas.map(({ codigo, InicioTienda }) => InicioTienda && (
        <Suspense key={codigo} fallback={null}><InicioTienda textos={HOME_TIENDA} /></Suspense>
      ))}
    </div>
  );
}
