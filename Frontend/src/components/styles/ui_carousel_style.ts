export const UI_CAROUSEL = {
  shell: "relative overflow-hidden bg-card",
  viewport: "overflow-hidden",
  track: "flex transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]",
  slide: "min-w-full",

  // Split editorial layout
  grid: "mx-auto grid min-h-[560px] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:gap-20 lg:px-8 lg:py-20",

  // Text column
  content: "order-2 flex flex-col lg:order-1",
  badge:
    "mb-5 w-fit border-b border-champagne/50 pb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-champagne",
  title:
    "font-display text-5xl font-bold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-7xl",
  titleAccent: "font-display font-bold italic text-champagne",
  subtitle: "mt-3 font-display text-xl font-medium italic text-muted",
  description: "mt-5 max-w-sm text-sm leading-7 text-muted",
  tags: "mt-5 flex flex-wrap gap-2",
  tag: "border border-line px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted",
  ctaRow: "mt-9 flex flex-wrap items-center gap-5",
  ctaPrimary:
    "inline-flex items-center gap-2.5 bg-navy px-7 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-dark hover:shadow-lg hover:shadow-navy/20",
  ctaSecondary:
    "group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:text-navy",
  ctaArrow:
    "text-champagne transition-transform duration-200 group-hover:translate-x-0.5",

  // Image column
  imageWrap: "relative order-1 lg:order-2",
  imageFrame:
    "relative mx-auto aspect-[3/4] max-h-[500px] w-full max-w-[280px] overflow-hidden bg-champagne-light sm:max-w-xs lg:max-w-none",
  imageFrameAccent:
    "absolute -bottom-3 -right-3 aspect-[3/4] max-h-[500px] w-full border border-champagne/35 lg:max-w-none",
  image: "h-full w-full object-cover",
  imagePlaceholder:
    "flex h-full w-full items-center justify-center text-champagne/20",

  // Controls bar
  controlsOuter: "border-t border-line",
  controlsInner:
    "mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8",
  dotsWrap: "flex items-center gap-2",
  dot: "h-1.5 w-1.5 bg-ink/15 transition-all duration-300 hover:bg-ink/30",
  dotActive: "!w-5 bg-navy",
  arrowsWrap: "flex items-center gap-1.5",
  arrowBtn:
    "flex h-8 w-8 items-center justify-center border border-line text-ink transition-colors hover:border-navy/40 hover:text-navy",
  counter: "px-3 text-[11px] font-medium tabular-nums text-muted",

  // Progress bar (between viewport and controls)
  progressTrack: "h-[2px] bg-line",
  progressBar: "h-full bg-champagne",
} as const;
