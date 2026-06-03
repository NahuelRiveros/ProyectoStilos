import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Package, FileText, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { getTodasOrdenes, type Orden } from "../../api/orden_api";
import {
  AdminSpinner, AdminPageHeader, AdminStatCard, StatusBadge,
} from "../../components/admin";

const fmt = (n: number) =>
  `$ ${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;

interface Stats {
  totalOrdenes: number;
  pendientes:   number;
  facturacion:  number;
  entregadas:   number;
}

export default function AdminDashboardPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTodasOrdenes(1, 10)
      .then(({ ordenes: ords, pagination }) => {
        setOrdenes(ords);
        setStats({
          totalOrdenes: pagination.total,
          pendientes:   ords.filter((o) => o.estado === "pendiente").length,
          facturacion:  ords.filter((o) => o.estado !== "cancelado").reduce((s, o) => s + o.total, 0),
          entregadas:   ords.filter((o) => o.estado === "entregado").length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminSpinner fullPage />;

  return (
    <div className="p-6 lg:p-8">

      <AdminPageHeader title="Dashboard" subtitle="Vista general del negocio" />

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard icon={ShoppingCart} iconBg="bg-navy/10"   iconColor="text-navy"         label="Total órdenes"          value={stats?.totalOrdenes ?? 0} />
        <AdminStatCard icon={Clock}        iconBg="bg-amber-50"  iconColor="text-amber-600"    label="Pendientes"             value={stats?.pendientes ?? 0} />
        <AdminStatCard icon={TrendingUp}   iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Facturación (pág. actual)" value={fmt(stats?.facturacion ?? 0)} />
        <AdminStatCard icon={FileText}     iconBg="bg-blue-50"   iconColor="text-blue-600"     label="Entregadas"             value={stats?.entregadas ?? 0} />
      </div>

      {/* Accesos rápidos */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <QuickLink to="/admin/productos/nuevo" icon={Package}      label="Nuevo producto" />
        <QuickLink to="/admin/ordenes"         icon={ShoppingCart} label="Ver órdenes"   />
        <QuickLink to="/admin/comprobantes"    icon={FileText}     label="Comprobantes"  />
      </div>

      {/* Órdenes recientes */}
      <div className="rounded-2xl bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-bold text-ink">Órdenes recientes</h2>
          <Link to="/admin/ordenes" className="flex items-center gap-1 text-xs text-navy hover:underline">
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>

        {ordenes.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">No hay órdenes registradas</p>
        ) : (
          <div className="divide-y divide-line">
            {ordenes.slice(0, 8).map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p className="text-sm font-bold text-ink">Orden #{o.id}</p>
                  <p className="text-xs text-muted">
                    {new Date(o.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <StatusBadge status={o.estado} label={o.estado_label ?? o.estado} />
                <p className="text-sm font-bold text-ink">{fmt(o.total)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function QuickLink({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-4 transition hover:border-navy/30 hover:shadow-sm">
      <Icon size={18} className="text-navy" />
      <span className="text-sm font-semibold text-ink">{label}</span>
      <ArrowRight size={14} className="ml-auto text-muted" />
    </Link>
  );
}
