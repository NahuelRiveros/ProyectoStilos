import { useState } from "react";
import { ClipboardList, MessageCircle } from "lucide-react";
import Modal from "../../../core/controls/ui/modal.jsx";
import Pagination from "../../../core/controls/ui/pagination.jsx";
import AdminSpinner from "../../../core/controls/ui/admin_spinner.jsx";
import ErrorBanner from "../../../core/controls/ui/error_banner.jsx";
import { useToast } from "../../../core/controls/toast/use_toast.js";
import { useAuth } from "../../../core/auth/auth_context.jsx";
import { tienePermiso } from "../../../../../core/permisos_config.js";
import { formatearFechaAR } from "../../../core/utils/formatear_fecha.js";
import { cn } from "../../../core/utils/cn.js";
import { useEstadoPedido, usePedido, usePedidos, mensajeError } from "../hooks/use_ropa.js";
import { formatearPrecio } from "../utils/dinero.js";
import { BOTON_SECUNDARIO, Encabezado, Pantalla, SegunConsulta } from "./comunes.jsx";

const ESTADOS = {
  nuevo: { label: "Nuevo", clase: "bg-sky-50 text-sky-700 border-sky-200" },
  atendido: { label: "Atendido", clase: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelado: { label: "Cancelado", clase: "bg-slate-100 text-slate-600 border-slate-200" },
};
const PESTANAS = [["nuevo", "Nuevos"], ["atendido", "Atendidos"], ["cancelado", "Cancelados"], ["todos", "Todos"]];
const hora = (fecha) => new Date(fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
// Celular local (3704123456) → número de WhatsApp argentino (5493704123456); si ya trae el 54, se deja.
const whatsappDe = (celular) => { const d = celular.replace(/\D/g, ""); return d.startsWith("54") ? d : `549${d}`; };

/** Pedidos que llegaron por WhatsApp (ROP-15): por estado, con detalle y cambio de estado. */
export default function PedidosPage() {
  const [filtros, setFiltros] = useState({ estado: "nuevo", pagina: 1 });
  const consulta = usePedidos(filtros);
  const [abierto, setAbierto] = useState(null);
  const items = consulta.data?.items ?? [];

  return (
    <Pantalla>
      <Encabezado titulo="Pedidos" descripcion="Los que los clientes enviaron por WhatsApp. Marcalos como atendidos cuando les respondas." />

      <div role="tablist" aria-label="Estado" className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-1 sm:grid-cols-4">
        {PESTANAS.map(([estado, label]) => (
          <button key={estado} type="button" role="tab" aria-selected={filtros.estado === estado} onClick={() => setFiltros({ estado, pagina: 1 })}
            className={cn("min-h-11 rounded-xl text-sm font-semibold", filtros.estado === estado ? "bg-(--kt-teal-700) text-white" : "text-slate-600 hover:bg-slate-50")}>
            {label}
          </button>
        ))}
      </div>

      <SegunConsulta consulta={consulta} vacia={items.length === 0} icono={ClipboardList}
        tituloVacio={filtros.estado === "nuevo" ? "No hay pedidos nuevos." : "No hay pedidos en esta lista."}>
        <ul className={cn("space-y-2", consulta.isPlaceholderData && "opacity-60")}>
          {items.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => setAbierto(p.id)} className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-slate-300">
                <span className="font-mono text-sm font-bold text-slate-900">{p.numero}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-slate-900">{p.nombre}</span>
                  <span className="text-xs text-slate-500">{formatearFechaAR(p.creado_en)} {hora(p.creado_en)} · {p.unidades} {p.unidades === 1 ? "prenda" : "prendas"}</span>
                </span>
                <span className="font-bold text-slate-900">{formatearPrecio(p.total)}</span>
                <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-bold", ESTADOS[p.estado].clase)}>{ESTADOS[p.estado].label}</span>
              </button>
            </li>
          ))}
        </ul>
        {consulta.data && (
          <Pagination page={consulta.data.paginacion.page} pages={consulta.data.paginacion.totalPages} total={consulta.data.paginacion.total}
            disabled={consulta.isFetching} onChange={(pagina) => setFiltros((f) => ({ ...f, pagina }))} />
        )}
      </SegunConsulta>

      {abierto && <DetallePedido id={abierto} onClose={() => setAbierto(null)} />}
    </Pantalla>
  );
}

function DetallePedido({ id, onClose }) {
  const consulta = usePedido(id);
  const cambiar = useEstadoPedido();
  const toast = useToast();
  const { usuario } = useAuth();
  const puedeGestionar = tienePermiso(usuario, "pedidos.gestionar");
  const pedido = consulta.data;

  async function marcar(estado) {
    try {
      toast.success((await cambiar.mutateAsync({ id, estado })).mensaje);
      onClose();
    } catch (error) { toast.error(mensajeError(error, "No se pudo cambiar el estado.")); }
  }

  return (
    <Modal open onClose={onClose} busy={cambiar.isPending} title={pedido ? `Pedido ${pedido.numero}` : "Pedido"}>
      {consulta.isPending ? <AdminSpinner />
        : consulta.isError ? <ErrorBanner message={mensajeError(consulta.error, "No se pudo cargar el pedido.")} />
        : (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-900">{pedido.nombre}</p>
              <p className="text-slate-600">{pedido.celular}</p>
              <p className="text-xs text-slate-500">{formatearFechaAR(pedido.creado_en)} {hora(pedido.creado_en)}</p>
            </div>
            <ul className="divide-y divide-slate-100 text-sm">
              {pedido.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3 py-2">
                  <span><strong>{i.cantidad} ×</strong> {i.nombre_prenda} <span className="text-slate-500">({i.color}, {i.talle})</span></span>
                  <span className="whitespace-nowrap font-semibold">{formatearPrecio(i.subtotal)}</span>
                </li>
              ))}
            </ul>
            <p className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold"><span>Total</span><span>{formatearPrecio(pedido.total)}</span></p>
            <a href={`https://wa.me/${whatsappDe(pedido.celular)}?text=${encodeURIComponent(`¡Hola ${pedido.nombre}! Te escribimos por tu pedido ${pedido.numero}.`)}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1E7A46] px-4 text-sm font-bold text-white hover:bg-[#17633A]">
              <MessageCircle size={17} aria-hidden="true" /> Escribirle por WhatsApp
            </a>
            {puedeGestionar && (
              <div className="grid gap-2 sm:grid-cols-3">
                {Object.entries(ESTADOS).filter(([estado]) => estado !== pedido.estado).map(([estado, { label }]) => (
                  <button key={estado} type="button" onClick={() => marcar(estado)} disabled={cambiar.isPending} className={BOTON_SECUNDARIO}>Marcar {label.toLowerCase()}</button>
                ))}
              </div>
            )}
          </div>
        )}
    </Modal>
  );
}
