import { useState } from "react";
import { useForm } from "react-hook-form";
import { FolderTree, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import Modal from "../../../core/controls/ui/modal.jsx";
import ConfirmDialog from "../../../core/controls/ui/confirm_dialog.jsx";
import InputField from "../../../core/controls/ui/input_field.jsx";
import FormError from "../../../core/controls/ui/form_error.jsx";
import { useToast } from "../../../core/controls/toast/use_toast.js";
import { useGestionLista, useLista, mensajeError } from "../hooks/use_ropa.js";
import { BOTON_PELIGRO, BOTON_PRIMARIO, BOTON_SECUNDARIO, Encabezado, Pantalla, SegunConsulta } from "./comunes.jsx";

/** Árbol → lista plana con la profundidad, para mostrar con sangría y para el selector. */
const aplanar = (nodos, nivel = 0) => nodos.flatMap((n) => [{ ...n, nivel }, ...aplanar(n.hijas, nivel + 1)]);
const ids = (nodo) => [nodo.id, ...nodo.hijas.flatMap(ids)];

/** Categorías (ROP-01, ROP-27): árbol, alta de subcategorías, mover, ocultar, borrar y cargar las principales sugeridas. */
export default function CategoriasPage() {
  const consulta = useLista("categorias");
  const { guardar, eliminar, sugeridos } = useGestionLista("categorias");
  const toast = useToast();
  const [editando, setEditando] = useState(null); // null · { padre_id } nueva · categoría
  const [aBorrar, setABorrar] = useState(null);
  const arbol = consulta.data ?? [];
  const planas = aplanar(arbol);

  async function borrar() {
    try { toast.success((await eliminar.mutateAsync(aBorrar.id)).mensaje); }
    catch (error) { toast.error(mensajeError(error, "No se pudo borrar.")); }
    setABorrar(null);
  }

  async function cargarSugeridas() {
    try { toast.success((await sugeridos.mutateAsync()).mensaje); }
    catch (error) { toast.error(mensajeError(error, "No se pudieron cargar las sugeridas.")); }
  }
  const sugerir = (
    <button type="button" onClick={cargarSugeridas} disabled={sugeridos.isPending} className={BOTON_SECUNDARIO}>
      <Sparkles size={16} aria-hidden="true" /> {sugeridos.isPending ? "Cargando…" : "Cargar categorías sugeridas"}
    </button>
  );

  async function alternarVisible(c) {
    try {
      await guardar.mutateAsync({ id: c.id, nombre: c.nombre, padre_id: c.padre_id, orden: c.orden, activo: !c.activo });
      toast.success(c.activo ? `"${c.nombre}" quedó oculta en la tienda.` : `"${c.nombre}" se ve en la tienda.`);
    } catch (error) { toast.error(mensajeError(error, "No se pudo cambiar.")); }
  }

  return (
    <Pantalla>
      <Encabezado titulo="Categorías" descripcion="Organizan la tienda (ej. Mujer › Remeras). Ocultar una oculta también las de adentro.">
        {arbol.length > 0 && sugerir}
        <button type="button" onClick={() => setEditando({ padre_id: null })} className={BOTON_PRIMARIO}><Plus size={16} aria-hidden="true" /> Nueva categoría</button>
      </Encabezado>

      <SegunConsulta consulta={consulta} vacia={arbol.length === 0} icono={FolderTree} tituloVacio="Todavía no hay categorías." descripcionVacio="Cargá las principales (Mujer, Hombre, Niños y Calzado) y adentro sus subcategorías." accionVacio={sugerir}>
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {planas.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-2 px-4 py-3" style={{ paddingLeft: `${1 + c.nivel * 1.5}rem` }}>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{c.nivel > 0 && <span className="mr-1 text-slate-300" aria-hidden="true">└</span>}{c.nombre}</p>
                <p className="text-xs text-slate-500">{c.prendas} {c.prendas === 1 ? "prenda" : "prendas"}{!c.activo && " · oculta en la tienda"}</p>
              </div>
              <button type="button" onClick={() => alternarVisible(c)} disabled={guardar.isPending} className={BOTON_SECUNDARIO}>{c.activo ? "Ocultar" : "Mostrar"}</button>
              <button type="button" onClick={() => setEditando({ padre_id: c.id })} aria-label={`Nueva subcategoría en ${c.nombre}`} className={BOTON_SECUNDARIO}><Plus size={15} aria-hidden="true" /></button>
              <button type="button" onClick={() => setEditando(c)} aria-label={`Editar ${c.nombre}`} className={BOTON_SECUNDARIO}><Pencil size={15} aria-hidden="true" /></button>
              <button type="button" onClick={() => setABorrar(c)} aria-label={`Borrar ${c.nombre}`} className={BOTON_PELIGRO}><Trash2 size={15} aria-hidden="true" /></button>
            </li>
          ))}
        </ul>
      </SegunConsulta>

      {editando && <FormCategoria categoria={editando.id ? editando : null} padreInicial={editando.padre_id} planas={planas} guardar={guardar} onClose={() => setEditando(null)} />}
      <ConfirmDialog
        open={Boolean(aBorrar)}
        title={`¿Borrar "${aBorrar?.nombre ?? ""}"?`}
        message="Solo se puede si no tiene subcategorías ni prendas. Si querés sacarla de la tienda sin borrarla, ocultala."
        confirmLabel="Borrar"
        loading={eliminar.isPending}
        onConfirm={borrar}
        onClose={() => setABorrar(null)}
      />
    </Pantalla>
  );
}

