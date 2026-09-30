import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { colorSchema } from "compartido/schemas/atributos.js";
import Boton from "@/componentes/ui/boton.jsx";
import FormError from "@/componentes/ui/form_error.jsx";
import InputField from "@/componentes/ui/input_field.jsx";
import Modal from "@/componentes/ui/modal.jsx";
import SubmitButton from "@/componentes/ui/submit_button.jsx";
import { aplicarErroresServidor } from "@/utils/errores_formulario.js";

const HEX_VALIDO = /^#[0-9a-f]{6}$/i;

/** Crear o editar un color: nombre + código (#RRGGBB) para la muestra redonda. */
export default function ColorFormModal({ color = null, onGuardar, onCerrar }) {
  const [errorGeneral, setErrorGeneral] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(colorSchema),
    defaultValues: { nombre: color?.nombre ?? "", hex: color?.hex ?? "#000000", orden: color?.orden ?? 0 },
  });
  const hex = useWatch({ control, name: "hex" });

  async function enviar(datos) {
    setErrorGeneral("");
    try {
      await onGuardar(color ? { ...datos, id: color.id } : datos);
    } catch (error) {
      setErrorGeneral(aplicarErroresServidor(error, setError, ["nombre", "hex", "orden"]));
    }
  }

  return (
    <Modal abierto onCerrar={onCerrar} titulo={color ? "Editar color" : "Nuevo color"} ocupado={isSubmitting}>
      <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
        <InputField label="Nombre" name="nombre" register={register} error={errors.nombre?.message} required autoFocus placeholder="Ej: Azul marino" />
        <div className="flex items-end gap-3">
          <div>
            <label htmlFor="color-selector" className="text-sm font-semibold text-texto">
              Color
            </label>
            <input
              id="color-selector"
              type="color"
              value={HEX_VALIDO.test(hex) ? hex : "#000000"}
              onChange={(e) => setValue("hex", e.target.value.toUpperCase(), { shouldValidate: true })}
              className="mt-1 block h-10 w-14 cursor-pointer rounded-lg border border-borde bg-superficie p-1"
            />
          </div>
          <InputField label="Código" name="hex" register={register} error={errors.hex?.message} required placeholder="#RRGGBB" />
        </div>
        <InputField label="Orden" name="orden" type="number" min={0} register={register} error={errors.orden?.message} ayuda="Los de menor número aparecen primero." />
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
