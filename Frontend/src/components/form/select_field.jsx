import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { UI_INPUTS } from "../styles/ui_inputs_style";

/*
 * ═══════════════════════════════════════════════════════════════
 * SELECT FIELD  —  Guía de uso
 * ═══════════════════════════════════════════════════════════════
 *
 * ── USO BÁSICO CON DATOS DE LA API ──────────────────────────────
 *
 *   <SelectField
 *     label="Sexo"
 *     name="sexo_id"
 *     register={register}
 *     error={errors.sexo_id?.message}
 *     required
 *     options={sexos}
 *     optionValue="ID_USEPERS02"
 *     optionLabel="USEPERS02_DESCRI"
 *     placeholder="Seleccionar sexo"
 *   />
 *
 * ── CON OPCIONES FIJAS ──────────────────────────────────────────
 *
 *   const OPCIONES = [{ value: "A", label: "Opción A" }]
 *   <SelectField options={OPCIONES} optionValue="value" optionLabel="label" ... />
 *
 * ═══════════════════════════════════════════════════════════════
 */
export default function SelectField({
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
}) {
  const inputId = id ?? name;
  const isControlled = value !== undefined || onChange !== undefined;

  const validationRules = useMemo(() => ({
    ...(required && { required: requiredMessage ?? "Este campo es obligatorio" }),
    ...(rules ?? {}),
  }), [required, requiredMessage, rules]);

  const registeredProps =
    !isControlled && register && name ? register(name, validationRules) : {};

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
