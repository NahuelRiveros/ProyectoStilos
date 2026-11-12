import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { CheckCircle2, MessageCircle, Minus, Plus, Shirt, Trash2 } from "lucide-react";
import InputField from "../../../core/controls/ui/input_field.jsx";
import FormError from "../../../core/controls/ui/form_error.jsx";
import { imagenCloudinary } from "../../../core/utils/imagen_cloudinary.js";
import { cn } from "../../../core/utils/cn.js";
import { clientConfig } from "../../../../../proyecto/client_config.js";
import { brandConfig } from "../../../proyecto/config/brand_config.js";
import { useAuth } from "../../../core/auth/auth_context.jsx";
import { authLink } from "../../../core/controls/acceso/return_to.js";
import { useEnviarPedido, mensajeError } from "../hooks/use_ropa.js";
import { formatearPrecio } from "../utils/dinero.js";
import { usePedido } from "./pedido_context.js";
import { linkWhatsapp, mensajePedido } from "./mensaje_whatsapp.js";
import { urlSeguimiento } from "./mensajes_estado.js";
import { avisoEnvioGratis, textoEntrega } from "./entrega.js";
import SelectorEntrega from "./selector_entrega.jsx";
import CheckoutCuenta from "./checkout_cuenta.jsx";

const CAMPOS = ["nombre", "celular", "entrega", "direccion", "localidad"];
const { envioGratisDesde } = clientConfig.entrega;

/**
 * Mi pedido (ROP-13 a ROP-18, ROP-43 a ROP-46): revisar y enviar. Sin cuenta, se manda por WhatsApp;
 * un cliente que ingresó lo confirma en el sistema y lo sigue en "Mis pedidos".
 */
