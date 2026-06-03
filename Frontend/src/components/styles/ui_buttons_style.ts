export const UI_BUTTONS = {
  base: "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 focus:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",

  sizes: {
    xs: "h-8 px-3 text-xs",
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
    xl: "h-14 px-7 text-lg",
  },

  iconOnlySizes: {
    xs: "h-8 w-8 p-0",
    sm: "h-9 w-9 p-0",
    md: "h-11 w-11 p-0",
    lg: "h-12 w-12 p-0",
    xl: "h-14 w-14 p-0",
  },

  fullWidth: "w-full",
  hidden: "hidden",
  loading: "cursor-wait opacity-80",
  spinner:
    "h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",

  variants: {
    primary:
      "bg-navy text-white shadow-sm hover:bg-navy-dark focus:ring-2 focus:ring-navy/20",
    secondary:
      "border border-line bg-card text-ink hover:bg-surface hover:text-ink focus:ring-2 focus:ring-navy/10",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-300",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 focus:ring-2 focus:ring-rose-300",
    warning:
      "bg-amber-500 text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-300",
    info:
      "bg-sky-600 text-white hover:bg-sky-700 focus:ring-2 focus:ring-sky-300",
    ghost:
      "bg-transparent text-ink hover:bg-surface hover:text-ink",
    link:
      "rounded-none bg-transparent px-0 text-ink underline-offset-4 hover:underline",
    outline:
      "border border-navy bg-transparent text-navy hover:bg-navy hover:text-white",
    accent:
      "bg-champagne text-navy shadow-sm hover:bg-champagne-light focus:ring-2 focus:ring-champagne/30",
  },

  disabledVariants: {
    primary:   "bg-navy/30 text-white/60 shadow-none",
    secondary: "border border-line/50 bg-surface text-muted",
    success:   "bg-emerald-200 text-emerald-500",
    danger:    "bg-rose-200 text-rose-500",
    warning:   "bg-amber-200 text-amber-500",
    info:      "bg-sky-200 text-sky-500",
    ghost:     "text-muted hover:bg-transparent",
    link:      "text-muted no-underline",
    outline:   "border border-line text-muted hover:bg-transparent",
    accent:    "bg-champagne-light text-muted shadow-none",
  },
} as const;

export type ButtonVariant = keyof typeof UI_BUTTONS.variants;
export type ButtonSize = keyof typeof UI_BUTTONS.sizes;
