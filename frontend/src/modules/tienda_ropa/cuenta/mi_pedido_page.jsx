import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileUp, MessageCircle } from "lucide-react";
import Modal from "../../../core/controls/ui/modal.jsx";
import FormError from "../../../core/controls/ui/form_error.jsx";
import { useToast } from "../../../core/controls/toast/use_toast.js";
import { formatearFechaAR } from "../../../core/utils/formatear_fecha.js";
import { cn } from "../../../core/utils/cn.js";
import { clientConfig } from "../../../../../proyecto/client_config.js";
import { useAccionesCuenta, useMiPedido, mensajeError } from "../hooks/use_ropa.js";
import { formatearPrecio } from "../utils/dinero.js";
import { textoEntrega } from "../pedido/entrega.js";
import { linkWhatsapp } from "../pedido/mensaje_whatsapp.js";
import { ETIQUETA_FORMA_PAGO, puedeSubirComprobante, transferenciaDisponible } from "../pedido/pago.js";
import { ErrorReintentar } from "../tienda/estados.jsx";
import { DatosBancarios, EtiquetaEstado, EtiquetaPago, HistorialPedido, PasosPedido, PrendasPedido, QueSigue } from "./comunes.jsx";

const ESTADO_COMPROBANTE = { en_revision: "En revisión", aceptado: "Aceptado", rechazado: "Rechazado" };

/** Detalle de un pedido del cliente (ROP-47 a ROP-53): avance, pago, comprobantes y cancelar. */
export default function MiPedidoPage() {
  const { id } = useParams();
  const consulta = useMiPedido(id);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/mis-pedidos" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-(--kt-ink-soft) hover:text-(--kt-ink)"><ArrowLeft size={16} aria-hidden="true" /> Mis pedidos</Link>
      {consulta.isPending ? <div role="status" aria-label="Cargando el pedido" className="mt-4 h-96 animate-pulse rounded-2xl bg-(--kt-bg-soft)" />
        : consulta.isError ? <div className="mt-4"><ErrorReintentar consulta={consulta} mensaje="No pudimos cargar el pedido." /></div>
        : <Detalle pedido={consulta.data} />}
    </div>
  );
}

function Detalle({ pedido }) {
  const [cancelando, setCancelando] = useState(false);
  const transferir = pedido.forma_pago === "transferencia" && pedido.estado !== "cancelado" && pedido.estado_pago !== "pagado"
    && transferenciaDisponible(clientConfig.datosBancarios);
  return (
    <div className="mt-2 space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="kt-display text-4xl font-semibold">Pedido {pedido.numero}</h1>
        <EtiquetaEstado estado={pedido.estado} />
      </header>
      <p className="-mt-4 text-sm text-(--kt-ink-soft)">{formatearFechaAR(pedido.creado_en)} · {textoEntrega(pedido)}</p>

      <PasosPedido pedido={pedido} />
      <QueSigue pedido={pedido} />

      <section aria-labelledby="pago" className="space-y-3 rounded-2xl border border-(--kt-border) bg-(--kt-bg-soft) p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="pago" className="font-semibold">Pago: {ETIQUETA_FORMA_PAGO[pedido.forma_pago] ?? "A coordinar"}</h2>
          <EtiquetaPago estado={pedido.estado_pago} />
        </div>
        {transferir && <DatosBancarios datos={clientConfig.datosBancarios} total={formatearPrecio(pedido.total)} />}
        {pedido.forma_pago === "transferencia" && <Comprobantes pedido={pedido} />}
        {pedido.forma_pago === "coordinar" && pedido.estado_pago !== "pagado" && (
          <a href={linkWhatsapp(clientConfig.whatsapp, `¡Hola! Quiero coordinar el pago del pedido ${pedido.numero}.`)} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1E7A46] px-4 text-sm font-bold text-white hover:bg-[#17633A]">
            <MessageCircle size={17} aria-hidden="true" /> Coordinar por WhatsApp
          </a>
        )}
      </section>

      <PrendasPedido pedido={pedido} />

      {pedido.estado === "recibido" && (
        <button type="button" onClick={() => setCancelando(true)} className="inline-flex min-h-11 items-center font-semibold text-(--kt-danger) underline-offset-4 hover:underline">Cancelar pedido</button>
      )}

      <HistorialPedido pedido={pedido} />

      {cancelando && <Cancelar pedido={pedido} onClose={() => setCancelando(false)} />}
    </div>
  );
}

