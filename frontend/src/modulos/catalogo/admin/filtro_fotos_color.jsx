import { LIMITES_IMAGENES, contarImagenes, lugarImagenes } from "compartido/reglas/imagenes_producto.js";
import { cn } from "@/utils/cn.js";

export const TODAS = "todas";
export const GENERALES = "generales";
const { por_color: POR_COLOR, generales: MAX_GENERALES } = LIMITES_IMAGENES;

/**
 * Aviso de cuántas fotos se pueden subir y, en prendas con colores, los botones para ver (y subir)
 * las fotos de un color: "Negro (2/4)".
 */
export default function FiltroFotosColor({ imagenes, colores, filtro, onFiltrar }) {
  if (colores.length === 0) {
    return (
      <p className="mt-2 rounded-xl bg-fondo p-3 text-sm">
        <strong>Hasta {MAX_GENERALES} imágenes</strong> por producto.
      </p>
    );
  }

  const opciones = [
    { id: TODAS, nombre: `Todas (${imagenes.length})` },
    { id: GENERALES, nombre: `Generales (${contarImagenes(imagenes, null)}/${MAX_GENERALES})`, completo: lugarImagenes(imagenes, null) === 0 },
    ...colores.map((c) => ({ id: c.id, nombre: `${c.nombre} (${contarImagenes(imagenes, c.id)}/${POR_COLOR})`, hex: c.hex, completo: lugarImagenes(imagenes, c.id) === 0 })),
  ];

  return (
    <>
      <p className="mt-2 rounded-xl bg-fondo p-3 text-sm">
        <strong>Hasta {POR_COLOR} fotos por color</strong> y {MAX_GENERALES} generales (se ven con todos los colores, por ejemplo la guía de talles). Elegí un
        color para subir sus fotos: en la tienda, al elegir ese color se ven esas fotos.
      </p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Ver fotos de">
        {opciones.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={filtro === o.id}
            onClick={() => onFiltrar(o.id)}
            className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm", filtro === o.id ? "border-primario bg-primario/10 font-semibold" : "border-borde hover:border-primario")}
          >
            {o.hex && <span className="h-3.5 w-3.5 rounded-full border border-borde" style={{ backgroundColor: o.hex }} aria-hidden="true" />}
            {o.nombre}
            {o.completo && <span className="sr-only"> (completo)</span>}
          </button>
        ))}
      </div>
    </>
  );
}
