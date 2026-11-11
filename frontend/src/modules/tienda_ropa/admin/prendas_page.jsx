import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Shirt, Trash2 } from "lucide-react";
import ConfirmDialog from "../../../core/controls/ui/confirm_dialog.jsx";
import Pagination from "../../../core/controls/ui/pagination.jsx";
import SearchField from "../../../core/controls/ui/search_field.jsx";
import { useToast } from "../../../core/controls/toast/use_toast.js";
import { imagenCloudinary } from "../../../core/utils/imagen_cloudinary.js";
import { cn } from "../../../core/utils/cn.js";
import { useGestionPrendas, useLista, usePrendasPanel, mensajeError } from "../hooks/use_ropa.js";
import { formatearPrecio } from "../utils/dinero.js";
import { BOTON_PELIGRO, BOTON_PRIMARIO, BOTON_SECUNDARIO, Encabezado, Pantalla, SegunConsulta } from "./comunes.jsx";

const aplanar = (nodos, nivel = 0) => nodos.flatMap((n) => [{ ...n, nivel }, ...aplanar(n.hijas, nivel + 1)]);

/** Prendas del panel (ROP-09): búsqueda, categoría, estado y accesos a editar, ocultar y borrar. */
export default function PrendasPage() {
  const [filtros, setFiltros] = useState({ q: "", categoria: "", estado: "todas", pagina: 1 });
  const consulta = usePrendasPanel(filtros);
  const categorias = useLista("categorias");
  const { cambiarEstado, eliminar } = useGestionPrendas();
  const toast = useToast();
  const [aBorrar, setABorrar] = useState(null);
  const filtrar = (campo, valor) => setFiltros((f) => ({ ...f, [campo]: valor, pagina: 1 }));
  const items = consulta.data?.items ?? [];
  const sinFiltros = !filtros.q && !filtros.categoria && filtros.estado === "todas";

  async function alternar(prenda) {
    try { toast.success((await cambiarEstado.mutateAsync({ id: prenda.id, activo: !prenda.activo })).mensaje); }
    catch (error) { toast.error(mensajeError(error, "No se pudo cambiar.")); }
  }
  async function borrar() {
    try { toast.success((await eliminar.mutateAsync(aBorrar.id)).mensaje); }
    catch (error) { toast.error(mensajeError(error, "No se pudo borrar.")); }
    setABorrar(null);
  }

  const nueva = <Link to="/admin/ropa/prendas/nueva" className={BOTON_PRIMARIO}><Plus size={16} aria-hidden="true" /> Nueva prenda</Link>;

  return (
    <Pantalla>
      <Encabezado titulo="Prendas" descripcion="Lo que se ve en la tienda: fotos por color, talles y precio.">{nueva}</Encabezado>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_14rem_10rem]">
        <SearchField value={filtros.q} onSearch={(q) => filtrar("q", q)} label="Buscar prendas" placeholder="Buscar por nombre…" />
        <select aria-label="Categoría" value={filtros.categoria} onChange={(e) => filtrar("categoria", e.target.value)} className="min-h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm">
          <option value="">Todas las categorías</option>
          {aplanar(categorias.data ?? []).map((c) => <option key={c.id} value={c.id}>{"  ".repeat(c.nivel)}{c.nombre}</option>)}
        </select>
        <select aria-label="Estado" value={filtros.estado} onChange={(e) => filtrar("estado", e.target.value)} className="min-h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm">
          <option value="todas">Todas</option>
          <option value="activas">Visibles</option>
          <option value="inactivas">Ocultas</option>
        </select>
      </div>

      <SegunConsulta consulta={consulta} vacia={items.length === 0} icono={Shirt}
        tituloVacio={sinFiltros ? "Todavía no cargaste prendas." : "No hay prendas con esos filtros."}
        descripcionVacio={sinFiltros ? "Antes conviene tener categorías, colores y grupos de talles." : undefined}
        accionVacio={sinFiltros ? nueva : undefined}>
        <ul className={cn("space-y-3", consulta.isPlaceholderData && "opacity-60")}>
          {items.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {p.foto ? <img src={imagenCloudinary(p.foto, 160)} alt="" loading="lazy" className="h-full w-full object-cover" /> : <Shirt className="m-auto mt-6 text-slate-300" aria-hidden="true" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{p.nombre}</p>
                  <p className="text-xs text-slate-500">{p.categoria?.nombre}{p.marca ? ` · ${p.marca.nombre}` : ""}</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">{formatearPrecio(p.precio)}</p>
                  <p className="mt-1 flex flex-wrap gap-1.5 text-xs">
                    <span className={cn("rounded-full px-2 py-0.5 font-bold", p.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>{p.activo ? "Visible" : "Oculta"}</span>
                    {p.variantes_agotadas > 0 && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-800">{p.variantes_agotadas} de {p.variantes_total} agotadas</span>}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/ropa/prendas/${p.id}`} className={cn(BOTON_SECUNDARIO, "flex-1")}><Pencil size={15} aria-hidden="true" /> Editar</Link>
                <button type="button" onClick={() => alternar(p)} disabled={cambiarEstado.isPending} className={cn(BOTON_SECUNDARIO, "flex-1")}>{p.activo ? "Ocultar" : "Mostrar"}</button>
                <button type="button" onClick={() => setABorrar(p)} aria-label={`Borrar ${p.nombre}`} className={BOTON_PELIGRO}><Trash2 size={15} aria-hidden="true" /></button>
              </div>
            </li>
          ))}
        </ul>
        {consulta.data && (
          <Pagination page={consulta.data.paginacion.page} pages={consulta.data.paginacion.totalPages} total={consulta.data.paginacion.total}
            disabled={consulta.isFetching} onChange={(pagina) => setFiltros((f) => ({ ...f, pagina }))} />
        )}
      </SegunConsulta>

      <ConfirmDialog
        open={Boolean(aBorrar)}
        title={`¿Borrar "${aBorrar?.nombre ?? ""}"?`}
        message="Desaparece de la tienda y no se puede recuperar. Los pedidos que ya la incluyen no cambian. Si solo querés sacarla un tiempo, ocultala."
        confirmLabel="Borrar"
        loading={eliminar.isPending}
        onConfirm={borrar}
        onClose={() => setABorrar(null)}
      />
    </Pantalla>
  );
}
