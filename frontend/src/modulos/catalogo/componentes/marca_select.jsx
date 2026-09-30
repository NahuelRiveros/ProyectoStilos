import { useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/componentes/toast/toast_context.jsx";
import Boton from "@/componentes/ui/boton.jsx";
import SelectField from "@/componentes/ui/select_field.jsx";
import { useGuardarMarca, useMarcas } from "../hooks/use_catalogo.js";
import MarcaFormModal from "../admin/marca_form_modal.jsx";

/** Marca del producto (lista del panel) con "Nueva" para crearla sin salir del formulario. */
export default function MarcaSelect({ name = "marca_id", register, setValue, error }) {
  const marcas = useMarcas();
  const guardar = useGuardarMarca();
  const toast = useToast();
  const [creando, setCreando] = useState(false);

  async function crear(datos) {
    const marca = await guardar.mutateAsync(datos);
    toast.exito("Marca creada");
    setCreando(false);
    setValue(name, String(marca.id), { shouldDirty: true, shouldValidate: true });
  }

  return (
    <div className="flex items-end gap-2">
      <div className="min-w-0 flex-1">
        <SelectField
          label="Marca"
          name={name}
          register={register}
          opciones={(marcas.data ?? []).map((m) => ({ valor: m.id, etiqueta: m.nombre }))}
          placeholder={marcas.isPending ? "Cargando marcas..." : "Sin marca"}
          error={error ?? (marcas.isError ? "No se pudieron cargar las marcas" : undefined)}
        />
      </div>
      <Boton variante="secundario" onClick={() => setCreando(true)} aria-label="Nueva marca" title="Nueva marca" className="mb-px">
        <Plus className="h-4 w-4" aria-hidden="true" /> Nueva
      </Boton>
      {creando && <MarcaFormModal onGuardar={crear} onCerrar={() => setCreando(false)} />}
    </div>
  );
}
