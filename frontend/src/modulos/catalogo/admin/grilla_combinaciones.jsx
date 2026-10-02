import { proyecto } from "compartido/proyecto.js";
import CheckboxField from "@/componentes/ui/checkbox_field.jsx";
import InputField from "@/componentes/ui/input_field.jsx";
import { LIMITES_IMAGENES, contarImagenes } from "compartido/reglas/imagenes_producto.js";
import GaleriaFotos from "./galeria_fotos.jsx";
import { claveCombinacion, listarCombinaciones } from "./talle_color_valores.js";

const CON_STOCK = proyecto.modulos.stock;

/**
 * Fotos de un color, dentro de su tarjeta: así queda claro a qué color pertenece cada foto. El color tiene que
 * estar guardado en la prenda (el servidor no acepta fotos de un color que la prenda todavía no tiene).
 */
function FotosDelColor({ producto, color }) {
  const guardado = producto?.variantes.some((v) => v.color_id === color.id);
  return (
    <div className="border-b border-borde px-4 py-3">
      <p className="mb-2 text-sm font-semibold">
        Fotos de {color.nombre}
        {guardado && (
          <span className="font-normal text-texto-suave">
            {" "}
            ({contarImagenes(producto.imagenes, color.id)} de {LIMITES_IMAGENES.por_color})
          </span>
        )}
      </p>
      {guardado ? (
        <GaleriaFotos producto={producto} fotosDe={color.id} />
      ) : (
        <p className="text-sm text-texto-suave">
          {producto ? "Guardá los cambios" : "Guardá el producto"} y vas a poder subir acá las fotos de {color.nombre}.
        </p>
      )}
    </div>
  );
}

/**
 * Una tarjeta por color con sus fotos y una fila por talle: código, stock y "A la venta" de cada combinación.
 * El stock inicial se carga solo en las combinaciones nuevas; el de las que ya existen se ajusta desde Stock.
 */
export default function GrillaCombinaciones({ register, errors, colores, talles, coloresElegidos, tallesElegidos, producto = null }) {
  const combinaciones = listarCombinaciones({ colores: coloresElegidos, talles: tallesElegidos });
  if (combinaciones.length === 0) {
    return <p className="rounded-xl border border-dashed border-borde p-6 text-center text-sm text-texto-suave">Elegí al menos un color o un talle para armar las combinaciones.</p>;
  }

  // Índice de cada combinación en lo que se envía: los errores del servidor vienen como variantes.<i>.campo.
  const indice = new Map(combinaciones.map((c, i) => [c.clave, i]));
  const existentes = new Map((producto?.variantes ?? []).map((v) => [claveCombinacion(v.color_id, v.talle_id), v]));
  const colorPorId = new Map(colores.map((c) => [c.id, c]));
  const tallePorId = new Map(talles.map((t) => [t.id, t]));
  const grupos = coloresElegidos.length ? coloresElegidos : [null];
  const filas = tallesElegidos.length ? tallesElegidos : [null];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-fondo p-3 text-sm text-texto-suave">
        <p className="font-semibold text-texto">
          {combinaciones.length} combinación{combinaciones.length === 1 ? "" : "es"}. En cada una podés completar:
        </p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>
            <strong className="text-texto">Código</strong> (opcional): el que usás vos. Sirve para encontrarla y para actualizar precios o stock desde Excel.
          </li>
          {CON_STOCK && (
            <li>
              <strong className="text-texto">Stock inicial</strong>: cuántas unidades tenés hoy. Vacío = no se controla el stock de esa combinación. Después se
              cambia desde Stock.
            </li>
          )}
          <li>
            <strong className="text-texto">A la venta</strong>: destildalo si esa combinación no se vende por ahora (no se borra).
          </li>
        </ul>
      </div>
      {grupos.map((color_id) => {
        const color = colorPorId.get(color_id);
        return (
          <section key={color_id ?? "sin-color"} className="rounded-xl border border-borde" aria-label={color ? `Color ${color.nombre}` : "Sin color"}>
            <h3 className="flex items-center gap-2 border-b border-borde px-4 py-2 font-semibold">
              {color && <span className="h-4 w-4 rounded-full border border-borde" style={{ backgroundColor: color.hex }} aria-hidden="true" />}
              {color?.nombre ?? "Sin color"}
            </h3>
            {color && <FotosDelColor producto={producto} color={color} />}
            <ul className="divide-y divide-borde">
              {filas.map((talle_id) => {
                const clave = claveCombinacion(color_id, talle_id);
                const nombre = [color?.nombre, tallePorId.get(talle_id)?.nombre].filter(Boolean).join(" · ");
                const existente = existentes.get(clave);
                const err = errors.variantes?.[indice.get(clave)] ?? {};
                return (
                  <li key={clave} className="grid items-start gap-3 px-4 py-3 sm:grid-cols-[4rem_1fr_9rem_auto]" aria-label={nombre}>
                    <span className="pt-2 font-semibold">{tallePorId.get(talle_id)?.nombre ?? "Único"}</span>
                    <InputField name={`combinaciones.${clave}.sku`} register={register} error={err.sku?.message} placeholder="Código / SKU" aria-label={`Código de ${nombre}`} />
                    {CON_STOCK &&
                      (existente ? (
                        <p className="pt-2 text-sm text-texto-suave">{existente.controla_stock ? `Stock: ${existente.cantidad_disponible ?? 0}` : "Sin control de stock"}</p>
                      ) : (
                        <InputField
                          name={`combinaciones.${clave}.stock_inicial`}
                          register={register}
                          error={err.stock_inicial?.message}
                          type="number"
                          min={0}
                          placeholder="Stock inicial"
                          aria-label={`Stock inicial de ${nombre}`}
                        />
                      ))}
                    <div className="pt-2">
                      <CheckboxField label="A la venta" name={`combinaciones.${clave}.activo`} register={register} defaultChecked={existente?.activo ?? true} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
