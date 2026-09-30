import { useState } from "react";
import { ListPlus, Pencil, Plus, Trash2 } from "lucide-react";
import { proyecto } from "compartido/proyecto.js";
import { mensajeDeError } from "@/api/http.js";
import { useToast } from "@/componentes/toast/toast_context.jsx";
import Boton from "@/componentes/ui/boton.jsx";
import ConfirmDialog from "@/componentes/ui/confirm_dialog.jsx";
import { Cargando, ErrorCarga, Vacio } from "@/componentes/ui/estado_carga.jsx";
import { useCargarGruposSugeridos, useEliminarGrupoTalle, useGruposTalle, useGuardarGrupoTalle } from "../hooks/use_catalogo.js";
import GrupoTalleFormModal from "./grupo_talle_form_modal.jsx";

const SUGERIDOS = proyecto.catalogo.grupos_talle_sugeridos ?? [];

export default function TallesPage() {
  const grupos = useGruposTalle();
  const guardar = useGuardarGrupoTalle();
  const eliminar = useEliminarGrupoTalle();
  const sugeridos = useCargarGruposSugeridos();
  const toast = useToast();
  const [formulario, setFormulario] = useState(null); // { grupo? }
  const [aEliminar, setAEliminar] = useState(null);

  // Se ofrece mientras falte alguno de los grupos sugeridos de la configuración.
  const existentes = new Set((grupos.data ?? []).map((g) => g.nombre.toLowerCase()));
  const faltanSugeridos = SUGERIDOS.some((s) => !existentes.has(s.nombre.toLowerCase()));

  async function onGuardar(datos) {
    await guardar.mutateAsync(datos);
    toast.exito(datos.id ? "Grupo actualizado" : "Grupo creado");
    setFormulario(null);
  }

  async function cargarSugeridos() {
    try {
      const { creados } = await sugeridos.mutateAsync();
      toast.exito(creados.length ? `Se agregaron: ${creados.join(", ")}` : "Ya estaban todos los grupos sugeridos");
    } catch (error) {
      toast.error(mensajeDeError(error));
    }
  }

  async function confirmarEliminar() {
    try {
      await eliminar.mutateAsync(aEliminar.id);
      toast.exito("Grupo eliminado");
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
          <h1 className="font-titulos text-2xl font-bold">Talles</h1>
          <p className="text-sm text-texto-suave">Cada grupo es una tabla de talles (ropa, jeans, calzado). Al cargar una prenda se elige el grupo y sus talles.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {faltanSugeridos && (
            <Boton variante="secundario" onClick={cargarSugeridos} disabled={sugeridos.isPending}>
              <ListPlus className="h-4 w-4" aria-hidden="true" /> Cargar grupos sugeridos
            </Boton>
          )}
          <Boton onClick={() => setFormulario({})}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo grupo
          </Boton>
        </div>
      </header>

      <div className="mt-6">
        {grupos.isPending ? (
          <Cargando />
        ) : grupos.isError ? (
          <ErrorCarga error={grupos.error} onReintentar={grupos.refetch} />
        ) : grupos.data.length === 0 ? (
          <Vacio
            titulo="Todavía no hay grupos de talles"
            texto={SUGERIDOS.length ? `Podés cargar los sugeridos (${SUGERIDOS.map((s) => s.nombre).join(", ")}) y ajustarlos, o crear uno nuevo.` : "Creá el primero, por ejemplo “Ropa” con S, M, L."}
          />
        ) : (
          <ul className="space-y-3" aria-label="Grupos de talles">
            {grupos.data.map((g) => (
              <li key={g.id} className="rounded-2xl border border-borde bg-superficie p-4">
                <div className="flex items-center gap-2">
                  <h2 className="flex-1 font-semibold">{g.nombre}</h2>
                  <Boton variante="fantasma" tamano="chico" onClick={() => setFormulario({ grupo: g })} aria-label={`Editar ${g.nombre}`}>
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Editar
                  </Boton>
                  <Boton variante="fantasma" tamano="chico" onClick={() => setAEliminar(g)} aria-label={`Eliminar ${g.nombre}`} className="text-peligro">
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Eliminar
                  </Boton>
                </div>
                <ul className="mt-3 flex flex-wrap gap-2" aria-label={`Talles de ${g.nombre}`}>
                  {g.talles.map((t) => (
                    <li key={t.id} className="rounded-lg border border-borde px-3 py-1 text-sm font-medium">
                      {t.nombre}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      {formulario && <GrupoTalleFormModal grupo={formulario.grupo} onGuardar={onGuardar} onCerrar={() => setFormulario(null)} />}
      <ConfirmDialog
        abierto={Boolean(aEliminar)}
        titulo="Eliminar grupo de talles"
        mensaje={`¿Eliminar "${aEliminar?.nombre}" con todos sus talles? Las prendas que ya los tienen los siguen mostrando.`}
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        onConfirmar={confirmarEliminar}
        onCerrar={() => setAEliminar(null)}
      />
    </div>
  );
}
