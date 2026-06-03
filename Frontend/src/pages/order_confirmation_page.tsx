import { useEffect, useState } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Clock, ShoppingBag } from "lucide-react";
import { verificarPago, type VerificacionPago } from "../api/pago_api";

type Status = "loading" | "approved" | "pending" | "rejected" | "error" | "no_payment";

export default function OrderConfirmationPage() {
  const { ordenId }      = useParams<{ ordenId: string }>();
  const [params]         = useSearchParams();
  const paymentId        = params.get("payment_id");
  const statusParam      = params.get("status");

  const [status, setStatus]   = useState<Status>("loading");
  const [pago, setPago]       = useState<VerificacionPago | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setStatus(statusParam === "approved" ? "approved" : "no_payment");
      return;
    }

    verificarPago(paymentId)
      .then((data) => {
        setPago(data);
        setStatus(
          data.estado === "approved" ? "approved"
          : data.estado === "pending" || data.estado === "in_process" ? "pending"
          : "rejected",
        );
      })
      .catch(() => setStatus("error"));
  }, [paymentId, statusParam]);

  const content: Record<Exclude<Status, "loading">, {
    icon: React.ReactNode;
    title: string;
    desc: string;
    color: string;
  }> = {
    approved: {
      icon:  <CheckCircle size={56} className="text-emerald-500" />,
      title: "¡Pago aprobado!",
      desc:  "Tu pedido fue confirmado. Te vamos a avisar cuando esté listo para despachar.",
      color: "text-emerald-600",
    },
    pending: {
      icon:  <Clock size={56} className="text-amber-500" />,
      title: "Pago pendiente",
      desc:  "Tu pago está siendo procesado. Te notificaremos cuando se confirme.",
      color: "text-amber-600",
    },
    rejected: {
      icon:  <XCircle size={56} className="text-rose-500" />,
      title: "Pago rechazado",
      desc:  "No pudimos procesar el pago. Podés volver a intentarlo desde tus órdenes.",
      color: "text-rose-600",
    },
    error: {
      icon:  <XCircle size={56} className="text-muted/40" />,
      title: "No pudimos verificar el pago",
      desc:  "Hubo un error al consultar el estado. Revisá tus órdenes en unos minutos.",
      color: "text-muted",
    },
    no_payment: {
      icon:  <ShoppingBag size={56} className="text-navy/30" />,
      title: "Orden creada",
      desc:  "Tu orden fue registrada. Si elegiste pago por transferencia, te enviaremos los datos.",
      color: "text-navy",
    },
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  const c = content[status];

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-24 text-center">
      {c.icon}

      <div>
        <h1 className={`text-2xl font-black ${c.color}`}>{c.title}</h1>
        <p className="mt-2 text-sm text-muted">{c.desc}</p>
      </div>

      {pago && (
        <div className="w-full rounded-2xl bg-surface p-4 text-left text-xs text-muted space-y-1">
          <div className="flex justify-between">
            <span>Orden</span>
            <span className="font-bold text-ink">#{ordenId}</span>
          </div>
          {pago.monto && (
            <div className="flex justify-between">
              <span>Total pagado</span>
              <span className="font-bold text-ink">
                $ {pago.monto.toLocaleString("es-AR")}
              </span>
            </div>
          )}
          {pago.metodo_pago && (
            <div className="flex justify-between">
              <span>Método</span>
              <span className="font-bold text-ink capitalize">{pago.metodo_pago.replace(/_/g, " ")}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 w-full">
        {ordenId && (
          <Link
            to={`/mis-ordenes/${ordenId}`}
            className="flex w-full items-center justify-center rounded-xl bg-navy py-3 text-sm font-bold text-white hover:bg-navy/90"
          >
            Ver mi orden
          </Link>
        )}
        <Link
          to="/mis-ordenes"
          className="text-sm text-muted underline hover:text-navy"
        >
          Ver todas mis órdenes
        </Link>
        <Link
          to="/catalogo"
          className="text-sm text-muted underline hover:text-navy"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
