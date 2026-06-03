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
  spinner: "h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",

  variants: {
    primary:   "bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus:ring-2 focus:ring-slate-300",
    secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:ring-2 focus:ring-slate-200",
    success:   "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-300",
    danger:    "bg-rose-600 text-white hover:bg-rose-700 focus:ring-2 focus:ring-rose-300",
    warning:   "bg-amber-500 text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-300",
    info:      "bg-sky-600 text-white hover:bg-sky-700 focus:ring-2 focus:ring-sky-300",
    ghost:     "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900",
    link:      "rounded-none bg-transparent px-0 text-slate-700 underline-offset-4 hover:underline",
    outline:   "border border-slate-900 bg-transparent text-slate-900 hover:bg-slate-900 hover:text-white",
  },

  disabledVariants: {
    primary:   "bg-slate-300 text-slate-500 shadow-none hover:bg-slate-300",
    secondary: "border border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-100",
    success:   "bg-emerald-200 text-emerald-500 hover:bg-emerald-200",
    danger:    "bg-rose-200 text-rose-500 hover:bg-rose-200",
    warning:   "bg-amber-200 text-amber-500 hover:bg-amber-200",
    info:      "bg-sky-200 text-sky-500 hover:bg-sky-200",
    ghost:     "text-slate-400 hover:bg-transparent",
    link:      "text-slate-400 no-underline",
    outline:   "border border-slate-300 text-slate-400 hover:bg-transparent",
  },
};