function FormCategoria({ categoria, padreInicial, planas, guardar, onClose }) {
  const toast = useToast();
  // Ni la misma categoría ni sus subcategorías pueden quedar arriba de ella.
  const prohibidas = new Set(categoria ? ids(planas.find((c) => c.id === categoria.id)) : []);
  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: { nombre: categoria?.nombre ?? "", padre_id: String(categoria?.padre_id ?? padreInicial ?? ""), orden: categoria?.orden ?? 0, activo: categoria?.activo ?? true },
  });

  async function enviar(v) {
    try {
      const r = await guardar.mutateAsync({ id: categoria?.id, nombre: v.nombre, padre_id: v.padre_id ? Number(v.padre_id) : null, orden: Number(v.orden) || 0, activo: v.activo });
      toast.success(r.mensaje);
      onClose();
    } catch (error) {
      const porCampo = error?.response?.data?.errores ?? [];
      porCampo.forEach((e) => setError(e.campo, { message: e.mensaje }));
      if (!porCampo.length) setError("root", { message: mensajeError(error, "No se pudo guardar.") });
    }
  }

  return (
    <Modal open onClose={onClose} busy={guardar.isPending} title={categoria ? `Editar ${categoria.nombre}` : "Nueva categoría"}>
      <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
        <InputField name="nombre" label="Nombre" register={register} required requiredMessage="Escribí el nombre." maxLength={80} error={errors.nombre?.message} />
        <label className="block text-sm font-semibold text-gray-700">Va adentro de
          <select {...register("padre_id")} className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3">
            <option value="">— Ninguna (categoría principal) —</option>
            {planas.filter((c) => !prohibidas.has(c.id)).map((c) => <option key={c.id} value={c.id}>{"  ".repeat(c.nivel)}{c.nombre}</option>)}
          </select>
        </label>
        {errors.padre_id && <p className="text-sm text-red-600">{errors.padre_id.message}</p>}
        <InputField name="orden" type="number" min={0} label="Orden" helperText="Menor número, aparece antes." register={register} error={errors.orden?.message} />
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" {...register("activo")} className="h-5 w-5" /> Se ve en la tienda</label>
        <FormError message={errors.root?.message} />
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={guardar.isPending} className={BOTON_SECUNDARIO}>Cancelar</button>
          <button type="submit" disabled={guardar.isPending} className={BOTON_PRIMARIO}>{guardar.isPending ? "Guardando…" : "Guardar"}</button>
        </div>
      </form>
    </Modal>
  );
}
