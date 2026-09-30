import { z } from "../zod.js";
import { idSchema, textoObligatorio } from "./comunes.js";

// Listas del catálogo que se cargan en el panel: marcas, colores y grupos de talles.

const orden = () => z.coerce.number().int().min(0).max(9999).optional().default(0);

export const marcaSchema = z.object({
  nombre: textoObligatorio(80, "El nombre"),
});

export const colorSchema = z.object({
  nombre: textoObligatorio(40, "El nombre"),
  hex: z
    .string({ error: "Elegí el color" })
    .trim()
    .regex(/^#[0-9a-f]{6}$/i, "El color tiene que tener el formato #RRGGBB")
    .transform((v) => v.toUpperCase()),
  orden: orden(),
});

// Los talles van en el orden en que se muestran (S, M, L...): la posición en la lista es su orden.
// Con id = se edita ese talle; sin id = se crea; los que no vienen se dan de baja.
export const grupoTalleSchema = z
  .object({
    nombre: textoObligatorio(40, "El nombre"),
    orden: orden(),
    talles: z
      .array(z.object({ id: idSchema.optional(), nombre: textoObligatorio(20, "El talle") }), { error: "Agregá al menos un talle" })
      .min(1, "Agregá al menos un talle")
      .max(60, "Máximo 60 talles por grupo"),
  })
  .superRefine((grupo, ctx) => {
    const vistos = new Set();
    grupo.talles.forEach((talle, i) => {
      const clave = talle.nombre.toLowerCase();
      if (vistos.has(clave)) ctx.addIssue({ code: "custom", path: ["talles", i, "nombre"], message: `El talle "${talle.nombre}" está repetido` });
      vistos.add(clave);
    });
  });
