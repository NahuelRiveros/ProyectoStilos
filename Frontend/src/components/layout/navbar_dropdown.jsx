import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function NavbarDropdown({ dropdown, open = false, onToggle, onClose }) {
  const Icon = dropdown.icon;
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`Abrir menú ${dropdown.label}`}
        className={[
          "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none",
          open
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
        ].join(" ")}
      >
        {Icon && <Icon size={16} className="shrink-0" />}
        <span className="truncate">{dropdown.label}</span>
        <ChevronDown
          size={14}
          className={["shrink-0 transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}
        />
      </button>

      {open && (
        <div
          className={[
            "absolute top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-black/5",
            dropdown.wide ? "right-0 min-w-150" : "left-0 w-72",
          ].join(" ")}
        >
          <div className="flex items-center gap-2.5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-indigo-50/50 px-4 py-2.5">
            {Icon && (
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <Icon size={13} />
              </span>
            )}
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              {dropdown.label}
            </span>
          </div>

          {dropdown.wide ? (
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              {dropdown.items?.map((item) => {
                if (!("children" in item) || !item.children?.length) return null;
                const GroupIcon = item.icon;
                return (
                  <div key={item.label} className="p-3">
                    <div className="mb-2 flex items-center gap-1.5 px-1 py-0.5">
                      {GroupIcon && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-400">
                          <GroupIcon size={11} />
                        </span>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {item.label}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={onClose}
                            className={({ isActive }) =>
                              [
                                "group flex items-start gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all duration-150",
                                isActive
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
                              ].join(" ")
                            }
                          >
                            {ChildIcon && (
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition-colors group-[.bg-indigo-600]:bg-white/20 group-[.bg-indigo-600]:text-white">
                                <ChildIcon size={11} />
                              </span>
                            )}
                            <span className="leading-tight">{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-2">
              {dropdown.items?.map((item) => {
                const ItemIcon = item.icon;

                if ("children" in item && item.children?.length) {
                  return (
                    <div key={item.label} className="mb-1 last:mb-0">
                      <div className="mx-1 mb-0.5 mt-2 flex items-center gap-2 px-2 py-1 first:mt-0">
                        {ItemIcon && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                            <ItemIcon size={11} />
                          </span>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {item.label}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              onClick={onClose}
                              className={({ isActive }) =>
                                [
                                  "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150",
                                  isActive
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
                                ].join(" ")
                              }
                            >
                              {ChildIcon && (
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-[.bg-indigo-600]:bg-white/20 group-[.bg-indigo-600]:text-white">
                                  <ChildIcon size={13} />
                                </span>
                              )}
                              <span className="truncate">{child.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>

                      <div className="mx-3 mt-1.5 border-b border-slate-100 last:hidden" />
                    </div>
                  );
                }

                if (!("children" in item)) {
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        [
                          "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150",
                          isActive
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
                        ].join(" ")
                      }
                    >
                      {ItemIcon && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <ItemIcon size={13} />
                        </span>
                      )}
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
