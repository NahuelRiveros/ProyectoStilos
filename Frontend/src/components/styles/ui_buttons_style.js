const UI_BUTTONS = {
  base: "btn",
  sizes: {
    xs: "btn-sm",
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
    xl: "btn-lg"
  },
  iconOnlySizes: {
    xs: "h-8 w-8 p-0",
    sm: "h-9 w-9 p-0",
    md: "h-11 w-11 p-0",
    lg: "h-12 w-12 p-0",
    xl: "h-14 w-14 p-0"
  },
  fullWidth: "w-full",
  hidden: "hidden",
  loading: "cursor-wait opacity-80",
  spinner: "h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
  variants: {
    primary: "btn-primary",
    secondary: "btn-secondary",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-300",
    danger: "btn-danger",
    warning: "bg-amber-500 text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-300",
    info: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-2 focus:ring-sky-300",
    ghost: "btn-ghost",
    link: "btn-link",
    outline: "btn-outline",
    accent: "btn-accent",
    whatsapp: "btn-whatsapp"
  },
  disabledVariants: {
    primary: "bg-navy/30 text-white/60 shadow-none",
    secondary: "border border-line/50 bg-surface text-muted",
    success: "bg-emerald-200 text-emerald-500",
    danger: "bg-rose-200 text-rose-500",
    warning: "bg-amber-200 text-amber-500",
    info: "bg-sky-200 text-sky-500",
    ghost: "text-muted hover:bg-transparent",
    link: "text-muted no-underline",
    outline: "border border-line text-muted hover:bg-transparent",
    accent: "bg-champagne-light text-muted shadow-none"
  }
};
export {
  UI_BUTTONS
};
