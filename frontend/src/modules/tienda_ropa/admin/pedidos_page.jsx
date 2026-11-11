import { useState } from "react";
import { ClipboardList, MessageCircle, Store, Truck } from "lucide-react";
import Modal from "../../../core/controls/ui/modal.jsx";
import Pagination from "../../../core/controls/ui/pagination.jsx";
import SearchField from "../../../core/controls/ui/search_field.jsx";
import AdminSpinner from "../../../core/controls/ui/admin_spinner.jsx";
import ErrorBanner from "../../../core/controls/ui/error_banner.jsx";
import FormError from "../../../core/controls/ui/form_error.jsx";
import { useToast } from "../../../core/controls/toast/use_toast.js";
import { useAuth } from "../../../core/auth/auth_context.jsx";
import { tienePermiso } from "../../../../../core/permisos_config.js";
import { formatearFechaAR } from "../../../core/utils/formatear_fecha.js";
import { cn } from "../../../core/utils/cn.js";
import { useAccionesPedido, usePedido, usePedidos, mensajeError } from "../hooks/use_ropa.js";
import { formatearPrecio } from "../utils/dinero.js";
import { textoEntrega } from "../pedido/entrega.js";
import { ETIQUETA_ESTADO, ETIQUETA_FORMA_PAGO, ETIQUETA_PAGO, cambiosPosibles, pideMotivo } from "../pedido/pago.js";
import { EtiquetaEstado, EtiquetaPago } from "../cuenta/comunes.jsx";
import { BOTON_PRIMARIO, BOTON_SECUNDARIO, Encabezado, Pantalla, SegunConsulta } from "./comunes.jsx";

