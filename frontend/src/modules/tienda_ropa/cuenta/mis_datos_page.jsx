import { useForm } from "react-hook-form";
import InputField from "../../../core/controls/ui/input_field.jsx";
import FormError from "../../../core/controls/ui/form_error.jsx";
import { useToast } from "../../../core/controls/toast/use_toast.js";
import { useAccionesCuenta, useMisDatos, mensajeError } from "../hooks/use_ropa.js";
import { ErrorReintentar } from "../tienda/estados.jsx";

const CAMPOS = ["nombre", "apellido", "celular", "direccion", "localidad", "codigo_postal"];

/** Mis datos (ROP-41): nombre, apellido, celular y domicilio para los pedidos. */
export default function MisDatosPage() {
  const consulta = useMisDatos();
  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <h1 className="kt-display text-4xl font-semibold">Mis datos</h1>
      <p className="mt-2 text-sm text-(--kt-ink-soft)">Los usamos para preparar y entregar tus pedidos.</p>
      <div className="mt-6">
        {consulta.isPending ? <div role="status" aria-label="Cargando tus datos" className="h-80 animate-pulse rounded-2xl bg-(--kt-bg-soft)" />
          : consulta.isError ? <ErrorReintentar consulta={consulta} mensaje="No pudimos cargar tus datos." />
          : <Formulario datos={consulta.data} />}
      </div>
    </div>
  );
}

function Formulario({ datos }) {
  const { guardarDatos } = useAccionesCuenta();
  const toast = useToast();
  const { register, handleSubmit, setError, formState: { errors } } = useForm({ defaultValues: Object.fromEntries(CAMPOS.map((c) => [c, datos[c] ?? ""])) });

  async function guardar(valores) {
    try { toast.success((await guardarDatos.mutateAsync(valores)).mensaje); }
    catch (error) {
      const porCampo = error?.response?.data?.errores ?? [];
      porCampo.forEach((e) => setError(e.campo, { message: e.mensaje }));
      if (!porCampo.length) setError("root", { message: mensajeError(error, "No pudimos guardar tus datos.") });
    }
  }

  return (
    <form onSubmit={handleSubmit(guardar)} noValidate className="space-y-4 rounded-2xl border border-(--kt-border) bg-white p-5">
      <p className="text-sm text-(--kt-ink-soft)">Email: <strong className="text-(--kt-ink)">{datos.email}</strong></p>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField name="nombre" label="Nombre" autoComplete="given-name" register={register} required requiredMessage="Escribí tu nombre." maxLength={100} error={errors.nombre?.message} />
        <InputField name="apellido" label="Apellido" autoComplete="family-name" register={register} required requiredMessage="Escribí tu apellido." maxLength={100} error={errors.apellido?.message} />
      </div>
      <InputField name="celular" type="tel" inputMode="tel" label="Celular" autoComplete="tel" placeholder="3704 123456" helperText="Con código de área, para avisarte por WhatsApp." register={register} required requiredMessage="Escribí tu celular." error={errors.celular?.message} />
      <InputField name="direccion" label="Dirección (para envíos)" autoComplete="street-address" placeholder="Calle y número, piso o depto." register={register} maxLength={120} error={errors.direccion?.message} />
      <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
        <InputField name="localidad" label="Localidad" autoComplete="address-level2" register={register} maxLength={80} error={errors.localidad?.message} />
        <InputField name="codigo_postal" label="Código postal" autoComplete="postal-code" inputMode="numeric" register={register} maxLength={10} error={errors.codigo_postal?.message} />
      </div>
      <FormError message={errors.root?.message} />
      <button type="submit" disabled={guardarDatos.isPending} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-(--kt-petrol) px-6 font-bold text-(--kt-accent-on-dark) disabled:opacity-60 sm:w-auto">
        {guardarDatos.isPending ? "Guardando…" : "Guardar mis datos"}
      </button>
    </form>
  );
}
