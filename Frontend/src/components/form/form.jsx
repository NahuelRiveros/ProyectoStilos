import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../ui/button";

const GAP     = { sm: "gap-3", md: "gap-4", lg: "gap-6" };
const COLUMNS = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
};
const PADDING = { sm: "p-4", md: "p-6", lg: "p-8" };
const RADIUS  = { md: "rounded-2xl", xl: "rounded-3xl" };

const VARIANT_CLASS = {
  elevated: "relative overflow-hidden bg-white/95 border border-slate-200 shadow-xl shadow-slate-200/60 backdrop-blur-sm",
  flat:     "relative overflow-hidden bg-white border border-slate-200",
  ghost:    "relative overflow-hidden bg-white/60 backdrop-blur-sm",
  minimal:  "",
};

const ICON_BG = {
  blue:    "bg-gradient-to-br from-blue-500 to-blue-700",
  indigo:  "bg-gradient-to-br from-indigo-500 to-indigo-700",
  violet:  "bg-gradient-to-br from-violet-500 to-violet-700",
  emerald: "bg-gradient-to-br from-emerald-500 to-emerald-700",
  rose:    "bg-gradient-to-br from-rose-500 to-rose-700",
  amber:   "bg-gradient-to-br from-amber-400 to-amber-600",
  slate:   "bg-gradient-to-br from-slate-500 to-slate-700",
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
 *   <Form onSubmit={onSubmit} title="Mi form">
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
 *   <Form grid columns={2} gap="lg" onSubmit={onSubmit}>
 *     {({ register }) => ( ... )}
 *   </Form>
 *
 *   columns: 1 | 2 | 3   (responsive: 1 col en mobile, N en desktop)
 *   gap:     "sm" | "md" | "lg"
 *
 * ── APARIENCIA ──────────────────────────────────────────────────
 *
 *   variant: "elevated" → sombra + borde (default)
 *            "flat"     → borde sin sombra
 *            "ghost"    → fondo semitransparente, sin borde
 *            "minimal"  → sin contenedor, solo el contenido
 *
 * ── RENDER PROPS DISPONIBLES ────────────────────────────────────
 *
 *   register, errors, loading, watch, setValue, reset,
 *   getValues, control, setError, clearErrors, methods
 *
 * ═══════════════════════════════════════════════════════════════
 */
export default function Form({
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
}) {
  const [loading, setLoading] = useState(false);

  const methods = useForm({ defaultValues });

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

  async function internalSubmit(data) {
    try {
      setLoading(true);
      await onSubmit?.(data, { register, reset, setValue, watch, control, getValues, clearErrors, setError, methods });
    } finally {
      setLoading(false);
    }
  }

  const finalSubmit = isRenderFunction
    ? handleSubmit(internalSubmit)
    : onSubmit;

  const layoutClass = grid
    ? ["grid", COLUMNS[columns] ?? COLUMNS[1], GAP[gap] ?? GAP.md].join(" ")
    : "space-y-4";

  const containerClass = [
    VARIANT_CLASS[variant],
    variant !== "minimal" ? PADDING[padding] ?? PADDING.md : "",
    variant !== "minimal" ? RADIUS[radius]  ?? RADIUS.xl  : "",
    className,
  ].join(" ");

  const renderProps = {
    register, errors, reset, setValue, watch,
    control, getValues, clearErrors, setError,
    loading, methods,
  };

  return (
    <form
      onSubmit={finalSubmit}
      noValidate={noValidate}
      className={containerClass}
      {...props}
    >
      {variant !== "minimal" && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_35%)]" />
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
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
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
