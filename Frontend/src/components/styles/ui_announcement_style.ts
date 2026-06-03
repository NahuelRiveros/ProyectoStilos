export const UI_ANNOUNCEMENT = {
  bar: "relative z-40 overflow-hidden bg-navy",
  tickerWrapper: "overflow-hidden",
  tickerTrack: "flex w-max items-center gap-16 py-2.5",

  item: "flex shrink-0 items-center gap-2.5 whitespace-nowrap text-[11px] font-medium tracking-[0.07em] text-white/70",
  itemAccent: "font-semibold text-champagne",
  itemSep: "h-2.5 w-px shrink-0 bg-champagne/25",
  itemIcon: "shrink-0 text-champagne",

  dismissBtn:
    "absolute right-0 top-0 flex h-full w-10 items-center justify-center bg-gradient-to-l from-navy via-navy/90 to-transparent text-white/30 transition-colors hover:text-champagne",
} as const;
