import { z } from "../zod.js";
import { idSchema } from "./comunes.js";

// Pagos online (módulo pagos_online).

export const PROVEEDORES_PAGO = ["mercado_pago"];

export const iniciarPagoSchema = z.object({
  proveedor: z.enum(PROVEEDORES_PAGO, { error: "Proveedor de pago inválido" }).optional().default("mercado_pago"),
});

export const pedidoPagoParams = z.object({ id: idSchema });

export const avisoParams = z.object({ proveedor: z.enum(PROVEEDORES_PAGO) });

// El contenido del aviso lo define el proveedor y NO se usa para decidir nada (se consulta su API):
// se acepta tal cual y lo interpreta su conector.
export const avisoLibre = z.looseObject({});
