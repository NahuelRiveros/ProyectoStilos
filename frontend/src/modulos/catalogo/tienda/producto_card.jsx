import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { formatearDinero } from "@/utils/formatear_dinero.js";
import { ANCHOS, urlImagen } from "@/utils/imagenes.js";
import Insignia from "@/componentes/ui/insignia.jsx";
import { leyendaIva, precioVisible, presentacionMasBarata } from "../utils/precios.js";
import { productoAgotado } from "../utils/disponibilidad.js";
import { coloresDelProducto } from "../utils/galeria.js";
import { conDescuento, mejorDescuento } from "compartido/reglas/pagos.js";
import { usePagos } from "@/hooks/use_pagos.js";

/** `ancho`: el tamaño en que se muestra (Cloudinary entrega la foto a esa medida, no la original). */
export function ImagenProducto({ imagen, nombre, className = "", ancho = ANCHOS.tarjeta, prioridad = false }) {
  if (!imagen) {
    return (
      <div className={`flex items-center justify-center bg-fondo text-texto-suave ${className}`} aria-hidden="true">
        <Package className="h-10 w-10" />
      </div>
    );
  }
  return (
    <img
      src={urlImagen(imagen.url, ancho)}
      alt={imagen.alt || nombre}
      loading={prioridad ? "eager" : "lazy"}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}

// En la tarjeta entran unas 5 muestras; el resto se resume en "+N".
const MAX_MUESTRAS = 5;

function MuestrasColor({ colores }) {
  if (colores.length === 0) return null;
  const visibles = colores.slice(0, MAX_MUESTRAS);
  const resto = colores.length - visibles.length;
  return (
    <p className="mt-2 flex items-center gap-1">
      <span className="sr-only">Colores: {colores.map((c) => c.nombre).join(", ")}</span>
      {visibles.map((c) => (
        <span key={c.id} className="h-4 w-4 rounded-full border border-borde" style={{ backgroundColor: c.hex }} title={c.nombre} aria-hidden="true" />
      ))}
      {resto > 0 && <span className="text-xs text-texto-suave" aria-hidden="true">+{resto}</span>}
    </p>
  );
}

export default function ProductoCard({ producto }) {
  const masBarata = presentacionMasBarata(producto);
  // "Desde" solo si de verdad hay precios distintos (en una prenda, todos los talles y colores cuestan lo mismo).
  const varias = new Set(producto.variantes.map((v) => Number(v.precio))).size > 1;
  const agotado = productoAgotado(producto);
  // El mejor descuento por medio de pago (ej. transferencia) se muestra también en el listado.
  const { data: pagos } = usePagos();
  const descuento = pagos ? mejorDescuento(pagos) : null;

  return (
    <Link
      to={`/catalogo/${producto.slug}`}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-borde bg-superficie transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        <ImagenProducto imagen={producto.imagenes?.[0]} nombre={producto.nombre} className={`aspect-square w-full ${agotado ? "opacity-60 grayscale" : ""}`} />
        {agotado && (
          <span className="absolute left-2 top-2">
            <Insignia tono="peligro">Sin stock</Insignia>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-texto-suave">{producto.categoria?.nombre}</p>
        <h3 className="mt-1 font-semibold group-hover:text-primario">{producto.nombre}</h3>
        {producto.marca && <p className="text-sm text-texto-suave">{producto.marca.nombre}</p>}
        <MuestrasColor colores={coloresDelProducto(producto)} />
        {masBarata && (
          <div className="mt-auto pt-3">
            {masBarata.precio_anterior && (
              <p className="text-sm text-texto-suave line-through">{formatearDinero(precioVisible(masBarata.precio_anterior, masBarata.iva_porcentaje))}</p>
            )}
            <p className="text-lg font-bold">
              {varias && <span className="text-sm font-normal text-texto-suave">Desde </span>}
              {formatearDinero(precioVisible(masBarata.precio, masBarata.iva_porcentaje))}
            </p>
            <p className="text-xs text-texto-suave">{leyendaIva}</p>
            {descuento && (
              <p className="mt-1 text-sm">
                <strong className="tabular-nums">{formatearDinero(conDescuento(precioVisible(masBarata.precio, masBarata.iva_porcentaje), descuento.descuento).total)}</strong>{" "}
                <span className="text-texto-suave">con {descuento.etiqueta.toLowerCase()}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
