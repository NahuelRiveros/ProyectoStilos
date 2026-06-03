import { useState } from "react";
import { useForm } from "react-hook-form";
import type { ReactNode, FormHTMLAttributes } from "react";
import type {
  FieldValues,
  DefaultValues,
  UseFormReturn,
  SubmitHandler,
} from "react-hook-form";
import Button from "../ui/button";

type GapSize = "sm" | "md" | "lg";
type ColumnCount = 1 | 2 | 3;
type PaddingSize = "sm" | "md" | "lg";
type RadiusSize = "md" | "xl";
type Variant = "elevated" | "flat" | "ghost" | "minimal";
type IconBg = "blue" | "indigo" | "violet" | "emerald" | "rose" | "amber" | "slate" | "navy" | "champagne";

interface FormRenderProps<T extends FieldValues> {
  register: UseFormReturn<T>["register"];
  errors: UseFormReturn<T>["formState"]["errors"];
  reset: UseFormReturn<T>["reset"];
  setValue: UseFormReturn<T>["setValue"];
  watch: UseFormReturn<T>["watch"];
  control: UseFormReturn<T>["control"];
  getValues: UseFormReturn<T>["getValues"];
  clearErrors: UseFormReturn<T>["clearErrors"];
  setError: UseFormReturn<T>["setError"];
  loading: boolean;
  methods: UseFormReturn<T>;
}

interface FormProps<T extends FieldValues = FieldValues>
  extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "children"> {
  children: ((props: FormRenderProps<T>) => ReactNode) | ReactNode;
  onSubmit?: (
    data: T,
    helpers: Omit<FormRenderProps<T>, "loading" | "errors">
  ) => Promise<void> | void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  iconBg?: IconBg;
  defaultValues?: DefaultValues<T>;
  showSubmit?: boolean;
  submitLabel?: string;
  loadingLabel?: string;
  grid?: boolean;
  columns?: ColumnCount;
  gap?: GapSize;
  variant?: Variant;
  padding?: PaddingSize;
  radius?: RadiusSize;
  noValidate?: boolean;
  className?: string;
}

const GAP: Record<GapSize, string> = { sm: "gap-3", md: "gap-4", lg: "gap-6" };
const COLUMNS: Record<ColumnCount, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
};
const PADDING: Record<PaddingSize, string> = { sm: "p-4", md: "p-6", lg: "p-8" };
const RADIUS: Record<RadiusSize, string> = { md: "rounded-2xl", xl: "rounded-3xl" };

const VARIANT_CLASS: Record<Variant, string> = {
  elevated: "relative overflow-hidden bg-card/95 border border-line shadow-xl shadow-navy/8 backdrop-blur-sm",
  flat:     "relative overflow-hidden bg-card border border-line",
  ghost:    "relative overflow-hidden bg-card/60 backdrop-blur-sm",
  minimal:  "",
};

const ICON_BG: Record<IconBg, string> = {
  blue:      "bg-gradient-to-br from-blue-500 to-blue-700",
  indigo:    "bg-gradient-to-br from-indigo-500 to-indigo-700",
  violet:    "bg-gradient-to-br from-violet-500 to-violet-700",
  emerald:   "bg-gradient-to-br from-emerald-500 to-emerald-700",
  rose:      "bg-gradient-to-br from-rose-500 to-rose-700",
  amber:     "bg-gradient-to-br from-amber-400 to-amber-600",
  slate:     "bg-gradient-to-br from-slate-500 to-slate-700",
  navy:      "bg-gradient-to-br from-navy to-navy-dark",
  champagne: "bg-gradient-to-br from-champagne to-champagne-light",
};

