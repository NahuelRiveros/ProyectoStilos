import { useQuery } from "@tanstack/react-query";
import { http } from "./http";
import { whatsappConfig } from "../config/whatsapp_config";

// Valores por defecto — se usan antes de que llegue la respuesta del servidor
// y como fallback si el servidor no responde.
export const DEFAULT_WHATSAPP_CONFIG = {
  ...whatsappConfig,
  deliveryNote: "Los pedidos se coordinan por WhatsApp · Envío o retiro en tienda",
};

export async function getWhatsappConfig() {
  const { data } = await http.get("/config/whatsapp");
  return { ...DEFAULT_WHATSAPP_CONFIG, ...(data.data ?? {}) };
}

export async function saveWhatsappConfig(config) {
  const { data } = await http.put("/config/whatsapp", config);
  return data.data;
}

// Hook — usa TanStack Query para cachear la config 5 minutos.
// Llamarlo en múltiples componentes no genera múltiples requests.
export function useWhatsappConfig() {
  const { data } = useQuery({
    queryKey:    ["whatsapp-config"],
    queryFn:     getWhatsappConfig,
    staleTime:   5 * 60 * 1000,
    initialData: DEFAULT_WHATSAPP_CONFIG,
  });
  return data ?? DEFAULT_WHATSAPP_CONFIG;
}
