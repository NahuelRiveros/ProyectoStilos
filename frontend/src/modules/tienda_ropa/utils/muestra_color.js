// ROP-86: cómo se dibuja la muestra de un color (liso, bitono o estampado), solo con CSS.

export const PATRONES = [
  { valor: "animal_print", texto: "Animal print" },
  { valor: "camuflado", texto: "Camuflado" },
  { valor: "multicolor", texto: "Multicolor" },
];

export function tipoDeColor(color) {
  if (color?.patron) return "estampado";
  return color?.hex2 ? "bitono" : "liso";
}

const mancha = (tono, x, y, tam) => `radial-gradient(circle at ${x}% ${y}%, ${tono} 0 ${tam}%, transparent ${tam + 1}%)`;
const parche = (tono, x, y, ancho, alto) => `radial-gradient(ellipse ${ancho}% ${alto}% at ${x}% ${y}%, ${tono} 0 95%, transparent 100%)`;

/** Valor para `background` (no `background-color`: los bitonos y estampados son degradados). */
export function fondoDeColor(color) {
  const a = color?.hex ?? "#FFFFFF";
  const b = color?.hex2 ?? a;
  switch (color?.patron) {
    case "animal_print":
      return [mancha(b, 25, 30, 14), mancha(b, 70, 22, 10), mancha(b, 58, 64, 13), mancha(b, 20, 78, 9), mancha(b, 86, 74, 8), a].join(", ");
    case "camuflado":
      return [parche("rgba(0, 0, 0, 0.35)", 72, 30, 22, 16), parche(b, 30, 28, 34, 22), parche(b, 70, 70, 30, 22), parche("rgba(0, 0, 0, 0.35)", 22, 76, 20, 14), a].join(", ");
    case "multicolor":
      return "conic-gradient(#E63946, #F4A261, #E9C46A, #2A9D8F, #457B9D, #9B5DE5, #E63946)";
    default:
      return color?.hex2 ? `linear-gradient(135deg, ${a} 50%, ${b} 50%)` : a;
  }
}

const SECCIONES = [["liso", "Básicos"], ["bitono", "Bitonos"], ["estampado", "Estampados"]];

/** Formulario de prenda: los colores en Básicos, Bitonos y Estampados (sin secciones vacías), en su orden. */
export function agruparColores(colores = []) {
  return SECCIONES
    .map(([tipo, titulo]) => ({ tipo, titulo, colores: colores.filter((c) => tipoDeColor(c) === tipo) }))
    .filter((s) => s.colores.length);
}
