import { Link } from "react-router-dom";
import { Shirt } from "lucide-react";
import { imagenCloudinary } from "../../../core/utils/imagen_cloudinary.js";
import Precio, { EtiquetaOferta } from "./precio.jsx";
import { enOferta } from "../utils/dinero.js";

const MAX_PUNTOS = 5;

/** Tarjeta de la grilla: foto vertical (formato de ropa), nombre, precio y colores que hay. */
export default function PrendaCard({ prenda }) {
  const extra = prenda.colores.length - MAX_PUNTOS;
  return (
    <Link to={`/catalogo/${prenda.slug}`} className="group block min-w-0">
      <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-(--kt-bg-soft)">
        {prenda.foto
          ? <img
              src={imagenCloudinary(prenda.foto, 480)}
              alt={prenda.nombre}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
            />
          : <div className="flex h-full items-center justify-center text-(--kt-turquoise)"><Shirt size={56} strokeWidth={1.25} aria-hidden="true" /></div>}
        {prenda.agotada && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-(--kt-ink)">Agotada</span>
        )}
        {enOferta(prenda) && <EtiquetaOferta className="absolute right-3 top-3" />}
      </div>
      <div className="mt-3 px-0.5">
        <h3 className="truncate text-sm font-semibold text-(--kt-ink)">{prenda.nombre}</h3>
        <Precio prenda={prenda} className="mt-0.5" />
        {prenda.colores.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5" aria-label={`Colores: ${prenda.colores.map((c) => c.nombre).join(", ")}`}>
            {prenda.colores.slice(0, MAX_PUNTOS).map((c) => (
              <span key={c.id} title={c.nombre} className="h-3.5 w-3.5 rounded-full border border-black/15" style={{ backgroundColor: c.hex }} />
            ))}
            {extra > 0 && <span className="text-xs text-(--kt-ink-soft)">+{extra}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
