export const UI_TABLE = {
  wrap: "w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
  header:
    "flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 p-4 md:flex-row md:items-center md:justify-between",
  titleBox:   "min-w-0",
  title:      "text-base font-black text-slate-900",
  subtitle:   "mt-1 text-sm font-medium text-slate-500",
  searchWrap:
    "flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 md:max-w-xs",
  searchInput:
    "w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400",
  tableWrap:  "w-full overflow-x-auto",
  table:      "w-full min-w-[720px] border-collapse text-left",
  thead:      "bg-slate-50 text-xs uppercase tracking-wide text-slate-500",
  th:         "whitespace-nowrap px-4 py-3 font-black",
  tbody:      "divide-y divide-slate-100",
  tr:         "transition hover:bg-slate-50",
  td:         "px-4 py-3 text-sm font-medium text-slate-700",
  tdMuted:    "px-4 py-3 text-sm font-medium text-slate-400",
  actionsCell:"whitespace-nowrap px-4 py-3",
  actionsWrap:"flex items-center gap-2",
  empty:      "px-4 py-10 text-center text-sm font-semibold text-slate-400",
  loading:    "px-4 py-10 text-center text-sm font-semibold text-slate-400",
  footer:
    "flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500",
  actionVariants: {
    view:   { variant: "info",    className: "" },
    edit:   { variant: "warning", className: "" },
    delete: { variant: "danger",  className: "" },
  },
};
