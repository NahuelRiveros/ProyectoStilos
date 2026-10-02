import { useId } from "react";
import { cn } from "@/utils/cn.js";

/** `ayuda`: texto debajo (el error lo reemplaza). */
export default function TextareaField({ label, name, register, error, ayuda, rows = 4, ...resto }) {
  const id = `${name}-${useId()}`;
  const mensaje = error ?? ayuda;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={mensaje ? `${id}-mensaje` : undefined}
        className={cn(
          "mt-1 w-full rounded-xl border bg-superficie px-3 py-2 text-texto outline-none focus:border-primario focus:ring-2 focus:ring-primario/20",
          error ? "border-peligro" : "border-borde",
        )}
        {...(register ? register(name) : { name })}
        {...resto}
      />
      {mensaje && (
        <p id={`${id}-mensaje`} className={cn("mt-1 text-sm", error ? "text-peligro" : "text-texto-suave")}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
