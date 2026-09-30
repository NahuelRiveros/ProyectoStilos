import { cn } from "@/utils/cn.js";
import { coloresDelProducto } from "../utils/galeria.js";
import { sinStock } from "../utils/disponibilidad.js";
import { colorAgotado, tallesDelColor, varianteAlCambiarColor } from "../utils/talle_color.js";

const claseFoco = "has-focus-visible:ring-2 has-focus-visible:ring-primario has-focus-visible:ring-offset-2";

/**
 * Ficha de una prenda: muestras de color y, debajo, los talles de ese color. Los talles (o colores)
 * sin stock se ven tachados pero se pueden elegir, para que el cliente vea "Sin stock" y no dude.
 */
export default function SelectorTalleColor({ producto, elegida, onElegir }) {
  const variantes = producto.variantes;
  const colores = coloresDelProducto(producto);
  const talles = tallesDelColor(variantes, elegida.color_id);
  const conTalles = talles.some((v) => v.talle);

  return (
    <div className="mt-6 space-y-5">
      {colores.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold">
            Color: <span className="font-normal text-texto-suave">{elegida.color?.nombre}</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {colores.map((c) => {
              const activo = c.id === elegida.color_id;
              const agotado = colorAgotado(variantes, c.id);
              return (
                <label key={c.id} title={c.nombre} className={cn("relative cursor-pointer rounded-full p-0.5", claseFoco, activo ? "ring-2 ring-primario" : "ring-1 ring-borde hover:ring-texto-suave")}>
                  <input
                    type="radio"
                    name="color"
                    value={c.id}
                    checked={activo}
                    onChange={() => onElegir(varianteAlCambiarColor(variantes, elegida, c.id))}
                    className="sr-only"
                  />
                  <span className={cn("block h-8 w-8 rounded-full border border-borde", agotado && "opacity-40")} style={{ backgroundColor: c.hex }} aria-hidden="true" />
                  {/* Raya diagonal: el color no tiene ningún talle con stock */}
                  {agotado && <span className="absolute inset-0 m-auto h-0.5 w-9 rotate-45 rounded bg-texto-suave" aria-hidden="true" />}
                  <span className="sr-only">
                    {c.nombre}
                    {agotado && " (sin stock)"}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {conTalles && (
        <fieldset>
          <legend className="text-sm font-semibold">Talle</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {talles.map((v) => {
              const activo = v.id === elegida.id;
              return (
                <label
                  key={v.id}
                  className={cn(
                    "min-w-12 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-semibold",
                    claseFoco,
                    activo ? "border-primario bg-primario text-primario-texto" : "border-borde hover:border-texto-suave",
                    sinStock(v) && !activo && "text-texto-suave line-through decoration-1",
                    sinStock(v) && activo && "line-through decoration-1",
                  )}
                >
                  <input type="radio" name="talle" value={v.id} checked={activo} onChange={() => onElegir(v)} className="sr-only" />
                  {v.talle?.nombre ?? "Único"}
                  {sinStock(v) && <span className="sr-only"> (sin stock)</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