/** ROP-48 y ROP-49: subir el comprobante (foto o PDF) y ver los que ya se mandaron. */
function Comprobantes({ pedido }) {
  const { subir, enlace } = useAccionesCuenta();
  const toast = useToast();
  const [archivo, setArchivo] = useState(null);

  async function enviar() {
    try {
      toast.success((await subir.mutateAsync({ id: pedido.id, archivo })).mensaje);
      setArchivo(null);
    } catch (error) { toast.error(mensajeError(error, "No pudimos subir el comprobante.")); }
  }

  async function ver(comprobanteId) {
    // La pestaña se abre antes de pedir el enlace: si se abre después, el navegador la bloquea.
    const ventana = window.open("", "_blank");
    if (ventana) ventana.opener = null;
    try {
      const { url } = await enlace.mutateAsync({ id: pedido.id, comprobanteId });
      if (ventana) ventana.location.href = url; else window.location.assign(url);
    } catch (error) {
      ventana?.close();
      toast.error(mensajeError(error, "No pudimos abrir el comprobante."));
    }
  }

  return (
    <div className="space-y-3">
      {pedido.comprobantes.length > 0 && (
        <ul className="space-y-2 text-sm">
          {pedido.comprobantes.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-3">
              <span className="flex-1">Comprobante del {formatearFechaAR(c.creado_en)} · <strong className={cn(c.estado === "rechazado" && "text-(--kt-danger)", c.estado === "aceptado" && "text-emerald-700")}>{ESTADO_COMPROBANTE[c.estado]}</strong>
                {c.motivo_rechazo && <span className="block text-(--kt-ink-soft)">Motivo: {c.motivo_rechazo}</span>}
              </span>
              <button type="button" onClick={() => ver(c.id)} className="min-h-11 rounded-xl border border-(--kt-border) px-3 font-semibold">Ver</button>
            </li>
          ))}
        </ul>
      )}
      {puedeSubirComprobante(pedido) && (
        <div className="rounded-xl border border-dashed border-(--kt-border) bg-white p-3">
          <label className="block text-sm font-semibold">¿Ya transferiste? Subí el comprobante
            <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm file:mr-3 file:min-h-11 file:rounded-xl file:border-0 file:bg-(--kt-bg-soft) file:px-4 file:font-semibold" />
          </label>
          <p className="mt-1 text-xs text-(--kt-ink-soft)">Foto o PDF, hasta 5 MB.</p>
          <button type="button" onClick={enviar} disabled={!archivo || subir.isPending}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--kt-accent-comercial) px-4 font-bold text-white disabled:opacity-50 sm:w-auto">
            <FileUp size={17} aria-hidden="true" /> {subir.isPending ? "Subiendo…" : "Enviar comprobante"}
          </button>
        </div>
      )}
    </div>
  );
}

/** ROP-53: cancelar mientras está Recibido, con un motivo. */
function Cancelar({ pedido, onClose }) {
  const { cancelar } = useAccionesCuenta();
  const toast = useToast();
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");

  async function confirmar() {
    if (motivo.trim().length < 3) { setError("Contanos el motivo (al menos 3 letras)."); return; }
    try {
      toast.success((await cancelar.mutateAsync({ id: pedido.id, motivo })).mensaje);
      onClose();
    } catch (e) { setError(mensajeError(e, "No pudimos cancelar el pedido.")); }
  }

  return (
    <Modal open onClose={onClose} busy={cancelar.isPending} title={`Cancelar el pedido ${pedido.numero}`}>
      <label className="block text-sm font-semibold text-gray-700">¿Por qué lo cancelás?
        <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} maxLength={500} className="mt-1 w-full rounded-xl border border-gray-300 p-3 font-normal" />
      </label>
      <FormError message={error} />
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-gray-300 px-4 font-semibold">Volver</button>
        <button type="button" onClick={confirmar} disabled={cancelar.isPending} className="min-h-11 rounded-xl bg-red-600 px-4 font-bold text-white disabled:opacity-60">{cancelar.isPending ? "Cancelando…" : "Cancelar pedido"}</button>
      </div>
    </Modal>
  );
}
