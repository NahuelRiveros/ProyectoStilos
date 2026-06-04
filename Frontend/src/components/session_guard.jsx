import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/auth_context";
import { useToast } from "../context/toast_context";
function SessionGuard() {
  const { limpiarSesion } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    function handleExpired() {
      limpiarSesion();
      toast.warning("Tu sesi\xF3n expir\xF3. Inici\xE1 sesi\xF3n de nuevo.");
      navigate("/login", { replace: true });
    }
    window.addEventListener("session:expired", handleExpired);
    return () => window.removeEventListener("session:expired", handleExpired);
  }, [limpiarSesion, toast, navigate]);
  return null;
}
export {
  SessionGuard
};
