import { useId } from "react";
import { cn } from "@/utils/cn.js";

/** opciones: [{ valor, etiqueta, deshabilitada? }]. `ayuda`: texto debajo (el error lo reemplaza). */
export default function SelectField({ label, name, register, error, ayuda, opciones = [], placeholder, required = false, className = "", ...resto }) {
  const id = `${name}-${useId()}`;
  const mensaje = error ?? ayuda;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
          {required && <span aria-hidden="true" className="ml-0.5 text-peligro">*</span>}
        </label>
      )}
      <select
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={mensaje ? `${id}-mensaje` : undefined}
        className={cn(
          "mt-1 w-full rounded-xl border bg-superficie px-3 py-2 text-texto outline-none focus:border-primario focus:ring-2 focus:ring-primario/20",
          error ? "border-peligro" : "border-borde",
          className,
        )}
        {...(register ? register(name) : { name })}
        {...resto}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor} disabled={o.deshabilitada}>
            {o.etiqueta}
          </option>
        ))}
      </select>
      {mensaje && (
        <p id={`${id}-mensaje`} className={cn("mt-1 text-sm", error ? "text-peligro" : "text-texto-suave")}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
