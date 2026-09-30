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
import LogoMarcaEditor from "./logo_marca_editor.jsx";

/** Crear o editar una marca. `marca` = la que se edita (o null). */
export default function MarcaFormModal({ marca = null, onGuardar, onCerrar }) {
  const [errorGeneral, setErrorGeneral] = useState("");
  // El logo se guarda al momento (no con "Guardar"): se muestra el que devuelve el servidor.
  const [conLogo, setConLogo] = useState(marca);
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
      {conLogo ? (
        <LogoMarcaEditor marca={conLogo} onCambio={setConLogo} />
      ) : (
        <p className="mt-4 text-xs text-texto-suave">Después de guardarla vas a poder agregarle el logo (desde Catálogo → Marcas → Editar).</p>
      )}
    </Modal>
  );
}
