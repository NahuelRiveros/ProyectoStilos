import { useState, useRef, useEffect } from "react";
import { LogOut, User, UserCircle, ChevronDown } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../auth/auth_context";

export default function NavbarUserBox({ mobile = false, onLogout }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  if (!usuario) return null;

  async function cerrarSesion() {
    await logout();
    onLogout?.();
    navigate("/login");
  }

  const nombre   = usuario.nombre ?? usuario.usuario_nombre ?? usuario.correo ?? "Usuario";
  const rol      = usuario.rol ?? usuario.rol_nombre ?? usuario.perfil ?? "Usuario";
  const initials = nombre.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

  if (mobile) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/2">
        <div className="flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-sm font-black text-slate-950 shadow-md shadow-amber-500/20">
            {initials || <User size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-100">{nombre}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <p className="truncate text-xs font-medium text-slate-500">{rol}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 p-2">
          <button
            type="button"
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-500/10"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
              <LogOut size={14} />
            </span>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "flex items-center gap-2 rounded-xl px-2 py-1.5 ring-1 transition-all duration-200",
          open
            ? "bg-white/10 ring-white/20"
            : "bg-white/5 ring-white/10 hover:bg-white/10 hover:ring-white/20",
        ].join(" ")}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-amber-400 to-orange-500 text-xs font-black text-slate-950 shadow-sm shadow-amber-500/30">
          {initials || <User size={13} />}
        </div>

        <div className="min-w-0 text-left leading-tight">
          <p className="max-w-28 truncate text-xs font-bold text-slate-200">{nombre}</p>
          <p className="max-w-28 truncate text-[10px] font-medium uppercase tracking-wide text-slate-500">{rol}</p>
        </div>

        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>

        <ChevronDown
          size={13}
          className={["shrink-0 text-slate-500 transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/8 bg-[#0d1525] shadow-2xl shadow-black/60">
          <div className="flex items-center gap-3 border-b border-white/6 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-sm font-black text-slate-950 shadow-md shadow-amber-500/20">
              {initials || <User size={18} />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-100">{nombre}</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <p className="truncate text-xs font-medium text-slate-500">{rol}</p>
              </div>
            </div>
          </div>

          <div className="p-1.5">
            <NavLink
              to="/perfil"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-100",
                  isActive ? "bg-amber-400/10 text-amber-400" : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                ].join(" ")
              }
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-500">
                <UserCircle size={13} />
              </span>
              Mi perfil
            </NavLink>
          </div>

          <div className="border-t border-white/5 p-1.5">
            <button
              type="button"
              onClick={cerrarSesion}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                <LogOut size={13} />
              </span>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
