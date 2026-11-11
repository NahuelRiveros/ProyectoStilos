import { Link } from "react-router-dom";
import { imagenCloudinary } from "../../../core/utils/imagen_cloudinary.js";
import { cn } from "../../../core/utils/cn.js";
import { LOGOS_MARCAS } from "../../../proyecto/config/marcas_config.js";
import { logoDeMarca } from "../utils/logo_marca.js";

// Con pocas marcas no hace falta moverlas: se ven todas juntas, centradas.
const MINIMO_PARA_MOVER = 5;
const SEGUNDOS_POR_MARCA = 3;

/**
 * ROP-26 y ROP-35: las marcas con prendas a la vista, en una cinta que se desplaza sola. Se frena al
 * pasar el mouse o con el foco; sin animación para quien la tiene desactivada (se desliza a mano).
 */
export default function CintaMarcas({ marcas }) {
  const mover = marcas.length >= MINIMO_PARA_MOVER;
  // La cinta se repite una vez para que el giro no tenga cortes; la copia no se lee ni se enfoca.
  const vueltas = mover ? [false, true] : [false];
  return (
    <div className={cn("cinta-marcas group relative", mover && "overflow-hidden motion-reduce:overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]")}>
      <style>{`
        @keyframes cinta-marcas { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .cinta-marcas__pista { animation: cinta-marcas var(--duracion) linear infinite; }
        .cinta-marcas:hover .cinta-marcas__pista, .cinta-marcas:focus-within .cinta-marcas__pista { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .cinta-marcas__pista { animation: none; } }
      `}</style>
      <ul className={cn("flex gap-3", mover ? "cinta-marcas__pista w-max" : "flex-wrap justify-center")}
        style={mover ? { "--duracion": `${marcas.length * SEGUNDOS_POR_MARCA}s` } : undefined}>
        {vueltas.flatMap((copia) => marcas.map((m) => {
          const logo = logoDeMarca(m, LOGOS_MARCAS);
          return (
            <li key={`${copia ? "copia-" : ""}${m.id}`} aria-hidden={copia || undefined} className="w-40 shrink-0 sm:w-48">
              <Link to={`/catalogo?marca=${m.id}`} tabIndex={copia ? -1 : undefined} aria-label={`Ver ${m.nombre}`}
                className="flex h-20 items-center justify-center rounded-2xl border border-(--kt-border) bg-white p-3 transition hover:border-(--kt-petrol)"
                style={logo?.fondo ? { backgroundColor: logo.fondo } : undefined}>
                {logo
                  ? <img src={imagenCloudinary(logo.url, 320)} alt={m.nombre} loading="lazy" className="max-h-full max-w-full object-contain" />
                  : <span className="kt-display text-center text-xl font-semibold text-(--kt-petrol)">{m.nombre}</span>}
              </Link>
            </li>
          );
        }))}
      </ul>
    </div>
  );
}
