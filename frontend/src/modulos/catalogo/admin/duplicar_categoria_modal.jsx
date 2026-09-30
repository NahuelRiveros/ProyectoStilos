import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { duplicarCategoriaSchema } from "compartido/schemas/catalogo.js";
import Boton from "@/componentes/ui/boton.jsx";
import FormError from "@/componentes/ui/form_error.jsx";
import InputField from "@/componentes/ui/input_field.jsx";
import Modal from "@/componentes/ui/modal.jsx";
import SubmitButton from "@/componentes/ui/submit_button.jsx";
import { aplicarErroresServidor } from "@/utils/errores_formulario.js";

/** Copiar una categoría con todas sus subcategorías (ej. "Hombres" → "Mujeres"), sin sus productos. */
export default function DuplicarCategoriaModal({ categoria, onDuplicar, onCerrar }) {
  const [errorGeneral, setErrorGeneral] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(duplicarCategoriaSchema), defaultValues: { nombre: "" } });
  const subcategorias = categoria.hijos.length;

  async function enviar(datos) {
    setErrorGeneral("");
    try {
      await onDuplicar({ id: categoria.id, ...datos });
    } catch (error) {
      setErrorGeneral(aplicarErroresServidor(error, setError, ["nombre"]));
    }
  }

  return (
    <Modal abierto onCerrar={onCerrar} titulo={`Duplicar "${categoria.nombre}"`} ocupado={isSubmitting}>
      <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
        <p className="text-sm text-texto-suave">
          Se crea una categoría nueva al mismo nivel con {subcategorias ? "todas sus subcategorías" : "el mismo orden"}. Los productos no se copian.
        </p>
        <InputField label="Nombre de la copia" name="nombre" register={register} error={errors.nombre?.message} required autoFocus placeholder="Ej: Mujeres" />
        <FormError mensaje={errorGeneral} />
        <div className="flex justify-end gap-3">
          <Boton variante="secundario" onClick={onCerrar} disabled={isSubmitting}>
            Cancelar
          </Boton>
          <SubmitButton cargando={isSubmitting} textoCargando="Duplicando...">
            Duplicar
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