const PESTANAS = [["recibido", "Recibidos"], ["confirmado", "Confirmados"], ["listo_retirar", "Para retirar"], ["enviado", "Enviados"], ["todos", "Todos"]];
const hora = (fecha) => new Date(fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
// Celular local (3704123456) → número de WhatsApp argentino (5493704123456); si ya trae el 54, se deja.
const whatsappDe = (celular) => { const d = celular.replace(/\D/g, ""); return d.startsWith("54") ? d : `549${d}`; };
const ESTADO_COMPROBANTE = { en_revision: "En revisión", aceptado: "Aceptado", rechazado: "Rechazado" };

/** Pedidos (ROP-54 a ROP-57): de WhatsApp y de cuenta, por estado y pago, con búsqueda y próximo paso. */
export default function PedidosPage() {
  const [filtros, setFiltros] = useState({ estado: "recibido", pago: "todos", q: "", pagina: 1 });
  const consulta = usePedidos(filtros);
  const [abierto, setAbierto] = useState(null);
  const items = consulta.data?.items ?? [];
  const cambiar = (cambio) => setFiltros((f) => ({ ...f, ...cambio, pagina: 1 }));

  return (
    <Pantalla>
      <Encabezado titulo="Pedidos" descripcion="Los de WhatsApp y los de clientes con cuenta. Cada pedido muestra su próximo paso." />

      <div role="tablist" aria-label="Estado" className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-1 sm:grid-cols-5">
        {PESTANAS.map(([estado, label]) => (
          <button key={estado} type="button" role="tab" aria-selected={filtros.estado === estado} onClick={() => cambiar({ estado })}
            className={cn("min-h-11 rounded-xl text-sm font-semibold", filtros.estado === estado ? "bg-(--kt-teal-700) text-white" : "text-slate-600 hover:bg-slate-50")}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1"><SearchField value={filtros.q} onSearch={(q) => cambiar({ q })} label="Buscar pedidos" placeholder="Número, nombre o celular…" /></div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">Pago
          <select value={filtros.pago} onChange={(e) => cambiar({ pago: e.target.value })} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3">
            <option value="todos">Todos</option>
            <option value="en_revision">Comprobante para revisar</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
          </select>
        </label>
      </div>

      <SegunConsulta consulta={consulta} vacia={items.length === 0} icono={ClipboardList}
        tituloVacio={filtros.estado === "recibido" ? "No hay pedidos nuevos." : "No hay pedidos en esta lista."}>
        <ul className={cn("space-y-2", consulta.isPlaceholderData && "opacity-60")}>
          {items.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => setAbierto(p.id)} className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-slate-300">
                <span className="font-mono text-sm font-bold text-slate-900">{p.numero}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-slate-900">{p.nombre}</span>
                  <span className="text-xs text-slate-500">
                    {formatearFechaAR(p.creado_en)} {hora(p.creado_en)} · {p.unidades} {p.unidades === 1 ? "prenda" : "prendas"} · {p.entrega === "envio" ? "Envío" : "Retiro"} · {p.origen === "cuenta" ? "Cuenta" : "WhatsApp"}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-bold text-slate-900">{formatearPrecio(p.total)}</span>
                  {p.origen === "cuenta" && <EtiquetaPago estado={p.estado_pago} />}
                </span>
                <EtiquetaEstado estado={p.estado} />
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
  const acciones = useAccionesPedido();
  const { usuario } = useAuth();
  const pedido = consulta.data;
  const ocupado = Object.values(acciones).some((m) => m.isPending);

  return (
    <Modal open onClose={onClose} busy={ocupado} title={pedido ? `Pedido ${pedido.numero}` : "Pedido"}>
      {consulta.isPending ? <AdminSpinner />
        : consulta.isError ? <ErrorBanner message={mensajeError(consulta.error, "No se pudo cargar el pedido.")} />
        : (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <p className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">{pedido.nombre} <EtiquetaEstado estado={pedido.estado} /></p>
              <p className="text-slate-600">{pedido.celular} · {pedido.origen === "cuenta" ? "Pedido con cuenta" : "Pedido por WhatsApp"}</p>
              <p className="mt-1 flex items-center gap-1.5 text-slate-800">
                {pedido.entrega === "envio" ? <Truck size={15} aria-hidden="true" /> : <Store size={15} aria-hidden="true" />}
                {textoEntrega(pedido)}
                {pedido.envio_gratis && <span className="rounded-full bg-emerald-50 px-2 text-xs font-bold text-emerald-700">Envío gratis</span>}
              </p>
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

            <Pago pedido={pedido} acciones={acciones} puedeCobrar={tienePermiso(usuario, "pagos.registrar")} />

            <a href={`https://wa.me/${whatsappDe(pedido.celular)}?text=${encodeURIComponent(`¡Hola ${pedido.nombre}! Te escribimos por tu pedido ${pedido.numero}.`)}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1E7A46] px-4 text-sm font-bold text-white hover:bg-[#17633A]">
              <MessageCircle size={17} aria-hidden="true" /> Escribirle por WhatsApp
            </a>

            {tienePermiso(usuario, "pedidos.gestionar") && <CambiarEstado pedido={pedido} acciones={acciones} />}

            <details className="text-sm">
              <summary className="min-h-11 cursor-pointer py-2 font-semibold text-slate-700">Historial</summary>
              <ol className="space-y-1.5 border-l-2 border-slate-200 pl-3">
                {pedido.historial.map((h) => (
                  <li key={h.id}>
                    <span className="font-semibold">{h.estado_anterior === h.estado_nuevo ? h.motivo : ETIQUETA_ESTADO[h.estado_nuevo]}</span>
                    <span className="text-slate-500"> · {formatearFechaAR(h.creado_en)} {hora(h.creado_en)}</span>
                    {h.motivo && h.estado_anterior !== h.estado_nuevo && <p className="text-slate-500">{h.motivo}</p>}
                  </li>
                ))}
              </ol>
            </details>
          </div>
        )}
    </Modal>
  );
}

/** ROP-54: el próximo paso como botón principal; los otros cambios, con motivo cuando corresponde. */
function CambiarEstado({ pedido, acciones }) {
  const toast = useToast();
  const [destino, setDestino] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const otros = cambiosPosibles(pedido).filter((e) => e !== pedido.proximo);
  const conMotivo = destino && pideMotivo(pedido.estado, destino);

  async function cambiar(estado, texto) {
    setError("");
    try {
      toast.success((await acciones.estado.mutateAsync({ id: pedido.id, estado, motivo: texto || undefined, version: pedido.version })).mensaje);
      setDestino(""); setMotivo("");
    } catch (e) { setError(mensajeError(e, "No se pudo cambiar el estado.")); }
  }

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 p-3">
      {pedido.proximo && (
        <button type="button" onClick={() => cambiar(pedido.proximo)} disabled={acciones.estado.isPending} className={cn(BOTON_PRIMARIO, "w-full")}>
          {pedido.proximo === "confirmado" ? "Confirmar pedido" : `Marcar como ${ETIQUETA_ESTADO[pedido.proximo].toLowerCase()}`}
        </button>
      )}
      {otros.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <select value={destino} onChange={(e) => setDestino(e.target.value)} aria-label="Otro cambio de estado" className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm">
            <option value="">Otro cambio…</option>
            {otros.map((e) => <option key={e} value={e}>{e === "cancelado" ? "Cancelar pedido" : pedido.estado === "cancelado" ? "Reabrir" : `Volver a ${ETIQUETA_ESTADO[e]}`}</option>)}
          </select>
          <button type="button" onClick={() => cambiar(destino, motivo)} disabled={!destino || (conMotivo && motivo.trim().length < 3) || acciones.estado.isPending}
            className={cn(BOTON_SECUNDARIO, destino === "cancelado" && "border-red-200 text-red-700")}>Aplicar</button>
        </div>
      )}
      {conMotivo && (
        <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={2} maxLength={500} placeholder={destino === "cancelado" ? "Motivo (se lo contamos al cliente)" : "Motivo (queda en el historial)"} aria-label="Motivo" className="w-full rounded-xl border border-slate-300 p-2 text-sm" />
      )}
      <FormError message={error} />
    </div>
  );
}

/** ROP-50 y ROP-51: comprobantes (ver, aceptar, rechazar) y "Marcar como pagado". */
function Pago({ pedido, acciones, puedeCobrar }) {
  const toast = useToast();
  const [rechazando, setRechazando] = useState(null);
  const [motivo, setMotivo] = useState("");
  if (pedido.origen !== "cuenta") return null;

  async function hacer(mutacion, datos, siFalla) {
    try { toast.success((await mutacion.mutateAsync(datos)).mensaje); return true; }
    catch (e) { toast.error(mensajeError(e, siFalla)); return false; }
  }
  async function ver(comprobanteId) {
    const ventana = window.open("", "_blank");
    if (ventana) ventana.opener = null;
    try {
      const { url } = await acciones.enlace.mutateAsync({ id: pedido.id, comprobanteId });
      if (ventana) ventana.location.href = url; else window.location.assign(url);
    } catch (e) { ventana?.close(); toast.error(mensajeError(e, "No se pudo abrir el comprobante.")); }
  }
  async function rechazar() {
    if (await hacer(acciones.rechazar, { id: pedido.id, comprobanteId: rechazando, motivo }, "No se pudo rechazar.")) { setRechazando(null); setMotivo(""); }
  }
  const abierto = pedido.estado !== "cancelado" && pedido.estado_pago !== "pagado";

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 p-3 text-sm">
      <p className="flex flex-wrap items-center justify-between gap-2 font-semibold">Pago: {ETIQUETA_FORMA_PAGO[pedido.forma_pago]} <EtiquetaPago estado={pedido.estado_pago} /></p>
      {pedido.comprobantes.map((c) => (
        <div key={c.id} className="rounded-lg bg-slate-50 p-2">
          <p className="flex flex-wrap items-center gap-2">
            <span className="flex-1">Comprobante del {formatearFechaAR(c.creado_en)} · <strong>{ESTADO_COMPROBANTE[c.estado]}</strong></span>
            <button type="button" onClick={() => ver(c.id)} className={BOTON_SECUNDARIO}>Ver</button>
            {puedeCobrar && c.estado === "en_revision" && (
              <>
                <button type="button" onClick={() => hacer(acciones.aceptar, { id: pedido.id, comprobanteId: c.id }, "No se pudo aceptar.")} className={BOTON_PRIMARIO}>Aceptar</button>
                <button type="button" onClick={() => setRechazando(c.id)} className={cn(BOTON_SECUNDARIO, "border-red-200 text-red-700")}>Rechazar</button>
              </>
            )}
          </p>
          {c.motivo_rechazo && <p className="mt-1 text-slate-500">Motivo: {c.motivo_rechazo}</p>}
          {rechazando === c.id && (
            <div className="mt-2 space-y-2">
              <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={2} maxLength={500} placeholder="Motivo (lo lee el cliente)" aria-label="Motivo del rechazo" className="w-full rounded-xl border border-slate-300 p-2" />
              <button type="button" onClick={rechazar} disabled={motivo.trim().length < 3 || acciones.rechazar.isPending} className={cn(BOTON_SECUNDARIO, "border-red-200 text-red-700")}>Confirmar rechazo</button>
            </div>
          )}
        </div>
      ))}
      {puedeCobrar && abierto && pedido.forma_pago !== "transferencia" && (
        <button type="button" onClick={() => hacer(acciones.pagado, pedido.id, "No se pudo registrar el pago.")} className={cn(BOTON_SECUNDARIO, "w-full")}>Marcar como pagado</button>
      )}
      {!pedido.comprobantes.length && pedido.forma_pago === "transferencia" && abierto && <p className="text-slate-500">{ETIQUETA_PAGO.pendiente}: el cliente todavía no subió el comprobante.</p>}
    </div>
  );
}
