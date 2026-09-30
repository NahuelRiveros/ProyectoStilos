import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { mensajeDeError } from "@/api/http.js";
import { useToast } from "@/componentes/toast/toast_context.jsx";
import Boton from "@/componentes/ui/boton.jsx";
import ConfirmDialog from "@/componentes/ui/confirm_dialog.jsx";
import { Cargando, ErrorCarga, Vacio } from "@/componentes/ui/estado_carga.jsx";
import Tabla from "@/componentes/ui/tabla.jsx";
import { ANCHOS, urlImagen } from "@/utils/imagenes.js";
import { useEliminarMarca, useGuardarMarca, useMarcas } from "../hooks/use_catalogo.js";
import MarcaFormModal from "./marca_form_modal.jsx";

export default function MarcasPage() {
  const marcas = useMarcas();
  const guardar = useGuardarMarca();
  const eliminar = useEliminarMarca();
  const toast = useToast();
  const [formulario, setFormulario] = useState(null); // { marca? }
  const [aEliminar, setAEliminar] = useState(null);

  async function onGuardar(datos) {
    await guardar.mutateAsync(datos);
    toast.exito(datos.id ? "Marca actualizada" : "Marca creada");
    setFormulario(null);
  }

  async function confirmarEliminar() {
    try {
      await eliminar.mutateAsync(aEliminar.id);
      toast.exito("Marca eliminada");
    } catch (error) {
      toast.error(mensajeDeError(error));
    } finally {
      setAEliminar(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-titulos text-2xl font-bold">Marcas</h1>
          <p className="text-sm text-texto-suave">Las marcas que se eligen al cargar un producto (y por las que se puede filtrar en la tienda).</p>
        </div>
        <Boton onClick={() => setFormulario({})}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Nueva marca
        </Boton>
      </header>

      <div className="mt-6">
        {marcas.isPending ? (
          <Cargando />
        ) : marcas.isError ? (
          <ErrorCarga error={marcas.error} onReintentar={marcas.refetch} />
        ) : marcas.data.length === 0 ? (
          <Vacio titulo="Todavía no hay marcas" texto="Creá la primera, por ejemplo “Taverniti”." />
        ) : (
          <Tabla
            etiqueta="Marcas"
            filas={marcas.data}
            compacta
            columnas={[
              {
                titulo: "Nombre",
                principal: true,
                celda: (m) => (
                  <span className="flex items-center gap-3 font-medium">
                    <span className="flex h-9 w-14 shrink-0 items-center justify-center rounded-lg border border-borde bg-fondo p-1">
                      {m.logo_url ? (
                        <img src={urlImagen(m.logo_url, ANCHOS.miniatura)} alt="" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-texto-suave">Sin logo</span>
                      )}
                    </span>
                    {m.nombre}
                  </span>
                ),
              },
            ]}
            acciones={(m, { enTarjeta }) => (
              <>
                <Boton variante="fantasma" tamano="chico" onClick={() => setFormulario({ marca: m })} aria-label={`Editar ${m.nombre}`}>
                  <Pencil className="h-4 w-4" aria-hidden="true" /> {enTarjeta && "Editar"}
                </Boton>
                <Boton variante="fantasma" tamano="chico" onClick={() => setAEliminar(m)} aria-label={`Eliminar ${m.nombre}`} className="text-peligro">
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> {enTarjeta && "Eliminar"}
                </Boton>
              </>
            )}
          />
        )}
      </div>

      {formulario && <MarcaFormModal marca={formulario.marca} onGuardar={onGuardar} onCerrar={() => setFormulario(null)} />}
      <ConfirmDialog
        abierto={Boolean(aEliminar)}
        titulo="Eliminar marca"
        mensaje={`¿Eliminar "${aEliminar?.nombre}"? Los productos que ya la tienen la siguen mostrando.`}
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        onConfirmar={confirmarEliminar}
        onCerrar={() => setAEliminar(null)}
      />
    </div>
  );
}
