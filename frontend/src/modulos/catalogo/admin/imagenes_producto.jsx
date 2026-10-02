import { LIMITES_IMAGENES } from "compartido/reglas/imagenes_producto.js";
import { coloresDelProducto } from "../utils/galeria.js";
import GaleriaFotos, { MAX_MB, TODAS } from "./galeria_fotos.jsx";

const { por_color: POR_COLOR, generales: MAX_GENERALES } = LIMITES_IMAGENES;

/**
 * Sección de fotos de arriba del producto. En una prenda con colores muestra solo las generales:
 * las de cada color se suben en la tarjeta de ese color (en "Talles y colores"), así no hay dudas de a qué color pertenecen.
 */
export default function ImagenesProducto({ producto }) {
  const colores = coloresDelProducto(producto);
  const conColores = colores.length > 0;
  // Si la principal es de un color, no está en esta sección: se avisa dónde está.
  const colorPrincipal = colores.find((c) => c.id === producto.imagenes[0]?.color_id);

  return (
    <section className="rounded-2xl border border-borde bg-superficie p-5" aria-labelledby="titulo-imagenes">
      <h2 id="titulo-imagenes" className="text-lg font-bold">
        {conColores ? "Fotos generales" : "Imágenes"}
      </h2>
      {conColores ? (
        <div className="mt-2 rounded-xl bg-fondo p-3 text-sm text-texto-suave">
          <p>
            <strong className="text-texto">Las fotos de cada color se suben más abajo, en la tarjeta de ese color</strong> (sección «Talles y colores»):
            hasta {POR_COLOR} por color. Cuando el cliente elige o filtra un color, ve esas fotos.
          </p>
          <p className="mt-1">
            Acá van solo las fotos que sirven para todos los colores (hasta {MAX_GENERALES}), por ejemplo la guía de talles o un detalle de la tela.
          </p>
        </div>
      ) : (
        <p className="text-sm text-texto-suave">Hasta {MAX_GENERALES} imágenes por producto.</p>
      )}
      <p className="mb-4 mt-2 text-sm text-texto-suave">
        La foto con la ★ es la principal: la que se ve en el listado de la tienda. Cada foto, hasta {MAX_MB} MB; mejor cuadradas (las verticales se
        recortan en el listado).
        {colorPrincipal && ` Ahora la principal es una foto de ${colorPrincipal.nombre}.`}
      </p>
      <GaleriaFotos producto={producto} fotosDe={conColores ? null : TODAS} />
    </section>
  );
}
