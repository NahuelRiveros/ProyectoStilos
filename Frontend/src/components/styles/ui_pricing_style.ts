export const UI_PRICING = {
  section: "bg-surface py-20 sm:py-28",
  container: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",

  header: "mb-14 text-center",
  eyebrow:
    "mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-champagne",
  title:
    "font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl",
  subtitle: "mx-auto mt-4 max-w-lg text-sm leading-7 text-muted",

  grid: "grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-3",

  // Card — neutral
  card: "relative flex flex-col bg-card p-8",
  cardHighlighted: "relative flex flex-col bg-navy p-8",

  badge:
    "absolute -top-[13px] left-8 bg-champagne px-3 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-navy",

  tierName: "text-[10px] font-bold uppercase tracking-[0.22em] text-muted",
  tierNameHighlighted:
    "text-[10px] font-bold uppercase tracking-[0.22em] text-champagne/70",

  priceRow: "mt-6 flex items-end gap-1.5 border-b border-line pb-6",
  priceRowHighlighted:
    "mt-6 flex items-end gap-1.5 border-b border-white/10 pb-6",
  priceAmount:
    "font-display text-5xl font-bold tracking-tight text-ink",
  priceAmountHighlighted:
    "font-display text-5xl font-bold tracking-tight text-white",
  pricePeriod: "mb-1.5 text-xs font-medium text-muted",
  pricePeriodHighlighted: "mb-1.5 text-xs font-medium text-white/45",

  description: "mt-5 text-sm leading-6 text-muted",
  descriptionHighlighted: "mt-5 text-sm leading-6 text-white/60",

  featureList: "mt-8 flex flex-col gap-3.5",
  feature: "flex items-start gap-3 text-sm text-ink",
  featureHighlighted: "flex items-start gap-3 text-sm text-white/80",
  featureCheck: "mt-0.5 shrink-0 text-emerald-500",
  featureCheckHighlighted: "mt-0.5 shrink-0 text-champagne",

  ctaWrap: "mt-auto pt-8",
  cta: "block w-full border border-ink/12 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-ink transition-all duration-200 hover:border-navy hover:bg-navy hover:text-white",
  ctaHighlighted:
    "block w-full bg-champagne py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-navy transition-all duration-200 hover:bg-champagne-light",
} as const;
