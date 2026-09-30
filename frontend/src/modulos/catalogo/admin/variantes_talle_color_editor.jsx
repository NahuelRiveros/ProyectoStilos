import { Link } from "react-router-dom";
import { useWatch } from "react-hook-form";
import { Check } from "lucide-react";
import { proyecto } from "compartido/proyecto.js";
import InputField from "@/componentes/ui/input_field.jsx";
import SelectField from "@/componentes/ui/select_field.jsx";
import { cn } from "@/utils/cn.js";
import { formatearDinero } from "@/utils/formatear_dinero.js";
import { useColores, useGruposTalle } from "../hooks/use_catalogo.js";
import { leyendaIva, precioVisible } from "../utils/precios.js";
import GrillaCombinaciones from "./grilla_combinaciones.jsx";

const OPCIONES_IVA = proyecto.catalogo.alicuotas_iva.map((a) => ({ valor: a, etiqueta: `${String(a).replace(".", ",")} %` }));
const claseBotonLista = "text-sm font-semibold text-primario hover:underline";

// Primer error de un campo común (el precio se repite en todas las variantes que se envían).
const errorComun = (errors, campo) => (Array.isArray(errors.variantes) ? errors.variantes.find((e) => e?.[campo])?.[campo]?.message : undefined);

// Los elegidos se guardan en el orden de la lista del panel (así la grilla y la tienda salen ordenadas).
const alternar = (elegidos, id, lista) => {
  const nuevos = elegidos.includes(id) ? elegidos.filter((x) => x !== id) : [...elegidos, id];
  return lista.map((item) => item.id).filter((x) => nuevos.includes(x));
};

function PrecioEnTienda({ control }) {
  const [precio, iva] = useWatch({ control, name: ["precio", "iva_porcentaje"] });
  const numero = Number(String(precio ?? "").replace(",", "."));
  const valido = precio !== "" && Number.isFinite(numero) && numero >= 0;
  return (
    <p className="text-sm text-texto-suave sm:col-span-3" aria-live="polite">
      Precio en tienda: <strong className="text-texto">{valido ? formatearDinero(precioVisible(numero, iva)) : "—"}</strong> ({leyendaIva}). Es el mismo para todos los talles y colores.
    </p>
  );
}

/** Indumentaria: precio único + colores + talles de un grupo → una variante por combinación. */
export default function VariantesTalleColorEditor({ control, register, setValue, errors, producto = null }) {
  const colores = useColores();
  const grupos = useGruposTalle();
  const [coloresElegidos = [], tallesElegidos = [], grupoId] = useWatch({ control, name: ["colores", "talles", "grupo_talle_id"] });
  const grupo = (grupos.data ?? []).find((g) => String(g.id) === String(grupoId));
  const elegir = (campo, valor) => setValue(campo, valor, { shouldDirty: true });
  // Al cambiar de grupo, los talles elegidos del grupo anterior ya no valen.
  const registrarGrupo = (nombre) => register(nombre, { onChange: () => elegir("talles", []) });
  const errorVariantes = errors.variantes?.message ?? errors.variantes?.root?.message;

  return (
    <section className="space-y-6 rounded-2xl border border-borde bg-superficie p-5">
      <div>
        <h2 className="text-lg font-bold">{proyecto.catalogo.etiqueta_variantes}</h2>
        <p className="text-sm text-texto-suave">Elegí los colores y talles que tenés de esta prenda. Se arma una combinación por cada color y talle.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <InputField label="Precio neto" name="precio" register={register} error={errorComun(errors, "precio")} inputMode="decimal" required />
        <SelectField label="IVA" name="iva_porcentaje" register={register} opciones={OPCIONES_IVA} error={errorComun(errors, "iva_porcentaje")} />
        <InputField label="Precio anterior" name="precio_anterior" register={register} error={errorComun(errors, "precio_anterior")} inputMode="decimal" ayuda="Opcional, para mostrarlo en oferta" />
        <PrecioEnTienda control={control} />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">Colores</legend>
        {colores.data?.length === 0 ? (
          <p className="mt-1 text-sm text-texto-suave">
            No hay colores cargados. <Link to="/admin/catalogo/colores" className={claseBotonLista}>Cargalos en Colores</Link>
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {(colores.data ?? []).map((c) => {
              const activo = coloresElegidos.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => elegir("colores", alternar(coloresElegidos, c.id, colores.data))}
                  className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm", activo ? "border-primario bg-primario/10 font-semibold" : "border-borde hover:border-primario")}
                >
                  <span className="relative h-5 w-5 rounded-full border border-borde" style={{ backgroundColor: c.hex }} aria-hidden="true">
                    {activo && <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white mix-blend-difference" />}
                  </span>
                  {c.nombre}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      <div className="space-y-2">
        <SelectField
          label="Grupo de talles"
          name="grupo_talle_id"
          register={registrarGrupo}
          opciones={(grupos.data ?? []).map((g) => ({ valor: g.id, etiqueta: g.nombre }))}
          placeholder="Sin talles (varía solo por color)"
          error={errors.grupo_talle_id?.message}
          className="sm:max-w-xs"
        />
        {grupo && (
          <fieldset>
            <legend className="sr-only">Talles de {grupo.nombre}</legend>
            <div className="flex flex-wrap items-center gap-2">
              {grupo.talles.map((t) => {
                const activo = tallesElegidos.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => elegir("talles", alternar(tallesElegidos, t.id, grupo.talles))}
                    className={cn("min-w-11 rounded-lg border px-3 py-1.5 text-sm font-semibold", activo ? "border-primario bg-primario text-primario-texto" : "border-borde hover:border-primario")}
                  >
                    {t.nombre}
                  </button>
                );
              })}
              <button type="button" onClick={() => elegir("talles", grupo.talles.map((t) => t.id))} className={claseBotonLista}>
                Todos
              </button>
            </div>
          </fieldset>
        )}
      </div>

      {errorVariantes && <p className="text-sm text-peligro">{errorVariantes}</p>}
      <GrillaCombinaciones
        register={register}
        errors={errors}
        colores={colores.data ?? []}
        talles={grupo?.talles ?? []}
        coloresElegidos={coloresElegidos}
        tallesElegidos={tallesElegidos}
        producto={producto}
      />
    </section>
  );
}
