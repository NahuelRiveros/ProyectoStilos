import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/auth_context";
import NavbarUserBox from "./navbar_userbox";

export default function NavbarMobile({ config, open, onClose }) {
  const [openGroups, setOpenGroups] = useState({});
  const { usuario } = useAuth();

  function toggleGroup(id) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleNavigate() {
    setOpenGroups({});
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-x-0 top-15 z-50 max-h-[calc(100vh-60px)] overflow-y-auto border-t border-white/6 bg-shell lg:hidden"
        >
          <div className="px-4 pb-6 pt-3">

            {/* Links simples */}
            {(config.links?.length ?? 0) > 0 && (
              <div className="mb-3 space-y-0.5">
                {config.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={handleNavigate}
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                          isActive
                            ? "bg-amber-400/10 text-amber-400"
                            : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                        ].join(" ")
                      }
                    >
                      {Icon && (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-500">
                          <Icon size={14} />
                        </span>
                      )}
                      {link.label}
                    </NavLink>
                  );
                })}
              </div>
            )}

            {/* Dropdowns */}
            {(config.dropdowns?.length ?? 0) > 0 && (
              <div className="space-y-1.5">
                {config.dropdowns.map((dropdown) => {
                  const Icon = dropdown.icon;
                  const isOpen = Boolean(openGroups[dropdown.id]);

                  return (
                    <div
                      key={dropdown.id}
                      className="overflow-hidden rounded-2xl border border-white/6 bg-white/2"
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroup(dropdown.id)}
                        className="flex w-full items-center justify-between px-3 py-3 transition-colors duration-150 hover:bg-white/5"
                      >
                        <span className="flex items-center gap-3">
                          <span className={[
                            "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                            isOpen ? "bg-amber-400/10 text-amber-400" : "bg-white/5 text-slate-500",
                          ].join(" ")}>
                            {Icon && <Icon size={15} />}
                          </span>
                          <span className={[
                            "text-sm font-semibold transition-colors duration-150",
                            isOpen ? "text-amber-400" : "text-slate-300",
                          ].join(" ")}>
                            {dropdown.label}
                          </span>
                        </span>
                        <ChevronDown
                          size={15}
                          className={["shrink-0 transition-all duration-200", isOpen ? "rotate-180 text-amber-400" : "text-slate-600"].join(" ")}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-white/[0.05] px-2 pb-2 pt-1.5">
                              {dropdown.to && (
                                <NavLink
                                  to={dropdown.to}
                                  onClick={handleNavigate}
                                  className={({ isActive }) =>
                                    [
                                      "mb-1 flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-all duration-100",
                                      isActive ? "bg-amber-400/10 text-amber-400" : "text-slate-300 hover:bg-white/5 hover:text-slate-100",
                                    ].join(" ")
                                  }
                                >
                                  Ver todo {dropdown.label}
                                </NavLink>
                              )}
                              {dropdown.items?.map((item) => {
                                const ItemIcon = item.icon;

                                if ("children" in item && item.children?.length) {
                                  return (
                                    <div key={item.label} className="mb-2 last:mb-0">
                                      <NavLink
                                        to={item.to}
                                        onClick={handleNavigate}
                                        className="flex items-center gap-2 rounded-xl px-2 py-1 transition hover:bg-white/5"
                                      >
                                        {ItemIcon && <ItemIcon size={10} className="text-slate-600" />}
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                          {item.label}
                                        </span>
                                      </NavLink>
                                      <div className="space-y-0.5">
                                        {item.children.map((child) => {
                                          const ChildIcon = child.icon;
                                          return (
                                            <NavLink
                                              key={child.to}
                                              to={child.to}
                                              onClick={handleNavigate}
                                              className={({ isActive }) =>
                                                [
                                                  "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-100",
                                                  isActive ? "bg-amber-400/10 text-amber-400" : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                                                ].join(" ")
                                              }
                                            >
                                              {ChildIcon && <ChildIcon size={13} className="shrink-0 opacity-50" />}
                                              <span className="truncate">{child.label}</span>
                                            </NavLink>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }

                                if (!("children" in item)) {
                                  return (
                                    <NavLink
                                      key={item.to}
                                      to={item.to}
                                      onClick={handleNavigate}
                                      className={({ isActive }) =>
                                        [
                                          "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-100",
                                          isActive ? "bg-amber-400/10 text-amber-400" : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                                        ].join(" ")
                                      }
                                    >
                                      {ItemIcon && <ItemIcon size={14} className="shrink-0 opacity-50" />}
                                      <span className="truncate">{item.label}</span>
                                    </NavLink>
                                  );
                                }

                                return null;
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Usuario */}
            <div className="mt-4 border-t border-white/6 pt-4">
              {usuario ? (
                <NavbarUserBox mobile onLogout={handleNavigate} />
              ) : (
                <NavLink
                  to="/login"
                  onClick={handleNavigate}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-amber-300 active:scale-95"
                >
                  <LogIn size={15} />
                  Iniciar sesión
                </NavLink>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
