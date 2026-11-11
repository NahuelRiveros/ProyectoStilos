import { Store, Truck } from "lucide-react";
import InputField from "../../../core/controls/ui/input_field.jsx";
import { cn } from "../../../core/utils/cn.js";
import { clientConfig } from "../../../../../proyecto/client_config.js";

const { direccionLocal } = clientConfig.entrega;
const OPCIONES = [
  { valor: "retiro", titulo: "Retiro en el local", detalle: direccionLocal ?? "Te pasamos la dirección por WhatsApp.", Icono: Store },
  { valor: "envio", titulo: "Envío a domicilio", detalle: "El costo depende de la zona: lo coordinamos por WhatsApp.", Icono: Truck },
];

/** ROP-18: retiro o envío; si es envío, dirección y localidad. Lo usan el pedido sin cuenta y con cuenta. */
export default function SelectorEntrega({ register, entrega, errors }) {
  return (
    <>
      <fieldset>
        <legend className="text-sm font-semibold text-gray-700">¿Cómo lo recibís?</legend>
        <div className="mt-2 grid gap-2">
          {OPCIONES.map(({ valor, titulo, detalle, Icono }) => (
            <label key={valor} className={cn("flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3", entrega === valor ? "border-(--kt-petrol) ring-1 ring-(--kt-petrol)" : "border-(--kt-border)")}>
              <input type="radio" value={valor} {...register("entrega", { required: "Elegí si retirás o te lo enviamos." })} className="mt-0.5 h-5 w-5 shrink-0 accent-(--kt-petrol)" />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-semibold"><Icono size={16} aria-hidden="true" /> {titulo}</span>
                <span className="mt-0.5 block text-xs leading-5 text-(--kt-ink-soft)">{detalle}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.entrega && <p role="alert" className="mt-1 text-sm text-red-600">{errors.entrega.message}</p>}
      </fieldset>
      {entrega === "envio" && (
        <>
          <InputField name="direccion" label="Dirección" autoComplete="street-address" placeholder="Calle y número, piso o depto." register={register} required requiredMessage="Escribí la dirección de entrega (calle y número)." maxLength={120} error={errors.direccion?.message} />
          <InputField name="localidad" label="Localidad" autoComplete="address-level2" register={register} required requiredMessage="Escribí la localidad." maxLength={80} error={errors.localidad?.message} />
        </>
      )}
    </>
  );
}
