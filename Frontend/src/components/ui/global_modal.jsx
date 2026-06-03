import { useEffect, useRef } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ArrowRight,
} from "lucide-react";
import { UI_MODAL } from "../styles/ui_modal_style";

const MODAL_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    iconBoxClass: "border-emerald-100 bg-emerald-50",
    defaultTitle: "Operación exitosa",
  },
  error: {
    icon: XCircle,
    iconClass: "text-rose-600",
    iconBoxClass: "border-rose-100 bg-rose-50",
    defaultTitle: "Ocurrió un error",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-600",
    iconBoxClass: "border-amber-100 bg-amber-50",
    defaultTitle: "Atención",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-600",
    iconBoxClass: "border-blue-100 bg-blue-50",
    defaultTitle: "Información",
  },
};

export default function GlobalModal({
  type = "success",
  brand = "Sistema",
  title,
  message,
  user,
  details,
  confirmLabel = "Continuar",
  showConfirmButton = true,
  autoClose = true,
  delayMs = 5000,
  onFinish,
  onConfirm,
}) {
  const timerRef = useRef(null);

  const config = MODAL_CONFIG[type];
  const Icon = config.icon;

  useEffect(() => {
    if (!autoClose || !onFinish) return;

    timerRef.current = setTimeout(() => {
      onFinish();
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoClose, delayMs, onFinish]);

  function handleConfirm() {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (onConfirm) {
      onConfirm();
      return;
    }

    onFinish?.();
  }

  const userName = user
    ? [user.nombre, user.apellido].filter(Boolean).join(" ")
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={UI_MODAL.overlay} />

      <div className={UI_MODAL.wrap}>
        <div className={UI_MODAL.glow} />
        <div className={UI_MODAL.grid} />

        <div className={UI_MODAL.body}>
          <div className={[UI_MODAL.iconBox, config.iconBoxClass].join(" ")}>
            <Icon className={config.iconClass} size={34} />
          </div>

          <div className="mt-6">
            {brand && <span className={UI_MODAL.brand}>{brand}</span>}

            <h2 className={UI_MODAL.title}>{title ?? config.defaultTitle}</h2>

            {message && <p className={UI_MODAL.text}>{message}</p>}

            {userName && (
              <div className={UI_MODAL.userBox}>
                <p className={UI_MODAL.userLabel}>Usuario</p>
                <p className={UI_MODAL.userName}>{userName}</p>
              </div>
            )}

            {details && (
              <div className={UI_MODAL.userBox}>
                <p className={UI_MODAL.userLabel}>Detalle</p>
                <p className={UI_MODAL.userName}>{details}</p>
              </div>
            )}

            {autoClose && (
              <p className={UI_MODAL.hint}>Cierre automático en unos segundos…</p>
            )}
          </div>

          {showConfirmButton && (
            <div className={UI_MODAL.actions}>
              <button
                type="button"
                onClick={handleConfirm}
                className={UI_MODAL.btnPrimary}
              >
                {confirmLabel}
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
