import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { grupoTalleSchema } from "compartido/schemas/atributos.js";
import Boton from "@/componentes/ui/boton.jsx";
import FormError from "@/componentes/ui/form_error.jsx";
import InputField from "@/componentes/ui/input_field.jsx";
import Modal from "@/componentes/ui/modal.jsx";
import SubmitButton from "@/componentes/ui/submit_button.jsx";
import { aplicarErroresServidor } from "@/utils/errores_formulario.js";

// "S, M, L" o "36 38 40" → ["S", "M", "L"]
const separarTalles = (texto) =>
  texto
    .split(/[,;\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);

/** Crear o editar un grupo de talles. El orden de la lista es el orden en que se muestran (S, M, L...). */
export default function GrupoTalleFormModal({ grupo = null, onGuardar, onCerrar }) {
  const [errorGeneral, setErrorGeneral] = useState("");
  const [nuevos, setNuevos] = useState("");
  const {
    register,
    control,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(grupoTalleSchema),
    defaultValues: {
      nombre: grupo?.nombre ?? "",
      orden: grupo?.orden ?? 0,
      talles: grupo?.talles.map(({ id, nombre }) => ({ id, nombre })) ?? [],
    },
  });
  // keyName "clave": useFieldArray usa "id" por defecto y taparía el id del talle.
  const { fields, append, remove, move } = useFieldArray({ control, name: "talles", keyName: "clave" });

  function agregar() {
    // Sin repetir los que ya están en la lista (ni dos veces el mismo en lo escrito).
    const existentes = new Set(getValues("talles").map((t) => t.nombre.toLowerCase()));
    const aSumar = [];
    for (const nombre of separarTalles(nuevos)) {
      if (existentes.has(nombre.toLowerCase())) continue;
      existentes.add(nombre.toLowerCase());
      aSumar.push({ nombre });
    }
    append(aSumar);
    setNuevos("");
  }

  async function enviar(datos) {
    setErrorGeneral("");
    try {
      await onGuardar(grupo ? { ...datos, id: grupo.id } : datos);
    } catch (error) {
      setErrorGeneral(aplicarErroresServidor(error, setError, ["nombre", "orden", "talles"]));
    }
  }

  return (
    <Modal abierto onCerrar={onCerrar} titulo={grupo ? "Editar grupo de talles" : "Nuevo grupo de talles"} ocupado={isSubmitting}>
      <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
        <InputField label="Nombre del grupo" name="nombre" register={register} error={errors.nombre?.message} required autoFocus placeholder="Ej: Ropa, Jeans, Calzado" />

        <div>
          <label htmlFor="talles-nuevos" className="text-sm font-semibold text-texto">
            Agregar talles
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="talles-nuevos"
              value={nuevos}
              onChange={(e) => setNuevos(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                agregar();
              }}
              placeholder="Ej: S, M, L, XL"
              className="w-full rounded-xl border border-borde bg-superficie px-3 py-2 outline-none focus:border-primario focus:ring-2 focus:ring-primario/20"
            />
            <Boton variante="secundario" onClick={agregar} disabled={!nuevos.trim()}>
              Agregar
            </Boton>
          </div>
          <p className="mt-1 text-sm text-texto-suave">Podés escribir varios separados por coma o espacio.</p>
        </div>

        {fields.length > 0 && (
          <ol className="space-y-2" aria-label="Talles del grupo">
            {fields.map((campo, i) => (
              <li key={campo.clave} className="flex items-start gap-2">
                <span className="mt-2.5 w-6 text-right text-xs text-texto-suave">{i + 1}.</span>
                <InputField name={`talles.${i}.nombre`} register={register} error={errors.talles?.[i]?.nombre?.message} aria-label={`Talle ${i + 1}`} />
                <Boton variante="fantasma" tamano="icono" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Subir talle ${i + 1}`} title="Subir">
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </Boton>
                <Boton variante="fantasma" tamano="icono" onClick={() => move(i, i + 1)} disabled={i === fields.length - 1} aria-label={`Bajar talle ${i + 1}`} title="Bajar">
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </Boton>
                <Boton variante="fantasma" tamano="icono" onClick={() => remove(i)} aria-label={`Quitar talle ${i + 1}`} title="Quitar" className="text-peligro">
                  <X className="h-4 w-4" aria-hidden="true" />
                </Boton>
              </li>
            ))}
          </ol>
        )}
        {errors.talles?.message && <p className="text-sm text-peligro">{errors.talles.message}</p>}
        {errors.talles?.root?.message && <p className="text-sm text-peligro">{errors.talles.root.message}</p>}

        <InputField label="Orden" name="orden" type="number" min={0} register={register} error={errors.orden?.message} ayuda="Los grupos de menor número aparecen primero." />
        <FormError mensaje={errorGeneral} />
        <div className="flex justify-end gap-3">
          <Boton variante="secundario" onClick={onCerrar} disabled={isSubmitting}>
            Cancelar
          </Boton>
          <SubmitButton cargando={isSubmitting} textoCargando="Guardando...">
            Guardar
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
