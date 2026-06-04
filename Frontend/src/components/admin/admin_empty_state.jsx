import { PackageOpen } from "lucide-react";

export function AdminEmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={40} className="mb-3 text-muted/30" />
      <p className="text-sm text-muted">{title}</p>
      {description && <p className="mt-1 max-w-xs text-xs leading-5 text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
