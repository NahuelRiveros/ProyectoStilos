import { useState } from "react";
import { Palette, Pencil, Plus, Trash2 } from "lucide-react";
import { proyecto } from "compartido/proyecto.js";
import { mensajeDeError } from "@/api/http.js";
import { useToast } from "@/componentes/toast/toast_context.jsx";
import Boton from "@/componentes/ui/boton.jsx";
import ConfirmDialog from "@/componentes/ui/confirm_dialog.jsx";
import { Cargando, ErrorCarga, Vacio } from "@/componentes/ui/estado_carga.jsx";
import { useCargarColoresSugeridos, useColores, useEliminarColor, useGuardarColor } from "../hooks/use_catalogo.js";
import ColorFormModal from "./color_form_modal.jsx";

const SUGERIDOS = proyecto.catalogo.colores_sugeridos ?? [];

export default function ColoresPage() {
  const colores = useColores();
  const guardar = useGuardarColor();
  const eliminar = useEliminarColor();
  const toast = useToast();
  const [formulario, setFormulario] = useState(null); // { color? }
  const [aEliminar, setAEliminar] = useState(null);
  const sugeridos = useCargarColoresSugeridos();

  // Se ofrece mientras falte alguno de la paleta sugerida (proyecto.config.js → catalogo.colores_sugeridos).
  const existentes = new Set((colores.data ?? []).map((c) => c.nombre.toLowerCase()));
  const faltanSugeridos = SUGERIDOS.some((s) => !existentes.has(s.nombre.toLowerCase()));

  async function cargarSugeridos() {
    try {
      const { creados } = await sugeridos.mutateAsync();
      toast.exito(creados.length ? `Se agregaron ${creados.length} colores` : "Ya estaban todos los colores sugeridos");
    } catch (error) {
      toast.error(mensajeDeError(error));
    }
  }

  async function onGuardar(datos) {
    await guardar.mutateAsync(datos);
    toast.exito(datos.id ? "Color actualizado" : "Color creado");
    setFormulario(null);
  }

  async function confirmarEliminar() {
    try {
      await eliminar.mutateAsync(aEliminar.id);
      toast.exito("Color eliminado");
    } catch (error) {
      toast.error(mensajeDeError(error));
    } finally {
      setAEliminar(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-titulos text-2xl font-bold">Colores</h1>
          <p className="text-sm text-texto-suave">Los colores que se eligen al cargar una prenda. En la tienda se ven como muestras redondas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {faltanSugeridos && (
            <Boton variante="secundario" onClick={cargarSugeridos} disabled={sugeridos.isPending}>
              <Palette className="h-4 w-4" aria-hidden="true" /> Cargar colores sugeridos
            </Boton>
          )}
          <Boton onClick={() => setFormulario({})}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo color
          </Boton>
        </div>
      </header>

      <div className="mt-6">
        {colores.isPending ? (
          <Cargando />
        ) : colores.isError ? (
          <ErrorCarga error={colores.error} onReintentar={colores.refetch} />
        ) : colores.data.length === 0 ? (
          <Vacio
            titulo="Todavía no hay colores"
            texto={SUGERIDOS.length ? `Cargá la paleta sugerida (${SUGERIDOS.length} colores habituales en indumentaria) y ajustala, o creá uno nuevo.` : "Creá el primero, por ejemplo “Negro”."}
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Colores">
            {colores.data.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-2xl border border-borde bg-superficie p-3">
                <span className="h-9 w-9 shrink-0 rounded-full border border-borde shadow-inner" style={{ backgroundColor: c.hex }} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{c.nombre}</span>
                  <span className="text-xs text-texto-suave">{c.hex}</span>
                </span>
                <Boton variante="fantasma" tamano="icono" onClick={() => setFormulario({ color: c })} aria-label={`Editar ${c.nombre}`} title="Editar">
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </Boton>
                <Boton variante="fantasma" tamano="icono" onClick={() => setAEliminar(c)} aria-label={`Eliminar ${c.nombre}`} title="Eliminar" className="text-peligro">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Boton>
              </li>
            ))}
          </ul>
        )}
      </div>

      {formulario && <ColorFormModal color={formulario.color} onGuardar={onGuardar} onCerrar={() => setFormulario(null)} />}
      <ConfirmDialog
        abierto={Boolean(aEliminar)}
        titulo="Eliminar color"
        mensaje={`¿Eliminar "${aEliminar?.nombre}"? Las prendas que ya lo tienen lo siguen mostrando.`}
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        onConfirmar={confirmarEliminar}
        onCerrar={() => setAEliminar(null)}
      />
    </div>
  );
}