export default function PedidoPage() {
  const pedido = usePedido();
  const { usuario } = useAuth();
  const esCliente = Boolean(usuario?.roles?.includes("cliente"));
  const enviar = useEnviarPedido();
  const [enviado, setEnviado] = useState(null);
  const { register, handleSubmit, setError, control, formState: { errors } } = useForm({ defaultValues: { nombre: "", celular: "", entrega: "", direccion: "", localidad: "" } });
  const entrega = useWatch({ control, name: "entrega" });
  const aviso = avisoEnvioGratis(pedido.total, envioGratisDesde);

  async function confirmar({ nombre, celular, entrega: elegida, direccion, localidad }) {
    try {
      const registrado = await enviar.mutateAsync({
        nombre, celular, entrega: elegida, ...(elegida === "envio" && { direccion, localidad }),
        items: pedido.items.map((l) => ({ variante_id: l.variante_id, cantidad: l.cantidad })),
      });
      setEnviado(registrado);
      pedido.vaciar();
    } catch (error) {
      const porCampo = error?.response?.data?.errores ?? [];
      porCampo.filter((e) => CAMPOS.includes(e.campo)).forEach((e) => setError(e.campo, { message: e.mensaje }));
      if (!porCampo.some((e) => CAMPOS.includes(e.campo))) setError("root", { message: mensajeError(error, "No pudimos enviar tu pedido. Probá de nuevo.") });
    }
  }

  if (enviado) {
    const seguimiento = urlSeguimiento(window.location.origin, enviado.clave_seguimiento);
    const link = linkWhatsapp(clientConfig.whatsapp, mensajePedido(enviado, brandConfig.nombre, seguimiento));
    return (
      <div className="mx-auto max-w-lg px-4 py-14 text-center">
        <CheckCircle2 size={48} className="mx-auto text-(--kt-success)" aria-hidden="true" />
        <h1 className="kt-display mt-4 text-4xl font-semibold">Pedido {enviado.numero} registrado</h1>
        <p className="mt-3 text-(--kt-ink-soft)">Último paso: mandalo por WhatsApp para que te confirmemos la disponibilidad.</p>
        <a href={link} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1E7A46] px-6 font-bold text-white hover:bg-[#17633A] sm:w-auto">
          <MessageCircle size={20} aria-hidden="true" /> Abrir WhatsApp
        </a>
        <p className="mt-4 text-sm text-(--kt-ink-soft)">Total: <strong className="text-(--kt-ink)">{formatearPrecio(enviado.total)}</strong></p>
        <p className="mt-1 text-sm text-(--kt-ink-soft)">{textoEntrega(enviado)}{enviado.envio_gratis && " · Envío gratis"}</p>
        {enviado.clave_seguimiento && (
          <p className="mt-6 rounded-xl bg-(--kt-bg-soft) p-3 text-sm text-(--kt-ink-soft)">
            Podés ver cómo va tu pedido cuando quieras: <Link to={`/seguimiento/${enviado.clave_seguimiento}`} className="font-semibold text-(--kt-petrol) underline">seguir mi pedido</Link>. El link también va en tu mensaje de WhatsApp.
          </p>
        )}
        <Link to="/catalogo" className="mt-4 inline-flex min-h-11 items-center font-semibold text-(--kt-petrol) underline-offset-4 hover:underline">Seguir mirando</Link>
      </div>
    );
  }

  if (pedido.items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="kt-display text-4xl font-semibold">Tu pedido está vacío</h1>
        <p className="mt-3 text-(--kt-ink-soft)">Elegí prendas, talle y color, y sumalas acá.</p>
        <Link to="/catalogo" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-(--kt-petrol) px-6 font-semibold text-(--kt-accent-on-dark)">Ver la colección</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_22rem]">
      <section aria-labelledby="titulo-pedido">
        <h1 id="titulo-pedido" className="kt-display text-4xl font-semibold">Mi pedido</h1>
        <ul className="mt-6 divide-y divide-(--kt-border) border-y border-(--kt-border)">
          {pedido.items.map((l) => (
            <li key={l.variante_id} className="flex gap-4 py-4">
              <Link to={`/catalogo/${l.slug}`} className="h-24 w-18 shrink-0 overflow-hidden rounded-xl bg-(--kt-bg-soft)">
                {l.foto ? <img src={imagenCloudinary(l.foto, 160)} alt="" className="h-full w-full object-cover" /> : <Shirt className="m-auto mt-8 text-(--kt-turquoise)" aria-hidden="true" />}
              </Link>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{l.nombre}</p>
                <p className="text-sm text-(--kt-ink-soft)">{l.color} · Talle {l.talle}</p>
                <p className="mt-1 text-sm font-semibold text-(--kt-accent-comercial)">{formatearPrecio(l.precio)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-11 items-center rounded-xl border border-(--kt-border)">
                    <button type="button" onClick={() => pedido.cambiar(l.variante_id, l.cantidad - 1)} aria-label={`Una menos de ${l.nombre}`} className="flex h-11 w-11 items-center justify-center"><Minus size={15} aria-hidden="true" /></button>
                    <span className="w-7 text-center text-sm font-semibold">{l.cantidad}</span>
                    <button type="button" onClick={() => pedido.cambiar(l.variante_id, l.cantidad + 1)} aria-label={`Una más de ${l.nombre}`} className="flex h-11 w-11 items-center justify-center"><Plus size={15} aria-hidden="true" /></button>
                  </div>
                  <button type="button" onClick={() => pedido.quitar(l.variante_id)} aria-label={`Quitar ${l.nombre}`} className="flex h-11 w-11 items-center justify-center rounded-xl text-(--kt-danger) hover:bg-(--kt-danger-bg)"><Trash2 size={17} aria-hidden="true" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside className="h-fit rounded-2xl border border-(--kt-border) bg-(--kt-bg-soft) p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-(--kt-ink-soft)">Total estimado ({pedido.unidades} {pedido.unidades === 1 ? "prenda" : "prendas"})</span>
          <span className="text-xl font-bold">{formatearPrecio(pedido.total)}</span>
        </div>
        {aviso && (
          <p className={cn("mt-2 text-sm", aviso.gratis ? "font-semibold text-(--kt-success)" : "text-(--kt-ink-soft)")}>
            {aviso.gratis ? "Tenés envío gratis a domicilio." : `Te faltan ${formatearPrecio(aviso.falta)} para el envío gratis.`}
          </p>
        )}
        {esCliente ? <CheckoutCuenta pedido={pedido} /> : (
        <form onSubmit={handleSubmit(confirmar)} noValidate className="mt-5 space-y-4">
          <p className="rounded-xl bg-white p-3 text-xs leading-5 text-(--kt-ink-soft)">
            <Link to={authLink("/login", "/pedido")} className="font-semibold text-(--kt-petrol) underline">Ingresá</Link> o{" "}
            <Link to={authLink("/register", "/pedido")} className="font-semibold text-(--kt-petrol) underline">creá tu cuenta</Link> para seguir el estado de tu pedido y pagar por transferencia.
          </p>
          <InputField name="nombre" label="Tu nombre" autoComplete="name" register={register} required requiredMessage="Escribí tu nombre." error={errors.nombre?.message} />
          <InputField name="celular" type="tel" label="Tu celular" inputMode="tel" autoComplete="tel" placeholder="3704 123456" helperText="Con código de área, para responderte." register={register} required requiredMessage="Escribí tu celular." error={errors.celular?.message} />
          <SelectorEntrega register={register} entrega={entrega} errors={errors} />
          <FormError message={errors.root?.message} />
          <button type="submit" disabled={enviar.isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--kt-accent-comercial) px-6 font-bold text-white hover:bg-(--kt-accent-comercial-hover) disabled:opacity-60">
            <MessageCircle size={19} aria-hidden="true" /> {enviar.isPending ? "Enviando…" : "Enviar pedido"}
          </button>
          <p className="text-xs leading-5 text-(--kt-ink-soft)">No se cobra nada ahora: te confirmamos disponibilidad y coordinamos el pago por WhatsApp.</p>
        </form>
        )}
      </aside>
    </div>
  );
}
