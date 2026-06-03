import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id:      number;
  type:    ToastType;
  message: string;
}

export interface ToastContextValue {
  success: (msg: string) => void;
  error:   (msg: string) => void;
  warning: (msg: string) => void;
  info:    (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let _nextId = 0;

const STYLES: Record<ToastType, { bar: string; iconClass: string; Icon: React.ElementType }> = {
  success: { bar: "bg-emerald-500", iconClass: "text-emerald-500", Icon: CheckCircle   },
  error:   { bar: "bg-rose-500",    iconClass: "text-rose-500",    Icon: XCircle       },
  warning: { bar: "bg-amber-500",   iconClass: "text-amber-500",   Icon: AlertTriangle },
  info:    { bar: "bg-[#2C3750]",   iconClass: "text-[#2C3750]",   Icon: Info          },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((type: ToastType, message: string) => {
    const id = ++_nextId;
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const ctx = useMemo<ToastContextValue>(() => ({
    success: (msg) => add("success", msg),
    error:   (msg) => add("error",   msg),
    warning: (msg) => add("warning", msg),
    info:    (msg) => add("info",    msg),
  }), [add]);

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {toasts.length > 0 && (
        <div className="pointer-events-none fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
          {toasts.map((t) => {
            const { bar, iconClass, Icon } = STYLES[t.type];
            return (
              <div
                key={t.id}
                className="pointer-events-auto flex w-80 items-start gap-3 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-gray-200 animate-in slide-in-from-right-4 fade-in duration-200"
              >
                <div className={`w-1 self-stretch shrink-0 rounded-l-xl ${bar}`} />
                <Icon size={16} className={`mt-3.5 shrink-0 ${iconClass}`} />
                <p className="flex-1 py-3 pr-1 text-sm font-medium text-gray-800 leading-snug">
                  {t.message}
                </p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="mr-2 mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
