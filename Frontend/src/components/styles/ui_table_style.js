const UI_TABLE = {
  wrap: "w-full overflow-hidden rounded-3xl border border-line bg-card shadow-sm",
  header: "flex flex-col gap-3 border-b border-line bg-surface/80 p-4 md:flex-row md:items-center md:justify-between",
  titleBox: "min-w-0",
  title: "text-base font-black text-ink",
  subtitle: "mt-1 text-sm font-medium text-muted",
  searchWrap: "flex w-full items-center gap-2 rounded-2xl border border-line bg-card px-3 py-2 md:max-w-xs",
  searchInput: "w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted",
  tableWrap: "w-full overflow-x-auto",
  table: "w-full min-w-[720px] border-collapse text-left",
  thead: "bg-surface text-xs uppercase tracking-wide text-muted",
  th: "whitespace-nowrap px-4 py-3 font-black",
  tbody: "divide-y divide-line",
  tr: "transition hover:bg-surface/60",
  td: "px-4 py-3 text-sm font-medium text-ink",
  tdMuted: "px-4 py-3 text-sm font-medium text-muted",
  actionsCell: "whitespace-nowrap px-4 py-3",
  actionsWrap: "flex items-center gap-2",
  empty: "px-4 py-10 text-center text-sm font-semibold text-muted",
  loading: "px-4 py-10 text-center text-sm font-semibold text-muted",
  footer: "flex items-center justify-between border-t border-line bg-surface px-4 py-3 text-xs font-semibold text-muted",
  actionVariants: {
    view: { variant: "info", className: "" },
    edit: { variant: "warning", className: "" },
    delete: { variant: "danger", className: "" }
  }
};
export {
  UI_TABLE
};
