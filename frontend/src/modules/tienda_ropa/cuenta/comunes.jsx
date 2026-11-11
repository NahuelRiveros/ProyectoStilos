import { Check, Copy } from "lucide-react";
import { useToast } from "../../../core/controls/toast/use_toast.js";
import { cn } from "../../../core/utils/cn.js";
import { ETIQUETA_ESTADO, ETIQUETA_PAGO, pasosDelPedido } from "../pedido/pago.js";

// Piezas de las pantallas del cliente (Mis pedidos, detalle y pedido con cuenta).

const COLOR_ESTADO = {
  recibido: "bg-sky-50 text-sky-800 border-sky-200",
  confirmado: "bg-indigo-50 text-indigo-800 border-indigo-200",
  listo_retirar: "bg-amber-50 text-amber-800 border-amber-200",
  enviado: "bg-amber-50 text-amber-800 border-amber-200",
  entregado: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelado: "bg-slate-100 text-slate-600 border-slate-200",
};
const COLOR_PAGO = { pendiente: "text-(--kt-ink-soft)", en_revision: "text-amber-700", pagado: "text-emerald-700" };

export function EtiquetaEstado({ estado }) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold", COLOR_ESTADO[estado])}>{ETIQUETA_ESTADO[estado]}</span>;
}

export function EtiquetaPago({ estado }) {
  return <span className={cn("text-xs font-semibold", COLOR_PAGO[estado])}>{ETIQUETA_PAGO[estado]}</span>;
}

/** ROP-52: en qué paso va el pedido (Recibido → Confirmado → Listo/Enviado → Entregado). */
export function PasosPedido({ pedido }) {
  if (pedido.estado === "cancelado") return <p className="rounded-xl bg-slate-100 p-3 text-sm font-semibold text-slate-700">Este pedido está cancelado.</p>;
  const pasos = pasosDelPedido(pedido.entrega);
  const actual = pasos.indexOf(pedido.estado);
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label="Avance del pedido">
      {pasos.map((paso, i) => (
        <li key={paso} aria-current={i === actual ? "step" : undefined} className="text-center">
          <span className={cn("mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold",
            i <= actual ? "border-(--kt-petrol) bg-(--kt-petrol) text-(--kt-accent-on-dark)" : "border-(--kt-border) bg-white text-(--kt-ink-soft)")}>
            {i < actual ? <Check size={15} aria-hidden="true" /> : i + 1}
          </span>
          <span className={cn("mt-1.5 block text-[11px] leading-tight sm:text-xs", i === actual ? "font-bold text-(--kt-ink)" : "text-(--kt-ink-soft)")}>{ETIQUETA_ESTADO[paso]}</span>
        </li>
      ))}
    </ol>
  );
}

/** ROP-47: datos para transferir, con copiar CBU y alias. */
export function DatosBancarios({ datos, total }) {
  const toast = useToast();
  async function copiar(valor, que) {
    try { await navigator.clipboard.writeText(valor); toast.success(`Copiamos el ${que}.`); }
    catch { toast.error(`No pudimos copiar. Copiá el ${que} a mano.`); }
  }
  const filas = [["Titular", datos.titular], ["Banco", datos.banco], ["CUIT", datos.cuit]];
  return (
    <div className="rounded-2xl border border-(--kt-border) bg-white p-4">
      <p className="text-sm font-semibold">Transferí {total} a:</p>
      <dl className="mt-3 space-y-2 text-sm">
        {filas.map(([nombre, valor]) => (
          <div key={nombre} className="flex justify-between gap-3"><dt className="text-(--kt-ink-soft)">{nombre}</dt><dd className="text-right font-semibold">{valor}</dd></div>
        ))}
        {[["CBU", datos.cbu], ["Alias", datos.alias]].map(([nombre, valor]) => (
          <div key={nombre} className="flex items-center justify-between gap-3">
            <dt className="text-(--kt-ink-soft)">{nombre}</dt>
            <dd className="flex min-w-0 items-center gap-1">
              <span className="truncate font-mono font-semibold">{valor}</span>
              <button type="button" onClick={() => copiar(valor, nombre)} aria-label={`Copiar ${nombre}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-(--kt-bg-soft)"><Copy size={16} aria-hidden="true" /></button>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
