import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import type { ComponentType, SelectHTMLAttributes, ChangeEvent } from "react";
import type {
  UseFormRegister,
  RegisterOptions,
  FieldValues,
  Path,
} from "react-hook-form";
import { UI_INPUTS } from "../styles/ui_inputs_style";

interface SelectOption {
  [key: string]: unknown;
}

interface SelectFieldProps<T extends FieldValues = FieldValues>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "name" | "onChange"> {
  label?: string;
  name?: Path<T>;
  id?: string;
  register?: UseFormRegister<T>;
  rules?: RegisterOptions<T>;
  options?: SelectOption[];
  optionValue?: string;
  optionLabel?: string;
  placeholder?: string;
  error?: string;
  warning?: string;
  success?: string;
  helperText?: string;
  required?: boolean;
  requiredMessage?: string;
  disabled?: boolean;
  hidden?: boolean;
  icon?: ComponentType<{ className?: string }>;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  fullWidth?: boolean;
  className?: string;
  wrapperClassName?: string;
  labelClassName?: string;
}

/*
 * ═══════════════════════════════════════════════════════════════
 * SELECT FIELD  —  Guía de uso
 * ═══════════════════════════════════════════════════════════════
 *
 * ── USO BÁSICO CON DATOS DE LA API ──────────────────────────────
 *
 *   // 1. Definí la interface del objeto que viene de la API
 *   interface Sexo { ID_USEPERS02: number; USEPERS02_DESCRI: string }
 *
 *   // 2. Cargá en estado
 *   const [sexos, setSexos] = useState<Sexo[]>([])
 *
 *   // 3. Usá el componente
 *   <SelectField
 *     label="Sexo"
 *     name="sexo_id"
 *     register={register}
 *     error={errors.sexo_id?.message}
 *     required
 *     options={sexos}
 *     optionValue="ID_USEPERS02"     ← qué campo se guarda como valor
 *     optionLabel="USEPERS02_DESCRI" ← qué campo se muestra al usuario
 *     placeholder="Seleccionar sexo"
 *   />
 *
 *   El valor guardado en el form siempre es string (conversión automática).
 *   Si tu backend necesita number, convertí en onSubmit: Number(data.sexo_id)
 *
 * ── CON OPCIONES FIJAS (sin API) ────────────────────────────────
 *
 *   const OPCIONES = [
 *     { value: "A", label: "Opción A" },
 *     { value: "B", label: "Opción B" },
 *   ]
 *
 *   <SelectField
 *     label="Tipo"
 *     name="tipo"
 *     register={register}
 *     options={OPCIONES}
 *     optionValue="value"   ← default, podés omitirlo
 *     optionLabel="label"   ← default, podés omitirlo
 *   />
 *
 * ── MODO CONTROLADO (sin Form / sin register) ────────────────────
 *
 *   const [elegido, setElegido] = useState("")
 *
 *   <SelectField
 *     label="País"
 *     options={paises}
 *     optionValue="codigo"
 *     optionLabel="nombre"
 *     value={elegido}
 *     onChange={(e) => setElegido(e.target.value)}
 *   />
 *
 * ── CON ÍCONO ────────────────────────────────────────────────────
 *
 *   import { Globe } from "lucide-react"
 *   <SelectField icon={Globe} label="País" name="pais" ... />
 *
 * ── ESTADOS VISUALES ─────────────────────────────────────────────
 *
 *   error="Seleccioná una opción"  → borde rojo + texto debajo
 *   warning="Verificá tu elección" → borde amarillo
 *   success="Selección válida"     → borde verde
 *   helperText="Texto de ayuda"    → texto gris debajo
 *
 * ── OTROS FLAGS ÚTILES ───────────────────────────────────────────
 *
 *   required    → agrega * al label y valida que no esté vacío
 *   disabled    → select grisado, no interactuable
 *   hidden      → no renderiza nada (útil para visibilidad condicional)
 *   fullWidth   → 100% del contenedor (default: true)
 *
 * ═══════════════════════════════════════════════════════════════
 */
export default function SelectField<T extends FieldValues = FieldValues>({
  label,
  name,
  id,
  register,
  rules,
  options = [],
  optionValue = "value",
  optionLabel = "label",
  placeholder = "Seleccionar",
  error,
  warning,
  success,
  helperText,
  required = false,
  requiredMessage,
  disabled = false,
  hidden = false,
  icon: Icon,
  value,
  onChange,
  fullWidth = true,
  className = "",
  wrapperClassName = "",
  labelClassName = "",
  ...rest
}: SelectFieldProps<T>) {
  const inputId = id ?? name;
  const isControlled = value !== undefined || onChange !== undefined;

  const validationRules = useMemo(() => ({
    ...(required && { required: requiredMessage ?? "Este campo es obligatorio" }),
    ...(rules ?? {}),
  }), [required, requiredMessage, rules]);

  const registeredProps =
    !isControlled && register && name ? register(name, validationRules as RegisterOptions<T>) : {};

  if (hidden) return null;

  const stateClass = error
    ? UI_INPUTS.inputError
    : warning
      ? UI_INPUTS.inputWarning
      : success
        ? UI_INPUTS.inputSuccess
        : disabled
          ? UI_INPUTS.inputDisabled
          : UI_INPUTS.inputEnabled;

  const message = error ?? warning ?? success ?? helperText;

  const messageClass = error
    ? UI_INPUTS.errorText
    : warning
      ? UI_INPUTS.warningText
      : success
        ? UI_INPUTS.successText
        : UI_INPUTS.helperText;

  return (
    <div
      className={[
        UI_INPUTS.fieldWrap,
        fullWidth ? "w-full" : "",
        wrapperClassName,
      ].join(" ")}
    >
      {label && (
        <label
          htmlFor={inputId}
          className={[UI_INPUTS.label, labelClassName].join(" ")}
        >
          {label}
          {required && <span className={UI_INPUTS.requiredMark}>*</span>}
        </label>
      )}

      <div className={UI_INPUTS.inputShell}>
        {Icon && <Icon className={UI_INPUTS.inputIconLeft} />}

        <select
          id={inputId}
          name={name}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={[
            UI_INPUTS.inputBase,
            Icon ? UI_INPUTS.inputWithLeftIcon : "",
            "appearance-none pr-10",
            stateClass,
            className,
          ].join(" ")}
          {...registeredProps}
          {...(isControlled ? { value, onChange } : {})}
          {...rest}
        >
          <option value="">{placeholder}</option>

          {options.map((item, index) => (
            <option
              key={`${String(item[optionValue])}-${index}`}
              value={String(item[optionValue])}
            >
              {String(item[optionLabel])}
            </option>
          ))}
        </select>

        <ChevronDown
          className={`${UI_INPUTS.inputIconRight} pointer-events-none`}
        />
      </div>

      {message && <p className={messageClass}>{message}</p>}
    </div>
  );
}
