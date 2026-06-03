import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { UI_INPUTS } from "../styles/ui_inputs_style";

const PRESET_RULES = {
  numeric:      { pattern: { value: /^[0-9]+$/,                          message: "Solo se permiten números" } },
  alpha:        { pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,        message: "Solo se permiten letras" } },
  alphanumeric: { pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/,     message: "Solo se permiten letras y números" } },
  phone:        { pattern: { value: /^[0-9+\-\s()]+$/,                   message: "Ingresá un teléfono válido" } },
  dni:          { pattern: { value: /^[0-9]{6,12}$/,                     message: "El documento debe tener entre 6 y 12 números" } },
  username:     { pattern: { value: /^[A-Za-z0-9._-]+$/,                 message: "Solo se permiten letras, números, punto, guion y guion bajo" } },
  postalCode:   { pattern: { value: /^[A-Za-z0-9\s-]+$/,                 message: "Ingresá un código postal válido" } },
};

function buildRules({ type, required, requiredMessage, minLength, maxLength, pattern, validate, watch, matchField, matchFieldMessage }) {
  const rules = {};

  if (required) rules.required = requiredMessage ?? "Este campo es obligatorio";

  if (type === "email") {
    rules.pattern = {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Ingresá un email válido",
    };
  }

  if (type === "password") {
    rules.minLength = {
      value: minLength ?? 6,
      message: `La contraseña debe tener al menos ${minLength ?? 6} caracteres`,
    };
  } else if (minLength) {
    rules.minLength = { value: minLength, message: `Debe tener al menos ${minLength} caracteres` };
  }

  if (maxLength) {
    rules.maxLength = { value: maxLength, message: `Debe tener como máximo ${maxLength} caracteres` };
  }

  if (pattern) rules.pattern = pattern;

  if (matchField && watch) {
    rules.validate = (value) =>
      value === watch(matchField) || (matchFieldMessage ?? "Los campos no coinciden");
  }

  if (validate) rules.validate = validate;

  return rules;
}

/*
 * ═══════════════════════════════════════════════════════════════
 * INPUT FIELD  —  Guía de uso
 * ═══════════════════════════════════════════════════════════════
 *
 * ── USO DENTRO DE UN FORM (con react-hook-form) ─────────────────
 *
 *   <InputField
 *     label="Nombre"
 *     name="nombre"
 *     placeholder="Juan"
 *     register={register}
 *     error={errors.nombre?.message}
 *     required
 *   />
 *
 * ── TIPOS: "text" | "email" | "password" | "number" | "date" | "time" | "search"
 * ── VALIDACIONES RÁPIDAS (validationPreset):
 *    "numeric" | "alpha" | "alphanumeric" | "phone" | "dni" | "username" | "postalCode"
 * ── CONFIRMAR CONTRASEÑA:
 *    watch={watch} matchField="password" matchFieldMessage="No coinciden"
 *
 * ═══════════════════════════════════════════════════════════════
 */
export default function InputField({
  label,
  name,
  id,
  register,
  rules,
  error,
  warning,
  success,
  helperText,
  type = "text",
  placeholder = "",
  value,
  onChange,
  onBlur,
  onKeyDown,
  autoComplete,
  autoCompleteEnabled = true,
  inputMode,
  min,
  max,
  step,
  minLength,
  maxLength,
  required = false,
  requiredMessage,
  disabled = false,
  readOnly = false,
  hidden = false,
  icon: Icon,
  rightIcon: RightIcon,
  showPasswordToggle = false,
  fullWidth = true,
  hideLabel = false,
  hideMessage = false,
  className = "",
  wrapperClassName = "",
  labelClassName = "",
  pattern,
  validate,
  validationPreset,
  watch,
  matchField,
  matchFieldMessage = "Los campos no coinciden",
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  const inputId    = id ?? name;
  const isPassword = type === "password";
  const finalType  = isPassword && showPassword ? "text" : type;
  const isControlled = value !== undefined || onChange !== undefined;

  const validationRules = useMemo(() => ({
    ...buildRules({ type, required, requiredMessage, minLength, maxLength, pattern, validate, watch, matchField, matchFieldMessage }),
    ...(validationPreset ? PRESET_RULES[validationPreset] : {}),
    ...(rules ?? {}),
  }), [type, required, requiredMessage, minLength, maxLength, pattern, validate, watch, matchField, matchFieldMessage, validationPreset, rules]);

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
          : readOnly
            ? UI_INPUTS.inputReadOnly
            : UI_INPUTS.inputEnabled;

  const message = error ?? warning ?? success ?? helperText;

  const messageClass = error
    ? UI_INPUTS.errorText
    : warning
      ? UI_INPUTS.warningText
      : success
        ? UI_INPUTS.successText
        : UI_INPUTS.helperText;

  const resolvedAutoComplete = (() => {
    if (autoComplete) return autoComplete;
    if (!autoCompleteEnabled) return "off";
    if (type === "password") return "new-password";
    if (type === "email")    return "email";
    return "on";
  })();

  return (
    <div
      className={[
        UI_INPUTS.fieldWrap,
        fullWidth ? "w-full" : "",
        wrapperClassName,
      ].join(" ")}
    >
      {label && !hideLabel && (
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

        <input
          id={inputId}
          name={name}
          type={finalType}
          placeholder={placeholder}
          autoComplete={resolvedAutoComplete}
          inputMode={inputMode}
          min={min}
          max={max}
          step={step}
          minLength={minLength}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={Boolean(error)}
          aria-describedby={message ? `${inputId}-message` : undefined}
          className={[
            UI_INPUTS.inputBase,
            Icon ? UI_INPUTS.inputWithLeftIcon : "",
            RightIcon || showPasswordToggle ? UI_INPUTS.inputWithRightIcon : "",
            stateClass,
            className,
          ].join(" ")}
          {...registeredProps}
          {...(isControlled ? { value, onChange } : {})}
          onBlur={(e) => {
            registeredProps?.onBlur?.(e);
            onBlur?.(e);
          }}
          onKeyDown={onKeyDown}
          {...rest}
        />

        {RightIcon && !showPasswordToggle && (
          <RightIcon className={UI_INPUTS.inputIconRight} />
        )}

        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className={UI_INPUTS.passwordToggle}
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {!hideMessage && message && (
        <p id={`${inputId}-message`} className={messageClass}>
          {message}
        </p>
      )}
    </div>
  );
}
