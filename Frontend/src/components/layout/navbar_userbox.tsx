import { useState, useRef, useEffect } from "react";
import { LogOut, User, UserCircle, ShoppingBag, ChevronDown } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../auth/auth_context";
import type { NavbarTheme } from "./navbar_config";
import { NAVBAR_THEMES } from "./navbar_config";

interface NavbarUserBoxProps {
  mobile?: boolean;
  onLogout?: () => void;
  theme?: NavbarTheme;
}

export default function NavbarUserBox({
  mobile = false,
  onLogout,
  theme = NAVBAR_THEMES.ecommerce,
}: NavbarUserBoxProps) {
  const [open, setOpen]   = useState(false);
  const wrapperRef        = useRef<HTMLDivElement>(null);
  const navigate          = useNavigate();
  const { usuario, logout } = useAuth();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
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
  const initials = nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  // ── MOBILE ────────────────────────────────────────────────────────────────
  if (mobile) {
    return (
      <div className={["overflow-hidden rounded-2xl border", theme.mobileCardDefault].join(" ")}>
        <div className="flex items-center gap-3 p-4">
          <div
            className={[
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white ring-2 ring-white ring-offset-1",
              theme.avatar,
            ].join(" ")}
          >
            {initials || <User size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-ink">{nombre}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <p className="truncate text-xs font-semibold text-muted">{rol}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-current/8 p-2">
          <button
            type="button"
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              <LogOut size={14} />
            </span>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // ── DESKTOP: dropdown ─────────────────────────────────────────────────────
  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "flex items-center gap-2 rounded-2xl px-2 py-1.5 ring-1 transition-all duration-200",
          open ? "shadow-sm ring-current/20" : "ring-current/10 hover:shadow-sm",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm",
            theme.avatar,
          ].join(" ")}
        >
          {initials || <User size={14} />}
        </div>

        <div className="min-w-0 text-left leading-tight">
          <p className="max-w-28 truncate text-xs font-black text-ink">{nombre}</p>
          <p className="max-w-28 truncate text-[10px] font-semibold uppercase tracking-wide text-muted">
            {rol}
          </p>
        </div>

        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>

        <ChevronDown
          size={14}
          className={["shrink-0 text-muted transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={[
            "absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border shadow-2xl",
            theme.panelWrap,
          ].join(" ")}
        >
          {/* Header con info del usuario */}
          <div className={["flex items-center gap-3 p-4", theme.panelHeader].join(" ")}>
            <div
              className={[
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white ring-2 ring-white ring-offset-1",
                theme.avatar,
              ].join(" ")}
            >
              {initials || <User size={20} />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-ink">{nombre}</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <p className="truncate text-xs font-semibold text-muted">{rol}</p>
              </div>
            </div>
          </div>

          {/* Links del menú */}
          <div className="p-1.5">
            <NavLink
              to="/mi-cuenta"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150",
                  isActive ? theme.itemActive : theme.itemDefault,
                ].join(" ")
              }
            >
              <span className={["flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", theme.itemIconDefault].join(" ")}>
                <UserCircle size={14} />
              </span>
              Mi cuenta
            </NavLink>

            <NavLink
              to="/mis-ordenes"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150",
                  isActive ? theme.itemActive : theme.itemDefault,
                ].join(" ")
              }
            >
              <span className={["flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", theme.itemIconDefault].join(" ")}>
                <ShoppingBag size={14} />
              </span>
              Mis órdenes
            </NavLink>
          </div>

          {/* Cerrar sesión */}
          <div className="border-t border-current/8 p-1.5">
            <button
              type="button"
              onClick={cerrarSesion}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <LogOut size={14} />
              </span>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
