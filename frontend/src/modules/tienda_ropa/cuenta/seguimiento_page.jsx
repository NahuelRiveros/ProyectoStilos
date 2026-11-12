import { Link, useParams } from "react-router-dom";
import { formatearFechaAR } from "../../../core/utils/formatear_fecha.js";
import { useSeguimiento } from "../hooks/use_ropa.js";
import { textoEntrega } from "../pedido/entrega.js";
import { ETIQUETA_FORMA_PAGO } from "../pedido/pago.js";
import { ErrorReintentar } from "../tienda/estados.jsx";
import { EtiquetaEstado, EtiquetaPago, HistorialPedido, PasosPedido, PrendasPedido, QueSigue } from "./comunes.jsx";

/** ROP-62: seguimiento sin cuenta, con el link secreto del mensaje de WhatsApp. Sin datos personales. */
export default function SeguimientoPage() {
  const { clave } = useParams();
  const consulta = useSeguimiento(clave);
  const noExiste = consulta.isError && consulta.error?.response?.status === 404;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {consulta.isPending ? <div role="status" aria-label="Cargando el pedido" className="h-96 animate-pulse rounded-2xl bg-(--kt-bg-soft)" />
        : noExiste ? (
          <div className="py-10 text-center">
            <h1 className="kt-display text-4xl font-semibold">No encontramos ese pedido</h1>
            <p className="mt-3 text-(--kt-ink-soft)">Revisá que el link esté completo, o escribinos por WhatsApp con el número de pedido.</p>
            <Link to="/catalogo" className="mt-6 inline-flex min-h-11 items-center font-semibold text-(--kt-petrol) underline">Ver la colección</Link>
          </div>
        )
        : consulta.isError ? <ErrorReintentar consulta={consulta} mensaje="No pudimos cargar el pedido." />
        : <Detalle pedido={consulta.data} />}
    </div>
  );
}

function Detalle({ pedido }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="kt-display text-4xl font-semibold">Pedido {pedido.numero}</h1>
        <EtiquetaEstado estado={pedido.estado} />
      </header>
      <p className="-mt-4 text-sm text-(--kt-ink-soft)">{formatearFechaAR(pedido.creado_en)} · {textoEntrega(pedido)}</p>
      <PasosPedido pedido={pedido} />
      <QueSigue pedido={pedido} />
      <p className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-(--kt-border) bg-(--kt-bg-soft) p-4 font-semibold">
        Pago: {ETIQUETA_FORMA_PAGO[pedido.forma_pago] ?? "A coordinar por WhatsApp"}
        <EtiquetaPago estado={pedido.estado_pago} />
      </p>
      <PrendasPedido pedido={pedido} />
      <HistorialPedido pedido={pedido} />
      <p className="text-xs text-(--kt-ink-soft)">Cualquiera con este link ve el estado del pedido: no lo compartas si no querés.</p>
    </div>
  );
}
