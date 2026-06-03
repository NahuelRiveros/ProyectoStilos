interface AdminStatCardProps {
  icon:        React.ElementType;
  iconBg:      string;
  iconColor:   string;
  label:       string;
  value:       string | number;
  valueClass?: string;
  sub?:        string;
}

export function AdminStatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  valueClass = "text-xl font-black text-ink",
  sub,
}: AdminStatCardProps) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm">
      <div className={["mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl", iconBg].join(" ")}>
        <Icon size={20} className={iconColor} />
      </div>
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className={["mt-1", valueClass].join(" ")}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted">{sub}</p>}
    </div>
  );
}
