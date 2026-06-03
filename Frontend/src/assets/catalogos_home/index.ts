// ─── Imágenes individuales ────────────────────────────────────────────────────
// Vite resuelve estos imports en build time y genera URLs hasheadas.

import remera1 from "./remera_1.avif";
import remera2 from "./remera_2.avif";
import remera3 from "./remera_3.avif";
import remera4 from "./remera_4.avif";
import remera5 from "./remera_5.avif";
import remera6 from "./remera_6.avif";
import jean1   from "./jean_1.avif";

// ─── Exports individuales ─────────────────────────────────────────────────────
// Para usar una sola imagen sin traer el catálogo completo.

export { remera1, remera2, remera3, remera4, remera5, remera6, jean1 };

// ─── Catálogo estructurado ────────────────────────────────────────────────────
// Cada array es compatible con ProductCardProps.images[]

export const CATALOG_IMAGES = {
  remeras: [
    { src: remera1, alt: "Remera — vista 1" },
    { src: remera2, alt: "Remera — vista 2" },
    { src: remera3, alt: "Remera — vista 3" },
    { src: remera4, alt: "Remera — vista 4" },
    { src: remera5, alt: "Remera — vista 5" },
    { src: remera6, alt: "Remera — vista 6" },
  ],
  jeans: [
    { src: jean1, alt: "Jean — vista 1" },
  ],
} as const;
