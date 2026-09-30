import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { marcaSchema } from "compartido/schemas/atributos.js";
import Boton from "@/componentes/ui/boton.jsx";
import FormError from "@/componentes/ui/form_error.jsx";
import InputField from "@/componentes/ui/input_field.jsx";
import Modal from "@/componentes/ui/modal.jsx";
import SubmitButton from "@/componentes/ui/submit_button.jsx";
import { aplicarErroresServidor } from "@/utils/errores_formulario.js";

/** Crear o editar una marca. `marca` = la que se edita (o null). */
export default function MarcaFormModal({ marca = null, onGuardar, onCerrar }) {
  const [errorGeneral, setErrorGeneral] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(marcaSchema), defaultValues: { nombre: marca?.nombre ?? "" } });

  async function enviar(datos) {
    setErrorGeneral("");
    try {
      await onGuardar(marca ? { ...datos, id: marca.id } : datos);
    } catch (error) {
      setErrorGeneral(aplicarErroresServidor(error, setError, ["nombre"]));
    }
  }

  return (
    <Modal abierto onCerrar={onCerrar} titulo={marca ? "Editar marca" : "Nueva marca"} ocupado={isSubmitting}>
      <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
        <InputField label="Nombre" name="nombre" register={register} error={errors.nombre?.message} required autoFocus />
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
