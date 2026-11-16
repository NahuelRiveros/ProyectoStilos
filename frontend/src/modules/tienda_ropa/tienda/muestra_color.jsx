import { cn } from "../../../core/utils/cn.js";
import { fondoDeColor } from "../utils/muestra_color.js";

/** ROP-86: círculo del color (liso, partido en dos o con su dibujo). El tamaño va en `className`. */
export default function MuestraColor({ color, className, title }) {
  return <span title={title} aria-hidden={title ? undefined : "true"} className={cn("block shrink-0 rounded-full border border-black/15", className)} style={{ background: fondoDeColor(color) }} />;
}
