import { AlertTriangle } from "lucide-react";
import Insignia from "@/componentes/ui/insignia.jsx";
import { ErrorCarga } from "@/componentes/ui/estado_carga.jsx";
import { formatearDinero } from "@/utils/formatear_dinero.js";
import { fechaHora } from "@/modulos/tienda/utils/presentacion.js";
import { usePagosDelPedido } from "../hooks/use_pagos_online.js";

const ESTADOS = {
  iniciado: { etiqueta: "Link generado", tono: "neutro" },
  pendiente: { etiqueta: "Pendiente", tono: "aviso" },
  aprobado: { etiqueta: "Aprobado", tono: "exito" },
  rechazado: { etiqueta: "Rechazado", tono: "peligro" },
  reembolsado: { etiqueta: "Devuelto", tono: "peligro" },
  revisar: { etiqueta: "Revisar", tono: "peligro" },
  error: { etiqueta: "No se pudo generar", tono: "neutro" },
};
const PROVEEDORES = { mercado_pago: "Mercado Pago" };

/** Panel: pagos online del pedido. Los aprobados ya figuran en Cobros; acá se ven también los que hay que revisar. */
export default function PagosOnlinePedido({ pedido }) {
  const pagos = usePagosDelPedido(pedido.id);
  if (pagos.isPending) return null;
  if (pagos.isError) return <ErrorCarga error={pagos.error} onReintentar={pagos.refetch} />;
  if (pagos.data.length === 0) return null;
  const aRevisar = pagos.data.some((p) => p.estado === "revisar");

  return (
    <section className="rounded-2xl border border-borde bg-superficie p-5" aria-labelledby="titulo-pagos-online">
      <h2 id="titulo-pagos-online" className="text-lg font-bold">
        Pagos online
      </h2>
      {aRevisar && (
        <p role="alert" className="mt-3 flex gap-2 rounded-xl border border-peligro/40 bg-peligro/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Mercado Pago aprobó un pago que no coincide con el pedido (otro monto, o el pedido estaba cancelado o ya cobrado). No se registró como cobro: revisalo en tu cuenta de Mercado Pago y cargalo o devolvé el dinero.
        </p>
      )}
      <ul className="mt-3 divide-y divide-borde text-sm" aria-label="Intentos de pago online">
        {pagos.data.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
            <div>
              <p className="font-semibold">
                {formatearDinero(p.monto)} · {PROVEEDORES[p.proveedor] ?? p.proveedor}
              </p>
              <p className="text-xs text-texto-suave">
                {fechaHora(p.actualizado_en)}
                {p.pago_externo_id && ` · pago ${p.pago_externo_id}`}
              </p>
            </div>
            <Insignia tono={ESTADOS[p.estado]?.tono ?? "neutro"}>{ESTADOS[p.estado]?.etiqueta ?? p.estado}</Insignia>
          </li>
        ))}
      </ul>
    </section>
  );
}
