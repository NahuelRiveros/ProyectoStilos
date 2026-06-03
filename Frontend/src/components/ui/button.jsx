import { UI_BUTTONS } from "../styles/ui_buttons_style";

export default function Button({
  children,
  label,
  type = "button",
  variant = "primary",
  size = "md",
  icon: Icon,
  rightIcon: RightIcon,
  iconOnly = false,
  loading = false,
  loadingLabel = "Procesando...",
  showSpinner = true,
  disabled = false,
  hidden = false,
  fullWidth = false,
  onClick,
  className = "",
  ariaLabel,
  ...props
}) {
  if (hidden) return null;

  const isDisabled = disabled || loading;

  const sizeClass = iconOnly
    ? UI_BUTTONS.iconOnlySizes[size] ?? UI_BUTTONS.iconOnlySizes.md
    : UI_BUTTONS.sizes[size] ?? UI_BUTTONS.sizes.md;

  const variantClass = isDisabled
    ? UI_BUTTONS.disabledVariants[variant] ?? UI_BUTTONS.disabledVariants.primary
    : UI_BUTTONS.variants[variant] ?? UI_BUTTONS.variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel ?? label}
      className={[
        UI_BUTTONS.base,
        sizeClass,
        variantClass,
        fullWidth ? UI_BUTTONS.fullWidth : "",
        loading ? UI_BUTTONS.loading : "",
        className,
      ].join(" ")}
      {...props}
    >
      {loading && showSpinner && <span className={UI_BUTTONS.spinner} />}

      {!loading && Icon && <Icon className="h-4 w-4" />}

      {!iconOnly && (
        <span>{loading ? loadingLabel : children ?? label}</span>
      )}

      {!loading && RightIcon && !iconOnly && <RightIcon className="h-4 w-4" />}
    </button>
  );
}