/*
 * ═══════════════════════════════════════════════════════════════
 * FORM  —  Guía de uso
 * ═══════════════════════════════════════════════════════════════
 *
 * Wrapper de formulario basado en react-hook-form.
 * Expone register, errors, watch, setValue, etc. via render prop.
 *
 * ── USO BÁSICO ──────────────────────────────────────────────────
 *
 *   interface MiForm { nombre: string; email: string }
 *
 *   <Form<MiForm> onSubmit={onSubmit} title="Mi form">
 *     {({ register, errors, loading }) => (
 *       <>
 *         <InputField name="nombre" label="Nombre" register={register} />
 *         <Button type="submit" label="Guardar" loading={loading} />
 *       </>
 *     )}
 *   </Form>
 *
 * ── LAYOUT EN GRILLA ────────────────────────────────────────────
 *
 *   <Form<MiForm> grid columns={2} gap="lg" onSubmit={onSubmit}>
 *     {({ register }) => ( ... )}
 *   </Form>
 *
 *   columns: 1 | 2 | 3   (responsive: 1 col en mobile, N en desktop)
 *   gap:     "sm" | "md" | "lg"
 *
 * ── APARIENCIA ──────────────────────────────────────────────────
 *
 *   variant: "elevated"  → sombra + borde (default)
 *            "flat"      → borde sin sombra
 *            "ghost"     → fondo semitransparente, sin borde
 *            "minimal"   → sin contenedor, solo el contenido
 *
 *   padding: "sm" | "md" | "lg"
 *   radius:  "md" | "xl"
 *
 * ── HEADER DEL FORM (ícono + título + subtítulo) ─────────────────
 *
 *   import { User } from "lucide-react"
 *
 *   <Form
 *     icon={<User className="h-7 w-7" />}
 *     iconBg="indigo"          // "blue"|"indigo"|"violet"|"emerald"|"rose"|"amber"|"slate"
 *     title="Crear usuario"
 *     subtitle="Completá los datos."
 *   >
 *
 * ── BOTÓN DE SUBMIT INTEGRADO ────────────────────────────────────
 *
 *   <Form showSubmit submitLabel="Guardar" loadingLabel="Guardando...">
 *     {({ register }) => ( ... )}
 *   </Form>
 *
 *   Si showSubmit es false (default), poné tu propio <Button type="submit">
 *   dentro del render prop para tener más control de posición/estilo.
 *
 * ── VALORES INICIALES ────────────────────────────────────────────
 *
 *   <Form<MiForm> defaultValues={{ nombre: "Juan", email: "" }}>
 *
 * ── RENDER PROPS DISPONIBLES ────────────────────────────────────
 *
 *   register    → conecta el input al form (siempre necesario)
 *   errors      → errores de validación por campo (errors.campo?.message)
 *   loading     → true mientras el onSubmit está ejecutándose
 *   watch       → observa el valor de un campo en tiempo real
 *   setValue    → cambia el valor de un campo programáticamente
 *   reset       → resetea todos los campos al defaultValues
 *   getValues   → obtiene todos los valores actuales sin suscribirse
 *   control     → necesario para componentes controlados (Controller)
 *   setError    → agrega un error manual a un campo
 *   clearErrors → limpia errores manualmente
 *   methods     → objeto completo de react-hook-form (escape hatch)
 *
 * ═══════════════════════════════════════════════════════════════
 */
export default function Form<T extends FieldValues = FieldValues>({
  children,
  onSubmit,
  title,
  subtitle,
  icon,
  iconBg = "blue",
  defaultValues,
  showSubmit = false,
  submitLabel = "Guardar",
  loadingLabel = "Guardando...",
  grid = false,
  columns = 1,
  gap = "md",
  variant = "elevated",
  padding = "md",
  radius = "xl",
  noValidate = true,
  className = "",
  ...props
}: FormProps<T>) {
  const [loading, setLoading] = useState(false);

  const methods = useForm<T>({ defaultValues });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
    getValues,
    clearErrors,
    setError,
  } = methods;

  const isRenderFunction = typeof children === "function";

  async function internalSubmit(data: T) {
    try {
      setLoading(true);
      await onSubmit?.(data, { register, reset, setValue, watch, control, getValues, clearErrors, setError, methods });
    } finally {
      setLoading(false);
    }
  }

  const finalSubmit = isRenderFunction
    ? handleSubmit(internalSubmit as SubmitHandler<FieldValues>)
    : (onSubmit as FormHTMLAttributes<HTMLFormElement>["onSubmit"]);

  const layoutClass = grid
    ? ["grid", COLUMNS[columns] ?? COLUMNS[1], GAP[gap] ?? GAP.md].join(" ")
    : "space-y-4";

  const containerClass = [
    VARIANT_CLASS[variant],
    variant !== "minimal" ? PADDING[padding] ?? PADDING.md : "",
    variant !== "minimal" ? RADIUS[radius] ?? RADIUS.xl : "",
    className,
  ].join(" ");

  const renderProps: FormRenderProps<T> = {
    register,
    errors,
    reset,
    setValue,
    watch,
    control,
    getValues,
    clearErrors,
    setError,
    loading,
    methods,
  };

  return (
    <form
      onSubmit={finalSubmit}
      noValidate={noValidate}
      className={containerClass}
      {...props}
    >
      {variant !== "minimal" && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(199,169,139,0.08),transparent_35%)]" />
      )}

      <div className="relative z-10">
        {(title || subtitle || icon) && (
          <div className="mb-6 text-center">
            {icon && (
              <div
                className={[
                  "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg",
                  ICON_BG[iconBg],
                ].join(" ")}
              >
                {icon}
              </div>
            )}
            {title && (
              <h2 className="text-2xl font-black tracking-tight text-ink">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>
            )}
          </div>
        )}

        <div className={layoutClass}>
          {isRenderFunction ? children(renderProps) : children}
        </div>

        {showSubmit && (
          <div className="mt-6">
            <Button
              type="submit"
              label={loading ? loadingLabel : submitLabel}
              loading={loading}
              fullWidth
            />
          </div>
        )}
      </div>
    </form>
  );
}
