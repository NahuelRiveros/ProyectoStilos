import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import Modal from "../../../core/controls/ui/modal.jsx";
import ConfirmDialog from "../../../core/controls/ui/confirm_dialog.jsx";
import FormError from "../../../core/controls/ui/form_error.jsx";
import { useToast } from "../../../core/controls/toast/use_toast.js";
import { useGestionLista, useLista, mensajeError } from "../hooks/use_ropa.js";
import { BOTON_PELIGRO, BOTON_PRIMARIO, BOTON_SECUNDARIO, Encabezado, Pantalla, SegunConsulta } from "./comunes.jsx";

/**
 * Pantalla de una lista simple del panel (marcas, colores, grupos de talles): listado, alta y edición
 * en un modal, borrado con confirmación y, si la lista lo ofrece, "Cargar sugeridos".
 * `config` describe la lista: textos, campos del formulario y cómo se ve cada fila.
 */
export default function ListaSimplePage({ config }) {
  const consulta = useLista(config.lista);
  const { guardar, eliminar, sugeridos } = useGestionLista(config.lista);
  const toast = useToast();
  const [editando, setEditando] = useState(null); // null cerrado · {} nuevo · item edición
  const [aBorrar, setABorrar] = useState(null);
  const items = consulta.data ?? [];

  async function cargarSugeridos() {
    try { toast.success((await sugeridos.mutateAsync()).mensaje); }
    catch (error) { toast.error(mensajeError(error, "No se pudieron cargar los sugeridos.")); }
  }

  async function borrar() {
    try {
      toast.success((await eliminar.mutateAsync(aBorrar.id)).mensaje);
      setABorrar(null);
    } catch (error) {
      toast.error(mensajeError(error, "No se pudo borrar."));
      setABorrar(null);
    }
  }

  const sugerir = config.sugeridos && (
    <button type="button" onClick={cargarSugeridos} disabled={sugeridos.isPending} className={BOTON_SECUNDARIO}>
      <Sparkles size={16} aria-hidden="true" /> {sugeridos.isPending ? "Cargando…" : config.sugeridos}
    </button>
  );

  return (
    <Pantalla>
      <Encabezado titulo={config.titulo} descripcion={config.descripcion}>
        {items.length > 0 && sugerir}
        <button type="button" onClick={() => setEditando({})} className={BOTON_PRIMARIO}><Plus size={16} aria-hidden="true" /> {config.nuevo}</button>
      </Encabezado>

      <SegunConsulta consulta={consulta} vacia={items.length === 0} icono={config.icono} tituloVacio={config.vacio} descripcionVacio={config.vacioDetalle} accionVacio={sugerir}>
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">{config.fila(item)}</div>
              <button type="button" onClick={() => setEditando(item)} aria-label={`Editar ${item.nombre}`} className={BOTON_SECUNDARIO}><Pencil size={15} aria-hidden="true" /></button>
              <button type="button" onClick={() => setABorrar(item)} aria-label={`Borrar ${item.nombre}`} className={BOTON_PELIGRO}><Trash2 size={15} aria-hidden="true" /></button>
            </li>
          ))}
        </ul>
      </SegunConsulta>

      {editando && <Formulario config={config} item={editando.id ? editando : null} guardar={guardar} onClose={() => setEditando(null)} />}
      <ConfirmDialog
        open={Boolean(aBorrar)}
        title={`¿Borrar "${aBorrar?.nombre ?? ""}"?`}
        message="No se puede deshacer. Si alguna prenda lo usa, te vamos a avisar y no se borra."
        confirmLabel="Borrar"
        loading={eliminar.isPending}
        onConfirm={borrar}
        onClose={() => setABorrar(null)}
      />
    </Pantalla>
  );
}

function Formulario({ config, item, guardar, onClose }) {
  const toast = useToast();
  const { register, handleSubmit, setError, watch, formState: { errors } } = useForm({ defaultValues: config.valores(item) });

  async function enviar(valores) {
    try {
      const r = await guardar.mutateAsync({ ...config.armar(valores), id: item?.id });
      toast.success(r.mensaje);
      onClose();
    } catch (error) {
      const porCampo = error?.response?.data?.errores ?? [];
      porCampo.forEach((e) => setError(e.campo, { message: e.mensaje }));
      if (!porCampo.length) setError("root", { message: mensajeError(error, "No se pudo guardar.") });
    }
  }

  return (
    <Modal open onClose={onClose} busy={guardar.isPending} title={item ? `Editar ${item.nombre}` : config.nuevo}>
      <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
        {config.campos({ register, errors, watch })}
        <FormError message={errors.root?.message} />
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={guardar.isPending} className={BOTON_SECUNDARIO}>Cancelar</button>
          <button type="submit" disabled={guardar.isPending} className={BOTON_PRIMARIO}>{guardar.isPending ? "Guardando…" : "Guardar"}</button>
        </div>
      </form>
    </Modal>
  );
}
