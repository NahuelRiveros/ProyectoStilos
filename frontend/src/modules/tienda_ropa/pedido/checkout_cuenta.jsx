import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import FormError from "../../../core/controls/ui/form_error.jsx";
import { useToast } from "../../../core/controls/toast/use_toast.js";
import { cn } from "../../../core/utils/cn.js";
import { clientConfig } from "../../../../../proyecto/client_config.js";
import { useAccionesCuenta, useMisDatos, mensajeError } from "../hooks/use_ropa.js";
import { ErrorReintentar } from "../tienda/estados.jsx";
import SelectorEntrega from "./selector_entrega.jsx";
import { ETIQUETA_FORMA_PAGO, formasDePago, nuevaClaveEnvio } from "./pago.js";

const CAMPOS = ["entrega", "direccion", "localidad", "forma_pago"];
const DETALLE_PAGO = {
  transferencia: "Te mostramos los datos y subís el comprobante desde tu pedido.",
  efectivo: "Pagás cuando lo retirás.",
  coordinar: "Lo arreglamos por WhatsApp (tarjeta, link de pago, etc.).",
};

/** ROP-43 a ROP-45: el cliente que ingresó confirma el pedido en el sistema y lo sigue en "Mis pedidos". */
export default function CheckoutCuenta({ pedido }) {
  const datos = useMisDatos();
  if (datos.isPending) return <div role="status" aria-label="Cargando tus datos" className="mt-5 h-64 animate-pulse rounded-xl bg-white" />;
  if (datos.isError) return <div className="mt-5"><ErrorReintentar consulta={datos} mensaje="No pudimos cargar tus datos." /></div>;
  if (!datos.data.completos) {
    return (
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p>Antes de confirmar, completá tu nombre, apellido y celular.</p>
        <Link to="/mi-cuenta?volver=/pedido" className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-(--kt-petrol) px-4 font-semibold text-(--kt-accent-on-dark)">Completar mis datos</Link>
      </div>
    );
  }
  return <Formulario pedido={pedido} datos={datos.data} />;
}

function Formulario({ pedido, datos }) {
  const { enviar } = useAccionesCuenta();
  const navigate = useNavigate();
  const toast = useToast();
  // La misma clave en cada reintento: si la respuesta no llegó, el servidor no duplica el pedido.
  const [clave] = useState(nuevaClaveEnvio);
  const { register, handleSubmit, setError, control, formState: { errors } } = useForm({
    defaultValues: { entrega: "", direccion: datos.direccion, localidad: datos.localidad, forma_pago: "" },
  });
  const entrega = useWatch({ control, name: "entrega" });
  const formaPago = useWatch({ control, name: "forma_pago" });
  const formas = formasDePago({ entrega, datosBancarios: clientConfig.datosBancarios });

  async function confirmar({ entrega: elegida, direccion, localidad, forma_pago }) {
    try {
      const r = await enviar.mutateAsync({
        entrega: elegida, ...(elegida === "envio" && { direccion, localidad }), forma_pago, clave_envio: clave,
        items: pedido.items.map((l) => ({ variante_id: l.variante_id, cantidad: l.cantidad })),
      });
      pedido.vaciar();
      toast.success(r.mensaje);
      navigate(`/mis-pedidos/${r.data.id}`);
    } catch (error) {
      const porCampo = error?.response?.data?.errores ?? [];
      porCampo.filter((e) => CAMPOS.includes(e.campo)).forEach((e) => setError(e.campo, { message: e.mensaje }));
      if (!porCampo.some((e) => CAMPOS.includes(e.campo))) setError("root", { message: mensajeError(error, "No pudimos confirmar tu pedido. Probá de nuevo.") });
    }
  }

  return (
    <form onSubmit={handleSubmit(confirmar)} noValidate className="mt-5 space-y-4">
      <p className="text-sm">A nombre de <strong>{datos.nombre} {datos.apellido}</strong> · {datos.celular}</p>
      <SelectorEntrega register={register} entrega={entrega} errors={errors} />
      <fieldset>
        <legend className="text-sm font-semibold text-gray-700">¿Cómo pagás?</legend>
        <div className="mt-2 grid gap-2">
          {formas.map((forma) => (
            <label key={forma} className={cn("flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3", formaPago === forma ? "border-(--kt-petrol) ring-1 ring-(--kt-petrol)" : "border-(--kt-border)")}>
              <input type="radio" value={forma} {...register("forma_pago", { required: "Elegí cómo vas a pagar." })} className="mt-0.5 h-5 w-5 shrink-0 accent-(--kt-petrol)" />
              <span>
                <span className="block text-sm font-semibold">{ETIQUETA_FORMA_PAGO[forma]}</span>
                <span className="mt-0.5 block text-xs leading-5 text-(--kt-ink-soft)">{DETALLE_PAGO[forma]}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.forma_pago && <p role="alert" className="mt-1 text-sm text-red-600">{errors.forma_pago.message}</p>}
      </fieldset>
      <FormError message={errors.root?.message} />
      <button type="submit" disabled={enviar.isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--kt-accent-comercial) px-6 font-bold text-white hover:bg-(--kt-accent-comercial-hover) disabled:opacity-60">
        <CheckCircle2 size={19} aria-hidden="true" /> {enviar.isPending ? "Confirmando…" : "Confirmar pedido"}
      </button>
      <p className="text-xs leading-5 text-(--kt-ink-soft)">Te confirmamos la disponibilidad y vas a ver cada paso en "Mis pedidos".</p>
    </form>
  );
}
