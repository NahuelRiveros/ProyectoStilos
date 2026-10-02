import { Lightbulb } from "lucide-react";
import { proyecto } from "compartido/proyecto.js";
import { LIMITES_IMAGENES } from "compartido/reglas/imagenes_producto.js";

const TALLE_COLOR = proyecto.catalogo.variantes === "talle_color";
const { etiqueta_variantes } = proyecto.catalogo;

// Lo que se hace en cada paso, en el orden de la pantalla. Indumentaria y distribuidora se cargan distinto.
const PASOS = TALLE_COLOR
  ? [
      ["Datos", "nombre de la prenda (sin color ni talle, eso se elige abajo), categoría y marca."],
      ["Precio", "uno solo: vale para todos los colores y talles."],
      ["Colores y talles", "tocá los colores que tenés y elegí el grupo de talles. Se arma una fila por cada combinación (ej. Negro · M)."],
      ["Stock", "cargá cuántas unidades tenés de cada combinación (opcional) y tocá «Guardar producto»."],
      ["Fotos", `al guardar, cada color tiene en su tarjeta un lugar para subir sus fotos (hasta ${LIMITES_IMAGENES.por_color}). Las que sirven para todos los colores van arriba, en «Fotos generales».`],
    ]
  : [
      ["Datos", "nombre, categoría y marca."],
      [etiqueta_variantes, "cargá cada una con su precio (ej. 500 g, 1 kg)."],
      ["Guardar", "tocá «Guardar producto»."],
      ["Fotos", "al guardar te quedás en esta pantalla para subir las fotos."],
    ];

/** Guía corta para quien carga productos. Abierta al crear; al editar queda cerrada (se puede abrir). */
export default function GuiaCargaProducto({ abierta = true }) {
  return (
    <details open={abierta} className="rounded-2xl border border-borde bg-superficie p-4 text-sm">
      <summary className="flex cursor-pointer items-center gap-2 font-semibold">
        <Lightbulb className="h-4 w-4 text-acento" aria-hidden="true" /> Cómo cargar un producto, paso a paso
      </summary>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-texto-suave">
        {PASOS.map(([titulo, texto]) => (
          <li key={titulo}>
            <strong className="text-texto">{titulo}:</strong> {texto}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-texto-suave">
        Los campos con <span className="text-peligro">*</span> son obligatorios. Si algo queda mal, el formulario te marca en rojo qué corregir.
      </p>
    </details>
  );
}
