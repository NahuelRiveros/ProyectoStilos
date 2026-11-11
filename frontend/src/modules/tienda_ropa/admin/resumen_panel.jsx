import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { useAuth } from "../../../core/auth/auth_context.jsx";
import { tienePermiso } from "../../../../../core/permisos_config.js";
import { useResumenPedidos } from "../hooks/use_ropa.js";

/** Tarjeta del inicio del panel: cuántos pedidos esperan respuesta (solo con "Ver pedidos"). */
export default function ResumenPanel() {
  const { usuario } = useAuth();
  if (!tienePermiso(usuario, "pedidos.ver")) return null;
  return <Tarjeta />;
}

function Tarjeta() {
  const consulta = useResumenPedidos();
  const nuevos = consulta.data?.nuevos;
  return (
    <Link to="/admin/ropa/pedidos" className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><ClipboardList size={22} aria-hidden="true" /></span>
      <span>
        <span className="block text-xs font-semibold text-slate-500">Pedidos nuevos</span>
        <span className="text-2xl font-black text-slate-900">{consulta.isPending ? "…" : consulta.isError ? "—" : nuevos}</span>
      </span>
    </Link>
  );
}
