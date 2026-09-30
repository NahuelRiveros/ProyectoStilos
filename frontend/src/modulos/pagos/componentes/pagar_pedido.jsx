import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CreditCard } from "lucide-react";
import { proyecto } from "compartido/proyecto.js";
import { mensajeDeError } from "@/api/http.js";
import Boton from "@/componentes/ui/boton.jsx";
import FormError from "@/componentes/ui/form_error.jsx";
import { formatearDinero } from "@/utils/formatear_dinero.js";
import { useDisponiblesPagos, useIniciarPago } from "../hooks/use_pagos_online.js";

const MEDIOS_ONLINE = proyecto.pagos_online?.medios ?? [];
// Al volver de pagar, el aviso de Mercado Pago puede tardar unos segundos: se vuelve a mirar el pedido.
const INTERVALO_MS = 4000;
const INTENTOS = 15;

// Mercado Pago vuelve a la tienda con ?status=approved|pending|rejected (o collection_status).
const MENSAJES = {
  approved: { texto: "¡Listo! Mercado Pago aprobó tu pago. En unos segundos lo vas a ver acreditado acá.", clase: "border-green-600/40 bg-green-600/10" },
  pending: { texto: "Tu pago quedó pendiente de aprobación. Cuando se acredite lo vas a ver acá.", clase: "border-borde bg-fondo" },
  in_process: { texto: "Tu pago quedó pendiente de aprobación. Cuando se acredite lo vas a ver acá.", clase: "border-borde bg-fondo" },
  rejected: { texto: "El pago no se completó. Podés intentarlo de nuevo con otro medio.", clase: "border-peligro/40 bg-peligro/10" },
  failure: { texto: "El pago no se completó. Podés intentarlo de nuevo con otro medio.", clase: "border-peligro/40 bg-peligro/10" },
};

/**
 * En el detalle del pedido del cliente: "Pagar con Mercado Pago" mientras quede saldo (solo si el
 * servidor tiene credenciales y el pedido se hizo con un medio online), y el aviso al volver de pagar.
 */
export default function PagarPedido({ pedido, recargar }) {
  const disponibles = useDisponiblesPagos();
  const iniciar = useIniciarPago();
  const [params] = useSearchParams();
  const vuelta = params.get("status") ?? params.get("collection_status");
  const esperandoAcreditacion = vuelta === "approved" && pedido.saldo > 0;

  useEffect(() => {
    if (!esperandoAcreditacion || !recargar) return;
    let intentos = 0;
    const reloj = setInterval(() => {
      intentos += 1;
      recargar();
      if (intentos >= INTENTOS) clearInterval(reloj);
    }, INTERVALO_MS);
    return () => clearInterval(reloj);
  }, [esperandoAcreditacion, recargar]);

  if (!disponibles.data?.mercado_pago) return null;
  const puedePagar = pedido.estado !== "cancelado" && pedido.saldo > 0 && MEDIOS_ONLINE.includes(pedido.medio_pago);
  const mensaje = vuelta === "approved" && pedido.saldo <= 0 ? { texto: "¡Pago acreditado! Gracias por tu compra.", clase: "border-green-600/40 bg-green-600/10" } : MENSAJES[vuelta];
  if (!puedePagar && !mensaje) return null;

  async function pagar() {
    try {
      const { url } = await iniciar.mutateAsync({ pedidoId: pedido.id });
      // Se sale de la tienda: el pago se hace en la página segura de Mercado Pago.
      window.location.assign(url);
    } catch {
      // El mensaje se muestra abajo (iniciar.error).
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-primario bg-primario/5 p-5" aria-label="Pago online">
      {mensaje && (
        <p role="status" className={`rounded-xl border p-3 text-sm ${mensaje.clase}`}>
          {mensaje.texto}
        </p>
      )}
      {puedePagar && !esperandoAcreditacion && (
        <>
          <p className="text-sm text-texto-suave">Podés pagarlo ahora con tarjeta, dinero en cuenta o efectivo desde Mercado Pago.</p>
          <Boton className="w-full justify-center" onClick={pagar} disabled={iniciar.isPending || iniciar.isSuccess}>
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            {iniciar.isPending || iniciar.isSuccess ? "Abriendo Mercado Pago..." : `Pagar ${formatearDinero(pedido.saldo)} con Mercado Pago`}
          </Boton>
          <FormError mensaje={iniciar.isError ? mensajeDeError(iniciar.error) : ""} />
        </>
      )}
    </section>
  );
}
